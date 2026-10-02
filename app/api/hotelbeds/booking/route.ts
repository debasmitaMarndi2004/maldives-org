import { confirmHotelBooking, getHotelbedsConfig, isHotelbedsMutualTlsConfigured } from "@/lib/hotelbeds";
import { normalizeHotelbedsBooking } from "@/lib/hotelbeds-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function text(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const confirm = body.confirm === true;
    const internalReference = text(body.internalReference, 80);
    const rateKey = text(body.rateKey, 1000);
    const holder = body.holder && typeof body.holder === "object" ? body.holder as Record<string, unknown> : {};
    const holderName = text(holder.name, 80);
    const holderSurname = text(holder.surname, 80);
    const paxes = Array.isArray(body.paxes)
      ? body.paxes.flatMap((value) => {
        const pax = value && typeof value === "object" ? value as Record<string, unknown> : {};
        const name = text(pax.name, 80);
        const surname = text(pax.surname, 80);
        return name && surname ? [{ roomId: 1, type: "AD" as const, name, surname }] : [];
      }).slice(0, 50)
      : [];

    if (!confirm || !internalReference || !rateKey || !holderName || !holderSurname || paxes.length === 0) {
      return Response.json({ ok: false, message: "Complete the traveller details before confirmation." }, { status: 400 });
    }

    const mode = process.env.HOTELBEDS_BOOKING_MODE?.toLowerCase() || "disabled";
    if (!["disabled", "test", "live"].includes(mode)) {
      return Response.json({ ok: false, message: "Invalid Hotelbeds booking mode. Use disabled, test, or live." }, { status: 409 });
    }
    if (mode === "disabled") {
      return Response.json({ ok: false, message: "Hotelbeds booking confirmation is disabled until certification testing is approved. No supplier booking was created." }, { status: 409 });
    }
    const config = getHotelbedsConfig("hotel");
    if ((mode === "test" && config.environment !== "test") || (mode === "live" && config.environment !== "production")) {
      return Response.json({ ok: false, message: `Hotelbeds booking mode ${mode} does not match the current ${config.environment} environment.` }, { status: 409 });
    }
    if (!isHotelbedsMutualTlsConfigured()) {
      return Response.json({ ok: false, message: "Hotelbeds booking requires the supplier mTLS certificate and key. No supplier booking was created." }, { status: 503 });
    }

    const { response, data } = await confirmHotelBooking({
      holder: { name: holderName, surname: holderSurname },
      rooms: [{ rateKey, paxes }],
      clientReference: internalReference,
      remark: text(body.remark, 2000),
      tolerance: 2,
    });
    const booking = normalizeHotelbedsBooking(data);
    if (!response.ok || !booking.supplierReference) {
      return Response.json({ ok: false, provider: "hotelbeds", providerStatus: response.status, message: "Hotelbeds did not confirm this booking. No confirmed supplier reference was returned." }, { status: 502 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("booking_requests").update({
        status: booking.status === "CONFIRMED" ? "confirmed" : "pending",
        supplier_reference: booking.supplierReference,
        supplier_status: booking.status,
        voucher_url: booking.voucherUrl || null,
        price_amount: booking.totalAmount,
        price_currency: booking.currency,
        hotelbeds_rate_key: rateKey,
        cancellation_policy: booking.cancellationPolicies,
        price_breakdown: { totalAmount: booking.totalAmount, currency: booking.currency },
        confirmed_at: booking.status === "CONFIRMED" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("reference", internalReference);
    }

    return Response.json({ ok: true, provider: "hotelbeds", booking, data }, { status: 201 });
  } catch (error) {
    return Response.json({ ok: false, message: error instanceof Error ? error.message : "Hotelbeds booking confirmation failed." }, { status: 502 });
  }
}
