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
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(usd)}{suffix ? ` ${suffix}` : ""}</span>;
}
