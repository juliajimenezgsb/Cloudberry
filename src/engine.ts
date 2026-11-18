import {
  levelById,
  levelObjectivesMet,
  seededRandom,
  type LevelId,
} from "./levels";
import type { WorldId, RunSummary } from "./progression";
export type Difficulty = "easy" | "medium" | "hard";
export const modes = {
  easy: {
    name: "Cloud Drift",
    width: 100,
    gap: 67,
    speed: 245,
    jump: 460,
    gravity: 1000,
    moving: 0.08,
    fragile: 0.03,
    mult: 1,
  },
  medium: {
    name: "Breezy Adventure",
    width: 79,
    gap: 77,
    speed: 270,
    jump: 480,
    gravity: 1100,
    moving: 0.24,
    fragile: 0.18,
    mult: 1.5,
  },
  hard: {
    name: "Star Chaser",
    width: 61,
    gap: 87,
    speed: 300,
    jump: 500,
    gravity: 1200,
    moving: 0.38,
    fragile: 0.25,
    mult: 2,
  },
};
export type PlatformType =
  | "normal"
  | "moving"
  | "fragile"
  | "boost"
  | "flower"
  | "mushroom"
  | "phase"
  | "shadow"
  | "orbit";
export type Platform = {
  x: number;
  y: number;
  w: number;
  base: number;
  type: PlatformType;
  phase: number;
  broken: number;
  route?: boolean;
  finish?: boolean;
};
export type Item = {
  x: number;
  y: number;
  type: "star" | "feather" | "hazard" | "firefly" | "portal";
  taken: boolean;
  value?: number;
  targetX?: number;
  targetY?: number;
};
export class Game {
  x = 195;
  y = 570;
  vx = 0;
  vy = -460;
  camera = 0;
  height = 0;
  stars = 0;
  time = 0;
  feather = 0;
  over = false;
  squash = 0;
  platforms: Platform[] = [];
  items: Item[] = [];
  particles: { x: number; y: number; t: number }[] = [];
  top = 640;
  lastX = 195;
  landings = 0;
  flowers = 0;
  mushrooms = 0;
  gusts = 0;
  portals = 0;
  generated = 0;
  private activeGust = false;
  completed = false;
  finishY: number | null = null;
  visitedFinish = false;
  constructor(
    public difficulty: Difficulty,
    public random = Math.random,
    public world: WorldId = "garden",
    public levelId?: LevelId,
  ) {
    if (levelId) {
      const level = levelById(levelId);
      if (!level) throw new Error("Unknown journey level");
      this.world = "garden";
      this.random = seededRandom(level.seed);
    }
    this.vy = -this.config.jump;
    this.platforms.push({
      x: 125,
      base: 125,
      y: 610,
      w: 140,
      type: "normal",
      phase: 0,
      broken: 0,
      route: true,
    });
    this.top = 610;
    this.generate();
  }
  get level() {
    return levelById(this.levelId);
  }
  get config() {
    return modes[this.difficulty];
  }
  get gravity() {
    return this.config.gravity * (this.world === "starlight" ? 0.78 : 1);
  }
  get movingSpeed() {
    return { easy: 0.65, medium: 0.95, hard: 1.3 }[this.difficulty];
  }
  get wind() {
    if (this.level?.gusts)
      return this.time % 10 >= 4 && this.time % 10 < 7
        ? Math.floor(this.time / 10) % 2 === 0
          ? 18
          : -18
        : 0;
    return this.world === "sunset" && this.time % 14 >= 7 && this.time % 14 < 10
      ? Math.floor(this.time / 14) % 2 === 0
        ? 24
        : -24
      : 0;
  }
  platformOpacity(p: Platform) {
    if (p.broken) return Math.max(0, 1 - p.broken * 2);
    if (p.type === "phase")
      return 0.08 + (0.92 * (Math.sin(this.time * 0.85 + p.phase) + 1)) / 2;
    if (p.type === "shadow")
      return 0.08 + 0.92 * Math.max(0, 1 - Math.abs(p.y - this.y) / 150);
    return 1;
  }
  generate() {
    if (this.level) {
      this.generateLevel();
      return;
    }
    const c = this.config;
    while (this.top > this.camera - 160) {
      this.generated++;
      this.top -= c.gap + this.random() * 12;
      const step = this.world === "sunset" ? 130 : 170,
        center = Math.max(
          65,
          Math.min(325, this.lastX + (this.random() - 0.5) * step),
        );
      this.lastX = center;
      const r = this.random();
      let type: PlatformType =
        r < 0.07
          ? "boost"
          : r < 0.07 + c.fragile
            ? "fragile"
            : r < 0.07 + c.fragile + c.moving
              ? "moving"
              : "normal";
      if (this.world === "garden" && this.generated % 4 === 0) type = "flower";
      if (this.world === "moonlight" && this.generated % 4 === 0)
        type = "mushroom";
      if (this.world === "starlight" && type === "moving") type = "orbit";
      this.platforms.push({
        x: center - c.width / 2,
        base: center - c.width / 2,
        y: this.top,
        w: c.width,
        type,
        phase: this.random() * 6.28,
        broken: 0,
        route: true,
      });
      if (this.random() < 0.62) {
        const value = this.world === "starlight" && this.top < -5000 ? 3 : 1;
        this.items.push({
          x: center,
          y: this.top - 30,
          type: this.random() < 0.055 ? "feather" : "star",
          taken: false,
          value,
        });
      }
      // Moonsteps and shadow steps are optional shortcuts; the primary path stays solid.
      if (this.world === "moonlight" && this.generated % 3 === 0) {
        const side = center < 195 ? 320 : 70;
        this.platforms.push({
          x: side - 35,
          base: side - 35,
          y: this.top - 28,
          w: 70,
          type: this.generated % 2 ? "phase" : "shadow",
          phase: this.random() * 6.28,
          broken: 0,
          route: false,
        });
        this.items.push({
          x: side,
          y: this.top - 53,
          type: "firefly",
          taken: false,
          value: 2,
        });
      }
      if (this.world === "starlight" && this.generated % 8 === 0) {
        const targetY = this.top - 100;
        this.platforms.push({
          x: center - 55,
          base: center - 55,
          y: targetY,
          w: 110,
          type: "normal",
          phase: 0,
          broken: 0,
          route: false,
        });
        this.items.push({
          x: center,
          y: this.top - 23,
          type: "portal",
          taken: false,
          targetX: center,
          targetY: targetY - 18,
        });
      }
      const hazardChance = { easy: 0.025, medium: 0.09, hard: 0.2 }[
        this.difficulty
      ];
      if (this.top < 0 && this.random() < hazardChance)
        this.items.push({
          x: center < 195 ? 360 : 30,
          y: this.top - 35,
          type: "hazard",
          taken: false,
        });
    }
  }
  private generateLevel() {
    if (this.generated > 0) return;
    const level = this.level!,
      c = this.config;
    for (let i = 0; i < level.steps; i++) {
      this.generated++;
      this.top -= c.gap + 6;
      const finish = i === level.steps - 1;
      const center = finish ? 195 : level.path[i % level.path.length];
      const type = finish ? "flower" : level.pattern[i % level.pattern.length];
      const width = finish ? 220 : c.width;
      this.platforms.push({
        x: center - width / 2,
        base: center - width / 2,
        y: this.top,
        w: width,
        type,
        phase: i * 0.7,
        broken: 0,
        route: true,
        finish,
      });
      if (!finish)
        this.items.push({
          x: center,
          y: this.top - 30,
          type: "star",
          taken: false,
        });
      else this.finishY = this.top;
    }
  }
  get objectiveProgress() {
    return { stars: this.stars, flowers: this.flowers, gusts: this.gusts };
  }
  private checkLevelFinish() {
    const level = this.level;
    if (!level || this.finishY === null) return;
    if (
      this.visitedFinish &&
      this.stars < level.stars &&
      !this.items.some(
        (i) => i.type === "star" && !i.taken && i.y < this.finishY!,
      )
    ) {
      this.items.push({
        x: 195,
        y: this.finishY - 38,
        type: "star",
        taken: false,
      });
    }
    if (
      this.visitedFinish &&
      this.y < this.finishY + 15 &&
      this.y > this.finishY - 220 &&
      levelObjectivesMet(level, this.objectiveProgress)
    ) {
      this.completed = true;
      this.over = true;
      this.vx = 0;
    }
  }
  step(
    dt: number,
    direction: number,
    onSound: (kind: string) => void = () => {},
  ) {
    if (this.over) return;
    dt = Math.min(dt, 0.025);
    const c = this.config;
    this.time += dt;
    if (this.wind !== 0) this.activeGust = true;
    else if (this.activeGust) {
      this.activeGust = false;
      this.gusts++;
    }
    this.feather = Math.max(0, this.feather - dt);
    this.squash = Math.max(0, this.squash - dt * 5);
    this.vx += (direction * c.speed - this.vx) * Math.min(1, dt * 12);
    this.x += (this.vx + this.wind) * dt;
    if (this.x < -15) this.x = 405;
    if (this.x > 405) this.x = -15;
    const old = this.y;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    for (const p of this.platforms) {
      if (p.type === "moving" || p.type === "orbit")
        p.x = p.base + Math.sin(this.time * this.movingSpeed + p.phase) * 28;
      if (p.broken > 0) {
        p.broken += dt;
        continue;
      }
      if (p.type === "phase" && this.platformOpacity(p) < 0.3) continue;
      if (
        this.vy > 0 &&
        old + 18 <= p.y &&
        this.y + 18 >= p.y &&
        this.x + 13 > p.x &&
        this.x - 13 < p.x + p.w
      ) {
        this.y = p.y - 18;
        const boost =
          p.type === "boost"
            ? 1.5
            : p.type === "flower"
              ? 1.15
              : p.type === "mushroom"
                ? 1.22
                : 1;
        this.vy = -c.jump * boost * (this.feather > 0 ? 1.25 : 1);
        if (p.type === "fragile") p.broken = 0.01;
        if (p.type === "flower") this.flowers++;
        if (p.type === "mushroom") this.mushrooms++;
        if (p.finish) this.visitedFinish = true;
        this.squash = 1;
        this.landings++;
        onSound(boost > 1 ? "boost" : "jump");
      }
    }
    this.height = Math.max(this.height, 570 - this.y);
    this.camera = Math.min(this.camera, this.y - 255);
    this.generate();
    this.platforms = this.platforms.filter(
      (p) => p.y < this.camera + 760 && p.broken < 0.5,
    );
    for (const item of this.items) {
      if (
        !item.taken &&
        Math.hypot(item.x - this.x, item.y - this.y) <
          (item.type === "portal" ? 25 : 30)
      ) {
        item.taken = true;
        if (item.type === "hazard") {
          this.vy = 210;
          onSound("bump");
        } else if (item.type === "portal") {
          this.x = item.targetX ?? this.x;
          this.y = item.targetY ?? this.y - 95;
          this.vy = -c.jump * 0.85;
          this.portals++;
          this.height = Math.max(this.height, 570 - this.y);
          this.camera = Math.min(this.camera, this.y - 255);
          onSound("star");
        } else {
          if (item.type === "feather") this.feather = 7;
          else this.stars += item.value ?? 1;
          for (let i = 0; i < 8; i++)
            this.particles.push({
              x: item.x + (this.random() - 0.5) * 35,
              y: item.y + (this.random() - 0.5) * 35,
              t: 0.7,
            });
          onSound("star");
        }
      }
    }
    this.items = this.items.filter((i) => !i.taken && i.y < this.camera + 760);
    this.particles = this.particles.filter((p) => (p.t -= dt) > 0);
    this.checkLevelFinish();
    if (this.y > this.camera + 760) this.over = true;
  }
  get score() {
    return Math.floor(this.height / 10);
  }
  get earned() {
    return Math.floor(this.stars * this.config.mult);
  }
  summary(id: string): RunSummary {
    return {
      id,
      world: this.world,
      score: this.score,
      stars: this.earned,
      rawStars: this.stars,
      flowers: this.flowers,
      mushrooms: this.mushrooms,
      gusts: this.gusts,
      portals: this.portals,
      ...(this.levelId
        ? { levelId: this.levelId, completed: this.completed }
        : {}),
    };
  }
}
