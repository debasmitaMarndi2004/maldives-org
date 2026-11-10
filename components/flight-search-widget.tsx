"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Fixed dashboard URL: public affiliate identifiers, never request-controlled.
export const FLIGHT_WIDGET_SOURCE = "https://tpscr.com/content?currency=usd&trs=598417&shmarker=678887&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=1&plain=true&color_button=%230064b3&color_button_text=%23ffffff&promo_id=3414&campaign_id=111";

// Keep the vendor's DOM changes outside React and away from other affiliates.
// No allow-same-origin: the widget cannot access the parent document or storage.
const widgetDocument = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:14px system-ui;color:#28474e}#status{padding:16px}a{color:#0064b3}</style></head><body><p id="status" role="status">Loading partner flight search…</p><script async src="${FLIGHT_WIDGET_SOURCE.replaceAll("&", "&amp;")}" charset="utf-8" onload="document.getElementById('status')?.remove()" onerror="document.getElementById('status').textContent='Flight search is unavailable. Please try again later.'"></script></body></html>`;

export function FlightSearchWidget() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return <section className="search-wrap page-wrap" aria-label="Partner flight search">
    <div className="flight-widget-card">
      <h2>Search flights</h2>
      <p>Travelpayouts partner search · USD prices. Booking and payment take place on the selected provider’s website.</p>
      {hydrated ? <iframe title="Travelpayouts flight search" srcDoc={widgetDocument}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="strict-origin-when-cross-origin" className="flight-widget-frame" /> : <p role="status">Loading partner flight search…</p>}
    </div>
  </section>;
}
