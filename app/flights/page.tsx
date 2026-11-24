import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export const metadata = {
  title: "Flights to the Maldives — Maldives.org",
  description: "Plan your arrival in the Maldives and check how to reach your island from the airport.",
  robots: { index: false, follow: false },
};

export default function FlightsPage() {
  return (
    <ContentPage eyebrow="PLAN YOUR JOURNEY" title="Flights to the Maldives" description="Plan your flight and the onward connection to your island.">
      <div className="detail-card">
        <h2>Flight search is currently unavailable</h2>
        <p>Confirm fares, baggage rules and ticket changes directly with your airline or travel seller.</p>
        <h2>Check your island connection</h2>
        <p>Before choosing an arrival time, ask your accommodation which airport, jetty or domestic connection you need and when the last transfer departs.</p>
        <div className="booking-actions">
          <Link className="button button-teal" href="/transfers">Explore island transfers</Link>
          <Link className="button button-ghost button-dark" href="/plan-your-trip">Plan your trip</Link>
        </div>
      </div>
    </ContentPage>
  );
}
