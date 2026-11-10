import { experiences } from "@/lib/data";

/** Editorial activity ideas, independent of operator inventory or live prices. */
const planning: Record<string, { description: string; notes: string[] }> = {
  "dive-with-manta-rays": {
    description: "Explore the idea of a guided reef dive, with marine life and ocean conditions shaping the day.",
    notes: ["Ask a qualified dive operator about certification, experience requirements and equipment.", "Choose a site suited to your ability and the conditions. Wildlife sightings are never guaranteed.", "Confirm transfers, inclusions, insurance requirements and cancellation terms before booking."],
  },
  "sunset-cruise": {
    description: "Trade the shoreline for open water and make room for a slower island evening.",
    notes: ["Ask the operator about the departure island, meeting point and return arrangements.", "Check the boat type, safety equipment, refreshments and weather cancellation policy.", "Sunset visibility and wildlife encounters depend on conditions; they are not guaranteed."],
  },
  "reef-snorkelling": {
    description: "Discover a different view of island life beneath the surface, at a pace that suits you.",
    notes: ["Discuss swimming confidence, guiding and flotation equipment with the operator.", "Ask about currents and reef conditions. Never touch coral or chase marine life.", "Confirm equipment, transport, age restrictions and cancellation terms before booking."],
  },
  "sandbank-picnic": {
    description: "Picture a quiet stretch of sand, turquoise water and time away from the everyday.",
    notes: ["Ask which sandbank is planned and how tides or weather may change the itinerary.", "Check shade, drinking water, food, dietary requirements and waste arrangements.", "Confirm boat transfers, the return plan and the operator’s safety procedures."],
  },
  "island-hopping": {
    description: "Look beyond one shoreline and explore the rhythm of local island communities.",
    notes: ["Ask which islands are included and how much time is available at each stop.", "Check transfer arrangements, local etiquette, dress expectations and photography permissions.", "Confirm meal inclusions, accessibility needs and any changes caused by sea conditions."],
  },
};

const plannedSlugs = Object.keys(planning);
export const tourIdeas = experiences.filter((idea) => Object.prototype.hasOwnProperty.call(planning, idea.slug)).map((idea) => ({
  slug: idea.slug, name: idea.name, category: idea.category,
  description: planning[idea.slug].description, notes: planning[idea.slug].notes,
  tile: plannedSlugs.indexOf(idea.slug),
}));
export const tourCategories = Array.from(new Set(tourIdeas.map((idea) => idea.category)));
export const normalizeTourText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function filterTourIdeas(q: string, category: string) {
  const term = normalizeTourText(q);
  return tourIdeas.filter((idea) => (!category || idea.category === category) && normalizeTourText(`${idea.name} ${idea.category} ${idea.description}`).includes(term));
}
