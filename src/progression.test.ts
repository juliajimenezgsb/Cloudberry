import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newSave,
  migrateSave,
  buyItem,
  equipItem,
  creditRun,
  PlayerStore,
  SAVE_KEY,
  selectWorld,
  type RunSummary,
} from "./progression";
const run: RunSummary = {
  id: "run-one",
  world: "garden",
  score: 30,
  stars: 15,
  rawStars: 10,
  flowers: 3,
  mushrooms: 0,
  gusts: 0,
  portals: 0,
};
test("legacy progress and all previously free colors survive migration", () => {
  const s = migrateSave({
    stars: 777,
    best: 98,
    color: 2,
    sound: true,
    difficulty: "hard",
  });
  assert.equal(s.stars, 777);
  assert.equal(s.lifetimeStars, 777);
  assert.equal(s.stats.garden.best, 98);
  assert.equal(s.equipment.color, "sage");
  assert.ok(s.owned.includes("blush"));
  assert.equal(s.sound, true);
  assert.equal(s.difficulty, "hard");
});
test("purchase deducts once, leaves lifetime untouched, and requires sufficient balance", () => {
  let s = { ...newSave(), stars: 500, lifetimeStars: 1000 };
  const purchase = buyItem(s, "mochi");
  assert.equal(purchase.ok, true);
  s = purchase.save;
  assert.equal(s.stars, 100);
  assert.equal(s.lifetimeStars, 1000);
  assert.equal(buyItem(s, "mochi").save.stars, 100);
  assert.equal(buyItem(s, "pip").ok, false);
  assert.equal(equipItem(s, "pip").ok, false);
  assert.equal(equipItem(s, "mochi").save.equipment.character, "mochi");
});
test("incompatible equipment clears only the conflicting slot", () => {
  let s = newSave();
  s.owned.push("cape", "wings", "clip", "beanie");
  s = equipItem(s, "cape").save;
  s = equipItem(s, "wings").save;
  assert.equal(s.equipment.outfit, "outfit-none");
  s = equipItem(s, "clip").save;
  s = equipItem(s, "beanie").save;
  assert.equal(s.equipment.accessory, "accessory-none");
});
test("run settlement is idempotent and records separate spendable, lifetime, and world statistics", () => {
  const a = creditRun(newSave(), run);
  const b = creditRun(a.save, run);
  assert.equal(a.save.stars, 15);
  assert.equal(a.save.lifetimeStars, 15);
  assert.equal(a.save.stats.garden.stars, 10);
  assert.equal(a.save.stats.garden.flowers, 3);
  assert.deepEqual(b.save, a.save);
});
test("inventory, equipment, balance and settled runs persist after a new store instance", async () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) || null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
  const initial = { ...newSave(), stars: 700, lifetimeStars: 700 };
  data.set(SAVE_KEY, JSON.stringify(initial));
  const first = new PlayerStore(storage);
  await first.transact((s) => buyItem(s, "mochi"));
  await first.transact((s) => equipItem(s, "mochi"));
  await first.transact((s) => creditRun(s, run));
  const refreshed = new PlayerStore(storage);
  assert.equal(refreshed.getSnapshot().equipment.character, "mochi");
  assert.equal(refreshed.getSnapshot().stars, 315);
  await refreshed.transact((s) => creditRun(s, run));
  assert.equal(refreshed.getSnapshot().stars, 315);
});
test("malformed storage falls back safely", () => {
  const s = migrateSave({
    version: 2,
    stars: -12,
    equipment: { character: "unknown" },
    stats: { garden: { best: "bad" } },
    owned: ["unknown"],
  });
  assert.equal(s.stars, 0);
  assert.equal(s.equipment.character, "berri");
  assert.equal(s.stats.garden.best, 0);
});

test("world thresholds use lifetime stars, unlock automatically, and never relock after shopping", () => {
  let s = migrateSave({ stars: 499 });
  assert.deepEqual(s.unlockedWorlds, ["garden"]);
  s = creditRun(s, { ...run, stars: 1 }).save;
  assert.ok(s.unlockedWorlds.includes("sunset"));
  s = buyItem(s, "mochi").save;
  assert.equal(s.stars, 100);
  assert.ok(
    migrateSave(JSON.parse(JSON.stringify(s))).unlockedWorlds.includes(
      "sunset",
    ),
  );
  assert.equal(selectWorld(s, "moonlight").ok, false);
  s = selectWorld(s, "sunset").save;
  assert.equal(migrateSave(s).selectedWorld, "sunset");
  for (const threshold of [1500, 3000]) {
    const t = migrateSave({ stars: threshold });
    assert.ok(
      t.unlockedWorlds.includes(threshold === 1500 ? "moonlight" : "starlight"),
    );
  }
});

test("full browser storage preserves in-memory purchases without reloading stale currency", async () => {
  const initial = { ...newSave(), stars: 500, lifetimeStars: 500 };
  const storage = {
    getItem: () => JSON.stringify(initial),
    setItem: () => {
      throw new Error("quota exceeded");
    },
  };
  const store = new PlayerStore(storage);
  await store.transact((s) => buyItem(s, "mochi"));
  assert.equal(store.getSnapshot().stars, 100);
  assert.equal(store.storageAvailable, false);
  const attempt = await store.transact((s) => buyItem(s, "pip"));
  assert.equal(attempt.ok, false);
  assert.equal(store.getSnapshot().stars, 100);
});

test("denied Web Locks falls back to a consistent local transaction", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { locks: { request: () => Promise.reject(new Error("denied")) } },
  });
  try {
    const store = new PlayerStore();
    await store.transact((s) => creditRun(s, run));
    await store.transact((s) => creditRun(s, run));
    assert.equal(store.getSnapshot().stars, 15);
  } finally {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
});
