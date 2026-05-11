// Stitches all chapters into one continuous side-scrolling world.
import { LEVELS, parseMap, ROWS, TILE, type Level } from "./data";

const TRANSITION_COLS = 4;

export type Chapter = {
  levelId: string;
  index: number;
  name: string;
  era: string;
  palette: Level["palette"];
  parallax: Level["parallax"];
  startCol: number;
  endCol: number;
  level: Level;
};

export type CoinE = { levelId: string; index: number; gx: number; gy: number; skill: string };
export type NpcE = { levelId: string; index: number; gx: number; gy: number; npc: Level["npcs"][number] };
export type ClipE = { levelId: string; gx: number; gy: number; clip: Level["clipping"] };
export type SecretE = { levelId: string; gx: number; gy: number; secret: Level["secret"] };
export type MgE = { levelId: string; gx: number; gy: number; mini: Level["minigame"] };
export type GateE = {
  x: number;          // pixel x of sign
  fromLevelId: string;
  toLevelId: string | null;
  toName: string | null;
};

export type World = {
  rows: string[];
  cols: number;
  widthPx: number;
  heightPx: number;
  spawn: { x: number; y: number };
  chapters: Chapter[];
  chapterByLevelId: Record<string, Chapter>;
  coins: CoinE[];
  npcs: NpcE[];
  clippings: ClipE[];
  secrets: SecretE[];
  minigames: MgE[];
  checkpoints: number[];   // pixel x positions
  gates: GateE[];
  endX: number;            // pixel x where the End Garden begins
};

function setChar(s: string, i: number, c: string): string {
  while (s.length <= i) s += ".";
  return s.substring(0, i) + c + s.substring(i + 1);
}

export function buildWorld(): World {
  const parsed = LEVELS.map((l) => {
    const rows = parseMap(l.map);
    while (rows.length < ROWS) rows.unshift("".padEnd(rows[0]?.length ?? 0, "."));
    const cols = Math.max(...rows.map((r) => r.length));
    const padded = rows.map((r) => r.padEnd(cols, "."));
    return { l, rows: padded, cols };
  });

  // Add an "End Garden" zone after the last chapter
  const END_COLS = 28;

  // compute offsets
  let cursor = 0;
  const chapters: Chapter[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    const startCol = cursor;
    chapters.push({
      levelId: p.l.id,
      index: p.l.index,
      name: p.l.name,
      era: p.l.era,
      palette: p.l.palette,
      parallax: p.l.parallax,
      startCol,
      endCol: startCol + p.cols,
      level: p.l,
    });
    cursor += p.cols + TRANSITION_COLS;
  }
  const endX = cursor * TILE;
  const totalCols = cursor + END_COLS;

  // build empty rows
  const rows: string[] = Array.from({ length: ROWS }, () => "".padEnd(totalCols, "."));

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    const off = chapters[i].startCol;
    for (let y = 0; y < p.rows.length; y++) {
      const src = p.rows[y];
      for (let x = 0; x < src.length; x++) {
        const c = src[x];
        // strip spawn / flag markers — they're rendered separately
        const out = c === "S" || c === "F" || c === "C" || c === "N" || c === "?" || c === "M" || c === "H" ? "." : c;
        if (out !== ".") rows[y] = setChar(rows[y], off + x, out);
      }
    }
    // transition: solid ground for the bottom 4 rows + 1 row of "==" platform decoration
    const tStart = chapters[i].endCol;
    const tEnd = i < parsed.length - 1 ? tStart + TRANSITION_COLS : tStart + TRANSITION_COLS;
    for (let dx = 0; dx < tEnd - tStart; dx++) {
      for (let y = ROWS - 4; y < ROWS; y++) rows[y] = setChar(rows[y], tStart + dx, "#");
    }
  }

  // End Garden ground
  for (let dx = 0; dx < END_COLS; dx++) {
    for (let y = ROWS - 4; y < ROWS; y++) rows[y] = setChar(rows[y], cursor + dx, "#");
  }

  // Helper: find the topmost solid ground row at a given column in the *parsed*
  // (un-padded) chapter rows. Used to snap "standing" entities so they never
  // float over a pit or bury into a brick.
  const SOLID = new Set(["#", "=", "B", "P"]);
  function groundRowAt(rows: string[], col: number): number {
    for (let y = 0; y < rows.length; y++) {
      const ch = rows[y]?.[col] ?? ".";
      if (SOLID.has(ch)) return y;
    }
    return ROWS - 4;
  }
  // Find a safe standing column near the requested one. If the requested
  // column has no near-surface ground (i.e. it's a pit), search outward up to
  // 6 tiles for the nearest column with solid ground in the bottom 5 rows.
  function safeColumn(rows: string[], gx: number): number {
    const isSafe = (c: number) => {
      const g = groundRowAt(rows, c);
      return g < ROWS - 1 && g >= ROWS - 5; // ground exists and is near floor
    };
    if (isSafe(gx)) return gx;
    for (let d = 1; d <= 6; d++) {
      if (gx - d >= 0 && isSafe(gx - d)) return gx - d;
      if (gx + d < (rows[0]?.length ?? 0) && isSafe(gx + d)) return gx + d;
    }
    return gx;
  }
  function snapStanding(rows: string[], gx: number, _gyHint: number): { gx: number; gy: number } {
    const sgx = safeColumn(rows, gx);
    const g = groundRowAt(rows, sgx);
    return { gx: sgx, gy: Math.max(0, g - 1) };
  }

  // entities (absolute coords)
  const coins: CoinE[] = [];
  const npcs: NpcE[] = [];
  const clippings: ClipE[] = [];
  const secrets: SecretE[] = [];
  const minigames: MgE[] = [];

  for (let i = 0; i < LEVELS.length; i++) {
    const l = LEVELS[i];
    const off = chapters[i].startCol;
    const pr = parsed[i].rows;
    l.coins.forEach((c, idx) =>
      coins.push({ levelId: l.id, index: idx, gx: c.gx + off, gy: c.gy, skill: c.skill }),
    );
    l.npcs.forEach((n, idx) => {
      const s = snapStanding(pr, n.gx, n.gy);
      npcs.push({ levelId: l.id, index: idx, gx: s.gx + off, gy: s.gy, npc: n });
    });
    if (l.clipping) {
      const s = snapStanding(pr, l.clipping.gx, l.clipping.gy);
      clippings.push({ levelId: l.id, gx: s.gx + off, gy: s.gy, clip: l.clipping });
    }
    if (l.secret) {
      const s = snapStanding(pr, l.secret.gx, l.secret.gy);
      secrets.push({ levelId: l.id, gx: s.gx + off, gy: s.gy, secret: l.secret });
    }
    if (l.minigame) {
      const s = snapStanding(pr, l.minigame.gx, l.minigame.gy);
      minigames.push({ levelId: l.id, gx: s.gx + off, gy: s.gy, mini: l.minigame });
    }
  }

  // Checkpoints: at the start of each chapter
  const checkpoints = chapters.map((c) => (c.startCol + 2) * TILE);

  // Gates: midway through each transition zone
  const gates: GateE[] = chapters.map((c, i) => ({
    x: (c.endCol + Math.floor(TRANSITION_COLS / 2)) * TILE,
    fromLevelId: c.levelId,
    toLevelId: i < chapters.length - 1 ? chapters[i + 1].levelId : null,
    toName: i < chapters.length - 1 ? chapters[i + 1].name : "End",
  }));

  const chapterByLevelId: Record<string, Chapter> = Object.fromEntries(
    chapters.map((c) => [c.levelId, c]),
  );

  // spawn at start of HOME
  const home = chapters[0];
  const spawn = { x: (home.startCol + (LEVELS[0].spawn?.gx ?? 2)) * TILE, y: ((LEVELS[0].spawn?.gy ?? 9) - 1) * TILE };

  return {
    rows,
    cols: totalCols,
    widthPx: totalCols * TILE,
    heightPx: ROWS * TILE,
    spawn,
    chapters,
    chapterByLevelId,
    coins,
    npcs,
    clippings,
    secrets,
    minigames,
    checkpoints,
    gates,
    endX,
  };
}

