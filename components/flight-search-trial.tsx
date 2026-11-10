"use client";

import { useEffect, useRef, useState } from "react";

// Public dashboard installation URL. Do not derive destinations from user input.
export const FLIGHT_SEARCH_SOURCE = "https://tpscr.com/content?currency=usd&trs=598417&shmarker=678887&show_hotels=false&powered_by=false&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%2332a8dd&color_button=%2332a8dd&color_icons=%2332a8dd&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%2332a8dd&border_radius=0&no_labels=&plain=true&promo_id=7879&campaign_id=100";

type WidgetState = "loading" | "ready" | "unavailable";

export function FlightSearchTrial() {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<WidgetState>("loading");

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let disposed = false;
    let rendered = false;
    const inspect = () => {
      // Script download alone does not mean the search interface rendered.
      const controls = host.querySelectorAll('form, input:not([type="hidden"]), select, iframe');
      if (Array.from(controls).some(control => control.getBoundingClientRect().height > 0)) {
        rendered = true;
        if (!disposed) setState("ready");
      }
    };
    const observer = new MutationObserver(inspect);
    observer.observe(host, { childList: true, subtree: true, attributes: true });
    const script = document.createElement("script");
    script.id = "maldives-flight-search-trial";
    script.async = true;
    script.charset = "utf-8";
    script.src = FLIGHT_SEARCH_SOURCE;
    script.onload = inspect;
    script.onerror = () => { if (!disposed) setState("unavailable"); };
    // Keep the embed at its supplied insertion point (some widgets use currentScript).
    // A cancellable task avoids duplicate execution during React Strict Mode setup.
    const start = window.setTimeout(() => host.appendChild(script), 0);
    const poll = window.setInterval(inspect, 500);
    const timeout = window.setTimeout(() => {
      if (!disposed && !rendered) setState("unavailable");
    }, 12000);
    return () => {
      disposed = true;
      window.clearTimeout(start);
      window.clearTimeout(timeout);
      window.clearInterval(poll);
      observer.disconnect();
      script.onload = null;
      script.onerror = null;
      host.replaceChildren();
    };
  }, []);

  return <section className="flight-search-trial page-wrap" aria-labelledby="flight-trial-title" data-widget-state={state}>
    <div className="flight-search-trial-card">
      <h2 id="flight-trial-title">Search flights</h2>
      <p>Aviasales flight search via Travelpayouts · USD. Booking and payment take place on the selected provider’s website.</p>
      {state !== "ready" && <p role="status" aria-live="polite">{state === "loading" ? "Loading partner flight search…" : "Flight search is unavailable right now. The original stay search above is still available."}</p>}
      <div ref={container} className="flight-search-trial-content" hidden={state === "unavailable"} />
    </div>
  </section>;
}
