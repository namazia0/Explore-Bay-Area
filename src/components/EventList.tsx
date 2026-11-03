"use client";

import { useMemo } from "react";
import { CATEGORY_BY_ID } from "@/lib/categories";
import { formatPrice, formatWhen, plural } from "@/lib/format";
import { CategoryIcon, Glyph, GLYPHS } from "./Icon";
import type { BayEvent } from "@/lib/types";

export default function EventList({
  events,
  selectedId,
  onSelect,
  open,
  onToggle,
}: {
  events: BayEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  // Group by day so the column reads like a programme.
  const groups = useMemo(() => {
    const map = new Map<string, BayEvent[]>();
    for (const ev of events.slice(0, 220)) {
      const key = ev.start.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(ev);
      else map.set(key, [ev]);
    }
    return [...map.entries()];
  }, [events]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="panel framed grain tap flex items-center gap-2 px-3 py-2"
        aria-label="Open the programme"
      >
        <Glyph d={GLYPHS.list} size={13} className="text-ink-2" />
        <span className="label !text-[9px]">{plural(events.length, "event")}</span>
      </button>
    );
  }

  return (
    <section className="panel framed grain anim-in flex max-h-full w-[290px] flex-col">
      <header className="flex items-center justify-between border-b border-rule/50 px-3.5 py-2.5">
        <div>
          <h2 className="display text-[15px] leading-none text-ink">The Programme</h2>
          <p className="meta mt-1 !text-[9.5px]">{plural(events.length, "event")} matching</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse the programme"
          className="tap text-ink-3 hover:text-rust"
        >
          <Glyph d={GLYPHS.close} size={13} />
        </button>
      </header>

      <div className="scroll flex-1 overflow-y-auto">
        {groups.length === 0 && (
          <p className="px-3.5 py-6 text-center font-serif text-[13px] italic text-ink-3">
            Nothing on in that slice of the Bay. Widen the dates or clear a filter.
          </p>
        )}

        {groups.map(([day, list]) => (
          <div key={day}>
            <div className="sticky top-0 z-10 border-y border-rule/40 bg-paper-3/92 px-3.5 py-1 backdrop-blur-sm">
              <span className="label !text-[8.5px]">
                {formatWhen(list[0].start).split(" · ")[0]}
                <span className="ml-1.5 text-ink-3/60">{list.length}</span>
              </span>
            </div>

            {list.map((ev) => {
              const cat = CATEGORY_BY_ID[ev.category];
              const on = ev.id === selectedId;
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev.id)}
                  className={`tap flex w-full gap-2.5 border-b border-rule/30 px-3.5 py-2.5 text-left ${
                    on ? "bg-paper-2" : "hover:bg-paper-2/60"
                  }`}
                  style={on ? { boxShadow: `inset 3px 0 0 ${cat.color}` } : undefined}
                >
                  <span
                    className="mt-[2px] grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[5px] border"
                    style={{ color: cat.color, borderColor: `${cat.color}55`, background: cat.tint }}
                  >
                    <CategoryIcon id={ev.category} size={12} strokeWidth={2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[13.5px] font-medium leading-snug text-ink">
                      {ev.title}
                    </span>
                    <span className="meta mt-[3px] flex items-center gap-1.5 !text-[9.5px]">
                      <span className="truncate">{ev.venue}</span>
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="meta !text-[9.5px] !text-ink-2">
                        {formatWhen(ev.start).split(" · ")[1]}
                      </span>
                      <span
                        className="font-mono text-[9.5px] tabular-nums"
                        style={{ color: ev.isFree ? cat.color : "#5b5042" }}
                      >
                        {formatPrice(ev)}
                      </span>
                      {ev.source === "eventbrite" && (
                        <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.12em] text-rust/75">
                          live
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
