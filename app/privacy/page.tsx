import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("privacy");

export default function PrivacyPage() {
  return (
    <LegalPage policy="privacy">
      <h2>What this policy covers</h2>
      <p>This policy describes how information is used when you browse Maldives.org, use a search tool, or submit a form. A travel seller’s own privacy policy applies to the information you give it when you book.</p>

      <h2>Information we use</h2>
      <ul>
        <li><strong>Contact enquiries.</strong> Your name, email, and message are used to record and respond to your enquiry. The confirmation tells you whether the enquiry was saved or the form was running in preview mode.</li>
        <li><strong>Newsletter.</strong> If you sign up and the service is enabled, we use your email address and subscription record for Maldives.org updates. You can ask us to stop sending them through the contact form.</li>
        <li><strong>Trip requests.</strong> If a request form is offered, we may use the traveller and contact details, dates, party size, and notes you provide to handle the request. Do not send card details, passwords, or passport scans through these forms.</li>
        <li><strong>Site operation.</strong> Web requests can expose technical details such as IP address and browser information to hosting or service providers. The site also uses a request identifier derived from the connection to limit repeated submissions and protect its forms and APIs.</li>
      </ul>

      <h2>Searches, partners, and service providers</h2>
      <p>Tour search sends search terms, destination, and selected filters to Viator through our server. Tour images may load from Tripadvisor media servers. If hotel availability search is enabled, Hotelbeds receives search details such as dates, hotel selections, and guest counts. The Aviasales flight search and optional Viator widget run in your browser and can receive the information you enter there along with technical request information.</p>
      <p>When configured, Supabase stores enquiries, subscription records, and trip requests. Resend can deliver website emails. Partner widgets, affiliate attribution services, and their storage choices are listed in our <Link href="/cookies">Cookie Policy</Link>. These providers may process information in countries other than the one you are visiting from.</p>

      <h2>How long information is kept</h2>
      <p>Retention depends on why the information is needed. Enquiries and trip requests may be kept while we deal with them and for any applicable record-keeping or dispute requirements. Newsletter records support the subscription and may be needed to honour a removal request. The <Link href="/cookies">Cookie Policy</Link> explains the currency setting kept in your browser.</p>

      <h2>Your choices and privacy requests</h2>
      <p>Use our <Link href="/contact">contact form</Link> and start your message with “Privacy request” to ask about your information, request a correction or deletion, or stop newsletter messages. Depending on the law that applies, you may also have rights to access, object, restrict use, receive a copy in a portable format, withdraw consent, or complain to a privacy regulator. We may need to verify that the request relates to you. For information you gave directly to a travel seller, contact that seller.</p>
    </LegalPage>
  );
}
