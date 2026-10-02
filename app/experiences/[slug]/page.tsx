import { notFound } from "next/navigation";
import { ExperienceDetail } from "@/components/public-pages";
import { experiences } from "@/lib/data";
export function generateStaticParams() { return experiences.map((experience) => ({ slug: experience.slug })); }
export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const experience = experiences.find((item) => item.slug === slug); if (!experience) notFound(); return <ExperienceDetail experience={experience} />; }
