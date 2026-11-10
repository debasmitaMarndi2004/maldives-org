import { HotelbedsLiveResults, type HotelbedsLiveStay } from "@/components/hotelbeds-live-results";
import { StayDirectory } from "@/components/public-pages";
import { getConfiguredHotelCodes, searchHotelAvailability } from "@/lib/hotelbeds";
import { normalizeHotelbedsResults } from "@/lib/hotelbeds-data";
import { properties } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
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
  const where = firstParam(params.where);
  const initialQuery = firstParam(params.q) || (where && where !== "Maldives" ? where.replace(/\s+Atoll$/i, "") : "");
  const initialStyle = firstParam(params.style) || "";
  const directory = <StayDirectory key={`${initialQuery}:${initialStyle}`} initialQuery={initialQuery} initialStyle={initialStyle} />;
  const guestValue = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(firstParam(params[key]) ?? fallback);
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
  };

  if (
    !isIsoDate(checkIn) ||
    !isIsoDate(checkOut) ||
    new Date(checkOut) <= new Date(checkIn) ||
    codes.length === 0
  ) {
    return directory;
  }

  let liveStays: HotelbedsLiveStay[] = [];

  try {
    const response = await searchHotelAvailability({
      checkIn,
      checkOut,
      adults: guestValue("adults", 2, 1, 12),
      children: guestValue("children", 0, 0, 12),
      rooms: guestValue("rooms", 1, 1, 8),
      hotelCodes: codes,
    });
    liveStays = response.response.ok
      ? normalizeHotelbedsResults(response.data, properties[0]?.image ?? "")
      : [];
  } catch {
    // Keep the directory available if the external supplier is unavailable.
  }

  if (liveStays.length > 0) {
    return <HotelbedsLiveResults stays={liveStays} checkIn={checkIn} checkOut={checkOut} />;
  }

  return directory;
}
