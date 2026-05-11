// Param Portfolio v6 — level data, NPCs, collectibles
// Tile characters used in `map`:
//   '.' empty   '#' solid ground   '=' brick (solid)   'B' bumpable brick
//   'P' pipe (solid)   'F' goal flag   'S' player spawn
//   'C' coin   'N' NPC spawn   'M' mini-game trigger   'H' hidden secret tile
// Map rows are read top-to-bottom. Width = max row length.

export type MinigameId =
  | "price-match"
  | "stack-blocks"
  | "chat-match"
  | "pick-unicorn"
  | "spot-fake"
  | "rhythm-tap";

export type Coin = { gx: number; gy: number; skill: string };
export type Npc = {
  gx: number;
  gy: number;
  name: string;
  role: string;
  quote: string;
  portrait: "founder" | "investor" | "tenant" | "engineer" | "celeb" | "client" | "fan";
  hue: number;
  beat?: "did" | "learned";
};
export type Clipping = { gx: number; gy: number; title: string; body: string; source: string };
export type Secret = { gx: number; gy: number; title: string; body: string };
export type MinigameTrigger = { gx: number; gy: number; id: MinigameId; label: string };

export type Level = {
  id: string;
  index: number;
  name: string;
  era: string;
  blurb: string;
  story: string;
  palette: {
    sky: string; skyMid: string; skyLow: string;
    ground: string; groundTop: string;
    brick: string; brickShade: string;
    accent: string; accentDim: string;
    pipe: string; pipeShade: string;
  };
  parallax: ("city" | "trees" | "racks" | "apartments" | "desk" | "shelves" | "stars")[];
  metrics?: { role: string; years: string; outcome: string; bullets: string[] };
  map: string;
  spawn?: { gx: number; gy: number };
  coins: Coin[];
  npcs: Npc[];
  clipping: Clipping;
  secret: Secret;
  minigame: MinigameTrigger;
  cumulativeSkillsAtClear: string[];
};

export const TILE = 28;
export const ROWS = 14;

export function parseMap(s: string): string[] {
  return s.replace(/^\n+|\n+$/g, "").split("\n").map((row) => row.replace(/\s+$/g, ""));
}

// Build a chapter map of arbitrary width, with ground on the bottom 4 rows
// and decorative platforms / collectible coins / NPC markers placed
// proportionally. Ensures every chapter has a real "world" feel at any size.
function buildMap(opts: {
  width: number;
  // grid X positions for each entity
  spawn: number;
  npcGxs: number[]; // story NPCs
  qBlock: number;   // ? clipping block
  minigame: number;
  secret: number;
  flagAt?: number;  // defaults to width-2
  coinTopGxs: number[];
  coinMidGxs: number[];
  // "==" platform ranges as [startCol, len]
  platforms: Array<[number, number]>;
}): string {
  const W = opts.width;
  const empty = ".".repeat(W);
  const rows = Array.from({ length: ROWS }, () => empty.split(""));
  const setCh = (y: number, x: number, c: string) => {
    if (x >= 0 && x < W) rows[y][x] = c;
  };

  // Ground (bottom 4 rows full width)
  for (let y = ROWS - 4; y < ROWS; y++) for (let x = 0; x < W; x++) rows[y][x] = "#";

  // Platforms (=)
  const platformY = ROWS - 9; // row 5 from top
  for (const [start, len] of opts.platforms) {
    for (let i = 0; i < len; i++) setCh(platformY, start + i, "=");
  }

  // Coins
  for (const x of opts.coinTopGxs) setCh(3, x, "C");
  for (const x of opts.coinMidGxs) setCh(7, x, "C");

  // Spawn / NPCs / ? / M / H / F on the standing row (ROWS - 5 = 9)
  const standY = ROWS - 5;
  setCh(standY, opts.spawn, "S");
  for (const gx of opts.npcGxs) setCh(standY, gx, "N");
  setCh(standY, opts.qBlock, "?");
  setCh(standY, opts.minigame, "M");
  setCh(standY, opts.secret, "H");
  const flag = opts.flagAt ?? W - 2;
  setCh(standY, flag, "F");

  return "\n" + rows.map((r) => r.join("")).join("\n") + "\n";
}

