import type { CategoryId } from "./types";

export interface QuestStop {
  name: string;
  lng: number;
  lat: number;
  note: string;
}

export interface Quest {
  id: string;
  title: string;
  /** Rendered under the title, e.g. "5 stops · 2.9 mi on foot · easy". */
  meta: string;
  difficulty: "easy" | "moderate" | "hard";
  blurb: string;
  /** Categories surfaced on the map while this quest is active. */
  focus: CategoryId[];
  color: string;
  stops: QuestStop[];
  camera: { center: [number, number]; zoom: number; pitch: number; bearing: number };
}

export const QUESTS: Quest[] = [
  {
    id: "ai-route",
    title: "The AI Route",
    meta: "5 stops · 2.9 mi on foot · easy",
    difficulty: "easy",
    blurb:
      "A walk through the blocks where most of this decade's models were trained, argued about, and demoed. Best on a weekday evening when the demo nights run.",
    focus: ["tech", "business"],
    color: "#2B5FA8",
    camera: { center: [-122.3985, 37.7845], zoom: 14.4, pitch: 62, bearing: -28 },
    stops: [
      { name: "SHACK15, Ferry Building", lng: -122.3933, lat: 37.7952, note: "Demo nights under the clock tower" },
      { name: "GitHub HQ", lng: -122.3910, lat: 37.7823, note: "South Park's quiet corner" },
      { name: "Moscone Center", lng: -122.4012, lat: 37.7840, note: "Where the keynotes land" },
      { name: "Frontier Tower", lng: -122.4060, lat: 37.7850, note: "Floor after floor of residencies" },
      { name: "The Commons SF", lng: -122.4056, lat: 37.7816, note: "Hack night, most Thursdays" },
    ],
  },
  {
    id: "nature-lover",
    title: "Nature Lover",
    meta: "7 stops · 2 days · moderate",
    difficulty: "moderate",
    blurb:
      "Out of the grid and into the green. Coast, redwoods and the headlands — a weekend's worth if you take it slowly.",
    focus: ["outdoors", "wellness"],
    color: "#6E8B3D",
    camera: { center: [-122.5100, 37.8450], zoom: 11.2, pitch: 64, bearing: 26 },
    stops: [
      { name: "Crissy Field", lng: -122.4648, lat: 37.8039, note: "Start with the bridge in view" },
      { name: "Lands End Trail", lng: -122.5107, lat: 37.7800, note: "Cypress and shipwrecks" },
      { name: "Ocean Beach", lng: -122.5107, lat: 37.7594, note: "Four miles of cold Pacific" },
      { name: "Marin Headlands", lng: -122.4990, lat: 37.8270, note: "The postcard angle" },
      { name: "Muir Woods", lng: -122.5720, lat: 37.8920, note: "Old growth, book ahead" },
      { name: "Mount Tamalpais", lng: -122.5790, lat: 37.9290, note: "Above the fog by 10am" },
      { name: "Point Reyes", lng: -122.8070, lat: 38.0700, note: "Elephant seals and wind" },
    ],
  },
  {
    id: "to-the-summit",
    title: "To the Summit",
    meta: "6 stops · 8.1 mi · 2,400 ft of climbing · hard",
    difficulty: "hard",
    blurb:
      "Every high point worth the legs, ordered by how much they hurt. Go clockwise and finish at Twin Peaks for the city at dusk.",
    focus: ["outdoors", "sports"],
    color: "#C0462A",
    camera: { center: [-122.4450, 37.7620], zoom: 12.6, pitch: 68, bearing: -40 },
    stops: [
      { name: "Bernal Heights Park", lng: -122.4158, lat: 37.7434, note: "The warm-up" },
      { name: "Corona Heights", lng: -122.4383, lat: 37.7655, note: "Red chert and full exposure" },
      { name: "Twin Peaks", lng: -122.4477, lat: 37.7544, note: "922 ft, wind included" },
      { name: "Mount Davidson", lng: -122.4541, lat: 37.7380, note: "The city's true summit" },
      { name: "Grand View Park", lng: -122.4757, lat: 37.7560, note: "The 16th Avenue tiled steps" },
      { name: "Coit Tower", lng: -122.4058, lat: 37.8024, note: "Earn the murals" },
    ],
  },
  {
    id: "landmark-tour",
    title: "Landmark Tour",
    meta: "7 stops · 1 day · moderate",
    difficulty: "moderate",
    blurb:
      "The ones you came for, routed so you never double back. Start at the water, end in the park.",
    focus: ["arts", "family", "community"],
    color: "#8A5BA8",
    camera: { center: [-122.4310, 37.7870], zoom: 12.8, pitch: 58, bearing: -14 },
    stops: [
      { name: "Ferry Building", lng: -122.3937, lat: 37.7955, note: "Coffee, then walk north" },
      { name: "Pier 39", lng: -122.4098, lat: 37.8087, note: "Sea lions, K dock" },
      { name: "Coit Tower", lng: -122.4058, lat: 37.8024, note: "WPA murals inside" },
      { name: "Palace of Fine Arts", lng: -122.4484, lat: 37.8029, note: "Best light in late afternoon" },
      { name: "Golden Gate Bridge", lng: -122.4751, lat: 37.8077, note: "Walk out to the first tower" },
      { name: "de Young Museum", lng: -122.4687, lat: 37.7715, note: "Free observation tower" },
      { name: "Japanese Tea Garden", lng: -122.4703, lat: 37.7701, note: "Close out with tea" },
    ],
  },
  {
    id: "night-shift",
    title: "The Night Shift",
    meta: "6 stops · one long night · moderate",
    difficulty: "moderate",
    blurb:
      "Doors at eight, last call at two. Sequenced so each walk between rooms is under fifteen minutes.",
    focus: ["nightlife", "music", "film"],
    color: "#6B4E9B",
    camera: { center: [-122.4120, 37.7760], zoom: 14.0, pitch: 60, bearing: 18 },
    stops: [
      { name: "The Chapel", lng: -122.4216, lat: 37.7599, note: "Early set, 8pm sharp" },
      { name: "Roxie Theater", lng: -122.4221, lat: 37.7649, note: "If the bill is right" },
      { name: "Monarch", lng: -122.4142, lat: 37.7736, note: "Upstairs first, then down" },
      { name: "1015 Folsom", lng: -122.4087, lat: 37.7782, note: "Four rooms, pick one" },
      { name: "Public Works", lng: -122.4194, lat: 37.7694, note: "The loft until close" },
      { name: "The Midway", lng: -122.3875, lat: 37.7472, note: "Only if you are serious" },
    ],
  },
  {
    id: "eat-the-bay",
    title: "Eat the Bay",
    meta: "6 stops · 1 day · easy",
    difficulty: "easy",
    blurb:
      "Across the water and back on food alone. Ferry out, BART home — no car, no parking, no regrets.",
    focus: ["food", "community"],
    color: "#C9752B",
    camera: { center: [-122.3400, 37.7950], zoom: 12.2, pitch: 56, bearing: -4 },
    stops: [
      { name: "Ferry Building Marketplace", lng: -122.3937, lat: 37.7955, note: "Saturday market, before nine" },
      { name: "Japantown Peace Plaza", lng: -122.4297, lat: 37.7853, note: "Mid-morning, quiet" },
      { name: "Alemany Farmers Market", lng: -122.4074, lat: 37.7347, note: "The people's market since 1943" },
      { name: "Jack London Square", lng: -122.2776, lat: 37.7946, note: "Ferry across, eat by the water" },
      { name: "Temescal Alley", lng: -122.2611, lat: 37.8355, note: "Walk it end to end" },
      { name: "Emeryville Public Market", lng: -122.2930, lat: 37.8389, note: "Finish with whatever's left" },
    ],
  },
];

export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));
