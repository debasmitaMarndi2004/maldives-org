"use client";

import { FormEvent, useState } from "react";

export function NewsletterFormLive() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || "Subscription failed.");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Subscription failed.");
    }
  }

  if (status === "success") return <div className="success-note" role="status">You’re on the list — see you in paradise.</div>;
  return <><form className="newsletter-form" onSubmit={submit}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Your email address" aria-label="Email address" required /><button type="submit" disabled={status === "sending"}>{status === "sending" ? "Joining…" : "Sign me up"}</button></form>{message && <div className="form-note" role="alert">{message}</div>}</>;
}
