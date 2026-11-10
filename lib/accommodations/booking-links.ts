import "server-only";
import { accommodations } from "./catalog";
import { parseStay22Links } from "@/lib/stay22";

/** New adapter; existing AFFILIATE_APPROVED_LINKS_JSON is never rewritten. */
export function getAccommodationBookingLinks(slug: string) {
  const parsed = parseStay22Links(process.env.STAY22_APPROVED_LINKS_JSON, new Set(accommodations.map((p) => p.slug)));
  return process.env.STAY22_ENABLED === "true" && parsed.status === "ready"
    ? parsed.links.filter((link) => link.slug === slug) : [];
}
