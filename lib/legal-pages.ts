import type { Metadata } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

export const legalPages = {
  terms: {
    href: "/terms",
    title: "Terms of Use",
    description: "How to use Maldives.org and what to check before booking with a travel provider.",
  },
  privacy: {
    href: "/privacy",
    title: "Privacy Policy",
    description: "What information Maldives.org handles when you browse and use preview forms.",
  },
  cookies: {
    href: "/cookies",
    title: "Cookie Policy",
    description: "How Maldives.org uses browser storage and how to clear your saved preference.",
  },
  affiliate: {
    href: "/affiliate-disclosure",
    title: "Affiliate Disclosure",
    description: "When Maldives.org may earn a commission and how to identify partner links.",
  },
  cancellation: {
    href: "/cancellation-policy",
    title: "Cancellations & Refunds",
    description: "Where to request a change, cancellation, or refund for a booking made with a travel provider.",
  },
} as const;

export type LegalPolicy = keyof typeof legalPages;

export function legalMetadata(policy: LegalPolicy): Metadata {
  const page = legalPages[policy];
  return {
    title: `${page.title} | Maldives.org`,
    description: page.description,
    alternates: { canonical: new URL(page.href, getSiteOrigin()).href },
  };
}
