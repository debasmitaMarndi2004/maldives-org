"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartIcon, SearchIcon, StarIcon, SunIcon } from "@/components/icons";
import { atolls, experiences, images, properties } from "@/lib/data";
import { Price } from "@/components/price";

function SearchCard() {
  const [where, setWhere] = useState("Maldives");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showWhere, setShowWhere] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const guestLabel = `${guests.adults + guests.children} guest${guests.adults + guests.children === 1 ? "" : "s"}`;
  const setGuest = (key: keyof typeof guests, delta: number) => setGuests((current) => ({ ...current, [key]: Math.max(key === "adults" ? 1 : 0, current[key] + delta) }));

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ where, checkIn, checkOut, travelers: guestLabel });
    window.location.href = `/stay?${params.toString()}`;
  }

  return <div className="search-wrap page-wrap" data-reveal><form className="search-card" onSubmit={submit}>
    <div className="search-field" style={{ position: "relative" }}>
      <label htmlFor="where">WHERE</label>
      <button id="where" type="button" onClick={() => { setShowWhere(!showWhere); setShowGuests(false); }}>{where}</button>
      {showWhere && <div className="search-popover"><p>Try an atoll, island or stay</p>{["Maldives", ...atolls.slice(0, 4)].map((place) => <button className="suggestion" key={place} type="button" onClick={() => { setWhere(place); setShowWhere(false); }}>{place}</button>)}</div>}
    </div>
    <div className="search-field"><label htmlFor="check-in">CHECK IN</label><input id="check-in" type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} placeholder="Add dates" /></div>
    <div className="search-field"><label htmlFor="check-out">CHECK OUT</label><input id="check-out" type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} placeholder="Add dates" /></div>
    <div className="search-field" style={{ position: "relative" }}>
      <label htmlFor="travelers">TRAVELERS</label>
      <button id="travelers" type="button" onClick={() => { setShowGuests(!showGuests); setShowWhere(false); }}>{guestLabel}</button>
      {showGuests && <div className="search-popover guest-popover">{(["adults", "children", "rooms"] as const).map((key) => <div className="guest-row" key={key}><span>{key[0].toUpperCase() + key.slice(1)}</span><span className="counter"><button type="button" onClick={() => setGuest(key, -1)} aria-label={`Remove ${key}`}>−</button><span>{guests[key]}</span><button type="button" onClick={() => setGuest(key, 1)} aria-label={`Add ${key}`}>+</button></span></div>)}</div>}
    </div>
    <button className="search-action" type="submit"><SearchIcon size={14} />Search stays</button>
  </form></div>;
}

function LiveWidget() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const id = window.setInterval(() => setNow(new Date()), 60000); return () => window.clearInterval(id); }, []);
  const time = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", hour: "numeric", minute: "2-digit" }).format(now) : "10:08 PM";
  const date = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", month: "short", day: "numeric" }).format(now) : "Sep 30";
  return <div className="page-wrap live-bar" data-reveal><div className="live-location"><span className="sun-bubble"><SunIcon size={17} /></span><div><span className="eyebrow">Maldives now</span><strong>Malé, Maldives</strong></div></div><div className="live-stats"><div><strong>{time}</strong><small>Local time</small></div><div><strong>{date}</strong><small>Local date</small></div><div><strong>28°C</strong><small>Temperature</small></div></div></div>;
}

const escapes = [
  { label: "ICONIC", title: "Overwater Villas", description: "Wake up directly above the Indian Ocean.", image: images.overwater, href: "/stay?style=overwater" },
  { label: "ROMANTIC", title: "Honeymoons", description: "Private escapes made for two.", image: images.honeymoon, href: "/stay?style=honeymoon" },
  { label: "EFFORTLESS", title: "All-Inclusive", description: "One price. Everything taken care of.", image: images.inclusive, href: "/stay?style=all-inclusive" },
  { label: "EXCLUSIVE", title: "Private Islands", description: "Ultimate privacy in paradise.", image: images.privateIsland, href: "/stay?style=private-island" },
];

function StayCard({ property }: { property: typeof properties[number] }) {
  const [liked, setLiked] = useState(false);
  return <article className="stay-card"><div className="stay-image" style={{ "--card-image": `url(${property.image})` } as React.CSSProperties}><span className="stay-badge">{property.badge}</span><button className="image-heart" type="button" onClick={() => setLiked(!liked)} aria-label={liked ? `Remove ${property.name} from wishlist` : `Save ${property.name} to wishlist`}><HeartIcon filled={liked} /></button></div><div className="stay-body"><div className="stay-meta"><span>{property.location}</span><span><StarIcon size={11} /> {property.rating}</span></div><h3>{property.name}</h3><p>{property.description}</p><div className="stay-footer"><Link href={`/stay/${property.slug}`}>View resort <ArrowUpRight size={13} /></Link><span>From <Price usd={property.price} suffix="/ night" /></span></div></div></article>;
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return <><button className="chat-fab" type="button" onClick={() => setOpen(!open)} aria-label="Open Ask Maldives concierge"><span>✦</span><span>Ask Maldives</span></button>{open && <div className="chat-panel"><div className="chat-head"><div><span className="eyebrow">Your island concierge</span><strong>Ask Maldives</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close concierge">×</button></div><p className="chat-intro">Tell me what kind of island day you are dreaming about. I’ll suggest stays, transfers and experiences from our verified guide.</p><div className="chat-suggestions"><button type="button" onClick={() => setMessage("Honeymoon under $3,000")}>Honeymoon under $3,000</button><button type="button" onClick={() => setMessage("Best budget island for diving")}>Budget island for diving</button><button type="button" onClick={() => setMessage("How do I get to Maafushi?")}>How do I get to Maafushi?</button></div>{sent && <div className="chat-reply">Thanks — this demo concierge is ready to connect your question to the Maldives.org travel team.</div>}<form className="chat-form" onSubmit={(event) => { event.preventDefault(); if (message.trim()) setSent(true); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about the Maldives…" aria-label="Ask about the Maldives" /><button type="submit"><ArrowRight size={15} /></button></form><small>Details and availability are confirmed at checkout.</small></div>}</>;
}

