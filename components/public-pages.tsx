"use client";

import { MediaFallback } from "@/components/media-fallback";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, HeartIcon, StarIcon } from "@/components/icons";
import { AvailabilityNotice, SourceBadge } from "@/components/travel-readiness";
import { experiences, guides, properties, Property } from "@/lib/data";
import { Price } from "@/components/price";
import { useCurrency } from "@/components/currency-provider";
import { AffiliateBookingAction } from "@/components/affiliate-booking-action";
import { isCalendarDate, isValidDateRange } from "@/lib/calendar-date";
import { filterSampleTransferRoutes, type SampleTransferRoute } from "@/lib/transfer-routes";

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-hero" data-reveal><div className="page-wrap page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>;
}

function PropertyCard({ property }: { property: Property }) {
  const [saved, setSaved] = useState(false);
  return <article className="stay-card"><div className="stay-image" style={{ "--card-image": `url(${property.image})` } as React.CSSProperties}><span className="stay-badge">{property.badge}</span><button className="image-heart" type="button" aria-label="Toggle wishlist" onClick={() => setSaved(!saved)}><HeartIcon filled={saved} /></button></div><div className="stay-body"><div className="stay-meta"><span>{property.location}</span><span><StarIcon size={11} /> {property.rating}</span></div><div className="card-source-row"><SourceBadge source="sample" /></div><h3>{property.name}</h3><p>{property.description}</p><div className="stay-footer"><Link href={`/stay/${property.slug}`}>Explore stay <ArrowUpRight size={13} /></Link><span>From <Price usd={property.price} /></span></div><AffiliateBookingAction productType="stay" slug={property.slug} detailsHref={`/stay/${property.slug}`} compact /></div></article>;
}

export function StayDirectory({ title = "Stay somewhere extraordinary.", category, initialQuery = "", initialStyle = "" }: { title?: string; category?: "Resort" | "Guesthouse"; initialQuery?: string; initialStyle?: string }) {
  const { currency } = useCurrency();
  const [query, setQuery] = useState(initialQuery);
  const styleFilter = initialStyle === "overwater" ? "Overwater" : initialStyle === "all-inclusive" ? "All-inclusive" : "All stays";
  const [active, setActive] = useState(styleFilter);
  const [style, setStyle] = useState(initialStyle);
  const [map, setMap] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const filters = ["All stays", ...(category !== "Guesthouse" ? ["Resorts"] : []), ...(category !== "Resort" ? ["Guesthouses"] : []), "Overwater", "All-inclusive", "Under $150"];
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const shown = useMemo(() => {
    const filtered = properties.filter((property) => {
      const searchable = normalize(`${property.name} ${property.location} ${property.tags.join(" ")}`);
      const matchesQuery = searchable.includes(normalize(query.trim()));
      const matchesCategory = !category || property.kind === category;
      const matchesStyle = !style || ["overwater", "all-inclusive"].includes(style) || searchable.includes(style.replaceAll("-", " "));
      const matchesType = active === "All stays" || (active === "Resorts" && property.kind === "Resort") || (active === "Guesthouses" && property.kind === "Guesthouse") || (active === "Overwater" && property.tags.includes("Overwater")) || (active === "All-inclusive" && property.tags.includes("All-inclusive")) || (active === "Under $150" && property.price < 150);
      return matchesQuery && matchesCategory && matchesType && matchesStyle;
    });
    return [...filtered].sort((a, b) => sortBy === "price-low" ? a.price - b.price : sortBy === "price-high" ? b.price - a.price : b.rating - a.rating);
  }, [query, active, sortBy, category, style]);
  function resetFilters() { setQuery(""); setActive("All stays"); setStyle(""); }
  return <><PageIntro eyebrow="CURATED STAYS" title={title} description="Compare the places that make island time feel effortless — from iconic overwater villas to guesthouses on the local islands." /><main className="page-main"><div className="page-wrap">
    <div className="directory-toolbar"><div className="filter-row" aria-label="Stay categories">{filters.map((filter) => <button type="button" key={filter} aria-pressed={active === filter} className={`filter-chip ${active === filter ? "active" : ""}`} onClick={() => { setActive(filter); setStyle(""); }}>{filter}</button>)}</div>
    <div className="directory-actions"><label className="search-inline"><span className="sr-only">Search stays</span><input className="input" placeholder="Search stays or islands" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="input results-sort" aria-label="Sort stays" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><button type="button" aria-pressed={!map} className={`view-toggle ${!map ? "active" : ""}`} onClick={() => setMap(false)}>List</button><button type="button" aria-pressed={map} className={`view-toggle ${map ? "active" : ""}`} onClick={() => setMap(true)}>Map</button></div></div>
    {map ? <div className="map-placeholder"><div className="map-card"><span className="eyebrow">Map preview</span><h2>Island stays, at a glance.</h2><p>An interactive map is not connected yet. Browse the listings for island and transfer details.</p><button type="button" className="button button-teal button-small" onClick={() => setMap(false)}>Back to list <ArrowRight size={13} /></button></div><div className="map-dots" aria-hidden="true"><span /><span /><span /><span /><span /></div></div> : <><div className="results-toolbar" id="results"><div role="status" aria-live="polite"><strong>{shown.length} stays to explore</strong><span className="results-muted">Sample inventory · estimated prices in {currency}</span></div><AvailabilityNotice source="sample" /></div>{shown.length ? <div className="directory-grid">{shown.map((property) => <PropertyCard key={property.slug} property={property} />)}</div> : <div className="empty-state"><p>No stays match this search yet. Try another island, style or budget.</p><button type="button" className="button button-teal" onClick={resetFilters}>Clear filters</button></div>}</>}
    </div><MediaFallback /></main></>;
}

