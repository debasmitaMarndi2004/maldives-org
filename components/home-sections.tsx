"use client";

import { MediaFallback } from "@/components/media-fallback";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartIcon, StarIcon, SunIcon } from "@/components/icons";
import { experiences, images, properties } from "@/lib/data";
import { Price } from "@/components/price";
import { NewsletterFormLive } from "@/components/newsletter-form-live";
import { AffiliateBookingAction } from "@/components/affiliate-booking-action";

function LiveWidget() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const initial = window.setTimeout(() => setNow(new Date()), 0); const id = window.setInterval(() => setNow(new Date()), 60000); return () => { window.clearTimeout(initial); window.clearInterval(id); }; }, []);
  const time = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", hour: "numeric", minute: "2-digit" }).format(now) : "10:08 PM";
  const date = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", month: "short", day: "numeric" }).format(now) : "Sep 30";
  return <div className="page-wrap live-bar" data-reveal><div className="live-location"><span className="sun-bubble"><SunIcon size={17} /></span><div><span className="eyebrow">Maldives now</span><strong>Malé, Maldives</strong></div></div><div className="live-stats"><div><strong>{time}</strong><small>Local time</small></div><div><strong>{date}</strong><small>Local date</small></div><div><strong>28°C</strong><small>Sample weather</small></div></div></div>;
}

const escapes = [
  { label: "ICONIC", title: "Overwater Villas", description: "Wake up directly above the Indian Ocean.", image: images.overwater, href: "/stay?style=overwater" },
  { label: "ROMANTIC", title: "Honeymoons", description: "Private escapes made for two.", image: images.honeymoon, href: "/stay?style=honeymoon" },
  { label: "EFFORTLESS", title: "All-Inclusive", description: "One price. Everything taken care of.", image: images.inclusive, href: "/stay?style=all-inclusive" },
  { label: "EXCLUSIVE", title: "Private Islands", description: "Ultimate privacy in paradise.", image: images.privateIsland, href: "/stay?style=private-island" },
];

function StayCard({ property }: { property: typeof properties[number] }) {
  const [liked, setLiked] = useState(false);
  return <article className="stay-card"><div className="stay-image" style={{ "--card-image": `url(${property.image})` } as React.CSSProperties}><span className="stay-badge">{property.badge}</span><button className="image-heart" type="button" onClick={() => setLiked(!liked)} aria-label={liked ? `Remove ${property.name} from wishlist` : `Save ${property.name} to wishlist`}><HeartIcon filled={liked} /></button></div><div className="stay-body"><div className="stay-meta"><span>{property.location}</span><span><StarIcon size={11} /> {property.rating}</span></div><h3>{property.name}</h3><p>{property.description}</p><div className="stay-footer"><Link href={`/stay/${property.slug}`}>View resort <ArrowUpRight size={13} /></Link><span>Sample estimate <Price usd={property.price} suffix="/ night" /></span></div><AffiliateBookingAction productType="stay" slug={property.slug} detailsHref={`/stay/${property.slug}`} compact /></div></article>;
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return <><button className="chat-fab" type="button" onClick={() => setOpen(!open)} aria-label="Open Ask Maldives concierge"><span>✦</span><span>Ask Maldives</span></button>{open && <div className="chat-panel"><div className="chat-head"><div><span className="eyebrow">Planning preview</span><strong>Ask Maldives</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close concierge">×</button></div><p className="chat-intro">Tell me what kind of island day you are dreaming about. I’ll suggest stays, transfers and experiences from our sample guide. This preview does not contact the travel team.</p><div className="chat-suggestions"><button type="button" onClick={() => setMessage("Honeymoon under $3,000")}>Honeymoon under $3,000</button><button type="button" onClick={() => setMessage("Best budget island for diving")}>Budget island for diving</button><button type="button" onClick={() => setMessage("How do I get to Maafushi?")}>How do I get to Maafushi?</button></div>{sent && <div className="chat-reply">Preview only — your question has not been sent or saved. Browse our guides for planning ideas.</div>}<form className="chat-form" onSubmit={(event) => { event.preventDefault(); if (message.trim()) setSent(true); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the Maldives…" aria-label="Ask about the Maldives" /><button type="submit" aria-label="Preview your question"><ArrowRight size={15} /></button></form><small>No booking or payment is available in this preview.</small></div>}</>;
}

