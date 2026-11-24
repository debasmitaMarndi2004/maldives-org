"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fallbackRates, isCurrency, type Currency } from "@/lib/currency";

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

  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch { /* Currency selection still works when storage is unavailable. */ }
    if (!isCurrency(stored)) return;
    const restorePreference = window.setTimeout(() => setCurrencyState(stored), 0);
    return () => window.clearTimeout(restorePreference);
  }, []);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    try { window.localStorage.setItem(STORAGE_KEY, nextCurrency); } catch { /* Preference remains available for this page session. */ }
  }, []);

  const convertFromUsd = useCallback(
    (amount: number) => amount * fallbackRates[currency],
    [currency],
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
    () => ({ currency, rates: fallbackRates, isLoading: false, isEstimated: true, setCurrency, convertFromUsd, formatPrice }),
    [convertFromUsd, currency, formatPrice, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
