import type { BayEvent, CategoryId, WhenFilter } from "./types";

export interface FilterState {
  q: string;
  categories: Set<CategoryId>;
  when: WhenFilter;
  freeOnly: boolean;
  priceMax: number | null;
  city: string | null;
}

export function whenRange(when: WhenFilter, now = new Date()): [number, number] {
  const start = new Date(now);
  const end = new Date(now);

  switch (when) {
    case "today":
      end.setHours(23, 59, 59, 999);
      break;
    case "weekend": {
      // Friday 17:00 → Sunday 23:59 of the coming weekend.
      const day = start.getDay();
      const toFri = (5 - day + 7) % 7;
      start.setDate(start.getDate() + toFri);
      if (toFri === 0 && now.getHours() >= 17) {
        // already in it
      } else {
        start.setHours(17, 0, 0, 0);
      }
      end.setTime(start.getTime());
      end.setDate(end.getDate() + (7 - end.getDay()) % 7);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "week":
      end.setDate(end.getDate() + 7);
      break;
    case "month":
      end.setDate(end.getDate() + 30);
      break;
    case "all":
    default:
      end.setFullYear(end.getFullYear() + 2);
  }
  return [start.getTime(), end.getTime()];
}

function matchesText(ev: BayEvent, q: string): boolean {
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const terms = needle.split(/\s+/);
  const hay = [
    ev.title,
    ev.summary,
    ev.venue,
    ev.city,
    ev.neighborhood ?? "",
    ev.organizer ?? "",
    ev.subcategory ?? "",
    ev.sourceCategory ?? "",
    ev.category,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export function filterEvents(events: BayEvent[], f: FilterState, now = new Date()): BayEvent[] {
  const [lo, hi] = whenRange(f.when, now);
  return events.filter((ev) => {
    const t = new Date(ev.start).getTime();
    if (f.when !== "all" && (t < lo - 12 * 3600_000 || t > hi)) return false;
    if (f.categories.size && !f.categories.has(ev.category)) return false;
    if (f.freeOnly && !ev.isFree) return false;
    if (f.priceMax != null && !ev.isFree && (ev.minPrice ?? 0) > f.priceMax) return false;
    if (f.city && ev.city.toLowerCase() !== f.city.toLowerCase()) return false;
    return matchesText(ev, f.q);
  });
}
