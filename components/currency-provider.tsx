"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fallbackRates, isCurrency, type Currency } from "@/lib/currency";

const STORAGE_KEY = "maldives.org.currency";

type CurrencyContextValue = {
  currency: Currency;
  rates: Record<Currency, number>;
  isLoading: boolean;
  setCurrency: (currency: Currency) => void;
  convertFromUsd: (amount: number) => number;
  formatPrice: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isCurrency(stored)) setCurrencyState(stored);

    let cancelled = false;
    fetch("/api/currency/rates", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Currency rates unavailable");
        return response.json() as Promise<{ rates?: Record<Currency, number> }>;
      })
      .then((payload) => {
        if (!cancelled && payload.rates) setRates({ ...fallbackRates, ...payload.rates });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem(STORAGE_KEY, nextCurrency);
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
        maximumFractionDigits: currency === "INR" ? 0 : 0,
      }).format(convertFromUsd(amount)),
    [convertFromUsd, currency],
  );

  const value = useMemo(
    () => ({ currency, rates, isLoading, setCurrency, convertFromUsd, formatPrice }),
    [convertFromUsd, currency, formatPrice, isLoading, rates, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
