"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, SearchIcon } from "@/components/icons";
import { properties } from "@/lib/data";
import { accommodations, accommodationAmenities, accommodationAtolls, accommodationIslands, accommodationKinds, type AccommodationKind } from "@/lib/accommodations/catalog";
import { accommodationFilterQuery, emptyFilters, filterAccommodations, parseAccommodationFilters, type AccommodationFilters } from "@/lib/accommodations/search";
import styles from "./discovery.module.css";

export function AccommodationDirectory({ initialFilters, category }: { initialFilters: AccommodationFilters; category?: AccommodationKind }) {
  const [filters, setFilters] = useState(initialFilters);
  const [map, setMap] = useState(false);
  const shown = useMemo(() => filterAccommodations(filters), [filters]);
  useEffect(() => {
    const restore = () => setFilters(parseAccommodationFilters(new URLSearchParams(location.search), category));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [category]);
  function change(next: AccommodationFilters) {
    setFilters(next);
    const query = accommodationFilterQuery(next, category);
    window.history.replaceState(window.history.state, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }
  const update = (key: keyof AccommodationFilters, value: string) => change({ ...filters, [key]: value });
  const reset = () => { change({ ...emptyFilters, type: category || "" }); setMap(false); };
  const activeCount = Number(Boolean(filters.q)) + Number(Boolean(filters.island)) + Number(Boolean(filters.atoll)) + Number(Boolean(filters.type && !category)) + filters.amenities.length;

  return <main className={styles.discovery}>
    <section className={styles.intro}>
      <div className="page-wrap">
        <span className="eyebrow">STAY IN THE MALDIVES</span>
        <h1>{category === "Resort" ? "Find your island resort." : category === "Guesthouse" ? "Discover local island stays." : <>Hotels &amp; resorts,<br/>your island way.</>}</h1>
        <p>From local island hotels to an escape over the water. Explore the setting, compare documented features, and choose where your Maldives story begins.</p>
        <div className={styles.promise}><span>Source-reviewed property facts</span><span>No live-price claims</span><span>Booking stays with the partner</span></div>
      </div>
    </section>
    <section className={`page-wrap ${styles.content}`} aria-label="Accommodation discovery">
      <nav className={styles.categories} aria-label="Accommodation categories">
        {[{ href: "/stay", name: "All stays", current: !filters.type }, { href: "/resorts", name: "Resorts", current: filters.type === "Resort" }, { href: "/stay?type=Hotel", name: "Hotels", current: filters.type === "Hotel" }, { href: "/guesthouses", name: "Guesthouses", current: filters.type === "Guesthouse" }].map((c) => <Link key={c.name} href={c.href} aria-current={c.current ? "page" : undefined}>{c.name}</Link>)}
      </nav>
      <form className={styles.filters} onSubmit={(e) => e.preventDefault()} aria-label="Filter accommodations">
        <label className={styles.search}><span>Find your stay</span><div><SearchIcon size={18}/><input type="search" placeholder="Search stays or islands" aria-label="Search stays" value={filters.q} maxLength={120} onChange={(e) => update("q", e.target.value)}/></div></label>
        <label><span>Island</span><select aria-label="Island" value={filters.island} onChange={(e) => update("island", e.target.value)}><option value="">All islands</option>{accommodationIslands.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label><span>Atoll</span><select aria-label="Atoll" value={filters.atoll} onChange={(e) => update("atoll", e.target.value)}><option value="">All atolls</option>{accommodationAtolls.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label><span>Accommodation type</span><select aria-label="Accommodation type" value={filters.type} disabled={Boolean(category)} onChange={(e) => update("type", e.target.value)}><option value="">All types</option>{accommodationKinds.map((v) => <option key={v}>{v}</option>)}</select></label>
        <details className={styles.amenityFilters}><summary>Amenities {filters.amenities.length ? `(${filters.amenities.length})` : ""}</summary><fieldset><legend className="sr-only">Documented amenities</legend>{accommodationAmenities.map((amenity) => <label key={amenity}><input type="checkbox" checked={filters.amenities.includes(amenity)} onChange={(e) => change({ ...filters, amenities: e.target.checked ? [...filters.amenities, amenity] : filters.amenities.filter((v) => v !== amenity) })}/><span>{amenity}</span></label>)}</fieldset></details>
      </form>
      <div className={styles.toolbar} id="results">
        <div role="status" aria-live="polite"><strong>{shown.length} {shown.length === 1 ? "stay" : "stays"} to explore</strong><small>Editorial discovery · not an availability search</small></div>
        <div className={styles.tools}>
          {activeCount > 0 && <button type="button" onClick={reset}>Clear filters ({activeCount})</button>}
          <label><span className="sr-only">Sort stays</span><select aria-label="Sort stays" value={filters.sort} onChange={(e) => update("sort", e.target.value)}><option value="name">Name: A–Z</option><option value="name-desc">Name: Z–A</option></select></label>
          <button type="button" aria-pressed={!map} onClick={() => setMap(false)}>List</button><button type="button" aria-pressed={map} onClick={() => setMap(true)}>Map</button>
        </div>
      </div>
      {map ? <div className={styles.empty}><span className="eyebrow">Map preview</span><h2>Explore the islands, one stay at a time.</h2><p>An interactive accommodation map is not connected. No map inventory or availability is being simulated.</p><button className="button button-teal" type="button" onClick={() => setMap(false)}>Back to list <ArrowRight size={16}/></button></div> : shown.length ? <div className={`directory-grid ${styles.grid}`}>{shown.map((property) => <article className={`stay-card ${styles.card}`} key={property.slug}>
        <Link href={`/stay/${property.slug}`} className={styles.cardImage} aria-label={`Explore ${property.name}`} style={{ backgroundImage: `url(${property.illustration})` }}><span>{property.kind}</span></Link>
        <div className={styles.cardBody}><small className={styles.imageNote}>Illustrative setting · not a property photograph</small><p className={styles.location}>{property.island}{property.atoll ? ` · ${property.atoll}` : ""}</p><h2><Link href={`/stay/${property.slug}`}>{property.name}</Link></h2><p>{property.description}</p><ul className={styles.tags}>{property.amenities.slice(0, 3).map((v) => <li key={v}>{v}</li>)}</ul><Link href={`/stay/${property.slug}`} className={styles.cardAction}>Explore stay <ArrowUpRight size={17}/></Link></div>
      </article>)}</div> : <div className={styles.empty}><h2>{category === "Guesthouse" ? "Verified guesthouse listings are on their way." : "A different island might be your island."}</h2><p>No stays match this search yet. Try another island, style or budget.</p><p>Only source-reviewed properties are included. We do not fill gaps with sample hotels or simulated availability.</p><button className="button button-teal" type="button" onClick={reset}>Clear filters</button>{category && <Link className={styles.cardAction} href="/stay">Explore all stays <ArrowRight size={16}/></Link>}</div>}
      <aside className={styles.disclosure}><div><span className="eyebrow">A CLEARER WAY TO EXPLORE</span><h2>Discover here. Book with your provider.</h2></div><p>Property facts are reviewed against official sources, not a live inventory feed. Prices, dates, room availability and cancellation terms are confirmed by the external booking partner. Some approved links may earn Maldives.org a commission. <Link href="/affiliate-disclosure">How partner links work <ArrowRight size={14}/></Link></p></aside>
      <details className={styles.legacy}><summary>Existing sample listing previews</summary><p>These older layouts are preserved for reference. Their sample prices, ratings and names are not verified accommodation inventory.</p><ul>{properties.filter((p) => !category || p.kind === category).map((p) => <li key={p.slug}><Link href={`/stay/${p.slug}`}>{p.name} · sample preview</Link></li>)}</ul></details>
      <p className={styles.catalogNote}>{accommodations.length} source-reviewed properties in this initial collection. No verified guesthouses are published yet; the collection can grow without changing booking providers.</p>
    </section>
  </main>;
}
