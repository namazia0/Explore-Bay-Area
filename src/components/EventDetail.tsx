"use client";

import { CATEGORY_BY_ID } from "@/lib/categories";
import { formatPrice, formatWhen, formatTime } from "@/lib/format";
import { CategoryIcon, Glyph, GLYPHS } from "./Icon";
import type { BayEvent } from "@/lib/types";

export default function EventDetail({
  event,
  onClose,
  onFlyTo,
  nearby,
  onSelect,
}: {
  event: BayEvent;
  onClose: () => void;
  onFlyTo: () => void;
  nearby: BayEvent[];
  onSelect: (id: string) => void;
}) {
  const cat = CATEGORY_BY_ID[event.category];

  return (
    <article className="panel framed grain anim-in flex max-h-full w-[320px] flex-col overflow-hidden">
      {event.image && (
        <div className="relative h-[124px] shrink-0 overflow-hidden border-b border-rule/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "sepia(0.22) saturate(0.86) contrast(1.02)" }}
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,248,239,0) 40%, rgba(251,248,239,.85) 100%)",
            }}
          />
          <span
            className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-[4px] border px-1.5 py-[3px] backdrop-blur-sm"
            style={{ color: cat.color, borderColor: `${cat.color}80`, background: "#FBF8EFDD" }}
          >
            <CategoryIcon id={event.category} size={11} strokeWidth={2} />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{cat.label}</span>
          </span>
        </div>
      )}

      <div className="scroll flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="display text-[19px] leading-[1.2] text-ink">{event.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap mt-1 shrink-0 text-ink-3 hover:text-rust"
          >
            <Glyph d={GLYPHS.close} size={14} />
          </button>
        </div>

        {event.subcategory && (
          <p className="meta mt-1 !text-[9.5px] uppercase tracking-[0.14em]">{event.subcategory}</p>
        )}

        <dl className="mt-3 space-y-1.5 border-y border-rule/45 py-2.5">
          <Row glyph={GLYPHS.clock} label="When">
            {formatWhen(event.start)}
            {event.end && ` – ${formatTime(event.end)}`}
          </Row>
          <Row glyph={GLYPHS.pin} label="Where">
            {event.venue}
            {event.neighborhood ? ` · ${event.neighborhood}` : ""}
            <span className="block text-ink-3">{event.address ?? event.city}</span>
          </Row>
          <Row glyph={GLYPHS.ticket} label="Price">
            <span style={{ color: event.isFree ? cat.color : undefined }}>
              {formatPrice(event)}
            </span>
          </Row>
          {event.organizer && (
            <Row glyph={GLYPHS.compass} label="By">
              {event.organizer}
            </Row>
          )}
        </dl>

        {event.summary && (
          <p className="mt-3 font-serif text-[13.5px] leading-[1.55] text-ink-2">{event.summary}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-rule/35">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${event.heat}%`, background: cat.color }}
            />
          </div>
          <span className="meta tabular-nums !text-[9px]">heat {event.heat}</span>
        </div>

        {nearby.length > 0 && (
          <div className="mt-4">
            <span className="label !text-[8.5px]">Also within a few blocks</span>
            <ul className="mt-1.5 space-y-px">
              {nearby.map((n) => {
                const c = CATEGORY_BY_ID[n.category];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(n.id)}
                      className="tap flex w-full items-center gap-2 rounded-[3px] px-1 py-1 text-left hover:bg-paper-2/70"
                    >
                      <span style={{ color: c.color }} className="shrink-0">
                        <CategoryIcon id={n.category} size={11} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif text-[12.5px] text-ink-2">
                        {n.title}
                      </span>
                      <span className="meta shrink-0 !text-[9px]">{formatPrice(n)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <footer className="flex shrink-0 gap-px border-t border-rule/50 bg-rule/30">
        <button
          type="button"
          onClick={onFlyTo}
          className="tap flex flex-1 items-center justify-center gap-1.5 bg-paper-3 py-2.5 text-ink-2 hover:bg-paper-2"
        >
          <Glyph d={GLYPHS.cube} size={12} />
          <span className="label !text-[9px] !text-ink-2">Fly there</span>
        </button>
        {event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="tap flex flex-1 items-center justify-center gap-1.5 bg-paper-3 py-2.5 text-rust hover:bg-rust hover:text-paper-3"
          >
            <Glyph d={GLYPHS.external} size={12} />
            <span className="label !text-[9px] !text-current">Tickets</span>
          </a>
        ) : (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${event.venue} ${event.city}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tap flex flex-1 items-center justify-center gap-1.5 bg-paper-3 py-2.5 text-ink-2 hover:bg-paper-2"
          >
            <Glyph d={GLYPHS.external} size={12} />
            <span className="label !text-[9px] !text-ink-2">Directions</span>
          </a>
        )}
      </footer>
    </article>
  );
}

function Row({
  glyph,
  label,
  children,
}: {
  glyph: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-[3px] shrink-0 text-ink-3">
        <Glyph d={glyph} size={12} />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="label !text-[8px]">{label}</dt>
        <dd className="font-serif text-[13px] leading-snug text-ink">{children}</dd>
      </div>
    </div>
  );
}
