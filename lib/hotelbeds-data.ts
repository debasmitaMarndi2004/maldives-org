export type HotelbedsCancellation = {
  amount: number;
  from: string;
};

export type HotelbedsRateSummary = {
  rateKey: string;
  rateType: string;
  amount: number;
  netAmount: number | null;
  currency: string;
  roomName: string;
  boardName: string;
  paymentType: string;
  rateComments: string;
  cancellationPolicies: HotelbedsCancellation[];
  hotelCode: string;
  hotelName: string;
};

export type HotelbedsLiveStay = {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  price: number;
  currency: string;
  supplierCode: string;
  rate: HotelbedsRateSummary;
};

export type HotelbedsBookingSummary = {
  supplierReference: string;
  status: string;
  totalAmount: number | null;
  currency: string;
  voucherUrl: string;
  hotelName: string;
  cancellationPolicies: HotelbedsCancellation[];
};

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

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cancellationPolicies(rate: Record<string, unknown>): HotelbedsCancellation[] {
  const values = Array.isArray(rate.cancellationPolicies)
    ? rate.cancellationPolicies
    : Array.isArray(rate.cancellationPolicy)
      ? rate.cancellationPolicy
      : [];

  return values.flatMap((value) => {
    const policy = record(value);
    const amount = Number(policy.amount);
    const from = textValue(policy.from);
    return Number.isFinite(amount) && from ? [{ amount, from }] : [];
  });
}

export function normalizeHotelbedsRate(
  value: unknown,
  context: { hotelCode?: string; hotelName?: string; roomName?: string; boardName?: string } = {},
): HotelbedsRateSummary | null {
  const rate = record(value);
  const rateKey = textValue(rate.rateKey);
  const amount = numberValue(rate.sellingRate, rate.net, rate.totalNet, rate.amount);
  if (!rateKey || !amount) return null;

  return {
    rateKey,
    rateType: textValue(rate.rateType, "BOOKABLE").toUpperCase(),
    amount,
    netAmount: numberValue(rate.net, rate.totalNet),
    currency: textValue(rate.currency, "USD").toUpperCase(),
    roomName: textValue(rate.roomName, context.roomName || "Room to be confirmed"),
    boardName: textValue(rate.boardName, context.boardName || "Board to be confirmed"),
    paymentType: textValue(rate.paymentType, "To be confirmed"),
    rateComments: textValue(rate.rateComments),
    cancellationPolicies: cancellationPolicies(rate),
    hotelCode: textValue(context.hotelCode, textValue(rate.hotelCode)),
    hotelName: textValue(context.hotelName, "Maldives stay"),
  };
}

function hotelRates(hotel: Record<string, unknown>): HotelbedsRateSummary[] {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  return rooms.flatMap((roomValue) => {
    const room = record(roomValue);
    const rates = Array.isArray(room.rates) ? room.rates : [];
    return rates.flatMap((rateValue) => normalizeHotelbedsRate(rateValue, {
      hotelCode: textValue(hotel.code ?? hotel.hotelCode),
      hotelName: textValue(hotel.name, "Maldives stay"),
      roomName: textValue(room.name ?? room.code),
    })).filter((value): value is HotelbedsRateSummary => Boolean(value));
  });
}

export function extractHotelbedsRates(data: unknown): HotelbedsRateSummary[] {
  const root = record(data);
  const hotelsContainer = record(root.hotels);
  const hotels = Array.isArray(hotelsContainer.hotels)
    ? hotelsContainer.hotels
    : Array.isArray(root.hotels)
      ? root.hotels
      : [];
  return hotels.flatMap((hotelValue) => hotelRates(record(hotelValue)));
}

export function normalizeHotelbedsResults(data: unknown, image: string): HotelbedsLiveStay[] {
  const root = record(data);
  const hotelsContainer = record(root.hotels);
  const hotels = Array.isArray(hotelsContainer.hotels)
    ? hotelsContainer.hotels
    : Array.isArray(root.hotels)
      ? root.hotels
      : [];

  return hotels.flatMap((hotelValue, index) => {
    const hotel = record(hotelValue);
    const code = textValue(hotel.code ?? hotel.hotelCode, `live-${index + 1}`);
    const name = textValue(hotel.name, `Maldives stay ${code}`);
    const rate = hotelRates(hotel)[0];
    if (!rate) return [];

    return [{
      id: `hotelbeds-${code}`,
      name,
      location: textValue(hotel.destinationName ?? hotel.city, "Maldives"),
      description: textValue(hotel.categoryName, "Live Hotelbeds availability with room options for your dates."),
      image,
      rating: numberValue(hotel.rating, 4.5) ?? 4.5,
      price: rate.amount,
      currency: rate.currency,
      supplierCode: code,
      rate,
    }];
  });
}

export function normalizeHotelbedsBooking(data: unknown): HotelbedsBookingSummary {
  const root = record(data);
  const bookingsContainer = record(root.bookings);
  const bookingValue = Array.isArray(bookingsContainer.bookings)
    ? bookingsContainer.bookings[0]
    : record(root.booking).reference
      ? root.booking
      : Array.isArray(root.booking) ? root.booking[0] : null;
  const booking = record(bookingValue);
  const services = Array.isArray(booking.services) ? booking.services : [];
  const service = record(services[0]);
  const vouchers = Array.isArray(service.vouchers) ? service.vouchers : [];
  const voucher = record(vouchers[0]);
  const bookingRooms = Array.isArray(booking.rooms) ? booking.rooms : [];
  const bookingRate = bookingRooms.flatMap((roomValue) => {
    const room = record(roomValue);
    return Array.isArray(room.rates) ? room.rates : [];
  })[0];
  const rate = record(bookingRate);

  return {
    supplierReference: textValue(booking.reference),
    status: textValue(booking.status, "UNKNOWN").toUpperCase(),
    totalAmount: numberValue(booking.totalAmount, booking.totalNetAmount),
    currency: textValue(booking.currency, "USD").toUpperCase(),
    voucherUrl: textValue(voucher.url),
    hotelName: textValue(record(booking.hotel).name ?? booking.hotelName, "Maldives stay"),
    cancellationPolicies: cancellationPolicies(rate),
  };
}

export function formatCancellationPolicy(policies: HotelbedsCancellation[]) {
  if (!policies.length) return "Cancellation terms are confirmed with the selected rate.";
  const first = policies[0];
  return `Cancellation fee from ${new Date(first.from).toLocaleString("en-GB", { dateStyle: "medium" })}: ${first.amount.toFixed(2)}`;
}
