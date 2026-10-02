import { checkHotelRate, getHotelbedsConfig, isHotelbedsMutualTlsConfigured } from "@/lib/hotelbeds";
import { extractHotelbedsRates } from "@/lib/hotelbeds-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rateKeys = Array.isArray(body.rateKeys)
      ? body.rateKeys.filter((value): value is string => typeof value === "string" && value.trim().length > 0).slice(0, 10)
      : [];
    const internalReference = typeof body.internalReference === "string" ? body.internalReference.slice(0, 80) : "";
    if (rateKeys.length === 0) return Response.json({ ok: false, message: "Select a Hotelbeds rate before checking it." }, { status: 400 });
    if (!isHotelbedsMutualTlsConfigured()) {
      return Response.json({ ok: false, message: "Hotelbeds CheckRate requires the supplier mTLS certificate and key. The live confirmation step is safely disabled until they are provided." }, { status: 503 });
    }

    const config = getHotelbedsConfig("hotel");
    const { response, data } = await checkHotelRate(rateKeys);
    const rate = extractHotelbedsRates(data)[0];
    if (response.ok && rate && internalReference) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from("booking_requests").update({
          price_amount: rate.amount,
          price_currency: rate.currency,
          hotelbeds_rate_key: rate.rateKey,
          cancellation_policy: rate.cancellationPolicies,
          updated_at: new Date().toISOString(),
        }).eq("reference", internalReference);
      }
    }
    return Response.json({ ok: response.ok && Boolean(rate), provider: "hotelbeds", environment: config.environment, providerStatus: response.status, rate, data, message: response.ok && rate ? "Hotelbeds rate checked." : "Hotelbeds could not recheck this rate." }, { status: response.ok && rate ? 200 : 502 });
  } catch (error) {
    return Response.json({ ok: false, message: error instanceof Error ? error.message : "Hotelbeds CheckRate failed." }, { status: 502 });
  }
}
