"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AffiliateCatalog } from "@/lib/affiliate-providers";

type AffiliateContextValue = {
  catalog: AffiliateCatalog | null;
  loading: boolean;
  failed: boolean;
  retry: () => void;
};

const AffiliateContext = createContext<AffiliateContextValue | null>(null);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<AffiliateCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    fetch("/api/affiliates", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Partner links unavailable.");
        const payload = await response.json() as AffiliateCatalog;
        if (!Array.isArray(payload.offers) || !Array.isArray(payload.providers)) throw new Error("Invalid partner catalog.");
        if (active && !controller.signal.aborted) {
          setCatalog(payload);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  return <AffiliateContext.Provider value={{ catalog, loading, failed, retry }}>{children}</AffiliateContext.Provider>;
}

export function useAffiliateCatalog() {
  const context = useContext(AffiliateContext);
  if (!context) throw new Error("AffiliateProvider is required.");
  return context;
}
