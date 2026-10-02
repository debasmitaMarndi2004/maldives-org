import { getHotelbedsConfig, hotelbedsRequest } from "@/lib/hotelbeds";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getHotelbedsConfig("hotel");
    const { response } = await hotelbedsRequest<unknown>(
      "/hotel-api/1.0/status",
      { method: "GET" },
      "hotel",
    );

    return Response.json(
      {
        ok: response.ok,
        provider: "hotelbeds",
        product: "hotel",
        environment: config.environment,
        providerStatus: response.status,
        message: response.ok
          ? "Hotelbeds hotel API is reachable."
          : "Hotelbeds returned an error; the site will keep its sample fallback.",
      },
      { status: response.ok ? 200 : 503 },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        provider: "hotelbeds",
        product: "hotel",
        message:
          error instanceof Error
            ? error.message
            : "Hotelbeds status check failed.",
      },
      { status: 503 },
    );
  }
}
