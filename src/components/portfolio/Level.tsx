import { useEffect, useRef, useState } from "react";
import { TILE, ROWS, type Level } from "./data";
import {
  buildWorld,
  activeChapter,
  tweenPalette,
  type World as StitchedWorld,
  type Chapter,
} from "./worldStitch";
import {
  step,
  cameraX,
  overlap,
  makeBody,
  nearestCheckpoint,
  type Body,
  type InputFrame,
  CHARGE_MAX,
} from "./engine";
import {
  drawSky,
  drawSun,
  drawClouds,
  drawMountains,
  drawParallax,
  drawBalloon,
  drawTiles,
  drawCoin,
  drawQuestionBlock,
  drawNpc,
  drawMinigame,
  drawSecret,
  drawPlayer,
  drawSignpost,
  drawWaterfall,
  drawBird,
  drawChapterToast,
  drawScanlines,
  drawEndPost,
  drawAmbient,
  VIEW_H,
} from "./sprites";
import { sfx } from "./audio";
import { Emitter, weatherForChapter } from "./Particles";
import { drawVignette } from "./Lighting";
import { drawWorldScenes } from "./worldScenes";
import { drawPlayerSprite, spriteReady } from "./playerSprite";

export type LevelEvent =
  | { kind: "coin"; levelId: string; index: number; skill: string }
  | { kind: "npc"; levelId: string; index: number }
  | { kind: "clipping"; levelId: string }
  | { kind: "secret"; levelId: string }
  | { kind: "minigame"; levelId: string }
  | { kind: "clear"; levelId: string }
  | { kind: "chapterEnter"; levelId: string }
  | { kind: "endReached" }
  | { kind: "endLink"; href: string; label: string };

export type LevelHandle = {
  pauseInputs: (paused: boolean) => void;
  pressInteract: () => void;
  pressLeft: (down: boolean) => void;
  pressRight: (down: boolean) => void;
  pressJump: (down: boolean) => void;
  warpToChapter: (levelId: string) => void;
  warpToNextChapter: () => void;
};

export type CollectedMap = Record<
  string,
  { coins: Set<number>; npcs: Set<number>; clipping: boolean; secret: boolean; minigame: boolean }
>;

