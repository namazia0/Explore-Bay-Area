import { CATEGORY_BY_ID } from "@/lib/categories";
import type { CategoryId } from "@/lib/types";

export function CategoryIcon({
  id,
  size = 16,
  className = "",
  strokeWidth = 1.7,
}: {
  id: CategoryId;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const def = CATEGORY_BY_ID[id];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={def.icon} />
    </svg>
  );
}

export function Glyph({
  d,
  size = 14,
  className = "",
  strokeWidth = 1.7,
}: {
  d: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const GLYPHS = {
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  close: "M18 6 6 18M6 6l12 12",
  chevron: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  layers: "m12 2 10 6-10 6L2 8l10-6zM2 14l10 6 10-6M2 11l10 6 10-6",
  flame: "M12 22c4 0 7-2.8 7-6.5 0-4.5-5-6-4-11C10 6 7 8.5 7 12c0 1.4.5 2.5 1.3 3.3C8.8 13 10 11.5 11 11c-.6 2-.5 3.4.4 4.3.9.9 2.3.8 3-.1.4 2.8-1.1 4.6-2.4 5.3",
  cube: "M12 2 3 7v10l9 5 9-5V7l-9-5zM3 7l9 5 9-5M12 12v10",
  map: "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.2 7.8l-2.3 6.4-6.4 2.3 2.3-6.4 6.4-2.3z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  ticket: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4zM13 7v10",
  external: "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8",
  route: "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM15 8H9a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6",
  check: "m5 13 4 4L19 7",
  reset: "M3 12a9 9 0 1 0 2.6-6.4M3 4v5h5",
  question: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  satellite: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
} as const;
