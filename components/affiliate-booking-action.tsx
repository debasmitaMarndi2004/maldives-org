"use client";

import Link from "next/link";
import { affiliateProviders, type AffiliateProductType } from "@/lib/affiliate-providers";
import { useAffiliateCatalog } from "@/components/affiliate-provider";

export function AffiliateBookingAction({ productType, slug, detailsHref, compact = false }: {
  productType: AffiliateProductType;
  slug: string;
  detailsHref?: string;
  compact?: boolean;
}) {
  const { catalog, loading, failed, retry } = useAffiliateCatalog();
  const offers = !loading && !failed && catalog?.status === "ready" ? catalog.offers.filter((offer) => offer.productType === productType && offer.slug === slug) : [];
  const fallback = `/${productType === "stay" ? "stay" : "experiences"}/${encodeURIComponent(slug)}`;
  const details = detailsHref?.startsWith("/") && !detailsHref.startsWith("//") && !detailsHref.includes("\\") ? detailsHref : fallback;
  const providers = Object.entries(affiliateProviders).filter(([, provider]) => (provider.productTypes as readonly string[]).includes(productType));

  return <div className={`affiliate-action${compact ? " affiliate-action-compact" : ""}`}>
    {offers.length ? <>
      {offers.map((offer) => <div className="affiliate-partner" key={offer.provider}>
        <span className="eyebrow">Booking provider · {offer.label}</span>
        <a className="button button-teal full-button" href={offer.href} target="_blank" rel="sponsored noopener noreferrer">Continue on {offer.label} ↗</a>
      </div>)}
      <p className="affiliate-disclosure">Booking, payment, final prices and availability are handled on the partner website. Opens in a new tab.</p>
    </> : <>
      <p className="affiliate-status" role="status">{failed ? "Partner links are temporarily unavailable." : loading ? "Checking partner links…" : "Partner booking is not available for this listing yet."}</p>
      {!compact && <p className="affiliate-provider-labels">Providers: {providers.map(([, provider]) => provider.label).join(" · ")}. Approved links have not been connected for this listing.</p>}
      <Link className="text-link" href={details}>View {productType === "stay" ? "stay" : "experience"} details ↗</Link>
      {failed && <button className="text-link affiliate-retry" type="button" onClick={retry}>Retry partner links</button>}
    </>}
  </div>;
}
