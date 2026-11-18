import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newSave,
  creditRun,
  collectMilestones,
  migrateSave,
  type RunSummary,
} from "./progression";
import { achievements } from "./achievements";
const run: RunSummary = {
  id: "ach-one",
  world: "garden",
  score: 1000,
  stars: 30,
  rawStars: 30,
  flowers: 10,
  mushrooms: 0,
  gusts: 0,
  portals: 0,
};
test("a run automatically awards each qualifying achievement exactly once", () => {
  const result = creditRun(newSave(), run);
  assert.equal(result.newAchievements?.length, 3);
  assert.equal(result.bonus, 250);
  assert.equal(result.save.stars, 280);
  assert.equal(result.save.lifetimeStars, 280);
  assert.equal(result.save.stats.garden.stars, 30);
  const duplicate = creditRun(result.save, run);
  assert.deepEqual(duplicate.save, result.save);
  const next = creditRun(result.save, { ...run, id: "ach-two" });
  assert.equal(next.bonus, 0);
  assert.equal(next.save.stars, 310);
});
test("all twelve rewards and unlocks persist, and can never be claimed twice", () => {
  let s = newSave();
  s.unlockedWorlds = ["garden", "sunset", "moonlight", "starlight"];
  for (const a of achievements) s.stats[a.world][a.metric] = a.target;
  const result = collectMilestones(s);
  assert.equal(result.newAchievements?.length, 12);
  assert.equal(result.save.claimedAchievements.length, 12);
  const refreshed = migrateSave(JSON.parse(JSON.stringify(result.save)));
  const retry = collectMilestones(refreshed);
  assert.equal(retry.bonus, 0);
  assert.equal(retry.save.stars, result.save.stars);
});
test("achievement rewards count toward world unlocks and do not inflate collected world stars", () => {
  const s = { ...newSave(), stars: 425, lifetimeStars: 425 };
  const result = creditRun(s, { ...run, score: 5, stars: 1, rawStars: 1 });
  assert.equal(result.save.lifetimeStars, 501);
  assert.ok(result.newWorlds?.includes("sunset"));
  assert.equal(result.save.stats.garden.stars, 1);
});
test("single-run achievement tracks the maximum and does not add different run totals", () => {
  let s = creditRun(newSave(), {
    ...run,
    score: 1,
    flowers: 0,
    rawStars: 20,
    stars: 20,
  }).save;
  s = creditRun(s, {
    ...run,
    id: "another",
    score: 1,
    flowers: 0,
    rawStars: 20,
    stars: 20,
  }).save;
  assert.equal(s.stats.garden.stars, 40);
  assert.equal(s.stats.garden.maxRunStars, 20);
  assert.ok(!s.claimedAchievements.includes("garden-stars"));
});
