import { fallbackRates, supportedCurrencies, type Currency } from "@/lib/currency";

export const revalidate = 3600;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate },
      signal: controller.signal,
    });
    const payload = (await response.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };

    if (!response.ok || payload.result !== "success" || !payload.rates) {
      throw new Error("Exchange-rate service returned an invalid response.");
    }

    const rates = supportedCurrencies.reduce<Record<Currency, number>>((result, currency) => {
      const rate = Number(payload.rates?.[currency]);
      result[currency] = Number.isFinite(rate) && rate > 0 ? rate : fallbackRates[currency];
      return result;
    }, { ...fallbackRates });

    return Response.json({
      base: "USD",
      rates,
      source: "open.er-api.com",
      updatedAt: payload.time_last_update_utc ?? new Date().toISOString(),
    });
  } catch {
    return Response.json({
      base: "USD",
      rates: fallbackRates,
      source: "fallback",
      updatedAt: null,
    });
  } finally {
    clearTimeout(timeout);
  }
}
