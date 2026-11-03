import { resolveCategory } from "./categories";
import { cityCentroid, inBayArea, jitter, nearestNeighborhood } from "./geo";
import type { BayEvent } from "./types";

/** Shape is intentionally loose — scraper output drifts between runs. */
type Raw = Record<string, unknown>;

const get = (o: Raw, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Raw)[k] : undefined), o);

function str(o: Raw, ...paths: string[]): string | null {
  for (const p of paths) {
    const v = get(o, p);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function num(o: Raw, ...paths: string[]): number | null {
  for (const p of paths) {
    const v = get(o, p);
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function bool(o: Raw, ...paths: string[]): boolean | null {
  for (const p of paths) {
    const v = get(o, p);
    if (typeof v === "boolean") return v;
  }
  return null;
}

/** Eventbrite money objects carry minor units (4210 === $42.10). */
function money(o: Raw, ...paths: string[]): number | null {
  for (const p of paths) {
    const v = get(o, p);
    if (typeof v === "number") return v > 1000 ? v / 100 : v;
    if (v && typeof v === "object") {
      const raw = (v as Raw).value;
      if (typeof raw === "number") return raw / 100;
    }
  }
  return null;
}

function toISO(value: string | null, tz?: string | null): string | null {
  if (!value) return null;
  // The scraper emits both "2026-08-21T18:30" (local, no zone) and full UTC.
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const d = new Date(hasZone ? value : `${value}${tz ? "" : ""}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Derive a 0-100 prominence score from whatever popularity signals exist. */
function computeHeat(o: Raw, isFree: boolean, start: string): number {
  const followers = num(o, "organizerFollowers", "organizer.organizerFollowers") ?? 0;
  const attendees = num(o, "organizer.totalAttendees") ?? 0;
  const numEvents = num(o, "organizer.numEvents") ?? 0;
  const verified = bool(o, "organizer.verified") ?? false;

  let score = 18;
  score += Math.min(28, Math.log10(followers + 1) * 11);
  score += Math.min(22, Math.log10(attendees + 1) * 6);
  score += Math.min(10, numEvents / 25);
  if (verified) score += 8;
  if (isFree) score += 6;

  const days = (new Date(start).getTime() - Date.now()) / 86_400_000;
  if (days >= 0 && days < 14) score += (14 - days) * 0.9;

  return Math.max(5, Math.min(100, Math.round(score)));
}

export function normalizeApifyEvent(raw: Raw, index: number): BayEvent | null {
  const title = str(raw, "eventTitle", "title", "name");
  if (!title) return null;

  const id = str(raw, "eventId", "id") ?? `apify-${index}`;
  const url = str(raw, "eventUrl", "url");

  const startRaw = str(raw, "startTime", "timing.start", "timing.displayDate", "start");
  const tz = str(raw, "timezone", "timing.timezone");
  const start = toISO(startRaw, tz);
  if (!start) return null;

  const end = toISO(str(raw, "endTime", "timing.end"), tz);

  const isOnline = bool(raw, "isOnlineEvent") ?? false;

  // Eventbrite search pages leak events from other countries, and the scraper
  // hands those back with a placeholder San Francisco coordinate that sails
  // through the bounding-box check below. The country is the reliable signal,
  // so trust it over the point.
  const country = str(raw, "venueCountry", "location.country");
  if (country && country.toUpperCase() !== "US") return null;

  const city = str(raw, "venueCity", "location.city") ?? "San Francisco";
  let lat = num(raw, "coordinates.latitude", "location.coordinates.latitude");
  let lng = num(raw, "coordinates.longitude", "location.coordinates.longitude");

  if (lat == null || lng == null) {
    // An online event has no physical venue, so a city centroid would invent a
    // location rather than report one. Drop it instead of pinning it downtown.
    if (isOnline) return null;
    const centroid = cityCentroid(city);
    if (!centroid) return null; // Unplaceable — drop rather than guess.
    const [dx, dy] = jitter(id, 450);
    lng = centroid[0] + dx;
    lat = centroid[1] + dy;
  }

  if (!inBayArea(lng, lat)) return null;

  const sourceCategory = str(raw, "category", "subcategory", "format");
  const subcategory = str(raw, "subcategory", "format");
  const summary = str(raw, "summary", "description") ?? "";
  const category = resolveCategory(sourceCategory, `${title} ${subcategory ?? ""} ${summary.slice(0, 160)}`);

  const minPrice = money(raw, "minPrice", "pricing.minPrice");
  const maxPrice = money(raw, "maxPrice", "pricing.maxPrice");
  const isFree =
    (bool(raw, "isFree", "pricing.isFree") ?? false) ||
    str(raw, "paidStatus") === "free" ||
    (minPrice === 0 && maxPrice === 0);

  const venue = str(raw, "venueName", "location.venueName") ?? (isOnline ? "Online" : city);
  const address = str(raw, "venueAddress", "location.address");

  return {
    id: `eb-${id}`,
    title,
    summary: summary.slice(0, 400),
    category,
    subcategory,
    sourceCategory,
    start,
    end,
    venue,
    address,
    city,
    neighborhood: nearestNeighborhood(lng, lat, city),
    lng,
    lat,
    isFree,
    minPrice: isFree ? 0 : minPrice,
    maxPrice: isFree ? 0 : maxPrice,
    currency: str(raw, "minPrice.currency", "pricing.currency") ?? "USD",
    organizer: str(raw, "organizerName", "organizer.name"),
    heat: computeHeat(raw, isFree, start),
    attendance: num(raw, "organizer.totalAttendees"),
    image: str(raw, "eventImage", "images.hero", "images.heroSizes.medium"),
    url,
    source: "eventbrite",
    isOnline,
  };
}

export function normalizeMany(items: Raw[]): BayEvent[] {
  const seen = new Set<string>();
  const out: BayEvent[] = [];
  items.forEach((item, i) => {
    const ev = normalizeApifyEvent(item, i);
    if (!ev || seen.has(ev.id)) return;
    seen.add(ev.id);
    out.push(ev);
  });
  return out.sort((a, b) => a.start.localeCompare(b.start));
}
