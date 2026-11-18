import { test } from "node:test";
import assert from "node:assert/strict";
import { Game, type Difficulty } from "./engine";
import { levels, isLevelOpen, levelObjectivesMet } from "./levels";
import {
  newSave,
  creditRun,
  migrateSave,
  buyItem,
  PlayerStore,
} from "./progression";
for (const level of levels)
  for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
    test(`${level.name}/${difficulty}: a real sequence of controls reaches and clears the finish`, () => {
      const g = new Game(difficulty, () => 0.9, "garden", level.id);
      let target = g.platforms[1],
        landing = -1;
      for (let i = 0; i < 120 * 120 && !g.over; i++) {
        if (landing !== g.landings) {
          landing = g.landings;
          target =
            g.platforms
              .filter(
                (p) =>
                  p.route &&
                  p.y < g.y &&
                  g.y - p.y < (g.config.jump * g.config.jump) / (2 * g.gravity),
              )
              .sort((a, b) => b.y - a.y)[0] ||
            g.platforms.find((p) => p.finish) ||
            target;
        }
        if (g.visitedFinish)
          target = g.platforms.find((p) => p.finish) || target;
        const dx = target.x + target.w / 2 - g.x,
          direction = Math.abs(dx) < 5 ? 0 : Math.sign(dx - g.vx * 0.12);
        g.step(1 / 120, direction);
      }
      assert.equal(
        g.completed,
        true,
        `landings=${g.landings},stars=${g.stars},flowers=${g.flowers},gusts=${g.gusts}`,
      );
      assert.equal(g.over, true);
      assert.ok(levelObjectivesMet(level, g.objectiveProgress));
      assert.equal(g.summary("run").levelId, level.id);
      assert.equal(g.summary("run").completed, true);
    });
  }
test("chapter generation is deterministic, finite, and never contaminates Endless mode", () => {
  for (const level of levels) {
    const a = new Game("medium", () => 0.1, "garden", level.id),
      b = new Game("medium", () => 0.9, "garden", level.id);
    assert.deepEqual(a.platforms, b.platforms);
    assert.deepEqual(a.items, b.items);
    assert.equal(a.platforms.length, level.steps + 1);
    const count = a.generated;
    a.camera = -100000;
    a.generate();
    assert.equal(a.generated, count);
    assert.equal(a.platforms.filter((p) => p.finish).length, 1);
  }
  const endless = new Game("easy");
  endless.camera = -10000;
  endless.generate();
  assert.ok(endless.generated > 100);
  assert.equal(endless.finishY, null);
  assert.equal(endless.level, undefined);
});
test("the finish garden provides missed goal stars and flowers without unlimited star farming", () => {
  const g = new Game("easy", undefined, "garden", "petal-postcards");
  const p = g.platforms.find((p) => p.finish)!;
  g.items = [];
  g.platforms = [p];
  g.x = 195;
  g.y = p.y - 21;
  g.vy = 120;
  for (let i = 0; i < 120 * 12 && !g.over; i++) g.step(1 / 120, 0);
  assert.equal(g.completed, true);
  assert.equal(g.stars, levels[1].stars);
  assert.ok(g.flowers >= levels[1].flowers);
  const stars = g.stars;
  g.step(0.02, 0);
  assert.equal(g.stars, stars);
});
test("chapter completion opens the next route and gives first-clear rewards once across replays and reloads", () => {
  let s = newSave();
  for (const level of levels) {
    assert.ok(isLevelOpen(level.id, s.completedLevels));
    const run = {
      id: "clear-" + level.id,
      world: "garden" as const,
      score: 200,
      stars: 5,
      rawStars: 5,
      flowers: 0,
      mushrooms: 0,
      gusts: 0,
      portals: 0,
      levelId: level.id,
      completed: true,
    };
    const result = creditRun(s, run);
    assert.equal(result.levelBonus, level.reward);
    assert.ok(result.save.completedLevels.includes(level.id));
    s = migrateSave(JSON.parse(JSON.stringify(result.save)));
    const before = s.stars,
      retry = creditRun(s, { ...run, id: "retry-" + level.id });
    assert.equal(retry.levelBonus, 0);
    assert.equal(retry.save.stars, before + 5);
    s = retry.save;
  }
  assert.ok(s.owned.includes("daisy"));
  assert.equal(s.completedLevels.length, 5);
  const balance = s.stars;
  assert.equal(buyItem(s, "daisy").save.stars, balance);
});
test("failed chapters keep earned run stars but never unlock routes or grant first-clear rewards", () => {
  const s = newSave(),
    run = {
      id: "fall",
      world: "garden" as const,
      score: 30,
      stars: 2,
      rawStars: 2,
      flowers: 0,
      mushrooms: 0,
      gusts: 0,
      portals: 0,
      levelId: levels[0].id,
      completed: false,
    };
  const result = creditRun(s, run);
  assert.equal(result.save.stars, 2);
  assert.equal(result.levelBonus, 0);
  assert.deepEqual(result.save.completedLevels, []);
  assert.equal(isLevelOpen(levels[1].id, result.save.completedLevels), false);
  assert.equal(
    creditRun(s, { ...run, levelId: levels[3].id, completed: true }).ok,
    false,
  );
});
test("old saves retain progress, default music off, and persist new chapter/music preferences", async () => {
  const legacy = migrateSave({
    version: 2,
    stars: 300,
    lifetimeStars: 800,
    best: 77,
    sound: true,
  });
  assert.equal(legacy.stars, 300);
  assert.equal(legacy.sound, true);
  assert.equal(legacy.music, false);
  assert.deepEqual(legacy.completedLevels, []);
  const data = new Map<string, string>(),
    storage = {
      getItem: (k: string) => data.get(k) || null,
      setItem: (k: string, v: string) => {
        data.set(k, v);
      },
    };
  const store = new PlayerStore(storage);
  await store.transact((s) => ({
    save: { ...s, music: true, completedLevels: [levels[0].id] },
    ok: true,
    message: "",
  }));
  const refreshed = new PlayerStore(storage);
  assert.equal(refreshed.getSnapshot().music, true);
  assert.ok(refreshed.getSnapshot().completedLevels.includes(levels[0].id));
});