export function StayDetail({ property }: { property: Property }) {
  return <><PageIntro eyebrow={`${property.kind.toUpperCase()} · SAMPLE LISTING`} title={property.name} description={`${property.location} · ${property.transfer}. A representative listing layout for the Maldives.org booking-ready directory.`} /><main className="page-main" data-reveal><div className="page-wrap detail-layout"><div><div className="detail-hero-image" style={{ backgroundImage: `url(${property.image})` }} /><div className="detail-card detail-overview"><div className="stay-meta"><span>{property.location}</span><span><StarIcon size={11} /> {property.rating} guest rating</span></div><h2>An easier way to do island time.</h2><p>{property.description} This sample property uses the same calm, image-led system as the homepage while leaving space for partner data, room types, transfer notes and verified availability.</p><div className="detail-list"><div><strong>Transfer</strong><span>{property.transfer}</span></div><div><strong>From</strong><span><Price usd={property.price} suffix="/ night" /></span></div><div><strong>Best for</strong><span>{property.tags.slice(0, 2).join(" · ")}</span></div><div><strong>Booking mode</strong><span>Request to book</span></div></div><h2>What to expect</h2><p>Stay details, meal plans, amenities, policies and partner-confirmed availability will live here. Until a live partner feed is connected, every listing is clearly marked as sample inventory.</p></div></div><aside className="detail-card sticky-card"><div className="price-line"><div><strong><Price usd={property.price} /></strong><span> / night estimate</span></div></div><p>Sample listing. Check dates, availability, final prices and cancellation terms with the booking provider.</p><AffiliateBookingAction productType="stay" slug={property.slug} detailsHref="/stay" /><div className="note-box">Maldives.org does not take payment or create a reservation. An approved partner link will name the provider before you leave.</div></aside></div><MediaFallback /></main></>;
}

export function ExperienceDirectory() {
  return <><PageIntro eyebrow="BEYOND THE VILLA" title="Make the water your itinerary." description="Book a reef morning, a sunset sail or a local-island day — then bundle it into the trip you actually want to take." /><main className="page-main"><div className="page-wrap"><div className="directory-trust-row"><AvailabilityNotice source="sample" /><Link className="text-link" href="/how-it-works">How supplier data will work <ArrowRight size={13} /></Link></div><div className="experience-grid directory-experience-grid">{experiences.map((experience) => <article className="experience-tile" style={{ "--tile-image": `url(${experience.image})` } as React.CSSProperties} key={experience.slug}><div><span className="experience-category">{experience.category}</span><h3><Link href={`/experiences/${experience.slug}`}>{experience.name}</Link></h3><p>{experience.duration} · Estimate <Price usd={experience.price} /></p><span className="experience-source">Sample inventory</span><AffiliateBookingAction productType="experience" slug={experience.slug} detailsHref={`/experiences/${experience.slug}`} compact /></div></article>)}</div><div className="section-space"><div className="section-header"><div><span className="eyebrow">Travel by interest</span><h2>Small moments, big memories.</h2></div><p>Every experience is shown with the practical details that help you decide: timing, location, season and what is included.</p></div><div className="featured-grid">{experiences.slice(0, 3).map((experience) => <article className="detail-card experience-mini" key={experience.slug}><span className="eyebrow">{experience.category}</span><h3>{experience.name}</h3><p>{experience.description}</p><Link className="text-link" href={`/experiences/${experience.slug}`}>View details <ArrowRight size={13} /></Link></article>)}</div></div></div><MediaFallback /></main></>;
}

