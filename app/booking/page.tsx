import { BookingFlowLive } from "@/components/booking-flow-live";
import { experiences, properties } from "@/lib/data";
import type { TravelOffer } from "@/lib/api-contracts";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ type?: string; slug?: string; supplier?: string; hotel?: string; price?: string; currency?: string; title?: string; location?: string; checkIn?: string; checkOut?: string }> }) {
  const params = await searchParams;
  const experience = params.type === "experience" ? experiences.find((item) => item.slug === params.slug) : undefined;
  const property = !experience ? properties.find((item) => item.slug === params.slug) : undefined;
  const liveHotelbeds = params.supplier === "hotelbeds" && Boolean(params.hotel);
  const livePrice = Number(params.price);
  const offer: TravelOffer = experience ? {
    id: experience.slug,
    type: "experience",
    source: "sample",
    title: experience.name,
    location: "Maldives",
    image: experience.image,
    priceFrom: experience.price,
    currency: "USD",
    priceUnit: "per person",
    availability: "sample",
    cancellation: "to-be-confirmed",
  } : liveHotelbeds ? {
    id: `hotelbeds-${params.hotel}`,
    type: "stay",
    source: "hotelbeds",
    supplierCode: params.hotel,
    title: params.title || `Hotelbeds stay ${params.hotel}`,
    location: params.location || "Maldives",
    image: properties[0].image,
    priceFrom: Number.isFinite(livePrice) && livePrice > 0 ? livePrice : 0,
    currency: params.currency || "USD",
    priceUnit: "per night",
    availability: "available",
    cancellation: "to-be-confirmed",
  } : {
    id: property?.slug || "maldives-planning-request",
    type: "stay",
    source: "sample",
    title: property?.name || "Maldives stay request",
    location: property?.location || "Maldives",
    image: property?.image || properties[0].image,
    priceFrom: property?.price || 150,
    currency: "USD",
    priceUnit: "per night",
    availability: "sample",
    cancellation: "to-be-confirmed",
  };

  return <BookingFlowLive offer={{ ...offer, supplierCode: params.hotel }} />;
}
