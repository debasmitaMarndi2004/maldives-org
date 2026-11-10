import { AccommodationDirectory } from "@/components/accommodations/directory";
import { pageAccommodationFilters, type AccommodationSearchParams } from "@/lib/accommodations/page-filters";
import { accommodationDirectoryMetadata } from "@/lib/accommodations/metadata";
export const metadata = accommodationDirectoryMetadata("/guesthouses", "Maldives Guesthouses");
export default async function GuesthousesPage({ searchParams }: { searchParams: Promise<AccommodationSearchParams> }) {
  const filters = pageAccommodationFilters(await searchParams, "Guesthouse");
  return <AccommodationDirectory key={JSON.stringify(filters)} category="Guesthouse" initialFilters={filters}/>;
}