export function ExperienceDetail({ experience }: { experience: typeof experiences[number] }) {
  return <><PageIntro eyebrow={`${experience.category.toUpperCase()} · SAMPLE EXPERIENCE`} title={experience.name} description={experience.description} /><main className="page-main" data-reveal><div className="page-wrap detail-layout"><div><div className="detail-hero-image" style={{ backgroundImage: `url(${experience.image})` }} /><div className="detail-card detail-overview"><span className="eyebrow">Your day on the water</span><h2>Made for curious travellers.</h2><p>Meet your local guide, understand the conditions and take the pace that suits you. This sample experience page is ready for sessions, capacity, waivers, verified reviews and partner pricing.</p><div className="detail-list"><div><strong>Duration</strong><span>{experience.duration}</span></div><div><strong>From</strong><span><Price usd={experience.price} suffix="/ person" /></span></div><div><strong>Pick-up</strong><span>Island or resort jetty</span></div><div><strong>Season</strong><span>Year-round, conditions permitting</span></div></div></div></div><aside className="detail-card sticky-card"><div className="price-line"><div><strong><Price usd={experience.price} /></strong><span> / person estimate</span></div></div><p>Sample experience. The partner confirms dates, capacity, final prices and cancellation terms.</p><AffiliateBookingAction productType="experience" slug={experience.slug} detailsHref="/experiences" /><div className="note-box">No spot is reserved on Maldives.org. Booking and payment take place only on the named partner website.</div></aside></div><MediaFallback /></main></>;
}

export function GuidesPage() {
  return <><PageIntro eyebrow="TRAVEL GUIDES" title="Go with a little more context." description="Useful notes for choosing an atoll, getting from the airport to the jetty and knowing what island life feels like before you arrive." /><main className="page-main"><div className="page-wrap article-list">{guides.map((guide) => <Link className="article-card" key={guide.slug} href={`/guides/${guide.slug}`}><div className="article-image" style={{ "--card-image": `url(${guide.image})` } as React.CSSProperties} /><div><span className="eyebrow">{guide.eyebrow}</span><h3>{guide.title}</h3><p>{guide.excerpt}</p><span className="article-read">{guide.read} <ArrowUpRight size={12} /></span></div></Link>)}</div><MediaFallback /></main></>;
}

export function GuideDetail({ guide }: { guide: typeof guides[number] }) {
  return <><PageIntro eyebrow={guide.eyebrow} title={guide.title} description={guide.excerpt} /><main className="page-main"><div className="page-wrap article-layout"><article className="detail-card longform"><div className="detail-hero-image" style={{ backgroundImage: `url(${guide.image})` }} /><p className="lead">The best Maldives trip is not just about where you stay. It is about the small decisions around weather, transfers, reef life and pace that make the whole week feel lighter.</p><h2>Start with the shape of your trip.</h2><p>Use this guide as a friendly starting point, then compare stays and routes once you know what matters most. Partner details, seasonal notes and live availability will be connected here as the directory grows.</p><h2>Three things to keep in mind</h2><div className="guide-points"><div><strong>01</strong><span>Leave time for the transfer. Island geography is part of the experience.</span></div><div><strong>02</strong><span>Ask what is included. A clear total is always better than a low headline price.</span></div><div><strong>03</strong><span>Choose the island rhythm you actually enjoy, not the one that looks best in a photo.</span></div></div></article><aside className="detail-card"><span className="eyebrow">Explore next</span><h2>Make the guide practical.</h2><p>Compare stays, check routes and build a first-pass itinerary with the trip builder.</p><Link className="button button-teal full-button" href="/plan-your-trip">Plan your trip <ArrowRight size={14} /></Link><Link className="button button-ghost button-dark full-button" href="/stay" style={{ marginTop: 8 }}>Browse stays <ArrowRight size={14} /></Link></aside></div><MediaFallback /></main></>;
}

