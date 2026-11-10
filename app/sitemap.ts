import type { MetadataRoute } from "next";
import { tourIdeas } from "@/lib/tours/ideas";
import { experiences, guides } from "@/lib/data";
import { accommodations } from "@/lib/accommodations/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "/stay", "/resorts", "/guesthouses", "/experiences", "/tours-and-activities", "/transfers", "/guides", "/deals", "/atolls", "/plan-your-trip", "/compare", "/about", "/contact", "/faq", "/how-it-works", "/affiliate-disclosure", "/hotelbeds-certification", "/booking", "/checkout"];
  return [...routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })), ...accommodations.map((property) => ({ url: `${base}/stay/${property.slug}`, lastModified: new Date(`${property.reviewedOn}T00:00:00Z`) })), ...tourIdeas.map((idea) => ({ url: `${base}/tours-and-activities/${idea.slug}` })), ...experiences.map((experience) => ({ url: `${base}/experiences/${experience.slug}`, lastModified: new Date() })), ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}`, lastModified: new Date() }))];
}
