import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ManagedInfoPage } from "@/components/managed-info-page";
import { getAdminActor } from "@/lib/admin/auth";
import { readDraft, readSiteRevision } from "@/lib/admin/store";
import { z } from "zod";
import styles from "../../admin.module.css";

export default async function DraftInfoPage({ params, searchParams }: PageProps<"/admin/preview/[slug]">) {
  if (!await getAdminActor()) redirect("/admin");
  const { slug } = await params;
  const query = await searchParams;
  const revision = z.uuid().safeParse(query.revision);
  const content = revision.success
    ? await readSiteRevision(revision.data).catch(() => notFound())
    : (await readDraft("site")).content;
  const page = content.pages.find(item => item.slug === slug);
  if (!page) notFound();
  return <>
    <header className={styles.previewBar}>
      <Link href={revision.success ? `/admin/preview?revision=${revision.data}` : "/admin/preview"}>← Back to homepage preview</Link>
      <strong>Site page draft preview</strong>
      <span>Visible to staff</span>
    </header>
    <ManagedInfoPage page={page} />
  </>;
}
