/**
 * Affiliate MVP policy: direct supplier transactions and payments are disabled.
 * This is intentionally not controlled by environment variables or request data.
 * Re-enabling transactions requires a separately reviewed implementation change.
 */
export function directTransactionsDisabled(): boolean {
  return true;
}

export function disabledTransactionResponse(kind: "payment" | "booking" | "checkrate") {
  const message = kind === "payment"
    ? "Payments are disabled in the affiliate MVP. Booking and payment take place only on an approved partner website."
    : "Direct Hotelbeds booking and rate confirmation are disabled in the affiliate MVP. No supplier transaction was created.";
  return Response.json(
    { ok: false, code: "AFFILIATE_MVP_TRANSACTIONS_DISABLED", message },
    { status: kind === "booking" ? 409 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
