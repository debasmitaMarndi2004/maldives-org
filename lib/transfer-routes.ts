/** Existing sample planning routes only; not supplier schedules or availability. */
export type SampleTransferRoute = {
  slug: string;
  from: string;
  to: string;
  mode: string;
  time: string;
  price: number | null;
  suffix: string;
};

export const sampleTransferRoutes: readonly SampleTransferRoute[] = [
  { slug: "airport-maafushi-speedboat", from: "Velana International Airport", to: "Maafushi", mode: "Shared speedboat", time: "35 min", price: 35, suffix: "" },
  { slug: "airport-baa-seaplane", from: "Velana International Airport", to: "Baa Atoll", mode: "Seaplane", time: "30 min", price: null, suffix: "" },
  { slug: "male-dhigurah-ferry", from: "Malé", to: "Dhigurah", mode: "Public ferry", time: "4 h 30", price: 12, suffix: "" },
  { slug: "airport-north-male-private-speedboat", from: "Velana International Airport", to: "North Malé Atoll", mode: "Private speedboat", time: "45 min", price: 220, suffix: "/ boat" },
];

const normalizePlace = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function filterSampleTransferRoutes(from: string, to: string) {
  const origin = normalizePlace(from), destination = normalizePlace(to);
  return sampleTransferRoutes.filter((route) => normalizePlace(route.from).includes(origin) && normalizePlace(route.to).includes(destination));
}

export function findSampleTransferRoute(slug: string) {
  return sampleTransferRoutes.find((route) => route.slug === slug);
}
