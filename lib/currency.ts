export const supportedCurrencies = ["USD", "EUR", "GBP", "INR", "AED", "MVR"] as const;

export type Currency = (typeof supportedCurrencies)[number];

// Fixed display estimates for trip planning while a rate feed is disconnected.
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
  source: "fallback";
  updatedAt: string | null;
  estimatedCurrencies: Currency[];
};

export function fallbackRateSnapshot(): ExchangeRateSnapshot {
  return { base: "USD", rates: { ...fallbackRates }, source: "fallback", updatedAt: null, estimatedCurrencies: [...supportedCurrencies] };
}
