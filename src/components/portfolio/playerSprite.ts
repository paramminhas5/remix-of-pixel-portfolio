// Loads the AI-generated 4-frame sprite sheet (256x64, 4 cells of 64x64) and
// exposes a draw function. Falls back to the in-code pixel character drawn by
// drawPlayer in sprites.ts if the image fails to load.
import sheetUrl from "@/assets/player-sheet.png";

const CELL = 64; // source cell
// Render at 36px tall (world body is ~32 — leave a bit of overhang for the head).
const RENDER_H = 40;

let img: HTMLImageElement | null = null;
let loaded = false;
let failed = false;

function ensureImg() {
  if (img || failed) return;
  if (typeof window === "undefined") return;
  img = new Image();
  img.onload = () => {
    loaded = true;
  };
  img.onerror = () => {
    failed = true;
  };
  img.src = sheetUrl;
}

/** True once the bitmap is decoded and safe to draw. */
export function spriteReady() {
  ensureImg();
  return loaded && !failed;
}

/**
 * Draw the new player sprite anchored bottom-center to the body's foot.
 * Frame mapping: 0 idle · 1 walk-A · 2 walk-B · 3 jump.
 */
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number, // body top-left in canvas pixels
  bodyW: number,
  bodyH: number,
  facing: number,
  walkFrame: number,
  inAir: boolean,
) {
  if (!loaded || !img) return;
  let frame: number;
  if (inAir) frame = 3;
  else if (walkFrame > 0) frame = (walkFrame % 2 === 0 ? 1 : 2);
  else frame = 0;

  const sx = frame * CELL;
  const renderW = RENDER_H; // square cells
  // Anchor bottom-center to feet
  const dx = Math.round(x + bodyW / 2 - renderW / 2);
  const dy = Math.round(y + bodyH - RENDER_H + 2);

  ctx.imageSmoothingEnabled = false;
  ctx.save();
  if (facing < 0) {
    ctx.translate(dx + renderW, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, 0, CELL, CELL, 0, 0, renderW, RENDER_H);
  } else {
    ctx.drawImage(img, sx, 0, CELL, CELL, dx, dy, renderW, RENDER_H);
  }
  ctx.restore();
}