// ─── HOME (prologue, small) ────────────────────────────────────
const HOME: Level = {
  id: "home", index: 0, name: "Home",
  era: "Bedroom · The Prologue",
  blurb: "Where the curiosity began.",
  story: "BEDROOM. A CRT, a guitar, a stack of books.\nHold SPACE to charge a jump. Walk right when you're ready.",
  palette: {
    sky: "#a8b4d8", skyMid: "#c8b8d4", skyLow: "#e8c4b0",
    ground: "#3a2c4a", groundTop: "#7a5a78",
    brick: "#9a7ab0", brickShade: "#5a3f7a",
    accent: "#fff0c8", accentDim: "#d4b888",
    pipe: "#7a5fa0", pipeShade: "#3f2a5a",
  },
  parallax: ["stars"],
  metrics: { role: "Prologue", years: "Bedroom", outcome: "Where the curiosity began.",
    bullets: ["Books, a guitar, a CRT, dial-up", "← → walk · SPACE jump · E talk", "Walk right when you're ready"] },
  map: buildMap({ width: 36, spawn: 2, npcGxs: [6], qBlock: 14, minigame: 28, secret: 22,
    coinTopGxs: [6, 19], coinMidGxs: [], platforms: [[4, 4], [19, 4]], flagAt: 34 }),
  spawn: { gx: 2, gy: 9 },
  coins: [{ gx: 6, gy: 3, skill: "Curiosity" }, { gx: 19, gy: 3, skill: "Restlessness" }],
  npcs: [{
    gx: 6, gy: 9, name: "Welcome", role: "Bedroom · The Prologue", portrait: "founder", hue: 220, beat: "did",
    quote: "This is a portfolio you walk through. 15 years of building, told as a side-scroller.\n\nMove right with ← →. Press space to jump. Each chapter is a real company I built.",
  }],
  clipping: { gx: 14, gy: 9, title: "Why a playable portfolio", source: "About",
    body: "A résumé is a list. A portfolio is a walk-through.\n\nFifteen years of starting things. Keep walking right and you'll meet every chapter." },
  secret: { gx: 22, gy: 9, title: "Tutorial",
    body: "← → walk · SHIFT run · SPACE (hold) charged jump · SPACE again mid-air = double jump · E talk/read · TAB bag · click a node above to fast-travel." },
  minigame: { gx: 28, gy: 9, id: "rhythm-tap", label: "Warm-up: tap to the beat" },
  cumulativeSkillsAtClear: [],
};

// ─── ORIGIN (Bengaluru, 60w) ───────────────────────────────────
const ORIGIN: Level = {
  id: "origin", index: 1, name: "Origin",
  era: "Bengaluru · The Beginning",
  blurb: "Where the story starts.",
  story: "BENGALURU. Builder. Designer. Creative Director. Music Producer.\nA serial entrepreneur — before Indian tech had a bleeding edge.",
  palette: {
    sky: "#f7d6b3", skyMid: "#f5b78a", skyLow: "#c98968",
    ground: "#5e3a25", groundTop: "#9a6b3f",
    brick: "#c9874a", brickShade: "#7a4d28",
    accent: "#fff1b0", accentDim: "#e6c47a",
    pipe: "#a85d2c", pipeShade: "#5a3014",
  },
  parallax: ["city"],
  metrics: { role: "Beginning · Bengaluru", years: "Pre-2010", outcome: "Curiosity → craft → companies.",
    bullets: ["Self-taught code, design & music", "Built before there was a scene", "Learned by shipping"] },
  map: buildMap({ width: 60, spawn: 2, npcGxs: [5, 38], qBlock: 22, minigame: 46, secret: 52,
    coinTopGxs: [8, 24, 42, 54], coinMidGxs: [14, 32], platforms: [[6, 5], [22, 5], [44, 5]] }),
  coins: [
    { gx: 8, gy: 3, skill: "Vision" }, { gx: 24, gy: 3, skill: "Storytelling" },
    { gx: 42, gy: 3, skill: "Taste" }, { gx: 54, gy: 3, skill: "Hustle" },
    { gx: 14, gy: 7, skill: "First-principles" }, { gx: 32, gy: 7, skill: "Curiosity" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Param Minhas", role: "Builder · Designer · Director", portrait: "founder", hue: 280, beat: "did",
      quote: "Builder. Designer. Creative Director. Music Producer.\n\nA serial entrepreneur across ecommerce, real estate, AI, sneaker culture, and now marketing and music. Fifteen years of founding, failing, learning, and building again." },
    { gx: 38, gy: 9, name: "The Throughline", role: "What ties it all together", portrait: "celeb", hue: 30, beat: "learned",
      quote: "Every chapter compounds. Nothing you build is wasted — the skills from each era feed the next one.\n\nA portfolio is proof of curiosity. That drive is the only constant." },
  ],
  clipping: { gx: 22, gy: 9, title: "Why this matters", source: "Param Minhas · 2010 → now",
    body: "A career is just a portfolio of bets and what you learned from each one.\n\nFifteen years of starting things — some scaled, some sold, some still going. That range is the point." },
  secret: { gx: 52, gy: 9, title: "Origin Story",
    body: "First computer at 9. First band at 13. First product at 19. First company at 21. None of it was a plan — all of it was inevitable." },
  minigame: { gx: 46, gy: 9, id: "price-match", label: "Warm-up: spot the lowest price" },
  cumulativeSkillsAtClear: [],
};

