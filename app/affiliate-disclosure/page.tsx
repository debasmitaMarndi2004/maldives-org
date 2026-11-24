import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("affiliate");

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage policy="affiliate">
      <h2>How we may earn a commission</h2>
      <p>Maldives.org may earn a commission on eligible bookings if affiliate offers become available. We will identify the relationship where we display those offers.</p>

      <h2>Current listings</h2>
      <p>Affiliate offers and live booking tools are currently unavailable. Links to official property or operator websites provide a source for editorial information.</p>

      <h2>Who handles the booking</h2>
      <p>For a booking already made with a seller, follow that seller’s confirmation, payment terms and cancellation conditions. See <Link href="/cancellation-policy">Cancellations &amp; Refunds</Link> for help finding the right contact.</p>

      <h2>Travel guides and listings</h2>
      <p>We publish destination guides, editorial activity ideas and sample planning estimates. Check the listing’s labels and dates before relying on a quoted price. The <Link href="/cookies">Cookie Policy</Link> describes current browser storage.</p>
    </LegalPage>
  );
}
