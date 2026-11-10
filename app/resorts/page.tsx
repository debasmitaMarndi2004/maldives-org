import { AccommodationDirectory } from "@/components/accommodations/directory";
import { pageAccommodationFilters, type AccommodationSearchParams } from "@/lib/accommodations/page-filters";
import { accommodationDirectoryMetadata } from "@/lib/accommodations/metadata";
export const metadata = accommodationDirectoryMetadata("/resorts", "Maldives Resorts");
export default async function ResortsPage({ searchParams }: { searchParams: Promise<AccommodationSearchParams> }) {
  const filters = pageAccommodationFilters(await searchParams, "Resort");
  return <AccommodationDirectory key={JSON.stringify(filters)} category="Resort" initialFilters={filters}/>;
}
