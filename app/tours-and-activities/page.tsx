import { ToursDiscovery } from "@/components/tours/tours-discovery";
import { tourCategories } from "@/lib/tours/ideas";

export const metadata = {
  title: "Tours & Activities in the Maldives — Maldives.org",
  description: "Explore Maldives activity ideas, from reef snorkelling and manta rays to sunset cruises and local islands.",
  alternates: { canonical: "https://maldives.org/tours-and-activities" },
};
export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const params = await searchParams;
  const guideQuery = params.guideQ ?? params.q, guideCategory = params.guideCategory ?? params.category;
  const q = typeof guideQuery === "string" ? guideQuery.slice(0,120) : "";
  const category = typeof guideCategory === "string" && tourCategories.includes(guideCategory) ? guideCategory : "";
  return <ToursDiscovery initialQuery={q} initialCategory={category} />;
}
