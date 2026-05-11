## Goal

Bring the React pixel-portfolio up to (and beyond) the v7 HTML reference: a brand-new player character, all 8 chapters with the v7 copy, world-specific set pieces that actually tell the story to recruiters, SoleSearch as the largest, richest world with live-fetched press articles, and a visual bar set by the reference pixel-art screenshots.

## What changes

### 1. New player character
- Generate a transparent pixel-art sprite sheet (idle 2-frame, walk 4-frame, jump 1-frame, both facings) saved to `src/assets/player.png`.
- Add a `Player.tsx` renderer in `portfolio/` that draws from the sheet (image-rendered: pixelated) and falls back to a hand-drawn polished pixel character (multi-tone hair, jacket, sneakers, animated bob — same style family as the reference image) if the sprite fails to load.
- Replace current player draw call inside `engine.ts` / `Level.tsx` with the new component.

### 2. Port v7 chapter data
Rewrite `src/components/portfolio/data.ts` to match the 8 chapters from `param-portfolio-v7.html`:
Origin (Bengaluru) · GetRightPrice · Hab Housing · AI/Octo · Investopad · **SoleSearch** · Cats Can Dance · Iterate.
- Each chapter gets `did / learned / matters` long-form text, era label, accent color, and the v7 tag list — wired into `ChapterIntro`, `CliffNotes`, `ResumeView`, `Cards`, the dialog box.
- SoleSearch chapter gets ~2x the world width and ~2x the hotspots/coins/NPCs of other worlds (so it's clearly the largest beat).

### 3. Per-world scenery (port + push beyond)
New `worldScenes.ts` module with one render function per chapter, called from `Level.tsx` as a parallax layer behind the tile grid. Each scene ports the v7 set pieces and adds a second parallax band + lighting pass aiming at the reference screenshots:
- **Origin**: Bengaluru rooftop — stacked apartment silhouettes, water tank, clothesline, pulsing moon labelled "Bengaluru, India".
- **GetRightPrice**: internet café — animated CRT monitors running price-comparison text, floating ₹ price tags.
- **Hab Housing**: rental towers with lit/unlit windows, "FOR RENT" signs, autos driving across screen, street lamps.
- **AI/Octo + Investopad**: server racks with blinking LEDs + VU bars, data streams matching player velocity, floating chat bubbles.
- **SoleSearch (centerpiece)**: 7 shoe shelves (shoes bounce when player nears), neon DRIP/HYPE/CULTURE/AUTHENTIC signs, stage with Rannvijay silhouette, streetwear rack swaying, plus a new "press wall" zone that shows the live-fetched articles.
- **Cats Can Dance**: rotating vinyl records, three cats that drift toward the player, mixing desk with VU meters, sound wave across the floor, music-note particles.
- **Iterate**: AI grid, data bars that pulse to walk speed, floating AI-term cards.

### 4. SoleSearch live press wall
- Enable the **Firecrawl** connector (asks user to link).
- Server function `src/lib/press.functions.ts` → `getSoleSearchPress()` calls Firecrawl `search` for queries like `"SoleSearch" sneakers India`, `"SoleSearch" Param Minhas`, `"SoleSearch" CNBC`, dedupes, returns `{title, url, source, snippet, date}[]`. Cached 1h via response headers.
- New `PressWall.tsx` component renders inside the SoleSearch world as an interactive in-game "kiosk" — approach it to open a panel listing the articles (DM Mono headlines, source badge, click to open).
- Falls back to a curated hardcoded list (CNBC-TV18, YourStory, etc.) if the connector isn't linked or returns nothing, so the experience never breaks.
- Wired with TanStack Query (`useQuery` in component, not in loader — the route is public).

### 5. Recruiter-facing polish
- `ChapterIntro` already shows role + bullets — feed it richer v7 outcomes ($795K raised, 350K followers, ₹1Cr revenue, etc.) so each world arrival reads like a one-line resume hit.
- `ResumeView` rebuilt from the v7 `did/learned/matters` so the "press R" view is a clean recruiter resume with metrics, not lorem-style copy.
- Bottom-right "world map" stays, but uses v7 chapter colors.

### 6. Cleanup
- Remove now-unused minigame triggers that don't map to the new chapter list (or keep and re-skin to chapter accent).
- Update `src/routes/index.tsx` SEO meta to v7 title/description (already largely there).

## Tech notes

- Sprite sheet: 32x32 cells, drawn at 2x via `ctx.imageSmoothingEnabled = false`.
- World scene render order: sky gradient → stars/parallax bg → world-specific scenery → ground/tiles → player → particles → vignette/scanlines (matches v7).
- Firecrawl call lives behind a `createServerFn({ method: "GET" })` in `press.functions.ts`; client uses `useServerFn` + `useQuery` with 1h `staleTime`. Never read `process.env.FIRECRAWL_API_KEY` on the client.
- Fallback press list lives in `src/components/portfolio/pressFallback.ts` so the UI is identical whether live or fallback.

## Things I'll need from you (optional)

If you want to hand-draw the hero sprite yourself, drop a 4-row sprite sheet (idle/walk/jump, left+right or single facing I'll mirror) at `src/assets/player.png` — otherwise I generate it. Same for any specific brand shots/SoleSearch logos you want featured on the press wall.

## Out of scope (for this pass)

- Save-progress to Lovable Cloud
- Sound toggle / music
- Leaderboard / share-your-run links
