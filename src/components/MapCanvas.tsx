"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from "maplibre-gl";
import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { Feature, FeatureCollection, Point } from "geojson";
import { buildMapStyle, PAPER } from "@/lib/mapStyle";
import { CATEGORIES } from "@/lib/categories";
import { buildMarkerSprites } from "@/lib/sprites";
import { TRANSIT_GEOJSON, TRANSIT_KINDS } from "@/lib/transit";
import { pinLabel } from "@/lib/format";
import type { BayEvent, ViewMode } from "@/lib/types";
import type { Quest } from "@/lib/quests";

export interface Viewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  bounds: [[number, number], [number, number]];
}

export interface CameraTarget {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  /** Bumped by the caller to re-trigger an identical move. */
  nonce: number;
}

interface Props {
  events: BayEvent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewMode: ViewMode;
  showTransit: boolean;
  showBuildings: boolean;
  showHeat: boolean;
  activeQuest: Quest | null;
  camera: CameraTarget | null;
  onViewport: (v: Viewport) => void;
  onReady: () => void;
}

/** match-expression mapping each category id to its ink colour. */
const CATEGORY_COLOR = [
  "match",
  ["get", "category"],
  ...CATEGORIES.flatMap((c) => [c.id, c.color]),
  PAPER.inkSoft,
] as unknown as ExpressionSpecification;

setWorkerUrl("/maplibre-gl-worker.mjs");

const EVENTS_SRC = "events";
const QUEST_SRC = "quest";
const TRANSIT_SRC = "transit";

function toCollection(events: BayEvent[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: events.map(
      (ev): Feature<Point> => ({
        type: "Feature",
        id: ev.id,
        geometry: { type: "Point", coordinates: [ev.lng, ev.lat] },
        properties: {
          id: ev.id,
          category: ev.category,
          heat: ev.heat,
          label: pinLabel(ev),
          title: ev.title,
        },
      }),
    ),
  };
}

const EMPTY: FeatureCollection<Point> = { type: "FeatureCollection", features: [] };

