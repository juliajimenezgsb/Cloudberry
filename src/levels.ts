import type { PlatformType } from "./engine";
export type LevelId =
  | "first-leap"
  | "petal-postcards"
  | "vanishing-footsteps"
  | "breeze-buddies"
  | "garden-in-the-sky";
export type LevelDefinition = {
  id: LevelId;
  number: number;
  name: string;
  description: string;
  steps: number;
  stars: number;
  flowers: number;
  gusts: number;
  reward: number;
  cosmetic?: string;
  seed: number;
  pattern: PlatformType[];
  path: number[];
};
export const levels: LevelDefinition[] = [
  {
    id: "first-leap",
    number: 1,
    name: "A First Little Leap",
    description: "Follow the flower stars to your first floating garden.",
    steps: 18,
    stars: 3,
    flowers: 0,
    gusts: 0,
    reward: 50,
    seed: 113,
    pattern: ["normal", "normal", "normal", "moving"],
    path: [195, 165, 135, 165, 195, 225, 255, 225],
  },
  {
    id: "petal-postcards",
    number: 2,
    name: "Petal Postcards",
    description: "Deliver a little sunshine with three flower bounces.",
    steps: 22,
    stars: 5,
    flowers: 3,
    gusts: 0,
    reward: 75,
    seed: 227,
    pattern: ["normal", "flower", "normal", "moving", "flower"],
    path: [195, 155, 115, 155, 195, 235, 275, 235],
  },
  {
    id: "vanishing-footsteps",
    number: 3,
    name: "Vanishing Footsteps",
    description: "Cross the pink clouds before they drift away.",
    steps: 25,
    stars: 6,
    flowers: 0,
    gusts: 0,
    reward: 100,
    seed: 337,
    pattern: ["normal", "fragile", "moving", "fragile", "normal"],
    path: [195, 155, 115, 155, 195, 235, 275, 235],
  },
  {
    id: "breeze-buddies",
    number: 4,
    name: "Breeze Buddies",
    description: "Let a passing breeze become part of your journey.",
    steps: 28,
    stars: 7,
    flowers: 0,
    gusts: 1,
    reward: 125,
    seed: 443,
    pattern: ["normal", "moving", "flower", "moving", "normal"],
    path: [195, 160, 125, 160, 195, 230, 265, 230],
  },
  {
    id: "garden-in-the-sky",
    number: 5,
    name: "The Garden in the Sky",
    description:
      "Weave drifting clouds and flower springs into one lovely final climb.",
    steps: 32,
    stars: 8,
    flowers: 4,
    gusts: 0,
    reward: 150,
    cosmetic: "daisy",
    seed: 557,
    pattern: [
      "flower",
      "moving",
      "normal",
      "fragile",
      "flower",
      "boost",
      "normal",
    ],
    path: [195, 150, 110, 150, 195, 240, 280, 240],
  },
];
export const levelById = (id: string | undefined) =>
  levels.find((l) => l.id === id);
export const isLevelOpen = (id: string, completed: string[]) => {
  const i = levels.findIndex((l) => l.id === id);
  return i >= 0 && (i === 0 || completed.includes(levels[i - 1].id));
};
export function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export type LevelProgress = { stars: number; flowers: number; gusts: number };
export const levelObjectivesMet = (level: LevelDefinition, p: LevelProgress) =>
  p.stars >= level.stars &&
  p.flowers >= level.flowers &&
  p.gusts >= level.gusts;
