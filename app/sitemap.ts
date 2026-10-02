import type { MetadataRoute } from "next";
import { experiences, guides, properties } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "/stay", "/resorts", "/guesthouses", "/experiences", "/transfers", "/guides", "/deals", "/atolls", "/plan-your-trip", "/compare", "/about", "/contact", "/faq", "/how-it-works", "/affiliate-disclosure", "/hotelbeds-certification", "/booking", "/checkout"];
  return [...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })), ...properties.map((property) => ({ url: `${base}/stay/${property.slug}`, lastModified: new Date() })), ...experiences.map((experience) => ({ url: `${base}/experiences/${experience.slug}`, lastModified: new Date() })), ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}`, lastModified: new Date() }))];
}
