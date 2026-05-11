
# Final polish pass

## 1. World sizing (`data.ts`)
Shrink every chapter so the whole game feels tight:
- SoleSearch: 95 → **70** tiles
- Other chapters: clamp to **45–55** tiles (trim CCD, Iterate, GRP, Investopad, Agency)
- Reflow coins / NPCs / hotspots / flag positions to fit. Keep SoleSearch only ~1.3× others.

## 2. Movement: fast, smooth, no jitter (`engine.ts`, `Level.tsx`)
- Default mode on load = `"easy"` (instant jump, no charge). Confirm `setEngineMode("easy")` runs before first frame.
- Bump speeds: WALK_MAX 4.0→**4.8**, RUN_MAX 5.6→**7.0**, accel up ~20%. Friction 0.82→**0.86** for snappier stop.
- Jitter root cause: camera + draw positions must be `Math.round`ed every frame and parallax offsets too. Audit `Level.tsx` render loop — wrap every `ctx.drawImage` x/y in `Math.round`. Round NPC/coin/prop draw coords. Snap player x to integer always (not only when slow).
- Remove any `ctx.imageSmoothingEnabled = true` paths; force `false` on every canvas context.

## 3. Press wall fix (`PixelPortfolio.tsx`, `Level.tsx`)
- Currently `P` key + floating button toggle press wall, but in-world kiosk E-press doesn't fire. Wire kiosk hotspot through the existing minigame hotspot dispatcher: emit a `LevelEvent` of type `"press"` from `Level.tsx` when the player overlaps the kiosk and presses E, then handle in `PixelPortfolio` to `setPressOpen(true)`.
- Make the floating "📰 Press Wall" button visible whenever `currentChapter.id === "sole"` AND the title screen is closed (currently guarded behind chapter activation timing — fix the gate).
- Filter sources in `press.functions.ts` / `pressFallback.ts`: drop reddit, prefer funding + brand press (TechCrunch, YourStory, Inc42, Forbes, ET, Mint, Hypebeast, Highsnobiety, Complex). Adjust Firecrawl search query accordingly.

## 4. Top nav — show full names / logos (`Hud.tsx` or wherever chapter pips render)
- Replace single-letter pips with full chapter names (text-xs uppercase) or small SVG wordmarks. On narrow viewport (<640px), abbreviate to 3-letter codes (SOL, INV, CCD, ITR, GRP, AGY) instead of single letter. Active chapter gets accent underline + bold.

## 5. SoleSearch expanded content (`data.ts`, `worldScenes.ts`)
Add an **Events zone** in the back-third of SoleSearch:
- New parallax/scenery band: stage with lights, crowd silhouettes, "EVENTS" pixel sign.
- Two new clipping/secret hotspots:
  - "30+ events · ₹1cr+ in sales · ₹1cr+ in sponsorships"
  - "Brand partners: Royal Enfield, boAt, Budweiser + 40+ homegrown labels"
- New NPC for "SoleSearch Street" — pixel marketplace stalls behind kiosk; clipping body explains marketplace for Indian homegrown brands.
- Update `metrics.bullets` for SoleSearch with these numbers (factual, no hype copy).

## 6. Investopad expanded content (`data.ts`, `worldScenes.ts`)
- Add a "Companies I worked with" wall: pixel logos / labeled tiles for **Meesho, Entri, Simsim, Amazon, Forbes**, plus generic "Top India funds" tile.
- New NPC near the wall introduces the section. Tooltip-style sign reads: `[E] PORTFOLIO`. Opens a small list overlay (reuse `ClippingCard` shape).
- Update Investopad metrics bullets to mention the companies/funds plainly.

## 7. Copy pass — strip cocky tone (`data.ts`, `ResumeView.tsx`, `ChapterIntro` strings)
- Remove superlatives: "best", "legendary", "iconic", "redefined", "revolutionary", emoji bragging.
- Rewrite all `blurb`, `story`, `metrics.outcome`, `bullets`, `clipping.body` to be factual: what was built, scale (numbers), role. One short sentence per bullet.
- Same pass on Resume hero and section headings.

## 8. Resume — recruiter-shaped, 2 pages (`ResumeView.tsx`)
Restructure into two clear page blocks with `break-after: page` for print:

**Page 1 — Impact**
- Header: name, one-line title, contact row.
- "Highlights" — 4-6 quantified wins (₹1cr+ sales, 40+ brand partners, 30+ events, X startups invested, Y users, Z funding raised).
- "Selected experience" — top 3 chapters only, each with 2-3 outcome-led bullets.
- Skills cluster (compact, top-right).

**Page 2 — Detail**
- Full experience timeline (all chapters) with role, dates, outcome, 4-5 bullets each (responsibilities, tools, results).
- Companies / brands worked with (logos or names list).
- Selected press (filtered, real outlets).
- Education, languages, tools, references-on-request.

Add print CSS: `@page { size: A4; margin: 14mm; }` and explicit page break between sections. Tighter type scale, more whitespace, no emoji.

## 9. Homescreen — brilliant first impression (`Hud.tsx` `TitleScreen`, `PixelPortfolio.tsx`)
- Force title screen to show on load regardless of `seenTitle` localStorage **only on this redesign release** (bump a version key so old visitors see new title once).
- Redesign:
  - Full-bleed pixel scene: animated parallax skyline of the 6 worlds compressed into one panorama, day-to-night gradient, twinkling stars.
  - Big pixel logo "PARAM MINHAS" with subtle 1px pixel-shake on letters (CSS keyframes).
  - Subtitle: "A 15-year career, side-scrolled."
  - Three large pixel-bordered buttons: **▶ PLAY**, **📄 RESUME**, **🗺 PICK A CHAPTER**.
  - Bottom strip: chapter chips with mini-icons.
  - Mute toggle + mode selector (Easy/Hard/Quick Tour) tucked bottom-right.
  - Soft chip-tune intro on first user interaction (already wired via `audio.ts`).
- Use semantic tokens from `styles.css` (no raw hex in JSX). Add `--title-glow` token.

## 10. QA before handoff
Walk all 6 chapters in easy mode, verify: no jitter, press wall opens via kiosk + button + P key, all new SoleSearch/Investopad hotspots trigger, resume prints to 2 A4 pages, title screen renders on load.

## Out of scope
- New audio tracks, new sprite art generation (will reuse existing procedural draws + the player sheet).
- Backend / data model changes beyond the press source filter.

---

## Technical notes
- `data.ts` widths drive everything downstream — change widths first, then run through `worldScenes.ts` renderers to reposition props referencing absolute gx values.
- `LevelEvent` already has `clipping`/`secret`/`minigame` types — add `"press"` and `"portfolio"` variants and handle in `PixelPortfolio.handleLevelEvent`.
- For the homescreen panorama, render once to an offscreen canvas and `drawImage` per frame — avoids re-painting cost.

Approve and I'll execute end-to-end.