export default function MapCanvas({
  events,
  selectedId,
  onSelect,
  viewMode,
  showTransit,
  showBuildings,
  showHeat,
  activeQuest,
  camera,
  onViewport,
  onReady,
}: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const hoveredRef = useRef<string | null>(null);
  const questMarkers = useRef<Marker[]>([]);

  // Keep the latest callbacks reachable from listeners bound once at init.
  // Written in an effect rather than during render; declared before the init
  // effect so both refs are current by the time the map binds its listeners.
  const onSelectRef = useRef(onSelect);
  const onViewportRef = useRef(onViewport);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewportRef.current = onViewport;
  });

  const emitViewport = useCallback((map: MapLibreMap) => {
    const b = map.getBounds();
    const c = map.getCenter();
    onViewportRef.current({
      center: [c.lng, c.lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      bounds: [
        [b.getWest(), b.getSouth()],
        [b.getEast(), b.getNorth()],
      ],
    });
  }, []);

  /* ——————————————————— init ——————————————————— */
  useEffect(() => {
    if (!holder.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: holder.current,
      style: buildMapStyle(),
      center: [-122.4194, 37.7749],
      zoom: 11.2,
      pitch: 58,
      bearing: -18,
      maxPitch: 75,
      minZoom: 8,
      maxZoom: 18.5,
      canvasContextAttributes: { antialias: true },
      attributionControl: { compact: true },
      dragRotate: true,
    });
    mapRef.current = map;

    map.on("load", () => {
      /* sprites */
      for (const s of buildMarkerSprites()) {
        if (!map.hasImage(s.id)) {
          map.addImage(s.id, { width: s.width, height: s.height, data: s.data }, { pixelRatio: s.pixelRatio });
        }
      }

      /* terrain + atmosphere */
      map.setTerrain({ source: "terrain", exaggeration: 1.3 });
      map.setSky({
        "sky-color": "#BFD9EA",
        "horizon-color": "#F3E6CC",
        "fog-color": "#EFE8D8",
        "fog-ground-blend": 0.58,
        "horizon-fog-blend": 0.42,
        "sky-horizon-blend": 0.72,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 8, 0.7, 13, 0.25, 16, 0],
      });

      /* ——— transit ——— */
      map.addSource(TRANSIT_SRC, { type: "geojson", data: TRANSIT_GEOJSON });
      for (const kind of TRANSIT_KINDS) {
        map.addLayer({
          id: `transit-${kind.id}-glow`,
          type: "line",
          source: TRANSIT_SRC,
          filter: ["==", ["get", "kind"], kind.id],
          layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
          paint: {
            "line-color": PAPER.halo,
            "line-width": kind.width * 2.6,
            "line-opacity": 0.5,
            "line-blur": 1,
          },
        });
        map.addLayer({
          id: `transit-${kind.id}`,
          type: "line",
          source: TRANSIT_SRC,
          filter: ["==", ["get", "kind"], kind.id],
          layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
          paint: {
            "line-color": kind.color,
            "line-opacity": 0.82,
            "line-width": ["interpolate", ["linear"], ["zoom"], 9, kind.width * 0.7, 14, kind.width * 1.7],
            ...(kind.dash ? { "line-dasharray": kind.dash } : {}),
          },
        });
      }

      /* ——— quest route ——— */
      map.addSource(QUEST_SRC, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "quest-shadow",
        type: "line",
        source: QUEST_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": PAPER.halo, "line-width": 9, "line-opacity": 0.75, "line-blur": 2 },
      });
      map.addLayer({
        id: "quest-line",
        type: "line",
        source: QUEST_SRC,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["coalesce", ["get", "color"], PAPER.rust],
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.8, 15, 3.4],
          "line-dasharray": [1.6, 1.4],
        },
      });

      /* ——— events ——— */
      map.addSource(EVENTS_SRC, { type: "geojson", data: EMPTY });

      map.addLayer({
        id: "events-heat",
        type: "heatmap",
        source: EVENTS_SRC,
        maxzoom: 17.5,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "heat"], 0, 0.06, 50, 0.45, 100, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 0.7, 12, 1.3, 16, 2.6],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(239,232,216,0)",
            0.12, "rgba(226,206,160,0.40)",
            0.3, "rgba(231,178,96,0.58)",
            0.48, "rgba(221,134,62,0.68)",
            0.66, "rgba(205,84,45,0.76)",
            0.84, "rgba(177,46,36,0.84)",
            1, "rgba(129,24,32,0.9)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 12, 11, 22, 14, 36, 17, 62],
          "heatmap-opacity": 0.75,
        },
      });

      map.addLayer({
        id: "events-glow",
        type: "circle",
        source: EVENTS_SRC,
        minzoom: 11,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 3, 14, 9, 17, 16],
          "circle-color": CATEGORY_COLOR,
          "circle-opacity": 0.14,
          "circle-blur": 0.9,
        },
      });

      map.addLayer({
        id: "events-dot",
        type: "circle",
        source: EVENTS_SRC,
        maxzoom: 12.2,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "heat"], 0, 1.6, 100, 4.2],
          "circle-color": CATEGORY_COLOR,
          "circle-opacity": 0.85,
          "circle-stroke-color": PAPER.halo,
          "circle-stroke-width": 0.8,
        },
      });

      map.addLayer({
        id: "events-pins",
        type: "symbol",
        source: EVENTS_SRC,
        minzoom: 12.2,
        layout: {
          "icon-image": ["concat", "pin-", ["to-string", ["get", "category"]]],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 12.2, 0.62, 15, 0.86, 18, 1],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "icon-ignore-placement": false,
          "icon-pitch-alignment": "viewport",
          "icon-rotation-alignment": "viewport",
          "symbol-sort-key": ["-", 100, ["get", "heat"]],
          "text-field": ["step", ["zoom"], "", 13.6, ["get", "label"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10.5,
          "text-anchor": "left",
          "text-offset": [1.1, -1.0],
          "text-optional": true,
          "text-allow-overlap": false,
          "text-padding": 4,
          "text-max-width": 13,
          "text-pitch-alignment": "viewport",
          "text-rotation-alignment": "viewport",
        },
        paint: {
          "text-color": PAPER.ink,
          "text-halo-color": PAPER.halo,
          "text-halo-width": 1.9,
          "text-halo-blur": 0.3,
        },
      });

      map.addLayer({
        id: "events-selected",
        type: "symbol",
        source: EVENTS_SRC,
        filter: ["==", ["get", "id"], "__none__"],
        layout: {
          "icon-image": ["concat", "pin-", ["to-string", ["get", "category"]], "-active"],
          "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.9, 15, 1.15, 18, 1.3],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-pitch-alignment": "viewport",
          "icon-rotation-alignment": "viewport",
          "text-field": ["get", "label"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 11.5,
          "text-anchor": "left",
          "text-offset": [1.2, -1.2],
          "text-allow-overlap": true,
          "text-pitch-alignment": "viewport",
          "text-rotation-alignment": "viewport",
        },
        paint: {
          "text-color": PAPER.ink,
          "text-halo-color": PAPER.halo,
          "text-halo-width": 2.2,
        },
      });

      /* ——— interaction ——— */
      const hit = (e: MapMouseEvent): MapGeoJSONFeature | undefined =>
        map.queryRenderedFeatures(e.point, { layers: ["events-pins", "events-dot"] })[0];

      map.on("mousemove", (e) => {
        const f = hit(e);
        const id = (f?.properties?.id as string) ?? null;
        if (id !== hoveredRef.current) {
          hoveredRef.current = id;
          map.getCanvas().style.cursor = id ? "pointer" : "";
        }
      });

      map.on("click", (e) => {
        const f = hit(e);
        onSelectRef.current((f?.properties?.id as string) ?? null);
      });

      map.on("moveend", () => emitViewport(map));
      emitViewport(map);

      readyRef.current = true;
      setReady(true);
      onReady();
    });

    return () => {
      questMarkers.current.forEach((m) => m.remove());
      questMarkers.current = [];
      readyRef.current = false;
      setReady(false);
      map.remove();
      mapRef.current = null;
    };
    // Init once; everything else is driven by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ——————————————————— data ——————————————————— */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource(EVENTS_SRC) as GeoJSONSource | undefined;
    src?.setData(toCollection(events));
  }, [events, ready]);

  /* ——————————————————— selection ——————————————————— */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("events-selected")) return;
    map.setFilter("events-selected", ["==", ["get", "id"], selectedId ?? "__none__"]);
  }, [selectedId, events, ready]);

  /* ——————————————————— view mode + layer toggles ——————————————————— */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const flat = viewMode !== "explore";
    const heatLead = viewMode === "heat";

    if (map.getLayer("building-3d")) {
      map.setLayoutProperty("building-3d", "visibility", showBuildings && !flat ? "visible" : "none");
    }
    if (map.getLayer("building-flat")) {
      map.setLayoutProperty("building-flat", "visibility", showBuildings ? "visible" : "none");
      map.setPaintProperty("building-flat", "fill-opacity", flat && showBuildings ? 0.55 : [
        "interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.7,
      ] as never);
      map.setLayerZoomRange("building-flat", 13, flat ? 22 : 15);
    }
    if (map.getLayer("hillshade")) {
      map.setPaintProperty("hillshade", "hillshade-exaggeration", heatLead ? 0.14 : 0.32);
    }

    map.setTerrain(flat ? null : { source: "terrain", exaggeration: 1.3 });

    if (map.getLayer("events-heat")) {
      map.setLayoutProperty("events-heat", "visibility", showHeat ? "visible" : "none");
      map.setPaintProperty("events-heat", "heatmap-opacity", heatLead ? 0.92 : 0.32);
      map.setPaintProperty(
        "events-heat",
        "heatmap-radius",
        (heatLead
          ? ["interpolate", ["linear"], ["zoom"], 8, 16, 11, 30, 14, 48, 17, 78]
          : ["interpolate", ["linear"], ["zoom"], 8, 12, 11, 22, 14, 36, 17, 62]) as never,
      );
    }
    if (map.getLayer("events-pins")) {
      map.setPaintProperty("events-pins", "icon-opacity", heatLead ? 0.72 : 1);
    }

    const target = flat ? 0 : Math.max(map.getPitch(), 52);
    map.easeTo({ pitch: target, duration: 700 });
  }, [viewMode, showBuildings, showHeat, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const kind of TRANSIT_KINDS) {
      for (const suffix of ["", "-glow"]) {
        const id = `transit-${kind.id}${suffix}`;
        if (map.getLayer(id)) {
          map.setLayoutProperty(id, "visibility", showTransit ? "visible" : "none");
        }
      }
    }
  }, [showTransit, ready]);

  /* ——————————————————— quest route ——————————————————— */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    questMarkers.current.forEach((m) => m.remove());
    questMarkers.current = [];

    const src = map.getSource(QUEST_SRC) as GeoJSONSource | undefined;
    if (!activeQuest) {
      src?.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    src?.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { color: activeQuest.color },
          geometry: {
            type: "LineString",
            coordinates: activeQuest.stops.map((s) => [s.lng, s.lat]),
          },
        },
      ],
    });

    activeQuest.stops.forEach((stop, i) => {
      const el = document.createElement("div");
      el.className = "quest-stop";
      el.style.cssText = `
        width:24px;height:24px;border-radius:50%;
        display:grid;place-items:center;
        background:${activeQuest.color};color:#FBF8EF;
        font-family:var(--font-mono);font-size:11px;font-weight:600;
        border:1.5px solid #FBF8EF;
        box-shadow:0 2px 8px -2px rgba(42,36,28,.55);
        cursor:default;`;
      el.textContent = String(i + 1);
      el.title = `${stop.name} — ${stop.note}`;
      const marker = new Marker({ element: el, anchor: "center" })
        .setLngLat([stop.lng, stop.lat])
        .setPopup(
          new Popup({ offset: 16, closeButton: false, className: "quest-popup" }).setHTML(
            `<div style="font-family:var(--font-serif);padding:2px 4px">
               <div style="font-family:var(--font-display);font-weight:700;font-size:13px">${stop.name}</div>
               <div style="font-family:var(--font-mono);font-size:10px;color:#8b7e6b;margin-top:2px">${stop.note}</div>
             </div>`,
          ),
        )
        .addTo(map);
      questMarkers.current.push(marker);
    });
  }, [activeQuest, ready]);

  /* ——————————————————— camera ——————————————————— */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !camera) return;
    map.flyTo({
      center: camera.center,
      zoom: camera.zoom,
      pitch: viewMode === "explore" ? camera.pitch : 0,
      bearing: viewMode === "explore" ? camera.bearing : 0,
      duration: 2000,
      curve: 1.5,
      essential: true,
    });
    // viewMode intentionally read, not tracked — a mode switch has its own effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return (
    <div className="absolute inset-0">
      <div ref={holder} className="h-full w-full" aria-label="Map of Bay Area events" />
    </div>
  );
}
