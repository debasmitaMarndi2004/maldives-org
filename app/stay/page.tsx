import { AccommodationDirectory } from "@/components/accommodations/directory";
import { pageAccommodationFilters } from "@/lib/accommodations/page-filters";
import { accommodationDirectoryMetadata } from "@/lib/accommodations/metadata";

export const metadata = accommodationDirectoryMetadata();

type SearchParams = Record<string, string | string[] | undefined>;

export default async function StayPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const filters = pageAccommodationFilters((await searchParams) ?? {});
  return <AccommodationDirectory key={JSON.stringify(filters)} initialFilters={filters} />;
}
