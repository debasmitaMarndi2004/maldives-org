"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, CloseIcon, MenuIcon, SearchIcon, SunIcon } from "@/components/icons";
import { useCurrency } from "@/components/currency-provider";
import { experiences, guides, properties } from "@/lib/data";
import { supportedCurrencies } from "@/lib/currency";
import styles from "./home-navbar.module.css";

const menuLinks = [
  { label: "Stay", href: "/stay" },
  { label: "Experiences", href: "/tours-and-activities" },
  { label: "Travel Guides", href: "/guides" },
  { label: "Islands", href: "/atolls" },
  { label: "Deals", href: "/deals" },
  { label: "Plan Your Trip", href: "/plan-your-trip" },
];
const islandLinks = [
  { name: "Malé", href: "/islands/male" },
  { name: "Maafushi", href: "/islands/maafushi" },
  { name: "Hulhumalé", href: "/islands/hulhumale" },
  { name: "Dhigurah", href: "/islands/dhigurah" },
];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function MaldivesNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    const start = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);
    return () => { window.clearTimeout(start); window.clearInterval(interval); };
  }, []);
  const time = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", hour: "numeric", minute: "2-digit" }).format(now) : "—";
  const date = now ? new Intl.DateTimeFormat("en-US", { timeZone: "Indian/Maldives", month: "short", day: "numeric" }).format(now) : "—";
  return <div className={styles.now}><SunIcon size={22} /><div><strong>Maldives now · Malé</strong><span>{time} · {date} · 28°C · Sample weather</span></div></div>;
}

