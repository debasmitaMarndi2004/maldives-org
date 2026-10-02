"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { AvailabilityNotice, SourceBadge } from "@/components/travel-readiness";
import type { TravelOffer } from "@/lib/api-contracts";
import { Price } from "@/components/price";
import { useCurrency } from "@/components/currency-provider";

export function BookingFlowLive({ offer }: { offer: TravelOffer }) {
  const { currency } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [mode, setMode] = useState<"stored" | "preview">("preview");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerCountry, setTravelerCountry] = useState("India");
  const [guests, setGuests] = useState("2");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id, offerTitle: offer.title, offerType: offer.type,
          source: offer.source, supplierCode: offer.supplierCode,
          travelerName, travelerEmail, travelerCountry, guests: Number(guests),
          checkIn, checkOut, activityDate, notes, priceFrom: offer.priceFrom,
          currency: offer.currency,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; reference?: string; mode?: "stored" | "preview"; message?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || "We could not send your request.");
      setReference(payload.reference || "");
      setMode(payload.mode || "preview");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <main className="page-main booking-main"><div className="page-wrap booking-confirmation" data-reveal><div className="success-icon"><CheckIcon size={24} /></div><span className="eyebrow">REQUEST RECEIVED</span><h1>Your island plan is taking shape.</h1><p>Thanks, <strong>{travelerName || "traveller"}</strong>. {mode === "stored" ? "Your request is saved and the Maldives.org team can follow up." : "This is a preview request because Supabase is not connected yet."}</p><div className="confirmation-reference"><span>{mode === "stored" ? "Reference" : "Preview reference"}</span><strong>{reference || "MD-PREVIEW"}</strong></div><div className="booking-actions"><Link className="button button-teal" href={`/booking/${encodeURIComponent(reference || "MD-PREVIEW")}`}>See booking status <ArrowRight size={14} /></Link><Link className="button button-ghost button-dark" href="/stay">Keep exploring</Link></div></div></main>;

  const isStay = offer.type === "stay";
  return <main className="page-main booking-main"><div className="page-wrap"><div className="booking-intro"><span className="eyebrow">BOOKING-READY FLOW</span><h1>Review the details before you go.</h1><p>This request is stored securely when Supabase is connected. Final availability, cancellation rules and payment are handled only after supplier confirmation.</p></div><div className="booking-layout"><form className="detail-card booking-form" onSubmit={handleSubmit}><div className="booking-step-title"><span>01</span><div><span className="eyebrow">TRAVELLER DETAILS</span><h2>Who is travelling?</h2></div></div><div className="form-grid"><label className="field-label">Full name<input className="input" value={travelerName} onChange={(event) => setTravelerName(event.target.value)} placeholder="Your name" required /></label><label className="field-label">Email address<input className="input" type="email" value={travelerEmail} onChange={(event) => setTravelerEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="field-label">Country of residence<select className="input" value={travelerCountry} onChange={(event) => setTravelerCountry(event.target.value)}><option>India</option><option>United Kingdom</option><option>United States</option><option>United Arab Emirates</option><option>Other</option></select></label><label className="field-label">Travellers<select className="input" value={guests} onChange={(event) => setGuests(event.target.value)}><option value="1">1 traveller</option><option value="2">2 travellers</option><option value="3">3 travellers</option><option value="4">4 travellers</option></select></label></div><div className="booking-step-title booking-step-spaced"><span>02</span><div><span className="eyebrow">TRIP DETAILS</span><h2>{isStay ? "When would you like to stay?" : "When would you like to go?"}</h2></div></div><div className="form-grid">{isStay ? <><label className="field-label">Check in<input className="input" type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></label><label className="field-label">Check out<input className="input" type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required /></label></> : <label className="field-label">Preferred date<input className="input" type="date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} required /></label>}<label className="field-label">Special requests<span className="field-hint">Optional</span><textarea className="input textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Transfers, dietary notes or anything else we should know." rows={3} /></label></div><label className="consent-check"><input type="checkbox" required /><span>I understand this is a request flow. No payment is taken and final availability, price and cancellation terms will be confirmed before booking.</span></label>{error && <div className="note-box" role="alert">{error}</div>}<button className="button button-teal full-button" type="submit" disabled={submitting}>{submitting ? "Sending request…" : "Continue with this request"} <ArrowRight size={14} /></button></form><aside className="detail-card booking-summary"><span className="eyebrow">YOUR SELECTION</span><div className="booking-summary-image" style={{ backgroundImage: `url(${offer.image})` }} /><div className="booking-summary-title"><div><h2>{offer.title}</h2><p>{offer.location}</p></div><SourceBadge source={offer.source} /></div><AvailabilityNotice source={offer.source} /><div className="summary-line"><span>From</span><strong><Price usd={offer.priceFrom} /> <small>{currency} · {offer.priceUnit}</small></strong></div><div className="summary-line"><span>Cancellation</span><strong className="summary-muted">To be confirmed</strong></div><div className="summary-line"><span>Service fee</span><strong><Price usd={0} suffix="in preview" /></strong></div><div className="summary-total"><span>Estimated total</span><strong>Verified before payment</strong></div><p className="summary-footnote">Prices shown here are planning estimates until supplier connection and final verification are active.</p></aside></div></div></main>;
}
