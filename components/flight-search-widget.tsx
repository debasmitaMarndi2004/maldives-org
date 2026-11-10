"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Fixed dashboard URL: public affiliate identifiers, never request-controlled.
export const FLIGHT_WIDGET_SOURCE = "https://tpscr.com/content?currency=usd&trs=598417&shmarker=678887&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=1&plain=true&color_button=%230064b3&color_button_text=%23ffffff&promo_id=3414&campaign_id=111";

// Keep the vendor's DOM changes outside React and away from other affiliates.
// No allow-same-origin: the widget cannot access the parent document or storage.
const widgetDocument = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;font:14px system-ui;color:#28474e}#status{padding:12px}a{color:#0064b3}</style></head><body><p id="status" role="status">Loading partner flight search…</p><script>
(function () {
  var ready = false;
  function inspect() {
    var control = document.querySelector('form, iframe, input:not([type="hidden"]), [role="combobox"]');
    if (!control || !control.getBoundingClientRect().height) return;
    ready = true;
    document.getElementById('status')?.remove();
    parent.postMessage({type:'maldives-flight-widget',ready:true,height:document.documentElement.scrollHeight},'*');
  }
  new MutationObserver(inspect).observe(document.body,{childList:true,subtree:true});
  new ResizeObserver(inspect).observe(document.body);
  setInterval(inspect,1000);
  setTimeout(function(){if(!ready)parent.postMessage({type:'maldives-flight-widget',unavailable:true},'*');},12000);
})();
</script><script async src="${FLIGHT_WIDGET_SOURCE.replaceAll("&", "&amp;")}" charset="utf-8" onerror="document.getElementById('status').textContent='Flight search is unavailable. Restoring stay search…'"></script></body></html>`;

export function FlightSearchWidget({ onUnavailable }: { onUnavailable: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(80);
  useEffect(() => {
    let ready = false;
    const timeout = window.setTimeout(() => { if (!ready) onUnavailable(); }, 15000);
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== "maldives-flight-widget") return;
      if (event.data.unavailable === true && !ready) onUnavailable();
      if (event.data.ready === true && Number.isFinite(event.data.height)) {
        ready = true;
        setHeight(Math.max(80, Math.min(1000, event.data.height)));
      }
    };
    window.addEventListener("message", receive);
    return () => { window.clearTimeout(timeout); window.removeEventListener("message", receive); };
  }, [onUnavailable]);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return <section className="search-wrap page-wrap" aria-label="Partner flight search">
    <div className="flight-widget-card">
      <h2>Search flights</h2>
      <p>Travelpayouts partner search · USD prices. Booking and payment take place on the selected provider’s website.</p>
      {hydrated ? <iframe ref={frame} style={{ height }} title="Travelpayouts flight search" srcDoc={widgetDocument}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="strict-origin-when-cross-origin" className="flight-widget-frame" /> : <p role="status">Loading partner flight search…</p>}
      <button type="button" className="text-link" onClick={onUnavailable}>Use original stay search</button>
    </div>
  </section>;
}
