"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CameraTarget, Viewport } from "@/components/MapCanvas";
import Masthead from "@/components/Masthead";
import QuestPanel from "@/components/QuestPanel";
import FilterBar from "@/components/FilterBar";
import Legend from "@/components/Legend";
import MiniMap from "@/components/MiniMap";
import EventList from "@/components/EventList";
import EventDetail from "@/components/EventDetail";
import ViewToolbar from "@/components/ViewToolbar";
import HelpOverlay from "@/components/HelpOverlay";
import { CAMERAS } from "@/lib/geo";
import { filterEvents } from "@/lib/filter";
import { QUESTS, type Quest } from "@/lib/quests";
import type { BayEvent, CategoryId, EventsResponse, ViewMode, WhenFilter } from "@/lib/types";

// WebGL has no business running on the server.
const MapCanvas = dynamic(() => import("@/components/MapCanvas"), { ssr: false });

const BAY = CAMERAS[0];

export default function Page() {
  /* ——— data ——— */
  const [events, setEvents] = useState<BayEvent[]>([]);
  const [meta, setMeta] = useState<EventsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  // The first load is itself a live search, so this starts busy.
  const [searching, setSearching] = useState(true);

  /* ——— filters ——— */
  const [q, setQ] = useState("");
  const [when, setWhen] = useState<WhenFilter>("week");
  const [freeOnly, setFreeOnly] = useState(false);
  const [categories, setCategories] = useState<Set<CategoryId>>(new Set());

  /* ——— map ——— */
  const [viewMode, setViewMode] = useState<ViewMode>("explore");
  const [showHeat, setShowHeat] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [camera, setCamera] = useState<CameraTarget | null>(null);
  const nonce = useRef(0);

  /* ——— ui ——— */
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  const fly = useCallback(
    (center: [number, number], zoom: number, pitch = 58, bearing = -18) => {
      nonce.current += 1;
      setCamera({ center, zoom, pitch, bearing, nonce: nonce.current });
    },
    [],
  );

  /* ——————————————————— fetch ——————————————————— */
  type LoadOpts = { q?: string; categories?: CategoryId[]; live: boolean };

  // Pure request: no state is touched here, so callers decide what to apply
  // and when — which is what lets the mount effect drop a stale response.
  const fetchEvents = useCallback(async (opts: LoadOpts): Promise<EventsResponse> => {
    const params = new URLSearchParams();
    if (opts.q) params.set("q", opts.q);
    if (opts.categories?.length) params.set("categories", opts.categories.join(","));
    params.set("live", opts.live ? "1" : "0");
    const res = await fetch(`/api/events?${params}`);
    return (await res.json()) as EventsResponse;
  }, []);

  const OFFLINE_META: EventsResponse["meta"] = useMemo(
    () => ({
      source: "curated",
      live: false,
      count: 0,
      fetchedAt: new Date().toISOString(),
      cached: false,
      notice: "Could not reach the events API.",
    }),
    [],
  );

  const load = useCallback(
    async (opts: LoadOpts) => {
      if (opts.live) setSearching(true);
      else setLoading(true);
      try {
        const body = await fetchEvents(opts);
        setEvents(body.events);
        setMeta(body.meta);
      } catch {
        setMeta((m) => m ?? OFFLINE_META);
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [fetchEvents, OFFLINE_META],
  );

  // Both pending flags already start true, so the mount fetch only has to
  // apply its result. State is set in the async continuation rather than
  // synchronously in the effect body, and a response that lands after unmount
  // is dropped.
  useEffect(() => {
    let cancelled = false;
    fetchEvents({ live: true })
      .then((body) => {
        if (cancelled) return;
        setEvents(body.events);
        setMeta(body.meta);
      })
      .catch(() => {
        if (!cancelled) setMeta((m) => m ?? OFFLINE_META);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEvents, OFFLINE_META]);

  const runLiveSearch = useCallback(() => {
    void load({ q, categories: [...categories], live: true });
  }, [load, q, categories]);

  /* ——————————————————— derived ——————————————————— */
  // A quest narrows the map to its own categories unless the user has picked some.
  const effectiveCategories = useMemo(() => {
    if (categories.size > 0) return categories;
    if (activeQuest) return new Set(activeQuest.focus);
    return new Set<CategoryId>();
  }, [categories, activeQuest]);

  const visible = useMemo(
    () =>
      filterEvents(events, {
        q,
        categories: effectiveCategories,
        when,
        freeOnly,
        priceMax: null,
        city: null,
      }),
    [events, q, effectiveCategories, when, freeOnly],
  );

  const counts = useMemo(() => {
    const base = filterEvents(events, {
      q,
      categories: new Set<CategoryId>(),
      when,
      freeOnly,
      priceMax: null,
      city: null,
    });
    const out: Record<string, number> = {};
    for (const ev of base) out[ev.category] = (out[ev.category] ?? 0) + 1;
    return out;
  }, [events, q, when, freeOnly]);

  const selected = useMemo(
    () => visible.find((e) => e.id === selectedId) ?? events.find((e) => e.id === selectedId) ?? null,
    [visible, events, selectedId],
  );

  const nearby = useMemo(() => {
    if (!selected) return [];
    return visible
      .filter((e) => e.id !== selected.id)
      .map((e) => ({
        e,
        d: (e.lng - selected.lng) ** 2 + (e.lat - selected.lat) ** 2,
      }))
      .filter((x) => x.d < 0.00004) // ≈ 700 m
      .sort((a, b) => a.d - b.d)
      .slice(0, 4)
      .map((x) => x.e);
  }, [selected, visible]);

  const liveLabel = useMemo(() => {
    if (loading) return "Charting the Bay…";
    if (!meta) return "—";
    if (meta.live) return `Live · ${meta.count.toLocaleString()} events${meta.cached ? " · cached" : ""}`;
    return `Curated atlas · ${meta.count.toLocaleString()} events`;
  }, [meta, loading]);

  /* ——————————————————— actions ——————————————————— */
  const toggleCategory = useCallback((id: CategoryId) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const pickQuest = useCallback(
    (quest: Quest | null) => {
      setActiveQuest(quest);
      setSelectedId(null);
      if (quest) {
        setCategories(new Set());
        fly(quest.camera.center, quest.camera.zoom, quest.camera.pitch, quest.camera.bearing);
      }
    },
    [fly],
  );

  const resetCamera = useCallback(() => {
    fly(BAY.center, BAY.zoom, BAY.pitch, BAY.bearing);
  }, [fly]);

  const selectEvent = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) return;
      const ev = events.find((e) => e.id === id);
      if (ev && viewport && viewport.zoom < 13) fly([ev.lng, ev.lat], 14.6, 60, viewport.bearing);
    },
    [events, viewport, fly],
  );

  /* ——————————————————— keyboard ——————————————————— */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "?": setHelpOpen((v) => !v); break;
        case "1": setViewMode("explore"); break;
        case "2": setViewMode("heat"); break;
        case "3": setViewMode("flat"); break;
        case "h": case "H": setShowHeat((v) => !v); break;
        case "b": case "B": setShowBuildings((v) => !v); break;
        case "t": case "T": setShowTransit((v) => !v); break;
        case "l": case "L": setListOpen((v) => !v); break;
        case "r": case "R": resetCamera(); break;
        case "Escape": setSelectedId(null); break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetCamera]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-paper">
      <MapCanvas
        events={visible}
        selectedId={selectedId}
        onSelect={selectEvent}
        viewMode={viewMode}
        showTransit={showTransit}
        showBuildings={showBuildings}
        showHeat={showHeat}
        activeQuest={activeQuest}
        camera={camera}
        onViewport={setViewport}
        onReady={() => undefined}
      />

      {/* soft vignette so the paper panels sit on something */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(130% 95% at 50% 42%, transparent 48%, rgba(122,106,82,.16) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        {/* ——— left column ——— */}
        <div className="pointer-events-auto absolute left-4 top-4 flex w-[312px] max-w-[calc(100vw-2rem)] flex-col gap-2.5">
          <Masthead onHelp={() => setHelpOpen(true)} liveLabel={liveLabel} loading={loading} />
          <div className="hidden md:block">
            <QuestPanel activeId={activeQuest?.id ?? null} onPick={pickQuest} />
          </div>
        </div>

        {/* ——— search ——— */}
        <div className="pointer-events-auto absolute left-1/2 top-4 hidden -translate-x-1/2 xl:block">
          <FilterBar
            q={q}
            onQ={setQ}
            onSubmit={runLiveSearch}
            when={when}
            onWhen={setWhen}
            freeOnly={freeOnly}
            onFreeOnly={setFreeOnly}
            active={effectiveCategories}
            onToggleCategory={toggleCategory}
            onClearCategories={() => setCategories(new Set())}
            resultCount={visible.length}
            searching={searching}
          />
        </div>

        {/* ——— right column ——— */}
        <div className="pointer-events-auto absolute right-4 top-4 bottom-[88px] hidden w-[320px] flex-col gap-2.5 lg:flex">
          {selected && (
            <EventDetail
              event={selected}
              onClose={() => setSelectedId(null)}
              onFlyTo={() => fly([selected.lng, selected.lat], 16.2, 64, viewport?.bearing ?? -18)}
              nearby={nearby}
              onSelect={selectEvent}
            />
          )}
          <div className={`flex min-h-0 flex-1 ${selected ? "max-h-[46%]" : ""}`}>
            <EventList
              events={visible}
              selectedId={selectedId}
              onSelect={selectEvent}
              open={listOpen}
              onToggle={() => setListOpen((v) => !v)}
            />
          </div>
        </div>

        {/* ——— bottom left ——— */}
        <div className="pointer-events-auto absolute bottom-4 left-4 hidden xl:block">
          <Legend
            showTransit={showTransit}
            onToggleTransit={() => setShowTransit((v) => !v)}
            active={effectiveCategories}
            onToggleCategory={toggleCategory}
            counts={counts}
          />
        </div>

        {/* ——— bottom centre ——— */}
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
          <ViewToolbar
            mode={viewMode}
            onMode={setViewMode}
            showHeat={showHeat}
            onToggleHeat={() => setShowHeat((v) => !v)}
            showBuildings={showBuildings}
            onToggleBuildings={() => setShowBuildings((v) => !v)}
            onCamera={(id) => {
              const c = CAMERAS.find((x) => x.id === id);
              if (c) fly(c.center, c.zoom, c.pitch, c.bearing);
            }}
            bearing={viewport?.bearing ?? 0}
            onResetNorth={() =>
              viewport && fly(viewport.center, viewport.zoom, viewport.pitch, 0)
            }
          />
        </div>

        {/* ——— bottom right ——— */}
        <div className="pointer-events-auto absolute bottom-9 right-4 hidden md:block">
          <MiniMap
            viewport={viewport}
            events={visible}
            onJump={(lng, lat) => fly([lng, lat], Math.max(viewport?.zoom ?? 11, 11), 56, viewport?.bearing ?? -18)}
          />
        </div>

        {/* ——— notice strip ——— */}
        {meta?.notice && !loading && (
          <div className="pointer-events-auto absolute bottom-4 left-1/2 hidden -translate-x-1/2 translate-y-[-46px] xl:block">
            <p className="panel px-3 py-1.5 font-mono text-[9px] tracking-[0.05em] text-ink-3">
              {meta.notice}
            </p>
          </div>
        )}
      </div>

      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}

      {/* quests are the only way in on small screens */}
      <div className="pointer-events-auto absolute inset-x-4 bottom-20 z-20 md:hidden">
        <div className="panel grain px-3 py-2">
          <p className="font-mono text-[9.5px] leading-relaxed tracking-[0.04em] text-ink-3">
            {QUESTS.length} quests, {visible.length.toLocaleString()} events. Open on a
            wider screen for the full field guide.
          </p>
        </div>
      </div>
    </main>
  );
}
