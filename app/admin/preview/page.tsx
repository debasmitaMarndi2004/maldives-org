import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import HomeSections from "@/components/home-sections";
import { Footer } from "@/components/site-shell";
import { getAdminActor } from "@/lib/admin/auth";
import { readDraft, readSiteRevision } from "@/lib/admin/store";
import { legalPages } from "@/lib/legal-pages";
import { z } from "zod";
import styles from "../admin.module.css";

export default async function DraftPreviewPage({ searchParams }: PageProps<"/admin/preview">) {
  if (!await getAdminActor()) redirect("/admin");
  const params = await searchParams;
  const revision = z.uuid().safeParse(params.revision);
  const content = revision.success
    ? await readSiteRevision(revision.data).catch(() => notFound())
    : (await readDraft("site")).content;
  return <>
    <header className={styles.previewBar}>
      <Link href="/admin">← Back to editor</Link>
      <strong>{revision.success ? `Saved version ${revision.data.slice(0, 8)}` : "Homepage draft preview"}</strong>
      <span>Visible to staff</span>
    </header>
    <HomeSections hero={content.hero} homeSections={content.homeSections} serviceDescriptions={content.serviceDescriptions} />
    <section className={styles.previewLinks} aria-label="Additional draft content">
      {content.pages.map(page => <Link key={page.slug} href={`/admin/preview/${page.slug}${revision.success ? `?revision=${revision.data}` : ""}`}>{page.title} ↗</Link>)}
      {Object.entries(content.legalNotes).map(([policy, note]) => note && <details key={policy}>
        <summary>{legalPages[policy as keyof typeof legalPages].title} note</summary>
        <p>{note}</p>
      </details>)}
    </section>
    <Footer copy={content.footer} links={content.pages.filter(page => page.footerLink)} preview previewRevision={revision.data} newsletterVisible={content.homeSections.some(section => section.key === "newsletter" && section.visible)} />
  </>;
}
