# Final Polish Pass

Goal: ship a brilliant, recruiter-ready run with clean chapter transitions, balanced world sizes, and zero jitter.

## 1. Chapter sizing rebalance (`data.ts`)

Make SoleSearch the clear hero, keep others tight. Widths in tiles:

```text
origin       → 60   (was ~80)
grp          → 55
hab          → 55
ai           → 55   (Octo + Investopad combined; AI-era resume hits)
sole         → 160  (~3x neighbours; biggest map, most coins/NPCs/hotspots)
ccd          → 70   (Cats Can Dance — music label + pet culture only)
iterate      → 70   (separate chapter — AI-led marketing agency)
```

Reposition coins/NPCs/hotspots to fit new ranges. Update `worldStitch.ts` chapter offsets.

## 2. Split CCD and Iterate

Currently `drawCCD` covers both. Split into two renderers:

- **`drawCCD`** — Cats Can Dance: vinyl records, mixing desk, drifting cats, VU meters, "PET CULTURE" + "MUSIC LABEL" neon. Warm orange wash.
- **`drawIterate`** — AI-led marketing agency: clean grid, pulsing data bars, campaign dashboards, "AI MARKETING" / "ITERATE.AGENCY" signage, brand-logo silhouettes on a wall. Cool cyan/violet wash.

Update `RENDERERS` map and `data.ts` chapter copy (`did/learned/matters`) to reflect each business correctly.

## 3. Visible chapter transitions

Port the v7 HTML "world swap" feel:

- **`ChapterTransition.tsx`** overlay: when player crosses a chapter border, fade a full-screen wash in the new accent color (300ms in, 500ms hold, 600ms out) with the chapter title + era pixel-stamped center-screen, then dissolve.
- Drive from `PixelPortfolio.tsx` by watching `currentChapterId`.
- Background music/ambient color in `Lighting.ts` cross-fades to the new accent over 800ms so the world visibly changes (sky tint, fog color, particle hue).

## 4. Sprite jitter fix

Root cause: `playerSprite.ts` draws at fractional canvas pixels because `player.x` is a float and we don't snap.

Fixes in `engine.ts` + `playerSprite.ts`:

- `Math.round(player.x - camX)` and `Math.round(player.y)` before `drawImage`.
- Lock animation frame to `Math.floor(t * 8) % frameCount` (was using float-derived index).
- Set `ctx.imageSmoothingEnabled = false` once at canvas init, not per-frame.
- Camera: `camX = Math.round(camX)` after lerp.

## 5. Generated sprite sheets

Use `imagegen--generate_image` (premium, transparent_background) then crop with a Python script into uniform cells. Save under `src/assets/`:

- **`sneakers-sheet.png`** — 8 sneakers, 32×32 cells, side profile, varied colorways (Jordan-ish, runner, hi-top, slip-on, chunky, classic, racing, boot). Replace the procedural shoes on the SoleSearch shelves.
- **`cats-sheet.png`** — 4 cats × 2 frames (idle/walk), 32×32 cells, pixel-art, varied fur (orange tabby, black, calico, grey). Replace procedural cats in CCD.

Both load via small helpers mirroring `playerSprite.ts` with code-drawn fallback.

## 6. Sneaker wall sizing

In `drawSole`, current wall has 7 shelves of large 46×23 shoes — visually overwhelming and clips the player. Reduce to:

- **5 shelves** (was 7), spaced 44px apart (was 40)
- Shoe cell **28×18** (was 46×23), one shoe per 70px (was 100)
- Move shelves into the back third of the chapter band only, not full width — leaves room for stage, streetwear rack, press wall.
- Press kiosk + Rannvijay stage + streetwear rack stay; reflow positions.

## 7. Recruiter copy refresh

Update `data.ts` `did/learned/matters` for the now-separate Iterate chapter and corrected CCD chapter:

- **CCD**: "Built India's first cat-focused music label + pet culture brand. 350K followers, brand deals with [X], live events."
- **Iterate**: "Founded AI-led marketing agency. ₹1Cr+ revenue, [N] brands shipped, AI workflows for [domain]."

(I'll pull exact numbers from the v7 HTML.)

## 8. QA pass

- Walk the full level end-to-end via the engine, log chapter entries.
- Verify each chapter renders, transition fires, sprite is rock-steady at all speeds.
- Verify SoleSearch press wall live-fetches (Firecrawl) with fallback.
- Confirm no z-order glitches between scenes / tiles / player.

## Out of scope

- New audio tracks (existing audio.ts ambient stays).
- Save progress / leaderboard.
- Anything not visible to a recruiter on a single playthrough.

## Optional from you

- Confirm exact CCD brand/numbers (label name, follower count) and Iterate revenue/brand list — otherwise I'll lift directly from the v7 HTML.

Approve and I'll execute end-to-end and stop only after the QA walkthrough is clean.
