"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, SearchIcon } from "@/components/icons";
import { parseTourFilters, VIATOR_PAGE_SIZE, viatorCategories, viatorCurrencies, type TourFilters, type TourResults, type ViatorTour } from "@/lib/tours/viator-data";
import { ViatorPhoto } from "./viator-photo";
import { ViatorWidget } from "./viator-widget";
import styles from "./tours.module.css";

type PublicTour = Omit<ViatorTour, "bookingUrl"> & { hasBookingLink: boolean };
type PublicResults = Omit<TourResults, "tours"> & { tours: PublicTour[] };
const queryString = (filters: TourFilters) => {
  const params = new URLSearchParams({ currency: filters.currency });
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.duration !== null) params.set("duration", String(filters.duration));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
};

export function ViatorTours({ initialFilters }: { initialFilters: TourFilters }) {
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState(initialFilters);
  const [validation, setValidation] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [remote, setRemote] = useState<{ key: string; data: PublicResults | null; error: string }>({ key: "", data: null, error: "" });
  const query = queryString(filters), key = `${query}:${attempt}`;
  const loading = remote.key !== key, data = loading ? null : remote.data;
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 22000);
    fetch(`/api/tours/viator?${query}`, { signal: controller.signal }).then(async response => {
      const payload = await response.json();
      if (!response.ok || payload.ok !== true || !Array.isArray(payload.tours)) throw new Error(typeof payload.message === "string" ? payload.message : "Viator tour search is unavailable. Please try again.");
      if (active) setRemote({ key, data: payload, error: "" });
    }).catch(error => {
      if (active) setRemote({ key, data: null, error: error instanceof Error && error.name !== "AbortError" ? error.message : "Tour search timed out. Please retry or use the original widget." });
    }).finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [key, query]);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      const nativeParams = new URLSearchParams();
      for (const name of ["q", "category", "currency", "maxPrice", "duration", "sort", "page"]) if (params.has(name)) nativeParams.set(name, params.get(name)!);
      const restored = parseTourFilters(nativeParams);
      if (restored) { setFilters(restored); setDraft(restored); setValidation(""); }
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function apply(next: TourFilters) {
    const parsed = parseTourFilters(new URLSearchParams(queryString(next)));
    if (!parsed) { setValidation("Check your search, price and filter values."); return; }
    setValidation(""); setDraft(parsed); setFilters(parsed);
    const url = new URL(location.href);
    for (const name of ["q", "category", "currency", "maxPrice", "duration", "sort", "page"]) url.searchParams.delete(name);
    new URLSearchParams(queryString(parsed)).forEach((value, name) => url.searchParams.set(name, value));
    window.history.replaceState(window.history.state, "", url.href);
  }
  const reset = () => apply({ ...initialFilters, q: "", category: "", maxPrice: null, duration: null, sort: "recommended", page: 1, currency: filters.currency });
  const hasNext = data && filters.page < 100 && (data.total !== null ? filters.page * VIATOR_PAGE_SIZE < data.total : data.tours.length === VIATOR_PAGE_SIZE);
  return <section className={`page-wrap ${styles.collection}`} id="viator-tours" aria-labelledby="native-tours-title">
    <div className={styles.viatorHeading}><div><span className={styles.category}>POWERED BY VIATOR</span><h2 id="native-tours-title">Find your Maldives experience</h2></div><span className={styles.providerBadge}>Viator</span></div>
    <p className={styles.widgetDisclosure}>Explore real tours supplied by Viator. View details here, then check final availability and book on Viator in a new tab. Maldives.org may earn a commission. <Link href="/affiliate-disclosure">About partner links</Link>.</p>
    <form onSubmit={event => { event.preventDefault(); apply({ ...draft, page: 1 }); }} aria-label="Filter Viator tours">
      <div className={styles.controls}><label className={styles.search}><SearchIcon size={19}/><span className="sr-only">Search Viator tours</span><input type="search" placeholder="Search activities" maxLength={120} value={draft.q} onChange={event => setDraft({ ...draft, q: event.target.value })}/></label>
        <div className={styles.categories} role="group" aria-label="Viator tour categories">{["", ...Object.keys(viatorCategories)].map(category => <button type="button" key={category} aria-pressed={filters.category === category} onClick={() => apply({ ...draft, category, page: 1 })}>{category || "All activities"}</button>)}</div></div>
      <div className={styles.nativeFilters}>
        <label>Currency<select value={draft.currency} onChange={event => setDraft({ ...draft, currency: event.target.value as TourFilters["currency"], maxPrice: null })}>{viatorCurrencies.map(code => <option key={code}>{code}</option>)}</select></label>
        <label>Maximum price ({draft.currency})<input type="number" min="0.01" max="100000" step="0.01" placeholder="Any budget" value={draft.maxPrice ?? ""} onChange={event => setDraft({ ...draft, maxPrice: event.target.value ? Number(event.target.value) : null })}/></label>
        <label>Duration<select value={draft.duration ?? ""} onChange={event => setDraft({ ...draft, duration: event.target.value ? Number(event.target.value) : null })}><option value="">Any duration</option><option value="120">Up to 2 hours</option><option value="240">Up to 4 hours</option><option value="480">Up to 8 hours</option></select></label>
        <label>Sort by<select value={draft.sort} onChange={event => setDraft({ ...draft, sort: event.target.value })}><option value="recommended">Recommended</option><option value="price-asc">Price: low to high</option><option value="rating-desc">Highest rated</option></select></label>
        <button className="button button-teal" type="submit">Search tours <ArrowRight size={15}/></button>
      </div>
      {validation && <p role="alert">{validation}</p>}
    </form>
    <div className={styles.results}><p role="status" aria-live="polite">{loading ? "Searching Viator tours…" : remote.error ? remote.error : data?.sandbox ? "Sandbox test data — not live inventory or bookable offers" : `${data?.total !== null && data?.total !== undefined ? `${data.total} tours match` : "Viator tours"} · page ${filters.page} · ${filters.currency}`}</p><button type="button" onClick={reset}>Clear tour filters</button></div>
    {!loading && remote.error && <div className={styles.empty}><h3>Tour search is unavailable right now.</h3><p>The activity guides and original Viator widget remain available below.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Retry tour search</button></div>}
    {data && !data.tours.length && <div className={styles.empty}><h3>No tours match these filters.</h3><p>Try another activity, category or budget.</p><button type="button" onClick={reset}>Show all tours</button></div>}
    {data && data.tours.length > 0 && <div className={`${styles.grid} ${styles.nativeGrid}`}>{data.tours.map(tour => <article className={styles.card} key={tour.code}>
      <Link prefetch={false} href={`/tours-and-activities/viator/${tour.code}`} className={styles.artLink} aria-label={`View ${tour.title}`}><ViatorPhoto src={tour.image} title={tour.title}/></Link>
      <div className={styles.cardBody}><p className={styles.category}>Viator · Maldives</p><h3><Link prefetch={false} href={`/tours-and-activities/viator/${tour.code}`}>{tour.title}</Link></h3>
        <p className={styles.nativeDescription}>{tour.description}</p>
        <div className={styles.tourFacts}>{tour.rating !== null && <span>★ {tour.rating.toFixed(1)}{tour.reviews !== null ? ` (${tour.reviews} reviews · Viator)` : " · Viator"}</span>}{tour.durationMinutes !== null && <span>{tour.durationMinutes < 60 ? `${tour.durationMinutes} minutes` : `${Math.round(tour.durationMinutes / 6) / 10} hours`}</span>}</div>
        <p className={styles.tourPrice}>{tour.price !== null && tour.currency ? <>From {new Intl.NumberFormat("en-US", { style: "currency", currency: tour.currency }).format(tour.price)} <small>{tour.currency} · indicative price</small></> : "Check current price on Viator"}</p>
        <Link prefetch={false} className={styles.textLink} href={`/tours-and-activities/viator/${tour.code}`}>View tour details <ArrowRight size={16}/></Link>
      </div></article>)}</div>}
    {data && <nav className={styles.pagination} aria-label="Viator tour pages"><button type="button" disabled={filters.page === 1} onClick={() => apply({ ...filters, page: filters.page - 1 })}>Previous tours</button><span>Page {filters.page}</span><button type="button" disabled={!hasNext} onClick={() => apply({ ...filters, page: filters.page + 1 })}>Next tours</button></nav>}
    <p className={styles.notice}>Powered by Viator. Starting prices and reviews are supplied by Viator; this search does not confirm date-specific availability or reserve a place. Final prices, terms, payment and confirmation are provided by Viator.</p>
    <details className={styles.widgetFallback} onToggle={event => setWidgetOpen(event.currentTarget.open)}><summary>Use the original Viator widget instead</summary>{widgetOpen && <ViatorWidget/>}</details>
  </section>;
}
