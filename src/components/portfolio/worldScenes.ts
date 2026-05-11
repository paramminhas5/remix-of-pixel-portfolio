// Per-world scenery — ports the v7 HTML set pieces (CRT monitors, shoe
// shelves, vinyl, server racks, autos, etc.) and pushes them with extra
// parallax + lighting. Drawn as a layer between the parallax bg and the
// tile grid in Level.tsx.
//
// Coords: every scene draws in world-space; caller provides camX so the
// scene scrolls with the player. groundY = top of the ground row in
// canvas pixels.
import { TILE, ROWS } from "./data";

type SceneCtx = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  camX: number;
  t: number; // seconds
  groundY: number;
  startX: number; // chapter start in world pixels
  endX: number; // chapter end in world pixels
  accent: string;
  playerX: number;
  playerVx: number;
  walking: boolean;
};

// safe gradient helpers
function rg(ctx: CanvasRenderingContext2D, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
  if ([x1, y1, r1, x2, y2, r2].some((v) => !isFinite(v) || isNaN(v)) || r1 < 0 || r2 <= 0) return null;
  try { return ctx.createRadialGradient(x1, y1, r1, x2, y2, r2); } catch { return null; }
}
function lg(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  if ([x1, y1, x2, y2].some((v) => !isFinite(v) || isNaN(v))) return null;
  try { return ctx.createLinearGradient(x1, y1, x2, y2); } catch { return null; }
}

// ─── ORIGIN — Bengaluru rooftop ─────────────────────────────────
function drawOrigin(s: SceneCtx) {
  const { ctx, W, H, camX, t, groundY, startX, endX, accent } = s;
  // 3-band parallax cityscape silhouettes
  const bands: Array<[number, [string, string]]> = [
    [0.10, ["#1e1438", "#140e28"]],
    [0.25, ["#2a1a55", "#180f3a"]],
    [0.45, ["#3a225a", "#1c1240"]],
  ];
  bands.forEach(([sp, cols], li) => {
    for (let i = 0; i < 28; i++) {
      const baseX = startX + i * 64 + li * 30;
      const bx = baseX - camX * sp;
      if (bx < -120 || bx > W + 120) continue;
      const bh = (44 + ((i * 37) % 130)) * (li * 0.45 + 0.7);
      const bw = 28 + ((i * 19) % 55);
      ctx.fillStyle = cols[i % 2];
      ctx.fillRect(bx, groundY - bh, bw, bh);
      if (li === 2) {
        ctx.fillStyle = accent + "33";
        for (let wy = groundY - bh + 10; wy < groundY - 10; wy += 16)
          for (let wx = bx + 5; wx < bx + bw - 5; wx += 12)
            if ((i + Math.floor(wx / 12) + Math.floor(wy / 16)) % 3 !== 0)
              ctx.fillRect(wx, wy, 7, 9);
      }
    }
  });
  // Pulsing moon — labelled "Bengaluru, India"
  const moonWx = startX + 520;
  const mx = moonWx - camX * 0.08;
  if (mx > -80 && mx < W + 80) {
    const dist = Math.abs(s.playerX - moonWx);
    const near = dist < 200;
    const pulse = near ? 1 + Math.sin(t * 4) * 0.06 : 1;
    ctx.fillStyle = "#ece8d8";
    ctx.beginPath(); ctx.arc(mx, 60, 26 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0a0820";
    ctx.beginPath(); ctx.arc(mx + 9, 56, 21 * pulse, 0, Math.PI * 2); ctx.fill();
    const mg = rg(ctx, mx, 60, 0, mx, 60, 100);
    if (mg) {
      mg.addColorStop(0, accent + "22"); mg.addColorStop(1, "transparent");
      ctx.fillStyle = mg; ctx.fillRect(mx - 100, 0, 200, H * 0.5);
    }
    if (near) {
      ctx.fillStyle = accent;
      ctx.font = "7px 'DM Mono', monospace"; ctx.textAlign = "center";
      ctx.fillText("BENGALURU, INDIA", mx, 100);
    }
  }
  // Clothesline
  const clWx = startX + 280;
  const cl = clWx - camX;
  if (cl > -260 && cl < W + 100) {
    ctx.strokeStyle = "#2a1545"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cl, groundY - 195); ctx.lineTo(cl + 210, groundY - 170); ctx.stroke();
    ["#9b59b6","#2ecc71","#e74c3c","#f39c12","#3498db","#e91e63"].forEach((c, i) => {
      const bob = Math.sin(t * 0.8 + i * 0.5) * 3;
      ctx.fillStyle = c + "aa";
      ctx.fillRect(cl + 22 + i * 32, groundY - 192 + i * 5 + bob, 15, 28);
    });
  }
  // Water tank
  const wt = startX + 760 - camX;
  if (wt > -100 && wt < W + 100) {
    ctx.fillStyle = "#1a0d2e"; ctx.fillRect(wt - 14, groundY - 232, 28, 58);
    ctx.fillStyle = "#231148"; ctx.fillRect(wt - 25, groundY - 246, 50, 18);
    ctx.fillStyle = "#2e175c"; ctx.fillRect(wt - 20, groundY - 268, 40, 24);
  }
  // Horizon glow
  const hg = lg(ctx, 0, groundY - 80, 0, groundY);
  if (hg) {
    hg.addColorStop(0, "transparent"); hg.addColorStop(1, accent + "20");
    ctx.fillStyle = hg; ctx.fillRect(0, groundY - 80, W, 80);
  }
  void endX;
}