// Resolve which chapter the player is currently in (and tween factor to next).
export function activeChapter(playerX: number, world: World): { chapter: Chapter; tween: { from: Chapter; to: Chapter; t: number } | null } {
  for (let i = 0; i < world.chapters.length; i++) {
    const c = world.chapters[i];
    const tStart = c.endCol * TILE;
    const tEnd = (i < world.chapters.length - 1 ? world.chapters[i + 1].startCol : c.endCol + 8) * TILE;
    if (playerX >= c.startCol * TILE && playerX < tStart) {
      return { chapter: c, tween: null };
    }
    if (playerX >= tStart && playerX < tEnd && i < world.chapters.length - 1) {
      const t = (playerX - tStart) / Math.max(1, tEnd - tStart);
      return {
        chapter: t < 0.5 ? c : world.chapters[i + 1],
        tween: { from: c, to: world.chapters[i + 1], t },
      };
    }
  }
  return { chapter: world.chapters[world.chapters.length - 1], tween: null };
}

// hex (#rrggbb) → rgb tuple
function hexToRgb(h: string): [number, number, number] {
  const m = h.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [parseInt(v.substring(0, 2), 16), parseInt(v.substring(2, 4), 16), parseInt(v.substring(4, 6), 16)];
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function toHex2(n: number) {
  const v = Math.max(0, Math.min(255, Math.round(n))).toString(16);
  return v.length === 1 ? "0" + v : v;
}
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  // Return as #rrggbb so callers can safely append alpha hex (e.g. `${color}40`).
  return `#${toHex2(lerp(r1, r2, t))}${toHex2(lerp(g1, g2, t))}${toHex2(lerp(b1, b2, t))}`;
}

// Tween a palette across a transition zone.
export function tweenPalette(
  from: Level["palette"],
  to: Level["palette"],
  t: number,
): Level["palette"] {
  return {
    sky: mix(from.sky, to.sky, t),
    skyMid: mix(from.skyMid, to.skyMid, t),
    skyLow: mix(from.skyLow, to.skyLow, t),
    ground: mix(from.ground, to.ground, t),
    groundTop: mix(from.groundTop, to.groundTop, t),
    brick: mix(from.brick, to.brick, t),
    brickShade: mix(from.brickShade, to.brickShade, t),
    accent: mix(from.accent, to.accent, t),
    accentDim: mix(from.accentDim, to.accentDim, t),
    pipe: mix(from.pipe, to.pipe, t),
    pipeShade: mix(from.pipeShade, to.pipeShade, t),
  };
}
