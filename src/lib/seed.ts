import { VENUES, type Venue } from "./venues";
import { nearestNeighborhood, jitter } from "./geo";
import type { BayEvent, CategoryId } from "./types";

/** Mulberry32 — small deterministic PRNG so the curated layer is stable per day. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Template = { title: string; sub: string; summary: string; free?: boolean; lo?: number; hi?: number };

const TEMPLATES: Record<CategoryId, Template[]> = {
  music: [
    { title: "{v} Presents: Night Bloom", sub: "Indie", summary: "Four-piece out of Oakland playing the whole record front to back, plus a local opener.", lo: 22, hi: 48 },
    { title: "Fog City Soul Revue", sub: "Soul & Funk", summary: "A ten-piece revue with horns, three vocalists and a standing-room dance floor.", lo: 30, hi: 65 },
    { title: "Late Set: Bay Jazz Collective", sub: "Blues & Jazz", summary: "The 10pm set. Loose, improvised, and only announced the week it happens.", lo: 18, hi: 35 },
    { title: "Chamber Series · Strings at Dusk", sub: "Classical", summary: "Eight players, no conductor, programme announced from the stage.", lo: 35, hi: 90 },
    { title: "Sunset Sessions on the Lawn", sub: "Outdoor", summary: "Bring a blanket. Doors at five, music until the fog rolls in.", free: true },
    { title: "Headliner Tour Stop", sub: "Concert", summary: "One night only on the West Coast leg. Expect a long line at will-call.", lo: 55, hi: 140 },
  ],
  nightlife: [
    { title: "Basement: Resident Night", sub: "Clubs & Parties", summary: "House and breaks until 2am from the residents who built the room.", lo: 15, hi: 30 },
    { title: "Disco Dust", sub: "Dance", summary: "Edits, disco and a mirror ball that has seen things. 21+.", lo: 20, hi: 35 },
    { title: "Rooftop Golden Hour", sub: "Social", summary: "Open-air decks, long shadows, and the skyline doing the heavy lifting.", lo: 25, hi: 45 },
    { title: "Warehouse Takeover", sub: "Clubs & Parties", summary: "Three rooms, two stages, one very long night. Location confirmed day-of.", lo: 30, hi: 60 },
  ],
  food: [
    { title: "Saturday Farmers Market", sub: "Market", summary: "Seventy stalls of produce, bread and flowers. Get there before nine.", free: true },
    { title: "Night Market: Twelve Kitchens", sub: "Street Food", summary: "A dozen trucks and pop-ups, strung lights, and a line worth joining.", free: true },
    { title: "Natural Wine Walk-Around", sub: "Wine", summary: "Twenty producers pouring, one glass, no spit buckets in sight.", lo: 45, hi: 85 },
    { title: "Dumpling Masterclass", sub: "Class", summary: "Hands-on, two hours, you take home what you fold.", lo: 65, hi: 95 },
    { title: "Oyster Hour on the Pier", sub: "Tasting", summary: "Tomales Bay oysters shucked to order with the bay at your back.", lo: 28, hi: 55 },
    { title: "Coffee Cupping Flight", sub: "Tasting", summary: "Six single-origins side by side, led by the roaster.", lo: 18, hi: 32 },
  ],
  arts: [
    { title: "First Thursday Gallery Walk", sub: "Gallery", summary: "Doors open late across the district. Maps at every corner.", free: true },
    { title: "Opening Night: New Acquisitions", sub: "Museum", summary: "Curator remarks at seven, then the galleries stay open until ten.", lo: 25, hi: 45 },
    { title: "Printmaking Open Studio", sub: "Craft", summary: "Presses running all afternoon. Walk in, pull a print, take it home.", lo: 30, hi: 50 },
    { title: "Staged Reading: New Work", sub: "Theatre", summary: "A first look at a script still in progress, with a talkback after.", lo: 20, hi: 40 },
    { title: "Light & Sound Installation", sub: "Installation", summary: "A forty-minute walk-through. Timed entry, small groups.", lo: 22, hi: 38 },
  ],
  tech: [
    { title: "AI Builders Demo Night", sub: "AI", summary: "Eight demos, five minutes each, hard cutoff. Then everyone talks in the hallway.", free: true },
    { title: "Hack Night: Open Table", sub: "Hackathon", summary: "Bring a laptop and a half-finished idea. Pizza at eight.", free: true },
    { title: "Systems Deep Dive", sub: "Engineering", summary: "A long talk on what actually broke in production, with the graphs to prove it.", lo: 0, hi: 25 },
    { title: "Robotics Open Lab", sub: "Robotics", summary: "The lab doors open for one evening. Bring questions, touch nothing hot.", free: true },
    { title: "Founders & Research Mixer", sub: "Startup", summary: "No panel, no slides. Just a room with name tags and good coffee.", lo: 0, hi: 40 },
    { title: "Hardware Teardown Social", sub: "Hardware", summary: "Screwdrivers provided. We open things that were not meant to be opened.", free: true },
  ],
  business: [
    { title: "Operators Breakfast", sub: "Networking", summary: "Seven-thirty start, done by nine, you still make your first meeting.", lo: 0, hi: 35 },
    { title: "Design Leadership Summit", sub: "Conference", summary: "A full day of sessions plus a workshop track in the afternoon.", lo: 120, hi: 380 },
    { title: "Portfolio Review Night", sub: "Career", summary: "Fifteen-minute slots with reviewers from across the Bay.", lo: 0, hi: 25 },
    { title: "Climate Capital Forum", sub: "Finance", summary: "Funders and founders in the same room for an afternoon.", lo: 75, hi: 250 },
  ],
  sports: [
    { title: "Home Game · Evening Fixture", sub: "Game", summary: "Gates ninety minutes early. Transit strongly encouraged.", lo: 38, hi: 220 },
    { title: "Bay Trail 10K", sub: "Running", summary: "Flat, fast and mostly waterfront. Chip-timed with a 9am gun.", lo: 35, hi: 60 },
    { title: "Sunrise Bootcamp", sub: "Fitness", summary: "Forty-five minutes on the grass before the city wakes up.", lo: 0, hi: 20 },
    { title: "Pick-up Basketball Open Run", sub: "Pick-up", summary: "Winners stay on. Show up early if you want to play early.", free: true },
    { title: "Open Water Swim Meetup", sub: "Swimming", summary: "Cold, bracing, supervised. Wetsuits optional but sensible.", lo: 0, hi: 15 },
  ],
  outdoors: [
    { title: "Golden Hour Ridge Hike", sub: "Hike", summary: "Six miles with 1,200 ft of climbing, timed to end at the overlook.", free: true },
    { title: "Tidepool Walk", sub: "Nature", summary: "Low tide, two hours, led by a naturalist who knows every anemone.", lo: 0, hi: 18 },
    { title: "Stargazing on the Headlands", sub: "Astronomy", summary: "Telescopes set up after dark. Dress for twenty degrees colder than the city.", free: true },
    { title: "Wildflower Trail Survey", sub: "Volunteer", summary: "Citizen science. Count what blooms, log it, walk on.", free: true },
    { title: "Sunrise Summit Push", sub: "Hike", summary: "A 4:45am start for a summit before the light turns.", free: true },
    { title: "Coastal Cleanup Morning", sub: "Volunteer", summary: "Bags, gloves and grabbers provided. Two hours, then coffee.", free: true },
  ],
  community: [
    { title: "Neighborhood Block Party", sub: "Street Fair", summary: "Four blocks closed to cars, three stages, and far too many bouncy castles.", free: true },
    { title: "Lunar New Year Street Fest", sub: "Festival", summary: "Lion dance at noon, food stalls until the lanterns come down.", free: true },
    { title: "Repair Café", sub: "Volunteer", summary: "Bring one broken thing. Volunteers will try to fix it with you.", free: true },
    { title: "Mutual Aid Packing Night", sub: "Charity", summary: "Two hours of assembly-line packing with music on loud.", free: true },
    { title: "Civic Town Hall", sub: "Civic", summary: "Open mic for residents, two minutes each, running order posted at the door.", free: true },
  ],
  film: [
    { title: "35mm Midnight Screening", sub: "Screening", summary: "A real print, projected properly, with the organ playing people in.", lo: 15, hi: 28 },
    { title: "Shorts Night: Bay Filmmakers", sub: "Screening", summary: "Nine shorts, all local, directors present for a Q&A after.", lo: 12, hi: 25 },
    { title: "Stand-Up Showcase", sub: "Comedy", summary: "Six comics working out new material. Two-drink minimum.", lo: 20, hi: 40 },
    { title: "Documentary Premiere", sub: "Premiere", summary: "First Bay Area showing, with the director on stage afterwards.", lo: 18, hi: 35 },
  ],
  family: [
    { title: "Kids' Discovery Morning", sub: "Kids", summary: "Hands-on stations for ages 4–10. Smocks provided, chaos guaranteed.", lo: 0, hi: 22 },
    { title: "Story Time in the Garden", sub: "Kids", summary: "Picture books under the trees, half an hour, then free play.", free: true },
    { title: "Build-It Workshop", sub: "Workshop", summary: "Families build one thing together and take it home.", lo: 15, hi: 35 },
    { title: "Family Night Under the Dome", sub: "Science", summary: "Planetarium show plus late access to the exhibits.", lo: 20, hi: 45 },
  ],
  wellness: [
    { title: "Sunrise Flow", sub: "Yoga", summary: "Sixty minutes, all levels, mats available at the door.", lo: 0, hi: 25 },
    { title: "Sound Bath", sub: "Meditation", summary: "Bowls, gongs and ninety minutes flat on your back.", lo: 25, hi: 45 },
    { title: "Breathwork & Cold Plunge", sub: "Wellness", summary: "Guided breathing, then three minutes you will think about all week.", lo: 30, hi: 60 },
    { title: "Walk & Talk Therapy Group", sub: "Mental Health", summary: "A facilitated walking group. No experience needed, no pressure to speak.", free: true },
  ],
  other: [
    { title: "Open House", sub: "Misc", summary: "Doors open, come see what happens here.", free: true },
  ],
};

const IMAGE_POOL: Record<CategoryId, string[]> = {
  music: ["photo-1470225620780-dba8ba36b745", "photo-1501386761578-eac5c94b800a"],
  nightlife: ["photo-1566737236500-c8ac43014a67", "photo-1514525253161-7a46d19cd819"],
  food: ["photo-1504674900247-0877df9cc836", "photo-1414235077428-338989a2e8c0"],
  arts: ["photo-1513364776144-60967b0f800f", "photo-1545989253-02cc26577f88"],
  tech: ["photo-1518770660439-4636190af475", "photo-1517180102446-f3ece451e9d8"],
  business: ["photo-1542744173-8e7e53415bb0", "photo-1511578314322-379afb476865"],
  sports: ["photo-1461896836934-ffe607ba8211", "photo-1552674605-db6ffd4facb5"],
  outdoors: ["photo-1551632811-561732d1e306", "photo-1464822759023-fed622ff2c3b"],
  community: ["photo-1511632765486-a01980e01a18", "photo-1540575467063-178a50c2df87"],
  film: ["photo-1489599849927-2ee91cede3ba", "photo-1517604931442-7e0c8ed2963c"],
  family: ["photo-1503454537195-1dcabb73ffb9", "photo-1472162072942-cd5147eb3902"],
  wellness: ["photo-1545205597-3d9d02c29597", "photo-1506126613408-eca07ce68773"],
  other: ["photo-1492684223066-81342ee5ff30"],
};

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

function roundPrice(n: number) {
  return Math.round(n / 5) * 5;
}

/**
 * Build the curated event layer. Deterministic for a given day, so reloads are
 * stable but the board refreshes each morning.
 */
