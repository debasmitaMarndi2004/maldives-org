import { getStripeClient } from "@/lib/stripe-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !webhookSecret || !signature) {
    return Response.json({ ok: false, message: "Stripe webhook is not configured." }, { status: 503 });
  }

  try {
    const event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const reference = session.metadata?.bookingReference;
      const supabase = getSupabaseAdmin();
      if (reference && supabase) {
        await supabase.from("booking_requests").update({ status: "payment_received", stripe_session_id: session.id }).eq("reference", reference);
      }
    }
    return Response.json({ received: true });
  } catch {
    return Response.json({ ok: false, message: "Invalid Stripe webhook signature." }, { status: 400 });
  }
}
