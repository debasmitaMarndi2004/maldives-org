"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { VIATOR_WIDGET_MESSAGE } from "@/lib/viator-widget";
import styles from "./tours.module.css";

const subscribe = () => () => {};

function ViatorFrame() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [height, setHeight] = useState(350);
  useEffect(() => {
    let ready = false, failed = false;
    const fail = () => { if (!ready) { failed = true; setStatus("unavailable"); } };
    const timeout = window.setTimeout(fail, 25000);
    const receive = (event: MessageEvent) => {
      if (failed || event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== VIATOR_WIDGET_MESSAGE) return;
      if (event.data.failed === true) { fail(); return; }
      const nextHeight = event.data.height;
      if (event.data.ready === true && typeof nextHeight === "number" && Number.isFinite(nextHeight) && nextHeight >= 80 && nextHeight <= 24000) {
        ready = true; window.clearTimeout(timeout);
        setHeight(Math.ceil(nextHeight)); setStatus("ready");
      }
    };
    window.addEventListener("message", receive);
    return () => { window.clearTimeout(timeout); window.removeEventListener("message", receive); };
  }, []);
  return <div className={styles.widgetFrame} data-viator-state={status}>
    <p className={styles.widgetStatus} role="status" aria-live="polite">{status === "loading" ? "Loading Viator experiences…" : status === "unavailable" ? "Viator experiences could not load. Please retry, or explore our activity guides below. No booking has been made." : "Experiences provided by Viator. Check current details and availability on Viator."}</p>
    {hydrated && <iframe ref={frame} title="Viator Maldives tours and activities" src="/tours-and-activities/embed" style={{ height }} hidden={status === "unavailable"} referrerPolicy="strict-origin-when-cross-origin" />}
  </div>;
}

export function ViatorWidget() {
  const [attempt, setAttempt] = useState(0);
  return <section className={`page-wrap ${styles.viatorSection}`} aria-labelledby="viator-experiences-title">
    <div className={styles.viatorHeading}><div><span className={styles.category}>OUR ACTIVITY PARTNER</span><h2 id="viator-experiences-title">Explore Viator Experiences</h2></div><span className={styles.providerBadge}>Viator</span></div>
    <p className={styles.widgetDisclosure}>Explore provider-supplied tours and activities. You’ll continue to Viator for booking and payment. Maldives.org may earn a commission from qualifying bookings. Prices and availability can change. <a href="/affiliate-disclosure">About affiliate links</a>.</p>
    <div className={styles.widgetPanel}><ViatorFrame key={attempt} /></div>
    <button type="button" className={styles.widgetRetry} onClick={() => setAttempt(value => value + 1)}>Reload Viator experiences</button>
    <noscript>Enable JavaScript to explore Viator experiences. The activity guides below remain available.</noscript>
  </section>;
}
