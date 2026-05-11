
# v16 — Final polish for recruiters

Six tightly-scoped fixes. No new dependencies, no engine logic rewrites.

## 1. Player jitter — fix the actual cause

Past attempts rounded the player position but the `drawPlayer` call still receives `body.x - camX` rounded *separately* from `body.x` rounding inside the engine. When the engine snaps `body.x` to integer only when fully stopped (`Math.abs(vx) < 0.1`) but the camera follows the un-rounded `x`, a 1-frame mismatch reintroduces a 1px shimmer between camera lerp and sprite position. Fixes:

- In `engine.ts step()`: round `body.x` to integer **every frame on ground when |vx| < 0.6** (not just <0.1) and always round `body.y` when on ground. This eliminates the float drift while walking slowly.
- In `Level.tsx`: compute `const px = Math.round(body.x); const cx = Math.round(cameraX(px + body.w/2, W, world));` then pass `px - cx` to drawPlayer. Currently `body.x` is read fresh and `cameraX` operates on `body.x + body.w/2` — both must use the same rounded value, or the delta drifts.
- In `drawPlayer`: drop the `ctx.scale(-1,1)` mirror when facing left and instead pre-flip via integer x-offset (manually swap left/right rect x coords). Negative scale reflects all interior `fillRect` through a fractional axis when x is even and produces 1px shimmer when the player turns.
- Quantize `walkAnim` advance to 1/4 steps so the leg frame doesn't switch mid-pixel: in engine `body.walkAnim += 0.25` only when `|vx| > 0.5 && onGround`, and pass `Math.floor(walkAnim)` as before.
- Drop the `drawPlayerGlow` radial-gradient call — radial gradients re-rasterize each frame and shimmer near the player. Replace with a single pre-computed pixel halo (3 concentric `fillRect` rings with fixed alpha) drawn at integer offsets.

## 2. Sim (Quick) autopilot — gets stuck between worlds

Root cause: at chapter transitions the gate signpost sits at `(c.endCol+4)*TILE` and the autopilot sees a "gap" 1-3 tiles ahead because waterfalls render where ground tiles are temporarily missing. The autopilot then jumps repeatedly into the same gap. Also `body.x > worldRef.current.endX - TILE*2` halts movement before the player crosses the last gate, so "endReached" never fires and the guy idles forever.

Fixes in `Level.tsx`:
- Replace gap detection with **safe-tile detection**: scan rows `belowRow` AND `belowRow+1` for `#`/`=`/`B` over a 4-tile lookahead. Only trigger jump when the *nearest* solid drops by >1 tile or there's no solid for 2+ tiles.
- Add a "stuck-jump cooldown" of 30 frames so the autopilot can't fire two jumps inside one gap.
- When stuck against a wall (`vx≈0` for >40 frames AND `onGround`), force a small `body.x += TILE` warp to unstick (rare safety net at chapter seams).
- Change end condition: keep walking until `body.x > world.endX + TILE*4` (past the end-garden links), then stop and emit `endReached` once.
- Engagement points: in `Level.tsx` the quick-mode auto-collect loop only fires when `nearRef.current` is set this frame. Because the autopilot sometimes runs past at high speed, raise `nearTest` range from `1.4` → `2.2` *only* when `quickRef.current` is true so banners always trigger as the player walks past coins/clippings/secrets/NPCs.

## 3. Banners overlap the nav bar

The `QuickBanner` currently stacks at top-center. The world-name ribbon sits at the top — they collide. Fix:
- Move banners to **bottom-center** on mobile (above the touch-control row, `bottom: 116px`) and **top-right under the contact pill** on desktop (`top: 96px, right: 12px`).
- Cap to one banner at a time (already enforced via `prev.slice(-1)`), but bump duration to 2.4s in Sim and add a slide-from-side animation instead of fade so each banner reads as discrete.
- Add a tiny world-color left bar (4px) to the banner card and the chapter index `W3 ·` prefix so multiple back-to-back banners are differentiable.

## 4. World-specific scenery (the "hasn't added world elements" complaint)

Currently the per-chapter parallax is generic (`city`/`trees`/`shelves`). Add bespoke foreground props **drawn in `drawAmbient`** for each level so each world feels different:

- **GetRightPrice** (price-tag bunting strung between poles, blinking "SALE" billboard, animated price-comparison arrows).
- **Hab Housing** (window-lit apartment block silhouette, "FOR RENT" yard signs with palette accent, drifting paper applications).
- **Octo / Quartic.ai** (chat-bubble particles floating up from terminals, scrolling code-line CRT in background, "LIVE" indicator dot).
- **SoleSearch** — already has sneaker wall; add: hanging sneaker-on-laces silhouette over a streetlight, a graffiti tag spelling "SOLE", a queue of pixel-fans behind a velvet rope, "DROP TODAY" neon.
- **Investopad** (whiteboard with sticky notes, founders coding at desks in window cutouts, cap-table chart on a screen).
- **Cats Can Dance** (turntables on a DJ booth, equalizer bars reacting to fake bass, spinning vinyl, "ON AIR" sign, dancing cat silhouette).
- **Iterate** (AI prompt floating windows with cycling phrases, generation grid with small images appearing and dissolving, neural-net node graph in background).

