import "server-only";

import { experiences, properties } from "@/lib/data";
import { affiliateHandoffPath, affiliateProviders, parseApprovedLinks, type AffiliateCatalog, type AffiliateProviderId } from "@/lib/affiliate-providers";

const knownProducts = new Set([
  ...properties.map((property) => `stay:${property.slug}`),
  ...experiences.map((experience) => `experience:${experience.slug}`),
]);

/** Server-only reviewed links; no API credentials are needed for outbound links. */
export function getApprovedAffiliateLinks() {
  return parseApprovedLinks(process.env.AFFILIATE_APPROVED_LINKS_JSON, knownProducts);
}

export function getPublicAffiliateCatalog(): AffiliateCatalog {
  const configuration = getApprovedAffiliateLinks();
  return {
    status: configuration.status,
    providers: (Object.keys(affiliateProviders) as AffiliateProviderId[]).map((id) => ({
      id,
      label: affiliateProviders[id].label,
      available: configuration.links.some((link) => link.provider === id),
    })),
    offers: configuration.links.map((link) => ({
      provider: link.provider,
      label: affiliateProviders[link.provider].label,
      productType: link.productType,
      slug: link.slug,
      href: affiliateHandoffPath(link),
    })),
  };
}
