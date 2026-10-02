import { notFound } from "next/navigation";
import { StayDetail } from "@/components/public-pages";
import { properties } from "@/lib/data";

export function generateStaticParams() { return properties.filter((property) => property.kind === "Guesthouse").map((property) => ({ slug: property.slug })); }
export default async function GuesthouseDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const property = properties.find((item) => item.kind === "Guesthouse" && item.slug === slug); if (!property) notFound(); return <StayDetail property={property} />; }
