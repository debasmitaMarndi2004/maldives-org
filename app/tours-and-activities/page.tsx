import { ToursDiscovery } from "@/components/tours/tours-discovery";
import { tourCategories } from "@/lib/tours/ideas";

export const metadata = {
  title: "Tours & Activities in the Maldives — Maldives.org",
  description: "Explore Maldives activity ideas, from reef snorkelling and diving to sunset cruises, sandbank picnics and island hopping. Find practical planning guidance.",
  alternates: { canonical: "https://maldives.org/tours-and-activities" },
};
export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0,120) : "";
  const category = typeof params.category === "string" && tourCategories.includes(params.category) ? params.category : "";
  return <ToursDiscovery key={`${q}:${category}`} initialQuery={q} initialCategory={category}/>;
}