// ─── GETRIGHTPRICE (55w) ───────────────────────────────────────
const GRP: Level = {
  id: "grp", index: 2, name: "GetRightPrice",
  era: "2010 · First Startup",
  blurb: "India's first price comparison engine. Built in college.",
  story: "GETRIGHTPRICE — comparing electronics across Indian e-commerce before the market existed.\nBacked by Sidharth Rao of Webchutney.",
  palette: {
    sky: "#cfe7c2", skyMid: "#a8d39a", skyLow: "#6fa86c",
    ground: "#2c4a2a", groundTop: "#5a8c4a",
    brick: "#7c5a2e", brickShade: "#4a3418",
    accent: "#fff2a8", accentDim: "#d4c068",
    pipe: "#3f7a3a", pipeShade: "#1f4a1c",
  },
  parallax: ["trees"],
  metrics: { role: "Founding member · GetRightPrice", years: "2010 · College",
    outcome: "India's first price-comparison engine. Angel-backed.",
    bullets: ["Backed by Sidharth Rao (Webchutney)", "Web-scaled e-commerce data", "0→1 product, in college"] },
  map: buildMap({ width: 55, spawn: 2, npcGxs: [6, 34], qBlock: 20, minigame: 42, secret: 48,
    coinTopGxs: [10, 24, 40], coinMidGxs: [16, 30], platforms: [[8, 4], [22, 4], [38, 4]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Product 0→1" }, { gx: 24, gy: 3, skill: "Web scraping" },
    { gx: 40, gy: 3, skill: "Scrappy execution" }, { gx: 16, gy: 7, skill: "Early growth" },
    { gx: 30, gy: 7, skill: "Founding-team" }, { gx: 50, gy: 3, skill: "Resilience" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "GetRightPrice", role: "Founding team · 2010 · Bengaluru", portrait: "founder", hue: 100, beat: "did",
      quote: "Founding team of one of India's first price-comparison engines for electronics. Backed by Sidharth Rao of Webchutney.\n\nBuilt in college — before Indian ecommerce was a real market." },
    { gx: 34, gy: 9, name: "What it taught me", role: "First-mover lessons", portrait: "investor", hue: 140, beat: "learned",
      quote: "How ecommerce actually works — cataloguing, pricing logic, affiliate models, crawling inventory at scale.\n\nAnd that shipping beats permission. Every time." },
  ],
  clipping: { gx: 20, gy: 9, title: "Why being early mattered", source: "GetRightPrice · ~2010",
    body: "Being in the room before Flipkart and Amazon dominated India meant understanding the market from first principles.\n\nFirst-mover pattern recognition you have to live to learn." },
  secret: { gx: 48, gy: 9, title: "Lessons from #1",
    body: "First company taught everything: the market is real even when the category isn't. Shipping beats permission." },
  minigame: { gx: 42, gy: 9, id: "price-match", label: "Mini-game: pick the lowest price" },
  cumulativeSkillsAtClear: ["Vision", "Storytelling", "Taste"],
};

// ─── HAB HOUSING (55w) ─────────────────────────────────────────
const HAB: Level = {
  id: "hab", index: 3, name: "Hab Housing",
  era: "2012 · Real Estate",
  blurb: "Standardised budget rentals. ₹1Cr revenue. Bootstrapped.",
  story: "HAB HOUSING — same problem as OYO, same time, no VC money.\nScaled to ₹1Cr in revenue. Pure hustle.",
  palette: {
    sky: "#ffd1a3", skyMid: "#f6a268", skyLow: "#b06138",
    ground: "#3a1f10", groundTop: "#8c4f24",
    brick: "#c47833", brickShade: "#7a4318",
    accent: "#ffe2a8", accentDim: "#e6b070",
    pipe: "#a05420", pipeShade: "#5a2c0c",
  },
  parallax: ["apartments"],
  metrics: { role: "Founder · Hab Housing", years: "2012-13",
    outcome: "₹1Cr revenue. Bootstrapped. Same playbook as OYO, no VC.",
    bullets: ["Standardised budget rentals", "₹1 crore revenue, no funding", "Sold operations & moved on"] },
  map: buildMap({ width: 55, spawn: 2, npcGxs: [6, 34], qBlock: 20, minigame: 42, secret: 48,
    coinTopGxs: [10, 24, 40], coinMidGxs: [16, 30], platforms: [[8, 4], [22, 4], [38, 4]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Operations" }, { gx: 24, gy: 3, skill: "Unit economics" },
    { gx: 40, gy: 3, skill: "Sales" }, { gx: 16, gy: 7, skill: "Bootstrapping" },
    { gx: 30, gy: 7, skill: "Hospitality" }, { gx: 50, gy: 3, skill: "P&L" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "Hab Housing", role: "Founder · 2012 · Bengaluru", portrait: "founder", hue: 25, beat: "did",
      quote: "Standardised budget rental housing across Bengaluru — the same problem OYO was solving, at exactly the same time, without VC money.\n\nScaled to ₹1 crore in revenue. Pure operational discipline." },
    { gx: 34, gy: 9, name: "What ₹1Cr taught me", role: "Bootstrapping with no safety net", portrait: "tenant", hue: 30, beat: "learned",
      quote: "Operations, unit economics, customer acquisition, retention — all without a safety net.\n\nWhen there is no VC money, every decision is real. That discipline never leaves you." },
  ],
  clipping: { gx: 20, gy: 9, title: "Why ₹1Cr bootstrapped matters", source: "Hab Housing · 2012-13",
    body: "Proving you can build ₹1Cr in revenue with zero external capital is the most important thing a founder can do.\n\nWe saw the playbook OYO would run, didn't have the appetite to raise the war chest, sold ops and took the lessons." },
  secret: { gx: 48, gy: 9, title: "Why I left",
    body: "We saw the playbook OYO would run. We didn't have the appetite to raise the war chest. Sold the operations, took the lessons." },
  minigame: { gx: 42, gy: 9, id: "stack-blocks", label: "Mini-game: stack the apartments" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Web scraping", "Founding-team"],
};

// ─── AI / OCTO / QUARTIC (55w) ─────────────────────────────────
const AI: Level = {
  id: "ai", index: 4, name: "AI Era",
  era: "2013-17 · Octo → Quartic.ai",
  blurb: "India's first chatbot product. Founding team of Octo. Director of Marketing at Quartic.ai.",
  story: "CHATBOT (2013) → OCTO → QUARTIC.AI.\nFounding team of one of India's earliest AI products.",
  palette: {
    sky: "#3d4a78", skyMid: "#4f5a92", skyLow: "#2a3358",
    ground: "#101a30", groundTop: "#2a3a5a",
    brick: "#4a6e9a", brickShade: "#26385a",
    accent: "#9fe8ff", accentDim: "#6fb6cc",
    pipe: "#3a6280", pipeShade: "#1f3548",
  },
  parallax: ["racks", "stars"],
  metrics: { role: "Founding team Octo · Director Marketing Quartic.ai", years: "2013-17",
    outcome: "One of India's first chatbot products. Acquired.",
    bullets: ["Conversational AI in 2013 — early as it gets", "Octo acquired by Quartic.ai", "Took industrial AI story global"] },
  map: buildMap({ width: 55, spawn: 2, npcGxs: [6, 34], qBlock: 20, minigame: 42, secret: 48,
    coinTopGxs: [10, 24, 40], coinMidGxs: [16, 30], platforms: [[8, 4], [22, 4], [38, 4]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Conversational AI" }, { gx: 24, gy: 3, skill: "MarTech" },
    { gx: 40, gy: 3, skill: "Enterprise AI" }, { gx: 16, gy: 7, skill: "Director-level marketing" },
    { gx: 30, gy: 7, skill: "M&A integration" }, { gx: 50, gy: 3, skill: "Pioneer mindset" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "Octo → Quartic.ai", role: "Founding team · 2013 · India", portrait: "engineer", hue: 195, beat: "did",
      quote: "Founding team of one of India's first chatbot products in 2013. Then founding team of Octo — a marketing platform years ahead of its time.\n\nOcto was acquired by Quartic.ai. I became Director of Marketing post-acquisition." },
    { gx: 34, gy: 9, name: "What AI taught me", role: "Product marketing & UX, the hard way", portrait: "investor", hue: 200, beat: "learned",
      quote: "How to translate deeply technical products into things humans actually want to use.\n\nClosing the gap between what engineers build and what users understand — that's the whole job." },
  ],
  clipping: { gx: 20, gy: 9, title: "Why being on an AI team in 2013 mattered", source: "Octo → Quartic.ai",
    body: "Being on a founding AI team in 2013 is rare pattern recognition.\n\nNow every demo deck has 'conversational AI' on slide 2. Being early is the same as being wrong, until it isn't." },
  secret: { gx: 48, gy: 9, title: "Before it was cool",
    body: "We pitched 'conversational AI' in 2013 and got blank stares. Now every deck has it on slide 2." },
  minigame: { gx: 42, gy: 9, id: "chat-match", label: "Mini-game: match the chatbot reply" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Operations", "Bootstrapping", "Sales"],
};

// ─── INVESTOPAD (55w) ──────────────────────────────────────────
const INVESTOPAD: Level = {
  id: "investopad", index: 5, name: "Investopad",
  era: "Growth & Tech Partner",
  blurb: "Built Fund 0 with Rohan & Arjun Malhotra.",
  story: "INVESTOPAD — the family office of Rohan & Arjun Malhotra.\nPartner for Growth & Technology. Built Fund 0 from scratch.",
  palette: {
    sky: "#5a3a72", skyMid: "#7a4a8c", skyLow: "#3a2050",
    ground: "#1c0e2c", groundTop: "#3a2050",
    brick: "#9a6fc4", brickShade: "#5a3a78",
    accent: "#f0c4ff", accentDim: "#b88ad4",
    pipe: "#7a4cb0", pipeShade: "#3f2266",
  },
  parallax: ["stars"],
  metrics: { role: "Partner · Growth & Tech · Investopad", years: "Post-Octo",
    outcome: "Built Fund 0 with Rohan & Arjun Malhotra.",
    bullets: ["Capital × tech × growth strategy", "Portfolio support & sourcing", "Operator → investor → operator"] },
  map: buildMap({ width: 55, spawn: 2, npcGxs: [6, 34], qBlock: 20, minigame: 42, secret: 48,
    coinTopGxs: [10, 24, 40], coinMidGxs: [16, 30], platforms: [[8, 4], [22, 4], [38, 4]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Venture strategy" }, { gx: 24, gy: 3, skill: "Capital allocation" },
    { gx: 40, gy: 3, skill: "Growth partnerships" }, { gx: 16, gy: 7, skill: "Portfolio support" },
    { gx: 30, gy: 7, skill: "Network" }, { gx: 50, gy: 3, skill: "Deal sense" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "Investopad", role: "Growth & Tech Partner · Fund 0", portrait: "investor", hue: 270, beat: "did",
      quote: "Partner for Growth and Technology at Investopad — the family office of Rohan and Arjun Malhotra.\n\nHelped build their Fund 0 from scratch: deal sourcing, portfolio analysis, founder relationships, growth strategy." },
    { gx: 34, gy: 9, name: "What the fund taught me", role: "The other side of the table", portrait: "founder", hue: 300, beat: "learned",
      quote: "Fund formation, VC partnership dynamics, how to analyse early-stage companies, and what separates investable founders from good ones.\n\nSeeing deals from the other side of the table changes how you raise — forever." },
  ],
  clipping: { gx: 20, gy: 9, title: "Why an operator should sit inside a fund", source: "Investopad · Fund 0",
    body: "Most founders only ever see VC from the pitch side. Sitting inside a fund gives you an entirely different lens.\n\nUnderstanding how money thinks is an unfair advantage when you're the one raising." },
  secret: { gx: 48, gy: 9, title: "From operator to investor and back",
    body: "Six months on the cap table side teaches you more about being a founder than six years on the founder side." },
  minigame: { gx: 42, gy: 9, id: "pick-unicorn", label: "Mini-game: pick the unicorn" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Operations", "Conversational AI", "Director-level marketing"],
};

// ─── SOLESEARCH (160w · HERO CHAPTER) ──────────────────────────
const SOLE: Level = {
  id: "sole", index: 6, name: "SoleSearch",
  era: "2020-24 · CEO · $795K Raised",
  blurb: "India's leading sneaker, streetwear & collectibles platform. CNBC-TV18 featured.",
  story: "SOLESEARCH — co-founded with Prabal Baghla. Joined by Rannvijay Singha.\n$795K raised. CNBC-TV18. The biggest chapter — the most was built here.",
  palette: {
    sky: "#2a1238", skyMid: "#4a1a52", skyLow: "#1a0820",
    ground: "#150818", groundTop: "#3a1438",
    brick: "#c0388c", brickShade: "#7a1f5a",
    accent: "#ff9fd4", accentDim: "#cc6fa8",
    pipe: "#9a2f78", pipeShade: "#4a1240",
  },
  parallax: ["shelves"],
  metrics: { role: "Co-founder & CEO · SoleSearch", years: "2020-24",
    outcome: "$795K raised. India's leading sneaker & streetwear platform.",
    bullets: ["Joined by Rannvijay Singha", "Featured on CNBC-TV18", "350K+ followers · Mumbai + Hyderabad retail"] },
  map: buildMap({
    width: 160, spawn: 2,
    npcGxs: [6, 38, 78, 118, 144],
    qBlock: 22,
    minigame: 96,
    secret: 134,
    coinTopGxs: [10, 26, 42, 58, 72, 88, 104, 122, 138, 152],
    coinMidGxs: [16, 32, 50, 64, 82, 100, 116, 130, 148],
    platforms: [[8, 5], [24, 5], [44, 6], [62, 5], [82, 6], [102, 5], [124, 6], [146, 5]],
  }),
  coins: [
    { gx: 10, gy: 3, skill: "CEO" }, { gx: 26, gy: 3, skill: "Fundraising · $795K" },
    { gx: 42, gy: 3, skill: "Brand building" }, { gx: 58, gy: 3, skill: "Retail ops" },
    { gx: 72, gy: 3, skill: "PR & Press" }, { gx: 88, gy: 3, skill: "Community · 350K" },
    { gx: 104, gy: 3, skill: "Live events" }, { gx: 122, gy: 3, skill: "Authentication" },
    { gx: 138, gy: 3, skill: "Streetwear" }, { gx: 152, gy: 3, skill: "Drops & hype" },
    { gx: 16, gy: 7, skill: "Storytelling at scale" }, { gx: 32, gy: 7, skill: "Influencer ops" },
    { gx: 50, gy: 7, skill: "Capital strategy" }, { gx: 64, gy: 7, skill: "DTC commerce" },
    { gx: 82, gy: 7, skill: "Brand × culture" }, { gx: 100, gy: 7, skill: "Viral content" },
    { gx: 116, gy: 7, skill: "Series A learnings" }, { gx: 130, gy: 7, skill: "Founder grit" },
    { gx: 148, gy: 7, skill: "Beautiful exits" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "SoleSearch", role: "Co-founder & CEO · 2020-24", portrait: "celeb", hue: 330, beat: "did",
      quote: "Co-founded India's leading sneaker and streetwear platform with Prabal Baghla. Later joined by Rannvijay Singha.\n\nRaised $795K from Venture Catalysts, Anthill Ventures and Cornerstone. Stores in Mumbai and Hyderabad. Featured on CNBC-TV18." },
    { gx: 38, gy: 9, name: "Prabal Baghla", role: "Co-founder · Operations & retail", portrait: "founder", hue: 320, beat: "did",
      quote: "Co-founded SoleSearch with me. Built the retail ops, the warehouses, the authentication pipeline.\n\nTwo founders, one product, one country to convince. India had no sneaker culture — we built it." },
    { gx: 78, gy: 9, name: "Rannvijay Singha", role: "Partner · Brand & culture", portrait: "celeb", hue: 0, beat: "did",
      quote: "Joined SoleSearch as a partner — bringing reach, brand, and the streetwear credibility India needed.\n\nLive events, curated drops, the face of the movement." },
    { gx: 118, gy: 9, name: "What culture taught me", role: "Building a movement, not a store", portrait: "investor", hue: 340, beat: "learned",
      quote: "How to raise money. How to build a social movement — 350K+ followers, millions of viral reels, 20K YouTube, 30+ live events.\n\nHow to move culture through content, community, and live experiences." },
    { gx: 144, gy: 9, name: "The Press", role: "What CNBC, YourStory & ET said", portrait: "fan", hue: 320, beat: "learned",
      quote: "Featured on CNBC-TV18, YourStory, Economic Times, and dozens of culture publications.\n\nOpen the press kiosk on the SoleSearch level to see live mentions — the wall is alive." },
  ],
  clipping: { gx: 22, gy: 9, title: "Why SoleSearch still matters", source: "SoleSearch · 2020-2024 · CNBC-TV18",
    body: "SoleSearch did not just sell sneakers — it created India's sneaker culture.\n\nThe brand, community, events, and media — all built from zero. Series A did not close in time. Sold for parts. The cultural impact is permanent." },
  secret: { gx: 134, gy: 9, title: "Why we sold for parts",
    body: "Series A didn't close in time. We chose to sell rather than die slow. The brand still shapes Indian sneaker culture. Sometimes a beautiful exit is the right end of a beautiful chapter." },
  minigame: { gx: 96, gy: 9, id: "spot-fake", label: "Mini-game: real or fake?" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "Director-level marketing", "Venture strategy", "Capital allocation"],
};

// ─── CATS CAN DANCE (70w · music label + pet culture ONLY) ────
const CCD: Level = {
  id: "ccd", index: 7, name: "Cats Can Dance",
  era: "Now · Music Label + Pet Culture",
  blurb: "India's first cat-forward music label & pet culture brand.",
  story: "CATS CAN DANCE — a music label and pet culture brand.\nWhere creativity lives without a brief — music, play, and a soft spot for cats.",
  palette: {
    sky: "#1c1228", skyMid: "#3a1f3a", skyLow: "#5a2c2c",
    ground: "#180c0a", groundTop: "#3a1c14",
    brick: "#c47844", brickShade: "#7a4318",
    accent: "#ffd29a", accentDim: "#cc9966",
    pipe: "#a85a28", pipeShade: "#5a2c10",
  },
  parallax: ["desk"],
  metrics: { role: "Founder · Cats Can Dance", years: "Now",
    outcome: "Music label + pet culture brand. The work that exists because it has to.",
    bullets: ["Original music releases", "Pet-forward brand world", "Live events + creative IP"] },
  map: buildMap({ width: 70, spawn: 2, npcGxs: [6, 36, 54], qBlock: 22, minigame: 48, secret: 62,
    coinTopGxs: [10, 26, 42, 58], coinMidGxs: [16, 32, 50],
    platforms: [[8, 5], [24, 5], [40, 5], [56, 5]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Music production" }, { gx: 26, gy: 3, skill: "Label A&R" },
    { gx: 42, gy: 3, skill: "Pet brand IP" }, { gx: 58, gy: 3, skill: "Live events" },
    { gx: 16, gy: 7, skill: "Creative direction" }, { gx: 32, gy: 7, skill: "Storytelling" },
    { gx: 50, gy: 7, skill: "Community building" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "Cats Can Dance", role: "Music label · Pet culture brand", portrait: "client", hue: 30, beat: "did",
      quote: "A music and pet-forward creative brand. We release original music, build a world for pets and the people who love them, and run live events that exist because they have to.\n\nNo brief. No client. Just the work." },
    { gx: 36, gy: 9, name: "The Music", role: "Releases & sound", portrait: "fan", hue: 25, beat: "did",
      quote: "Original music as a label. Production, mixing, and releasing into the wild — Spotify, Apple Music, the lot.\n\nMusic was the first language. It's the one that never left." },
    { gx: 54, gy: 9, name: "What the soft thing taught me", role: "Why creativity needs a home", portrait: "fan", hue: 35, beat: "learned",
      quote: "Every commercial career needs a non-commercial home — that's where the soul lives.\n\nCats Can Dance is the proof of life. The thing that exists because it has to, not because someone paid for it." },
  ],
  clipping: { gx: 22, gy: 9, title: "Why a label, why cats", source: "Cats Can Dance · Now",
    body: "Companies and music both start with silence. Cats Can Dance is a music label and a pet-culture brand built on the same instinct: make things that move people.\n\nIt's intentionally small. It's intentionally weird. That's the point." },
  secret: { gx: 62, gy: 9, title: "What's next for the label",
    body: "More releases. More live shows. More cats. If you're an artist, a label, or a sponsor with taste — let's talk." },
  minigame: { gx: 48, gy: 9, id: "rhythm-tap", label: "Mini-game: tap to the beat" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "Director-level marketing", "Venture strategy", "CEO", "Fundraising · $795K", "Brand building"],
};

// ─── ITERATE (70w · AI-led marketing agency · NEW chapter) ────
const ITERATE: Level = {
  id: "iterate", index: 8, name: "Iterate",
  era: "Now · AI-led Marketing Agency",
  blurb: "AI-native marketing agency. 15 years of building, pointed at one target.",
  story: "ITERATE — an AI-led marketing agency.\nThe convergence of 15 years of building, brand, technology, and culture, moving at the speed of AI.",
  palette: {
    sky: "#0b1830", skyMid: "#173255", skyLow: "#0a1428",
    ground: "#06101e", groundTop: "#1a2c4e",
    brick: "#4a8cc4", brickShade: "#1f4a78",
    accent: "#7ce0ff", accentDim: "#5aa0c4",
    pipe: "#3a6e9a", pipeShade: "#1a3858",
  },
  parallax: ["racks", "stars"],
  metrics: { role: "Founder · Iterate", years: "Now",
    outcome: "AI-native marketing agency. Speed × strategy × creativity.",
    bullets: ["AI workflows for brand & growth", "Strategy + creative + tech in one room", "Built on 15 years of operator instinct"] },
  map: buildMap({ width: 70, spawn: 2, npcGxs: [6, 36, 54], qBlock: 22, minigame: 48, secret: 62,
    coinTopGxs: [10, 26, 42, 58], coinMidGxs: [16, 32, 50],
    platforms: [[8, 5], [24, 5], [40, 5], [56, 5]] }),
  coins: [
    { gx: 10, gy: 3, skill: "AI-led marketing" }, { gx: 26, gy: 3, skill: "Brand systems" },
    { gx: 42, gy: 3, skill: "Growth engineering" }, { gx: 58, gy: 3, skill: "Founder coaching" },
    { gx: 16, gy: 7, skill: "Prompt strategy" }, { gx: 32, gy: 7, skill: "Taste-as-strategy" },
    { gx: 50, gy: 7, skill: "Speed × craft" },
  ],
  npcs: [
    { gx: 6, gy: 9, name: "Iterate", role: "Founder · AI-led marketing agency", portrait: "engineer", hue: 200, beat: "did",
      quote: "An AI-led marketing agency. The convergence of 15 years of building, growth strategy, brand, technology, and culture into something that moves at the speed of AI.\n\nWe iterate, ship, and compound — the way operators do." },
    { gx: 36, gy: 9, name: "How we work", role: "Strategy + creative + tech", portrait: "client", hue: 210, beat: "did",
      quote: "Strategy, creative, and technology in the same room. AI workflows where it makes the work better — not where it makes the work cheaper.\n\nFor founders who want a partner, not a vendor." },
    { gx: 54, gy: 9, name: "What AI doesn't replace", role: "Why taste still wins", portrait: "fan", hue: 195, beat: "learned",
      quote: "AI does not replace creative thinking — it amplifies it for people who already know what they're doing.\n\nSpeed plus strategy plus creativity is unbeatable. Every year of experience is a prompt." },
  ],
  clipping: { gx: 22, gy: 9, title: "Why AI-native, why now", source: "Iterate · Now",
    body: "The future of brands is AI-native. Iterate is what happens when an operator who has lived through ecommerce, housing, AI, VC, sneakers, and music points everything at one target.\n\nMarketing that compounds." },
  secret: { gx: 62, gy: 9, title: "Working with us",
    body: "If you're a founder who needs marketing that thinks like product — let's talk. We take a small number of partners per quarter." },
  minigame: { gx: 48, gy: 9, id: "chat-match", label: "Mini-game: pick the better prompt" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "Director-level marketing", "Venture strategy", "CEO", "Fundraising · $795K", "Brand building", "Music production"],
};

export const LEVELS: Level[] = [HOME, ORIGIN, GRP, HAB, AI, INVESTOPAD, SOLE, CCD, ITERATE];

export const CONTACT = {
  email: "minhas.param@gmail.com",
  site: "https://catscandance.com",
  linkedin: "https://www.linkedin.com/in/paramminhas/",
  twitter: "https://twitter.com/paramminhas",
  spotify: "#",
  resume: "#",
};

export const ALL_SKILLS_BY_LEVEL: Record<string, string[]> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l.coins.map((c) => c.skill)]),
);
