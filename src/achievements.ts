import type { PlayerSave, WorldId, WorldStats } from "./progression";
export type Achievement = {
  id: string;
  world: WorldId;
  name: string;
  description: string;
  metric: keyof WorldStats;
  target: number;
  reward: number;
};
export const achievements: Achievement[] = [
  {
    id: "garden-height",
    world: "garden",
    name: "Head in the clouds",
    description: "Reach 1,000m in Cloud Garden.",
    metric: "best",
    target: 1000,
    reward: 100,
  },
  {
    id: "garden-stars",
    world: "garden",
    name: "A pocket of sunshine",
    description: "Collect 30 flower stars in one journey.",
    metric: "maxRunStars",
    target: 30,
    reward: 75,
  },
  {
    id: "garden-flowers",
    world: "garden",
    name: "Petal to the sky",
    description: "Bounce on 10 flower platforms across your journeys.",
    metric: "flowers",
    target: 10,
    reward: 75,
  },
  {
    id: "sunset-height",
    world: "sunset",
    name: "Golden daydream",
    description: "Reach 1,500m in Peachy Sunset.",
    metric: "best",
    target: 1500,
    reward: 150,
  },
  {
    id: "sunset-gusts",
    world: "sunset",
    name: "Befriend the breeze",
    description: "Survive 5 wind gusts across your journeys.",
    metric: "gusts",
    target: 5,
    reward: 100,
  },
  {
    id: "sunset-stars",
    world: "sunset",
    name: "Sunshine collector",
    description: "Collect 50 sunset stars across your journeys.",
    metric: "stars",
    target: 50,
    reward: 100,
  },
  {
    id: "moonlight-height",
    world: "moonlight",
    name: "A moonlit wish",
    description: "Reach 2,000m in Moonlight Meadow.",
    metric: "best",
    target: 2000,
    reward: 200,
  },
  {
    id: "moonlight-mushrooms",
    world: "moonlight",
    name: "The mushroom waltz",
    description: "Bounce on 15 mushroom platforms across your journeys.",
    metric: "mushrooms",
    target: 15,
    reward: 125,
  },
  {
    id: "moonlight-stars",
    world: "moonlight",
    name: "Keeper of moonbeams",
    description: "Collect 60 moon stars across your journeys.",
    metric: "stars",
    target: 60,
    reward: 125,
  },
  {
    id: "starlight-height",
    world: "starlight",
    name: "A little infinite",
    description: "Reach 3,000m in Starlight Dreams.",
    metric: "best",
    target: 3000,
    reward: 250,
  },
  {
    id: "starlight-portals",
    world: "starlight",
    name: "Through the looking sky",
    description: "Use 5 star portals across your journeys.",
    metric: "portals",
    target: 5,
    reward: 150,
  },
  {
    id: "starlight-stars",
    world: "starlight",
    name: "A constellation of your own",
    description: "Collect 75 crystal stars across your journeys.",
    metric: "stars",
    target: 75,
    reward: 150,
  },
];
export const achievementProgress = (save: PlayerSave, a: Achievement) =>
  Math.min(a.target, save.stats[a.world][a.metric]);
export function awardMilestones(save: PlayerSave) {
  const ready = achievements.filter(
    (a) =>
      !save.claimedAchievements.includes(a.id) &&
      achievementProgress(save, a) >= a.target,
  );
  const bonus = ready.reduce((sum, a) => sum + a.reward, 0);
  return {
    save: ready.length
      ? {
          ...save,
          stars: save.stars + bonus,
          lifetimeStars: save.lifetimeStars + bonus,
          claimedAchievements: [
            ...save.claimedAchievements,
            ...ready.map((a) => a.id),
          ],
        }
      : save,
    bonus,
    newAchievements: ready.map((a) => a.id),
  };
}
