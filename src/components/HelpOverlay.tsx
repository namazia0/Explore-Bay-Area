"use client";

import { useEffect } from "react";
import { Glyph, GLYPHS } from "./Icon";

const KEYS: [string, string][] = [
  ["/", "Focus the search field"],
  ["1 – 3", "3D · Heat · Plan view"],
  ["H", "Toggle the heat layer"],
  ["B", "Toggle buildings"],
  ["T", "Toggle transit lines"],
  ["L", "Toggle the programme column"],
  ["R", "Reset the camera to the whole Bay"],
  ["Esc", "Clear the selected event"],
  ["?", "This panel"],
];

const CREDITS: [string, string][] = [
  ["Live listings", "Eventbrite, scraped on demand through an Apify Actor"],
  ["Curated atlas", "107 hand-placed Bay Area venues, refreshed daily"],
  ["Basemap", "OpenStreetMap via OpenFreeMap vector tiles"],
  ["Terrain", "Mapzen / AWS Terrain Tiles, terrarium-encoded"],
];

export default function HelpOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-50 grid place-items-center bg-ink/25 p-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel framed grain anim-up relative w-[min(520px,100%)] px-6 py-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Help"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="tap absolute right-4 top-4 text-ink-3 hover:text-rust"
        >
          <Glyph d={GLYPHS.close} size={15} />
        </button>

        <h2 className="display text-[24px] leading-tight text-ink">
          Explore <span className="italic font-normal text-rust">Bay Area</span>
        </h2>
        <p className="mt-2 max-w-[46ch] font-serif text-[13.5px] leading-[1.6] text-ink-2">
          Every public event the nine counties can offer, placed on a three-dimensional
          plate of the Bay. Drag to pan, right-drag to orbit, scroll to zoom. The heat
          layer shows where the evening is actually happening.
        </p>

        <div className="mt-4 grid gap-5 border-t border-rule/50 pt-4 sm:grid-cols-2">
          <div>
            <span className="label">Keys</span>
            <ul className="mt-2 space-y-1">
              {KEYS.map(([k, d]) => (
                <li key={k} className="flex items-baseline gap-2.5">
                  <kbd className="min-w-[42px] shrink-0 border border-rule/70 bg-paper-2/70 px-1.5 py-px text-center font-mono text-[9.5px] text-ink-2">
                    {k}
                  </kbd>
                  <span className="font-serif text-[12.5px] leading-snug text-ink-2">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="label">Where the data comes from</span>
            <dl className="mt-2 space-y-2">
              {CREDITS.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
                    {k}
                  </dt>
                  <dd className="font-serif text-[12.5px] leading-snug text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <p className="mt-4 border-t border-rule/50 pt-3 font-mono text-[9px] leading-relaxed tracking-[0.04em] text-ink-3">
          Live search runs an Apify Actor against Eventbrite and is billed per result.
          Results are cached for thirty minutes, so reloading never costs twice.
        </p>
      </div>
    </div>
  );
}