export function buildCuratedEvents(now = new Date()): BayEvent[] {
  const dayKey = now.toISOString().slice(0, 10);
  const events: BayEvent[] = [];

  VENUES.forEach((venue: Venue, vi) => {
    const seed = hash(`${venue.name}|${dayKey}`);
    const rand = rng(seed);
    const count = Math.max(1, Math.round((venue.weight / 10) * 4 * (0.6 + rand())));

    for (let i = 0; i < count; i++) {
      const cat = pick(venue.cats, rand());
      const tpl = pick(TEMPLATES[cat], rand());

      // Spread across the next 30 days, biased toward the coming week.
      const dayOffset = Math.floor(Math.pow(rand(), 1.7) * 30);
      const start = new Date(now);
      start.setDate(start.getDate() + dayOffset);
      const hour = cat === "nightlife" ? 21 + Math.floor(rand() * 2)
        : cat === "outdoors" || cat === "sports" ? 7 + Math.floor(rand() * 3)
        : cat === "food" ? 11 + Math.floor(rand() * 8)
        : 18 + Math.floor(rand() * 3);
      start.setHours(hour, rand() > 0.5 ? 30 : 0, 0, 0);
      const end = new Date(start.getTime() + (1.5 + rand() * 3) * 3600_000);

      const free = tpl.free === true || (tpl.lo === 0 && rand() > 0.5);
      const lo = free ? 0 : roundPrice(tpl.lo ?? 15);
      const hi = free ? 0 : roundPrice(Math.max(lo, tpl.hi ?? lo + 20));

      const id = `curated-${vi}-${i}-${hash(`${venue.name}${tpl.title}${i}${dayKey}`).toString(36)}`;
      const [dx, dy] = jitter(id, 110);
      const lng = venue.lng + dx;
      const lat = venue.lat + dy;

      const soonBoost = Math.max(0, 1 - dayOffset / 30);
      const heat = Math.min(100, Math.round(venue.weight * 7 + soonBoost * 22 + rand() * 18));
      const attendance = Math.round(30 + heat * (4 + rand() * 26));

      events.push({
        id,
        title: tpl.title.replace("{v}", venue.name.split(" ").slice(0, 2).join(" ")),
        summary: tpl.summary,
        category: cat,
        subcategory: tpl.sub,
        sourceCategory: tpl.sub,
        start: start.toISOString(),
        end: end.toISOString(),
        venue: venue.name,
        address: venue.address ? `${venue.address}, ${venue.city}, CA` : `${venue.city}, CA`,
        city: venue.city,
        neighborhood: nearestNeighborhood(lng, lat, venue.city),
        lng,
        lat,
        isFree: free,
        minPrice: free ? 0 : lo,
        maxPrice: free ? 0 : hi,
        currency: "USD",
        organizer: venue.name,
        heat,
        attendance,
        image: `https://images.unsplash.com/${pick(IMAGE_POOL[cat], rand())}?auto=format&fit=crop&w=800&q=70`,
        url: null,
        source: "curated",
        isOnline: false,
      });
    }
  });

  return events.sort((a, b) => a.start.localeCompare(b.start));
}
