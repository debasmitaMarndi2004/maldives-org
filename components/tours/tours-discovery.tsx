"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, SearchIcon } from "@/components/icons";
import { filterTourIdeas, tourCategories } from "@/lib/tours/ideas";
import { ActivityArt } from "./activity-art";
import styles from "./tours.module.css";

export function ToursDiscovery({ initialQuery, initialCategory }: { initialQuery: string; initialCategory: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const shown = filterTourIdeas(query, category);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      setQuery((params.get("q") || "").slice(0, 120));
      setCategory(tourCategories.includes(params.get("category") || "") ? params.get("category")! : "");
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  function update(q: string, nextCategory: string) {
    setQuery(q); setCategory(nextCategory);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q);
    if (nextCategory) params.set("category", nextCategory);
    window.history.replaceState(window.history.state, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`);
  }
  return <main className={styles.page}>
    <section className={`page-wrap ${styles.hero}`}>
      <div><h1>Tours &amp; activities<br/>in the Maldives</h1><p>Find your kind of island adventure. Explore ideas for reef days, sunset sails and local island discoveries.</p><a href="#tour-ideas" className={styles.heroLink}>Explore activities <ArrowRight size={18}/></a></div>
      <ActivityArt tile={5} className={styles.heroArt} label="Illustrative sea turtle and coral reef"/>
    </section>
    <section className={`page-wrap ${styles.collection}`} id="tour-ideas" aria-label="Explore activity ideas">
      <div className={styles.controls}>
        <label className={styles.search}><SearchIcon size={19}/><span className="sr-only">Search activities</span><input type="search" placeholder="Search activities" maxLength={120} value={query} onChange={(e) => update(e.target.value, category)}/></label>
        <div className={styles.categories} role="group" aria-label="Activity categories">{["", ...tourCategories].map((value) => <button key={value} type="button" aria-pressed={category === value} onClick={() => update(query, value)}>{value || "All activities"}</button>)}</div>
      </div>
      <div className={styles.results}><p role="status" aria-live="polite">{shown.length} activity {shown.length === 1 ? "idea" : "ideas"} · not live tour availability</p>{(query || category) && <button type="button" onClick={() => update("", "")}>Clear filters</button>}</div>
      {shown.length ? <div className={styles.grid}>{shown.map((idea) => <article className={styles.card} key={idea.slug}>
        <Link href={`/tours-and-activities/${idea.slug}`} className={styles.artLink} aria-label={`Explore ${idea.name}`}><ActivityArt tile={idea.tile} className={styles.cardArt}/><span>Illustrative imagery</span></Link>
        <div className={styles.cardBody}><p className={styles.category}>{idea.category}</p><h2><Link href={`/tours-and-activities/${idea.slug}`}>{idea.name}</Link></h2><p>{idea.description}</p><Link className={styles.textLink} href={`/tours-and-activities/${idea.slug}`}>Explore idea <ArrowRight size={16}/></Link></div>
      </article>)}</div> : <div className={styles.empty}><h2>Find another kind of adventure.</h2><p>No activity ideas match these filters. Try another search or clear the category.</p><button type="button" onClick={() => update("", "")}>Show all activities</button></div>}
      <p className={styles.notice}>These are editorial activity ideas, not confirmed operator products. Prices, schedules, availability and booking links have not been connected to these guides.</p>
    </section>
    <section className={styles.planning}><div className="page-wrap"><h2>Plan a little. Experience more.</h2><div className={styles.planningGrid}>
      <div><h3>Choose your pace</h3><p>From reef adventures to slow, scenic days, pick the kind of experience that fits your travel style.</p></div>
      <div><h3>Check the conditions</h3><p>Sea and weather conditions can change the plan. Confirm safety requirements and inclusions with an operator.</p></div>
      <div><h3>Book with an operator</h3><p>Final availability, reservations and payments belong with the selected travel provider, when approved links are available.</p></div>
    </div></div></section>
  </main>;
}
