"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon, Glyph, GLYPHS } from "./Icon";
import type { CategoryId, WhenFilter } from "@/lib/types";

const WHENS: { id: WhenFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "Weekend" },
  { id: "week", label: "7 days" },
  { id: "month", label: "30 days" },
  { id: "all", label: "All" },
];

export default function FilterBar({
  q,
  onQ,
  onSubmit,
  when,
  onWhen,
  freeOnly,
  onFreeOnly,
  active,
  onToggleCategory,
  onClearCategories,
  resultCount,
  searching,
}: {
  q: string;
  onQ: (v: string) => void;
  onSubmit: () => void;
  when: WhenFilter;
  onWhen: (w: WhenFilter) => void;
  freeOnly: boolean;
  onFreeOnly: (v: boolean) => void;
  active: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  onClearCategories: () => void;
  resultCount: number;
  searching: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = document.activeElement?.tagName === "INPUT";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape" && typing) input.current?.blur();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="panel framed grain relative w-[min(640px,calc(100vw-2rem))] px-3 py-2.5">
      {/* search row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-2"
      >
        <Glyph d={GLYPHS.search} size={14} className="shrink-0 text-ink-3" />
        <input
          ref={input}
          type="search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search events, venues, neighbourhoods — try “jazz”, “night market”, “hike”…"
          aria-label="Search Bay Area events"
          className="min-w-0 flex-1 bg-transparent font-serif text-[14px] text-ink outline-none placeholder:text-ink-3/70"
        />
        {q && (
          <button
            type="button"
            onClick={() => onQ("")}
            aria-label="Clear search"
            className="tap shrink-0 text-ink-3 hover:text-rust"
          >
            <Glyph d={GLYPHS.close} size={13} />
          </button>
        )}
        <button
          type="submit"
          className="tap shrink-0 border border-rust/70 bg-rust/5 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-rust hover:bg-rust hover:text-paper-3"
        >
          {searching ? "…" : "Search live"}
        </button>
      </form>

      <div className="my-2 border-t border-rule/45" />

      {/* when + price */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="label mr-0.5 !text-[8.5px]">When</span>
        {WHENS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onWhen(w.id)}
            aria-pressed={when === w.id}
            className={`tap chip px-2 py-[3px] ${
              when === w.id
                ? "!border-ink/70 !bg-ink !text-paper-3"
                : "text-ink-2 hover:!border-ink/50"
            }`}
          >
            {w.label}
          </button>
        ))}

        <span className="mx-1 h-3 w-px bg-rule/60" />

        <button
          type="button"
          onClick={() => onFreeOnly(!freeOnly)}
          aria-pressed={freeOnly}
          className={`tap chip px-2 py-[3px] ${
            freeOnly ? "!border-rust !bg-rust !text-paper-3" : "text-ink-2 hover:!border-rust/60"
          }`}
        >
          Free only
        </button>

        <span className="ml-auto meta tabular-nums whitespace-nowrap !text-[10px]">
          {resultCount.toLocaleString()} on the map
        </span>
      </div>

      {/* categories */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {CATEGORIES.map((cat) => {
          const on = active.has(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              aria-pressed={on}
              title={cat.blurb}
              className="tap flex items-center gap-1.5 rounded-[4px] border px-1.5 py-[3px]"
              style={{
                borderColor: on ? cat.color : "color-mix(in srgb, #c9bca2 75%, transparent)",
                background: on ? cat.tint : "transparent",
                color: on ? cat.color : "#5b5042",
              }}
            >
              <CategoryIcon id={cat.id} size={11} strokeWidth={2} />
              <span className="font-mono text-[9.5px] uppercase tracking-[0.07em]">
                {cat.label}
              </span>
            </button>
          );
        })}
        {active.size > 0 && (
          <button
            type="button"
            onClick={onClearCategories}
            className="tap ml-0.5 flex items-center gap-1 px-1 py-[3px] text-ink-3 hover:text-rust"
          >
            <Glyph d={GLYPHS.reset} size={10} />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.07em]">All</span>
          </button>
        )}
      </div>
    </div>
  );
}
