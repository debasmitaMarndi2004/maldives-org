export type Property = {
  slug: string;
  name: string;
  kind: string;
  location: string;
  price: number;
  rating: number;
  badge: string;
  description: string;
  image: string;
  tags: string[];
  transfer: string;
};

export type Guide = {
  slug: string;
  eyebrow: string;
  title: string;
  excerpt: string;
  read: string;
  image: string;
};

const img = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=86`;

export const images = {
  hero: img("photo-1514282401047-d79a71a590e8", 1800),
  overwater: img("photo-1514282401047-d79a71a590e8"),
  honeymoon: img("photo-1505881502353-a1986add3762"),
  inclusive: img("photo-1507525428034-b723cf961d3e"),
  privateIsland: img("photo-1473116763249-2faaef81ccda"),
  lagoon: img("photo-1500534623283-312aade485b7"),
  resort: img("photo-1540541338287-41700207dee6"),
  family: img("photo-1506744038136-46273834b3fb"),
  diving: img("photo-1544551763-46a013bb70d5"),
  sunset: img("photo-1510414842594-a61c69b5ae57"),
  snorkel: img("photo-1551244072-5d12893278ab"),
  sandbank: img("photo-1500534623283-312aade485b7"),
  islandHopping: img("photo-1530789253388-582c481c54b0"),
  palm: img("photo-1507525428034-b723cf961d3e"),
};

export const properties: Property[] = [
  {
    slug: "private-island-luxury",
    name: "Private Island Luxury",
    kind: "Resort",
    location: "North Malé Atoll",
    price: 620,
    rating: 4.9,
    badge: "Luxury Pick",
    description: "Ocean villas, a quiet house reef and a stay designed around slow island days.",
    image: images.lagoon,
    tags: ["Overwater", "All-inclusive", "Honeymoon"],
    transfer: "45 min by speedboat",
  },
  {
    slug: "overwater-romance",
    name: "Overwater Romance",
    kind: "Resort",
    location: "South Ari Atoll",
    price: 480,
    rating: 4.8,
    badge: "Couples",
    description: "Sunset decks, reef snorkelling and private escapes made for two.",
    image: images.resort,
    tags: ["Overwater", "Adults-focused", "Spa"],
    transfer: "25 min by seaplane",
  },
  {
    slug: "family-island-escape",
    name: "Family Island Escape",
    kind: "Resort",
    location: "Baa Atoll",
    price: 340,
    rating: 4.7,
    badge: "Family Favorite",
    description: "Room to roam, easy beach days and thoughtful adventures for every age.",
    image: images.family,
    tags: ["Family-friendly", "Kids club", "Beach villas"],
    transfer: "30 min by seaplane",
  },
  {
    slug: "coral-garden-house",
    name: "Coral Garden House",
    kind: "Guesthouse",
    location: "Dhigurah, South Ari",
    price: 92,
    rating: 4.6,
    badge: "Local Favourite",
    description: "A warm island base for whale-shark days, cafés and barefoot evenings.",
    image: images.sandbank,
    tags: ["Local island", "Diving", "Budget"],
    transfer: "2 h by public ferry",
  },
  {
    slug: "lagoon-light",
    name: "Lagoon Light Villas",
    kind: "Resort",
    location: "Raa Atoll",
    price: 525,
    rating: 4.8,
    badge: "New arrival",
    description: "A small collection of villas wrapped in luminous lagoon water.",
    image: images.privateIsland,
    tags: ["Design-led", "Diving", "Wellness"],
    transfer: "40 min by seaplane",
  },
  {
    slug: "maafushi-morning",
    name: "Maafushi Morning",
    kind: "Guesthouse",
    location: "Maafushi, Kaafu",
    price: 68,
    rating: 4.5,
    badge: "Smart stay",
    description: "Simple rooms, clear water and an easy launchpad for island-hopping.",
    image: images.honeymoon,
    tags: ["Local island", "Speedboat", "Value"],
    transfer: "35 min by speedboat",
  },
];

export const guides: Guide[] = [
  {
    slug: "best-time-to-visit",
    eyebrow: "SEASONAL NOTES",
    title: "When should you visit the Maldives?",
    excerpt: "A simple month-by-month guide to calmer seas, manta season and good-value stays.",
    read: "7 min read",
    image: images.palm,
  },
  {
    slug: "getting-around",
    eyebrow: "ARRIVAL & TRANSFERS",
    title: "Getting around: boats, planes and timing",
    excerpt: "How to connect your international arrival to the right island transfer.",
    read: "6 min read",
    image: images.sunset,
  },
  {
    slug: "which-atoll",
    eyebrow: "FIND YOUR ISLAND",
    title: "Which atoll is right for you?",
    excerpt: "Choose between easy access, big reef days, surf breaks and far-away quiet.",
    read: "8 min read",
    image: images.snorkel,
  },
  {
    slug: "local-islands",
    eyebrow: "ISLAND LIFE",
    title: "A first-timer's guide to local islands",
    excerpt: "What to expect from guesthouses, bikini beaches, ferries and island cafés.",
    read: "9 min read",
    image: images.islandHopping,
  },
];

export const experiences = [
  { slug: "dive-with-manta-rays", name: "Dive with manta rays", category: "Diving", duration: "Half day", price: 95, image: images.diving, description: "Meet the reef's most graceful travellers with a local dive team." },
  { slug: "sunset-cruise", name: "Sunset cruise", category: "On the water", duration: "2 hours", price: 58, image: images.sunset, description: "Golden-hour seas, a quiet dhoni and a sky that does the talking." },
  { slug: "reef-snorkelling", name: "Reef snorkelling", category: "Snorkelling", duration: "3 hours", price: 45, image: images.snorkel, description: "Warm shallow water, bright coral gardens and a guide who knows the reef." },
  { slug: "sandbank-picnic", name: "Sandbank picnic", category: "Slow days", duration: "Half day", price: 72, image: images.sandbank, description: "A private patch of white sand and a picnic under the palms." },
  { slug: "island-hopping", name: "Island hopping", category: "Culture", duration: "Full day", price: 84, image: images.islandHopping, description: "See the local rhythm of island cafés, craft and community." },
];

export const atolls = ["Kaafu / Malé", "South Ari", "Baa", "Raa", "Lhaviyani", "Noonu", "Dhaalu", "Laamu", "Addu City"];

export const navItems = [
  { label: "Stay", href: "/stay" },
  { label: "Experiences", href: "/experiences" },
  { label: "Travel Guides", href: "/guides" },
  { label: "Deals", href: "/deals" },
];
