import { NextResponse } from "next/server";
import { CATEGORY_IDS } from "@/lib/categories";
import { buildCuratedEvents } from "@/lib/seed";
import { fetchLiveEvents, isApifyConfigured, ACTOR_ID } from "@/lib/apify";
import type { BayEvent, CategoryId, EventQuery, EventsResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

function parseQuery(url: URL): EventQuery {
  const cats = (url.searchParams.get("categories") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is CategoryId => (CATEGORY_IDS as string[]).includes(c));

  return {
    q: url.searchParams.get("q")?.trim() || undefined,
    categories: cats.length ? cats : undefined,
    city: url.searchParams.get("city")?.trim() || undefined,
    limit: Number(url.searchParams.get("limit") ?? 60) || 60,
  };
}

/** Live results lead; the curated atlas fills in behind them so the map is never sparse. */
function merge(live: BayEvent[], curated: BayEvent[]): BayEvent[] {
  const seen = new Set(live.map((e) => `${e.title.toLowerCase()}|${e.start.slice(0, 10)}`));
  const filler = curated.filter((e) => !seen.has(`${e.title.toLowerCase()}|${e.start.slice(0, 10)}`));
  return [...live, ...filler].sort((a, b) => a.start.localeCompare(b.start));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseQuery(url);
  const wantsLive = url.searchParams.get("live") !== "0";
  const curated = buildCuratedEvents();

  if (!wantsLive || !isApifyConfigured()) {
    const body: EventsResponse = {
      events: curated,
      meta: {
        source: "curated",
        live: false,
        count: curated.length,
        fetchedAt: new Date().toISOString(),
        cached: false,
        notice: isApifyConfigured()
          ? undefined
          : "APIFY_TOKEN not set — showing the curated Bay Area atlas. Add a token to pull live Eventbrite listings.",
        query,
      },
    };
    return NextResponse.json(body);
  }

  try {
    const { events: live, runId, cached } = await fetchLiveEvents(query);
    const events = merge(live, curated);
    const body: EventsResponse = {
      events,
      meta: {
        source: live.length ? "apify+curated" : "curated",
        live: live.length > 0,
        count: events.length,
        fetchedAt: new Date().toISOString(),
        cached,
        actor: ACTOR_ID,
        runId: runId ?? undefined,
        notice: live.length
          ? `${live.length} live listings from Eventbrite via Apify.`
          : "Apify returned no placeable events for this search — showing the curated atlas.",
        query,
      },
    };
    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Apify error";
    const body: EventsResponse = {
      events: curated,
      meta: {
        source: "curated",
        live: false,
        count: curated.length,
        fetchedAt: new Date().toISOString(),
        cached: false,
        actor: ACTOR_ID,
        notice: `Live fetch failed (${message}). Showing the curated atlas.`,
        query,
      },
    };
    return NextResponse.json(body, { status: 200 });
  }
}
