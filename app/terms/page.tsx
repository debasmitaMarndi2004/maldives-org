import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("terms");

export default function TermsPage() {
  return (
    <LegalPage policy="terms">
      <h2>Using Maldives.org</h2>
      <p>Maldives.org provides travel guides, directories, search tools, and links for planning a trip to the Maldives. You may browse and share links for personal travel planning. Use the site lawfully and submit accurate information when you contact us.</p>

      <h2>Booking through a partner</h2>
      <p>When you follow a booking link or choose an offer in a partner search tool, check who is selling it. The seller shown at checkout handles the reservation, payment, confirmation, changes, and refunds under its terms. Maldives.org currently offers discovery and referral tools. We do not accept payment or issue reservations through our own checkout. An enquiry or a saved shortlist does not reserve a place.</p>
      <p>Some partner links may earn us a commission. <Link href="/affiliate-disclosure">Read our Affiliate Disclosure</Link>.</p>

      <h2>Prices, availability, and travel requirements</h2>
      <p>Sample listings and estimates are for planning. Partner prices and availability may change, and currency conversions on this site may be estimated. Before paying, confirm the final price and currency, taxes, fees, transfers, accessibility, and cancellation terms with the seller. For entry requirements, check the relevant authorities before you travel. <a href="https://www.immigration.gov.mv/visa/tourist-visa">Maldives Immigration entry information</a>.</p>

      <h2>Content and acceptable use</h2>
      <p>Site content and partner materials may be protected by copyright, trademarks, or other rights. Respect any licence or attribution displayed with an image or other material. Do not impersonate a person or business, submit spam, interfere with the site, bypass access controls, or copy or republish content without permission or a legal right to do so.</p>

      <h2>Questions and complaints</h2>
      <p>Use our <Link href="/contact">contact form</Link> for questions about Maldives.org, to report incorrect content, or to flag a listing or link. For payment or booking issues, contact the seller on your confirmation and see <Link href="/cancellation-policy">Cancellations &amp; Refunds</Link>. These terms do not limit any consumer rights or remedies that applicable law does not allow us to exclude.</p>
    </LegalPage>
  );
}
