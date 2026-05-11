// Cheap pooled particle emitter. One emitter instance per LevelView.
// Per-chapter "weather" — petals, rain, sparks, paper, steam, fireflies, confetti.

import { withAlpha } from "./sprites";

export type Particle = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // remaining seconds
  maxLife: number;
  size: number;
  hue: number;        // for rotation/color variant
  kind: WeatherKind;
};

export type WeatherKind =
  | "petals"     // origin — pink cherry blossoms drifting
  | "leaves"    // grp — green leaves
  | "embers"    // hab — golden-hour embers
  | "circuits" // ai — soft cyan sparks
  | "stars"    // investopad — magenta sparkles
  | "neon"     // sole — pink/cyan dust
  | "paper"    // ccd — paper notes
  | "dawn";    // home — soft motes

const POOL = 90;

export class Emitter {
  particles: Particle[] = Array.from({ length: POOL }, () => ({
    alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 1, hue: 0, kind: "dawn",
  }));
  acc = 0;

  spawn(kind: WeatherKind, W: number, H: number) {
    const p = this.particles.find((q) => !q.alive);
    if (!p) return;
    p.alive = true;
    p.kind = kind;
    p.hue = Math.random() * 360;
    if (kind === "petals" || kind === "leaves") {
      p.x = Math.random() * (W + 80) - 40;
      p.y = -10;
      p.vx = -8 - Math.random() * 16;
      p.vy = 14 + Math.random() * 14;
      p.size = 3 + Math.random() * 3;
      p.maxLife = p.life = 6 + Math.random() * 4;
    } else if (kind === "embers" || kind === "stars" || kind === "neon" || kind === "circuits" || kind === "dawn") {
      p.x = Math.random() * W;
      p.y = H + 10;
      p.vx = (Math.random() - 0.5) * 8;
      p.vy = -10 - Math.random() * 18;
      p.size = 2 + Math.random() * 2;
      p.maxLife = p.life = 3 + Math.random() * 3;
    } else if (kind === "paper") {
      p.x = Math.random() * (W + 80) - 40;
      p.y = -10;
      p.vx = -20 - Math.random() * 20;
      p.vy = 8 + Math.random() * 8;
      p.size = 4 + Math.random() * 3;
      p.maxLife = p.life = 5 + Math.random() * 3;
    }
  }

  step(dt: number, kind: WeatherKind, W: number, H: number) {
    // spawn rate per second by kind
    const rate = kind === "embers" || kind === "stars" || kind === "neon" || kind === "circuits" || kind === "dawn" ? 24 : 14;
    this.acc += dt * rate;
    while (this.acc >= 1) {
      this.acc -= 1;
      this.spawn(kind, W, H);
    }
    for (const p of this.particles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // soft sway on falling things
      if (p.kind === "petals" || p.kind === "leaves" || p.kind === "paper") {
        p.x += Math.sin((p.life + p.hue) * 2) * 0.5;
      }
      p.life -= dt;
      if (p.life <= 0 || p.x < -40 || p.x > W + 40 || p.y > H + 40 || p.y < -40) {
        p.alive = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, accent: string) {
    for (const p of this.particles) {
      if (!p.alive) continue;
      const a = Math.min(1, p.life / p.maxLife);
      const x = Math.round(p.x);
      const y = Math.round(p.y);
      if (p.kind === "petals") {
        ctx.fillStyle = withAlpha("#ffc6e0", a * 0.9);
        ctx.fillRect(x, y, p.size, p.size);
        ctx.fillStyle = withAlpha("#ff88b8", a * 0.7);
        ctx.fillRect(x + 1, y + 1, 1, 1);
      } else if (p.kind === "leaves") {
        ctx.fillStyle = withAlpha("#9fd17a", a);
        ctx.fillRect(x, y, p.size, p.size - 1);
      } else if (p.kind === "embers") {
        ctx.fillStyle = withAlpha("#ffb866", a * 0.95);
        ctx.fillRect(x, y, p.size, p.size);
      } else if (p.kind === "circuits") {
        ctx.fillStyle = withAlpha("#7feaff", a);
        ctx.fillRect(x, y, p.size, 1);
        ctx.fillRect(x, y, 1, p.size);
      } else if (p.kind === "stars") {
        ctx.fillStyle = withAlpha("#e8b8ff", a);
        ctx.fillRect(x, y, p.size, p.size);
      } else if (p.kind === "neon") {
        ctx.fillStyle = withAlpha(p.hue % 2 < 1 ? "#ff7fcf" : "#7fe8ff", a * 0.9);
        ctx.fillRect(x, y, p.size, p.size);
      } else if (p.kind === "paper") {
        ctx.fillStyle = withAlpha("#fdf6e3", a);
        ctx.fillRect(x, y, p.size, p.size - 1);
        ctx.fillStyle = withAlpha("#9c8a5c", a * 0.6);
        ctx.fillRect(x + 1, y + 1, p.size - 2, 1);
      } else if (p.kind === "dawn") {
        ctx.fillStyle = withAlpha(accent, a * 0.7);
        ctx.fillRect(x, y, p.size, p.size);
      }
    }
  }
}

// Map levelId → weather
export function weatherForChapter(levelId: string): WeatherKind {
  switch (levelId) {
    case "home": return "dawn";
    case "origin": return "petals";
    case "grp": return "leaves";
    case "hab": return "embers";
    case "ai": return "circuits";
    case "investopad": return "stars";
    case "sole": return "neon";
    case "ccd": return "paper";
    default: return "dawn";
  }
}
