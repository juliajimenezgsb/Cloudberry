import { star } from "./art";
import { worldById } from "./worlds";
import type { WorldId } from "./progression";
import type { Game, Platform, Item } from "./engine";
type C = CanvasRenderingContext2D;
const wrap = (n: number, max: number) => ((n % max) + max) % max;
function ellipse(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
function cloud(c: C, x: number, y: number, scale = 1, color = "#ffffff55") {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  ellipse(c, 0, 0, 50, 12, color);
  ellipse(c, -15, -8, 24, 17, color);
  ellipse(c, 15, -9, 18, 14, color);
  c.restore();
}
function flower(c: C, x: number, y: number, r = 4) {
  for (let i = 0; i < 5; i++) {
    const a = (i * 6.28) / 5;
    ellipse(
      c,
      x + Math.cos(a) * r * 0.65,
      y + Math.sin(a) * r * 0.65,
      r * 0.5,
      r * 0.5,
      "#fff8df",
    );
  }
  ellipse(c, x, y, r * 0.3, r * 0.3, "#d5ab5b");
}
function hills(c: C, cam: number, night: boolean) {
  for (let i = 0; i < 5; i++) {
    const y = wrap(i * 187 - cam * 0.08, 850) - 90;
    ellipse(c, i % 2 ? 345 : 30, y, 135, 42, night ? "#626b8e66" : "#b5cba74a");
    ellipse(
      c,
      i % 2 ? 390 : -15,
      y + 7,
      95,
      25,
      night ? "#8683a65a" : "#9bb8a535",
    );
  }
}
export function drawBackground(
  c: C,
  world: WorldId,
  time: number,
  camera: number,
) {
  const w = worldById(world),
    gradient = c.createLinearGradient(0, 0, 0, 720);
  gradient.addColorStop(0, w.sky[0]);
  gradient.addColorStop(1, w.sky[1]);
  c.fillStyle = gradient;
  c.fillRect(0, 0, 390, 720);
  if (world === "garden") {
    const sun = c.createRadialGradient(280, 90, 0, 280, 90, 130);
    sun.addColorStop(0, "#fff3c73d");
    sun.addColorStop(1, "#fff3c700");
    c.fillStyle = sun;
    c.fillRect(130, 0, 260, 240);
    hills(c, camera, false);
    for (let i = 0; i < 4; i++) {
      const x = wrap(i * 137 + time * 8, 450) - 30,
        y = wrap(i * 193 - camera * 0.22 + time * 7, 780) - 30;
      c.save();
      c.translate(x, y);
      c.rotate(Math.sin(time + i) * 0.5);
      ellipse(c, 0, 0, 3, 1.7, "#efc9d5aa");
      c.restore();
    }
  } else if (world === "sunset") {
    const glow = c.createRadialGradient(285, 160, 10, 285, 160, 125);
    glow.addColorStop(0, "#ffe7af88");
    glow.addColorStop(1, "#ffe7af00");
    c.fillStyle = glow;
    c.fillRect(140, 0, 250, 300);
    ellipse(c, 285, 160, 37, 37, "#ffe8b2aa");
    const horizon = 590 + Math.sin(camera * 0.0008) * 18;
    c.fillStyle = "#b8b8ce55";
    c.fillRect(0, horizon, 390, 160);
    c.strokeStyle = "#f9d8c766";
    c.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(0, horizon + 15 + i * 20);
      for (let x = 0; x <= 400; x += 15)
        c.lineTo(
          x,
          horizon + 15 + i * 20 + Math.sin(x * 0.03 + time * 0.4 + i) * 3,
        );
      c.stroke();
    }
    c.fillStyle = "#ae8d9f33";
    for (let i = 0; i < 9; i++) {
      const x = i * 51 - 20,
        y = wrap(i * 19 - camera * 0.035, 35) + 572;
      c.fillRect(x, y, 42, 90);
      c.beginPath();
      c.moveTo(x - 5, y);
      c.lineTo(x + 21, y - 23);
      c.lineTo(x + 47, y);
      c.fill();
    }
    c.strokeStyle = "#af879f66";
    c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const x = wrap(time * 10 + i * 133, 450) - 30,
        y = 120 + i * 47 - camera * 0.02;
      c.beginPath();
      c.moveTo(x - 7, y - 2);
      c.quadraticCurveTo(x - 3, y - 5, x, y);
      c.quadraticCurveTo(x + 3, y - 5, x + 7, y - 2);
      c.stroke();
    }
  } else if (world === "moonlight") {
    const moon = c.createRadialGradient(288, 125, 12, 288, 125, 85);
    moon.addColorStop(0, "#f5ecc744");
    moon.addColorStop(1, "#f5ecc700");
    c.fillStyle = moon;
    c.fillRect(190, 25, 195, 200);
    ellipse(c, 288, 125, 35, 35, "#f1e8cb");
    ellipse(c, 276, 116, 6, 7, "#dbd3bc55");
    ellipse(c, 296, 137, 8, 8, "#dbd3bc44");
    hills(c, camera, true);
    for (let i = 0; i < 18; i++) {
      const x = wrap(i * 79 + Math.sin(time * 0.5 + i) * 15, 390),
        y =
          wrap(i * 97 - camera * 0.23 + Math.sin(time * 0.35 + i) * 10, 780) -
          30;
      c.globalAlpha = 0.35 + Math.sin(time * 1.5 + i) * 0.25;
      ellipse(c, x, y, 3, 3, "#e5eeb2");
      ellipse(c, x, y, 8, 8, "#e5eeb216");
      c.globalAlpha = 1;
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const x = wrap(i * 163 + time * 0.8, 500) - 50,
        y = wrap(i * 287 - camera * 0.06, 850) - 60;
      const nebula = c.createRadialGradient(x, y, 0, x, y, 140);
      nebula.addColorStop(0, i % 2 ? "#e8b5d233" : "#d4dcf533");
      nebula.addColorStop(1, "#ffffff00");
      c.fillStyle = nebula;
      c.fillRect(x - 140, y - 140, 280, 280);
    }
    c.strokeStyle = "#eadffc4d";
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = 40 + i * 143,
        y = wrap(i * 239 - camera * 0.12, 850) - 40;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 25, y + 38);
      c.lineTo(x + 69, y + 22);
      c.lineTo(x + 88, y + 65);
      c.stroke();
      for (const [dx, dy] of [
        [0, 0],
        [25, 38],
        [69, 22],
        [88, 65],
      ])
        star(c, x + dx, y + dy, 2.5, "#f8edffbb");
    }
    const px = 310 + Math.sin(time * 0.12) * 8,
      py = wrap(410 - camera * 0.08, 900) - 50;
    ellipse(c, px, py, 26, 26, "#dec3dc88");
    c.save();
    c.translate(px, py);
    c.rotate(-0.4);
    c.strokeStyle = "#f8e8ee66";
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(0, 0, 40, 10, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
    if (time % 13 < 1.1) {
      const t = time % 13;
      c.strokeStyle = `rgba(255,245,255,${(1 - t / 1.1) * 0.65})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(40 + t * 230, 80 + t * 120);
      c.lineTo(10 + t * 230, 65 + t * 120);
      c.stroke();
    }
  }
  if (world !== "moonlight")
    for (let i = 0; i < (world === "starlight" ? 5 : 7); i++) {
      const x = wrap(i * 127 + time * (2 + (i % 3)), 510) - 60,
        y = wrap(i * 139 - camera * 0.15, 800) - 40;
      cloud(
        c,
        x,
        y,
        world === "starlight" ? 1.3 : 1,
        world === "starlight" ? "#e6d7f01a" : "#ffffff45",
      );
    }
  for (let i = 0; i < 24; i++) {
    const x = (i * 83 + 29) % 390,
      y = wrap(i * 109 - camera * 0.3, 760);
    c.globalAlpha = 0.35 + Math.sin(time * 0.7 + i) * 0.25;
    star(
      c,
      x,
      y,
      i % 4 === 0 ? 2.5 : 1.3,
      world === "garden" ? "#ffffff" : "#fff7df",
    );
    c.globalAlpha = 1;
  }
}
export function drawPlatform(c: C, p: Platform, g: Game) {
  const w = worldById(g.world);
  if (p.finish) {
    c.save();
    c.fillStyle = "#9bb58b";
    c.beginPath();
    c.roundRect(p.x - 5, p.y, p.w + 10, 22, 11);
    c.fill();
    c.fillStyle = "#d8e4c7";
    c.beginPath();
    c.roundRect(p.x - 5, p.y, p.w + 10, 6, 4);
    c.fill();
    for (let i = 0; i < 7; i++)
      flower(c, p.x + 15 + (i * (p.w - 30)) / 6, p.y - 6, 5);
    c.strokeStyle = "#b6a0c7";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(195, p.y - 8);
    c.lineTo(195, p.y - 72);
    c.stroke();
    c.fillStyle = "#e9c8d8";
    c.beginPath();
    c.moveTo(196, p.y - 72);
    c.lineTo(226, p.y - 62);
    c.lineTo(196, p.y - 52);
    c.fill();
    c.fillStyle = "#8b779a";
    c.textAlign = "center";
    c.font = "10px sans-serif";
    c.fillText(
      g.completed ? "A lovely arrival!" : "FINISH GARDEN",
      195,
      p.y - 85,
    );
    c.restore();
    return;
  }
  c.save();
  c.globalAlpha = g.platformOpacity(p);
  const moving = p.type === "moving" || p.type === "orbit",
    boost = ["boost", "flower", "mushroom"].includes(p.type);
  c.fillStyle = moving
    ? w.moving
    : p.type === "fragile" || p.type === "phase"
      ? w.fragile
      : boost
        ? w.boost
        : w.platform;
  c.beginPath();
  c.roundRect(p.x, p.y, p.w, 13, 7);
  c.fill();
  c.fillStyle = "#ffffff55";
  c.beginPath();
  c.roundRect(p.x + 2, p.y, p.w - 4, 4, 3);
  c.fill();
  if (p.type === "orbit") {
    c.save();
    c.translate(p.x + p.w / 2, p.y + 7);
    c.rotate(Math.sin(g.time * 0.8 + p.phase) * 0.16);
    c.strokeStyle = "#f4e6ffbb";
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(0, 0, p.w * 0.6, 6, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }
  if (p.type === "flower" || (g.world === "garden" && p.type === "normal")) {
    for (let i = 0; i < (p.type === "flower" ? 3 : 1); i++) {
      const x = p.x + 12 + (i * (p.w - 24)) / 2;
      c.strokeStyle = "#8eac85";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, p.y);
      c.lineTo(x, p.y - 8);
      c.stroke();
      flower(c, x, p.y - 10, p.type === "flower" ? 5 : 3.5);
    }
  }
  if (p.type === "mushroom") {
    for (let i = 0; i < 3; i++) {
      const x = p.x + 15 + (i * (p.w - 30)) / 2;
      c.fillStyle = "#e2d4ed";
      c.fillRect(x - 2, p.y - 9, 4, 9);
      c.fillStyle = "#c8a8d7";
      c.beginPath();
      c.ellipse(x, p.y - 10, 9, 7, 0, Math.PI, Math.PI * 2);
      c.fill();
      ellipse(c, x - 3, p.y - 14, 2, 1.5, "#fff5d7");
    }
  }
  if (p.type === "boost") {
    star(c, p.x + p.w / 2, p.y + 6, 4, "#fff5d0");
  }
  if (p.type === "fragile" || p.type === "phase") {
    c.setLineDash([3, 4]);
    c.strokeStyle = "#9b7ca780";
    c.beginPath();
    c.moveTo(p.x + 8, p.y + 8);
    c.lineTo(p.x + p.w - 8, p.y + 8);
    c.stroke();
  }
  if (p.type === "shadow") {
    c.strokeStyle = "#eee3ff99";
    c.beginPath();
    c.roundRect(p.x, p.y, p.w, 13, 7);
    c.stroke();
  }
  c.restore();
}
export function drawItem(c: C, i: Item, g: Game) {
  const w = worldById(g.world);
  if (i.type === "star") {
    if (g.world === "garden") {
      flower(c, i.x, i.y, 10);
      star(c, i.x, i.y, 5, w.star);
    } else if (g.world === "moonlight") {
      ellipse(c, i.x, i.y, 15, 15, "#f6f0bb11");
      star(c, i.x, i.y, 10, w.star);
      ellipse(c, i.x + 4, i.y - 2, 5, 6, w.sky[0]);
    } else if (g.world === "starlight") {
      c.fillStyle = w.star;
      c.beginPath();
      c.moveTo(i.x, i.y - 12);
      c.lineTo(i.x + 7, i.y);
      c.lineTo(i.x, i.y + 12);
      c.lineTo(i.x - 7, i.y);
      c.closePath();
      c.fill();
      c.strokeStyle = "#b7bde5";
      c.beginPath();
      c.moveTo(i.x, i.y - 10);
      c.lineTo(i.x, i.y + 10);
      c.stroke();
      if ((i.value ?? 1) > 1) {
        star(c, i.x - 10, i.y + 3, 4, w.star);
        star(c, i.x + 10, i.y - 4, 4, w.star);
      }
    } else {
      ellipse(c, i.x, i.y, 15, 15, "#ffe2a923");
      star(c, i.x, i.y, 10 + Math.sin(g.time * 2) * 1, w.star);
    }
  } else if (i.type === "feather") {
    c.save();
    c.translate(i.x, i.y);
    c.rotate(0.45);
    ellipse(c, 0, 0, 6, 16, "#fffaf2");
    c.strokeStyle = "#b6a2c5";
    c.beginPath();
    c.moveTo(0, -10);
    c.lineTo(0, 19);
    c.stroke();
    c.restore();
  } else if (i.type === "firefly") {
    for (let j = 0; j < 3; j++)
      ellipse(
        c,
        i.x + Math.cos(g.time + j * 2.1) * 8,
        i.y + Math.sin(g.time + j * 2.1) * 6,
        2.8,
        2.8,
        "#eff3b2",
      );
    ellipse(c, i.x, i.y, 18, 18, "#e7edbd12");
  } else if (i.type === "portal") {
    c.save();
    c.translate(i.x, i.y);
    c.rotate(g.time * 0.4);
    c.strokeStyle = "#f9e7ffcc";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 0, 17, 22, 0, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = "#e8d0fc66";
    c.beginPath();
    c.ellipse(0, 0, 12, 17, 0, 0, Math.PI * 2);
    c.stroke();
    star(c, 0, -22, 5, "#fff0b8");
    c.restore();
  } else {
    c.save();
    c.translate(i.x, i.y);
    if (g.world === "garden" || g.world === "moonlight") {
      const color = g.world === "garden" ? "#d6a1c2" : "#b7a8ce";
      ellipse(c, -6, -2, 8, 5 + Math.sin(g.time * 6) * 2, color);
      ellipse(c, 6, -2, 8, 5 + Math.sin(g.time * 6) * 2, color);
      ellipse(c, 0, 0, 2, 7, "#8e7b9d");
    } else if (g.world === "sunset") {
      c.strokeStyle = "#9b758e";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-14, -4);
      c.quadraticCurveTo(-6, -9, 0, 0);
      c.quadraticCurveTo(6, -9, 14, -4);
      c.stroke();
    } else {
      ellipse(c, 0, 0, 9, 6, "#bdaccd");
      c.strokeStyle = "#dfd4ec88";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(6, 0);
      c.lineTo(25, -8);
      c.stroke();
    }
    c.restore();
  }
}
