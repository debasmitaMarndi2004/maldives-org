export function SupplierPrice({ amount, currency }: { amount: number; currency: string }) {
  const safeCurrency = /^[A-Z]{3}$/.test(currency.toUpperCase()) ? currency.toUpperCase() : "USD";
  return <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: safeCurrency, maximumFractionDigits: 2 }).format(amount)}</span>;
}
