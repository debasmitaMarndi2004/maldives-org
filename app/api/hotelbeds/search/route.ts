import {
  getConfiguredHotelCodes,
  getHotelbedsConfig,
  searchHotelAvailability,
} from "@/lib/hotelbeds";

export const dynamic = "force-dynamic";

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const checkIn = body.checkIn;
    const checkOut = body.checkOut;
    const adults = toInteger(body.adults, 2);
    const children = toInteger(body.children, 0);
    const rooms = toInteger(body.rooms, 1);
    const allowedCodes = getConfiguredHotelCodes();
    const requestedCodes = Array.isArray(body.hotelCodes)
      ? body.hotelCodes.map(Number)
      : allowedCodes;
    const allowed = new Set(allowedCodes);
    const hotelCodes = requestedCodes.filter(
      (value) => Number.isInteger(value) && value > 0 && allowed.has(value),
    );

    if (
      !isIsoDate(checkIn) ||
      !isIsoDate(checkOut) ||
      new Date(checkOut) <= new Date(checkIn)
    ) {
      return Response.json(
        { ok: false, message: "Use valid check-in and check-out dates." },
        { status: 400 },
      );
    }

    if (
      adults < 1 ||
      adults > 12 ||
      children < 0 ||
      children > 12 ||
      rooms < 1 ||
      rooms > 8 ||
      hotelCodes.length === 0
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "Hotelbeds search needs valid guest values and at least one hotel code.",
        },
        { status: 400 },
      );
    }

    const config = getHotelbedsConfig("hotel");
    const { response, data } = await searchHotelAvailability({
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      hotelCodes,
    });

    return Response.json(
      {
        ok: response.ok,
        provider: "hotelbeds",
        product: "hotel",
        environment: config.environment,
        providerStatus: response.status,
        data,
        message: response.ok
          ? "Hotelbeds availability received."
          : "Hotelbeds did not return availability.",
      },
      { status: response.ok ? 200 : 502 },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        provider: "hotelbeds",
        message:
          error instanceof Error
            ? error.message
            : "Hotelbeds search failed.",
      },
      { status: 502 },
    );
  }
}
