import { TILE } from "./data";

export type Solidity = "none" | "solid" | "platform" | "brick" | "pipe" | "flag";

export function tileSolidity(c: string): Solidity {
  switch (c) {
    case "#":
    case "B":
      return "solid";
    case "=":
      return "platform";
    case "P":
      return "pipe";
    case "F":
      return "flag";
    default:
      return "none";
  }
}

// Generic tilemap shape — World or single-Level both fit.
export type TileWorld = {
  rows: string[];
  cols: number;
  widthPx: number;
  heightPx: number;
};

export type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  facing: number;
  walkAnim: number;
  // jump state
  charging: boolean;       // currently building a charged jump
  charge: number;          // 0..CHARGE_MAX frames
  coyote: number;          // frames left after leaving ground
  jumpBuffer: number;      // frames left after pressing jump (Celeste-style)
  jumpsLeft: number;       // double-jump availability
  squash: number;          // visual squash on landing/launch
  prevOnGround: boolean;
  blink: number;           // idle anim
  doubleJumpFx: number;    // particle ring countdown
};

export type InputFrame = {
  left: boolean;
  right: boolean;
  run: boolean;
  jumpHeld: boolean;
  jumpPressed: boolean;    // edge: just went down this frame
  jumpReleased: boolean;   // edge: just went up this frame
};

export function makeBody(spawnX: number, spawnY: number): Body {
  return {
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    w: 22,
    h: 32,
    onGround: false,
    facing: 1,
    walkAnim: 0,
    charging: false,
    charge: 0,
    coyote: 0,
    jumpBuffer: 0,
    jumpsLeft: 1,
    squash: 0,
    prevOnGround: false,
    blink: 0,
    doubleJumpFx: 0,
  };
}

// Tunable per difficulty mode. Mutable so PixelPortfolio can flip between
// "easy" (recruiter stroll: instant short jumps, gentler gravity) and "hard"
// (charged + double-jump, current feel).
export const TUNING = {
  GRAV: 0.55,
  MAX_FALL: 13,
  WALK_ACCEL: 0.55,
  RUN_ACCEL: 0.85,
  WALK_MAX: 3.0,
  RUN_MAX: 4.6,
  FRICTION: 0.78,
  CHARGE_MAX: 16,
  JUMP_MIN: 7.5,
  JUMP_MAX: 13.0,
  DOUBLE_JUMP_VY: -9.5,
  REQUIRE_CHARGE: true, // hard: must charge; easy: instant jump on press
  EASY_AUTOPILOT: false,
};

export const CHARGE_MAX = 16; // legacy export kept for HUD usage

export function setEngineMode(mode: "easy" | "hard" | "quick") {
  if (mode === "quick") {
    TUNING.GRAV = 0.42;
    TUNING.MAX_FALL = 11;
    TUNING.JUMP_MIN = 10;
    TUNING.JUMP_MAX = 11;
    TUNING.DOUBLE_JUMP_VY = -8.5;
    // Tour speed — slow enough to read banners
    TUNING.WALK_MAX = 3.4;
    TUNING.RUN_MAX = 3.8;
    TUNING.WALK_ACCEL = 0.7;
    TUNING.RUN_ACCEL = 0.8;
    TUNING.FRICTION = 0.85;
    TUNING.REQUIRE_CHARGE = false;
    TUNING.EASY_AUTOPILOT = true;
  } else if (mode === "easy") {
    TUNING.GRAV = 0.5;
    TUNING.MAX_FALL = 13;
    TUNING.JUMP_MIN = 11;
    TUNING.JUMP_MAX = 12;
    TUNING.DOUBLE_JUMP_VY = -9.5;
    TUNING.WALK_MAX = 5.4;
    TUNING.RUN_MAX = 7.4;
    TUNING.WALK_ACCEL = 1.1;
    TUNING.RUN_ACCEL = 1.4;
    TUNING.FRICTION = 0.86;
    TUNING.REQUIRE_CHARGE = false;
    TUNING.EASY_AUTOPILOT = true;
  } else {
    TUNING.GRAV = 0.5;
    TUNING.MAX_FALL = 12;
    TUNING.JUMP_MIN = 8.5;
    TUNING.JUMP_MAX = 12.0;
    TUNING.DOUBLE_JUMP_VY = -9.0;
    TUNING.WALK_MAX = 3.6;
    TUNING.RUN_MAX = 5.2;
    TUNING.WALK_ACCEL = 0.7;
    TUNING.RUN_ACCEL = 0.95;
    TUNING.FRICTION = 0.8;
    TUNING.REQUIRE_CHARGE = true;
    TUNING.EASY_AUTOPILOT = false;
  }
}

export type StepCallbacks = {
  onJump?: () => void;
  onDoubleJump?: () => void;
  onLand?: () => void;
};

