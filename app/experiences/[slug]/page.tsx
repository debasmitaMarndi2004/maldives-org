import { notFound } from "next/navigation";
import { ExperienceDetail } from "@/components/public-pages";
import { experiences } from "@/lib/data";
export function generateStaticParams() { return experiences.map((experience) => ({ slug: experience.slug })); }
export default function ExperienceDetailPage({ params }: { params: { slug: string } }) { const experience = experiences.find((item) => item.slug === params.slug); if (!experience) notFound(); return <ExperienceDetail experience={experience} />; }