export function HomeNavbar() {
  const [panel, setPanel] = useState<"menu" | "explore" | "business" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const header = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const { currency, setCurrency, isLoading, isEstimated } = useCurrency();
  const router = useRouter();
  const results = useMemo(() => {
    const all = [...islandLinks, ...properties.map(p => ({ name: p.name, href: `/stay/${p.slug}` })), ...experiences.map(e => ({ name: e.name, href: `/experiences/${e.slug}` })), ...guides.map(g => ({ name: g.title, href: `/guides/${g.slug}` }))];
    const term = normalize(query.trim());
    return (term ? all.filter(item => normalize(item.name).includes(term)) : islandLinks).slice(0, 6);
  }, [query]);

  useEffect(() => {
    if (!panel) return;
    const focus = window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a,button,select")?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPanel(null); opener.current?.focus(); }
      if (event.key === "Tab") {
        const elements = panelRef.current?.querySelectorAll<HTMLElement>("a[href],button,select");
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !header.current?.contains(event.target)) setPanel(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", outside);
    return () => { window.cancelAnimationFrame(focus); document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", outside); };
  }, [panel]);

  useEffect(() => {
    if (searchOpen && !dialog.current?.open) dialog.current?.showModal();
  }, [searchOpen]);

  const toggle = (next: "menu" | "explore" | "business", button: HTMLButtonElement) => {
    opener.current = button;
    setPanel(current => current === next ? null : next);
  };
  const closeSearch = () => { dialog.current?.close(); setSearchOpen(false); searchButton.current?.focus(); };
  function submit(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    const exact = results.find(item => normalize(item.name) === normalize(term));
    closeSearch();
    router.push(exact?.href ?? `/stay?q=${encodeURIComponent(term)}`);
  }

  return <header ref={header} className={styles.header}>
    <div className={styles.inner}>
      <Link className={styles.brand} href="/" aria-label="Maldives.org home">Maldives<span>.org</span></Link>
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        <button type="button" onClick={e => toggle("explore", e.currentTarget)} aria-expanded={panel === "explore"} aria-controls="home-explore-menu">Explore Maldives <ChevronDown size={13} /></button>
        <Link href="/stay">Resorts &amp; Hotels</Link><Link href="/tours-and-activities">Tours &amp; Activities</Link><Link href="/atolls">Islands</Link><Link href="/guides">Travel Guide</Link>
        <button type="button" onClick={e => toggle("business", e.currentTarget)} aria-expanded={panel === "business"} aria-controls="home-business-note">Business Directory</button>
      </nav>
      <div className={styles.actions}>
        <button type="button" ref={searchButton} className={styles.iconButton} aria-label="Search Maldives" aria-expanded={searchOpen} aria-controls="home-search-dialog" onClick={() => { setPanel(null); setSearchOpen(true); }}><SearchIcon size={24} /></button>
        <button type="button" className={styles.iconButton} aria-label={panel === "menu" ? "Close menu" : "Open menu"} aria-expanded={panel === "menu"} aria-controls="home-menu" onClick={e => toggle("menu", e.currentTarget)}>{panel === "menu" ? <CloseIcon size={25} /> : <MenuIcon size={25} />}</button>
      </div>
    </div>
    {panel && <div ref={panelRef} className={`${styles.panel} ${panel === "menu" ? styles.menuPanel : ""}`} id={panel === "menu" ? "home-menu" : panel === "explore" ? "home-explore-menu" : "home-business-note"}>
      {panel === "explore" ? <nav aria-label="Explore Maldives"><Link href="/about">About the Maldives</Link><Link href="/atolls">Atolls &amp; islands</Link><Link href="/guides">Travel guides</Link><Link href="/transfers">Getting around</Link></nav> : panel === "business" ? <><p role="status">The business directory is not available yet.</p><button type="button" className={styles.closePanel} onClick={() => { setPanel(null); opener.current?.focus(); }}>Close <CloseIcon size={16} /></button></> : <>
        <div className={styles.menuTop}><strong>Explore Maldives</strong><button type="button" className={styles.closePanel} onClick={() => { setPanel(null); opener.current?.focus(); }} aria-label="Close navigation"><CloseIcon size={20} /></button></div>
        <nav aria-label="Mobile navigation">{menuLinks.map(item => <Link key={item.href} href={item.href} onClick={() => setPanel(null)}>{item.label}<span aria-hidden="true">↗</span></Link>)}</nav>
        <div className={styles.currencyRow}><label htmlFor="home-currency">Display currency</label><select id="home-currency" aria-label="Mobile currency" value={currency} onChange={e => setCurrency(e.target.value as typeof currency)} aria-busy={isLoading}>{supportedCurrencies.map(code => <option key={code}>{code}</option>)}</select></div>
        <p className={styles.currencyNote} role="status">{isLoading ? "Updating display rates…" : isEstimated ? "Estimated display rates. Partner prices may differ." : "Display currency only. The booking provider confirms final charges."}</p>
        <MaldivesNow />
      </>}
    </div>}
    <dialog ref={dialog} id="home-search-dialog" className={styles.searchDialog} aria-labelledby="home-search-title" onClose={() => { setSearchOpen(false); searchButton.current?.focus(); }} onCancel={() => setSearchOpen(false)} onClick={e => { if (e.target === dialog.current) closeSearch(); }}>
      <div className={styles.searchTop}><h2 id="home-search-title">Find your Maldives</h2><button type="button" className={styles.iconButton} onClick={closeSearch} aria-label="Close search"><CloseIcon size={22} /></button></div>
      <form className={styles.searchForm} onSubmit={submit}><label className="sr-only" htmlFor="home-search-input">Search resorts, islands or experiences</label><input id="home-search-input" name="q" autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search resorts, islands or experiences" /><button type="submit" aria-label="Search stays"><SearchIcon size={21} /></button></form>
      <nav className={styles.searchResults} aria-label="Search suggestions">{results.map(item => <Link key={item.href} href={item.href} onClick={closeSearch}>{item.name}<span aria-hidden="true">↗</span></Link>)}{!results.length && <p>No matching suggestions. Press Search to browse stays.</p>}</nav>
    </dialog>
  </header>;
}
