import { parseAccommodationFilters } from "./search";
import type { AccommodationKind } from "./catalog";

export type AccommodationSearchParams = Record<string, string | string[] | undefined>;
export function pageAccommodationFilters(params: AccommodationSearchParams, category?: AccommodationKind) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => query.append(key, v));
    else if (typeof value === "string") query.set(key, value);
  }
  return parseAccommodationFilters(query, category);
}
