import { getPublicAffiliateCatalog } from "@/lib/affiliate-config";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getPublicAffiliateCatalog(), {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