export default function HomeSections() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const featured = useMemo(() => properties.slice(0, 3), []);
  return <main className="site-main">
    <section className="hero" data-reveal><div className="hero-image" aria-hidden="true" /><div className="page-wrap hero-content"><div className="hero-copy"><span className="eyebrow">The islands you&apos;ve been dreaming about</span><h1>Find your perfect Maldives.</h1><p>Explore extraordinary resorts, overwater villas, private islands and unforgettable experiences, then compare and book the trip in one place.</p><div className="hero-actions"><Link className="button button-sun" href="/stay">Explore Resorts <ArrowUpRight size={14} /></Link><Link className="button button-ghost" href="/experiences">Discover Experiences <ArrowUpRight size={14} /></Link></div></div></div></section>
    <SearchCard />
    <LiveWidget />
    <section className="section page-wrap" data-reveal><div className="section-header"><div><span className="eyebrow">Choose your escape</span><h2>Stay your way.</h2></div><p>From once-in-a-lifetime overwater villas to family-friendly islands and intimate boutique resorts, find the Maldives that fits your trip.</p></div><div className="escape-grid">{escapes.map((escape) => <Link href={escape.href} className="escape-card" style={{ "--card-image": `url(${escape.image})` } as React.CSSProperties} key={escape.title}><div className="escape-card-copy"><span className="eyebrow">{escape.label}</span><h3>{escape.title}</h3><p>{escape.description}</p></div></Link>)}</div></section>
    <section className="section section-soft" data-reveal><div className="page-wrap"><div className="section-header"><div><span className="eyebrow">Featured stays</span><h2>Resorts worth the flight.</h2></div><p>Curated places travellers love. These cards can eventually connect directly to affiliate partners.</p></div><div className="featured-grid">{featured.map((property) => <StayCard property={property} key={property.slug} />)}</div><div className="section-cta"><Link href="/stay" className="text-link">See all stays <ArrowRight size={14} /></Link></div></div></section>
    <section className="section page-wrap" data-reveal><div className="section-header"><div><span className="eyebrow">Beyond the villa</span><h2>Do something unforgettable.</h2></div><p>Trade a slow morning for a reef adventure, a sunset sail or a sandbank that feels like it belongs only to you.</p></div><div className="experience-grid">{experiences.map((experience, index) => <Link href={`/experiences/${experience.slug}`} className="experience-tile" style={{ "--tile-image": `url(${experience.image})` } as React.CSSProperties} key={experience.slug}><div><h3>{experience.name}</h3><p>{experience.duration} · From <Price usd={experience.price} /></p></div></Link>)}</div></section>
    <section className="guide-band" data-reveal><div className="page-wrap"><div className="section-header"><div><span className="eyebrow">Travel well</span><h2>Your Maldives guide.</h2></div><p>Good trips are made of small decisions. Start with the practical things that make island time feel effortless.</p></div><div className="guide-grid"><Link className="guide-card" href="/guides/best-time-to-visit"><h3>Best time to visit</h3><p>Weather, reef life and the seasons worth planning around.</p><span className="guide-link">Read the guide <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/transfers"><h3>Getting around</h3><p>Seaplanes, speedboats and ferries — know what connects.</p><span className="guide-link">Plan your route <ArrowUpRight size={13} /></span></Link><Link className="guide-card" href="/atolls"><h3>Which atoll?</h3><p>Choose the right kind of island for your way of travelling.</p><span className="guide-link">Find your fit <ArrowUpRight size={13} /></span></Link></div></div></section>
    <section className="newsletter" id="newsletter" data-reveal><div className="page-wrap"><span className="eyebrow">Island notes</span><h2>Paradise in your inbox.</h2><p>Thoughtful guides, new stays and the occasional nudge to book the trip you keep talking about.</p>{subscribed ? <div className="success-note">You’re on the list — see you in paradise.</div> : <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); if (email.includes("@")) setSubscribed(true); }}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Your email address" aria-label="Email address" required /><button type="submit">Sign me up</button></form>}<div className="form-note">No noise. Unsubscribe any time.</div></div></section>
    <ChatWidget />
  </main>;
}
