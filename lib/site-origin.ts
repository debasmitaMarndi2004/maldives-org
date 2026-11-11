export const productionSiteOrigin = "https://maldives.org";

export function normalizeSiteOrigin(value: string | undefined): string {
  if (!value?.trim()) return productionSiteOrigin;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return productionSiteOrigin;
    return url.origin;
  } catch { return productionSiteOrigin; }
}

export function getSiteOrigin() { return normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL); }
