import { ContentPage } from "@/components/public-pages";
import { notFound } from "next/navigation";
import { atollDestinations, findAtollDestination } from "@/lib/destination-slugs";

export const dynamicParams = false;
export function generateStaticParams() {
  return atollDestinations.flatMap((destination) => [destination.slug, ...destination.aliases].map((slug) => ({ slug })));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const destination = findAtollDestination((await params).slug);
  if (!destination) notFound();
  return { title: `${destination.name} — Maldives.org`, alternates: { canonical: `https://maldives.org/atolls/${destination.slug}` } };
}
export default async function AtollDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const destination = findAtollDestination((await params).slug);
  if (!destination) notFound();
  return <ContentPage eyebrow="ATOLL GUIDE" title={destination.name} description="A calm starting point for comparing islands, stays, transfer options and experiences in this part of the Maldives."><div className="detail-card"><h2>A place with its own pace.</h2><p>Atoll pages will combine long-form editorial guidance, verified partner listings, transfer routes, seasonal notes and an island map. This sample page establishes the production layout for that content.</p><div className="detail-list"><div><strong>Best for</strong><span>Reef days · slow travel</span></div><div><strong>Getting there</strong><span>Speedboat or seaplane</span></div></div></div></ContentPage>;
}
