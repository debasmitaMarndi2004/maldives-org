import "server-only";

import { z } from "zod";

export const roles = ["owner", "publisher", "editor"] as const;
export type Role = typeof roles[number];
export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
export const canPublish = (role: Role) => role === "owner" || role === "publisher";

export const categories = ["Accommodation", "Tours & activities", "Flights", "Transfers"] as const;
export const affiliateStatuses = ["Shortlisted", "Applied", "Sandbox", "Approved", "Paused"] as const;
export const paymentModels = ["Under review", "Partner collects", "Referral", "Other"] as const;

export const affiliateSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(80),
  category: z.enum(categories),
  status: z.enum(affiliateStatuses),
  payment: z.enum(paymentModels),
  commissionReviewed: z.boolean(),
  supportReviewed: z.boolean(),
});

export type Affiliate = z.infer<typeof affiliateSchema>;
export const affiliatesSchema = z.array(affiliateSchema).max(40);

const shortlistedPartners = [
  { id: "af000001-7280-4e10-9e7f-9fb95f169e01", name: "Booking.com Demand API", category: "Accommodation" },
  { id: "af000002-7280-4e10-9e7f-9fb95f169e02", name: "Expedia Rapid", category: "Accommodation" },
  { id: "af000003-7280-4e10-9e7f-9fb95f169e03", name: "TUI Musement", category: "Tours & activities" },
  { id: "af000004-7280-4e10-9e7f-9fb95f169e04", name: "Viator", category: "Tours & activities" },
] satisfies Pick<Affiliate, "id" | "name" | "category">[];

export const originalAffiliates: Affiliate[] = shortlistedPartners.map(partner => ({
  ...partner,
  status: "Shortlisted",
  payment: "Under review",
  commissionReviewed: false,
  supportReviewed: false,
}));
