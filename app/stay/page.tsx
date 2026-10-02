import { HotelbedsLiveResults, type HotelbedsLiveStay } from "@/components/hotelbeds-live-results";
import { StayDirectory } from "@/components/public-pages";
import { getConfiguredHotelCodes, searchHotelAvailability } from "@/lib/hotelbeds";
import { properties } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function firstRate(hotel: Record<string, unknown>) {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  for (const roomValue of rooms) {
    const room = record(roomValue);
    const rates = Array.isArray(room.rates) ? room.rates : [];
    for (const rateValue of rates) {
      const rate = record(rateValue);
      const amount = numberValue(rate.net, rate.totalNet, rate.sellingRate, rate.amount);
      if (amount) {
        return { amount, currency: String(rate.currency ?? hotel.currency ?? "USD") };
      }
    }
  }
  const amount = numberValue(hotel.minRate, hotel.minSellingRate, hotel.price);
  return amount ? { amount, currency: String(hotel.currency ?? "USD") } : null;
}

function normalizeHotelbedsResults(data: unknown): HotelbedsLiveStay[] {
  const root = record(data);
  const hotelsContainer = record(root.hotels);
  const hotels = Array.isArray(hotelsContainer.hotels)
    ? hotelsContainer.hotels
    : Array.isArray(root.hotels)
      ? root.hotels
      : [];
  const template = properties[0];

  return hotels.flatMap((hotelValue, index) => {
    const hotel = record(hotelValue);
    const rate = firstRate(hotel);
    const code = String(hotel.code ?? hotel.hotelCode ?? `live-${index + 1}`);
    if (!rate || !template) return [];

    return [
      {
        id: `hotelbeds-${code}`,
        name: String(hotel.name ?? `Maldives stay ${code}`),
        location: String(hotel.destinationName ?? hotel.city ?? "Maldives"),
        description: String(
          hotel.categoryName ?? "Live Hotelbeds availability with room options for your dates.",
        ),
        image: template.image,
        rating: numberValue(hotel.rating, 4.5) ?? 4.5,
        price: rate.amount,
        currency: rate.currency,
        supplierCode: code,
      },
    ];
  });
}

export default async function StayPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const checkIn = firstParam(params.checkIn);
  const checkOut = firstParam(params.checkOut);
  const codes = getConfiguredHotelCodes();

  if (
    !isIsoDate(checkIn) ||
    !isIsoDate(checkOut) ||
    new Date(checkOut) <= new Date(checkIn) ||
    codes.length === 0
  ) {
    return <StayDirectory />;
  }

  let liveStays: HotelbedsLiveStay[] = [];

  try {
    const response = await searchHotelAvailability({
      checkIn,
      checkOut,
      adults: 2,
      children: 0,
      rooms: 1,
      hotelCodes: codes,
    });
    liveStays = response.response.ok ? normalizeHotelbedsResults(response.data) : [];
  } catch {
    // Keep the directory available if the external supplier is unavailable.
  }

  if (liveStays.length > 0) {
    return <HotelbedsLiveResults stays={liveStays} checkIn={checkIn} checkOut={checkOut} />;
  }

  return <StayDirectory />;
}
