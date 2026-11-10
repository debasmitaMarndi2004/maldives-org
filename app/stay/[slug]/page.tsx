import { notFound } from "next/navigation";
import { StayDetail } from "@/components/public-pages";
import { properties } from "@/lib/data";
import { accommodations, findAccommodation } from "@/lib/accommodations/catalog";
import { accommodationDetailMetadata } from "@/lib/accommodations/metadata";
import { AccommodationDetail } from "@/components/accommodations/detail";
// The curated and preserved preview slugs are known; reject unknown slugs before streaming.
export const dynamicParams = false;
export function generateStaticParams() { return [...properties, ...accommodations].map((property) => ({ slug: property.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return accommodationDetailMetadata((await params).slug); }
export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const accommodation = findAccommodation(slug);
  if (accommodation) return <AccommodationDetail property={accommodation}/>;
  const property = properties.find((item) => item.slug === slug);
  if (!property) notFound();
  return <StayDetail property={property} />;
}
