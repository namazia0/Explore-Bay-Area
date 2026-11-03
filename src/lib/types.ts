export type CategoryId =
  | "music"
  | "nightlife"
  | "food"
  | "arts"
  | "tech"
  | "business"
  | "sports"
  | "outdoors"
  | "community"
  | "film"
  | "family"
  | "wellness"
  | "other";

export interface BayEvent {
  id: string;
  title: string;
  summary: string;
  category: CategoryId;
  subcategory: string | null;
  /** Original taxonomy label from the source, kept for display + search. */
  sourceCategory: string | null;
  start: string; // ISO
  end: string | null; // ISO
  venue: string;
  address: string | null;
  city: string;
  neighborhood: string | null;
  lng: number;
  lat: number;
  isFree: boolean;
  minPrice: number | null; // dollars
  maxPrice: number | null; // dollars
  currency: string;
  organizer: string | null;
  /** 0-100 — drives heatmap weight and marker prominence. */
  heat: number;
  attendance: number | null;
  image: string | null;
  url: string | null;
  source: "eventbrite" | "curated";
  isOnline: boolean;
}

export interface EventsResponse {
  events: BayEvent[];
  meta: {
    source: "apify" | "curated" | "apify+curated";
    live: boolean;
    count: number;
    fetchedAt: string;
    cached: boolean;
    /** Present when a live fetch was attempted but could not complete. */
    notice?: string;
    actor?: string;
    runId?: string;
    query?: EventQuery;
  };
}

export interface EventQuery {
  q?: string;
  categories?: CategoryId[];
  city?: string;
  when?: WhenFilter;
  priceMax?: number | null;
  limit?: number;
}

export type WhenFilter = "today" | "weekend" | "week" | "month" | "all";

export type ViewMode = "explore" | "heat" | "flat";
