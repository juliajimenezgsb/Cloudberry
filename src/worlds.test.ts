import { test } from "node:test";
import assert from "node:assert/strict";
import { Game, type Difficulty, type Platform } from "./engine";
import { worldIds, type WorldId } from "./progression";
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
for (const world of worldIds)
  for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
    test(`${world}/${difficulty}: 3 procedural routes stay reachable, with no fading mandatory steps`, () => {
      for (const seed of [14, 41, 73]) {
        const g = new Game(difficulty, seeded(seed), world),
          c = g.config;
        let previous = { x: 195, y: 610 };
        for (let i = 0; i < 160; i++) {
          g.camera = -i * 180;
          g.generate();
          for (const p of g.platforms
            .filter((p) => p.route && p.y < previous.y)
            .sort((a, b) => b.y - a.y)) {
            assert.ok(!["phase", "shadow"].includes(p.type));
            const gap = previous.y - p.y;
            const discriminant = c.jump * c.jump - 2 * g.gravity * gap;
            assert.ok(discriminant > 0);
            const flight = (c.jump + Math.sqrt(discriminant)) / g.gravity;
            // Includes both platforms' maximal drifting displacement and a wind allowance.
            const dx =
              Math.abs(p.base + p.w / 2 - previous.x) +
              56 +
              (world === "sunset" ? 24 * flight : 0);
            assert.ok(
              dx < c.speed * flight,
              "horizontal path has enough flight time",
            );
            previous = { x: p.base + p.w / 2, y: p.y };
          }
          g.platforms = g.platforms.filter((p) => p.y < g.camera + 760);
          g.items = g.items.filter((p) => p.y < g.camera + 760);
        }
      }
    });
  }
const platform = (type: Platform["type"]): Platform => ({
  x: 140,
  base: 140,
  y: 400,
  w: 110,
  type,
  phase: 0,
  broken: 0,
});
test("flower and mushroom landings give distinct boosts and count progression", () => {
  for (const [world, type] of [
    ["garden", "flower"],
    ["moonlight", "mushroom"],
  ] as [WorldId, Platform["type"]][]) {
    const g = new Game("easy", () => 0.5, world);
    g.platforms = [platform(type)];
    g.x = 195;
    g.y = 379;
    g.vy = 100;
    g.step(0.025, 0);
    g.step(0.025, 0);
    assert.ok(g.vy < -g.config.jump);
    assert.equal(type === "flower" ? g.flowers : g.mushrooms, 1);
  }
});
test("sunset gust pushes sideways and surviving it increments once", () => {
  const g = new Game("easy", () => 0.5, "sunset");
  g.time = 7;
  g.y = -100;
  const x = g.x;
  g.step(0.025, 0);
  assert.ok(g.x > x);
  g.time = 9.99;
  g.step(0.025, 0);
  assert.equal(g.gusts, 1);
  g.step(0.025, 0);
  assert.equal(g.gusts, 1);
});
test("moon phases become non-solid while a stable route remains available", () => {
  const g = new Game("easy", () => 0.5, "moonlight");
  const p = platform("phase");
  p.phase = -Math.PI / 2;
  g.platforms = [p];
  g.y = 380;
  g.vy = 150;
  g.step(0.025, 0);
  assert.ok(g.platformOpacity(p) < 0.3);
  assert.equal(g.landings, 0);
});
test("portal teleports once onto its safe destination and low gravity applies", () => {
  const g = new Game("hard", () => 0.5, "starlight");
  assert.equal(g.gravity, g.config.gravity * 0.78);
  const y = g.y;
  g.items = [
    {
      x: g.x,
      y: g.y,
      type: "portal",
      taken: false,
      targetX: 200,
      targetY: y - 95,
    },
  ];
  g.step(1 / 120, 0);
  assert.equal(g.y, y - 95);
  assert.equal(g.portals, 1);
  g.step(1 / 120, 0);
  assert.equal(g.portals, 1);
});
test("collectible bonuses are awarded once and gameplay objects remain bounded", () => {
  const g = new Game("medium", () => 0.5, "moonlight");
  g.items = [{ x: g.x, y: g.y, type: "firefly", taken: false, value: 2 }];
  g.step(1 / 120, 0);
  g.step(1 / 120, 0);
  assert.equal(g.stars, 2);
  assert.equal(g.earned, 3);
  for (let i = 0; i < 2000; i++) {
    g.y = -i * 30;
    g.camera = g.y - 255;
    g.vy = -100;
    g.step(1 / 120, 0);
  }
  assert.ok(g.platforms.length < 35);
  assert.ok(g.items.length < 35);
});

for (const world of worldIds)
  for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
    test(`${world}/${difficulty}: simulated controls complete over 100 consecutive landings`, () => {
      const g = new Game(difficulty, seeded(41), world);
      let count = -1,
        target = g.platforms[1],
        portal = 0;
      for (let i = 0; i < 120 * 160 && !g.over; i++) {
        if (g.landings !== count || portal !== g.portals) {
          count = g.landings;
          portal = g.portals;
          target =
            g.platforms
              .filter(
                (p) =>
                  p.route &&
                  p.y < g.y &&
                  g.y - p.y < (g.config.jump * g.config.jump) / (2 * g.gravity),
              )
              .sort((a, b) => b.y - a.y)[0] || target;
        }
        const dx = target.x + target.w / 2 - g.x,
          direction = Math.abs(dx) < 6 ? 0 : Math.sign(dx - g.vx * 0.12);
        // Isolate physical reachability; avoidable side hazards are tested separately.
        g.items = g.items.filter((i) => i.type !== "hazard");
        g.step(1 / 120, direction);
      }
      assert.ok(g.landings > 100);
      assert.ok(g.score > 900);
      assert.equal(g.over, false);
    });
  }
test("hazards stay away from their generated main-path platform", () => {
  for (const world of worldIds) {
    const g = new Game("hard", seeded(8), world);
    for (let i = 0; i < 60; i++) {
      g.camera = -i * 300;
      g.generate();
      for (const hazard of g.items.filter((i) => i.type === "hazard")) {
        const source = g.platforms.find(
          (p) => p.route && Math.abs(p.y - (hazard.y + 35)) < 0.01,
        );
        if (source)
          assert.ok(
            Math.abs(source.base + source.w / 2 - hazard.x) >= 165 - 1e-8,
          );
      }
      g.items = [];
      g.platforms = [];
    }
  }
});
