import type { WorldId } from "./progression";
export type WorldDefinition = {
  id: WorldId;
  name: string;
  tagline: string;
  requirement: number;
  sky: [string, string];
  ink: string;
  platform: string;
  moving: string;
  fragile: string;
  boost: string;
  star: string;
  mechanics: string[];
  guide: string;
  collectible: string;
  hazard: string;
};
export const worlds: WorldDefinition[] = [
  {
    id: "garden",
    name: "Cloud Garden",
    tagline: "Where little daydreams take root.",
    requirement: 0,
    sky: ["#dceef3", "#eae1f0"],
    ink: "#7b708b",
    platform: "#a8c29e",
    moving: "#b7cddd",
    fragile: "#d9bbd0",
    boost: "#e4bd87",
    star: "#e1b455",
    mechanics: ["Flower bounces", "Drifting clouds", "Falling petals"],
    guide:
      "Flower platforms give a gentle 15% lift. Blue clouds drift, and pink clouds fade after landing. Watch for wandering butterflies at the edges.",
    collectible: "Golden flower stars",
    hazard: "butterfly",
  },
  {
    id: "sunset",
    name: "Peachy Sunset",
    tagline: "A golden hour that never has to end.",
    requirement: 500,
    sky: ["#f7d3b5", "#eeb9c8"],
    ink: "#8a6274",
    platform: "#c69c99",
    moving: "#e5b6aa",
    fragile: "#edd0cb",
    boost: "#efd28e",
    star: "#ffecaa",
    mechanics: ["Gentle wind gusts", "Drifting platforms", "Seaside skies"],
    guide:
      "Watch the breeze ribbon: gusts last 3 seconds and nudge you sideways. Golden platforms give a warm boost. Seagulls stay near the edges.",
    collectible: "Sunset stars",
    hazard: "bird",
  },
  {
    id: "moonlight",
    name: "Moonlight Meadow",
    tagline: "Follow the fireflies, softly home.",
    requirement: 1500,
    sky: ["#484964", "#8e82a8"],
    ink: "#eee4ff",
    platform: "#b7b2ce",
    moving: "#aaa5d1",
    fragile: "#bca5d1",
    boost: "#c5b9e4",
    star: "#f5e9c5",
    mechanics: ["Mushroom springs", "Fading moonsteps", "Firefly bonuses"],
    guide:
      "Mushrooms give extra bounce. Moonsteps pulse in and out, and shadow steps reveal themselves nearby. A steady garden path is always available. Fireflies are worth 2 stars.",
    collectible: "Moon stars",
    hazard: "moth",
  },
  {
    id: "starlight",
    name: "Starlight Dreams",
    tagline: "A pocketful of the infinite.",
    requirement: 3000,
    sky: ["#7974a5", "#c1b0d7"],
    ink: "#f8efff",
    platform: "#cabde0",
    moving: "#a9b5de",
    fragile: "#d5b9dd",
    boost: "#e5d7ae",
    star: "#e9f5ff",
    mechanics: ["Low gravity", "Star portals", "Orbiting platforms"],
    guide:
      "Gravity is 22% lighter. Touch a portal to rise 95px; a safe landing awaits above it. Tilted orbit platforms have flat, forgiving tops. Crystal clusters above 500m are worth 3 stars.",
    collectible: "Crystal stars",
    hazard: "comet",
  },
];
export const worldById = (id: WorldId) => worlds.find((w) => w.id === id)!;
export const unlockWorlds = (ids: WorldId[], lifetime: number): WorldId[] =>
  worlds
    .filter((w) => ids.includes(w.id) || lifetime >= w.requirement)
    .map((w) => w.id);
