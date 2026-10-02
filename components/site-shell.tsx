"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/data";
import { ChevronDown, CloseIcon, MenuIcon } from "@/components/icons";
import { supportedCurrencies } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { currency, setCurrency, isLoading } = useCurrency();
  const lightNav = pathname !== "/" && !pathname.startsWith("/partner") && !pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${lightNav ? "navbar-light" : ""} ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="page-wrap nav-inner">
        <Link className="brand" href="/" aria-label="Maldives.org home">Maldives<span>.org</span></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="nav-actions">
          <label className="currency-select"><span className="sr-only">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} aria-label="Currency" aria-busy={isLoading}>{supportedCurrencies.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>
          <Link href="/plan-your-trip" className="nav-cta">Plan Your Trip</Link>
        </div>
        <button className="mobile-menu-btn" type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <CloseIcon /> : <MenuIcon />}</button>
      </div>
      {open && <div className="mobile-drawer"><div className="mobile-currency"><span>Display currency</span><label className="currency-select"><span className="sr-only">Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} aria-label="Mobile currency">{supportedCurrencies.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label></div><nav aria-label="Mobile navigation">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}<span>↗</span></Link>)}<Link className="drawer-cta" href="/plan-your-trip" onClick={() => setOpen(false)}>Plan Your Trip <span>↗</span></Link></nav></div>}
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
        <div><div className="footer-label">Stay in the loop</div><p className="footer-small">Island notes, thoughtful stays and good reasons to go.</p><Link className="footer-arrow" href="/#newsletter">Join the newsletter <span>↗</span></Link></div>
      </div>
      <div className="page-wrap footer-bottom"><span>© 2026 Maldives.org</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></div><span>Made for the curious.</span></div>
    </footer>
  );
}
