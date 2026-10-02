import { notFound } from "next/navigation";
import { GuideDetail } from "@/components/public-pages";
import { guides } from "@/lib/data";
export function generateStaticParams() { return guides.map((guide) => ({ slug: guide.slug })); }
export default function GuideDetailPage({ params }: { params: { slug: string } }) { const guide = guides.find((item) => item.slug === params.slug); if (!guide) notFound(); return <GuideDetail guide={guide} />; }