export default function HomeSections() {
  const featured = useMemo(() => properties.slice(0, 3), []);
  return <main className="site-main">
    <section className="hero" data-reveal><div className="hero-image" aria-hidden="true" /><div className="page-wrap hero-content"><div className="hero-copy"><span className="eyebrow">The islands you&apos;ve been dreaming about</span><h1>Find your perfect Maldives.</h1><p>Explore extraordinary resorts, overwater villas, private islands and unforgettable experiences, then compare your options before booking on a named partner website.</p><div className="hero-actions"><Link className="button button-sun" href="/stay">Explore Resorts <ArrowUpRight size={14} /></Link><Link className="button button-ghost" href="/experiences">Discover Experiences <ArrowUpRight size={14} /></Link></div></div></div></section>
    <section className="search-wrap page-wrap" aria-label="Flight search"><div className="detail-card flight-entry-card"><div><h2>Find flights to the Maldives</h2><p>Choose your departure airport and view Aviasales flight results on Maldives.org.</p></div><Link className="button button-teal" href="/flights">Search flights <ArrowUpRight size={14} /></Link></div></section>
    <LiveWidget />
    <section className="section page-wrap" data-reveal><div className="section-header"><div><span className="eyebrow">Choose your escape</span><h2>Stay your way.</h2></div><p>From once-in-a-lifetime overwater villas to family-friendly islands and intimate boutique resorts, find the Maldives that fits your trip.</p></div><div className="escape-grid">{escapes.map((escape) => <Link href={escape.href} className="escape-card" style={{ "--card-image": `url(${escape.image})` } as React.CSSProperties} key={escape.title}><div className="escape-card-copy"><span className="eyebrow">{escape.label}</span><h3>{escape.title}</h3><p>{escape.description}</p></div></Link>)}</div></section>
    <section className="section section-soft" data-reveal><div className="page-wrap"><div className="section-header"><div><span className="eyebrow">Featured stays</span><h2>Resorts worth the flight.</h2></div><p>Curated places travellers love. These cards can eventually connect directly to affiliate partners.</p></div><div className="featured-grid">{featured.map((property) => <StayCard property={property} key={property.slug} />)}</div><div className="section-cta"><Link href="/stay" className="text-link">See all stays <ArrowRight size={14} /></Link></div></div></section>
    <section className="section page-wrap" data-reveal><div className="section-header"><div><span className="eyebrow">Beyond the villa</span><h2>Do something unforgettable.</h2></div><p>Trade a slow morning for a reef adventure, a sunset sail or a sandbank that feels like it belongs only to you.</p></div><div className="experience-grid">{experiences.map((experience) => <Link href={`/experiences/${experience.slug}`} className="experience-tile" style={{ "--tile-image": `url(${experience.image})` } as React.CSSProperties} key={experience.slug}><div><h3>{experience.name}</h3><p>{experience.duration} · From <Price usd={experience.price} /></p></div></Link>)}</div></section>
    <section className="guide-band" data-reveal><div className="page-wrap"><div className="section-header"><div><span className="eyebrow">Travel well</span><h2>Your Maldives guide.</h2></div><p>Good trips are made of small decisions. Start with the practical things that make island time feel effortless.</p></div><div className="guide-grid"><Link className="guide-card" href="/guides/best-time-to-visit"><h3>Best time to visit</h3><p>Weather, reef life and the seasons worth planning around.</p><span className="guide-link">Read the guide <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/transfers"><h3>Getting around</h3><p>Seaplanes, speedboats and ferries — know what connects.</p><span className="guide-link">Plan your route <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/atolls"><h3>Which atoll?</h3><p>Choose the right kind of island for your way of travelling.</p><span className="guide-link">Find your fit <ArrowUpRight size={13} /></span></Link></div></div></section>
    <section className="newsletter" id="newsletter" data-reveal><div className="page-wrap"><span className="eyebrow">Island notes</span><h2>Paradise in your inbox.</h2><p>Thoughtful guides, new stays and the occasional nudge to book the trip you keep talking about.</p><NewsletterFormLive /><div className="form-note">No noise. Unsubscribe any time.</div></div></section>
    <ChatWidget />
  <MediaFallback /></main>;
}
