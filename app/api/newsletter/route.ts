import { sendTransactionalEmail } from "@/lib/notifications";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allowRequest, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!allowRequest(`newsletter:${requestKey(request)}`)) {
    return Response.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let persisted = false;
    if (supabase) {
      const { error } = await supabase.from("newsletter_subscribers").upsert(
        { email, consent_at: new Date().toISOString(), unsubscribed_at: null },
        { onConflict: "email" },
      );
      if (error) return Response.json({ ok: false, message: "We could not save your subscription." }, { status: 502 });
      persisted = true;
    }

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      await sendTransactionalEmail({
        to: email,
        subject: "Welcome to Maldives.org island notes",
        html: "<p>Thanks for joining Maldives.org island notes.</p>",
      });
    }

    return Response.json({ ok: true, mode: persisted ? "stored" : "preview" }, { status: persisted ? 201 : 202 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
