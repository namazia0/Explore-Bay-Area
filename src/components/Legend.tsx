"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { TRANSIT_KINDS } from "@/lib/transit";
import { CategoryIcon, Glyph, GLYPHS } from "./Icon";
import type { CategoryId } from "@/lib/types";

export default function Legend({
  showTransit,
  onToggleTransit,
  active,
  onToggleCategory,
  counts,
}: {
  showTransit: boolean;
  onToggleTransit: () => void;
  active: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  counts: Record<string, number>;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="panel framed grain relative w-[228px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="tap flex w-full items-center justify-between px-3.5 py-2"
        aria-expanded={open}
      >
        <span className="label">Legend</span>
        <Glyph
          d={GLYPHS.chevron}
          size={12}
          className={`text-ink-3 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <div className="scroll max-h-[46vh] overflow-y-auto border-t border-rule/50 px-3.5 py-2.5">
          <button
            type="button"
            onClick={onToggleTransit}
            className="tap mb-1.5 flex w-full items-center gap-2 text-left"
          >
            <span
              className={`grid h-3 w-3 shrink-0 place-items-center border ${
                showTransit ? "border-rust bg-rust text-paper-3" : "border-rule text-transparent"
              }`}
            >
              <Glyph d={GLYPHS.check} size={8} strokeWidth={3} />
            </span>
            <span className="label !text-[9px] !text-ink-2">Transit</span>
          </button>

          <ul className={`mb-3 space-y-1 pl-5 ${showTransit ? "" : "opacity-40"}`}>
            {TRANSIT_KINDS.map((k) => (
              <li key={k.id} className="flex items-center gap-2">
                <svg width="22" height="6" aria-hidden className="shrink-0">
                  <line
                    x1="0"
                    y1="3"
                    x2="22"
                    y2="3"
                    stroke={k.color}
                    strokeWidth={k.width}
                    strokeDasharray={k.dash ? k.dash.map((d) => d * 2).join(" ") : undefined}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="meta !text-[10px] !text-ink-2">{k.label}</span>
              </li>
            ))}
          </ul>

          <div className="mb-1.5 border-t border-rule/40 pt-2">
            <span className="label !text-[9px]">Events</span>
          </div>

          <ul className="space-y-0.5">
            {CATEGORIES.filter((c) => c.id !== "other" || counts.other > 0).map((cat) => {
              const on = active.size === 0 || active.has(cat.id);
              const n = counts[cat.id] ?? 0;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`tap flex w-full items-center gap-2 py-[3px] text-left ${
                      on ? "" : "opacity-35"
                    }`}
                    aria-pressed={active.has(cat.id)}
                  >
                    <span
                      className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border"
                      style={{
                        color: cat.color,
                        borderColor: `${cat.color}66`,
                        background: active.has(cat.id) ? cat.tint : "transparent",
                      }}
                    >
                      <CategoryIcon id={cat.id} size={11} strokeWidth={2} />
                    </span>
                    <span className="meta flex-1 truncate !text-[10.5px] !text-ink-2">
                      {cat.label}
                    </span>
                    <span className="meta tabular-nums !text-[9.5px]">{n || "—"}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 border-t border-rule/40 pt-2">
            <span className="label !text-[9px]">Heat · events per sq mile</span>
            <div
              className="mt-1.5 h-[7px] w-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(226,206,160,.5), rgba(231,178,96,.75), rgba(221,134,62,.85), rgba(205,84,45,.9), rgba(129,24,32,.95))",
              }}
            />
            <div className="mt-1 flex justify-between">
              <span className="meta !text-[9px]">quiet</span>
              <span className="meta !text-[9px]">packed</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
