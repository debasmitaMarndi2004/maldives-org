import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export default function BookingConfirmationPage() {
  return (
    <ContentPage eyebrow="TRIP PLANNING" title="Check your booking confirmation" description="Your selected travel provider issues the confirmation when you reserve directly.">
      <div className="detail-card">
        <h2>Keep the details you need</h2>
        <p>Keep your seller’s reference number, dates, final price and cancellation terms. For an island stay, confirm the transfer and meeting point separately.</p>
        <Link className="button button-teal" href="/plan-your-trip">Plan your trip</Link>
      </div>
    </ContentPage>
  );
}
