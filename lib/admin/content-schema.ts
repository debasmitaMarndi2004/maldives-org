import "server-only";

import { z } from "zod";

const line = (limit: number) => z.string().trim().min(1).max(limit);
export const pageSlug = z.string().max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const infoPage = z.object({
  slug: pageSlug,
  title: line(80),
  intro: line(240),
  sections: z.array(z.object({ title: line(90), body: line(2000) })).min(1).max(4),
  footerLink: z.boolean(),
});

export const siteContentSchema = z.object({
  hero: z.object({
    firstLine: line(45), secondLine: line(45), intro: line(180),
    staysLabel: line(28), experiencesLabel: line(28),
    image: z.enum(["lagoon", "resort", "islands"]),
    accent: z.enum(["original", "lagoon", "sand"]),
  }),
  homeSections: z.array(z.object({ key: z.enum(["experiences", "guides", "newsletter"]), visible: z.boolean() }))
    .length(3).refine(sections => new Set(sections.map(section => section.key)).size === 3),
  serviceDescriptions: z.object({ flights: line(90), stays: line(90), tours: line(90) }),
  footer: z.object({ firstLine: line(50), secondLine: line(50), newsletter: line(100) }),
  legalNotes: z.object({ terms: z.string().trim().max(1200), privacy: z.string().trim().max(1200),
    cookies: z.string().trim().max(1200), affiliate: z.string().trim().max(1200), cancellation: z.string().trim().max(1200) }),
  pages: z.array(infoPage).max(12).refine(pages => new Set(pages.map(page => page.slug)).size === pages.length),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type InfoPage = z.infer<typeof infoPage>;
