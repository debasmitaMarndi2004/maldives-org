import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("terms");

export default function TermsPage() {
  return (
    <LegalPage policy="terms">
      <h2>Using Maldives.org</h2>
      <p>Maldives.org provides travel guides, directories and links for planning a trip to the Maldives. You may browse and share links for personal travel planning. Use the site lawfully and provide only test details in preview forms.</p>

      <h2>Booking with a travel seller</h2>
      <p>Live booking is currently unavailable on Maldives.org. When booking elsewhere, check who is selling the trip. That seller handles the reservation, payment, confirmation, changes and refunds under its terms. Preview forms and shortlists are for planning.</p>
      <p>Read how future affiliate offers will be identified in our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.</p>

      <h2>Prices, availability, and travel requirements</h2>
      <p>Sample listings and estimates are for planning. Partner prices and availability may change, and currency conversions on this site may be estimated. Before paying, confirm the final price and currency, taxes, fees, transfers, accessibility, and cancellation terms with the seller. For entry requirements, check the relevant authorities before you travel. <a href="https://www.immigration.gov.mv/visa/tourist-visa">Maldives Immigration entry information</a>.</p>

      <h2>Content and acceptable use</h2>
      <p>Site content and partner materials may be protected by copyright, trademarks, or other rights. Respect any licence or attribution displayed with an image or other material. Do not impersonate a person or business, submit spam, interfere with the site, bypass access controls, or copy or republish content without permission or a legal right to do so.</p>

      <h2>Questions and complaints</h2>
      <p>The <Link href="/contact">contact form</Link> is currently a preview. For payment or booking issues, contact the seller on your confirmation and see <Link href="/cancellation-policy">Cancellations &amp; Refunds</Link>. These terms preserve the consumer rights and remedies that apply by law.</p>
    </LegalPage>
  );
}
