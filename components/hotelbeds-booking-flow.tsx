"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { SourceBadge } from "@/components/travel-readiness";
import { SupplierPrice } from "@/components/supplier-price";
import type { TravelOffer } from "@/lib/api-contracts";
import type { HotelbedsBookingSummary, HotelbedsRateSummary } from "@/lib/hotelbeds-data";

type Pax = { name: string; surname: string };

function rateFromOffer(offer: TravelOffer, rateKey: string, rateType: string, roomName: string, boardName: string): HotelbedsRateSummary {
  return {
    rateKey,
    rateType: rateType.toUpperCase() || "BOOKABLE",
    amount: offer.priceFrom,
    netAmount: null,
    currency: offer.currency,
    roomName: roomName || "Selected room",
    boardName: boardName || "Selected board",
    paymentType: "To be confirmed",
    rateComments: "",
    cancellationPolicies: [],
    hotelCode: offer.supplierCode || "",
    hotelName: offer.title,
  };
}

export function HotelbedsBookingFlow({
  offer,
  checkIn,
  checkOut,
  rateKey,
  rateType,
  roomName,
  boardName,
}: {
  offer: TravelOffer;
  checkIn: string;
  checkOut: string;
  rateKey: string;
  rateType: string;
  roomName: string;
  boardName: string;
}) {
  const [paxes, setPaxes] = useState<Pax[]>([{ name: "", surname: "" }, { name: "", surname: "" }]);
  const [travelerEmail, setTravelerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [internalReference, setInternalReference] = useState("");
  const [rate, setRate] = useState<HotelbedsRateSummary>(() => rateFromOffer(offer, rateKey, rateType, roomName, boardName));
  const [phase, setPhase] = useState<"details" | "checked" | "confirmed">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<HotelbedsBookingSummary | null>(null);

  function updatePax(index: number, field: keyof Pax, value: string) {
    setPaxes((current) => current.map((pax, paxIndex) => paxIndex === index ? { ...pax, [field]: value } : pax));
  }

  function changePaxCount(value: string) {
    const count = Number(value);
    setPaxes((current) => Array.from({ length: count }, (_, index) => current[index] || { name: "", surname: "" }));
  }

  async function createInternalRequest() {
    if (internalReference) return internalReference;
    const response = await fetch("/api/booking-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId: offer.id,
        offerTitle: offer.title,
        offerType: "stay",
        source: "hotelbeds",
        supplierCode: offer.supplierCode,
        travelerName: `${paxes[0].name} ${paxes[0].surname}`.trim(),
        travelerEmail,
        guests: paxes.length,
        checkIn,
        checkOut,
        notes,
        priceFrom: rate.amount,
        currency: rate.currency,
      }),
    });
    const payload = (await response.json()) as { ok?: boolean; reference?: string; message?: string };
    if (!response.ok || !payload.ok || !payload.reference) throw new Error(payload.message || "We could not start this booking request.");
    setInternalReference(payload.reference);
    return payload.reference;
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(travelerEmail)) throw new Error("Enter a valid email address for the booking confirmation.");
      if (paxes.some((pax) => !pax.name.trim() || !pax.surname.trim())) throw new Error("Enter the first and last name for every traveller.");
      const reference = await createInternalRequest();
      if (rate.rateType === "RECHECK") {
        const response = await fetch("/api/hotelbeds/checkrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rateKeys: [rate.rateKey], internalReference: reference }),
        });
        const payload = (await response.json()) as { ok?: boolean; rate?: HotelbedsRateSummary; message?: string };
        if (!response.ok || !payload.ok || !payload.rate) throw new Error(payload.message || "Hotelbeds could not recheck this rate.");
        setRate(payload.rate);
      }
      setPhase("checked");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Hotelbeds could not check this rate.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/hotelbeds/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          internalReference,
          rateKey: rate.rateKey,
          holder: paxes[0],
          paxes: paxes.map((pax) => ({ ...pax, type: "AD", roomId: 1 })),
          remark: notes,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; booking?: HotelbedsBookingSummary; message?: string };
      if (!response.ok || !payload.ok || !payload.booking) throw new Error(payload.message || "Hotelbeds booking confirmation is not enabled yet.");
      setConfirmation(payload.booking);
      setPhase("confirmed");
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Hotelbeds booking confirmation failed.");
    } finally {
      setLoading(false);
    }
  }

  if (phase === "confirmed" && confirmation) {
    return <main className="page-main booking-main"><div className="page-wrap booking-confirmation" data-reveal><div className="success-icon"><CheckIcon size={24} /></div><span className="eyebrow">HOTELBEDS CONFIRMED</span><h1>Your island stay is confirmed.</h1><p>The supplier returned a confirmed booking reference. Keep the voucher available for your journey.</p><div className="confirmation-reference"><span>Hotelbeds reference</span><strong>{confirmation.supplierReference}</strong></div><div className="booking-actions"><Link className="button button-teal" href={`/booking/${encodeURIComponent(internalReference)}/voucher`}>Open voucher <ArrowRight size={14} /></Link><Link className="button button-ghost button-dark" href="/stay">Keep exploring</Link></div></div></main>;
  }

  return <main className="page-main booking-main"><div className="page-wrap"><div className="booking-intro"><span className="eyebrow">HOTELBEDS LIVE BOOKING</span><h1>Check every detail before you commit.</h1><p>The selected Hotelbeds rate is rechecked when required, then the supplier confirmation step is kept separate. No booking is created while certification mode is disabled.</p></div><div className="supplier-workflow"><div className={`workflow-node ${phase === "details" ? "active" : "complete"}`}><strong>01</strong><span>Availability</span><small>{checkIn} → {checkOut}</small></div><div className="workflow-line" /><div className={`workflow-node ${phase === "details" ? "" : "complete"}`}><strong>02</strong><span>CheckRate</span><small>{rate.rateType === "RECHECK" ? "Required for this rate" : "Not required"}</small></div><div className="workflow-line" /><div className={`workflow-node ${phase === "checked" ? "active" : ""}`}><strong>03</strong><span>Confirmation</span><small>Supplier booking</small></div></div><div className="booking-layout"><form className="detail-card booking-form" onSubmit={handleReview}><div className="booking-step-title"><span>01</span><div><span className="eyebrow">TRAVELLER DETAILS</span><h2>Who is travelling?</h2></div></div><div className="form-grid"><label className="field-label">Email address<input className="input" type="email" value={travelerEmail} onChange={(event) => setTravelerEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="field-label">Travellers<select className="input" value={paxes.length} onChange={(event) => changePaxCount(event.target.value)}><option value="1">1 traveller</option><option value="2">2 travellers</option><option value="3">3 travellers</option><option value="4">4 travellers</option></select></label></div><div className="pax-grid">{paxes.map((pax, index) => <div className="pax-card" key={index}><span className="eyebrow">TRAVELLER {index + 1}</span><label className="field-label">First name<input className="input" value={pax.name} onChange={(event) => updatePax(index, "name", event.target.value)} required /></label><label className="field-label">Last name<input className="input" value={pax.surname} onChange={(event) => updatePax(index, "surname", event.target.value)} required /></label></div>)}</div><div className="booking-step-title booking-step-spaced"><span>02</span><div><span className="eyebrow">RATE REVIEW</span><h2>{phase === "details" ? "Recheck this selection" : "Rate checked"}</h2></div></div><label className="field-label">Special requests<span className="field-hint">Optional</span><textarea className="input textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Transfers, dietary notes or anything else the supplier should know." rows={3} /></label>{error && <div className="note-box" role="alert">{error}</div>}{phase === "details" ? <button className="button button-teal full-button" type="submit" disabled={loading}>{loading ? "Checking supplier rate…" : rate.rateType === "RECHECK" ? "CheckRate and review" : "Review bookable rate"} <ArrowRight size={14} /></button> : <button className="button button-teal full-button" type="button" disabled={loading} onClick={confirmBooking}>{loading ? "Sending confirmation…" : "Confirm Hotelbeds booking"} <ArrowRight size={14} /></button>}</form><aside className="detail-card booking-summary"><span className="eyebrow">YOUR HOTELBEDS RATE</span><div className="booking-summary-image" style={{ backgroundImage: `url(${offer.image})` }} /><div className="booking-summary-title"><div><h2>{offer.title}</h2><p>{offer.location}</p></div><SourceBadge source="hotelbeds" /></div><div className="summary-line"><span>Room</span><strong>{rate.roomName}</strong></div><div className="summary-line"><span>Board</span><strong>{rate.boardName}</strong></div><div className="summary-line"><span>Supplier price</span><strong><SupplierPrice amount={rate.amount} currency={rate.currency} /></strong></div><div className="summary-line"><span>Payment</span><strong>{rate.paymentType}</strong></div><div className="summary-line"><span>Cancellation</span><strong>{rate.cancellationPolicies.length ? "Policy received" : "To be confirmed"}</strong></div>{rate.cancellationPolicies.map((policy) => <div className="policy-row" key={`${policy.from}-${policy.amount}`}><span>From {new Date(policy.from).toLocaleDateString("en-GB")}</span><strong>{policy.amount.toFixed(2)} {rate.currency}</strong></div>)}{rate.rateComments && <div className="note-box">{rate.rateComments}</div>}<div className="summary-total"><span>Final amount</span><strong>{phase === "details" ? "Checked before booking" : <SupplierPrice amount={rate.amount} currency={rate.currency} />}</strong></div><p className="summary-footnote">Hotelbeds terms and supplier currency are displayed before confirmation. Stripe remains separate and disabled until the business payment setup is ready.</p></aside></div></div></main>;
}
