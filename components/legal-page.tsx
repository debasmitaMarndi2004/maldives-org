import { ContentPage } from "@/components/public-pages";
import { legalPages, type LegalPolicy } from "@/lib/legal-pages";

export function LegalPage({ policy, children }: { policy: LegalPolicy; children: React.ReactNode }) {
  const page = legalPages[policy];
  return (
    <ContentPage eyebrow="LEGAL" title={page.title} description={page.description}>
      <article className="detail-card legal-copy">
        <p className="legal-updated">Last updated <time dateTime="2026-11-24">24 November 2026</time></p>
        {children}
      </article>
    </ContentPage>
  );
}
