"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="page-main"><div className="page-wrap content-page"><div className="detail-card"><span className="eyebrow">LET’S TRY AGAIN</span><h1>This page could not be loaded.</h1><p role="alert">Please retry or continue exploring our destination guides. No booking or payment has been created.</p><div className="booking-actions"><button className="button button-teal" type="button" onClick={reset}>Try again</button><Link className="text-link" href="/guides">Explore guides</Link></div></div></div></main>;
}
