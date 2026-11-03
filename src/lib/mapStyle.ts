import type { StyleSpecification } from "maplibre-gl";

/** Field-guide palette — warm paper, muted ink, soft bay blue. */
export const PAPER = {
  paper: "#EFE8D8",
  paperDeep: "#E7DECA",
  water: "#9FC4DC",
  waterDeep: "#8AB4D1",
  waterLine: "#7FA9C6",
  park: "#D6DFC3",
  wood: "#C8D4B3",
  sand: "#E8DEC2",
  grass: "#DCE4CA",
  road: "#F4EFE2",
  roadCasing: "#D2C4A6",
  arterial: "#F0E6CF",
  motorway: "#E4C892",
  motorwayCasing: "#C3A26A",
  rail: "#B7AB93",
  building: "#E3D9C3",
  buildingTop: "#EDE4D0",
  ink: "#3A3127",
  inkSoft: "#6F6151",
  inkFaint: "#9A8A74",
  rust: "#C0462A",
  halo: "#FBF7EC",
} as const;

const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const SPRITE = "https://tiles.openfreemap.org/sprites/ofm_f384/ofm";
const VECTOR = "https://tiles.openfreemap.org/planet";

/**
 * Hand-rolled style over the OpenMapTiles schema. Written out rather than
 * patched from an upstream style so the palette stays coherent at every zoom.
 */
