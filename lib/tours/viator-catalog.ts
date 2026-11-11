import "server-only";
import { cache } from "react";
import { getViatorConfig, viatorRequest } from "@/lib/viator";
import { maldivesDestinationIds, normalizeViatorTour, record, validTourCode, viatorSearchRequest, type TourFilters, type TourResults } from "./viator-data";

let destinationCache: { environment: string; expires: number; ids: ReadonlySet<string> } | null = null;
async function destinationIds() {
  const { environment } = getViatorConfig();
  if (destinationCache?.environment === environment && destinationCache.expires > Date.now()) return destinationCache.ids;
  const result = await viatorRequest<unknown>("/partner/destinations");
  if (!result.response.ok || !Array.isArray(record(result.data).destinations)) throw new Error("Destination data unavailable.");
  const ids = maldivesDestinationIds(result.data);
  destinationCache = { environment, expires: Date.now() + 3600000, ids };
  return ids;
}

export async function searchViatorTours(filters: TourFilters): Promise<TourResults> {
  const query = viatorSearchRequest(filters);
  const [result, ids] = await Promise.all([viatorRequest<unknown>(query.path, { method: "POST", body: JSON.stringify(query.body) }), destinationIds()]);
  if (!result.response.ok) throw new Error("Viator search unavailable.");
  const data = record(result.data), group = filters.q ? record(data.products) : data;
  const rows = filters.q ? group.results : group.products;
  if (!Array.isArray(rows)) throw new Error("Invalid provider response.");
  const tours = rows.map(value => normalizeViatorTour(value, ids)).filter((tour): tour is NonNullable<typeof tour> => tour !== null);
  const total = group.totalCount;
  return { ok: true, tours, total: typeof total === "number" && Number.isInteger(total) && total >= 0 ? total : null, page: filters.page, currency: filters.currency, sandbox: result.environment !== "production" };
}

export const getViatorTour = cache(async (code: string) => {
  if (!validTourCode(code)) return null;
  const [result, ids] = await Promise.all([viatorRequest<unknown>(`/partner/products/${encodeURIComponent(code)}`), destinationIds()]);
  if (result.response.status === 404) return null;
  if (!result.response.ok) throw new Error("Tour details unavailable.");
  const tour = normalizeViatorTour(result.data, ids);
  // The API URL is retained byte-for-byte, including the account's attribution.
  return tour ? { tour, sandbox: result.environment !== "production" } : null;
});
