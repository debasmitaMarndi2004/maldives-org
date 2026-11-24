import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("affiliate");

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage policy="affiliate">
      <h2>How we may earn a commission</h2>
      <p>Maldives.org may earn a commission when you complete an eligible booking after following an affiliate link or using a partner search tool. You can always check the price and terms with the provider before choosing where to book.</p>

      <h2>Where partner links appear</h2>
      <p>You may see partner offers on stay and experience listings, in Viator tour results, or in Aviasales flight search powered through Travelpayouts. Where offered, Stay22 can help attribute referrals for accommodation bookings. On-site listings vary by the programs and links available for each property or experience.</p>

      <h2>Who handles the booking</h2>
      <p>The seller shown at checkout sets the final price, availability, payment terms, and cancellation conditions. A website referral does not confirm a reservation. See <Link href="/cancellation-policy">Cancellations &amp; Refunds</Link> for help finding the right seller after booking.</p>

      <h2>Travel guides and listings</h2>
      <p>We also publish destination guides, editorial activity ideas, and sample planning estimates. Check the listing’s labels and dates before relying on a quoted price or offer. For how referral tools may use browser storage, see the <Link href="/cookies">Cookie Policy</Link>.</p>
    </LegalPage>
  );
}