export function step(body: Body, world: TileWorld, input: InputFrame, cb: StepCallbacks = {}) {
  // ── horizontal motion ────────────────────────────────────────────
  const accel = input.run ? TUNING.RUN_ACCEL : TUNING.WALK_ACCEL;
  const maxV = input.run ? TUNING.RUN_MAX : TUNING.WALK_MAX;
  if (input.left) {
    body.vx = Math.max(body.vx - accel, -maxV);
    body.facing = -1;
  } else if (input.right) {
    body.vx = Math.min(body.vx + accel, maxV);
    body.facing = 1;
  } else {
    body.vx *= TUNING.FRICTION;
    if (Math.abs(body.vx) < 0.08) body.vx = 0;
  }

  // ── jump state machine ───────────────────────────────────────────
  if (body.onGround) {
    body.coyote = 8;
    body.jumpsLeft = 1;          // grounded → 1 air-jump available
  } else {
    body.coyote = Math.max(0, body.coyote - 1);
  }

  // Jump buffer: remember a recent press for ~6 frames so it triggers as soon
  // as the player lands or enters coyote frames.
  if (input.jumpPressed) body.jumpBuffer = 6;
  else body.jumpBuffer = Math.max(0, body.jumpBuffer - 1);

  const wantsJump = body.jumpBuffer > 0;
  if (wantsJump) {
    if (body.onGround || body.coyote > 0) {
      if (TUNING.REQUIRE_CHARGE) {
        body.charging = true;
        body.charge = 1;
        body.squash = 1;
        body.jumpBuffer = 0;
      } else {
        // easy mode: instant fixed-height jump
        body.vy = -TUNING.JUMP_MAX;
        body.onGround = false;
        body.coyote = 0;
        body.squash = 1;
        body.jumpBuffer = 0;
        cb.onJump?.();
      }
    } else if (input.jumpPressed && body.jumpsLeft > 0 && !body.charging) {
      body.vy = TUNING.DOUBLE_JUMP_VY;
      body.jumpsLeft -= 1;
      body.doubleJumpFx = 14;
      body.squash = 1;
      body.jumpBuffer = 0;
      cb.onDoubleJump?.();
    }
  }

  if (body.charging && input.jumpHeld && (body.onGround || body.coyote > 0)) {
    body.charge = Math.min(TUNING.CHARGE_MAX, body.charge + 1);
  }

  const releasedNow = body.charging && (input.jumpReleased || !input.jumpHeld || body.charge >= TUNING.CHARGE_MAX);
  if (releasedNow) {
    const t = body.charge / TUNING.CHARGE_MAX;
    const vy = -(TUNING.JUMP_MIN + (TUNING.JUMP_MAX - TUNING.JUMP_MIN) * t);
    body.vy = vy;
    body.charging = false;
    body.charge = 0;
    body.onGround = false;
    body.coyote = 0;
    body.squash = 1;
    cb.onJump?.();
  }

  if (!input.jumpHeld && body.vy < -3 && !body.charging) body.vy = Math.max(body.vy, -3);

  body.vy = Math.min(body.vy + TUNING.GRAV, TUNING.MAX_FALL);

  // ── physics integration ─────────────────────────────────────────
  // X
  body.x += body.vx;
  resolveAxis(body, world, "x");
  // Y
  body.prevOnGround = body.onGround;
  body.y += body.vy;
  body.onGround = false;
  resolveAxis(body, world, "y");

  if (!body.prevOnGround && body.onGround) {
    body.squash = 1;
    cb.onLand?.();
  }

  // walls
  if (body.x < 0) {
    body.x = 0;
    body.vx = 0;
  }
  if (body.x + body.w > world.widthPx) {
    body.x = world.widthPx - body.w;
    body.vx = 0;
  }

  // anim ticks — quantize to 1/4 frame steps so legs never switch mid-pixel.
  if (Math.abs(body.vx) > 0.5 && body.onGround) body.walkAnim += 0.25;
  else body.walkAnim = 0;
  if (body.squash > 0) body.squash = Math.max(0, body.squash - 0.12);
  if (body.doubleJumpFx > 0) body.doubleJumpFx -= 1;
  // Only snap when fully stopped — snapping while moving causes visible 1px judder.
  if (body.onGround) {
    body.y = Math.round(body.y);
    if (body.vx === 0) {
      body.x = Math.round(body.x);
      body.blink += 1;
    }
  } else {
    body.blink = 0;
  }
}

function resolveAxis(body: Body, world: TileWorld, axis: "x" | "y") {
  const left = Math.floor(body.x / TILE);
  const right = Math.floor((body.x + body.w - 1) / TILE);
  const top = Math.floor(body.y / TILE);
  const bottom = Math.floor((body.y + body.h - 1) / TILE);

  for (let ty = top; ty <= bottom; ty++) {
    if (ty < 0 || ty >= world.rows.length) continue;
    for (let tx = left; tx <= right; tx++) {
      if (tx < 0 || tx >= world.cols) continue;
      const ch = world.rows[ty][tx];
      const sol = tileSolidity(ch);
      if (sol === "none" || sol === "flag") continue;
      const tileX = tx * TILE;
      const tileY = ty * TILE;
      if (sol === "platform") {
        if (axis === "y" && body.vy > 0) {
          const prevBottom = body.y + body.h - body.vy;
          if (prevBottom <= tileY + 1) {
            body.y = tileY - body.h;
            body.vy = 0;
            body.onGround = true;
          }
        }
        continue;
      }
      if (axis === "x") {
        if (body.vx > 0) body.x = tileX - body.w;
        else if (body.vx < 0) body.x = tileX + TILE;
        body.vx = 0;
      } else {
        if (body.vy > 0) {
          body.y = tileY - body.h;
          body.vy = 0;
          body.onGround = true;
        } else if (body.vy < 0) {
          body.y = tileY + TILE;
          body.vy = 0;
        }
      }
    }
  }
}

export function cameraX(playerX: number, viewW: number, world: TileWorld) {
  let cx = playerX - viewW / 2;
  cx = Math.max(0, Math.min(cx, world.widthPx - viewW));
  return Math.round(cx);
}

export function overlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Find nearest checkpoint (pixel x) <= playerX
export function nearestCheckpoint(playerX: number, checkpoints: number[]): number {
  let best = checkpoints[0] ?? 0;
  for (const c of checkpoints) if (c <= playerX + 80) best = c;
  return best;
}
