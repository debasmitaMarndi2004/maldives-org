import type { Metadata } from "next";
import { findAccommodation } from "./catalog";

const site = "https://maldives.org";
export function accommodationDirectoryMetadata(path = "/stay", title = "Hotels & Resorts in the Maldives"): Metadata {
  return {
    title: `${title} — Maldives.org`,
    description: "Explore Maldives accommodations by island, atoll, type and documented amenities. Check final availability and book on an external partner website.",
    alternates: { canonical: `${site}${path}` },
  };
}
export function accommodationDetailMetadata(slug: string): Metadata {
  const item = findAccommodation(slug);
  return item ? {
    title: `${item.name} · ${item.island} — Maldives.org`,
    description: item.description,
    alternates: { canonical: `${site}/stay/${item.slug}` },
  } : { title: "Sample accommodation preview — Maldives.org", robots: { index: false, follow: false } };
}
