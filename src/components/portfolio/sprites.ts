import { TILE, ROWS, type Level } from "./data";
import type { TileWorld } from "./engine";
import type { World, Chapter, GateE } from "./worldStitch";

export const VIEW_H = ROWS * TILE;

// Safe alpha for any color — handles #rgb, #rrggbb, rgb(), rgba(), hsl(), named.
// Avoids the invalid pattern `${color}40` when color is `rgb(...)`.
export function withAlpha(color: string, a: number): string {
  const clamp = Math.max(0, Math.min(1, a));
  const c = color.trim();
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${clamp})`;
    }
  }
  if (c.startsWith("rgb(")) {
    return c.replace(/^rgb\(/, "rgba(").replace(/\)$/, `,${clamp})`);
  }
  if (c.startsWith("rgba(")) {
    return c.replace(/,[^,]*\)$/, `,${clamp})`);
  }
  // Fallback (hsl/named): wrap with globalAlpha-style trick not possible here, just return as-is.
  return c;
}

// ─── Sky + parallax ───────────────────────────────────────────────
export function drawSky(ctx: CanvasRenderingContext2D, W: number, H: number, pal: Level["palette"]) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal.sky);
  g.addColorStop(0.55, pal.skyMid);
  g.addColorStop(1, pal.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// soft sun/moon disc in the sky
export function drawSun(ctx: CanvasRenderingContext2D, W: number, H: number, pal: Level["palette"]) {
  const cx = W * 0.78;
  const cy = H * 0.22;
  const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 90);
  grad.addColorStop(0, pal.accent);
  grad.addColorStop(0.4, withAlpha(pal.accent, 0.25));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - 100, cy - 100, 200, 200);
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();
}

// drifting clouds (procedural)
export function drawClouds(ctx: CanvasRenderingContext2D, W: number, H: number, camX: number, t: number) {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 6; i++) {
    const baseX = ((i * 290 + t * 8 - camX * 0.15) % (W + 200)) - 100;
    const y = 30 + ((i * 53) % 80);
    drawCloud(ctx, baseX, y);
  }
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (let i = 0; i < 5; i++) {
    const baseX = ((i * 350 + t * 4 - camX * 0.08) % (W + 200)) - 100;
    const y = 60 + ((i * 41) % 60);
    drawCloud(ctx, baseX, y);
  }
}
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillRect(x, y, 36, 8);
  ctx.fillRect(x + 6, y - 6, 24, 6);
  ctx.fillRect(x + 12, y - 12, 14, 6);
  ctx.fillRect(x + 28, y - 6, 18, 6);
}

// distant mountain silhouette (one big layer)
export function drawMountains(ctx: CanvasRenderingContext2D, W: number, H: number, camX: number, pal: Level["palette"]) {
  ctx.fillStyle = pal.brickShade;
  ctx.globalAlpha = 0.55;
  const off = (camX * 0.2) % 200;
  ctx.beginPath();
  ctx.moveTo(0, H - TILE * 4);
  for (let x = -200; x < W + 200; x += 60) {
    const xx = x - off;
    const peak = H - TILE * 4 - (60 + ((Math.sin(x * 0.05) + 1) * 50));
    ctx.lineTo(xx, peak);
    ctx.lineTo(xx + 30, peak - 14);
    ctx.lineTo(xx + 60, peak);
  }
  ctx.lineTo(W + 200, H - TILE * 4);
  ctx.lineTo(0, H - TILE * 4);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// per-chapter parallax decoration band
export function drawParallax(ctx: CanvasRenderingContext2D, W: number, H: number, camX: number, pal: Level["palette"], parallax: Level["parallax"], t: number) {
  for (const layer of parallax) {
    const off = (camX * 0.3) % 80;
    if (layer === "stars") {
      ctx.fillStyle = pal.accent;
      for (let i = 0; i < 70; i++) {
        const sx = ((i * 137.5 + camX * 0.1) % (W + 100)) - 50;
        const sy = (i * 53.3) % (H * 0.55);
        const flick = ((Math.sin(t + i) + 1) * 0.5) * 0.6 + 0.4;
        ctx.globalAlpha = flick * 0.8;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
      }
      ctx.globalAlpha = 1;
    } else if (layer === "city") {
      for (let i = -1; i < W / 60 + 2; i++) {
        const x = i * 60 - off;
        const h = 60 + ((i * 37) % 80);
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(Math.floor(x), H - TILE * 4 - h, 50, h);
        ctx.fillStyle = pal.accent;
        ctx.globalAlpha = 0.75;
        for (let wy = 0; wy < Math.floor(h / 14); wy++)
          for (let wx = 0; wx < 4; wx++) {
            if (((wx + wy + i) * 7) % 5 < 2) ctx.fillRect(Math.floor(x) + 6 + wx * 10, H - TILE * 4 - h + 8 + wy * 14, 4, 6);
          }
        ctx.globalAlpha = 1;
      }
    } else if (layer === "trees") {
      for (let i = -1; i < W / 80 + 2; i++) {
        const x = i * 80 - off;
        // trunk
        ctx.fillStyle = "#3a200a";
        ctx.fillRect(Math.floor(x) + 22, H - TILE * 4 - 50, 8, 50);
        // canopy circles
        ctx.fillStyle = "#1d6a26";
        ctx.beginPath();
        ctx.arc(Math.floor(x) + 26, H - TILE * 4 - 56, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#27873a";
        ctx.beginPath();
        ctx.arc(Math.floor(x) + 18, H - TILE * 4 - 50, 20, 0, Math.PI * 2);
        ctx.fill();
        // apples
        ctx.fillStyle = "#d23838";
        for (let a = 0; a < 5; a++) {
          const ax = Math.floor(x) + 10 + ((a * 13) % 36);
          const ay = H - TILE * 4 - 70 + ((a * 17) % 24);
          ctx.fillRect(ax, ay, 4, 4);
        }
      }
    } else if (layer === "racks") {
      ctx.fillStyle = pal.brickShade;
      for (let i = -1; i < W / 50 + 2; i++) {
        const x = i * 50 - off;
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(Math.floor(x), H - TILE * 4 - 90, 36, 90);
        ctx.fillStyle = pal.accent;
        for (let r = 0; r < 5; r++) {
          ctx.globalAlpha = 0.5 + ((Math.sin(t * 5 + i + r) + 1) * 0.25);
          ctx.fillRect(Math.floor(x) + 4, H - TILE * 4 - 80 + r * 16, 4, 4);
        }
        ctx.globalAlpha = 1;
      }
    } else if (layer === "apartments") {
      for (let i = -1; i < W / 70 + 2; i++) {
        const x = i * 70 - off;
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(Math.floor(x), H - TILE * 4 - 130, 60, 130);
        // roof tile
        ctx.fillStyle = pal.brick;
        ctx.fillRect(Math.floor(x) - 2, H - TILE * 4 - 134, 64, 6);
        // windows
        ctx.fillStyle = pal.accent;
        for (let wy = 0; wy < 5; wy++)
          for (let wx = 0; wx < 3; wx++) {
            const lit = ((wx + wy + i) % 5) < 2 ? 0.95 : 0.18;
            ctx.globalAlpha = lit;
            ctx.fillRect(Math.floor(x) + 8 + wx * 16, H - TILE * 4 - 120 + wy * 22, 9, 11);
          }
        ctx.globalAlpha = 1;
      }
    } else if (layer === "desk") {
      ctx.fillStyle = pal.brickShade;
      ctx.fillRect(0, H - TILE * 4 - 50, W, 50);
      ctx.fillStyle = pal.accent;
      for (let i = 0; i < W; i += 6) {
        const h = 4 + Math.abs(Math.sin((i + camX) * 0.05 + t)) * 30;
        ctx.fillRect(i, H - TILE * 4 - 25 - h / 2, 4, h);
      }
    } else if (layer === "shelves") {
      for (let i = -1; i < W / 80 + 2; i++) {
        const x = i * 80 - off;
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(Math.floor(x), H - TILE * 4 - 80, 70, 6);
        ctx.fillRect(Math.floor(x), H - TILE * 4 - 50, 70, 6);
        // shoeboxes
        ctx.fillStyle = pal.accent;
        ctx.fillRect(Math.floor(x) + 6, H - TILE * 4 - 76, 18, 26);
        ctx.fillStyle = pal.accentDim;
        ctx.fillRect(Math.floor(x) + 28, H - TILE * 4 - 76, 22, 26);
        ctx.fillStyle = pal.accent;
        ctx.fillRect(Math.floor(x) + 6, H - TILE * 4 - 46, 22, 26);
        ctx.fillStyle = pal.accentDim;
        ctx.fillRect(Math.floor(x) + 32, H - TILE * 4 - 46, 26, 26);
      }
    }
  }
}

// hot air balloon (HOME / origin chapter flair)
export function drawBalloon(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, accent: string) {
  const x = (Math.sin(t * 0.3) * 0.5 + 0.5) * W * 0.7 + 40;
  const y = 60 + Math.sin(t * 0.6) * 6;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x - 6, y + 16, 12, 8);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 10);
  ctx.lineTo(x - 6, y + 16);
  ctx.moveTo(x + 12, y + 10);
  ctx.lineTo(x + 6, y + 16);
  ctx.stroke();
}

// ─── Tiles ────────────────────────────────────────────────────────
export function drawTiles(
  ctx: CanvasRenderingContext2D,
  world: TileWorld,
  camX: number,
  W: number,
  H: number,
  paletteAt: (col: number) => Level["palette"],
) {
  const startCol = Math.max(0, Math.floor(camX / TILE) - 1);
  const endCol = Math.min(world.cols, Math.ceil((camX + W) / TILE) + 1);
  for (let y = 0; y < world.rows.length; y++) {
    for (let x = startCol; x < endCol; x++) {
      const c = world.rows[y][x];
      if (c === "." || c === "S" || c === "F") continue;
      const pal = paletteAt(x);
      const sx = x * TILE - camX;
      const sy = y * TILE;
      if (c === "#") {
        ctx.fillStyle = pal.ground;
        ctx.fillRect(sx, sy, TILE, TILE);
        const above = y === 0 ? "." : world.rows[y - 1][x];
        if (above === "." || above === "C" || above === "N") {
          // grassy top stripe
          ctx.fillStyle = pal.groundTop;
          ctx.fillRect(sx, sy, TILE, 5);
          // grass tufts
          ctx.fillStyle = pal.accent;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(sx + 3, sy - 2, 2, 2);
          ctx.fillRect(sx + 9, sy - 3, 2, 3);
          ctx.fillRect(sx + 17, sy - 2, 2, 2);
          ctx.fillRect(sx + 23, sy - 3, 2, 3);
          ctx.globalAlpha = 1;
          // tiny flowers
          if ((x * 7) % 11 === 0) {
            ctx.fillStyle = "#ff6f8a";
            ctx.fillRect(sx + 13, sy - 4, 2, 2);
            ctx.fillStyle = "#ffd24a";
            ctx.fillRect(sx + 14, sy - 3, 1, 1);
          }
        }
        // shadow on bottom
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(sx, sy + TILE - 3, TILE, 3);
        // crack
        if ((x * 11 + y * 7) % 13 === 0 && above !== ".") {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(sx + 6, sy + 8, 2, 6);
          ctx.fillRect(sx + 6, sy + 14, 4, 2);
        }
      } else if (c === "=") {
        ctx.fillStyle = pal.brick;
        ctx.fillRect(sx, sy, TILE, 8);
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(sx, sy + 8, TILE, 4);
        // wood grain
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(sx + 6, sy + 2, 16, 1);
        ctx.fillRect(sx + 4, sy + 5, 20, 1);
      } else if (c === "B") {
        ctx.fillStyle = pal.brick;
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = pal.brickShade;
        ctx.fillRect(sx, sy + TILE - 4, TILE, 4);
        ctx.fillRect(sx + TILE - 4, sy, 4, TILE);
      } else if (c === "P") {
        ctx.fillStyle = pal.pipe;
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = pal.pipeShade;
        ctx.fillRect(sx + TILE - 6, sy, 6, TILE);
      }
    }
  }
}

// ─── Coin (skill) ─────────────────────────────────────────────────
export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, spin: number) {
  x = Math.round(x); y = Math.round(y);
  const w = Math.round(Math.abs(Math.cos(spin)) * 16 + 4);
  // glow
  ctx.fillStyle = "rgba(255,210,74,0.25)";
  ctx.beginPath();
  ctx.arc(x + TILE / 2, y + 14, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a4f00";
  ctx.fillRect(Math.round(x + TILE / 2 - w / 2), y + 6, w, 16);
  ctx.fillStyle = "#ffd24a";
  ctx.fillRect(Math.round(x + TILE / 2 - w / 2 + 1), y + 7, w - 2, 14);
  ctx.fillStyle = "#fff5b0";
  ctx.fillRect(x + TILE / 2 - 1, y + 9, 2, 10);
}

// ─── Question block ──────────────────────────────────────────────
export function drawQuestionBlock(ctx: CanvasRenderingContext2D, x: number, y: number, opened: boolean, pulse: number, pal: Level["palette"]) {
  const yy = y + (opened ? 0 : Math.sin(pulse) * 1.5);
  ctx.fillStyle = opened ? pal.brickShade : pal.accentDim;
  ctx.fillRect(x, yy, TILE, TILE);
  ctx.fillStyle = opened ? pal.brick : pal.accent;
  ctx.fillRect(x, yy, TILE, 4);
  ctx.fillRect(x, yy, 4, TILE);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x, yy + TILE - 3, TILE, 3);
  ctx.fillRect(x + TILE - 3, yy, 3, TILE);
  if (!opened) {
    ctx.fillStyle = "#1a0f00";
    ctx.font = "bold 18px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x + TILE / 2, yy + TILE / 2 + 1);
  }
}

// ─── NPC ──────────────────────────────────────────────────────────
export function drawNpc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hue: number,
  bob: number,
  near: boolean,
  portrait: "founder" | "investor" | "tenant" | "engineer" | "celeb" | "client" | "fan" = "founder",
) {
  // Pixel-snap and remove sub-pixel sinusoidal bob — was the main "vibrating" cause.
  x = Math.round(x);
  y = Math.round(y);
  const yy = y; // no bob
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(x + TILE / 2, y + 30, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs (per-portrait pant color)
  const pant =
    portrait === "investor" ? "#2c3a5c" :
    portrait === "celeb" ? "#5a2070" :
    portrait === "engineer" ? "#3a3a3a" :
    portrait === "tenant" ? "#604030" :
    portrait === "client" ? "#1a1a2e" :
    portrait === "fan" ? "#2a4a2a" :
    "#222";
  ctx.fillStyle = pant;
  ctx.fillRect(x + 8, yy + 26, 5, 4);
  ctx.fillRect(x + 15, yy + 26, 5, 4);

  // body
  ctx.fillStyle = `hsl(${hue}, 65%, 42%)`;
  ctx.fillRect(x + 6, yy + 14, 16, 14);
  ctx.fillStyle = `hsl(${hue}, 60%, 28%)`;
  ctx.fillRect(x + 6, yy + 14, 16, 3);
  // collar v
  ctx.fillStyle = `hsl(${hue}, 50%, 22%)`;
  ctx.fillRect(x + 12, yy + 15, 4, 3);

  // accessory torso
  if (portrait === "investor") {
    // tie
    ctx.fillStyle = `hsl(${(hue + 60) % 360}, 70%, 55%)`;
    ctx.fillRect(x + 13, yy + 17, 2, 9);
  } else if (portrait === "celeb") {
    // necklace / mic line
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(x + 11, yy + 17, 6, 1);
  } else if (portrait === "engineer") {
    // badge
    ctx.fillStyle = "#7cffb1";
    ctx.fillRect(x + 8, yy + 17, 2, 2);
  }

  // head
  ctx.fillStyle = "#f0c8a0";
  ctx.fillRect(x + 8, yy + 4, 12, 12);
  // hair (per-portrait silhouette)
  ctx.fillStyle = `hsl(${hue}, 30%, 15%)`;
  if (portrait === "celeb") {
    // long flowing
    ctx.fillRect(x + 7, yy + 3, 14, 6);
    ctx.fillRect(x + 6, yy + 6, 2, 6);
    ctx.fillRect(x + 20, yy + 6, 2, 6);
  } else if (portrait === "fan") {
    // beanie
    ctx.fillStyle = `hsl(${(hue + 120) % 360}, 60%, 45%)`;
    ctx.fillRect(x + 7, yy + 2, 14, 5);
    ctx.fillRect(x + 12, yy + 0, 4, 2);
  } else if (portrait === "tenant") {
    // cap brim
    ctx.fillStyle = `hsl(${hue}, 35%, 22%)`;
    ctx.fillRect(x + 7, yy + 4, 14, 3);
    ctx.fillRect(x + 5, yy + 5, 4, 2);
  } else {
    // standard parted
    ctx.fillRect(x + 8, yy + 4, 12, 4);
    ctx.fillRect(x + 7, yy + 5, 1, 3);
    ctx.fillRect(x + 20, yy + 5, 1, 3);
  }

  // eyes — small blink
  const blink = Math.floor(bob * 30) % 120 < 4;
  ctx.fillStyle = "#000";
  if (blink) {
    ctx.fillRect(x + 11, yy + 11, 2, 1);
    ctx.fillRect(x + 16, yy + 11, 2, 1);
  } else {
    ctx.fillRect(x + 11, yy + 10, 2, 2);
    ctx.fillRect(x + 16, yy + 10, 2, 2);
  }
  // smile
  ctx.fillRect(x + 13, yy + 13, 3, 1);
  // glasses for engineer
  if (portrait === "engineer") {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10.5, yy + 9.5, 3, 3);
    ctx.strokeRect(x + 15.5, yy + 9.5, 3, 3);
  }

  // arms
  ctx.fillStyle = "#f0c8a0";
  ctx.fillRect(x + 4, yy + 16, 3, 6);
  ctx.fillRect(x + 21, yy + 16, 3, 6);

  // hand-held accessory
  if (portrait === "celeb") {
    // mic
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 22, yy + 14, 2, 6);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(x + 21, yy + 12, 4, 3);
  } else if (portrait === "engineer") {
    // laptop
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(x + 0, yy + 19, 6, 4);
    ctx.fillStyle = "#7cffb1";
    ctx.fillRect(x + 1, yy + 20, 4, 2);
  } else if (portrait === "investor") {
    // briefcase
    ctx.fillStyle = "#5a3414";
    ctx.fillRect(x + 0, yy + 18, 5, 6);
    ctx.fillStyle = "#a0613a";
    ctx.fillRect(x + 0, yy + 18, 5, 1);
  } else if (portrait === "fan") {
    // sneaker box
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 0, yy + 19, 5, 4);
    ctx.fillStyle = "#ff5b6e";
    ctx.fillRect(x + 0, yy + 19, 5, 1);
  } else if (portrait === "tenant") {
    // mug
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 22, yy + 18, 3, 4);
    ctx.fillRect(x + 25, yy + 19, 1, 2);
  }

  if (near) {
    const a = (Math.sin(bob * 4) + 1) * 0.5;
    ctx.globalAlpha = 0.5 + a * 0.5;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("!", x + TILE / 2, yy - 3 - a * 2);
    ctx.globalAlpha = 1;
  }
}

// ─── Per-chapter ambient mid-layer storytelling props ────────────
export function drawAmbient(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  camX: number,
  t: number,
  levelId: string,
  pal: Level["palette"],
) {
  const baseY = H - TILE * 4;
  const off = (camX * 0.45) % 220;
  if (levelId === "origin") {
    // distant temple silhouette + golden window
    for (let i = -1; i < W / 220 + 2; i++) {
      const x = i * 220 - off;
      ctx.fillStyle = pal.brickShade;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + 20, baseY - 50);
      ctx.lineTo(x + 40, baseY - 70);
      ctx.lineTo(x + 60, baseY - 50);
      ctx.lineTo(x + 80, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x + 36, baseY - 40, 8, 8);
      ctx.globalAlpha = 1;
    }
  } else if (levelId === "sole") {
    // STREETWEAR: neon billboard + hanging-laces sneaker + graffiti SOLE tag
    for (let i = -1; i < W / 280 + 2; i++) {
      const x = i * 280 - off;
      const pulse = (Math.sin(t * 3 + i) + 1) * 0.5;
      // billboard
      ctx.fillStyle = pal.brickShade;
      ctx.fillRect(x, baseY - 130, 76, 56);
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.fillRect(x + 5, baseY - 125, 66, 46);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px 'Press Start 2P', monospace";
      ctx.fillText("DROP", x + 14, baseY - 105);
      ctx.fillText("TODAY", x + 10, baseY - 90);
      ctx.globalAlpha = 1;
      // streetlamp + hanging sneaker on laces
      ctx.fillStyle = "#222";
      ctx.fillRect(x + 110, baseY - 100, 3, 100);
      ctx.fillRect(x + 110, baseY - 100, 30, 3);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(x + 130, baseY - 97);
      ctx.lineTo(x + 130, baseY - 60 + Math.sin(t + i) * 2);
      ctx.stroke();
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x + 124, baseY - 60 + Math.sin(t + i) * 2, 14, 6);
      ctx.fillRect(x + 122, baseY - 56 + Math.sin(t + i) * 2, 18, 4);
      // graffiti SOLE tag
      ctx.fillStyle = "#ff5b6e";
      ctx.font = "bold 18px 'Press Start 2P', monospace";
      ctx.globalAlpha = 0.55;
      ctx.fillText("SOLE", x + 170, baseY - 30);
      ctx.globalAlpha = 1;
    }
  } else if (levelId === "ccd") {
    // STAGE: spotlight cones + DJ booth + dancing crowd silhouettes + EQ bars
    for (let i = -1; i < W / 240 + 2; i++) {
      const x = i * 240 - off + 80;
      const sweep = Math.sin(t * 0.8 + i) * 30;
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 50 + sweep, baseY);
      ctx.lineTo(x + 50 + sweep, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // DJ booth + EQ bars
    for (let i = -1; i < W / 320 + 2; i++) {
      const x = i * 320 - off + 40;
      ctx.fillStyle = "#1a0a2a";
      ctx.fillRect(x, baseY - 36, 70, 36);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x, baseY - 36, 70, 3);
      // turntables
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(x + 16, baseY - 22, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 54, baseY - 22, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x + 15, baseY - 23, 2, 2);
      ctx.fillRect(x + 53, baseY - 23, 2, 2);
      // EQ bars above booth
      for (let b = 0; b < 12; b++) {
        const h = 4 + Math.abs(Math.sin(t * 4 + b * 0.7 + i)) * 28;
        ctx.fillStyle = pal.accent;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x + 4 + b * 5, baseY - 36 - h, 3, h);
      }
      ctx.globalAlpha = 1;
      // crowd silhouettes
      for (let c = 0; c < 8; c++) {
        const cx = x - 30 + c * 14;
        const bob = Math.sin(t * 2.5 + c) * 2;
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(cx, baseY - 14 + bob, 6, 14);
        ctx.beginPath();
        ctx.arc(cx + 3, baseY - 16 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // paper birds flock
    for (let i = 0; i < 6; i++) {
      const px = ((i * 130 - camX * 0.5 + t * 35) % (W + 60)) - 30;
      const py = 70 + Math.sin(t * 1.2 + i * 0.7) * 16;
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 8, py - 4);
      ctx.lineTo(px + 16, py);
      ctx.lineTo(px + 8, py + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (levelId === "grp") {
    // PRICE COMPARISON: chalkboard ticker + price-tag bunting + SALE billboard
    for (let i = 0; i < 14; i++) {
      const px = ((i * 180 - camX * 0.3 + t * 12) % (W + 40)) - 20;
      const py = baseY - 40 - ((i * 23) % 70);
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.55;
      ctx.font = "bold 12px 'DM Mono', monospace";
      ctx.fillText("₹", px, py);
    }
    ctx.globalAlpha = 1;
    // bunting
    for (let i = -1; i < W / 200 + 2; i++) {
      const x = i * 200 - off;
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(x, baseY - 110);
      ctx.bezierCurveTo(x + 60, baseY - 100, x + 140, baseY - 100, x + 200, baseY - 110);
      ctx.stroke();
      const colors = ["#ff5b6e", "#ffd24a", pal.accent, "#7cffb1"];
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = colors[j % colors.length];
        const tx = x + 16 + j * 22;
        ctx.beginPath();
        ctx.moveTo(tx, baseY - 105);
        ctx.lineTo(tx + 10, baseY - 105);
        ctx.lineTo(tx + 5, baseY - 95);
        ctx.closePath();
        ctx.fill();
      }
    }
    // SALE billboard
    const salePulse = (Math.sin(t * 4) + 1) * 0.5;
    ctx.fillStyle = "#1a0a02";
    ctx.fillRect(W - 120, baseY - 90, 90, 36);
    ctx.fillStyle = "#ff5b6e";
    ctx.globalAlpha = 0.6 + salePulse * 0.4;
    ctx.fillRect(W - 116, baseY - 86, 82, 28);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("SALE", W - 102, baseY - 66);
    ctx.globalAlpha = 1;
  } else if (levelId === "hab") {
    // HOUSING: laundry line + FOR RENT yard signs + apartment block
    for (let i = -1; i < W / 200 + 2; i++) {
      const x = i * 200 - off;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, baseY - 80);
      ctx.bezierCurveTo(x + 60, baseY - 70, x + 120, baseY - 70, x + 180, baseY - 80);
      ctx.stroke();
      const colors = ["#ff6f8a", "#7cffb1", pal.accent, "#a8b5ff"];
      for (let j = 0; j < 5; j++) {
        ctx.fillStyle = colors[j % colors.length];
        ctx.fillRect(x + 30 + j * 30, baseY - 78, 8, 12);
      }
      // FOR RENT yard sign
      ctx.fillStyle = "#5a3414";
      ctx.fillRect(x + 90, baseY - 22, 2, 22);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 80, baseY - 36, 22, 16);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x + 80, baseY - 36, 22, 3);
      ctx.fillStyle = "#000";
      ctx.font = "bold 5px 'Press Start 2P', monospace";
      ctx.fillText("RENT", x + 84, baseY - 24);
    }
  } else if (levelId === "ai") {
    // CONVERSATIONAL AI: scrolling code + chat bubbles + LIVE dot
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.4;
    ctx.font = "8px monospace";
    for (let i = 0; i < 30; i++) {
      const px = ((i * 90 - camX * 0.15 + t * 30) % (W + 20)) - 10;
      const py = 24 + (i * 17) % (H * 0.5);
      const ch = "10█01░"[i % 6];
      ctx.fillText(ch, px, py);
    }
    ctx.globalAlpha = 1;
    // floating chat bubbles
    for (let i = 0; i < 5; i++) {
      const px = ((i * 220 - camX * 0.4 + t * 20) % (W + 60)) - 30;
      const py = 80 + Math.sin(t + i) * 10 + (i % 2) * 24;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(px, py, 36, 14);
      ctx.fillRect(px + 4, py + 14, 4, 4);
      ctx.fillStyle = "#1a1a2e";
      for (let d = 0; d < 3; d++) ctx.fillRect(px + 8 + d * 8, py + 6, 3, 3);
    }
    // LIVE pulse dot
    const live = (Math.sin(t * 3) + 1) * 0.5;
    ctx.fillStyle = "#ff3a4a";
    ctx.globalAlpha = 0.5 + live * 0.5;
    ctx.beginPath(); ctx.arc(20, 40, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.fillText("LIVE", 30, 44);
  } else if (levelId === "investopad") {
    // VC / pitches: drifting slides + whiteboard with sticky notes + cap-table
    for (let i = 0; i < 5; i++) {
      const px = ((i * 280 - camX * 0.2 + t * 8) % (W + 80)) - 40;
      const py = 60 + Math.sin(t * 0.4 + i) * 8 + (i % 2) * 30;
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.85;
      ctx.fillRect(px, py, 60, 36);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(px, py, 60, 4);
      ctx.fillStyle = "#000";
      ctx.fillRect(px + 4, py + 10, 30, 2);
      ctx.fillRect(px + 4, py + 16, 40, 2);
      ctx.fillRect(px + 4, py + 22, 24, 2);
    }
    ctx.globalAlpha = 1;
    // whiteboard with sticky notes
    for (let i = -1; i < W / 320 + 2; i++) {
      const x = i * 320 - off;
      ctx.fillStyle = "#f0e8d4";
      ctx.fillRect(x, baseY - 80, 90, 50);
      ctx.fillStyle = "#5a3414";
      ctx.fillRect(x - 2, baseY - 82, 94, 3);
      const stickyColors = ["#ffd24a", "#ff8c6b", "#7cffb1", "#a8b5ff"];
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = stickyColors[s % stickyColors.length];
        ctx.fillRect(x + 6 + (s % 3) * 26, baseY - 74 + Math.floor(s / 3) * 22, 18, 16);
      }
    }
  } else if (levelId === "home") {
    // PROLOGUE: bedroom — CRT glow, books, guitar
    for (let i = -1; i < W / 260 + 2; i++) {
      const x = i * 260 - off + 40;
      // shelf
      ctx.fillStyle = "#5a3414";
      ctx.fillRect(x, baseY - 70, 80, 4);
      // books
      const colors = ["#ff5b6e", "#a8b5ff", "#ffd24a", "#7cffb1", pal.accent];
      for (let b = 0; b < 7; b++) {
        ctx.fillStyle = colors[b % colors.length];
        ctx.fillRect(x + 4 + b * 10, baseY - 88, 8, 18);
      }
      // CRT
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 100, baseY - 30, 30, 26);
      ctx.fillStyle = pal.accent;
      ctx.globalAlpha = 0.5 + Math.sin(t * 5) * 0.2;
      ctx.fillRect(x + 102, baseY - 28, 26, 22);
      ctx.globalAlpha = 1;
    }
  }
}


// ─── Mini-game prop (chapter-themed in-world object) ──────────────
export function drawMinigame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pulse: number,
  pal: Level["palette"],
  near: boolean,
  kind: string = "arcade",
) {
  const bob = Math.sin(pulse) * 1.2;
  ctx.save();
  ctx.translate(x + TILE / 2, y + TILE);

  if (kind === "price-match") {
    // Market stall: striped awning + crate + price tag
    ctx.fillStyle = "#5a3414";
    ctx.fillRect(-14, -28, 28, 4);             // awning beam
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 ? "#fff" : pal.accent;
      ctx.fillRect(-14 + i * 4, -32, 4, 4);    // awning stripes
    }
    ctx.fillStyle = "#7a4222";
    ctx.fillRect(-12, -24, 24, 16);            // crate
    ctx.fillStyle = "#a0613a";
    ctx.fillRect(-12, -24, 24, 3);
    // fruit
    ctx.fillStyle = "#d23838";
    ctx.fillRect(-9, -22, 5, 5);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(-2, -22, 5, 5);
    ctx.fillStyle = "#7cffb1";
    ctx.fillRect(5, -22, 5, 5);
    // price tag
    ctx.fillStyle = "#fff";
    ctx.fillRect(8, -32 + bob, 8, 6);
    ctx.fillStyle = "#000";
    ctx.font = "bold 5px monospace";
    ctx.textAlign = "center";
    ctx.fillText("₹", 12, -27 + bob);
  } else if (kind === "stack-blocks") {
    // Apartment door / building stack
    ctx.fillStyle = pal.brickShade;
    ctx.fillRect(-12, -32, 24, 32);
    ctx.fillStyle = pal.brick;
    ctx.fillRect(-12, -32, 24, 4);
    // windows
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 2; c++) {
        ctx.fillStyle = pal.accent;
        ctx.globalAlpha = 0.6 + Math.sin(pulse + r + c) * 0.3;
        ctx.fillRect(-9 + c * 11, -26 + r * 10, 7, 6);
      }
    ctx.globalAlpha = 1;
    // door
    ctx.fillStyle = "#1a0a02";
    ctx.fillRect(-4, -8, 8, 8);
  } else if (kind === "chat-match") {
    // Server rack / monitor with speech bubble
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-12, -26, 24, 22);
    ctx.fillStyle = pal.accent;
    for (let i = 0; i < 4; i++) {
      const blip = (Math.sin(pulse * 3 + i) + 1) * 0.5;
      ctx.globalAlpha = 0.4 + blip * 0.6;
      ctx.fillRect(-9, -22 + i * 5, 18, 2);
    }
    ctx.globalAlpha = 1;
    // chat bubble above
    ctx.fillStyle = "#fff";
    ctx.fillRect(-8, -38 + bob, 16, 8);
    ctx.fillRect(-2, -30 + bob, 4, 3);
    ctx.fillStyle = "#000";
    ctx.fillRect(-5, -35 + bob, 2, 2);
    ctx.fillRect(-1, -35 + bob, 2, 2);
    ctx.fillRect(3, -35 + bob, 2, 2);
  } else if (kind === "pick-unicorn") {
    // Mini horn/star pedestal — Investopad pick
    ctx.fillStyle = pal.brick;
    ctx.fillRect(-10, -8, 20, 8);
    ctx.fillStyle = pal.brickShade;
    ctx.fillRect(-10, -2, 20, 2);
    // star above
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-2, -22 + bob, 4, 4);
    ctx.fillRect(-6, -18 + bob, 12, 4);
    ctx.fillRect(-4, -14 + bob, 8, 4);
    ctx.fillRect(-6, -10 + bob, 3, 3);
    ctx.fillRect(3, -10 + bob, 3, 3);
  } else if (kind === "spot-fake") {
    // Sneaker shelf
    ctx.fillStyle = "#5a3414";
    ctx.fillRect(-14, -10, 28, 3);
    ctx.fillRect(-14, -22, 28, 3);
    // two shoes
    for (let i = 0; i < 2; i++) {
      const sx = -10 + i * 12;
      ctx.fillStyle = pal.accent;
      ctx.fillRect(sx, -16, 8, 4);
      ctx.fillRect(sx - 1, -14, 10, 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(sx + 5, -13, 3, 1);
    }
    // glow if near
    ctx.fillStyle = withAlpha(pal.accent, 0.4);
    ctx.fillRect(-16, -28, 32, 2);
  } else if (kind === "rhythm-tap") {
    // Mic stand + amp
    ctx.fillStyle = "#222";
    ctx.fillRect(-2, -24, 4, 24);
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(0, -28 + bob, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillRect(-2, -28 + bob, 4, 4);
    // amp box
    ctx.fillStyle = pal.brick;
    ctx.fillRect(-12, -10, 8, 10);
    ctx.fillStyle = pal.brickShade;
    ctx.beginPath();
    ctx.arc(-8, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Newsstand fallback (paramx) / generic
    ctx.fillStyle = "#5a3414";
    ctx.fillRect(-14, -8, 28, 8);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-12, -22, 24, 14);
    ctx.fillStyle = pal.brick;
    ctx.fillRect(-12, -22, 24, 3);
    // headline lines
    ctx.fillStyle = "#000";
    ctx.fillRect(-10, -16, 20, 1);
    ctx.fillRect(-10, -14, 14, 1);
    ctx.fillRect(-10, -12, 18, 1);
    // banner
    ctx.fillStyle = pal.accent;
    ctx.fillRect(-10, -19, 20, 2);
  }
  ctx.restore();

  if (near) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("E PLAY", x + TILE / 2, y - 4);
  }
}

// ─── Hidden secret pipe ───────────────────────────────────────────
export function drawSecret(ctx: CanvasRenderingContext2D, x: number, y: number, pal: Level["palette"], near: boolean) {
  ctx.fillStyle = pal.pipeShade;
  ctx.fillRect(x, y + 6, TILE, TILE - 6);
  ctx.fillStyle = pal.pipe;
  ctx.fillRect(x + 2, y + 6, TILE - 4, 6);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 6, y + 12, TILE - 12, 8);
  // sparkles
  if (!near) {
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 4, y + 2, 2, 2);
    ctx.fillRect(x + TILE - 6, y + 4, 2, 2);
    ctx.globalAlpha = 1;
  }
  if (near) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("↓", x + TILE / 2, y - 2);
  }
}

// ─── Player (Param) — silky-smooth idle, scarf trail, soft halo
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: number,
  walkFrame: number,
  inAir: boolean,
  charging: number,        // 0..1
  squash: number,          // 0..1
  blinkTick: number,
  doubleJumpFx: number,
) {
  // Snap to integer pixel — kills sub-pixel shimmer entirely.
  x = Math.round(x);
  y = Math.round(y);

  // Soft contact shadow — pixel-aligned strip, no AA shimmer
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x + 2, y + 32, 18, 2);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x, y + 34, 22, 1);

  // double-jump ring
  if (doubleJumpFx > 0) {
    const t = doubleJumpFx / 14;
    ctx.strokeStyle = `rgba(255,255,255,${t})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 11, y + 28, (1 - t) * 18 + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // squash transform — only apply when actually squashing, and quantise to
  // 1/8 px steps so interior fillRects don't shimmer between sub-pixels.
  const animating = !inAir && walkFrame > 0;
  const useSquash = squash > 0.05;
  const sxRaw = 1 + squash * 0.14;
  const syRaw = 1 - squash * 0.18;
  const sx = Math.round(sxRaw * 8) / 8;
  const sy = Math.round(syRaw * 8) / 8;
  ctx.save();
  if (useSquash) {
    ctx.translate(x + 11, y + 32);
    ctx.scale(facing < 0 ? -sx : sx, sy);
    ctx.translate(-11, -32);
  } else {
    if (facing < 0) {
      // Integer pre-translate keeps the mirror axis on a whole pixel.
      ctx.translate(x + 22, y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x, y);
    }
  }

  // hat brim
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 2, 22, 3);
  // hat top (charge tint)
  ctx.fillStyle = charging > 0
    ? `rgb(${Math.round(255 - charging * 80)},${Math.round(80 + charging * 80)},${Math.round(80 - charging * 30)})`
    : "#22223a";
  ctx.fillRect(4, 0, 14, 4);
  // hat band accent
  ctx.fillStyle = "#ffd24a";
  ctx.fillRect(4, 4, 14, 1);

  // face
  ctx.fillStyle = "#f0c8a0";
  ctx.fillRect(4, 5, 14, 11);
  // face shadow side
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(15, 6, 3, 9);
  // beard
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(4, 14, 14, 3);
  // eye (blink ~ every 90 frames, 4 frames closed)
  const blinking = blinkTick > 0 && (blinkTick % 90) < 4;
  ctx.fillStyle = "#000";
  if (blinking) ctx.fillRect(12, 11, 4, 1);
  else ctx.fillRect(12, 9, 3, 3);
  // tiny highlight
  ctx.fillStyle = "#fff";
  if (!blinking) ctx.fillRect(13, 9, 1, 1);

  // scarf — trails on movement (integer-snapped wave)
  ctx.fillStyle = "#c84a4a";
  if (animating) {
    const wave = Math.round((walkFrame % 4) - 1.5);
    ctx.fillRect(2 + wave, 16, 3, 6);
  }
  ctx.fillRect(2, 15, 4, 4);

  // body (jacket)
  ctx.fillStyle = "#c84a4a";
  ctx.fillRect(2, 17, 18, 11);
  // jacket trim
  ctx.fillStyle = "#fff";
  ctx.fillRect(10, 17, 2, 11);
  // shoulder shading
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(2, 17, 18, 2);
  // belt
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(2, 26, 18, 2);
  ctx.fillStyle = "#ffd24a";
  ctx.fillRect(10, 26, 2, 2);

  // legs
  ctx.fillStyle = "#1a1a2e";
  if (inAir) {
    ctx.fillRect(3, 28, 6, 5);
    ctx.fillRect(13, 28, 6, 5);
  } else if (!animating) {
    // perfectly still idle pose — no leg flicker
    ctx.fillRect(4, 28, 6, 5);
    ctx.fillRect(12, 28, 6, 5);
  } else {
    const f = walkFrame % 4;
    if (f === 0) {
      ctx.fillRect(3, 28, 6, 5);
      ctx.fillRect(13, 28, 6, 5);
    } else if (f === 1) {
      ctx.fillRect(2, 28, 6, 5);
      ctx.fillRect(14, 28, 6, 5);
    } else if (f === 2) {
      ctx.fillRect(4, 28, 6, 5);
      ctx.fillRect(12, 28, 6, 5);
    } else {
      ctx.fillRect(5, 28, 6, 5);
      ctx.fillRect(11, 28, 6, 5);
    }
  }
  ctx.restore();

  // charge meter above head
  if (charging > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 2, y - 8, 28, 4);
    ctx.fillStyle = "#ffd24a";
    ctx.fillRect(x - 2, y - 8, 28 * charging, 4);
  }
}

