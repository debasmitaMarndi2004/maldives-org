import { getViatorTour } from "@/lib/tours/viator-catalog";
import { validTourCode } from "@/lib/tours/viator-data";
import { allowRequest, requestKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "strict-origin-when-cross-origin" };
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (new URL(request.url).search || !validTourCode(code)) return new Response("Invalid booking handoff.", { status: 400, headers });
  if (!allowRequest(`viator-handoff:${requestKey(request)}`, 30)) return new Response("Please wait a minute before trying again.", { status: 429, headers });
  try {
    const result = await getViatorTour(code);
    if (!result || result.sandbox || !result.tour.bookingUrl) return new Response("A booking link is unavailable for this tour. No reservation or payment has been made.", { status: 503, headers });
    // Only a validated API-supplied Viator URL; no URL or marker from the browser.
    return new Response(null, { status: 302, headers: { ...headers, Location: result.tour.bookingUrl } });
  } catch { return new Response("Viator is temporarily unavailable. Please return to the tour and try again. No booking was made.", { status: 503, headers }); }
}
