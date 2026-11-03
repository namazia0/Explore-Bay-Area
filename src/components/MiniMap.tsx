"use client";

import { useMemo } from "react";
import type { Viewport } from "./MapCanvas";
import type { BayEvent } from "@/lib/types";

/** Minimap frame in lng/lat — a touch wider than BAY_BOUNDS so edges breathe. */
const W_LNG = -123.15;
const E_LNG = -121.5;
const S_LAT = 36.9;
const N_LAT = 38.5;

const BOX_W = 128;
const BOX_H = 150;

function px(lng: number, lat: number): [number, number] {
  const x = ((lng - W_LNG) / (E_LNG - W_LNG)) * BOX_W;
  const y = ((N_LAT - lat) / (N_LAT - S_LAT)) * BOX_H;
  return [x, y];
}

function path(coords: [number, number][], close = true): string {
  const d = coords.map(([lng, lat], i) => {
    const [x, y] = px(lng, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return d.join(" ") + (close ? " Z" : "");
}

/** Stylised SF Bay — enough shape to orient by, drawn as a plate would be. */
const BAY: [number, number][] = [
  [-122.478, 37.810], [-122.445, 37.832], [-122.470, 37.865], [-122.49, 37.9],
  [-122.47, 37.93], [-122.42, 37.96], [-122.4, 38.0], [-122.37, 38.03],
  [-122.33, 38.08], [-122.27, 38.11], [-122.2, 38.06], [-122.15, 38.04],
  [-122.05, 38.04], [-121.95, 38.03], [-122.05, 38.015], [-122.13, 38.005],
  [-122.2, 37.995], [-122.25, 37.97], [-122.3, 37.94], [-122.33, 37.9],
  [-122.32, 37.86], [-122.3, 37.83], [-122.28, 37.8], [-122.23, 37.74],
  [-122.18, 37.70], [-122.13, 37.65], [-122.08, 37.60], [-122.03, 37.55],
  [-121.99, 37.50], [-121.95, 37.465], [-122.02, 37.44], [-122.08, 37.47],
  [-122.13, 37.51], [-122.18, 37.55], [-122.23, 37.59], [-122.28, 37.63],
  [-122.33, 37.67], [-122.37, 37.71], [-122.39, 37.75], [-122.39, 37.79],
  [-122.40, 37.806],
];

const PACIFIC: [number, number][] = [
  [-123.15, 38.5], [-123.15, 36.9], [-122.15, 36.9], [-122.20, 37.10],
  [-122.29, 37.23], [-122.34, 37.37], [-122.40, 37.44], [-122.43, 37.51],
  [-122.45, 37.59], [-122.49, 37.66], [-122.51, 37.72], [-122.51, 37.78],
  [-122.478, 37.810], [-122.53, 37.83], [-122.60, 37.86], [-122.70, 37.90],
  [-122.80, 37.95], [-122.98, 37.995], [-122.83, 38.03], [-122.96, 38.11],
  [-123.01, 38.20], [-122.98, 38.30], [-123.10, 38.45], [-123.0, 38.5],
];

export default function MiniMap({
  viewport,
  events,
  onJump,
}: {
  viewport: Viewport | null;
  events: BayEvent[];
  onJump: (lng: number, lat: number) => void;
}) {
  // Thin the point cloud — the minimap only needs to show where the weight is.
  const dots = useMemo(() => {
    const step = Math.max(1, Math.floor(events.length / 180));
    return events
      .filter((_, i) => i % step === 0)
      .map((e) => {
        const [x, y] = px(e.lng, e.lat);
        return { x, y, heat: e.heat, id: e.id };
      })
      .filter((d) => d.x > -4 && d.x < BOX_W + 4 && d.y > -4 && d.y < BOX_H + 4);
  }, [events]);

  const view = useMemo(() => {
    if (!viewport) return null;
    const [[w, s], [e, n]] = viewport.bounds;
    const [x1, y1] = px(Math.max(w, W_LNG), Math.min(n, N_LAT));
    const [x2, y2] = px(Math.min(e, E_LNG), Math.max(s, S_LAT));
    const [cx, cy] = px(viewport.center[0], viewport.center[1]);
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.max(5, Math.abs(x2 - x1)),
      h: Math.max(5, Math.abs(y2 - y1)),
      cx,
      cy,
      bearing: viewport.bearing,
    };
  }, [viewport]);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * BOX_W;
    const y = ((e.clientY - rect.top) / rect.height) * BOX_H;
    onJump(W_LNG + (x / BOX_W) * (E_LNG - W_LNG), N_LAT - (y / BOX_H) * (N_LAT - S_LAT));
  }

  return (
    <div className="panel framed grain relative p-1.5">
      <svg
        viewBox={`0 0 ${BOX_W} ${BOX_H}`}
        width={BOX_W}
        height={BOX_H}
        onClick={handleClick}
        className="block cursor-crosshair"
        role="img"
        aria-label="Bay Area overview — click to recentre"
      >
        <rect width={BOX_W} height={BOX_H} fill="#F3EEE0" />
        <path d={path(PACIFIC)} fill="#BFD6E6" opacity="0.85" />
        <path d={path(BAY)} fill="#BFD6E6" opacity="0.9" />
        <path d={path(BAY)} fill="none" stroke="#8FB4CC" strokeWidth="0.6" />
        <path d={path(PACIFIC)} fill="none" stroke="#8FB4CC" strokeWidth="0.6" />

        {dots.map((d) => (
          <circle
            key={d.id}
            cx={d.x}
            cy={d.y}
            r={0.7 + (d.heat / 100) * 1.1}
            fill="#C0462A"
            opacity={0.2 + (d.heat / 100) * 0.45}
          />
        ))}

        {view && (
          <g>
            <rect
              x={view.x}
              y={view.y}
              width={view.w}
              height={view.h}
              fill="rgba(192,70,42,0.08)"
              stroke="#C0462A"
              strokeWidth="1"
            />
            <g transform={`translate(${view.cx} ${view.cy}) rotate(${view.bearing})`}>
              <path d="M0 -5 L3 3 L0 1.4 L-3 3 Z" fill="#C0462A" stroke="#FBF8EF" strokeWidth="0.6" />
            </g>
          </g>
        )}

        <rect
          width={BOX_W}
          height={BOX_H}
          fill="none"
          stroke="#C9BCA2"
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>
      <div className="mt-1 flex items-center justify-between px-0.5">
        <span className="label !text-[8px]">The Bay</span>
        <span className="meta tabular-nums !text-[8px]">
          {viewport ? `z${viewport.zoom.toFixed(1)}` : "—"}
        </span>
      </div>
    </div>
  );
}
