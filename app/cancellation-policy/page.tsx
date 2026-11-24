import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("cancellation");

export default function CancellationPage() {
  return (
    <LegalPage policy="cancellation">
      <h2>Start with the seller on your confirmation</h2>
      <p>If you booked with a travel seller, use the confirmation or receipt to identify the seller, find your reference number and locate its support channel for changes, refunds or payment disputes.</p>

      <h2>Check the terms for your specific booking</h2>
      <ul>
        <li><strong>Stays.</strong> Review the room rate you actually selected, including deposit rules, the cancellation deadline and time zone, fees, and no-show terms.</li>
        <li><strong>Flights.</strong> Contact the airline or travel agency that issued your ticket. Have your ticket number and booking reference ready.</li>
        <li><strong>Tours and transfers.</strong> Check your activity or ticket terms for change deadlines, weather cancellations, minimum participants and missed departures.</li>
      </ul>

      <h2>Requesting a change or refund</h2>
      <p>Contact the seller before the deadline. State what you want to change or cancel, keep a copy of the seller’s response, and ask it to confirm any fee, refund amount, refund method, and expected timing. Separate bookings may have separate policies. A cancelled flight, stay, or tour does not automatically cancel the other parts of a trip.</p>

      <h2>If you cannot resolve the problem</h2>
      <p>Follow the seller’s complaint process and keep your confirmation, receipts, and correspondence. For eligible consumer complaints in the Maldives, consult the Consumer Ombudsman’s filing guidance. Any mandatory refund or consumer rights that apply to your booking continue to apply. <a href="https://consumer.gov.mv/en/filing-a-complaint/sop-for-filing-complaint/">Maldives Consumer Ombudsman complaint guidance</a>.</p>
      <p>Live booking is currently unavailable on Maldives.org. The <Link href="/contact">contact form</Link> is a preview.</p>
    </LegalPage>
  );
}
