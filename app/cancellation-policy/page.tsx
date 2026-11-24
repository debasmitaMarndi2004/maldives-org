import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("cancellation");

export default function CancellationPage() {
  return (
    <LegalPage policy="cancellation">
      <h2>Start with the seller on your confirmation</h2>
      <p>Maldives.org currently helps you find travel options and sends you to booking partners. The seller you booked with handles any change, cancellation, refund, or payment dispute. Use the booking confirmation or receipt to identify the seller, find your reference number, and locate its support channel.</p>

      <h2>Check the terms for your specific booking</h2>
      <ul>
        <li><strong>Stays.</strong> Review the room rate you actually selected, including deposit rules, the cancellation deadline and time zone, fees, and no-show terms.</li>
        <li><strong>Flights.</strong> Contact the airline or travel agency that issued your ticket. Aviasales is a search tool and directs travellers to the ticket seller for changes or cancellations. <a href="https://www.aviasales.com/faq/how-aviasales-works">How Aviasales works</a>.</li>
        <li><strong>Tours and transfers.</strong> Check the specific activity or ticket terms for change deadlines, weather cancellations, minimum participants, and missed departures. For a Viator booking, check your confirmation and the applicable product terms. <a href="https://www.viator.com/support/termsAndConditions">Viator Terms and Conditions</a>.</li>
      </ul>

      <h2>Requesting a change or refund</h2>
      <p>Contact the seller before the deadline. State what you want to change or cancel, keep a copy of the seller’s response, and ask it to confirm any fee, refund amount, refund method, and expected timing. Separate bookings may have separate policies. A cancelled flight, stay, or tour does not automatically cancel the other parts of a trip.</p>

      <h2>If you cannot resolve the problem</h2>
      <p>Follow the seller’s complaint process and keep your confirmation, receipts, and correspondence. For eligible consumer complaints in the Maldives, consult the Consumer Ombudsman’s filing guidance. Any mandatory refund or consumer rights that apply to your booking continue to apply. <a href="https://consumer.gov.mv/en/filing-a-complaint/sop-for-filing-complaint/">Maldives Consumer Ombudsman complaint guidance</a>.</p>
      <p>If a Maldives.org listing or link directed you to the wrong service, <Link href="/contact">tell us what happened</Link>. Share the listing link and a short description, without sending payment card or passport details.</p>
    </LegalPage>
  );
}
