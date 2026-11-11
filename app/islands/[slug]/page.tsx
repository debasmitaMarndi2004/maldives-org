import { ContentPage } from "@/components/public-pages";
import { notFound } from "next/navigation";
import { findIslandDestination, islandDestinations } from "@/lib/destination-slugs";

export const dynamicParams = false;
export function generateStaticParams() { return islandDestinations.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const destination = findIslandDestination((await params).slug);
  if (!destination) notFound();
  return { title: `${destination.name} Island Guide — Maldives.org`, alternates: { canonical: `https://maldives.org/islands/${destination.slug}` } };
}
export default async function IslandPage({ params }: { params: Promise<{ slug: string }> }) {
  const destination = findIslandDestination((await params).slug);
  if (!destination) notFound();
  return <ContentPage eyebrow="ISLAND GUIDE" title={destination.name} description="A local, practical guide to what the island feels like and how to get there."><div className="detail-card"><h2>Island time, made clear.</h2><p>Discover the beach, the reef, the transfer options and the places to stay. Sample content is intentionally labelled until partner data is connected.</p></div></ContentPage>;
}
