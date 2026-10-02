"use client";

import { useState } from "react";

export function CheckoutPanel({ reference, title, amount, currency, enabled }: { reference: string; title: string; amount: number; currency: string; enabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) });
      const payload = (await response.json()) as { ok?: boolean; url?: string; message?: string };
      if (!response.ok || !payload.ok || !payload.url) throw new Error(payload.message || "Stripe checkout is unavailable.");
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Stripe checkout is unavailable.");
      setLoading(false);
    }
  }

  return <div className="detail-card"><span className="eyebrow">SECURE CHECKOUT</span><h2>{title}</h2><p>Stripe is prepared for a later key handoff. The final supplier-confirmed amount must be checked before payment.</p><div className="summary-total"><span>Planning amount</span><strong>{amount > 0 ? `${currency.toUpperCase()} ${amount.toFixed(2)}` : "To be confirmed"}</strong></div>{error && <div className="note-box" role="alert">{error}</div>}<button className="button button-teal full-button" type="button" disabled={!enabled || loading || amount <= 0} onClick={startCheckout}>{loading ? "Opening secure checkout…" : enabled ? "Continue to Stripe" : "Stripe setup required"}</button></div>;
}
