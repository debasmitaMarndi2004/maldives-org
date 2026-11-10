"use client";

import { FormEvent, useState } from "react";

export function ContactFormLive() {
  const [result, setResult] = useState<"stored" | "preview" | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), message: form.get("message") }) });
      const payload = (await response.json()) as { ok?: boolean; mode?: "stored" | "preview"; message?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || "We could not send your enquiry.");
      setResult(payload.mode === "stored" ? "stored" : "preview");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your enquiry.");
    } finally {
      setSending(false);
    }
  }

  if (result) return <div className="success-note" role="status">{result === "stored" ? "Your enquiry is saved. Email delivery is not confirmed on this page. This is not a booking confirmation." : "Preview only — your enquiry was not stored or sent. No booking or follow-up request was created."}</div>;
  return <form onSubmit={handleSubmit}><label className="field-label" htmlFor="contact-name">Your name</label><input id="contact-name" name="name" className="input" placeholder="First and last name" required /><label className="field-label" htmlFor="contact-email">Email</label><input id="contact-email" name="email" className="input" placeholder="you@example.com" type="email" required /><label className="field-label" htmlFor="contact-message">How can we help?</label><textarea id="contact-message" name="message" className="input" rows={5} placeholder="Tell us a little about your trip" required />{error && <div className="note-box" role="alert">{error}</div>}<button className="button button-teal" type="submit" disabled={sending} style={{ marginTop: 15 }}>{sending ? "Sending…" : "Send enquiry"} <span>↗</span></button></form>;
}
