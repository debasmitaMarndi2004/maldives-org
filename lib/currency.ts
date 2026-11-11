export const supportedCurrencies = ["USD", "EUR", "GBP", "INR", "AED", "MVR"] as const;

export type Currency = (typeof supportedCurrencies)[number];

// Used immediately for a responsive first render and as a safe fallback when the
// public rates service is unavailable. The provider refreshes these values client-side.
export const fallbackRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.1,
  AED: 3.67,
  MVR: 15.42,
};

export function isCurrency(value: string | null | undefined): value is Currency {
  return Boolean(value && supportedCurrencies.includes(value as Currency));
}

export type ExchangeRateSnapshot = {
  base: "USD";
  rates: Record<Currency, number>;
  source: "open.er-api.com" | "mixed" | "fallback";
  updatedAt: string | null;
  estimatedCurrencies: Currency[];
};

export function fallbackRateSnapshot(): ExchangeRateSnapshot {
  return { base: "USD", rates: { ...fallbackRates }, source: "fallback", updatedAt: null, estimatedCurrencies: [...supportedCurrencies] };
}

/** Preserve useful provider rates without labelling substituted values as live. */
export function exchangeRateSnapshot(value: unknown): ExchangeRateSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallbackRateSnapshot();
  const payload = value as Record<string, unknown>;
  if (payload.result !== "success" || (payload.base_code !== undefined && payload.base_code !== "USD") || !payload.rates || typeof payload.rates !== "object" || Array.isArray(payload.rates)) return fallbackRateSnapshot();
  const sourceRates = payload.rates as Record<string, unknown>;
  // An inconsistent base invalidates the whole response, not just its USD entry.
  if (sourceRates.USD !== 1) return fallbackRateSnapshot();
  const rates = { ...fallbackRates }, estimatedCurrencies: Currency[] = [];
  for (const code of supportedCurrencies) {
    const rate = sourceRates[code];
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) rates[code] = rate;
    else estimatedCurrencies.push(code);
  }
  const time = payload.time_last_update_utc;
  return {
    base: "USD", rates, estimatedCurrencies,
    source: estimatedCurrencies.length ? "mixed" : "open.er-api.com",
    updatedAt: typeof time === "string" && Number.isFinite(Date.parse(time)) ? time : null,
  };
}
