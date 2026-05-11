# Polish pass: rebalance, wire press, tighten visuals

## 1. SoleSearch size

`data.ts` line 353: drop `width: 160` → `width: 95`. Reflow coins/NPCs/hotspots inside 95 tiles. SoleSearch stays the largest but only ~1.4× neighbours (others are 55–70).

## 2. Press wall actually visible

`PressWall.tsx` exists but is never mounted. Fix:

- Mount `<PressWall open={pressOpen} onClose={...} />` in `PixelPortfolio.tsx`.
- Add a fixed "📰 Press" floating button (bottom-left, pixel-styled) that only appears while `currentChapter.id === "sole"`.
- Add an in-world Press Kiosk hotspot in `drawSole` (newsstand sprite at gx ~70). When the player walks within 1 tile and presses E, open the wall. Wire via the existing minigame/hotspot pattern in `Level.tsx`.
- Add small "PRESS" pixel sign above the kiosk so it reads from across the level.

## 3. GRP "SALE" sign

In `worldScenes.ts` `drawGRP`: shrink the sale badge to fit inside its panel — reduce font from current size to 6px, clamp width to box width-4, center vertically. If still tight, replace the word "SALE" with a small "%" glyph.

## 4. SoleSearch "human-shaped hole"

That gap is the empty band between the sneaker shelves (back third) and the streetwear rack. Fill with:

- A mid-ground mannequin pair (2 pixel mannequins on plinths) at gx 40 and 55.
- A low bench + crowd silhouettes behind so the floor isn't bare.
- Move the press kiosk into this band so it doubles as scenery + interaction.

## 5. Animation polish

- `engine.ts` / `playerSprite.ts`: confirm `Math.round` snap on player + camera (already in plan, verify it actually shipped — re-check call sites). Also snap NPC and coin draws.
- Coins: add 6-frame spin via simple sin-based y bob + horizontal squash, currently static.
- NPCs: 2-frame idle bob (every 500ms) using existing draw loop.
- ChapterFlash: ease the opacity with `cubic-bezier(.2,.8,.2,1)` instead of linear, and add a 1px pixel-stamp shake on the title for 120ms on entry.
- Parallax: lerp camera-driven layer offsets (already lerped) — round to integer pixels to kill sub-pixel shimmer.

## 6. How to add your own sprites (answer to your question)

Two formats work; **PNG sprite sheets are strongly preferred over vectors** for this pixel engine:

- **Recommended: PNG sprite sheet** (transparent background, nearest-neighbour scaling).
  - Fixed cell grid, e.g. 32×32 or 64×64 per frame.
  - Frames laid out left-to-right per row; rows = animation states (idle, walk, jump).
  - Drop file in `src/assets/`, then `import url from "@/assets/your-sprite.png"`. Use the same loader pattern as `playerSprite.ts` — it `drawImage`s a single cell per frame.
  - Tools: Aseprite, Piskel (free, browser), or generate with the image tool then crop into cells.
- **SVG / vector**: works but gets re-rasterised every frame, blurs at small sizes unless you bake it to a PNG first. Only use for static decor (signs, logos), not animated characters.
- **Single-frame PNG**: fine for props (sneakers, cats, mannequins). Just one cell, no animation grid needed.

Generate `sneakers-sheet.png`, `cats-sheet.png`, `mannequin.png`, `press-kiosk.png` and wire them in. Right now the engine draws everything procedurally except the player sheet.

## Out of scope

- New chapters, new audio, recruiter copy rewrite (already done last pass).
- Refactoring the engine — only the snap/round fixes.

Approve and I'll execute end-to-end and screenshot-verify each chapter before handing back.