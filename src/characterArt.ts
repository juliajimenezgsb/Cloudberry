import { star } from "./art";
import { findCosmetic, type Equipment } from "./catalog";
type C = CanvasRenderingContext2D;
function ellipse(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
  rotation = 0,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  c.fill();
}
function round(
  c: C,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function flower(c: C, x: number, y: number, r = 6) {
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ellipse(
      c,
      x + Math.cos(a) * r * 0.65,
      y + Math.sin(a) * r * 0.65,
      r * 0.55,
      r * 0.55,
      "#fff7e6",
    );
  }
  ellipse(c, x, y, r * 0.38, r * 0.38, "#e8bd69");
}
function heart(c: C, x: number, y: number, size: number, color: string) {
  c.save();
  c.translate(x, y);
  c.scale(size / 10, size / 10);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 6);
  c.bezierCurveTo(-18, -3, -7, -14, 0, -6);
  c.bezierCurveTo(7, -14, 18, -3, 0, 6);
  c.fill();
  c.restore();
}
/** Layer order: back wearables → ears → body → outfit → face → headwear → front extras. */
export function drawCharacter(
  c: C,
  x: number,
  y: number,
  e: Equipment,
  scale = 1,
  squash = 0,
  time = 0,
  vy = 0,
) {
  c.save();
  c.translate(x, y);
  const stretch = vy < -100 ? 0.04 : 0;
  c.scale(
    scale * (1 + squash * 0.15 - stretch),
    scale * (1 - squash * 0.13 + stretch),
  );
  const color = findCosmetic(e.color)?.swatch || "#eee4ff",
    kind = e.character;
  const idle = Math.sin(time * 2) * 1.5;
  ellipse(c, 0, 25, 23, 4, "#75658418");
  if (e.outfit === "cape") {
    c.fillStyle = "#a69bc8";
    c.beginPath();
    c.moveTo(-19, -7);
    c.quadraticCurveTo(-44, 29, -29, 28 + idle);
    c.lineTo(32, 28 - idle);
    c.quadraticCurveTo(40, 14, 19, -7);
    c.fill();
    star(c, -27, 19, 4, "#f8e9b5");
    star(c, 27, 23, 3, "#f8e9b5");
  }
  if (e.accessory === "wings") {
    ellipse(c, -29, 1, 15, 8, "#fffaf0", -0.6);
    ellipse(c, 29, 1, 15, 8, "#fffaf0", 0.6);
    ellipse(c, -33, -7 + idle, 14, 7, "#fffdf8", 0.8);
    ellipse(c, 33, -7 - idle, 14, 7, "#fffdf8", -0.8);
  }
  if (e.accessory === "backpack") {
    round(c, 12, -2, 24, 24, 8, "#b4c9b0");
    round(c, 25, 6, 12, 12, 4, "#93b08d");
  }
  if (kind === "berri") {
    ellipse(c, -13, -33, 8, 24, color, -0.23 + idle * 0.02);
    ellipse(c, 14, -31, 9, 22, color, 0.45 - idle * 0.02);
    ellipse(c, -13, -34, 3.5, 16, "#edbdce", -0.23 + idle * 0.02);
    ellipse(c, 14, -32, 4, 14, "#edbdce", 0.45 - idle * 0.02);
  }
  if (kind === "mochi") {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-25, -12);
    c.lineTo(-23, -37);
    c.lineTo(-5, -23);
    c.lineTo(10, -23);
    c.lineTo(26, -37);
    c.lineTo(28, -7);
    c.fill();
    c.fillStyle = "#eebecd";
    c.beginPath();
    c.moveTo(-21, -21);
    c.lineTo(-21, -31);
    c.lineTo(-12, -23);
    c.moveTo(15, -23);
    c.lineTo(23, -31);
    c.lineTo(24, -19);
    c.fill();
  }
  if (kind === "pip") {
    ellipse(c, -22, -22, 11, 11, color);
    ellipse(c, 22, -22, 11, 11, color);
    ellipse(c, -22, -22, 6, 6, "#eac6c4");
    ellipse(c, 22, -22, 6, 6, "#eac6c4");
  }
  if (kind === "clover") {
    ellipse(c, -15, -23, 12, 13, color);
    ellipse(c, 15, -23, 12, 13, color);
  }
  if (kind === "puff") {
    for (const [cx, cy, r] of [
      [-21, 0, 13],
      [-13, -17, 15],
      [5, -20, 16],
      [23, -5, 14],
      [13, 13, 15],
      [-9, 13, 15],
    ])
      ellipse(c, cx, cy, r, r, color);
  }
  ellipse(
    c,
    0,
    0,
    kind === "mochi" ? 29 : 27,
    kind === "clover" ? 24 : 26,
    color,
  );
  ellipse(c, -14, 22, 9, 5, color);
  ellipse(c, 14, 22, 9, 5, color);
  if (e.outfit === "sweater") {
    round(c, -25, 4, 50, 21, 8, "#c4b1d8");
    round(c, -34, 5, 14, 17, 6, "#c4b1d8");
    round(c, 20, 5, 14, 17, 6, "#c4b1d8");
    round(c, -22, 21, 44, 5, 2, "#ae98c5");
    c.strokeStyle = "#e7dced";
    c.lineWidth = 1;
    for (let i = -15; i < 20; i += 8) {
      c.beginPath();
      c.moveTo(i, 12);
      c.lineTo(i, 20);
      c.stroke();
    }
  }
  if (e.outfit === "overalls") {
    round(c, -22, 8, 44, 18, 6, "#9cbcd2");
    round(c, -15, 0, 6, 19, 2, "#9cbcd2");
    round(c, 9, 0, 6, 19, 2, "#9cbcd2");
    round(c, -8, 13, 16, 9, 3, "#bed4e2");
    ellipse(c, -12, 8, 2, 2, "#f8e3a1");
    ellipse(c, 12, 8, 2, 2, "#f8e3a1");
  }
  if (e.outfit === "strawberry") {
    round(c, -24, 2, 48, 24, 10, "#e9a6b4");
    for (let i = 0; i < 7; i++)
      ellipse(
        c,
        -17 + (i % 4) * 11,
        10 + Math.floor(i / 4) * 8,
        1.2,
        2,
        "#fff0b9",
      );
    c.fillStyle = "#97b28a";
    c.beginPath();
    c.moveTo(-22, 2);
    c.lineTo(-12, 8);
    c.lineTo(0, 2);
    c.lineTo(10, 8);
    c.lineTo(22, 2);
    c.fill();
  }
  if (e.outfit === "pajamas") {
    round(c, -25, 3, 50, 23, 8, "#b8d3df");
    for (let i = 0; i < 3; i++) {
      ellipse(c, -15 + i * 14, 12 + (i % 2) * 7, 6, 3, "#edf5f5");
      ellipse(c, -16 + i * 14, 10 + (i % 2) * 7, 3, 3, "#edf5f5");
    }
  }
  const eyeY = kind === "clover" ? -23 : -6;
  if (kind === "clover") {
    ellipse(c, -15, eyeY, 8, 8, "#fffdf0");
    ellipse(c, 15, eyeY, 8, 8, "#fffdf0");
  }
  const eyeX = kind === "clover" ? 15 : 10;
  for (const ex of [-eyeX, eyeX]) {
    ellipse(c, ex, eyeY, 2.6, 3.5, "#665777");
    ellipse(c, ex + 0.7, eyeY - 1, 0.7, 0.9, "#fff");
  }
  if (kind === "pip") ellipse(c, 0, 3, 10, 7, "#fff6e3");
  c.strokeStyle = "#756280";
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(0, 0, 4, 0, Math.PI);
  c.stroke();
  if (kind === "mochi") {
    ellipse(c, 0, -0.5, 2.5, 1.7, "#c092a6");
    for (const sign of [-1, 1])
      for (let i = 0; i < 2; i++) {
        c.beginPath();
        c.moveTo(sign * 18, 1 + i * 4);
        c.lineTo(sign * 29, -1 + i * 6);
        c.stroke();
      }
  }
  ellipse(c, -18, 3, 5, 2.5, "#e9adbd");
  ellipse(c, 18, 3, 5, 2.5, "#e9adbd");
  const headY =
    kind === "puff"
      ? -33
      : kind === "mochi"
        ? -30
        : kind === "clover"
          ? -42
          : -29;
  if (e.hat === "bow") {
    c.fillStyle = "#dc9cb6";
    c.beginPath();
    c.moveTo(1, headY);
    c.lineTo(-14, headY - 8);
    c.quadraticCurveTo(-20, headY, -14, headY + 8);
    c.lineTo(1, headY);
    c.lineTo(15, headY - 8);
    c.quadraticCurveTo(21, headY, 15, headY + 8);
    c.fill();
    ellipse(c, 0, headY, 4, 4, "#f2c7d6");
  }
  if (e.hat === "mushroom") {
    round(c, -22, headY - 2, 44, 6, 3, "#eadccc");
    c.fillStyle = "#d7a1a7";
    c.beginPath();
    c.ellipse(0, headY - 4, 31, 17, 0, Math.PI, Math.PI * 2);
    c.fill();
    for (const [cx, cy] of [
      [-15, -12],
      [5, -17],
      [18, -9],
    ])
      ellipse(c, cx, headY + cy, 4, 3, "#fff2dc");
  }
  if (e.hat === "daisy") {
    c.strokeStyle = "#98b293";
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(0, headY, 25, 6, 0, Math.PI, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 5; i++)
      flower(c, -22 + i * 11, headY - 4 - Math.sin((i * Math.PI) / 4) * 4, 5);
  }
  if (e.hat === "headband") {
    c.strokeStyle = "#c6ae7f";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, headY + 9, 22, Math.PI, Math.PI * 2);
    c.moveTo(-16, headY - 6);
    c.lineTo(-19, headY - 15);
    c.moveTo(16, headY - 6);
    c.lineTo(19, headY - 15);
    c.stroke();
    star(c, -19, headY - 16, 7, "#ecd18a");
    star(c, 19, headY - 16, 7, "#ecd18a");
  }
  if (e.hat === "beanie") {
    c.fillStyle = "#b6c7b2";
    c.beginPath();
    c.ellipse(0, headY, 26, 18, 0, Math.PI, Math.PI * 2);
    c.fill();
    round(c, -27, headY - 2, 54, 8, 4, "#9eb198");
    ellipse(c, 0, headY - 21, 7, 7, "#e4e9d5");
  }
  if (e.accessory === "scarf") {
    round(c, -25, 6, 50, 7, 3, "#e1b6a3");
    round(c, 13, 10, 8, 19, 3, "#e1b6a3");
  }
  if (e.accessory === "clip")
    flower(c, kind === "clover" ? 29 : 24, kind === "clover" ? -13 : -18, 7);
  if (e.accessory === "glasses") {
    heart(c, -10, eyeY + 1, 10, "#b97e9a");
    heart(c, 10, eyeY + 1, 10, "#b97e9a");
    heart(c, -10, eyeY, 7, "#fbdde5");
    heart(c, 10, eyeY, 7, "#fbdde5");
    c.strokeStyle = "#b97e9a";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-3, eyeY - 1);
    c.lineTo(3, eyeY - 1);
    c.stroke();
  }
  c.restore();
}
