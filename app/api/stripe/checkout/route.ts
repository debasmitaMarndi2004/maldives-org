import { getStripeClient } from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return Response.json({ ok: false, message: "Stripe checkout is not configured yet." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const reference = typeof body.reference === "string" ? body.reference.slice(0, 80) : "";
    if (!reference) {
      return Response.json({ ok: false, message: "A valid booking reference is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json({ ok: false, message: "Supabase must be connected before payments can be enabled." }, { status: 503 });
    }

    const result = await supabase
      .from("booking_requests")
      .select("offer_title, price_amount, price_currency, price_from_usd, currency, status")
      .eq("reference", reference)
      .maybeSingle();
    if (result.error || !result.data) {
      return Response.json({ ok: false, message: "Booking reference not found." }, { status: 404 });
    }
    if (result.data.status !== "confirmed") {
      return Response.json({ ok: false, message: "Payment is available after the supplier confirms this booking." }, { status: 409 });
    }

    const confirmedAmount = typeof result.data.price_amount === "number" ? result.data.price_amount : result.data.price_from_usd;
    const amount = typeof confirmedAmount === "number" ? Math.round(confirmedAmount * 100) : 0;
    const title = result.data.offer_title.slice(0, 160);
    const currency = (result.data.price_currency || result.data.currency || process.env.STRIPE_CURRENCY || "usd").toLowerCase();
    if (amount < 50 || !/^[a-z]{3}$/.test(currency)) {
      return Response.json({ ok: false, message: "The confirmed booking amount is not ready for payment." }, { status: 409 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency, product_data: { name: title }, unit_amount: amount }, quantity: 1 }],
      success_url: `${baseUrl}/booking/${encodeURIComponent(reference)}?payment=success`,
      cancel_url: `${baseUrl}/checkout?booking=${encodeURIComponent(reference)}&payment=cancelled`,
      metadata: { bookingReference: reference },
    });
    return Response.json({ ok: true, url: session.url }, { status: 201 });
  } catch {
    return Response.json({ ok: false, message: "Stripe could not create checkout." }, { status: 502 });
  }
}
