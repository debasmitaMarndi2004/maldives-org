import { createBookingReference } from "@/lib/references";
import { allowRequest, requestKey } from "@/lib/rate-limit";
import { isCalendarDate, isValidDateRange } from "@/lib/calendar-date";

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    const currency = text(body.currency, 8).toUpperCase() || "USD";

    if (
      !travelerName ||
      !validEmail(travelerEmail) ||
      !["stay", "experience", "transfer"].includes(offerType) ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 50 ||
      (checkIn && !isCalendarDate(checkIn)) ||
      (checkOut && !isCalendarDate(checkOut)) ||
      (activityDate && !isCalendarDate(activityDate)) ||
      (checkIn && checkOut && !isValidDateRange(checkIn, checkOut)) ||
      !/^[A-Z]{3}$/.test(currency)
    ) {
      return Response.json(
        { ok: false, message: "Please check the traveller, date, guest and currency details." },
        { status: 400 },
      );
    }

    return Response.json({
      ok: true,
      reference: createBookingReference(),
      mode: "preview",
      message: "Preview only. This request was not stored or sent.",
    }, { status: 202 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}
