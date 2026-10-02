"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return <div className="success-note" role="status">Thanks — your enquiry is in the queue. We’ll get back to you with the next useful step.</div>;
  }

  return <form onSubmit={handleSubmit}>
    <label className="field-label" htmlFor="contact-name">Your name</label>
    <input id="contact-name" className="input" placeholder="First and last name" required />
    <label className="field-label" htmlFor="contact-email">Email</label>
    <input id="contact-email" className="input" placeholder="you@example.com" type="email" required />
    <label className="field-label" htmlFor="contact-message">How can we help?</label>
    <textarea id="contact-message" className="input" rows={5} placeholder="Tell us a little about your trip" required />
    <button className="button button-teal" type="submit" style={{ marginTop: 15 }}>Send enquiry <span>↗</span></button>
  </form>;
}
