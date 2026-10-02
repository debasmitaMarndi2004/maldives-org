import { escapeHtml, sendTransactionalEmail } from "@/lib/notifications";
import { createBookingReference } from "@/lib/references";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { allowRequest, requestKey } from "@/lib/rate-limit";

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  if (!allowRequest(`booking:${requestKey(request)}`)) {
    return Response.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const travelerName = text(body.travelerName, 120);
    const travelerEmail = text(body.travelerEmail, 160).toLowerCase();
    const offerType = text(body.offerType, 40) || "stay";
    const guests = typeof body.guests === "number" ? body.guests : 1;
    const checkIn = text(body.checkIn, 20) || null;
    const checkOut = text(body.checkOut, 20) || null;
    const activityDate = text(body.activityDate, 20) || null;
    const priceFrom = typeof body.priceFrom === "number" && Number.isFinite(body.priceFrom) && body.priceFrom >= 0 ? body.priceFrom : null;
    const currency = text(body.currency, 8).toUpperCase() || "USD";

    if (
      !travelerName ||
      !validEmail(travelerEmail) ||
      !["stay", "experience", "transfer"].includes(offerType) ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 50 ||
      (checkIn && !validIsoDate(checkIn)) ||
      (checkOut && !validIsoDate(checkOut)) ||
      (activityDate && !validIsoDate(activityDate)) ||
      (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) ||
      !/^[A-Z]{3}$/.test(currency)
    ) {
      return Response.json(
        { ok: false, message: "Please check the traveller, date, guest and currency details." },
        { status: 400 },
      );
    }

    const reference = createBookingReference();

    const booking = {
      reference,
      offer_id: text(body.offerId, 160) || null,
      offer_title: text(body.offerTitle, 180) || "Maldives trip request",
      offer_type: offerType,
      source: text(body.source, 40) || "sample",
      supplier_code: text(body.supplierCode, 100) || null,
      traveler_name: travelerName,
      traveler_email: travelerEmail,
      traveler_country: text(body.travelerCountry, 80) || null,
      guests,
      check_in: checkIn,
      check_out: checkOut,
      activity_date: activityDate,
      notes: text(body.notes, 1500) || null,
      price_from_usd: priceFrom,
      currency,
      price_amount: priceFrom,
      price_currency: currency,
      status: "new",
    };

    const supabase = getSupabaseAdmin();
    let persisted = false;
    if (supabase) {
      const { error } = await supabase.from("booking_requests").insert(booking);
      if (error) {
        console.error("booking_request_insert_failed", error.message);
        return Response.json(
          { ok: false, message: "We could not save this request. Please try again." },
          { status: 502 },
        );
      }
      persisted = true;
    }

    const notificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (notificationEmail) {
      await sendTransactionalEmail({
        to: notificationEmail,
        subject: `New Maldives.org request ${reference}`,
        html: `<p><strong>${escapeHtml(booking.offer_title)}</strong></p><p>${escapeHtml(travelerName)} · ${escapeHtml(travelerEmail)}</p><p>Reference: ${reference}</p>`,
      });
    }

    return Response.json({
      ok: true,
      reference,
      mode: persisted ? "stored" : "preview",
      message: persisted
        ? "Your request has been sent to the Maldives.org team."
        : "Preview request created. Connect Supabase to store live requests.",
    }, { status: persisted ? 201 : 202 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
