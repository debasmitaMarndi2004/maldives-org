import type { SiteContent } from "./admin/content-schema";

export type { InfoPage, SiteContent } from "./admin/content-schema";

export const heroImages = {
  lagoon: { label: "Original lagoon", path: "/images/home-redesign/hero.webp" },
  resort: { label: "Overwater resort", path: "/images/home-redesign/service-stays.webp" },
  islands: { label: "Island panorama", path: "/images/home-redesign/guide.webp" },
} as const;

export const accents = { original: "Original gold", lagoon: "Lagoon blue", sand: "Warm sand" } as const;
export const homeSections = { experiences: "Experiences", guides: "Travel guides", newsletter: "Newsletter" } as const;
export const legalKeys = ["terms", "privacy", "cookies", "affiliate", "cancellation"] as const;

export const originalSite: SiteContent = {
  hero: {
    firstLine: "Find your perfect", secondLine: "Maldives getaway.",
    intro: "Explore extraordinary resorts, overwater villas, unforgettable experiences, and travel options — all in one place.",
    staysLabel: "Explore Resorts", experiencesLabel: "Discover Experiences", image: "lagoon", accent: "original",
  },
  homeSections: [{ key: "experiences", visible: true }, { key: "guides", visible: true }, { key: "newsletter", visible: true }],
  serviceDescriptions: {
    flights: "Plan your arrival and the onward transfer to your island.",
    stays: "Discover resorts, overwater villas and handpicked stays.",
    tours: "Explore snorkeling, diving, island hopping and more.",
  },
  footer: { firstLine: "Discover. Compare.", secondLine: "Book. Experience.", newsletter: "Island notes, thoughtful stays and good reasons to go." },
  legalNotes: { terms: "", privacy: "", cookies: "", affiliate: "", cancellation: "" },
  pages: [],
};
