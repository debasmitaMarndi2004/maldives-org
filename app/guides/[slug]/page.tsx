import { notFound } from "next/navigation";
import { GuideDetail } from "@/components/public-pages";
import { guides } from "@/lib/data";
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const guide = guides.find((item) => item.slug === slug); if (!guide) notFound(); return <GuideDetail guide={guide} />; }