// ─── Wooden signpost (chapter gate) ───────────────────────────────
export function drawSignpost(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  pal: Level["palette"],
  label: string,
  number: number | string,
) {
  const baseY = groundY;
  // post
  ctx.fillStyle = "#5a3414";
  ctx.fillRect(x - 3, baseY - 56, 6, 56);
  // sign plank
  ctx.fillStyle = "#a0613a";
  ctx.fillRect(x - 36, baseY - 60, 72, 22);
  ctx.fillStyle = "#7a4222";
  ctx.fillRect(x - 36, baseY - 42, 72, 4);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 33, baseY - 49, 66, 1);
  // accent ribbon
  ctx.fillStyle = pal.accent;
  ctx.fillRect(x - 36, baseY - 60, 72, 3);
  // text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`W ${number}`, x, baseY - 53);
  ctx.fillStyle = pal.accent;
  ctx.font = "bold 7px 'Press Start 2P', monospace";
  ctx.fillText(label.toUpperCase().slice(0, 12), x, baseY - 44);
  // hanging lantern
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 30, baseY - 60, 1, 8);
  ctx.fillStyle = pal.accent;
  ctx.fillRect(x + 27, baseY - 52, 7, 7);
  ctx.fillStyle = "rgba(255,255,200,0.25)";
  ctx.beginPath();
  ctx.arc(x + 30, baseY - 48, 18, 0, Math.PI * 2);
  ctx.fill();
}

