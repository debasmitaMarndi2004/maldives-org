import { ContentPage } from "@/components/public-pages";
import type { InfoPage } from "@/lib/site-content";

export function ManagedInfoPage({ page }: { page: InfoPage }) {
  return <ContentPage eyebrow="MALDIVES.ORG" title={page.title} description={page.intro}>
    <article className="detail-card legal-copy">
      {page.sections.map((section, index) => <section key={index}>
        <h2>{section.title}</h2>
        <p style={{ whiteSpace: "pre-line" }}>{section.body}</p>
      </section>)}
    </article>
  </ContentPage>;
}