export function TransfersPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searched, setSearched] = useState(false);
  const shown = filterSampleTransferRoutes(searched ? from : "", searched ? to : "");
  function clearSearch() { setFrom(""); setTo(""); setSearched(false); }
  return <><PageIntro eyebrow="TRANSFERS" title="Make the journey part of the trip." description="Explore sample speedboat, public ferry and seaplane routes. These planning examples are not confirmed schedules, live fares or bookable services." />
    <main className="page-main" data-reveal><div className="page-wrap">
      <div className="transfer-search detail-card"><div><span className="eyebrow">Route finder</span><h2>Where are you headed?</h2></div>
        <form className="transfer-fields" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}>
          <input className="input" placeholder="From · Airport or Malé" aria-label="Starting point" value={from} maxLength={120} onChange={(event) => { setFrom(event.target.value); setSearched(false); }} />
          <input className="input" placeholder="To · Island or resort" aria-label="Destination" value={to} maxLength={120} onChange={(event) => { setTo(event.target.value); setSearched(false); }} />
          <button className="button button-teal" type="submit">Find a route <ArrowRight size={14} /></button>
        </form>
        {searched && <div className="note-box route-note" role="status">{shown.length ? `${shown.length} sample route${shown.length === 1 ? " matches" : "s match"} your search. Confirm timing and fares with an operator.` : "No sample routes match this search. Try another origin or destination."} <button type="button" className="text-link" onClick={clearSearch}>Clear route search</button></div>}
      </div>
      {shown.length ? <div className="route-list">{shown.map((route) => <Link href={`/transfers/${route.slug}`} className="route-row" key={route.slug}>
        <div><span className="eyebrow">{route.mode} · Sample route</span><strong>{route.from} <span>→</span> {route.to}</strong></div>
        <div><span>Sample duration · {route.time}</span><strong>{route.price === null ? "Fare unconfirmed" : <Price usd={route.price} suffix={route.suffix} />}</strong></div><ArrowUpRight size={15} />
      </Link>)}</div> : <div className="empty-state"><p>No matching sample transfer is listed. This does not mean that an operator has no availability.</p></div>}
      <div className="note-box route-note">All routes, durations and fares above are sample planning information. Seaplanes generally operate in daylight. Confirm the route, current timetable, fare and safety requirements with the transport provider. No transfer reservation is created here.</div>
    </div><MediaFallback /></main>
  </>;
}

export function TransferDetail({ route }: { route: SampleTransferRoute }) {
  return <><PageIntro eyebrow="SAMPLE TRANSFER ROUTE" title={`${route.from} to ${route.to}`} description={`${route.mode}. A planning example, not a confirmed schedule, live fare or bookable transport service.`} />
    <main className="page-main"><div className="page-wrap detail-layout"><section className="detail-card detail-overview"><h2>Review this route before you travel.</h2>
      <div className="detail-list"><div><strong>Starting point</strong><span>{route.from}</span></div><div><strong>Destination</strong><span>{route.to}</span></div><div><strong>Transport idea</strong><span>{route.mode}</span></div><div><strong>Sample duration</strong><span>{route.time}</span></div><div><strong>Sample fare estimate</strong><span>{route.price === null ? "Not confirmed" : <Price usd={route.price} suffix={route.suffix} />}</span></div></div>
      <p>Ask the operator to confirm the departure point, timetable, journey duration, baggage allowance, price and weather cancellation policy. These sample details do not confirm availability.</p>
      <Link className="text-link" href="/transfers">Compare sample routes <ArrowRight size={14} /></Link>
    </section><aside className="detail-card"><span className="eyebrow">EXTERNAL TRANSPORT PROVIDER</span><h2>Confirm directly with an operator.</h2><p>No approved transfer booking link is connected to this sample route. Reservations and payment must be completed with a verified transport provider.</p><button type="button" className="button button-teal full-button" disabled>Transfer booking unavailable</button></aside></div><MediaFallback /></main>
  </>;
}

