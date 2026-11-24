import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export default function CheckoutPage() {
  return (
    <ContentPage eyebrow="TRIP PLANNING" title="Online checkout is unavailable" description="Explore your options and confirm booking details with your chosen travel provider.">
      <div className="detail-card">
        <h2>Explore the Maldives</h2>
        <p>Browse stays and activity guides, or use our trip planner to put together a shortlist.</p>
        <div className="booking-actions">
          <Link className="button button-teal" href="/stay">Explore stays</Link>
          <Link className="button button-ghost button-dark" href="/tours-and-activities">Explore activities</Link>
        </div>
      </div>
    </ContentPage>
  );
}
