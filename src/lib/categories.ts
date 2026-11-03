import type { CategoryId } from "./types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  /** Ink colour for the marker chip, legend swatch and heat ramp. */
  color: string;
  /** Lighter wash used for panel chips. */
  tint: string;
  /** 24x24 stroke path, rendered both as SVG and onto the marker sprite. */
  icon: string;
  /** Eventbrite browse slug — used to build Apify start URLs. */
  slug: string;
  /** Source taxonomy labels that fold into this category. */
  match: string[];
  blurb: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "music",
    label: "Music",
    color: "#B5485D",
    tint: "#F3E0E4",
    slug: "music",
    icon: "M9 18V5l12-2v13M6 18a3 3 0 1 0 6 0 3 3 0 1 0-6 0M18 16a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
    match: ["music", "concert", "blues & jazz", "indie", "hip hop", "classical", "edm"],
    blurb: "Shows, sets and sessions",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    color: "#6B4E9B",
    tint: "#E6E0F1",
    slug: "nightlife",
    icon: "M5 4h14l-7 8-7-8M12 12v7M8 19h8",
    match: ["nightlife", "clubs and parties", "party", "bar crawl", "dance"],
    blurb: "After dark, after work",
  },
  {
    id: "food",
    label: "Food & Drink",
    color: "#C9752B",
    tint: "#F7E7D5",
    slug: "food-and-drink",
    icon: "M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3v18M18 3c-2 0-3 2-3 4s1 3 3 3",
    match: ["food & drink", "food and drink", "food", "wine", "beer", "tasting"],
    blurb: "Markets, tastings, pop-ups",
  },
  {
    id: "arts",
    label: "Arts",
    color: "#2F7A6F",
    tint: "#D9EAE6",
    slug: "arts",
    icon: "M9 11.9l8.1-8.1a2.85 2.85 0 1 1 4 4L13 15.9M7 15a3 3 0 0 0-3 3c0 1.3-2.5 1.5-2 2 1.1 1.1 2.5 2 4 2a4 4 0 0 0 4-4 3 3 0 0 0-3-3z",
    match: ["arts", "performing & visual arts", "theatre", "museum", "design", "craft"],
    blurb: "Galleries, stages, studios",
  },
  {
    id: "tech",
    label: "Science & Tech",
    color: "#2B5FA8",
    tint: "#DCE6F5",
    slug: "science-and-tech",
    icon: "M5 5h14v14H5zM9 9h6v6H9M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3",
    match: ["science & tech", "science and technology", "tech", "ai", "startup", "hackathon"],
    blurb: "Demos, talks, hack nights",
  },
  {
    id: "business",
    label: "Business",
    color: "#4A5A6B",
    tint: "#E1E6EA",
    slug: "business",
    icon: "M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18",
    match: ["business & professional", "business", "career", "networking", "finance"],
    blurb: "Summits and meetups",
  },
  {
    id: "sports",
    label: "Sports & Fitness",
    color: "#3F8A42",
    tint: "#DDEDDC",
    slug: "sports-and-fitness",
    icon: "M6 4h12v5a6 6 0 0 1-12 0zM6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3M12 15v4M8 21h8",
    match: ["sports & fitness", "sports", "running", "cycling", "yoga class", "game"],
    blurb: "Games, runs, pick-up",
  },
  {
    id: "outdoors",
    label: "Outdoors",
    color: "#6E8B3D",
    tint: "#E6EBD6",
    slug: "travel-and-outdoor",
    icon: "M2 20h20L14.5 6l-4 7-2.5-3L2 20z",
    match: ["travel & outdoor", "outdoor", "hike", "nature", "trail", "beach"],
    blurb: "Trails, coast, summits",
  },
  {
    id: "community",
    label: "Community",
    color: "#C0462A",
    tint: "#F6DED8",
    slug: "community",
    icon: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    match: ["community & culture", "community", "charity & causes", "neighborhood", "civic"],
    blurb: "Block parties and causes",
  },
  {
    id: "film",
    label: "Film & Media",
    color: "#8A5BA8",
    tint: "#EBE0F2",
    slug: "film-and-media",
    icon: "M2 7h20v13H2zM2 7l3-4h3L5 7M9 7l3-4h3l-3 4M15 7l3-4h3l-3 4",
    match: ["film, media & entertainment", "film", "comedy", "screening", "media"],
    blurb: "Screenings and comedy",
  },
  {
    id: "family",
    label: "Family",
    color: "#D08A2C",
    tint: "#F8EBD4",
    slug: "family-and-education",
    icon: "M12 16a6 6 0 0 0 6-6c0-3.3-2.7-7-6-7S6 6.7 6 10a6 6 0 0 0 6 6zM12 16v3M10 21h4",
    match: ["family & education", "family", "kids", "education", "workshop for kids"],
    blurb: "Kid-proof outings",
  },
  {
    id: "wellness",
    label: "Health",
    color: "#3E8E9B",
    tint: "#DBEDF0",
    slug: "health",
    icon: "M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z",
    match: ["health & wellness", "health", "wellness", "meditation", "mental health"],
    blurb: "Movement and reset",
  },
  {
    id: "other",
    label: "Other",
    color: "#7A6E5D",
    tint: "#E8E3D8",
    slug: "other",
    icon: "M12 2.6l2.8 6 6.6.8-4.9 4.4 1.3 6.5L12 17l-5.8 3.3 1.3-6.5-4.9-4.4 6.6-.8z",
    match: [],
    blurb: "Everything else",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDef>;

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** Fold any free-text taxonomy label from a scraper into one of our categories. */
export function resolveCategory(raw?: string | null, fallbackText?: string | null): CategoryId {
  const haystack = `${raw ?? ""} ${fallbackText ?? ""}`.toLowerCase();
  if (!haystack.trim()) return "other";

  for (const cat of CATEGORIES) {
    if (cat.id === "other") continue;
    if (raw && raw.toLowerCase().trim() === cat.label.toLowerCase()) return cat.id;
    for (const token of cat.match) {
      if (haystack.includes(token)) return cat.id;
    }
  }
  return "other";
}
