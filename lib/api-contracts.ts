export type InventorySource = "sample" | "hotelbeds" | "viator" | "direct";

export type TravelProductType = "stay" | "experience" | "transfer";

export type AvailabilityState = "available" | "on-request" | "sold-out" | "sample";

export type CancellationPolicy = "free-cancellation" | "partial-refund" | "non-refundable" | "to-be-confirmed";

/**
 * The normalized shape every supplier adapter should return.
 * Components intentionally consume this shape instead of vendor-specific fields.
 */
export type TravelOffer = {
  id: string;
  type: TravelProductType;
  source: InventorySource;
  supplierCode?: string;
  title: string;
  location: string;
  image?: string;
  priceFrom: number;
  currency: string;
  priceUnit: string;
  availability: AvailabilityState;
  cancellation: CancellationPolicy;
  supplierRateKey?: string;
  supplierRateType?: string;
  roomName?: string;
  boardName?: string;
  cancellationDetails?: string;
  lastChecked?: string;
  deepLink?: string;
};

export type BookingDraft = {
  offer: TravelOffer;
  checkIn?: string;
  checkOut?: string;
  activityDate?: string;
  guests: number;
  travelerName: string;
  travelerEmail: string;
  travelerCountry: string;
  notes?: string;
};

export const sourceLabels: Record<InventorySource, string> = {
  sample: "Sample inventory",
  hotelbeds: "Hotelbeds",
  viator: "Viator experience",
  direct: "Direct Maldives partner",
};

export const sourceDescriptions: Record<InventorySource, string> = {
  sample: "A design preview. Availability is not live yet.",
  hotelbeds: "Hotel availability checked through the connected Hotelbeds supplier.",
  viator: "Experience details and booking are supplied through Viator.",
  direct: "A local Maldives partner confirms the request directly.",
};
