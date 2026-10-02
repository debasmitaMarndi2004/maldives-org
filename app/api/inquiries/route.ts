import { escapeHtml, sendTransactionalEmail } from "@/lib/notifications";
import { createBookingReference } from "@/lib/references";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allowRequest, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!allowRequest(`inquiry:${requestKey(request)}`)) {
    return Response.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, message: "Please complete all contact fields." }, { status: 400 });
    }

    const reference = createBookingReference("INQ");
    const supabase = getSupabaseAdmin();
    let persisted = false;
    if (supabase) {
      const { error } = await supabase.from("inquiries").insert({
        reference,
        name,
        email,
        subject: typeof body.subject === "string" ? body.subject.slice(0, 160) : "Website enquiry",
        message,
        status: "new",
      });
      if (error) return Response.json({ ok: false, message: "We could not save your enquiry." }, { status: 502 });
      persisted = true;
    }

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      await sendTransactionalEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New Maldives.org enquiry ${reference}`,
        html: `<p><strong>${escapeHtml(name)}</strong> · ${escapeHtml(email)}</p><p>${escapeHtml(message)}</p>`,
      });
    }

    return Response.json({ ok: true, reference, mode: persisted ? "stored" : "preview" }, { status: persisted ? 201 : 202 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