// waterfall in chapter transition
export function drawWaterfall(ctx: CanvasRenderingContext2D, x: number, t: number) {
  const top = (ROWS - 4) * TILE - 60;
  const bottom = (ROWS - 4) * TILE;
  ctx.fillStyle = "rgba(180,220,255,0.7)";
  ctx.fillRect(x - 4, top, 8, bottom - top);
  ctx.fillStyle = "rgba(220,240,255,0.85)";
  for (let i = 0; i < 4; i++) {
    const yy = top + ((t * 60 + i * 18) % (bottom - top));
    ctx.fillRect(x - 3, yy, 6, 6);
  }
  // splash
  ctx.fillStyle = "rgba(220,240,255,0.6)";
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI;
    ctx.fillRect(x - 8 + Math.cos(ang) * 10, bottom - 4 + Math.sin(t * 4 + i) * 2, 3, 3);
  }
}

// hopping bird that perches on platforms
export function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, hue: number) {
  const hop = Math.abs(Math.sin(t * 2)) * 3;
  const yy = y - hop;
  ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
  ctx.fillRect(x, yy, 6, 4);
  ctx.fillRect(x + 5, yy - 1, 3, 3);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 6, yy, 1, 1);
  // beak
  ctx.fillStyle = "#ffaa33";
  ctx.fillRect(x + 8, yy + 1, 1, 1);
  // legs
  ctx.fillStyle = "#222";
  ctx.fillRect(x + 1, yy + 4, 1, 2);
  ctx.fillRect(x + 4, yy + 4, 1, 2);
}