// ─── GETRIGHTPRICE — internet café CRTs ─────────────────────────
function drawGRP(s: SceneCtx) {
  const { ctx, W, H, camX, t, groundY, startX, endX, accent, playerX } = s;
  // Faint green scanline overlay for the full chapter band
  ctx.fillStyle = "#00ff0010";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  // CRT row along the back wall
  const count = Math.max(4, Math.floor((endX - startX) / 200));
  for (let i = 0; i < count; i++) {
    const wx = startX + 80 + i * 200;
    const mx = wx - camX;
    if (mx < -140 || mx > W + 140) continue;
    const my = groundY - 90;
    const near = Math.abs(playerX - wx) < 160;
    // Desk
    ctx.fillStyle = "#0d1a0d"; ctx.fillRect(mx - 12, my + 2, 104, 14);
    // Monitor body
    ctx.fillStyle = "#baba9a"; ctx.fillRect(mx, my - 76, 80, 62);
    ctx.fillStyle = "#aaa"; ctx.fillRect(mx + 3, my - 73, 74, 56);
    // Screen
    ctx.fillStyle = "#000e00"; ctx.fillRect(mx + 7, my - 70, 66, 48);
    for (let sl = 0; sl < 48; sl += 3) {
      ctx.fillStyle = "#00000044"; ctx.fillRect(mx + 7, my - 70 + sl, 66, 1);
    }
    const blink = near ? Math.sin(t * 4 + i) > 0 : Math.sin(t * 2 + i) > 0;
    ctx.fillStyle = accent; ctx.font = "6px 'DM Mono', monospace"; ctx.textAlign = "left";
    ctx.fillText("GETRIGHTPRICE.COM", mx + 9, my - 58);
    ctx.fillStyle = blink ? accent : accent + "99";
    ctx.fillText(near ? "> FOUND BEST PRICE!" : "> COMPARING...", mx + 9, my - 46);
    ctx.fillStyle = accent + "aa"; ctx.fillText("₹" + (799 + i * 413), mx + 9, my - 34);
    ctx.fillText(near ? "✓ BEST DEAL" : "SEARCHING...", mx + 9, my - 22);
    // Glow
    const sg = rg(ctx, mx + 40, my - 44, 0, mx + 40, my - 44, 55);
    if (sg) {
      sg.addColorStop(0, near ? accent + "33" : accent + "15");
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.fillRect(mx - 6, my - 78, 92, 68);
    }
    // Keyboard + mouse pad
    ctx.fillStyle = "#999"; ctx.fillRect(mx + 32, my - 14, 16, 16);
    ctx.fillStyle = "#7a7a60"; ctx.fillRect(mx + 7, my + 10, 66, 15);
  }
  // Floating price tags drifting up
  ["₹999", "COMPARE", "BEST!", "₹1,499", "DEAL!", "SAVE!"].forEach((tag, i) => {
    const wx = startX + 100 + i * 235;
    const tx = wx - camX;
    if (tx < -140 || tx > W + 140) return;
    const ty = groundY - 195 + Math.sin(t * 1.3 + i) * 22;
    ctx.strokeStyle = accent + "66"; ctx.lineWidth = 1.5; ctx.strokeRect(tx, ty - 18, 80, 26);
    ctx.fillStyle = accent + "22"; ctx.fillRect(tx, ty - 18, 80, 26);
    ctx.fillStyle = accent; ctx.font = "10px 'DM Mono', monospace"; ctx.textAlign = "left";
    ctx.fillText(tag, tx + 10, ty + 3);
  });
}