export function buildMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: "Bay Area Field Guide",
    glyphs: GLYPHS,
    sprite: SPRITE,
    light: { anchor: "viewport", color: "#FFF6E2", intensity: 0.42, position: [1.4, 200, 28] },
    sources: {
      openmaptiles: { type: "vector", url: VECTOR },
      terrain: {
        type: "raster-dem",
        tiles: ["/api/terrain/{z}/{x}/{y}.png"],
        tileSize: 256,
        encoding: "terrarium",
        maxzoom: 13,
        attribution: "Terrain © Mapzen / AWS Terrain Tiles",
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": PAPER.paper } },

      // ——— land cover ———
      {
        id: "landcover-wood",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["wood", "forest"]]],
        paint: { "fill-color": PAPER.wood, "fill-opacity": 0.75 },
      },
      {
        id: "landcover-grass",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["grass", "meadow", "scrub", "heath"]]],
        paint: { "fill-color": PAPER.grass, "fill-opacity": 0.7 },
      },
      {
        id: "landcover-sand",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["in", ["get", "class"], ["literal", ["sand", "beach"]]],
        paint: { "fill-color": PAPER.sand },
      },
      {
        id: "landuse-urban",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["in", ["get", "class"], ["literal", ["residential", "suburb", "neighbourhood"]]],
        paint: { "fill-color": PAPER.paperDeep, "fill-opacity": 0.5 },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": PAPER.park, "fill-opacity": 0.65 },
      },
      {
        id: "park-outline",
        type: "line",
        source: "openmaptiles",
        "source-layer": "park",
        minzoom: 11,
        paint: { "line-color": "#B6C49C", "line-width": 0.6, "line-opacity": 0.6 },
      },

      // ——— relief ———
      {
        id: "hillshade",
        type: "hillshade",
        source: "terrain",
        paint: {
          "hillshade-exaggeration": 0.32,
          "hillshade-shadow-color": "#8C7E63",
          "hillshade-highlight-color": "#FFFBEF",
          "hillshade-accent-color": "#AE9F82",
        },
      },

      // ——— water ———
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["!=", ["get", "brunnel"], "tunnel"],
        paint: {
          "fill-color": [
            "interpolate", ["linear"], ["zoom"],
            8, PAPER.waterDeep,
            13, PAPER.water,
          ],
        },
      },
      {
        id: "water-shore",
        type: "line",
        source: "openmaptiles",
        "source-layer": "water",
        minzoom: 10,
        paint: { "line-color": PAPER.waterLine, "line-width": 0.8, "line-opacity": 0.55 },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: {
          "line-color": PAPER.waterDeep,
          "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 16, 3],
        },
      },

      // ——— roads ———
      {
        id: "road-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 12,
        filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary", "minor", "service", "trunk"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": PAPER.roadCasing,
          "line-opacity": 0.45,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 1.2, 16, 6, 20, 24],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 12,
        filter: ["in", ["get", "class"], ["literal", ["minor", "service"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": PAPER.road,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.5, 16, 4, 20, 18],
        },
      },
      {
        id: "road-arterial",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 9,
        filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": PAPER.arterial,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 9, 0.6, 13, 2, 16, 7, 20, 26],
        },
      },
      {
        id: "road-motorway-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": PAPER.motorwayCasing,
          "line-opacity": 0.55,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 1, 12, 5, 18, 22],
        },
      },
      {
        id: "road-motorway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": PAPER.motorway,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 6, 0.5, 12, 3.4, 18, 17],
        },
      },
      {
        id: "road-path",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 13,
        filter: ["in", ["get", "class"], ["literal", ["path", "track"]]],
        paint: {
          "line-color": "#B9A989",
          "line-width": 1,
          "line-dasharray": [2, 2],
          "line-opacity": 0.7,
        },
      },
      {
        id: "rail",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 10,
        filter: ["==", ["get", "class"], "rail"],
        paint: {
          "line-color": PAPER.rail,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 16, 2],
          "line-dasharray": [3, 1.5],
          "line-opacity": 0.75,
        },
      },

      // ——— built form ———
      {
        id: "building-flat",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        maxzoom: 15,
        paint: {
          "fill-color": PAPER.building,
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.7],
          "fill-outline-color": "#D3C7AC",
        },
      },
      {
        id: "building-3d",
        type: "fill-extrusion",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14,
        filter: ["!", ["has", "hide_3d"]],
        paint: {
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-height": ["get", "render_height"],
          "fill-extrusion-opacity": 0.92,
          "fill-extrusion-vertical-gradient": true,
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "render_height"], 10],
            0, PAPER.building,
            40, "#E7DDC7",
            120, "#EFE6D2",
            260, "#F6EEDC",
          ],
        },
      },

      // ——— boundaries ———
      {
        id: "boundary-county",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", ["get", "admin_level"], 6],
        paint: {
          "line-color": "#B3A288",
          "line-width": 0.8,
          "line-dasharray": [4, 3],
          "line-opacity": 0.5,
        },
      },

      // ——— labels ———
      {
        id: "label-water",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "water_name",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Italic"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 14, 16],
          "text-letter-spacing": 0.22,
          "text-max-width": 7,
        },
        paint: {
          "text-color": "#53769080",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      {
        id: "label-road",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        minzoom: 14,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "symbol-placement": "line",
          "text-letter-spacing": 0.06,
        },
        paint: {
          "text-color": PAPER.inkFaint,
          "text-halo-color": PAPER.halo,
          "text-halo-width": 1.2,
        },
      },
      {
        id: "label-place-minor",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        minzoom: 11,
        filter: ["in", ["get", "class"], ["literal", ["suburb", "neighbourhood", "quarter", "village"]]],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 9.5, 15, 12],
          "text-letter-spacing": 0.14,
          "text-transform": "uppercase",
          "text-max-width": 8,
        },
        paint: {
          "text-color": PAPER.inkSoft,
          "text-halo-color": PAPER.halo,
          "text-halo-width": 1.4,
          "text-opacity": 0.85,
        },
      },
      {
        id: "label-place-major",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", ["get", "class"], ["literal", ["city", "town"]]],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 12, 15, 16, 19],
          "text-letter-spacing": 0.1,
          "text-max-width": 9,
        },
        paint: {
          "text-color": PAPER.ink,
          "text-halo-color": PAPER.halo,
          "text-halo-width": 1.8,
        },
      },
    ],
  } as StyleSpecification;
}
