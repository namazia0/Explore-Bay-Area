import type { BayEvent } from "./types";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, "0")}${ampm}`;
}

export function formatDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return DAY[d.getDay()];
  return `${DAY[d.getDay()]} ${MONTH[d.getMonth()]} ${d.getDate()}`;
}

export function formatWhen(iso: string, now = new Date()): string {
  return `${formatDay(iso, now)} · ${formatTime(iso)}`;
}

export function formatPrice(ev: Pick<BayEvent, "isFree" | "minPrice" | "maxPrice">): string {
  if (ev.isFree) return "Free";
  const lo = ev.minPrice;
  const hi = ev.maxPrice;
  if (lo == null && hi == null) return "—";
  if (lo === 0 && hi === 0) return "Free";
  if (lo != null && hi != null && hi > lo) return `$${Math.round(lo)}–${Math.round(hi)}`;
  return `$${Math.round((lo ?? hi) as number)}`;
}

/** Compact label drawn next to the map pin, e.g. "The Fillmore  $38". */
export function pinLabel(ev: BayEvent): string {
  const title = ev.title.length > 26 ? `${ev.title.slice(0, 25)}…` : ev.title;
  return `${title}  ${formatPrice(ev)}`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}
