import { levels, levelById, isLevelOpen, type LevelId } from "./levels";
import { awardMilestones } from "./achievements";
import { unlockWorlds } from "./worlds";
import {
  defaultEquipment,
  defaultOwned,
  findCosmetic,
  fitEquipment,
  type Equipment,
} from "./catalog";
import type { Difficulty } from "./engine";
export type WorldId = "garden" | "sunset" | "moonlight" | "starlight";
export const worldIds: WorldId[] = [
  "garden",
  "sunset",
  "moonlight",
  "starlight",
];
export type WorldStats = {
  best: number;
  stars: number;
  runs: number;
  flowers: number;
  mushrooms: number;
  gusts: number;
  portals: number;
  maxRunStars: number;
};
export type RunSummary = {
  id: string;
  world: WorldId;
  score: number;
  stars: number;
  rawStars: number;
  flowers: number;
  mushrooms: number;
  gusts: number;
  portals: number;
  levelId?: LevelId;
  completed?: boolean;
};
export type PlayerSave = {
  version: 2;
  stars: number;
  lifetimeStars: number;
  best: number;
  sound: boolean;
  music: boolean;
  completedLevels: LevelId[];
  levelBests: Partial<Record<LevelId, number>>;
  difficulty: Difficulty;
  equipment: Equipment;
  owned: string[];
  selectedWorld: WorldId;
  unlockedWorlds: WorldId[];
  stats: Record<WorldId, WorldStats>;
  claimedAchievements: string[];
  settledRuns: string[];
};
export const emptyStats = (): WorldStats => ({
  best: 0,
  stars: 0,
  runs: 0,
  flowers: 0,
  mushrooms: 0,
  gusts: 0,
  portals: 0,
  maxRunStars: 0,
});
export function newSave(): PlayerSave {
  return {
    version: 2,
    stars: 0,
    lifetimeStars: 0,
    best: 0,
    sound: false,
    music: false,
    completedLevels: [],
    levelBests: {},
    difficulty: "easy",
    equipment: { ...defaultEquipment },
    owned: [...defaultOwned],
    selectedWorld: "garden",
    unlockedWorlds: ["garden"],
    stats: {
      garden: emptyStats(),
      sunset: emptyStats(),
      moonlight: emptyStats(),
      starlight: emptyStats(),
    },
    claimedAchievements: [],
    settledRuns: [],
  };
}
const natural = (n: unknown) =>
  typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
