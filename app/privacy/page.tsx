import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("privacy");

export default function PrivacyPage() {
  return (
    <LegalPage policy="privacy">
      <h2>What this policy covers</h2>
      <p>This policy describes how information is handled when you browse Maldives.org or try a preview form. A travel seller’s privacy policy applies to information you give it directly.</p>

      <h2>Information we use</h2>
      <ul>
        <li><strong>Preview forms.</strong> The site accepts test details to validate the contact, newsletter and trip-request previews. These previews create no saved enquiry, subscription, reservation or email. Use test details and keep personal or payment information out of these forms.</li>
        <li><strong>Site operation.</strong> Web requests can expose technical details such as IP address and browser information to hosting or service providers. The site also uses a request identifier derived from the connection to limit repeated submissions and protect its forms and APIs.</li>
      </ul>

      <h2>Searches, images and external links</h2>
      <p>Stay and tour filters use Maldives.org’s editorial catalogs. Some images can load from external media hosts, which can receive technical details such as your IP address and browser information. If you follow a link to another website, its policies apply to your visit there.</p>

      <h2>How long information is kept</h2>
      <p>The app does not keep submitted preview form details. Hosting and media services may retain technical request information under their own settings and policies. The <Link href="/cookies">Cookie Policy</Link> explains the currency setting kept in your browser.</p>

      <h2>Your choices and privacy requests</h2>
      <p>You can clear the stored currency choice in your browser. The <Link href="/contact">contact form</Link> is currently in preview. For information you gave directly to a travel seller, contact that seller. Depending on the law that applies, you may have rights to access, correct or delete your data, object to or restrict use, receive a portable copy, withdraw consent or complain to a privacy regulator.</p>
    </LegalPage>
  );
}
