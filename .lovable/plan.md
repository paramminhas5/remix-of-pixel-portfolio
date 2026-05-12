# Polish pass — jitter, naming, layout, inventory grouping

## 1. Movement jitter + slow buttons
- `src/components/portfolio/engine.ts`: re-tune easy mode to remove the slowdown that crept back. Restore fast feel: `WALK_MAX 5.4 → 6.0`, `RUN_MAX 7.4 → 8.0`, `WALK_ACCEL 1.1 → 1.3`, `RUN_ACCEL 1.4 → 1.6`, `FRICTION 0.86 → 0.88`. Keep rounding gated on `vx === 0` (already in place).
- Camera (`engine.ts > cameraX`) currently uses `Math.round(cx)`. With fractional `body.x`, the camera snaps each integer pixel while the player slides sub‑pixel → visible 1px judder. Switch to `Math.floor` and remove rounding inside `step` for `body.x` while airborne too — let the renderer handle pixel snapping once.
- `src/components/portfolio/Level.tsx`: in the render loop, draw the player at `Math.round(body.x - cameraX)` only (single source of pixel‑snap). Confirms image smoothing stays off.
- `EndScreen.tsx` end‑of‑game buttons feel sluggish because they sit inside a CSS `transition-transform` with a long duration. Reduce hover/active transition to `transition` default (150ms) and add `active:scale-95` so taps feel snappy. Same fix for the touch D‑pad buttons.

## 2. Rename "AI Era" → "Early AI Era"
- `src/components/portfolio/data.ts` line 262: `name: "AI Era"` → `name: "Early AI Era"`. No other file hard‑codes the label (HUD/WorldMap/Cliff read it from `LEVELS`).

## 3. Resume — add ₹26cr+ yearly sales stat
- `src/components/portfolio/ResumeView.tsx` `HIGHLIGHTS` array: insert `{ stat: "₹26cr+", label: "SoleSearch yearly sales" }` near the top (replacing or above "₹1cr+ Live event sales"). Keep grid 6 entries to preserve 2×3 / 3×2 layout.

## 4. SoleSearch — space out press kiosk vs hidden bottom path/NPC
- `src/components/portfolio/worldScenes.ts > drawSole` (around line 417): the press kiosk currently sits directly above the hidden lower-path NPC. Shift the kiosk left by ~3 tiles (or raise it ~1 tile) so the kiosk silhouette and the NPC sprite no longer stack vertically.
- `src/components/portfolio/data.ts` SoleSearch level: nudge the press clipping `gx` (and matching `qBlock` in `buildMap`) a couple of tiles away from the lower NPC `gx` so the on‑map interaction prompts don't overlap either. Verify by reading both gx values and ensure ≥4 tiles apart.

## 5. Inventory — group "People you met" by world
- `src/components/portfolio/Hud.tsx > PeopleCards`: bucket `quotes` by `levelId`, render one sub‑heading per world (using `lv.name` + accent color underline) followed by that world's people cards. Empty worlds are skipped. Order follows `LEVELS` order.

## 6. Add Cliff Notes button under Resume button
- `src/components/PixelPortfolio.tsx` (top-right stack, around line 341–349): add a second button below the Resume button styled to match (smaller, monospace, bordered) that calls `setCliffOpen(true)`. Label: `📋 Cliff Notes`. Color: white/30 border to differentiate from amber Resume.

## Verification
- Reload preview, move player left/right at full speed for 5s — confirm no 1px stutter.
- Open Resume → check `₹26cr+` stat appears in Highlights grid.
- Enter SoleSearch chapter → confirm kiosk and lower NPC are visually separated.
- Open Bag → People section grouped by world headings.
- Confirm new Cliff Notes button sits under Resume in top‑right.
- Confirm WorldMap chip / HUD label reads "Early AI Era".
