/** Editorial facts only. No supplier identifiers, prices, ratings or availability. */
export type AccommodationKind = "Resort" | "Hotel" | "Guesthouse";
export type Accommodation = {
  slug: string;
  name: string;
  kind: AccommodationKind;
  island: string;
  atoll: string | null;
  description: string;
  amenities: readonly string[];
  source: string;
  reviewedOn: string;
  illustration: string;
};

const reviewedOn = "2026-11-10";
// Official sources were read on reviewedOn. Images are existing original thematic
// artwork, explicitly labelled in the UI; they are not property photographs.
export const accommodations: readonly Accommodation[] = [
  {
    slug: "villa-park", name: "Villa Park", kind: "Resort",
    island: "Sun Island", atoll: "South Ari Atoll",
    description: "An island resort in South Ari Atoll with beach and water villas, dining, a spa and diving experiences.",
    amenities: ["Spa", "Diving", "Water villas", "Kids club"],
    source: "https://villaresorts.com/villa-park/", reviewedOn,
    illustration: "/images/home-redesign/service-stays.webp",
  },
  {
    slug: "villa-nautica", name: "Villa Nautica", kind: "Resort",
    island: "Paradise Island", atoll: "North Malé Atoll",
    description: "A North Malé Atoll resort with beach and water villas, spa facilities and water sports.",
    amenities: ["Spa", "Diving", "Water villas", "Water sports"],
    source: "https://villaresorts.com/villa-nautica/", reviewedOn,
    illustration: "/images/home-redesign/hero.webp",
  },
  {
    slug: "royal-island", name: "Royal Island", kind: "Resort",
    island: "Horubadhoo", atoll: "Baa Atoll",
    description: "A beachfront resort on Horubadhoo in Baa Atoll, with beach villas, a spa and diving experiences.",
    amenities: ["Spa", "Diving", "Beach villas"],
    source: "https://villaresorts.com/royal-island/", reviewedOn,
    illustration: "/images/home-redesign/guide.webp",
  },
  {
    slug: "kaani-palm-beach", name: "Kaani Palm Beach", kind: "Hotel",
    island: "Maafushi", atoll: null,
    description: "A beachfront hotel on Maafushi. The operator describes an infinity pool and rooftop restaurant.",
    amenities: ["Infinity pool", "Restaurant"],
    source: "https://www.kaanihotels.com/", reviewedOn,
    illustration: "/images/home-redesign/guide.webp",
  },
  {
    slug: "kaani-grand-seaview", name: "Kaani Grand Seaview", kind: "Hotel",
    island: "Maafushi", atoll: null,
    description: "An oceanfront hotel on Maafushi. The operator describes spa facilities, gym access and Indian cuisine.",
    amenities: ["Spa", "Gym", "Restaurant"],
    source: "https://www.kaanihotels.com/", reviewedOn,
    illustration: "/images/home-redesign/service-stays.webp",
  },
];

export function findAccommodation(slug: string) {
  return accommodations.find((item) => item.slug === slug);
}

export const accommodationKinds: readonly AccommodationKind[] = ["Resort", "Hotel", "Guesthouse"];
export const accommodationIslands = Array.from(new Set(accommodations.map((p) => p.island))).sort();
export const accommodationAtolls = Array.from(new Set(accommodations.flatMap((p) => p.atoll ? [p.atoll] : []))).sort();
export const accommodationAmenities = Array.from(new Set(accommodations.flatMap((p) => [...p.amenities]))).sort();
