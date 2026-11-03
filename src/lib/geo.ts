/** Bay Area geography helpers: bounds, camera presets and city centroids. */

export const BAY_BOUNDS: [[number, number], [number, number]] = [
  [-123.1, 36.95],
  [-121.55, 38.45],
];

export interface CameraPreset {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  note: string;
}

export const CAMERAS: CameraPreset[] = [
  {
    id: "bay",
    label: "The whole Bay",
    center: [-122.25, 37.72],
    zoom: 9.1,
    pitch: 48,
    bearing: -12,
    note: "Nine counties, one basin",
  },
  {
    id: "downtown",
    label: "Downtown SF",
    center: [-122.4016, 37.7898],
    zoom: 14.6,
    pitch: 62,
    bearing: -24,
    note: "Towers, transit and the Embarcadero",
  },
  {
    id: "mission",
    label: "Mission & Castro",
    center: [-122.4219, 37.7599],
    zoom: 14.2,
    pitch: 58,
    bearing: 8,
    note: "Murals, taquerias, Dolores Park",
  },
  {
    id: "oakland",
    label: "Oakland & Berkeley",
    center: [-122.2712, 37.8176],
    zoom: 12.6,
    pitch: 55,
    bearing: -6,
    note: "Uptown, the lake and the hills",
  },
  {
    id: "peninsula",
    label: "Peninsula",
    center: [-122.17, 37.46],
    zoom: 11.4,
    pitch: 52,
    bearing: -18,
    note: "Stanford down to Mountain View",
  },
  {
    id: "southbay",
    label: "South Bay",
    center: [-121.89, 37.335],
    zoom: 12.2,
    pitch: 54,
    bearing: 0,
    note: "San Jose and the valley floor",
  },
  {
    id: "marin",
    label: "Marin & the coast",
    center: [-122.52, 37.87],
    zoom: 11.6,
    pitch: 60,
    bearing: 32,
    note: "Headlands, Tam and the bridge",
  },
];

export const CITY_CENTROIDS: Record<string, [number, number]> = {
  "san francisco": [-122.4194, 37.7749],
  oakland: [-122.2712, 37.8044],
  berkeley: [-122.2727, 37.8715],
  "san jose": [-121.8863, 37.3382],
  "palo alto": [-122.143, 37.4419],
  "mountain view": [-122.0839, 37.3861],
  "menlo park": [-122.1817, 37.453],
  "redwood city": [-122.2364, 37.4852],
  "san mateo": [-122.3255, 37.563],
  sunnyvale: [-122.0363, 37.3688],
  "santa clara": [-121.9552, 37.3541],
  emeryville: [-122.2853, 37.8313],
  alameda: [-122.2416, 37.7652],
  richmond: [-122.3477, 37.9358],
  sausalito: [-122.4853, 37.8591],
  "mill valley": [-122.545, 37.906],
  "san rafael": [-122.5311, 37.9735],
  "walnut creek": [-122.0652, 37.9101],
  "half moon bay": [-122.4286, 37.4636],
  napa: [-122.2869, 38.2975],
  sonoma: [-122.4564, 38.2919],
  "daly city": [-122.4702, 37.6879],
  fremont: [-121.9886, 37.5485],
  hayward: [-122.0808, 37.6688],
  "san leandro": [-122.1561, 37.7249],
  "south san francisco": [-122.4077, 37.6547],
  burlingame: [-122.3661, 37.5779],
  "san bruno": [-122.4111, 37.6305],
  "foster city": [-122.2711, 37.5585],
  cupertino: [-122.0322, 37.323],
  milpitas: [-121.8996, 37.4323],
  livermore: [-121.768, 37.6819],
  pleasanton: [-121.8747, 37.6624],
  concord: [-122.0311, 37.978],
  vallejo: [-122.2566, 38.1041],
};

/** Rough SF neighbourhood lookup — good enough to label a pin. */
const SF_HOODS: Array<{ name: string; lng: number; lat: number }> = [
  { name: "Financial District", lng: -122.4, lat: 37.7936 },
  { name: "SoMa", lng: -122.4035, lat: 37.7785 },
  { name: "Mission", lng: -122.4188, lat: 37.7599 },
  { name: "Castro", lng: -122.435, lat: 37.7609 },
  { name: "Hayes Valley", lng: -122.4256, lat: 37.7765 },
  { name: "Tenderloin", lng: -122.4135, lat: 37.7838 },
  { name: "North Beach", lng: -122.4098, lat: 37.8003 },
  { name: "Chinatown", lng: -122.4064, lat: 37.7941 },
  { name: "Marina", lng: -122.4376, lat: 37.8021 },
  { name: "Presidio", lng: -122.4662, lat: 37.7989 },
  { name: "Richmond", lng: -122.4836, lat: 37.7801 },
  { name: "Sunset", lng: -122.4869, lat: 37.7535 },
  { name: "Haight", lng: -122.4466, lat: 37.7692 },
  { name: "Noe Valley", lng: -122.4331, lat: 37.7502 },
  { name: "Bernal Heights", lng: -122.4158, lat: 37.7399 },
  { name: "Potrero Hill", lng: -122.3993, lat: 37.7576 },
  { name: "Dogpatch", lng: -122.3892, lat: 37.7576 },
  { name: "Mission Bay", lng: -122.3892, lat: 37.7706 },
  { name: "Japantown", lng: -122.4297, lat: 37.7853 },
  { name: "Nob Hill", lng: -122.4142, lat: 37.7931 },
  { name: "Embarcadero", lng: -122.3937, lat: 37.7955 },
  { name: "Bayview", lng: -122.3906, lat: 37.7299 },
  { name: "Excelsior", lng: -122.4264, lat: 37.7244 },
  { name: "Golden Gate Park", lng: -122.4769, lat: 37.7694 },
];

export function nearestNeighborhood(lng: number, lat: number, city: string): string | null {
  if (city.toLowerCase() !== "san francisco") return null;
  let best: string | null = null;
  let bestD = Infinity;
  for (const h of SF_HOODS) {
    const d = (h.lng - lng) ** 2 + (h.lat - lat) ** 2;
    if (d < bestD) {
      bestD = d;
      best = h.name;
    }
  }
  return best;
}

export function cityCentroid(city?: string | null): [number, number] | null {
  if (!city) return null;
  return CITY_CENTROIDS[city.toLowerCase().trim()] ?? null;
}

export function inBayArea(lng: number, lat: number): boolean {
  const [[w, s], [e, n]] = BAY_BOUNDS;
  return lng >= w && lng <= e && lat >= s && lat <= n;
}

/** Deterministic jitter so co-located events don't stack into one pixel. */
export function jitter(seed: string, meters = 90): [number, number] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const a = ((h >>> 0) % 10000) / 10000;
  const b = ((Math.imul(h, 48271) >>> 0) % 10000) / 10000;
  const angle = a * Math.PI * 2;
  const dist = Math.sqrt(b) * meters;
  return [(dist * Math.cos(angle)) / 88000, (dist * Math.sin(angle)) / 111000];
}
