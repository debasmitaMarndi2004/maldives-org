import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityArt } from "@/components/tours/activity-art";
import { ArrowRight } from "@/components/icons";
import { tourIdeas } from "@/lib/tours/ideas";
import styles from "@/components/tours/tours.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return tourIdeas.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = tourIdeas.find((p) => p.slug === slug);
  return item ? { title: `${item.name} · Maldives Activity Guide — Maldives.org`, description: item.description, alternates: { canonical: `https://maldives.org/tours-and-activities/${item.slug}` } } : { title: "Activity not found — Maldives.org", robots: { index: false } };
}
export default async function ActivityIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = tourIdeas.find((p) => p.slug === slug);
  if (!idea) notFound();
  return <main className={`${styles.page} ${styles.guide}`}><div className="page-wrap">
    <Link className={styles.textLink} href="/tours-and-activities">All tours &amp; activities <ArrowRight size={16}/></Link>
    <h1>{idea.name}</h1><p className={styles.guideIntro}>{idea.description}</p>
    <ActivityArt tile={idea.tile} className={styles.guideArt} label={`Illustrative ${idea.category.toLowerCase()} scene`}/>
    <p className={styles.notice}>Original illustrative imagery · activity idea, not a confirmed tour product</p>
    <div className={styles.guideLayout}><section><h2>Before you choose an operator</h2><ul>{idea.notes.map((note) => <li key={note}>{note}</li>)}</ul><p className={styles.notice}>This guide does not confirm an itinerary, departure time, price or availability.</p></section>
      <aside><h2>Booking stays with the provider.</h2><p>An approved operator booking link has not been connected to this guide.</p><button type="button" disabled>Partner booking unavailable</button><p>When an approved link is available, the named provider will handle reservations, payment, cancellation terms and booking confirmation.</p><Link className={styles.textLink} href="/affiliate-disclosure">About partner links <ArrowRight size={15}/></Link></aside>
    </div>
    <details className={styles.legacy}><summary>Existing experience preview</summary><p>The original sample experience page is preserved. Its sample prices and durations are not confirmed operator information.</p><Link className={styles.textLink} href={`/experiences/${idea.slug}`}>View original preview <ArrowRight size={15}/></Link></details>
  </div></main>;
}
