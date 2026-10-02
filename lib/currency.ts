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