// ─── HUD overlay drawn on canvas: chapter title flash ─────────────
export function drawChapterToast(
  ctx: CanvasRenderingContext2D,
  W: number,
  text: string,
  era: string,
  alpha: number,
  accent: string,
) {
  if (alpha <= 0) return;
  const small = Math.max(8, Math.min(12, W / 30));
  const big = Math.max(14, Math.min(24, W / 14));
  const bandH = small + big + 30;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 40, W, bandH);
  ctx.fillStyle = accent;
  ctx.font = `bold ${Math.round(small)}px 'Press Start 2P', monospace`;
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, 56 + small);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.round(big)}px 'Playfair Display', serif`;
  ctx.fillText(era, W / 2, 56 + small + big + 8);
  ctx.globalAlpha = 1;
}

// ─── CRT scanlines + vignette ─────────────────────────────────────
export function drawScanlines(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// ─── End Garden signposts ────────────────────────────────────────
export function drawEndPost(ctx: CanvasRenderingContext2D, x: number, groundY: number, label: string, accent: string) {
  ctx.fillStyle = "#4a2812";
  ctx.fillRect(x - 2, groundY - 44, 4, 44);
  ctx.fillStyle = "#a0613a";
  ctx.fillRect(x - 30, groundY - 48, 60, 18);
  ctx.fillStyle = accent;
  ctx.fillRect(x - 30, groundY - 48, 60, 3);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, groundY - 38);
}

// shared chapter helpers re-exported
export type { Chapter, GateE, World };
