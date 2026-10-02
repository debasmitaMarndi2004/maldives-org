import { viatorRequest } from "@/lib/viator";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!/^[a-zA-Z0-9_-]{2,120}$/.test(code)) {
    return Response.json({ ok: false, message: "Invalid Viator product code." }, { status: 400 });
  }

  try {
    const { response, data, environment } = await viatorRequest<unknown>(`/partner/products/${encodeURIComponent(code)}`);
    return Response.json({ ok: response.ok, provider: "viator", environment, providerStatus: response.status, data }, { status: response.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false, provider: "viator", message: "Viator is not configured or unavailable." }, { status: 503 });
  }
}
