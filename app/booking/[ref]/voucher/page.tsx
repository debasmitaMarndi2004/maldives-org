import Link from "next/link";
import { ContentPage } from "@/components/public-pages";

export default function BookingVoucherPage() {
  return (
    <ContentPage eyebrow="BOOKING SUPPORT" title="Find your booking voucher" description="Use the confirmation email or booking account from the seller that took your reservation.">
      <div className="detail-card">
        <h2>Need another copy?</h2>
        <p>Contact the seller listed on your receipt and provide the booking reference from your confirmation.</p>
        <Link className="text-link" href="/cancellation-policy">Read the booking support guide</Link>
      </div>
    </ContentPage>
  );
}
