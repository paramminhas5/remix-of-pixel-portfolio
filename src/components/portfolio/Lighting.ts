// Cinematic post-FX: vignette, soft player glow, dynamic sun arc.

import { withAlpha } from "./sprites";

// Soft vignette — darker than the CRT one, more painterly.
export function drawVignette(ctx: CanvasRenderingContext2D, W: number, H: number, intensity = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.95);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${intensity})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Warm radial glow around the player — a gentle "lantern".
export function drawPlayerGlow(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  accent: string,
  intensity = 0.45,
) {
  const cx = Math.round(px);
  const cy = Math.round(py);
  const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 110);
  g.addColorStop(0, withAlpha(accent, intensity));
  g.addColorStop(0.5, withAlpha(accent, intensity * 0.25));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(cx - 120, cy - 120, 240, 240);
  ctx.restore();
}

// Color-grade overlay (multiplies a tint over the scene).
export function drawColorGrade(ctx: CanvasRenderingContext2D, W: number, H: number, tint: string, alpha = 0.08) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = withAlpha(tint, alpha);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Sun/moon position based on chapter index (0..7) — drifts across sky.
export function sunPosition(chapterIndex: number, totalChapters: number, W: number, H: number) {
  const t = totalChapters > 1 ? chapterIndex / (totalChapters - 1) : 0.5;
  const x = W * (0.15 + t * 0.7);
  // arc: high in middle, low at start/end
  const y = H * (0.4 - Math.sin(t * Math.PI) * 0.22);
  // moon after halfway
  const isMoon = t > 0.65;
  return { x, y, isMoon, t };
}