const strings = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
export function migrateSave(raw: unknown): PlayerSave {
  const result = newSave();
  if (!raw || typeof raw !== "object") return result;
  const s = raw as Record<string, unknown>;
  result.stars = natural(s.stars);
  result.best = natural(s.best);
  result.sound = s.sound === true;
  result.music = s.music === true;
  result.completedLevels = [
    ...new Set(
      strings(s.completedLevels).filter((id): id is LevelId => !!levelById(id)),
    ),
  ];
  if (s.levelBests && typeof s.levelBests === "object")
    for (const level of levels)
      result.levelBests[level.id] = natural(
        (s.levelBests as Record<string, unknown>)[level.id],
      );
  if (["easy", "medium", "hard"].includes(String(s.difficulty)))
    result.difficulty = s.difficulty as Difficulty;
  if (s.version !== 2) {
    result.lifetimeStars = result.stars;
    result.owned = [...new Set([...defaultOwned, "blush", "sage"])];
    result.equipment.color =
      ["lavender", "blush", "sage"][natural(s.color)] || "lavender";
    result.stats.garden.stars = result.stars;
    result.stats.garden.best = result.best;
    result.unlockedWorlds = unlockWorlds(
      result.unlockedWorlds,
      result.lifetimeStars,
    );
    return result;
  }
  result.lifetimeStars = Math.max(result.stars, natural(s.lifetimeStars));
  result.owned = [
    ...new Set([
      ...defaultOwned,
      ...strings(s.owned).filter((id) => findCosmetic(id)),
    ]),
  ];
  if (s.equipment && typeof s.equipment === "object") {
    for (const slot of Object.keys(defaultEquipment) as (keyof Equipment)[]) {
      const id = (s.equipment as Equipment)[slot];
      if (result.owned.includes(id) && findCosmetic(id)?.slot === slot)
        result.equipment[slot] = id;
    }
    result.equipment = fitEquipment(
      result.equipment,
      result.equipment.accessory,
    ).equipment;
  }
  result.unlockedWorlds = [
    ...new Set<WorldId>([
      "garden",
      ...strings(s.unlockedWorlds).filter((w): w is WorldId =>
        worldIds.includes(w as WorldId),
      ),
    ]),
  ];
  if (result.unlockedWorlds.includes(s.selectedWorld as WorldId))
    result.selectedWorld = s.selectedWorld as WorldId;
  if (s.stats && typeof s.stats === "object") {
    for (const w of worldIds) {
      const stats = (s.stats as Record<string, Record<string, unknown>>)[w];
      if (stats && typeof stats === "object")
        for (const key of Object.keys(emptyStats()) as (keyof WorldStats)[])
          result.stats[w][key] = natural(stats[key]);
    }
  }
  result.unlockedWorlds = unlockWorlds(
    result.unlockedWorlds,
    result.lifetimeStars,
  );
  result.best = Math.max(
    result.best,
    ...worldIds.map((w) => result.stats[w].best),
  );
  result.claimedAchievements = [...new Set(strings(s.claimedAchievements))];
  result.settledRuns = [...new Set(strings(s.settledRuns))];
  return result;
}
export type TransactionResult = {
  save: PlayerSave;
  ok: boolean;
  message: string;
  bonus?: number;
  newAchievements?: string[];
  newWorlds?: WorldId[];
  newCosmetics?: string[];
  levelBonus?: number;
};
export function buyItem(save: PlayerSave, id: string): TransactionResult {
  const item = findCosmetic(id);
  if (!item)
    return {
      save,
      ok: false,
      message: "This little treasure could not be found.",
    };
  if (save.owned.includes(id))
    return {
      save,
      ok: false,
      message: "Already yours. You can equip it anytime.",
    };
  if (save.stars < item.price)
    return {
      save,
      ok: false,
      message: `Collect ${item.price - save.stars} more stars to unlock this treasure.`,
    };
  return {
    save: {
      ...save,
      stars: save.stars - item.price,
      owned: [...save.owned, id],
    },
    ok: true,
    message: `${item.name} is yours! Equip it when you’re ready.`,
  };
}
export function equipItem(save: PlayerSave, id: string): TransactionResult {
  if (!save.owned.includes(id) || !findCosmetic(id))
    return {
      save,
      ok: false,
      message: "Unlock this treasure before equipping it.",
    };
  const fit = fitEquipment(save.equipment, id);
  return {
    save: { ...save, equipment: fit.equipment },
    ok: true,
    message: fit.note || `${findCosmetic(id)!.name} equipped. Looking lovely!`,
  };
}
export function creditRun(
  save: PlayerSave,
  run: RunSummary,
): TransactionResult {
  if (save.settledRuns.includes(run.id))
    return {
      save,
      ok: false,
      message: "This journey is already tucked safely away.",
      bonus: 0,
      newAchievements: [],
      newWorlds: [],
    };
  if (
    !run.id ||
    !worldIds.includes(run.world) ||
    !save.unlockedWorlds.includes(run.world)
  )
    return {
      save,
      ok: false,
      message: "That world is still waiting to be unlocked.",
    };
  const level = levelById(run.levelId);
  if (
    run.levelId &&
    (!level ||
      run.world !== "garden" ||
      !isLevelOpen(run.levelId, save.completedLevels))
  )
    return {
      save,
      ok: false,
      message: "Complete the previous little journey first.",
    };
  const stars = natural(run.stars),
    old = save.stats[run.world];
  const stats: WorldStats = {
    best: Math.max(old.best, natural(run.score)),
    stars: old.stars + natural(run.rawStars),
    runs: old.runs + 1,
    flowers: old.flowers + natural(run.flowers),
    mushrooms: old.mushrooms + natural(run.mushrooms),
    gusts: old.gusts + natural(run.gusts),
    portals: old.portals + natural(run.portals),
    maxRunStars: Math.max(old.maxRunStars, natural(run.rawStars)),
  };
  const next = {
    ...save,
    stars: save.stars + stars,
    lifetimeStars: save.lifetimeStars + stars,
    best: Math.max(save.best, natural(run.score)),
    stats: { ...save.stats, [run.world]: stats },
    settledRuns: [...save.settledRuns, run.id],
  };
  let levelBonus = 0;
  const newCosmetics: string[] = [];
  if (level) {
    next.levelBests = {
      ...save.levelBests,
      [level.id]: Math.max(save.levelBests[level.id] || 0, natural(run.score)),
    };
    if (run.completed && !save.completedLevels.includes(level.id)) {
      next.completedLevels = [...save.completedLevels, level.id];
      levelBonus = level.reward;
      next.stars += levelBonus;
      next.lifetimeStars += levelBonus;
      if (level.cosmetic && !next.owned.includes(level.cosmetic)) {
        next.owned = [...next.owned, level.cosmetic];
        newCosmetics.push(level.cosmetic);
      }
    }
  }
  const awarded = awardMilestones(next);
  awarded.save.unlockedWorlds = unlockWorlds(
    awarded.save.unlockedWorlds,
    awarded.save.lifetimeStars,
  );
  return {
    ...awarded,
    ok: true,
    message: "A lovely journey, saved.",
    bonus: awarded.bonus + levelBonus,
    levelBonus,
    newCosmetics,
    newWorlds: awarded.save.unlockedWorlds.filter(
      (w) => !save.unlockedWorlds.includes(w),
    ),
  };
}
export type StorageLike = Pick<Storage, "getItem" | "setItem">;
export const SAVE_KEY = "cloudberry-save";
/** Re-read before transactions; Web Locks serialize purchases and settlements across tabs. */
export class PlayerStore {
  private state: PlayerSave;
  private listeners = new Set<() => void>();
  storageAvailable = true;
  constructor(private storage?: StorageLike) {
    this.storageAvailable = !!storage;
    this.state = this.read() || newSave();
  }
  private read() {
    if (!this.storageAvailable) return null;
    try {
      const raw = this.storage?.getItem(SAVE_KEY);
      return raw ? migrateSave(JSON.parse(raw)) : null;
    } catch {
      this.storageAvailable = false;
      return null;
    }
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  refresh = () => {
    const state = this.read();
    if (state) {
      this.state = state;
      this.listeners.forEach((l) => l());
    }
  };
  async transact(
    operation: (s: PlayerSave) => TransactionResult,
  ): Promise<TransactionResult> {
    const apply = () => {
      const current = this.read() || this.state,
        result = operation(current);
      this.state = result.save;
      try {
        this.storage?.setItem(SAVE_KEY, JSON.stringify(this.state));
      } catch {
        this.storageAvailable = false;
      }
      this.listeners.forEach((l) => l());
      return result;
    };
    if (typeof navigator !== "undefined" && navigator.locks) {
      try {
        return await navigator.locks.request("cloudberry-progress", apply);
      } catch {
        return apply();
      } // Some embedded/private contexts expose but deny Web Locks.
    }
    return apply();
  }
}

export function selectWorld(
  save: PlayerSave,
  world: WorldId,
): TransactionResult {
  if (!save.unlockedWorlds.includes(world))
    return {
      save,
      ok: false,
      message: "Keep collecting lifetime stars to visit this world.",
    };
  return {
    save: { ...save, selectedWorld: world },
    ok: true,
    message: "A lovely new destination.",
  };
}

export function collectMilestones(save: PlayerSave): TransactionResult {
  const awarded = awardMilestones(save);
  const next = {
    ...awarded.save,
    unlockedWorlds: unlockWorlds(
      awarded.save.unlockedWorlds,
      awarded.save.lifetimeStars,
    ),
  };
  return {
    ...awarded,
    save: next,
    ok: awarded.bonus > 0,
    message: awarded.bonus
      ? `A lovely +${awarded.bonus} stars for your milestones!`
      : "Your rewards are already tucked away.",
    newWorlds: next.unlockedWorlds.filter(
      (w) => !save.unlockedWorlds.includes(w),
    ),
  };
}
