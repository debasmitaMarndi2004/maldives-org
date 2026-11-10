"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/data";
import { ChevronDown, CloseIcon, MenuIcon } from "@/components/icons";
import { supportedCurrencies } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const open = menuPath === pathname;
  const { currency, setCurrency, isLoading, isEstimated } = useCurrency();
  const lightNav = pathname !== "/" && !pathname.startsWith("/partner") && !pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuPath(null); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className={`navbar ${lightNav ? "navbar-light" : ""} ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="page-wrap nav-inner">
        <Link className="brand" href="/" aria-label="Maldives.org home">Maldives<span>.org</span></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="nav-actions">
          <label className="currency-select"><span className="sr-only">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} aria-label="Currency" title={isEstimated ? "Estimated display rates; the partner confirms charges" : "Display currency; the partner confirms charges"} aria-busy={isLoading}>{supportedCurrencies.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>
          <Link href="/plan-your-trip" className="nav-cta">Plan Your Trip</Link>
        </div>
        <button className="mobile-menu-btn" type="button" ref={menuButton} onClick={() => setMenuPath(open ? null : pathname)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <CloseIcon /> : <MenuIcon />}</button>
      </div>
      {open && <div className="mobile-drawer" id="mobile-navigation"><div className="mobile-currency"><span>Display currency</span><label className="currency-select"><span className="sr-only">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} aria-label="Mobile currency" aria-busy={isLoading}>{supportedCurrencies.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label></div><p className="currency-note" role="status">{isLoading ? "Updating display rates…" : isEstimated ? "Estimated exchange rates. Partner prices may differ." : "Display rates only. The partner confirms the final price."}</p><nav aria-label="Mobile navigation">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuPath(null)}>{item.label}<span aria-hidden="true">↗</span></Link>)}<Link className="drawer-cta" href="/plan-your-trip" onClick={() => setMenuPath(null)}>Plan Your Trip <span aria-hidden="true">↗</span></Link></nav></div>}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-wrap footer-grid">
        <div><Link className="brand footer-brand" href="/">Maldives<span>.org</span></Link><p>Discover. Compare.<br />Book. Experience.</p></div>
        <div><div className="footer-label">Explore</div><Link href="/stay">Resorts & stays</Link><Link href="/experiences">Experiences</Link><Link href="/guides">Travel guides</Link><Link href="/deals">Deals</Link><Link href="/how-it-works">How it works</Link></div>
        <div><div className="footer-label">Maldives</div><Link href="/transfers">Transfers</Link><Link href="/atolls">Atolls & islands</Link><Link href="/about">About us</Link><Link href="/contact">Contact</Link><Link href="/affiliate-disclosure">Partner disclosure</Link></div>
        <div><div className="footer-label">Stay in the loop</div><p className="footer-small">Island notes, thoughtful stays and good reasons to go.</p><Link className="footer-arrow" href="/#newsletter">Join the newsletter <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="page-wrap footer-bottom"><span>© 2026 Maldives.org</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></div><span>Made for the curious.</span></div>
    </footer>
  );
}
