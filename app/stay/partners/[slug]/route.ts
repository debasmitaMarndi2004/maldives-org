import { findAccommodation } from "@/lib/accommodations/catalog";
import { getAccommodationBookingLinks } from "@/lib/accommodations/booking-links";
import { accommodationPartnerDocument } from "@/lib/accommodations/partner-document";
import { isStay22Host } from "@/lib/stay22";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const url = new URL(request.url);
  if (url.search) return new Response("Booking handoff does not accept query parameters.", { status: 400 });
  const { slug } = await params;
  const property = findAccommodation(slug);
  if (!property) return new Response("Accommodation not found.", { status: 404 });
  const links = getAccommodationBookingLinks(slug);
  return new Response(accommodationPartnerDocument(property, links, url.protocol === "https:" && isStay22Host(url.hostname)), {
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
      "Cross-Origin-Opener-Policy": "same-origin", "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
