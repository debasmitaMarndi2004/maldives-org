import { isApprovedDestination } from "@/lib/affiliate-providers";

export const MALDIVES_DESTINATION = 4672;
export const VIATOR_PAGE_SIZE = 12;
// Labels/IDs verified against the official /products/tags response.
export const viatorCategories = { Diving: 12021, Cruises: 21701, Snorkelling: 11912, Culture: 12028 } as const;
export const viatorCurrencies = ["USD", "EUR", "GBP", "INR", "AED"] as const;
export type TourCurrency = typeof viatorCurrencies[number];
export type TourFilters = { q: string; category: string; currency: TourCurrency; maxPrice: number | null; duration: number | null; sort: string; page: number };
export type ViatorTour = {
  code: string; title: string; description: string; image: string | null;
  rating: number | null; reviews: number | null; price: number | null; currency: string | null;
  durationMinutes: number | null; bookingUrl: string | null;
  inclusions: string[]; exclusions: string[]; cancellation: string | null;
};
export type TourResults = { ok: true; tours: ViatorTour[]; total: number | null; page: number; currency: TourCurrency; sandbox: boolean };
export const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export const text = (value: unknown, max = 15000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
export const validTourCode = (value: string) => /^[A-Za-z0-9_-]{2,100}$/.test(value);

export function parseTourFilters(params: URLSearchParams): TourFilters | null {
  const allowed = ["q", "category", "currency", "maxPrice", "duration", "sort", "page"];
  if (Array.from(params.keys()).some(key => !allowed.includes(key) || params.getAll(key).length !== 1)) return null;
  const q = (params.get("q") || "").trim(), category = params.get("category") || "";
  const currency = params.get("currency") || "USD", sort = params.get("sort") || "recommended";
  const pageText = params.get("page") || "1", priceText = params.get("maxPrice"), durationText = params.get("duration");
  if (q.length > 120 || /[\u0000-\u001f\u007f]/.test(q) || (category && !Object.prototype.hasOwnProperty.call(viatorCategories, category))) return null;
  if (!(viatorCurrencies as readonly string[]).includes(currency) || !["recommended", "price-asc", "rating-desc"].includes(sort)) return null;
  if (!/^[1-9]\d{0,2}$/.test(pageText) || Number(pageText) > 100) return null;
  if (priceText !== null && (!/^\d{1,6}(\.\d{1,2})?$/.test(priceText) || Number(priceText) <= 0 || Number(priceText) > 100000)) return null;
  if (durationText !== null && !["120", "240", "480"].includes(durationText)) return null;
  return { q, category, currency: currency as TourCurrency, maxPrice: priceText === null ? null : Number(priceText), duration: durationText === null ? null : Number(durationText), sort, page: Number(pageText) };
}

/** Both documented search endpoints always receive an authoritative geographic filter. */
export function viatorSearchRequest(filters: TourFilters) {
  const tags = filters.category ? [viatorCategories[filters.category as keyof typeof viatorCategories]] : undefined;
  const pagination = { start: (filters.page - 1) * VIATOR_PAGE_SIZE + 1, count: VIATOR_PAGE_SIZE };
  const sorting = filters.sort === "price-asc" ? { sort: "PRICE", order: "ASCENDING" } : filters.sort === "rating-desc" ? { sort: "TRAVELER_RATING", order: "DESCENDING" } : undefined;
  // Free-text and destination search use different documented rating sort names.
  const textSorting = filters.sort === "rating-desc" ? { sort: "REVIEW_AVG_RATING" } : sorting;
  const common = { destination: String(MALDIVES_DESTINATION), ...(tags ? { tags } : {}), ...(filters.duration ? { durationInMinutes: { from: 0, to: filters.duration } } : {}) };
  return filters.q ? {
    path: "/partner/search/freetext",
    body: { searchTerm: filters.q, productFiltering: { ...common, ...(filters.maxPrice !== null ? { price: { from: 0, to: filters.maxPrice } } : {}) }, ...(textSorting ? { productSorting: textSorting } : {}), searchTypes: [{ searchType: "PRODUCTS", pagination }], currency: filters.currency },
  } : {
    path: "/partner/products/search",
    body: { filtering: { ...common, ...(filters.maxPrice !== null ? { highestPrice: filters.maxPrice } : {}) }, ...(sorting ? { sorting } : {}), pagination, currency: filters.currency },
  };
}

export function maldivesDestinationIds(payload: unknown) {
  const rows = record(payload).destinations;
  const ids = new Set<string>([String(MALDIVES_DESTINATION)]);
  if (!Array.isArray(rows)) return ids;
  // Include every descendant, not just destinations whose names contain Maldives.
  for (let pass = 0; pass < rows.length; pass++) {
    let added = false;
    for (const value of rows) {
      const row = record(value), id = String(row.destinationId ?? "");
      if (id && ids.has(String(row.parentDestinationId)) && !ids.has(id)) { ids.add(id); added = true; }
    }
    if (!added) break;
  }
  return ids;
}

function imageUrl(value: unknown) {
  const raw = text(value, 2048);
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && ["media-cdn.tripadvisor.com", "hare-media-cdn.tripadvisor.com", "cache.graphicslib.viator.com"].includes(url.hostname) ? raw : null;
  } catch { return null; }
}
function productImage(value: unknown) {
  if (!Array.isArray(value)) return null;
  const images = value.map(record), cover = images.find(image => image.isCover === true) || images[0];
  const variants = cover?.variants;
  if (!Array.isArray(variants)) return null;
  const sorted = variants.map(record).filter(v => imageUrl(v.url)).sort((a, b) => Math.abs(Number(a.width) - 720) - Math.abs(Number(b.width) - 720));
  return imageUrl(sorted[0]?.url);
}
function inclusionList(value: unknown) {
  return Array.isArray(value) ? value.slice(0, 60).map(item => { const row = record(item); return text(row.otherDescription || row.description, 1000); }).filter(Boolean) : [];
}

