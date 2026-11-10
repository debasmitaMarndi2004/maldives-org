"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fallbackRates, isCurrency, supportedCurrencies, type Currency } from "@/lib/currency";

const STORAGE_KEY = "maldives.org.currency";

type CurrencyContextValue = {
  currency: Currency;
  rates: Record<Currency, number>;
  isLoading: boolean;
  isEstimated: boolean;
  setCurrency: (currency: Currency) => void;
  convertFromUsd: (amount: number) => number;
  formatPrice: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimated, setIsEstimated] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch { /* Currency selection still works when storage is unavailable. */ }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    let cancelled = false;
    if (isCurrency(stored)) {
      window.setTimeout(() => {
        if (!cancelled) setCurrencyState(stored);
      }, 0);
    }

    fetch("/api/currency/rates", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Currency rates unavailable");
        return response.json() as Promise<{ rates?: Record<Currency, number>; source?: string }>;
      })
      .then((payload) => {
        if (cancelled || !payload.rates) return;
        const next = { ...fallbackRates };
        for (const code of supportedCurrencies) {
          const candidate = payload.rates[code];
          if (Number.isFinite(candidate) && candidate > 0) next[code] = candidate;
        }
        setRates(next);
        setIsEstimated(payload.source !== "open.er-api.com" || supportedCurrencies.some((code) => !Number.isFinite(payload.rates?.[code]) || Number(payload.rates?.[code]) <= 0));
      })
      .catch(() => undefined)
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    try { window.localStorage.setItem(STORAGE_KEY, nextCurrency); } catch { /* Preference remains available for this page session. */ }
  }, []);

  const convertFromUsd = useCallback(
    (amount: number) => amount * (rates[currency] ?? 1),
    [currency, rates],
  );

  const formatPrice = useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(convertFromUsd(amount)),
    [convertFromUsd, currency],
  );

  const value = useMemo(
    () => ({ currency, rates, isLoading, isEstimated, setCurrency, convertFromUsd, formatPrice }),
    [convertFromUsd, currency, formatPrice, isLoading, isEstimated, rates, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
