import { ApifyClient } from "apify-client";
import { CATEGORY_BY_ID } from "./categories";
import { TTLCache } from "./cache";
import { normalizeMany } from "./normalize";
import type { BayEvent, EventQuery } from "./types";

/**
 * Eventbrite Search Scraper — the Actor behind the live layer.
 *
 * Pricing: pay-per-result, from $3.00 / 1,000 results ($0.003 each).
 * Every call below is capped twice: `maxEvents` limits the work the Actor does,
 * and `maxTotalChargeUsd` (a call option, never Actor input) caps the bill.
 */
export const ACTOR_ID = process.env.APIFY_ACTOR_ID ?? "hypebridge/eventbrite-search";

const DEFAULT_MAX_EVENTS = Number(process.env.APIFY_MAX_EVENTS ?? 60);
const DEFAULT_MAX_USD = Number(process.env.APIFY_MAX_USD ?? 0.5);
const RUN_TIMEOUT_SECS = Number(process.env.APIFY_TIMEOUT_SECS ?? 180);
const CACHE_TTL_MS = Number(process.env.APIFY_CACHE_TTL_MS ?? 30 * 60_000);

const cache = new TTLCache<{ events: BayEvent[]; runId: string | null }>(CACHE_TTL_MS);

/** Eventbrite place slugs covering the Bay Area metros. */
const PLACE_SLUGS: Record<string, string> = {
  "san francisco": "ca--san-francisco",
  oakland: "ca--oakland",
  berkeley: "ca--berkeley",
  "san jose": "ca--san-jose",
  "palo alto": "ca--palo-alto",
  "mountain view": "ca--mountain-view",
  "santa clara": "ca--santa-clara",
  "san mateo": "ca--san-mateo",
  berkeley_oakland: "ca--oakland",
};

export function isApifyConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildStartUrls(query: EventQuery): string[] {
  const place = PLACE_SLUGS[(query.city ?? "san francisco").toLowerCase()] ?? "ca--san-francisco";
  const base = `https://www.eventbrite.com/d/${place}`;
  const urls: string[] = [];

  if (query.q?.trim()) {
    urls.push(`${base}/${slugify(query.q)}/`);
  }

  const cats = query.categories ?? [];
  for (const id of cats.slice(0, 4)) {
    const def = CATEGORY_BY_ID[id];
    if (def && def.id !== "other") urls.push(`${base}/${def.slug}/`);
  }

  if (urls.length === 0) urls.push(`${base}/events/`);
  return Array.from(new Set(urls));
}

export function cacheKey(query: EventQuery): string {
  return JSON.stringify({
    q: query.q?.trim().toLowerCase() ?? "",
    c: [...(query.categories ?? [])].sort(),
    city: query.city ?? "",
    limit: query.limit ?? DEFAULT_MAX_EVENTS,
  });
}

export interface LiveResult {
  events: BayEvent[];
  runId: string | null;
  cached: boolean;
}

export async function fetchLiveEvents(query: EventQuery): Promise<LiveResult> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN is not set");

  const key = cacheKey(query);
  const hit = cache.get(key);
  if (hit) return { ...hit, cached: true };

  const client = new ApifyClient({ token });
  const maxEvents = Math.min(query.limit ?? DEFAULT_MAX_EVENTS, 200);

  const run = await client.actor(ACTOR_ID).call(
    {
      // `startUrls` uses the requestListSources editor, so each entry must be
      // an object — a bare string is rejected as "not a valid URL".
      startUrls: buildStartUrls(query).map((url) => ({ url })),
      scrapeEventDetails: false,
      maxEvents,
    },
    {
      // Bill cap. Belongs in call options — inside the input it is not a cap.
      maxTotalChargeUsd: DEFAULT_MAX_USD,
      timeout: RUN_TIMEOUT_SECS,
      waitSecs: RUN_TIMEOUT_SECS,
    },
  );

  if (run.status !== "SUCCEEDED") {
    throw new Error(
      `Actor run ${run.id} ended ${run.status}${run.statusMessage ? `: ${run.statusMessage}` : ""}`,
    );
  }

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const events = normalizeMany(items as Record<string, unknown>[]);

  const result = { events, runId: run.id };
  cache.set(key, result);
  return { ...result, cached: false };
}