export function normalizeViatorTour(value: unknown, allowedDestinations: ReadonlySet<string>): ViatorTour | null {
  const row = record(value), code = text(row.productCode, 100), title = text(row.title, 500);
  if (!validTourCode(code) || !title || (row.status !== undefined && row.status !== "ACTIVE")) return null;
  if (!Array.isArray(row.destinations) || !row.destinations.some(d => allowedDestinations.has(String(record(d).ref)))) return null;
  const review = record(row.reviews), rating = finite(review.combinedAverageRating), reviews = finite(review.totalReviews);
  const pricing = record(row.pricing), price = finite(record(pricing.summary).fromPrice), currency = text(pricing.currency, 3);
  const duration = record(row.duration || record(row.itinerary).duration);
  const minutes = finite(duration.fixedDurationInMinutes) ?? finite(duration.variableDurationFromMinutes);
  const rawUrl = text(row.productUrl, 4096);
  const bookingUrl = isApprovedDestination("viator", rawUrl) ? rawUrl : null;
  return {
    code, title, description: text(row.description), image: productImage(row.images),
    rating: rating !== null && rating >= 0 && rating <= 5 && reviews !== null && reviews > 0 ? rating : null,
    reviews: reviews !== null && Number.isInteger(reviews) && reviews > 0 ? reviews : null,
    price: price !== null && price > 0 && /^[A-Z]{3}$/.test(currency) ? price : null, currency: /^[A-Z]{3}$/.test(currency) ? currency : null,
    durationMinutes: minutes !== null && minutes > 0 ? minutes : null,
    bookingUrl, inclusions: inclusionList(row.inclusions), exclusions: inclusionList(row.exclusions), cancellation: text(record(row.cancellationPolicy).description, 3000) || null,
  };
}
