"use client";

import { useCurrency } from "@/components/currency-provider";

export function Price({
  usd,
  suffix,
  className,
}: {
  usd: number;
  suffix?: string;
  className?: string;
}) {
  const { formatPrice, isEstimated } = useCurrency();
  return <span className={className} title={isEstimated ? "Planning estimate using fallback exchange rates; final price is set by the provider" : "Planning estimate; final price is set by the provider"}>{formatPrice(usd)}{suffix ? ` ${suffix}` : ""}</span>;
}
