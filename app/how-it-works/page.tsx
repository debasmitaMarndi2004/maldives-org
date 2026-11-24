import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export default function HowItWorksPage() {
  return <ContentPage eyebrow="HOW MALDIVES.ORG WORKS" title="A calmer way to plan island time." description="Explore stays, activity guides and routes before choosing what fits your trip.">
    <div className="detail-card">
      <h2>Build a shortlist</h2>
      <p>Use the accommodation directory to compare published property details, then browse the tour guides and trip planner for ideas.</p>
      <h2>Check dates and total costs</h2>
      <p>Sample prices and currency conversions are planning estimates. Check current rates, transfers, taxes and cancellation terms with the property or operator.</p>
      <h2>Confirm with the seller</h2>
      <p>Live booking is currently unavailable on Maldives.org. For reservations made elsewhere, use the seller’s confirmation and support contact.</p>
      <div className="booking-actions"><Link className="button button-teal" href="/stay">Explore stays</Link><Link className="text-link" href="/plan-your-trip">Plan your trip</Link></div>
    </div>
  </ContentPage>;
}
