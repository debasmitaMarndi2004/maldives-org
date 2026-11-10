/** Public provider metadata and pure validation. Never place credentials here. */
export const affiliateProviders = {
  travelpayouts: {
    label: "Travelpayouts",
    hosts: ["tp.media", "travelpayouts.com", "www.travelpayouts.com"],
    productTypes: ["stay", "experience"],
  },
  viator: {
    label: "Viator",
    hosts: ["viator.com", "www.viator.com"],
    productTypes: ["experience"],
  },
  "booking-com": {
    label: "Booking.com",
    hosts: ["booking.com", "www.booking.com"],
    productTypes: ["stay"],
  },
  getyourguide: {
    label: "GetYourGuide",
    hosts: ["getyourguide.com", "www.getyourguide.com"],
    productTypes: ["experience"],
  },
} as const;

export type AffiliateProviderId = keyof typeof affiliateProviders;
export type AffiliateProductType = "stay" | "experience";
export type ApprovedAffiliateLink = {
  provider: AffiliateProviderId;
  productType: AffiliateProductType;
  slug: string;
  approved: true;
  url: string;
};

export type PublicAffiliateOffer = {
  provider: AffiliateProviderId;
  label: string;
  productType: AffiliateProductType;
  slug: string;
  href: string;
};

export type AffiliateCatalog = {
  status: "ready" | "unconfigured" | "invalid";
  providers: { id: AffiliateProviderId; label: string; available: boolean }[];
  offers: PublicAffiliateOffer[];
};

export function isAffiliateProvider(value: unknown): value is AffiliateProviderId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(affiliateProviders, value);
}

export function isAffiliateProductType(value: unknown): value is AffiliateProductType {
  return value === "stay" || value === "experience";
}

export function isProductSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120;
}

/**
 * Accept an exact, manually approved HTTPS destination, never a caller-supplied
 * redirect. The original string is retained so attribution is not regenerated.
 */
export function isApprovedDestination(provider: AffiliateProviderId, value: unknown): value is string {
  if (!isAffiliateProvider(provider)) return false;
  if (typeof value !== "string" || value.length > 4096 || !value.startsWith("https://")) return false;
  if (/[\u0000-\u0020\u007f\\]/.test(value) || /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return false;
  const authority = value.slice(8).split(/[/?#]/, 1)[0];
  if (!authority || /[:@]/.test(authority)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    const hosts: readonly string[] = affiliateProviders[provider].hosts;
    if (!hosts.includes(url.hostname)) return false;
    // Disallow nested destinations and common open-redirect parameters. Markers,
    // campaign IDs and other ordinary approved tracking fields remain untouched.
    for (const [key, parameter] of Array.from(url.searchParams.entries())) {
      const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
      if (key.includes("%")) return false;
      if (/(?:url|redirect|destination|returnto|returnpath|next|continue|callback|target)/.test(normalized)) return false;
      if (/^(?:https?:|javascript:|data:|\/\/)/i.test(parameter.trim())) return false;
      let decoded = parameter;
      for (let depth = 0; depth < 3 && decoded.includes("%"); depth += 1) {
        decoded = decodeURIComponent(decoded);
        if (/^(?:https?:|javascript:|data:|\/\/)/i.test(decoded.trim())) return false;
      }
    }
    const path = decodeURIComponent(url.pathname);
    if (path.includes("%") || /(?:^|\/)(?:redirect|redirector|out|goto)(?:\/|$)/i.test(path)) return false;
    return true;
  } catch {
    return false;
  }
}

export type ParsedAffiliateLinks = {
  status: AffiliateCatalog["status"];
  links: ApprovedAffiliateLink[];
};

/** Pure parser, usable by focused security tests without reading process.env. */
export function parseApprovedLinks(raw: string | undefined, knownProducts?: ReadonlySet<string>): ParsedAffiliateLinks {
  if (!raw?.trim()) return { status: "unconfigured", links: [] };
  const invalid: ParsedAffiliateLinks = { status: "invalid", links: [] };
  if (raw.length > 131072) return invalid;
  try {
    const records: unknown = JSON.parse(raw);
    if (!Array.isArray(records) || records.length > 500) return invalid;
    const links: ApprovedAffiliateLink[] = [];
    const seen = new Set<string>();
    for (const record of records) {
      if (!record || typeof record !== "object" || Array.isArray(record)) return invalid;
      const entry = record as Record<string, unknown>;
      if (Object.keys(entry).some((key) => !["provider", "productType", "slug", "approved", "url"].includes(key))) return invalid;
      if (!isAffiliateProvider(entry.provider) || !isAffiliateProductType(entry.productType) || !isProductSlug(entry.slug) || entry.approved !== true) return invalid;
      const types: readonly string[] = affiliateProviders[entry.provider].productTypes;
      if (!types.includes(entry.productType) || !isApprovedDestination(entry.provider, entry.url)) return invalid;
      const product = `${entry.productType}:${entry.slug}`;
      if (knownProducts && !knownProducts.has(product)) return invalid;
      const key = `${entry.provider}:${product}`;
      if (seen.has(key)) return invalid;
      seen.add(key);
      links.push({ provider: entry.provider, productType: entry.productType, slug: entry.slug, approved: true, url: entry.url });
    }
    return { status: links.length ? "ready" : "unconfigured", links };
  } catch {
    return invalid;
  }
}

export function affiliateHandoffPath(link: Pick<ApprovedAffiliateLink, "provider" | "productType" | "slug">) {
  return `/out/${link.provider}/${encodeURIComponent(`${link.productType}:${link.slug}`)}`;
}
