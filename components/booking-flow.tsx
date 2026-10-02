"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { AvailabilityNotice, SourceBadge } from "@/components/travel-readiness";
import type { TravelOffer } from "@/lib/api-contracts";
import { Price } from "@/components/price";
import { useCurrency } from "@/components/currency-provider";

export function BookingFlow({ offer }: { offer: TravelOffer }) {
  const { currency } = useCurrency();
  const [submitted, setSubmitted] = useState(false);
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return <main className="page-main booking-main"><div className="page-wrap booking-confirmation" data-reveal><div className="success-icon"><CheckIcon size={24} /></div><span className="eyebrow">REQUEST RECEIVED</span><h1>Your island plan is taking shape.</h1><p>We saved this demo request for <strong>{travelerName || "your traveller"}</strong>. Once a supplier is connected, this step will verify live availability and show the final total before payment.</p><div className="confirmation-reference"><span>Demo reference</span><strong>MD-READY-001</strong></div><div className="booking-actions"><Link className="button button-teal" href="/booking/confirmation">See next steps <ArrowRight size={14} /></Link><Link className="button button-ghost button-dark" href="/stay">Keep exploring</Link></div></div></main>;
  }

  const isStay = offer.type === "stay";
  return <main className="page-main booking-main"><div className="page-wrap"><div className="booking-intro"><span className="eyebrow">BOOKING-READY FLOW</span><h1>Review the details before you go.</h1><p>This is the pre-integration booking experience. It is designed to receive live pricing, cancellation rules and supplier confirmation from Hotelbeds, Viator or a direct Maldives partner.</p></div><div className="booking-layout"><form className="detail-card booking-form" onSubmit={handleSubmit}><div className="booking-step-title"><span>01</span><div><span className="eyebrow">TRAVELLER DETAILS</span><h2>Who is travelling?</h2></div></div><div className="form-grid"><label className="field-label">Full name<input className="input" value={travelerName} onChange={(event) => setTravelerName(event.target.value)} placeholder="Your name" required /></label><label className="field-label">Email address<input className="input" type="email" value={travelerEmail} onChange={(event) => setTravelerEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="field-label">Country of residence<select className="input" defaultValue="India"><option>India</option><option>United Kingdom</option><option>United States</option><option>United Arab Emirates</option><option>Other</option></select></label><label className="field-label">Travellers<select className="input" defaultValue="2"><option value="1">1 traveller</option><option value="2">2 travellers</option><option value="3">3 travellers</option><option value="4">4 travellers</option></select></label></div><div className="booking-step-title booking-step-spaced"><span>02</span><div><span className="eyebrow">TRIP DETAILS</span><h2>{isStay ? "When would you like to stay?" : "When would you like to go?"}</h2></div></div><div className="form-grid">{isStay ? <><label className="field-label">Check in<input className="input" type="date" required /></label><label className="field-label">Check out<input className="input" type="date" required /></label></> : <label className="field-label">Preferred date<input className="input" type="date" required /></label>}<label className="field-label">Special requests<span className="field-hint">Optional</span><textarea className="input textarea" placeholder="Transfers, dietary notes or anything else we should know." rows={3} /></label></div><label className="consent-check"><input type="checkbox" required /><span>I understand this is a request flow. No payment is taken and final availability, price and cancellation terms will be confirmed before booking.</span></label><button className="button button-teal full-button" type="submit">Continue with this request <ArrowRight size={14} /></button></form><aside className="detail-card booking-summary"><span className="eyebrow">YOUR SELECTION</span><div className="booking-summary-image" style={{ backgroundImage: `url(${offer.image})` }} /><div className="booking-summary-title"><div><h2>{offer.title}</h2><p>{offer.location}</p></div><SourceBadge source={offer.source} /></div><AvailabilityNotice source={offer.source} /><div className="summary-line"><span>From</span><strong><Price usd={offer.priceFrom} /> <small>{currency} · {offer.priceUnit}</small></strong></div><div className="summary-line"><span>Cancellation</span><strong className="summary-muted">To be confirmed</strong></div><div className="summary-line"><span>Service fee</span><strong><Price usd={0} suffix="in preview" /></strong></div><div className="summary-total"><span>Estimated total</span><strong>Verified before payment</strong></div><p className="summary-footnote">Prices shown here are planning estimates until the supplier connection is active. This keeps the traveller informed without presenting sample data as a confirmed booking.</p></aside></div></div></main>;
}
