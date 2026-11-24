import { fallbackRateSnapshot } from "@/lib/currency";

export function GET() {
  return Response.json(fallbackRateSnapshot());
}
