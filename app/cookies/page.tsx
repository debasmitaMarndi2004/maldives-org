import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";
import { getTravelpayoutsDrivePermissions } from "@/lib/travelpayouts-drive-config";

export const metadata = legalMetadata("cookies");

export default function CookiesPage() {
  const driveEnabled = getTravelpayoutsDrivePermissions().enabled;

  return (
    <LegalPage policy="cookies">
      <h2>Browser storage on Maldives.org</h2>
      <p>Cookies and local storage let websites save or read information on your device. When you choose a display currency, we save your selection in your browser under <code>maldives.org.currency</code> so it can be used on another visit. The app sets no expiry for this setting. You can clear it by removing site data in your browser.</p>

      <h2>Travel search and affiliate services</h2>
      <ul>
        <li><strong>Aviasales flight search.</strong> Opening the Flights page loads an embedded travel search tool. Aviasales describes the cookies and similar technologies its service may use. <a href="https://www.aviasales.com/cookie">Aviasales Cookie Policy</a>.</li>
        <li><strong>Travelpayouts Drive.</strong> {driveEnabled ? "Drive is enabled and loads automatically on the site to support affiliate attribution. This site does not currently provide a separate visitor switch for Drive." : "Drive is disabled in this site configuration."} Partner settings and vendor practices determine the tracking technologies used. <a href="https://support.travelpayouts.com/hc/en-us/articles/360004121072-Cookie-Policy">Travelpayouts Cookie Policy</a>.</li>
        <li><strong>Viator.</strong> Native tour search requests go through our server. Choosing the original Viator widget connects your browser to Viator, which may use storage for widget functions and attribution. <a href="https://www.viator.com/support/privacyPolicy">Viator Privacy Policy</a>.</li>
        <li><strong>Stay22.</strong> On enabled accommodation partner pages, you can choose to load Stay22. The service can use storage or tracking to connect a supplier link to a referral. <a href="https://www.stay22.com/cookie">Stay22 Cookie Policy</a>.</li>
      </ul>

      <h2>Managing storage</h2>
      <p>Use your browser’s site-data settings to clear or block cookies and local storage. This can reset your display preference or affect embedded tools. You can leave optional widgets unopened. After following a partner link, check that site’s cookie settings and notice for what it stores and for how long.</p>
      <p>For other information we handle and how to contact us, see the <Link href="/privacy">Privacy Policy</Link>.</p>
    </LegalPage>
  );
}
