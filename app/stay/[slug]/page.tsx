import { notFound } from "next/navigation";
import { StayDetail } from "@/components/public-pages";
import { properties } from "@/lib/data";
export function generateStaticParams() { return properties.map((property) => ({ slug: property.slug })); }
export default async function StayDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const property = properties.find((item) => item.slug === slug); if (!property) notFound(); return <StayDetail property={property} />; }
