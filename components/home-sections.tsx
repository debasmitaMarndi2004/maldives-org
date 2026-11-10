"use client";

import { MediaFallback } from "@/components/media-fallback";
import { HomeUpper } from "@/components/home-upper";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { experiences } from "@/lib/data";
import { Price } from "@/components/price";
import { NewsletterFormLive } from "@/components/newsletter-form-live";

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return <><button className="chat-fab" type="button" onClick={() => setOpen(!open)} aria-label="Open Ask Maldives concierge"><span>✦</span><span>Ask Maldives</span></button>{open && <div className="chat-panel"><div className="chat-head"><div><span className="eyebrow">Planning preview</span><strong>Ask Maldives</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close concierge">×</button></div><p className="chat-intro">Tell me what kind of island day you are dreaming about. I’ll suggest stays, transfers and experiences from our sample guide. This preview does not contact the travel team.</p><div className="chat-suggestions"><button type="button" onClick={() => setMessage("Honeymoon under $3,000")}>Honeymoon under $3,000</button><button type="button" onClick={() => setMessage("Best budget island for diving")}>Budget island for diving</button><button type="button" onClick={() => setMessage("How do I get to Maafushi?")}>How do I get to Maafushi?</button></div>{sent && <div className="chat-reply">Preview only — your question has not been sent or saved. Browse our guides for planning ideas.</div>}<form className="chat-form" onSubmit={(event) => { event.preventDefault(); if (message.trim()) setSent(true); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the Maldives…" aria-label="Ask about the Maldives" /><button type="submit" aria-label="Preview your question"><ArrowRight size={15} /></button></form><small>No booking or payment is available in this preview.</small></div>}</>;
}

export default function HomeSections() {
  return <main className="site-main">
    <HomeUpper />
    <section className="section page-wrap" data-reveal><div className="section-header"><div><span className="eyebrow">Beyond the villa</span><h2>Do something unforgettable.</h2></div><p>Trade a slow morning for a reef adventure, a sunset sail or a sandbank that feels like it belongs only to you.</p></div><div className="experience-grid">{experiences.map((experience) => <Link href={`/experiences/${experience.slug}`} className="experience-tile" style={{ "--tile-image": `url(${experience.image})` } as React.CSSProperties} key={experience.slug}><div><h3>{experience.name}</h3><p>{experience.duration} · From <Price usd={experience.price} /></p></div></Link>)}</div></section>
    <section className="guide-band" data-reveal><div className="page-wrap"><div className="section-header"><div><span className="eyebrow">Travel well</span><h2>Your Maldives guide.</h2></div><p>Good trips are made of small decisions. Start with the practical things that make island time feel effortless.</p></div><div className="guide-grid"><Link className="guide-card" href="/guides/best-time-to-visit"><h3>Best time to visit</h3><p>Weather, reef life and the seasons worth planning around.</p><span className="guide-link">Read the guide <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/transfers"><h3>Getting around</h3><p>Seaplanes, speedboats and ferries — know what connects.</p><span className="guide-link">Plan your route <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/atolls"><h3>Which atoll?</h3><p>Choose the right kind of island for your way of travelling.</p><span className="guide-link">Find your fit <ArrowUpRight size={13} /></span></Link></div></div></section>
    <section className="newsletter" id="newsletter" data-reveal><div className="page-wrap"><span className="eyebrow">Island notes</span><h2>Paradise in your inbox.</h2><p>Thoughtful guides, new stays and the occasional nudge to book the trip you keep talking about.</p><NewsletterFormLive /><div className="form-note">No noise. Unsubscribe any time.</div></div></section>
    <ChatWidget />
  <MediaFallback /></main>;
}
