"use client";

import { CAMERAS } from "@/lib/geo";
import { Glyph, GLYPHS } from "./Icon";
import type { ViewMode } from "@/lib/types";

const MODES: { id: ViewMode; label: string; glyph: string; hint: string }[] = [
  { id: "explore", label: "3D", glyph: GLYPHS.cube, hint: "Terrain and extruded buildings" },
  { id: "heat", label: "Heat", glyph: GLYPHS.flame, hint: "Density wash, flattened" },
  { id: "flat", label: "Plan", glyph: GLYPHS.map, hint: "Straight-down plan view" },
];

export default function ViewToolbar({
  mode,
  onMode,
  showHeat,
  onToggleHeat,
  showBuildings,
  onToggleBuildings,
  onCamera,
  bearing,
  onResetNorth,
}: {
  mode: ViewMode;
  onMode: (m: ViewMode) => void;
  showHeat: boolean;
  onToggleHeat: () => void;
  showBuildings: boolean;
  onToggleBuildings: () => void;
  onCamera: (id: string) => void;
  bearing: number;
  onResetNorth: () => void;
}) {
  return (
    <div className="panel framed grain flex items-stretch gap-px overflow-hidden bg-rule/30">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onMode(m.id)}
          title={m.hint}
          aria-pressed={mode === m.id}
          className={`tap flex items-center gap-1.5 px-3 py-2 ${
            mode === m.id ? "bg-ink text-paper-3" : "bg-paper-3 text-ink-2 hover:bg-paper-2"
          }`}
        >
          <Glyph d={m.glyph} size={12} />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]">{m.label}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onToggleHeat}
        title="Toggle the heat layer"
        aria-pressed={showHeat}
        className={`tap px-2.5 py-2 ${
          showHeat ? "bg-rust/12 text-rust" : "bg-paper-3 text-ink-3 hover:bg-paper-2"
        }`}
      >
        <Glyph d={GLYPHS.flame} size={13} />
      </button>

      <button
        type="button"
        onClick={onToggleBuildings}
        title="Toggle buildings"
        aria-pressed={showBuildings}
        className={`tap px-2.5 py-2 ${
          showBuildings ? "bg-ink/8 text-ink" : "bg-paper-3 text-ink-3 hover:bg-paper-2"
        }`}
      >
        <Glyph d={GLYPHS.layers} size={13} />
      </button>

      <button
        type="button"
        onClick={onResetNorth}
        title="Point the map north"
        className="tap grid place-items-center bg-paper-3 px-2.5 py-2 text-ink-2 hover:bg-paper-2"
      >
        <span
          className="block transition-transform duration-500"
          style={{ transform: `rotate(${-bearing}deg)` }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2 L15.6 13 L12 10.6 L8.4 13 Z" fill="#C0462A" />
            <path d="M12 22 L8.4 11 L12 13.4 L15.6 11 Z" fill="currentColor" opacity="0.45" />
          </svg>
        </span>
      </button>

      <div className="relative bg-paper-3">
        <select
          value=""
          onChange={(e) => e.target.value && onCamera(e.target.value)}
          aria-label="Jump to a part of the Bay"
          className="tap h-full cursor-pointer appearance-none bg-transparent py-2 pl-3 pr-7 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-2 outline-none hover:bg-paper-2"
        >
          <option value="">Jump to…</option>
          {CAMERAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <Glyph
          d={GLYPHS.chevron}
          size={11}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-3"
        />
      </div>
    </div>
  );
}