export function LevelView({
  collected,
  clearedSet,
  onEvent,
  onReady,
  paused,
  onActiveChapter,
  easyMode,
  quickMode,
}: {
  collected: CollectedMap;
  clearedSet: Set<string>;
  onEvent: (e: LevelEvent) => void;
  onReady?: (h: LevelHandle) => void;
  paused: boolean;
  onActiveChapter?: (c: Chapter) => void;
  easyMode?: boolean;
  quickMode?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(900);

  const worldRef = useRef<StitchedWorld>(buildWorld());
  const collectedRef = useRef(collected);
  const clearedRef = useRef(clearedSet);
  const pausedRef = useRef(paused);
  const onEventRef = useRef(onEvent);
  const activeChapterCbRef = useRef(onActiveChapter);

  useEffect(() => {
    collectedRef.current = collected;
  }, [collected]);
  useEffect(() => {
    clearedRef.current = clearedSet;
  }, [clearedSet]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);
  useEffect(() => {
    activeChapterCbRef.current = onActiveChapter;
  }, [onActiveChapter]);

  const bodyRef = useRef<Body>(makeBody(worldRef.current.spawn.x, worldRef.current.spawn.y));
  const lastCheckpointRef = useRef(worldRef.current.spawn.x);
  const inputRef = useRef<InputFrame>({
    left: false,
    right: false,
    run: false,
    jumpHeld: false,
    jumpPressed: false,
    jumpReleased: false,
  });
  const nearRef = useRef<{ kind: string; levelId: string; index: number } | null>(null);
  const toastRef = useRef<{ alpha: number; chapter: Chapter | null }>({ alpha: 0, chapter: null });
  const lastChapterIdRef = useRef<string | null>(null);
  const reachedEndRef = useRef(false);
  const easyRef = useRef(!!easyMode);
  const quickRef = useRef(!!quickMode);
  const autoTalkedRef = useRef<Set<string>>(new Set());
  const lastBannerAtRef = useRef<number>(0);
  const jumpCooldownRef = useRef<number>(0);
  const stuckFramesRef = useRef<number>(0);
  const emitterRef = useRef(new Emitter());
  useEffect(() => {
    easyRef.current = !!easyMode;
  }, [easyMode]);
  useEffect(() => {
    quickRef.current = !!quickMode;
  }, [quickMode]);

  // input handle
  const handleRef = useRef<LevelHandle>({
    pauseInputs: (p) => {
      pausedRef.current = p;
    },
    pressInteract: () => {
      tryInteract();
    },
    pressLeft: (d) => {
      inputRef.current.left = d;
    },
    pressRight: (d) => {
      inputRef.current.right = d;
    },
    pressJump: (d) => {
      if (d && !inputRef.current.jumpHeld) inputRef.current.jumpPressed = true;
      if (!d && inputRef.current.jumpHeld) inputRef.current.jumpReleased = true;
      inputRef.current.jumpHeld = d;
    },
    warpToChapter: (levelId) => {
      const c = worldRef.current.chapterByLevelId[levelId];
      if (!c) return;
      const x = (c.startCol + 2) * TILE;
      bodyRef.current = makeBody(x, (ROWS - 5) * TILE);
      lastCheckpointRef.current = x;
    },
    warpToNextChapter: () => {
      const w = worldRef.current;
      const px = bodyRef.current.x;
      const cur = activeChapter(px, w).chapter;
      const idx = w.chapters.findIndex((c) => c.levelId === cur.levelId);
      const next = w.chapters[Math.min(w.chapters.length - 1, idx + 1)];
      const x = (next.startCol + 2) * TILE;
      bodyRef.current = makeBody(x, (ROWS - 5) * TILE);
      lastCheckpointRef.current = x;
    },
  });
  useEffect(() => {
    onReady?.(handleRef.current);
  }, [onReady]);

  // Resize: keep internal pixel-buffer W proportional to actual viewport so the
  // canvas can stretch fullscreen without distortion. On mobile portrait we
  // accept narrow internal buffers (no aspect floor) so the canvas fills the
  // screen instead of letterboxing into a tiny strip.
  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const cw = el.clientWidth || window.innerWidth;
      const ch = el.clientHeight || window.innerHeight;
      const aspect = cw / Math.max(1, ch);
      const internalW = Math.round(VIEW_H * aspect);
      setW(Math.max(220, Math.min(2400, internalW)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space"].includes(k)) e.preventDefault();
      if (k === "ArrowLeft" || k === "a" || k === "A") inputRef.current.left = true;
      else if (k === "ArrowRight" || k === "d" || k === "D") inputRef.current.right = true;
      else if (k === "Shift") inputRef.current.run = true;
      else if (k === " " || k === "Spacebar" || k === "ArrowUp" || k === "w" || k === "W") {
        if (!inputRef.current.jumpHeld) inputRef.current.jumpPressed = true;
        inputRef.current.jumpHeld = true;
      } else if (k === "e" || k === "E" || k === "Enter") {
        tryInteract();
      } else if (k === "ArrowDown" || k === "s" || k === "S") {
        tryInteract();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") inputRef.current.left = false;
      else if (k === "ArrowRight" || k === "d" || k === "D") inputRef.current.right = false;
      else if (k === "Shift") inputRef.current.run = false;
      else if (k === " " || k === "Spacebar" || k === "ArrowUp" || k === "w" || k === "W") {
        if (inputRef.current.jumpHeld) inputRef.current.jumpReleased = true;
        inputRef.current.jumpHeld = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function tryInteract() {
    const n = nearRef.current;
    if (!n) return;
    if (n.kind === "npc") {
      onEventRef.current({ kind: "npc", levelId: n.levelId, index: n.index });
    } else if (n.kind === "clipping" && !collectedRef.current[n.levelId]?.clipping) {
      sfx.power();
      onEventRef.current({ kind: "clipping", levelId: n.levelId });
    } else if (n.kind === "secret" && !collectedRef.current[n.levelId]?.secret) {
      sfx.open();
      onEventRef.current({ kind: "secret", levelId: n.levelId });
    } else if (n.kind === "minigame" && !collectedRef.current[n.levelId]?.minigame) {
      sfx.open();
      onEventRef.current({ kind: "minigame", levelId: n.levelId });
    } else if (n.kind === "endLink") {
      const link = END_LINKS[n.index];
      onEventRef.current({ kind: "endLink", href: link.href, label: link.label });
    }
  }

  // ── Game loop ───────────────────────────────────────────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let last = performance.now();
    let drawErrorLogged = false;
    const loop = (now: number) => {
      try {
        runFrame(now);
      } catch (err) {
        if (!drawErrorLogged) {
          drawErrorLogged = true;
          console.error("[PixelPortfolio] frame draw error — skipping frame:", err);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    const runFrame = (now: number) => {
      const dtSec = (now - last) / 1000;
      last = now;
      const world = worldRef.current;
      const body = bodyRef.current;
      const t = now / 1000;

      if (!pausedRef.current) {
        // Quick-mode autopilot — slower, safer, never falls off ledges,
        // never traps itself in repeated jumps at chapter seams.
        if (quickRef.current) {
          // Walk PAST endX so we cross the final gate and reach end-garden.
          const reachedEnd = body.x > worldRef.current.endX + TILE * 4;
          // Pause longer when banner just appeared so quotes are readable
          const recentBanner = (now - lastBannerAtRef.current) < 2000;
          inputRef.current.left = false;
          inputRef.current.right = !recentBanner && !reachedEnd;
          inputRef.current.run = false;
          if (jumpCooldownRef.current > 0) jumpCooldownRef.current -= 1;
          if (reachedEnd) {
            inputRef.current.jumpHeld = false;
          } else if (!recentBanner) {
            // Safe-tile detection: scan 4 tiles ahead. Find nearest column where
            // BOTH belowRow and belowRow+1 lack a solid → that's a real gap.
            const colNow = Math.floor((body.x + body.w / 2) / TILE);
            const belowRow = Math.floor((body.y + body.h + 4) / TILE);
            const isSolid = (ch: string | undefined) => ch === "#" || ch === "=" || ch === "B";
            let realGap = false;
            for (let d = 1; d <= 4; d++) {
              const a = world.rows[belowRow]?.[colNow + d];
              const b = world.rows[belowRow + 1]?.[colNow + d];
              if (!isSolid(a) && !isSolid(b)) { realGap = true; break; }
            }
            // Wall-stuck detection
            if (Math.abs(body.vx) < 0.25 && body.onGround) {
              stuckFramesRef.current += 1;
            } else {
              stuckFramesRef.current = 0;
            }
            const stuck = stuckFramesRef.current > 20;
            if (stuck && stuckFramesRef.current > 60) {
              // Hard unstick — warp forward 2 tiles past the obstacle.
              body.x += TILE * 2;
              stuckFramesRef.current = 0;
            } else if ((realGap || stuck) && body.onGround && jumpCooldownRef.current === 0) {
              inputRef.current.jumpPressed = true;
              inputRef.current.jumpHeld = true;
              jumpCooldownRef.current = 30;
              window.setTimeout(() => {
                inputRef.current.jumpReleased = true;
                inputRef.current.jumpHeld = false;
              }, 140);
            }
          }
        }
        // Input edges already set; consume them.
        const inp = inputRef.current;
        step(body, world, inp, {
          onJump: () => sfx.jump(),
          onDoubleJump: () => sfx.coin(),
          onLand: () => {},
        });
        inp.jumpPressed = false;
        inp.jumpReleased = false;

        // pit fall → checkpoint (in quick mode, skip ahead to next safe checkpoint)
        if (body.y > VIEW_H + 80) {
          if (quickRef.current) {
            // jump to checkpoint AFTER current x so we don't loop in a pit
            const next = world.checkpoints.find((c) => c > body.x + 20) ?? lastCheckpointRef.current;
            body.x = next;
          } else {
            body.x = lastCheckpointRef.current;
          }
          body.y = (ROWS - 6) * TILE;
          body.vx = 0;
          body.vy = 0;
          sfx.bump();
        }

        // Coin pickup
        for (const c of world.coins) {
          if (collectedRef.current[c.levelId]?.coins.has(c.index)) continue;
          const cx = c.gx * TILE;
          const cy = c.gy * TILE;
          if (overlap(body.x, body.y, body.w, body.h, cx + 4, cy + 4, 20, 22)) {
            sfx.coin();
            onEventRef.current({ kind: "coin", levelId: c.levelId, index: c.index, skill: c.skill });
          }
        }

        // Chapter change → toast + checkpoint update
        const { chapter: cur } = activeChapter(body.x, world);
        if (cur.levelId !== lastChapterIdRef.current) {
          lastChapterIdRef.current = cur.levelId;
          toastRef.current = { alpha: 1.4, chapter: cur };
          activeChapterCbRef.current?.(cur);
          onEventRef.current({ kind: "chapterEnter", levelId: cur.levelId });
        }
        // checkpoint = nearest passed
        const cp = nearestCheckpoint(body.x, world.checkpoints);
        if (cp > lastCheckpointRef.current) lastCheckpointRef.current = cp;

        // Cleared if past gate of current chapter and not yet recorded
        for (const g of world.gates) {
          if (
            !clearedRef.current.has(g.fromLevelId) &&
            body.x > g.x + 10 &&
            g.toLevelId !== null
          ) {
            sfx.clear();
            onEventRef.current({ kind: "clear", levelId: g.fromLevelId });
          }
        }
        // Last chapter cleared once player crosses the last gate
        const lastChapter = world.chapters[world.chapters.length - 1];
        if (
          !clearedRef.current.has(lastChapter.levelId) &&
          body.x > world.endX
        ) {
          sfx.clear();
          onEventRef.current({ kind: "clear", levelId: lastChapter.levelId });
        }
        if (!reachedEndRef.current && body.x > world.endX + TILE * 6) {
          reachedEndRef.current = true;
          onEventRef.current({ kind: "endReached" });
        }
      }

      // Determine nearest interactable
      nearRef.current = null;
      const px = body.x + body.w / 2;
      const py = body.y + body.h / 2;
      const interactRange = quickRef.current ? 2.2 : 1.4;
      const nearTest = (gx: number, gy: number, range = interactRange) =>
        Math.abs(gx * TILE + TILE / 2 - px) < TILE * range && Math.abs(gy * TILE + TILE / 2 - py) < TILE * 1.7;

      for (const n of worldRef.current.npcs) {
        if (nearTest(n.gx, n.gy)) nearRef.current = { kind: "npc", levelId: n.levelId, index: n.index };
      }
      if (!nearRef.current)
        for (const c of worldRef.current.clippings) {
          if (nearTest(c.gx, c.gy)) {
            nearRef.current = { kind: "clipping", levelId: c.levelId, index: 0 };
            break;
          }
        }
      if (!nearRef.current)
        for (const m of worldRef.current.minigames) {
          if (nearTest(m.gx, m.gy)) {
            nearRef.current = { kind: "minigame", levelId: m.levelId, index: 0 };
            break;
          }
        }
      if (!nearRef.current)
        for (const s of worldRef.current.secrets) {
          if (nearTest(s.gx, s.gy)) {
            nearRef.current = { kind: "secret", levelId: s.levelId, index: 0 };
            break;
          }
        }
      // End garden links
      for (let i = 0; i < END_LINKS.length; i++) {
        const lx = worldRef.current.endX + (i + 1) * TILE * 3;
        if (Math.abs(lx + TILE / 2 - px) < TILE * 1.2 && body.onGround) {
          nearRef.current = { kind: "endLink", levelId: "end", index: i };
        }
      }

      // Easy-mode autopilot: auto-open each NPC dialog ONCE per session.
      // Quick mode: silently mark NPC as visited (no modal pause) — emits
      // a "npc" event with a tiny flag so PixelPortfolio can show a banner
      // instead of the full DialogBox.
      if ((easyRef.current || quickRef.current) && !pausedRef.current && nearRef.current?.kind === "npc") {
        const { levelId, index } = nearRef.current;
        const key = `${levelId}:${index}`;
        const seen = collectedRef.current[levelId]?.npcs.has(index);
        if (!autoTalkedRef.current.has(key) && !seen) {
          autoTalkedRef.current.add(key);
          if (quickRef.current) lastBannerAtRef.current = now;
          onEventRef.current({ kind: "npc", levelId, index });
        }
      }
      // Quick mode: silently auto-collect clippings, secrets, minigames as
      // the player walks past — no modal interruptions.
      if (quickRef.current && !pausedRef.current) {
        if (nearRef.current?.kind === "clipping") {
          const { levelId } = nearRef.current;
          if (!collectedRef.current[levelId]?.clipping) {
            lastBannerAtRef.current = now;
            onEventRef.current({ kind: "clipping", levelId });
          }
        } else if (nearRef.current?.kind === "minigame") {
          const { levelId } = nearRef.current;
          if (!collectedRef.current[levelId]?.minigame) {
            onEventRef.current({ kind: "minigame", levelId });
          }
        } else if (nearRef.current?.kind === "secret") {
          const { levelId } = nearRef.current;
          if (!collectedRef.current[levelId]?.secret) {
            lastBannerAtRef.current = now;
            onEventRef.current({ kind: "secret", levelId });
          }
        }
      }

      const camX = Math.round(cameraX(body.x + body.w / 2, W, worldRef.current));
      const { chapter: ac, tween } = activeChapter(body.x, worldRef.current);
      const palette = tween ? tweenPalette(tween.from.palette, tween.to.palette, tween.t) : ac.palette;

      drawSky(ctx, W, VIEW_H, palette);
      drawSun(ctx, W, VIEW_H, palette);
      drawClouds(ctx, W, VIEW_H, camX, t);
      drawMountains(ctx, W, VIEW_H, camX, palette);
      drawParallax(ctx, W, VIEW_H, camX, palette, ac.parallax, t);
      drawAmbient(ctx, W, VIEW_H, camX, t, ac.levelId, palette);

      // Per-chapter set pieces (CRT monitors, shoe shelves, vinyl, etc.)
      drawWorldScenes(
        ctx,
        W,
        VIEW_H,
        camX,
        t,
        worldRef.current.chapters.map((c) => ({
          levelId: c.levelId,
          startCol: c.startCol,
          endCol: c.endCol,
          accent: c.palette.accent,
        })),
        body.x,
        body.vx,
        Math.abs(body.vx) > 0.5,
      );

      // Chapter-specific flair
      if (ac.levelId === "home" || ac.levelId === "origin") drawBalloon(ctx, W, VIEW_H, t, palette.accent);

      // Tiles — palette by column based on which chapter that column belongs to
      drawTiles(ctx, worldRef.current, camX, W, VIEW_H, (col) => paletteForCol(worldRef.current, col, t));

      // Waterfalls at chapter transitions
      for (let i = 0; i < worldRef.current.chapters.length - 1; i++) {
        const ch = worldRef.current.chapters[i];
        const tx = (ch.endCol + 4) * TILE - camX;
        if (tx > -40 && tx < W + 40) drawWaterfall(ctx, tx, t);
      }

      // Birds (one per chapter, perched on a platform)
      for (const ch of worldRef.current.chapters) {
        const bx = (ch.startCol + 8) * TILE - camX;
        if (bx > -20 && bx < W + 20) {
          const by = (ROWS - 6) * TILE - 4;
          drawBird(ctx, bx, by, t + ch.index, (ch.index * 50) % 360);
        }
      }

      // Coins (no sub-pixel bob — pixel-snapped)
      const spin = t * 5;
      for (const c of worldRef.current.coins) {
        if (collectedRef.current[c.levelId]?.coins.has(c.index)) continue;
        const cx = Math.round(c.gx * TILE - camX);
        if (cx < -TILE || cx > W + TILE) continue;
        drawCoin(ctx, cx, c.gy * TILE, spin + c.index);
      }

      // Clipping ? blocks
      for (const cl of worldRef.current.clippings) {
        const x = cl.gx * TILE - camX;
        if (x < -TILE || x > W + TILE) continue;
        const opened = collectedRef.current[cl.levelId]?.clipping ?? false;
        const pal = paletteForCol(worldRef.current, cl.gx, t);
        drawQuestionBlock(ctx, x, cl.gy * TILE, opened, spin, pal);
      }

      // NPCs (round positions to integer pixels)
      for (const n of worldRef.current.npcs) {
        const x = Math.round(n.gx * TILE - camX);
        if (x < -TILE * 2 || x > W + TILE * 2) continue;
        const near = nearRef.current?.kind === "npc" && nearRef.current.levelId === n.levelId && nearRef.current.index === n.index;
        drawNpc(ctx, x, n.gy * TILE, n.npc.hue, t * 2 + n.index, near, n.npc.portrait);
      }

      // Mini-games (chapter-themed in-world props)
      for (const m of worldRef.current.minigames) {
        if (collectedRef.current[m.levelId]?.minigame) continue;
        const x = m.gx * TILE - camX;
        if (x < -TILE * 2 || x > W + TILE * 2) continue;
        const near = nearRef.current?.kind === "minigame" && nearRef.current.levelId === m.levelId;
        const pal = paletteForCol(worldRef.current, m.gx, t);
        drawMinigame(ctx, x, m.gy * TILE, t * 2, pal, !!near, m.mini.id);
      }

      // Secrets
      for (const s of worldRef.current.secrets) {
        if (collectedRef.current[s.levelId]?.secret) continue;
        const x = s.gx * TILE - camX;
        if (x < -TILE * 2 || x > W + TILE * 2) continue;
        const near = nearRef.current?.kind === "secret" && nearRef.current.levelId === s.levelId;
        const pal = paletteForCol(worldRef.current, s.gx, t);
        drawSecret(ctx, x, s.gy * TILE, pal, !!near);
      }

      // Signposts at gates
      for (let i = 0; i < worldRef.current.gates.length; i++) {
        const g = worldRef.current.gates[i];
        const x = g.x - camX;
        if (x < -80 || x > W + 80) continue;
        const fromCh = worldRef.current.chapterByLevelId[g.fromLevelId];
        drawSignpost(ctx, x, (ROWS - 4) * TILE, fromCh.palette, g.toName ?? "End", g.toLevelId ? worldRef.current.chapterByLevelId[g.toLevelId].index : "★");
      }

      // End garden link signposts (pixel-snap to kill jitter)
      for (let i = 0; i < END_LINKS.length; i++) {
        const lx = Math.round(worldRef.current.endX + (i + 1) * TILE * 3 - camX);
        if (lx > -60 && lx < W + 60) {
          drawEndPost(ctx, lx, (ROWS - 4) * TILE, END_LINKS[i].label, ac.palette.accent);
        }
      }

      // Particle weather (per chapter), updated + drawn each frame
      const weather = weatherForChapter(ac.levelId);
      emitterRef.current.step(Math.min(0.05, dtSec), weather, W, VIEW_H);
      emitterRef.current.draw(ctx, palette.accent);

      // (Player glow removed — radial gradient was shimmering on motion.)


      // Player
      drawPlayer(
        ctx,
        Math.round(body.x - camX),
        Math.round(body.y),
        body.facing,
        Math.floor(body.walkAnim),
        !body.onGround,
        body.charging ? body.charge / CHARGE_MAX : 0,
        body.squash,
        body.blink,
        body.doubleJumpFx,
      );

      // Cinematic vignette before HUD/scanlines
      drawVignette(ctx, W, VIEW_H, 0.48);

      // Hint label
      if (nearRef.current && !pausedRef.current) {
        const k = nearRef.current.kind;
        const label =
          k === "npc" ? "E TALK" : k === "clipping" ? "E READ" : k === "minigame" ? "E PLAY" : k === "secret" ? "↓ ENTER" : "E OPEN";
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(W / 2 - 56, 20, 112, 24);
        ctx.fillStyle = ac.palette.accent;
        ctx.fillRect(W / 2 - 56, 20, 112, 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, W / 2, 36);
      }

      // Chapter toast
      if (toastRef.current.alpha > 0 && toastRef.current.chapter) {
        const c = toastRef.current.chapter;
        drawChapterToast(ctx, W, `WORLD ${c.index} · ${c.name}`, c.era, Math.min(1, toastRef.current.alpha), c.palette.accent);
        toastRef.current.alpha -= dtSec * 0.6;
      }

      drawScanlines(ctx, W, VIEW_H);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [W]);

  return (
    <div ref={wrapRef} className="relative h-full w-full" style={{ background: "#000" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={VIEW_H}
        style={{ width: "100%", height: "100%", imageRendering: "pixelated", display: "block" }}
        onTouchStart={(e) => {
          e.preventDefault();
          tryInteract();
        }}
      />
    </div>
  );
}

// chapter palette resolver for tile col
function paletteForCol(world: StitchedWorld, col: number, _t: number): Level["palette"] {
  for (let i = 0; i < world.chapters.length; i++) {
    const c = world.chapters[i];
    if (col >= c.startCol && col < c.endCol) return c.palette;
    if (i < world.chapters.length - 1) {
      const next = world.chapters[i + 1];
      if (col >= c.endCol && col < next.startCol) {
        const t = (col - c.endCol) / Math.max(1, next.startCol - c.endCol);
        return tweenPalette(c.palette, next.palette, t);
      }
    }
  }
  return world.chapters[world.chapters.length - 1].palette;
}

export const END_LINKS: { label: string; href: string }[] = [
  { label: "EMAIL", href: "mailto:minhas.param@gmail.com" },
  { label: "SITE", href: "https://catscandance.com" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/paramminhas/" },
  { label: "TWITTER", href: "https://twitter.com/paramminhas" },
  { label: "RESTART", href: "#restart" },
];
