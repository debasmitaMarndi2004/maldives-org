import { accommodationAmenities, accommodationAtolls, accommodationIslands, accommodationKinds, accommodations, type Accommodation, type AccommodationKind } from "./catalog";

export type AccommodationFilters = { q: string; island: string; atoll: string; type: string; amenities: string[]; sort: string };
export const emptyFilters: AccommodationFilters = { q: "", island: "", atoll: "", type: "", amenities: [], sort: "name" };
export const normalizeAccommodationText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function parseAccommodationFilters(params: URLSearchParams, category?: AccommodationKind): AccommodationFilters {
  const member = (key: string, allowed: readonly string[]) => allowed.includes(params.get(key) || "") ? params.get(key)! : "";
  const where = params.get("where");
  return {
    q: (params.get("q") || (where && where !== "Maldives" ? where : "")).slice(0, 120),
    island: member("island", accommodationIslands),
    atoll: member("atoll", accommodationAtolls),
    type: category || member("type", accommodationKinds),
    amenities: Array.from(new Set(params.getAll("amenity"))).filter((v) => accommodationAmenities.includes(v)),
    sort: member("sort", ["name", "name-desc"]) || "name",
  };
}

export function accommodationFilterQuery(filters: AccommodationFilters, category?: AccommodationKind) {
  const params = new URLSearchParams();
  for (const key of ["q", "island", "atoll", "type"] as const) {
    if (filters[key] && !(key === "type" && category)) params.set(key, filters[key]);
  }
  filters.amenities.forEach((v) => params.append("amenity", v));
  if (filters.sort !== "name") params.set("sort", filters.sort);
  return params.toString();
}

export function filterAccommodations(filters: AccommodationFilters, catalog: readonly Accommodation[] = accommodations) {
  const term = normalizeAccommodationText(filters.q);
  return catalog.filter((p) =>
    (!term || normalizeAccommodationText(`${p.name} ${p.island} ${p.atoll || ""} ${p.amenities.join(" ")}`).includes(term)) &&
    (!filters.island || p.island === filters.island) &&
    (!filters.atoll || p.atoll === filters.atoll) &&
    (!filters.type || p.kind === filters.type) &&
    filters.amenities.every((a) => p.amenities.includes(a))
  ).sort((a, b) => (filters.sort === "name-desc" ? -1 : 1) * a.name.localeCompare(b.name));
}