// ─── HAB HOUSING — rental towers + autos ────────────────────────
function drawHab(s: SceneCtx) {
  const { ctx, W, camX, t, groundY, startX, endX, accent } = s;
  // Tower band
  for (let i = 0; i < 18; i++) {
    const wx = startX + i * 130 + (i % 3) * 12;
    const bx = wx - camX * 0.55;
    if (bx < -200 || bx > W + 200) continue;
    const bh = 140 + ((i * 47) % 210);
    const bw = 70 + ((i * 29) % 82);
    ctx.fillStyle = ["#270e00", "#1d0900", "#301200"][i % 3];
    ctx.fillRect(bx, groundY - bh, bw, bh);
    // Windows lit/unlit
    for (let wy = groundY - bh + 14; wy < groundY - 14; wy += 22)
      for (let wx2 = bx + 10; wx2 < bx + bw - 10; wx2 += 18) {
        const lit = (i * 3 + Math.floor(wx2 / 18) + Math.floor(wy / 22)) % 4 !== 0;
        ctx.fillStyle = lit ? accent + "44" : "#00000055";
        ctx.fillRect(wx2, wy, 10, 14);
      }
    // FOR RENT signs on every third building
    if (i % 3 === 1) {
      ctx.fillStyle = accent;
      ctx.fillRect(bx + 8, groundY - bh + 55, 70, 22);
      ctx.fillStyle = "#000"; ctx.font = "6px 'DM Mono', monospace"; ctx.textAlign = "left";
      ctx.fillText("FOR RENT", bx + 11, groundY - bh + 70);
    }
  }
  // Driving autos (3 lanes, near ground)
  [0, 1, 2].forEach((i) => {
    const speed = [0.4, 0.6, 0.5][i];
    const span = endX - startX + 600;
    const asx = startX - 200 + ((t * speed * 80 + i * 400) % span) - camX;
    if (asx < -140 || asx > W + 140) return;
    const bob = Math.sin(t * 3 + i) * 1.5;
    ctx.fillStyle = "#f39c12"; ctx.fillRect(asx, groundY - 54 + bob, 74, 44);
    ctx.fillStyle = "#e67e22"; ctx.fillRect(asx + 7, groundY - 70 + bob, 60, 18);
    ctx.fillStyle = "#87ceeb88"; ctx.fillRect(asx + 10, groundY - 67 + bob, 22, 13);
    ctx.fillRect(asx + 38, groundY - 67 + bob, 22, 13);
    ctx.fillStyle = "#d4890a"; ctx.fillRect(asx, groundY - 54 + bob, 9, 34);
    [16, 58].forEach((wxw) => {
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(asx + wxw, groundY - 5 + bob, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#555"; ctx.beginPath(); ctx.arc(asx + wxw, groundY - 5 + bob, 6, 0, Math.PI * 2); ctx.fill();
    });
  });
  // Street lamps
  for (let lx = startX + 200; lx < endX; lx += 320) {
    const lpx = lx - camX;
    if (lpx < -70 || lpx > W + 70) continue;
    ctx.fillStyle = "#4a2800"; ctx.fillRect(lpx - 3, groundY - 195, 6, 195);
    ctx.fillStyle = "#6a3800"; ctx.fillRect(lpx - 22, groundY - 195, 44, 9);
    const glg = rg(ctx, lpx, groundY - 195, 0, lpx, groundY - 195, 65);
    if (glg) {
      glg.addColorStop(0, accent + "33"); glg.addColorStop(1, "transparent");
      ctx.fillStyle = glg; ctx.fillRect(lpx - 65, groundY - 260, 130, 130);
    }
  }
}

// ─── AI / OCTO + INVESTOPAD — server racks + data streams ──────
function drawAI(s: SceneCtx) {
  const { ctx, W, H, camX, t, groundY, startX, endX, accent, playerVx } = s;
  // Energy grid
  const gridA = 0.04 + Math.abs(playerVx) * 0.005;
  ctx.strokeStyle = `rgba(159,232,255,${Math.min(0.18, gridA)})`;
  ctx.lineWidth = 1; const gs = 44;
  for (let x = startX - camX; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Data streams
  for (let i = 0; i < 24; i++) {
    const wx = startX + ((i * 129) % (endX - startX));
    const sx = wx - camX * 0.55;
    if (sx < -10 || sx > W + 10) continue;
    const speed = (i % 3 + 1) * 55 + Math.abs(playerVx) * 8;
    const yOff = (t * speed + i * 95) % H;
    const len = 45 + i * 9;
    const col = i % 2 === 0 ? "#00d4ff" : "#a78bfa";
    const gr = lg(ctx, sx, H - yOff - len, sx, H - yOff);
    if (!gr) continue;
    gr.addColorStop(0, "transparent"); gr.addColorStop(1, col + "aa");
    ctx.fillStyle = gr; ctx.fillRect(sx - 1, H - yOff - len, 2, len);
  }
  // Server racks
  const rackCount = Math.max(4, Math.floor((endX - startX) / 220));
  for (let i = 0; i < rackCount; i++) {
    const wx = startX + 60 + i * 220;
    const rx = wx - camX;
    if (rx < -140 || rx > W + 140) continue;
    const sh = 215;
    ctx.fillStyle = "#001428"; ctx.fillRect(rx, groundY - sh, 86, sh);
    ctx.fillStyle = "#001e3c"; ctx.fillRect(rx + 4, groundY - sh + 4, 78, sh - 8);
    ctx.fillStyle = accent + "33"; ctx.fillRect(rx, groundY - sh, 4, sh); ctx.fillRect(rx + 82, groundY - sh, 4, sh);
    for (let u = 0; u < 9; u++) {
      const uy = groundY - sh + 18 + u * 23;
      ctx.fillStyle = "#000e1e"; ctx.fillRect(rx + 8, uy, 70, 18);
      ctx.fillStyle = "#001830"; ctx.fillRect(rx + 10, uy + 2, 66, 14);
      const lc = ["#00ff00", "#00d4ff", "#ff6600"][u % 3];
      ctx.fillStyle = Math.sin(t * 3 + i * 1.5 + u) > 0.4 ? "#fff" : lc;
      ctx.fillRect(rx + 14, uy + 7, 5, 4);
      ctx.fillStyle = Math.sin(t * 2 + i + u * 0.7) > 0 ? "#00ff0099" : "#222";
      ctx.fillRect(rx + 22, uy + 7, 5, 4);
      for (let b = 0; b < 8; b++) {
        const bh = 3 + Math.abs(Math.sin(t * 2 + i + u + b * 0.5)) * 11;
        ctx.fillStyle = lc + "77"; ctx.fillRect(rx + 30 + b * 5, uy + 18 - bh, 4, bh);
      }
    }
  }
  // Chat bubbles
  ["HELLO INDIA!", "AI IN 2013", "CHATBOT #1", "UI/UX DESIGN", "OCTO.IO", "PRODUCT MKT"].forEach((txt, i) => {
    const wx = startX + 120 + i * 235;
    const bx = wx - camX;
    if (bx < -180 || bx > W + 180) return;
    const by = groundY - 235 + Math.sin(t * 1.4 + i) * 20;
    ctx.fillStyle = "#001830"; ctx.strokeStyle = accent + "aa"; ctx.lineWidth = 1.5;
    ctx.fillRect(bx, by, 130, 38); ctx.strokeRect(bx, by, 130, 38);
    ctx.fillStyle = accent; ctx.font = "8px 'DM Mono', monospace"; ctx.textAlign = "left";
    ctx.fillText(txt, bx + 12, by + 24);
  });
}

// ─── SOLESEARCH — shoe shelves, neon, stage, streetwear rack ────
function drawSole(s: SceneCtx) {
  const { ctx, W, camX, t, groundY, startX, endX, accent, playerX } = s;
  // Color glow blobs
  ["#ff006e22", "#a78bfa22", "#ff8c0022", "#00d4ff22"].forEach((col, i) => {
    const wx = startX + i * 400;
    const gx = wx - camX * 0.18;
    if (gx < -200 || gx > W + 200) return;
    ctx.fillStyle = col; ctx.fillRect(gx, groundY - 130 + ((i * 20) % 60), 120, 130);
  });
  // Shoe shelves — smaller cells, fewer shelves, only across the back HALF
  // of the chapter so the stage / press / streetwear rack get room.
  const shelfStart = startX + 80;
  const shelfEnd = startX + (endX - startX) * 0.5;
  for (let shelf = 0; shelf < 4; shelf++) {
    const sy = groundY - 230 + shelf * 44;
    ctx.fillStyle = "#180022"; ctx.fillRect(shelfStart - camX, sy, shelfEnd - shelfStart, 5);
    ctx.fillStyle = accent + "55"; ctx.fillRect(shelfStart - camX, sy, shelfEnd - shelfStart, 1);
    const shoeStep = 70;
    const shoeCount = Math.floor((shelfEnd - shelfStart) / shoeStep);
    const cols = ["#ff006e","#f5f0e8","#00d4ff","#ff8c00","#a78bfa","#2ecc71","#ffd700","#e74c3c","#111","#222"];
    for (let s2 = 0; s2 < shoeCount; s2++) {
      const wx = shelfStart + s2 * shoeStep + 8;
      const shx = wx - camX;
      if (shx < -60 || shx > W + 60) continue;
      const near = Math.abs(playerX - wx) < 110;
      const bounce = near ? Math.sin(t * 6 + s2) * 3 : 0;
      const c = cols[(shelf * 5 + s2) % cols.length];
      const c2 = cols[(shelf * 5 + s2 + 4) % cols.length];
      // tiny pixel sneaker, ~28x14
      ctx.fillStyle = "#fff2"; ctx.fillRect(shx, sy - 6, 30, 5);
      ctx.fillStyle = c; ctx.fillRect(shx + 2, sy - 18 + bounce, 26, 14);
      ctx.fillStyle = c2 + "cc"; ctx.fillRect(shx + 2, sy - 16 + bounce, 9, 12);
      ctx.fillStyle = "#fff8"; ctx.fillRect(shx + 14, sy - 10 + bounce, 10, 2);
      ctx.fillStyle = c + "aa"; ctx.fillRect(shx + 13, sy - 24 + bounce, 7, 8);
    }
  }
  // Neon signs
  const span = endX - startX;
  ([
    { txt: "DRIP", c: "#ff006e", xf: 0.18, y: 320, sz: 16 },
    { txt: "AUTHENTIC", c: "#fff", xf: 0.36, y: 295, sz: 10 },
    { txt: "HYPE", c: "#a78bfa", xf: 0.55, y: 312, sz: 14 },
    { txt: "CULTURE", c: "#ff8c00", xf: 0.74, y: 292, sz: 11 },
  ] as const).forEach((n) => {
    const wx = startX + n.xf * span;
    const nx = wx - camX * 0.6;
    if (nx < -300 || nx > W + 300) return;
    ctx.save(); ctx.shadowBlur = 22; ctx.shadowColor = n.c;
    ctx.fillStyle = n.c + "ee"; ctx.font = `bold ${n.sz}px 'Press Start 2P', monospace`;
    ctx.textAlign = "left"; ctx.fillText(n.txt, nx, groundY - n.y); ctx.restore();
  });
  // Stage with pixel "Rannvijay" silhouette
  const rwx = startX + span * 0.42;
  const rstx = rwx - camX;
  if (rstx > -200 && rstx < W + 200) {
    ctx.fillStyle = "#1a0028"; ctx.fillRect(rstx - 60, groundY - 50, 220, 50);
    ctx.fillStyle = "#ff006e44"; ctx.fillRect(rstx - 60, groundY - 52, 220, 4);
    [-30, 50, 130].forEach((lx, i) => {
      const lc = ["#ff006e", "#a78bfa", "#ff8c00"][i];
      const slg = rg(ctx, rstx + lx, groundY - 50, 0, rstx + lx, groundY - 50, 80);
      if (slg) {
        slg.addColorStop(0, lc + "44"); slg.addColorStop(1, "transparent");
        ctx.fillStyle = slg; ctx.fillRect(rstx + lx - 80, groundY - 130, 160, 130);
      }
    });
    // Person silhouette
    ctx.fillStyle = "#111";
    ctx.fillRect(rstx + 30, groundY - 150, 28, 8);
    ctx.fillRect(rstx + 32, groundY - 142, 24, 22);
    ctx.fillRect(rstx + 28, groundY - 120, 32, 38);
    ctx.fillRect(rstx + 20, groundY - 117, 10, 30);
    ctx.fillRect(rstx + 50, groundY - 120, 10, 32);
    ctx.fillRect(rstx + 30, groundY - 82, 10, 28);
    ctx.fillRect(rstx + 44, groundY - 82, 10, 28);
    // Mic
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(rstx + 15, groundY - 122, 3, 18);
    ctx.beginPath(); ctx.arc(rstx + 16, groundY - 124, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff006e"; ctx.font = "7px 'DM Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText("RANNVIJAY SINGHA", rstx + 44, groundY - 163);
  }
  // Streetwear rack
  const rkx = startX + span * 0.62 - camX;
  if (rkx > -250 && rkx < W + 250) {
    ctx.fillStyle = "#555"; ctx.fillRect(rkx, groundY - 180, 180, 6);
    ctx.fillRect(rkx, groundY - 180, 6, 100);
    ctx.fillRect(rkx + 174, groundY - 180, 6, 100);
    ["#111", "#ff006e", "#fff", "#a78bfa", "#000", "#222", "#ff8c00"].forEach((c, i) => {
      const cx = rkx + 14 + i * 24;
      const swing = Math.sin(t * 0.5 + i) * 3;
      ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + 8, groundY - 174); ctx.lineTo(cx + 8 + swing, groundY - 160); ctx.stroke();
      ctx.fillStyle = c; ctx.fillRect(cx + swing, groundY - 160, 16, 40);
      ctx.fillStyle = "#fff3"; ctx.fillRect(cx + 4 + swing, groundY - 160, 8, 8);
    });
  }
}

// ─── CATS CAN DANCE + ITERATE — vinyl, cats, mixing desk ────────
function drawCCD(s: SceneCtx) {
  const { ctx, W, H, camX, t, groundY, startX, endX, accent, playerX } = s;
  // Warm wash
  ctx.fillStyle = "#ff8c0009"; ctx.fillRect(0, 0, W, H);
  // Skyline silhouette
  for (let i = 0; i < 26; i++) {
    const wx = startX + i * 165;
    const bx = wx - camX * 0.32;
    if (bx < -165 || bx > W + 165) continue;
    ctx.fillStyle = i % 2 === 0 ? "#251000" : "#1a0b00";
    ctx.fillRect(bx, 0, 72, 42); ctx.fillRect(bx + 8, 42, 56, 18);
  }
  // Vinyl records (rotate)
  [0.18, 0.34, 0.52, 0.68].forEach((xf, i) => {
    const wx = startX + xf * (endX - startX);
    const rvx = wx - camX;
    if (rvx < -90 || rvx > W + 90) return;
    const rvy = groundY - 238 + i * 20;
    const rot = t * 0.22 * (i % 2 === 0 ? 1 : -1);
    ctx.save(); ctx.translate(rvx, rvy); ctx.rotate(rot);
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
    for (let g2 = 1; g2 < 5; g2++) {
      ctx.strokeStyle = accent + (g2 * 6).toString(16).padStart(2, "0");
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(0, 0, 10 + g2 * 7, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000"; ctx.font = "5px 'DM Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText("CATS", 0, -1); ctx.fillText("CAN", 0, 5);
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  // Cats that drift slowly toward player
  ([
    [startX + 240, "#cc8855"],
    [startX + 460, "#aaaaaa"],
    [startX + 680, "#e8a030"],
  ] as const).forEach(([baseWx, cc], i) => {
    const targetX = playerX + (-60 + i * 60);
    const driftX = (baseWx as number) + (targetX - (baseWx as number)) * 0.003;
    const cpx = driftX - camX;
    if (cpx < -90 || cpx > W + 90) return;
    const bob = Math.sin(t * 1.8 + i) * 4;
    const cy = groundY - 70;
    ctx.fillStyle = cc as string; ctx.fillRect(cpx - 14, cy + bob, 28, 22);
    ctx.fillRect(cpx - 10, cy - 18 + bob, 20, 20);
    ctx.fillRect(cpx - 12, cy - 26 + bob, 8, 10); ctx.fillRect(cpx + 4, cy - 26 + bob, 8, 10);
    ctx.fillStyle = "#000"; ctx.fillRect(cpx - 6, cy - 12 + bob, 5, 5); ctx.fillRect(cpx + 1, cy - 12 + bob, 5, 5);
    ctx.fillStyle = "#2ecc71"; ctx.fillRect(cpx - 5, cy - 11 + bob, 3, 3); ctx.fillRect(cpx + 2, cy - 11 + bob, 3, 3);
    ctx.fillStyle = cc as string; ctx.fillRect(cpx + 14, cy + 2 + bob, 6, 18);
    ctx.fillRect(cpx - 14, cy + 22 + bob, 8, 14); ctx.fillRect(cpx + 6, cy + 22 + bob, 8, 14);
    ctx.fillStyle = accent; ctx.font = "14px serif"; ctx.textAlign = "center";
    ctx.fillText(["♪", "♫", "♬"][i], cpx, cy - 34 + Math.sin(t * 2 + i) * 8 + bob);
  });
  // Mixing desk
  const dwx = startX + 0.78 * (endX - startX);
  const dx = dwx - camX;
  if (dx > -380 && dx < W + 380) {
    ctx.fillStyle = "#221000"; ctx.fillRect(dx, groundY - 84, 260, 74);
    ctx.fillStyle = "#2c1600"; ctx.fillRect(dx + 4, groundY - 80, 252, 34);
    for (let ch = 0; ch < 12; ch++) {
      const cx = dx + 14 + ch * 20;
      ctx.fillStyle = "#180a00"; ctx.fillRect(cx, groundY - 76, 10, 28);
      const fp = 4 + Math.sin(t * 0.8 + ch * 0.5) * 10;
      ctx.fillStyle = "#666"; ctx.fillRect(cx - 2, groundY - 76 + fp, 14, 7);
    }
    for (let v = 0; v < 8; v++) {
      const vh = 6 + Math.abs(Math.sin(t * 4 + v * 0.7)) * 28;
      ctx.fillStyle = vh > 20 ? "#e74c3c" : vh > 12 ? "#ff8c00" : "#2ecc71";
      ctx.fillRect(dx + 170 + v * 10, groundY - 54, 7, -vh);
    }
  }
  // Sound wave across floor
  ctx.strokeStyle = accent + "55"; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x < W; x += 3) {
    const y = groundY - 158 + Math.sin((x + camX) * 0.02 + t * 3.5) * 18 + Math.sin((x + camX) * 0.06 + t * 1.8) * 9;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ─── ITERATE — AI marketing agency: grid, bars, brand walls ─────
function drawIterate(s: SceneCtx) {
  const { ctx, W, H, camX, t, groundY, startX, endX, accent, playerVx, walking } = s;
  // Cool wash
  ctx.fillStyle = "#7ce0ff08"; ctx.fillRect(0, 0, W, H);
  // Energy grid
  const gridA = 0.06 + Math.abs(playerVx) * 0.005;
  ctx.strokeStyle = `rgba(124,224,255,${Math.min(0.22, gridA)})`;
  ctx.lineWidth = 1; const gs = 36;
  for (let x = (startX - camX) % gs; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Brand-wall silhouettes — abstract logo blocks on the back wall
  const brandColors = ["#ff006e", "#7ce0ff", "#ffd700", "#a78bfa", "#2ecc71", "#ff8c00"];
  const span = endX - startX;
  for (let i = 0; i < 8; i++) {
    const wx = startX + 60 + i * (span / 8);
    const bx = wx - camX * 0.5;
    if (bx < -100 || bx > W + 100) continue;
    const c = brandColors[i % brandColors.length];
    ctx.fillStyle = "#0a1628"; ctx.fillRect(bx, groundY - 200, 80, 60);
    ctx.fillStyle = c + "aa"; ctx.fillRect(bx + 8, groundY - 192, 64, 8);
    ctx.fillStyle = c + "55"; ctx.fillRect(bx + 8, groundY - 178, 40, 5);
    ctx.fillRect(bx + 8, groundY - 168, 50, 5);
    ctx.fillRect(bx + 8, groundY - 158, 30, 5);
  }
  // Pulsing data bars (campaign metrics)
  const barCount = Math.floor(span / 70);
  for (let i = 0; i < barCount; i++) {
    const wx = startX + 40 + i * 70;
    const bx2 = wx - camX;
    if (bx2 < -20 || bx2 > W + 20) continue;
    const dh = 20 + Math.abs(Math.sin(t * 1.5 + i)) * 90 + (walking ? Math.abs(Math.sin(t * 8 + i)) * 24 : 0);
    ctx.fillStyle = accent + "55"; ctx.fillRect(bx2 - 5, groundY - dh, 10, dh);
    ctx.fillStyle = accent; ctx.fillRect(bx2 - 5, groundY - dh, 10, 3);
  }
  // Signage
  ctx.save();
  ctx.shadowBlur = 18; ctx.shadowColor = accent;
  ctx.fillStyle = accent;
  ctx.font = "bold 14px 'Press Start 2P', monospace"; ctx.textAlign = "left";
  const sx = startX + 80 - camX * 0.6;
  if (sx > -300 && sx < W + 300) ctx.fillText("ITERATE.AGENCY", sx, groundY - 250);
  const sx2 = startX + span * 0.55 - camX * 0.6;
  if (sx2 > -300 && sx2 < W + 300) ctx.fillText("AI · MARKETING", sx2, groundY - 240);
  ctx.restore();
}

const RENDERERS: Record<string, (s: SceneCtx) => void> = {
  origin: drawOrigin,
  grp: drawGRP,
  hab: drawHab,
  ai: drawAI,
  investopad: drawAI,
  sole: drawSole,
  ccd: drawCCD,
  iterate: drawIterate,
  home: drawOrigin,
};

export type ChapterRange = {
  levelId: string;
  startCol: number;
  endCol: number;
  accent: string;
};

/**
 * Draw all chapter scenes that overlap the camera window. groundY is the top
 * of the ground row in canvas pixels (i.e. where tiles begin).
 */
export function drawWorldScenes(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  camX: number,
  t: number,
  chapters: ChapterRange[],
  playerX: number,
  playerVx: number,
  walking: boolean,
) {
  const groundY = (ROWS - 4) * TILE;
  for (const ch of chapters) {
    const startX = ch.startCol * TILE;
    const endX = ch.endCol * TILE;
    if (endX < camX - 40 || startX > camX + W + 40) continue;
    const fn = RENDERERS[ch.levelId];
    if (!fn) continue;
    // Clip to chapter band so neighbours don't bleed
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.max(0, startX - camX - 40), 0, Math.min(W + 80, endX - startX + 80), H);
    ctx.clip();
    fn({ ctx, W, H, camX, t, groundY, startX, endX, accent: ch.accent, playerX, playerVx, walking });
    ctx.restore();
  }
}
