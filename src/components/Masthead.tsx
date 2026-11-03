"use client";

import { Glyph, GLYPHS } from "./Icon";

export default function Masthead({
  onHelp,
  liveLabel,
  loading,
}: {
  onHelp: () => void;
  liveLabel: string;
  loading: boolean;
}) {
  return (
    <header className="panel framed grain relative px-4 pt-3.5 pb-3">
      <div className="flex items-start gap-3">
        <h1 className="display text-[26px] leading-[1.05] text-ink">
          Explore{" "}
          <span className="italic font-normal text-rust">Bay Area</span>
        </h1>
        <button
          type="button"
          onClick={onHelp}
          aria-label="Keyboard shortcuts and help"
          className="tap mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center border border-rule/80 text-ink-3 hover:border-rust hover:text-rust"
        >
          <Glyph d={GLYPHS.question} size={11} strokeWidth={2} />
        </button>
      </div>

      <p className="mt-1.5 max-w-[30ch] font-mono text-[10px] leading-[1.55] tracking-[0.02em] text-ink-3">
        A field guide to what&apos;s on. Pick a quest, search the nine counties,
        read the city by its heat. Press{" "}
        <kbd className="border border-rule/70 px-1 py-px text-[9px] text-ink-2">?</kbd> for keys.
      </p>

      <div className="mt-2.5 flex items-center gap-2 border-t border-rule/50 pt-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            loading ? "bg-rust/50" : "bg-rust"
          }`}
          style={loading ? { animation: "pulse-ring 1.2s ease-out infinite" } : undefined}
        />
        <span className="label truncate !text-[9px]">{liveLabel}</span>
      </div>
      {loading && <div className="loading-rule absolute inset-x-0 bottom-0 h-[2px]" />}
    </header>
  );
}
