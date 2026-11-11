import { ToursDiscovery } from "@/components/tours/tours-discovery";
import { tourCategories } from "@/lib/tours/ideas";
import { parseTourFilters } from "@/lib/tours/viator-data";

export const metadata = {
  title: "Tours & Activities in the Maldives — Maldives.org",
  description: "Discover Maldives tours supplied by Viator. Search activities, compare starting prices and explore tour details before booking on Viator.",
  alternates: { canonical: "https://maldives.org/tours-and-activities" },
};
export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const params = await searchParams;
  const guideQuery = params.guideQ ?? params.q, guideCategory = params.guideCategory ?? params.category;
  const q = typeof guideQuery === "string" ? guideQuery.slice(0,120) : "";
  const category = typeof guideCategory === "string" && tourCategories.includes(guideCategory) ? guideCategory : "";
  const input = new URLSearchParams();
  for (const key of ["q", "category", "currency", "maxPrice", "duration", "sort", "page"]) if (typeof params[key] === "string") input.set(key, params[key] as string);
  const initialFilters = parseTourFilters(input) || parseTourFilters(new URLSearchParams())!;
  return <ToursDiscovery initialQuery={q} initialCategory={category} initialFilters={initialFilters}/>;
}
