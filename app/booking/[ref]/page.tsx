import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export default function BookingReferencePage() {
  return (
    <ContentPage eyebrow="BOOKING SUPPORT" title="Manage your booking with its provider." description="Find the seller and booking reference on the confirmation or receipt issued when you booked.">
      <div className="detail-card">
        <h2>Changes and cancellations</h2>
        <p>Contact the seller on your confirmation for booking status, changes and refund requests.</p>
        <Link className="text-link" href="/cancellation-policy">Read the cancellations and refunds guide</Link>
      </div>
    </ContentPage>
  );
}