export function TripBuilder() {
  const [step, setStep] = useState(1);
  const [style, setStyle] = useState("Honeymoon");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [travellers, setTravellers] = useState("2");
  const [error, setError] = useState("");
  const styles = ["Honeymoon", "Family", "Budget", "Diving"];
  const partySizes = ["2", "3", "4", "5+"];
  function showTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCalendarDate(arrival) || !isCalendarDate(departure)) { setError("Enter valid arrival and departure dates."); return; }
    if (!isValidDateRange(arrival, departure)) { setError("Departure must be after arrival."); return; }
    if (!partySizes.includes(travellers)) { setError("Choose the number of travellers."); return; }
    setError(""); setStep(3);
  }
  return <><PageIntro eyebrow="PLAN YOUR TRIP" title="Build the Maldives that fits you." description="Choose your travel style and dates to make a first-pass planning preview. These preferences do not search live inventory or create a reservation." />
    <main className="page-main"><div className="page-wrap trip-builder">
      <div className="builder-progress"><span className={step >= 1 ? "active" : ""} aria-current={step === 1 ? "step" : undefined}>01</span><i /><span className={step >= 2 ? "active" : ""} aria-current={step === 2 ? "step" : undefined}>02</span><i /><span className={step >= 3 ? "active" : ""} aria-current={step === 3 ? "step" : undefined}>03</span></div>
      {step === 1 && <div className="builder-step"><span className="eyebrow">First, the feeling</span><h2>What kind of trip are you imagining?</h2><div className="style-grid">{styles.map((item) => <button type="button" key={item} className={`style-option ${style === item ? "selected" : ""}`} aria-pressed={style === item} onClick={() => setStyle(item)}><span>{item === "Honeymoon" ? "✦" : item === "Family" ? "◒" : item === "Budget" ? "⌁" : "◌"}</span>{item}<small>{item === "Honeymoon" ? "Private, slow, special" : item === "Family" ? "Easy days for everyone" : item === "Budget" ? "More island, less fuss" : "Reef-first adventures"}</small></button>)}</div><button type="button" className="button button-teal" onClick={() => setStep(2)}>Continue <ArrowRight size={14} /></button></div>}
      {step === 2 && <form className="builder-step" noValidate onSubmit={showTrip}><span className="eyebrow">Now, the details</span><h2>When will you be travelling?</h2><div className="builder-fields">
        <label className="field-label">Arrival date<input className="input" type="date" value={arrival} required aria-describedby={error ? "trip-details-error" : undefined} aria-invalid={Boolean(error) && !isValidDateRange(arrival, departure)} onChange={(event) => { setArrival(event.target.value); setError(""); }} /></label>
        <label className="field-label">Departure date<input className="input" type="date" value={departure} required aria-describedby={error ? "trip-details-error" : undefined} aria-invalid={Boolean(error) && !isValidDateRange(arrival, departure)} onChange={(event) => { setDeparture(event.target.value); setError(""); }} /></label>
        <label className="field-label">Travellers<select className="input" aria-label="Travellers" value={travellers} onChange={(event) => { setTravellers(event.target.value); setError(""); }}>{partySizes.map((size) => <option key={size} value={size}>{size} travellers</option>)}</select></label>
      </div>{error && <p id="trip-details-error" className="note-box" role="alert">{error}</p>}<div className="builder-actions"><button type="button" className="button button-ghost button-dark" onClick={() => { setError(""); setStep(1); }}>Back</button><button type="submit" className="button button-teal">Show my trip <ArrowRight size={14} /></button></div></form>}
      {step === 3 && <div className="builder-step"><span className="eyebrow">Your first pass · Sample planning ideas</span><h2>A {style.toLowerCase()} escape, starting here.</h2>
        <div className="note-box" role="status"><strong>Your planning preferences</strong><p>Arrival: <time dateTime={arrival}>{arrival}</time> · Departure: <time dateTime={departure}>{departure}</time> · {travellers} travellers.</p><p>These sample ideas are not date-specific availability, confirmed routes or a booked itinerary.</p></div>
        <div className="suggestion-plan"><div><span className="eyebrow">Sample stay idea</span><strong>{style === "Budget" ? "Coral Garden House" : "Overwater Romance"}</strong><p>Sample estimate · <Price usd={style === "Budget" ? 92 : 480} suffix="/ night" /></p></div><div><span className="eyebrow">Sample transfer idea</span><strong>{style === "Budget" ? "Public ferry" : "Seaplane"}</strong><p>Route and timetable require confirmation</p></div><div><span className="eyebrow">Sample experience idea</span><strong>{style === "Diving" ? "Dive with manta rays" : "Sunset cruise"}</strong><p>Not an operator-confirmed tour</p></div></div>
        <div className="builder-actions"><button type="button" className="button button-ghost button-dark" onClick={() => setStep(2)}>Back</button><Link className="button button-sun" href="/stay">Browse stays <ArrowRight size={14} /></Link></div>
      </div>}
    </div><MediaFallback /></main>
  </>;
}

export function ContentPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <><PageIntro eyebrow={eyebrow} title={title} description={description} /><main className="page-main" data-reveal><div className="page-wrap content-page">{children}</div><MediaFallback /></main></>; }
