import Link from "next/link";
import { ContentPage } from "@/components/public-pages";
import { experiences, properties } from "@/lib/data";
import { findAccommodation } from "@/lib/accommodations/catalog";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ type?: string; slug?: string }> }) {
  const { type, slug } = await searchParams;
  const experience = type === "experience" ? experiences.find((item) => item.slug === slug) : undefined;
  const stay = type !== "experience" && slug
    ? findAccommodation(slug) ?? properties.find((item) => item.slug === slug)
    : undefined;
  const listing = experience ?? stay;
  const detailsHref = experience ? `/experiences/${experience.slug}` : stay ? `/stay/${stay.slug}` : "/stay";

  return (
    <ContentPage eyebrow="TRIP PLANNING" title={listing ? `Explore ${listing.name}` : "Your next island discovery."} description="Use the directory to shortlist stays and activities.">
      <div className="detail-card">
        <h2>Booking is currently unavailable</h2>
        <p>Check dates, total price, transfer inclusions and cancellation terms with the property or operator before reserving.</p>
        <div className="booking-actions">
          <Link className="button button-teal" href={detailsHref}>{listing ? "View listing details" : "Explore stays"}</Link>
          <Link className="button button-ghost button-dark" href="/tours-and-activities">Explore activities</Link>
        </div>
      </div>
    </ContentPage>
  );
}
