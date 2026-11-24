import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { legalMetadata } from "@/lib/legal-pages";

export const metadata = legalMetadata("cookies");

export default function CookiesPage() {
  return (
    <LegalPage policy="cookies">
      <h2>Browser storage on Maldives.org</h2>
      <p>Cookies and local storage let websites save or read information on your device. When you choose a display currency, we save your selection in your browser under <code>maldives.org.currency</code> so it can be used on another visit. The app sets no expiry for this setting. You can clear it by removing site data in your browser.</p>

      <h2>External websites</h2>
      <p>When you visit an external website from a link on Maldives.org, that website controls its storage and privacy settings.</p>

      <h2>Managing storage</h2>
      <p>Use your browser’s site-data settings to clear or block cookies and local storage. Clearing site data can reset your saved preference.</p>
      <p>For other information we handle, see the <Link href="/privacy">Privacy Policy</Link>.</p>
    </LegalPage>
  );
}
