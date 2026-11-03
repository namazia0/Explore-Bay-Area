"use client";

import { useState } from "react";
import { QUESTS, type Quest } from "@/lib/quests";
import { Glyph, GLYPHS } from "./Icon";

export default function QuestPanel({
  activeId,
  onPick,
}: {
  activeId: string | null;
  onPick: (quest: Quest | null) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="panel framed grain relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="tap flex w-full items-center justify-between px-4 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="display text-[17px] text-ink">Quests</span>
        <Glyph
          d={GLYPHS.chevron}
          size={13}
          className={`text-ink-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <div className="scroll max-h-[34vh] overflow-y-auto border-t border-rule/50">
          {QUESTS.map((q, i) => {
            const active = q.id === activeId;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onPick(active ? null : q)}
                className={`tap group flex w-full gap-3 border-b border-rule/35 px-4 py-2.5 text-left last:border-b-0 ${
                  active ? "bg-paper-2/80" : "hover:bg-paper-2/55"
                }`}
              >
                <span
                  className="mt-[3px] font-mono text-[9px] tabular-nums"
                  style={{ color: active ? q.color : undefined }}
                >
                  {active ? "◆" : String(i + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="display block text-[15px] leading-snug"
                    style={{ color: active ? q.color : undefined }}
                  >
                    {q.title}
                  </span>
                  <span className="meta mt-0.5 block truncate !text-[9.5px]">{q.meta}</span>
                  {active && (
                    <span className="anim-up mt-1.5 block font-serif text-[12px] leading-[1.45] text-ink-2">
                      {q.blurb}
                    </span>
                  )}
                </span>

                <Glyph
                  d={GLYPHS.chevronRight}
                  size={11}
                  className={`mt-1 shrink-0 transition-opacity ${
                    active ? "opacity-0" : "text-ink-3 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {activeId && (
        <button
          type="button"
          onClick={() => onPick(null)}
          className="tap flex w-full items-center justify-center gap-1.5 border-t border-rule/50 py-2 text-ink-3 hover:text-rust"
        >
          <Glyph d={GLYPHS.reset} size={10} />
          <span className="label !text-[9px]">Clear quest</span>
        </button>
      )}
    </section>
  );
}