Each world also gets a **distinct ground-tile detail pattern** (dot grid for Investopad, brick mortar for Hab, checker for GetRightPrice, etc.) by branching on `chapter.levelId` inside `drawTiles`.

## 5. Mobile chapter-intro card still oversized

The card has `clamp(8px..)` but on a 360px screen the chapter title row + bullets still wrap awkwardly and overflow the visible canvas because of `pr-8` plus the close button absolutely positioned. Fix:
- Reduce card width to `min(78vw, 280px)` on mobile.
- Anchor at `top-1 right-1` and lift it ABOVE the world-ribbon by giving it `z-30` and offsetting `top: calc(env(safe-area-inset-top) + 4px)`.
- Move the auto-dismiss to 4.5s (was 6s) and add a 2-tap dismiss safety: backdrop click anywhere on the canvas dismisses too (forwarded via `onPointerDown` on the wrapping `<div ref={wrapRef}>`).
- Force `text-wrap: balance` on title and `line-clamp-2` on each bullet (already applied on bullets; add to outcome).

Also the **on-canvas chapter toast** (`drawChapterToast`) draws at fixed pixel `font 24px Playfair` which on a narrow 220px internal buffer overflows. Make font-size scale: `Math.min(24, W/14)` for the era and `Math.min(12, W/30)` for the W#.

## 6. Resume view — recruiter-grade redesign

Replace the current single-column dark stack in `ResumeView.tsx` with a structured two-column layout (collapses to one on <640px):

```
┌───────────────────────────────────────────────┐
│  HERO                                          │
│   PARAM MINHAS         [Email] [LinkedIn] [⎙] │
│   Builder · Designer · Director · Producer    │
│   2-line elevator pitch                        │
├──────────────┬────────────────────────────────┤
│ LEFT (1/3)   │ RIGHT (2/3)                    │
│ • Contact    │ ─ Experience (chapters)        │
│ • Skills     │   each row: company · role ·   │
│   (chips,    │   years · 1-line outcome       │
│   grouped    │   + 2-3 bullets                │
│   by domain) │ ─ Press                        │
│ • Tools      │ ─ Selected work links          │
│ • Education  │                                │
│ • Languages  │                                │
└──────────────┴────────────────────────────────┘
```

Specific changes in `ResumeView.tsx`:
- Add a real header band with avatar pixel-portrait (use the existing `drawPlayer` rendered to an offscreen canvas → data URL on mount, 96px square with a subtle accent border).
- Group skills by category (Strategy / Design / Engineering / Music / AI) using an inline mapping const at top of file. Render as compact pill rows, not duplicated per chapter.
- Each chapter renders as a compact "experience row": company name (Playfair, 18px), role + years (mono caps right-aligned), one-line outcome, 3 bullet outcomes — no big cards, no big accent bars (subtle 2px left rule per chapter).
- Add a "Selected press" section pulling `lv.clipping.title + source` into a clean list.
- Footer with email + LinkedIn + Twitter + site as plain inline links (not pill buttons).
- Print stylesheet: `@media print` removes background gradient, switches body to white, ink to `#111`, hides the back-to-game CTA, uses serif headings & sans body so the printed PDF looks like a normal CV.
- Light/dark toggle isn't necessary, but ensure default looks great on light printer paper after print rules.

## Suggested extra improvements (low cost, high recruiter ROI)

- **Share card / OG image**: add `og:image` URL to `routes/index.tsx` head — generate a static 1200×630 PNG once and import. Boosts LinkedIn shares.
- **First-visit confetti on game complete** — adds polish and a clear "you finished" beat.
- **Keyboard shortcut hints** on hover for HUD buttons (`title="Open inventory (Tab)"`).
- **Analytics-free pageview ping** to a private endpoint so Param can see who opened the resume (deferrable; mention but don't implement now).
- **A11y**: add `aria-label`s to icon-only buttons and `prefers-reduced-motion` guard around the parallax + scarf wave.

## Files to touch
- `src/components/portfolio/engine.ts` — round x/y on ground, slower walkAnim quantization.
- `src/components/portfolio/Level.tsx` — fixed quick autopilot, banner repositioning, near-range bump for quick mode, end condition.
- `src/components/portfolio/sprites.ts` — drawPlayer mirror without negative scale, drop radial glow, scaled chapter-toast font, world-specific ambient props in `drawAmbient`, per-level ground-tile patterns in `drawTiles`.
- `src/components/portfolio/QuickBanner.tsx` — bottom-mobile / top-right-desktop positioning, slide animation, world chip.
- `src/components/portfolio/ChapterIntro.tsx` — narrower mobile card, z-30, safe-area top, 4.5s timer, line-clamp on outcome.
- `src/components/portfolio/ResumeView.tsx` — full redesign per layout above + print stylesheet + grouped skills.
- `src/components/PixelPortfolio.tsx` — pass canvas-dismiss handler to ChapterIntro; keep banner state cap.
- `src/components/portfolio/Lighting.ts` — drop `drawPlayerGlow` (or keep but unused).
- `src/routes/index.tsx` — add `og:image` meta.

No data file changes; recruiter copy is unchanged.
