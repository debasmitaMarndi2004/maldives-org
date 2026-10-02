import { notFound } from "next/navigation";
import { StayDetail } from "@/components/public-pages";
import { properties } from "@/lib/data";
export function generateStaticParams() { return properties.map((property) => ({ slug: property.slug })); }
export default function StayDetailPage({ params }: { params: { slug: string } }) { const property = properties.find((item) => item.slug === params.slug); if (!property) notFound(); return <StayDetail property={property} />; }
