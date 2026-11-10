import { getApprovedAffiliateLinks } from "@/lib/affiliate-config";
import { isAffiliateProvider, isAffiliateProductType, isProductSlug } from "@/lib/affiliate-providers";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string; product: string }> }) {
  const { provider, product } = await params;
  const url = new URL(request.url);
  // This endpoint never consumes a destination, tracking ID or URL from a user.
  if (url.search || !isAffiliateProvider(provider)) {
    return Response.json({ ok: false, message: "This partner handoff is not valid." }, { status: 400 });
  }
  const parts = product.split(":");
  if (parts.length !== 2 || !isAffiliateProductType(parts[0]) || !isProductSlug(parts[1])) {
    return Response.json({ ok: false, message: "This partner handoff is not valid." }, { status: 400 });
  }
  const link = getApprovedAffiliateLinks().links.find((entry) => entry.provider === provider && entry.productType === parts[0] && entry.slug === parts[1]);
  if (!link) {
    return Response.json({ ok: false, message: "Partner booking is unavailable for this listing. Return to its details to continue exploring." }, { status: 404 });
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: link.url,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
