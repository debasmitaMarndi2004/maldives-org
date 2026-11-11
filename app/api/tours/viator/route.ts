import { parseTourFilters } from "@/lib/tours/viator-data";
import { searchViatorTours } from "@/lib/tours/viator-catalog";
import { allowRequest, requestKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(request: Request) {
  const filters = parseTourFilters(new URL(request.url).searchParams);
  if (!filters) return Response.json({ ok: false, message: "Check your search and filter values." }, { status: 400, headers });
  if (!allowRequest(`viator-search:${requestKey(request)}`, 60)) return Response.json({ ok: false, message: "Too many searches. Please wait a minute and retry." }, { status: 429, headers });
  if (!process.env.VIATOR_API_KEY?.trim()) return Response.json({ ok: false, message: "Tour search is not connected yet. You can use the official Viator widget below." }, { headers });
  try {
    const result = await searchViatorTours(filters);
    // Booking destinations stay server-side; the client only receives internal links.
    return Response.json({ ...result, tours: result.tours.map(({ bookingUrl, ...tour }) => ({ ...tour, hasBookingLink: !!bookingUrl && !result.sandbox })) }, { headers });
  } catch {
    return Response.json({ ok: false, message: "Viator tour search is temporarily unavailable. Please retry or use the original widget below." }, { status: 502, headers });
  }
}
