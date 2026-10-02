import { BookingFlow } from "@/components/booking-flow";
import { experiences, properties } from "@/lib/data";
import type { TravelOffer } from "@/lib/api-contracts";

export default function BookingPage({ searchParams }: { searchParams: { type?: string; slug?: string } }) {
  const experience = searchParams.type === "experience" ? experiences.find((item) => item.slug === searchParams.slug) : undefined;
  const property = !experience ? properties.find((item) => item.slug === searchParams.slug) : undefined;
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

  return <BookingFlow offer={offer} />;
}
