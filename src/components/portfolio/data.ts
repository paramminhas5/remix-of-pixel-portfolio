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
  isSideWorld?: boolean;
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
  coins: [{ gx: 6, gy: 3, skill: "Curiosity" }, { gx: 19, gy: 3, skill: "Self-direction" }],
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

// ─── ORIGIN (Bengaluru, 50w) ───────────────────────────────────
const ORIGIN: Level = {
  id: "origin", index: 1, name: "Origin",
  era: "Bengaluru · The Beginning",
  blurb: "Where the story starts.",
  story: "BENGALURU. Builder, designer, creative director, music producer.\nFifteen years of starting things, before Indian tech had a scene.",
  palette: {
    sky: "#f7d6b3", skyMid: "#f5b78a", skyLow: "#c98968",
    ground: "#5e3a25", groundTop: "#9a6b3f",
    brick: "#c9874a", brickShade: "#7a4d28",
    accent: "#fff1b0", accentDim: "#e6c47a",
    pipe: "#a85d2c", pipeShade: "#5a3014",
  },
  parallax: ["city"],
  metrics: { role: "Beginning · Bengaluru", years: "Pre-2010", outcome: "Self-taught code, design, music. Shipped early.",
    bullets: ["Self-taught across code, design, and music", "Built before there was a scene", "Learned by shipping"] },
  map: buildMap({ width: 50, spawn: 2, npcGxs: [5, 32], qBlock: 18, minigame: 38, secret: 44,
    coinTopGxs: [8, 22, 36, 46], coinMidGxs: [14, 28], platforms: [[6, 5], [22, 5], [38, 5]] }),
  coins: [
    { gx: 8, gy: 3, skill: "Vision" }, { gx: 22, gy: 3, skill: "Storytelling" },
    { gx: 36, gy: 3, skill: "Taste" }, { gx: 46, gy: 3, skill: "Hustle" },
    { gx: 14, gy: 7, skill: "Systems thinking" }, { gx: 28, gy: 7, skill: "Curiosity" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Param Minhas", role: "Builder · Designer · Director", portrait: "founder", hue: 280, beat: "did",
      quote: "Builder, designer, creative director, music producer.\n\nFifteen years across e-commerce, real estate, AI, sneaker culture, music, and AI-led marketing." },
    { gx: 32, gy: 9, name: "The throughline", role: "What ties it together", portrait: "celeb", hue: 30, beat: "learned",
      quote: "Each chapter compounds into the next. The skills carry over.\n\nThe only constant is shipping." },
  ],
  clipping: { gx: 18, gy: 9, title: "About this portfolio", source: "Param Minhas · 2010 → now",
    body: "A career as a portfolio of bets.\n\nFifteen years of starting things — some scaled, some sold, some still going." },
  secret: { gx: 44, gy: 9, title: "Origin",
    body: "First computer at 9. First band at 13. First product at 19. First company at 21." },
  minigame: { gx: 38, gy: 9, id: "price-match", label: "Warm-up: spot the lowest price" },
  cumulativeSkillsAtClear: [],
};

// ─── GETRIGHTPRICE (45w) ───────────────────────────────────────
const GRP: Level = {
  id: "grp", index: 2, name: "GetRightPrice",
  era: "2010 · First Startup",
  blurb: "India's first price comparison engine. Built in college.",
  story: "GETRIGHTPRICE — comparing electronics across Indian e-commerce before the market existed.\nAngel-backed by Sidharth Rao (Webchutney).",
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
    bullets: ["Founding team, in college", "Angel-backed by Sidharth Rao (Webchutney)", "Built the catalog and crawl pipeline"] },
  map: buildMap({ width: 45, spawn: 2, npcGxs: [5, 28], qBlock: 16, minigame: 34, secret: 40,
    coinTopGxs: [9, 20, 32], coinMidGxs: [14, 26], platforms: [[7, 4], [20, 4], [32, 4]] }),
  coins: [
    { gx: 9, gy: 3, skill: "Product 0→1" }, { gx: 20, gy: 3, skill: "Web scraping" },
    { gx: 32, gy: 3, skill: "Lean execution" }, { gx: 14, gy: 7, skill: "Early growth" },
    { gx: 26, gy: 7, skill: "Co-founding" }, { gx: 42, gy: 3, skill: "Resilience" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "GetRightPrice", role: "Founding team · 2010", portrait: "founder", hue: 100, beat: "did",
      quote: "Founding team of one of India's first price-comparison engines for electronics. Built in college.\n\nAngel-backed by Sidharth Rao of Webchutney." },
    { gx: 28, gy: 9, name: "What it taught me", role: "First-mover lessons", portrait: "investor", hue: 140, beat: "learned",
      quote: "Cataloguing, pricing logic, affiliate models, crawling inventory at scale.\n\nFirst company. First proof I could ship." },
  ],
  clipping: { gx: 16, gy: 9, title: "Being early in Indian e-commerce", source: "GetRightPrice · 2010",
    body: "Built before Flipkart and Amazon dominated India. Working at the catalog layer meant understanding the market from first principles." },
  secret: { gx: 40, gy: 9, title: "Lessons from #1",
    body: "The market is real even when the category isn't. Shipping beats permission." },
  minigame: { gx: 34, gy: 9, id: "price-match", label: "Mini-game: pick the lowest price" },
  cumulativeSkillsAtClear: ["Vision", "Storytelling", "Taste"],
};

// ─── HAB HOUSING (45w) ─────────────────────────────────────────
const HAB: Level = {
  id: "hab", index: 3, name: "Hab Housing",
  era: "2012 · Real Estate",
  blurb: "Standardised budget rentals. ₹1Cr revenue. Bootstrapped.",
  story: "HAB HOUSING — same problem as OYO, same time, no VC money.\nScaled to ₹1Cr in revenue, then sold ops.",
  palette: {
    sky: "#ffd1a3", skyMid: "#f6a268", skyLow: "#b06138",
    ground: "#3a1f10", groundTop: "#8c4f24",
    brick: "#c47833", brickShade: "#7a4318",
    accent: "#ffe2a8", accentDim: "#e6b070",
    pipe: "#a05420", pipeShade: "#5a2c0c",
  },
  parallax: ["apartments"],
  metrics: { role: "Founder · Hab Housing", years: "2012-13",
    outcome: "₹1Cr revenue. Bootstrapped. Sold operations.",
    bullets: ["Standardised budget rentals across Bengaluru", "₹1 crore revenue, zero external capital", "Sold operations and moved on"] },
  map: buildMap({ width: 45, spawn: 2, npcGxs: [5, 28], qBlock: 16, minigame: 34, secret: 40,
    coinTopGxs: [9, 20, 32], coinMidGxs: [14, 26], platforms: [[7, 4], [20, 4], [32, 4]] }),
  coins: [
    { gx: 9, gy: 3, skill: "Operations" }, { gx: 20, gy: 3, skill: "Unit economics" },
    { gx: 32, gy: 3, skill: "Sales" }, { gx: 14, gy: 7, skill: "Bootstrapping" },
    { gx: 26, gy: 7, skill: "Hospitality" }, { gx: 42, gy: 3, skill: "P&L management" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Hab Housing", role: "Founder · 2012", portrait: "founder", hue: 25, beat: "did",
      quote: "Standardised budget rental housing across Bengaluru — the same problem OYO solved at the same time, without VC money.\n\nScaled to ₹1 crore in revenue on operations alone." },
    { gx: 28, gy: 9, name: "What ₹1Cr taught me", role: "Bootstrapping with no safety net", portrait: "tenant", hue: 30, beat: "learned",
      quote: "Operations, unit economics, customer acquisition, retention — without a safety net.\n\nWith no VC money, every decision is real." },
  ],
  clipping: { gx: 16, gy: 9, title: "₹1Cr without funding", source: "Hab Housing · 2012-13",
    body: "Building ₹1Cr in revenue with zero external capital is real proof of operating discipline.\n\nWe ran the OYO playbook on cash flow alone, then sold ops." },
  secret: { gx: 40, gy: 9, title: "Why I left",
    body: "We saw the playbook OYO would run. Didn't have the appetite for that war chest. Sold ops, took the lessons." },
  minigame: { gx: 34, gy: 9, id: "stack-blocks", label: "Mini-game: stack the apartments" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Web scraping", "Founding-team"],
};

// ─── AI / OCTO / QUARTIC (45w) ─────────────────────────────────
const AI: Level = {
  id: "ai", index: 4, name: "Early AI Era",
  era: "2013-17 · Octo → Quartic.ai",
  blurb: "Built India's first AI chatbot (2013). Co-built Octo — an AI marketing platform. Acquired by Quartic.ai.",
  story: "2013: Built one of India's first AI chatbots.\nOCTO: Built the AI marketing platform on top of it with Akshaya Aron.\nQUARTIC.AI: Octo was acquired. Led marketing as Director.",
  palette: {
    sky: "#3d4a78", skyMid: "#4f5a92", skyLow: "#2a3358",
    ground: "#101a30", groundTop: "#2a3a5a",
    brick: "#4a6e9a", brickShade: "#26385a",
    accent: "#9fe8ff", accentDim: "#6fb6cc",
    pipe: "#3a6280", pipeShade: "#1f3548",
  },
  parallax: ["racks", "stars"],
  metrics: { role: "Founding team Octo · Director of Marketing, Quartic.ai", years: "2013-17",
    outcome: "Built India's first AI chatbot. Co-built Octo (AI marketing platform). Acquired by Quartic.ai.",
    bullets: ["Built one of India's first AI chatbots in 2013, before the category existed", "Co-built Octo — an AI marketing platform — with Akshaya Aron", "Octo acquired by Quartic.ai; led post-acquisition marketing as Director"] },
  map: buildMap({ width: 45, spawn: 2, npcGxs: [5, 20, 32], qBlock: 16, minigame: 34, secret: 40,
    coinTopGxs: [9, 24, 36], coinMidGxs: [14, 28], platforms: [[7, 4], [22, 4], [34, 4]] }),
  coins: [
    { gx: 9, gy: 3, skill: "Conversational AI" }, { gx: 24, gy: 3, skill: "Marketing platforms" },
    { gx: 36, gy: 3, skill: "Enterprise AI" }, { gx: 14, gy: 7, skill: "B2B marketing" },
    { gx: 28, gy: 7, skill: "Post-acquisition growth" }, { gx: 42, gy: 3, skill: "Early market entry" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Octo → Quartic.ai", role: "Founding team · 2013", portrait: "engineer", hue: 195, beat: "did",
      quote: "In 2013 we built one of India's first AI chatbots — before the word was common.\n\nOn top of that, we built Octo: an AI marketing platform. Octo was acquired by Quartic.ai. I led marketing there as Director." },
    { gx: 20, gy: 9, name: "Akshaya Aron", role: "Co-founder, Octo · CEO, Quartic.ai", portrait: "founder", hue: 185, beat: "did",
      quote: "Akshaya and I built Octo together — a chatbot that became an AI marketing platform.\n\nWhen Quartic.ai acquired us, I stayed on as Director of Marketing. A decade later, we're working together again at Fere.ai." },
    { gx: 32, gy: 9, name: "What AI taught me", role: "Product marketing, the hard way", portrait: "investor", hue: 200, beat: "learned",
      quote: "Translating deeply technical products into things people understand.\n\nClosing the gap between what engineers ship and what users see." },
  ],
  clipping: { gx: 16, gy: 9, title: "Building AI before it was a category", source: "Octo → Quartic.ai · 2013-17",
    body: "In 2013 we built a chatbot. Then Octo — an AI marketing platform. Then Quartic acquired us.\n\nPitching 'conversational AI' got blank stares. Now it's on slide 2 of every deck. Being early is the same as being wrong, until it isn't." },
  secret: { gx: 40, gy: 9, title: "Before it was cool",
    body: "Built on early NLP stacks, sold into enterprise marketing. Acquired into industrial AI." },
  minigame: { gx: 34, gy: 9, id: "chat-match", label: "Mini-game: match the chatbot reply" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Operations", "Bootstrapping", "Sales"],
};

// ─── INVESTOPAD (55w) ──────────────────────────────────────────
// ─── INVESTOPAD (50w) ──────────────────────────────────────────
const INVESTOPAD: Level = {
  id: "investopad", index: 5, name: "Investopad",
  era: "Growth & Tech Partner",
  blurb: "Built Fund 0 with Rohan & Arjun Malhotra. Worked with Meesho, Entri, Simsim, Amazon, Forbes, top India funds.",
  story: "INVESTOPAD — family office of Rohan & Arjun Malhotra.\nPartner for Growth & Technology. Built Fund 0 from scratch.",
  palette: {
    sky: "#5a3a72", skyMid: "#7a4a8c", skyLow: "#3a2050",
    ground: "#1c0e2c", groundTop: "#3a2050",
    brick: "#9a6fc4", brickShade: "#5a3a78",
    accent: "#f0c4ff", accentDim: "#b88ad4",
    pipe: "#7a4cb0", pipeShade: "#3f2266",
  },
  parallax: ["stars"],
  metrics: { role: "Partner · Growth & Tech · Investopad", years: "Post-Octo",
    outcome: "Built Fund 0. Worked with Meesho, Entri, Simsim, Amazon, Forbes, top India funds.",
    bullets: [
      "Partner for Growth & Tech, building Fund 0 from scratch",
      "Companies worked with: Meesho, Entri, Simsim, Amazon, Forbes",
      "Engaged with most top-tier India venture funds",
      "Deal sourcing, portfolio support, growth strategy",
    ] },
  map: buildMap({ width: 50, spawn: 2, npcGxs: [5, 22, 38], qBlock: 16, minigame: 32, secret: 44,
    coinTopGxs: [10, 20, 30, 42], coinMidGxs: [14, 26, 36], platforms: [[8, 4], [22, 4], [36, 4]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Venture strategy" }, { gx: 20, gy: 3, skill: "Capital strategy" },
    { gx: 30, gy: 3, skill: "Partnership development" }, { gx: 42, gy: 3, skill: "Deal evaluation" },
    { gx: 14, gy: 7, skill: "Portfolio support" }, { gx: 26, gy: 7, skill: "Relationship building" },
    { gx: 36, gy: 7, skill: "Founder coaching" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Investopad", role: "Growth & Tech Partner · Fund 0", portrait: "investor", hue: 270, beat: "did",
      quote: "Partner for Growth and Technology at Investopad — family office of Rohan and Arjun Malhotra.\n\nHelped build Fund 0 from scratch: deal sourcing, portfolio analysis, founder relationships, growth strategy." },
    { gx: 22, gy: 9, name: "Companies worked with", role: "Operator support across the portfolio", portrait: "client", hue: 285, beat: "did",
      quote: "Worked closely with Meesho, Entri, Simsim, Amazon, Forbes — across growth, brand, and product strategy.\n\nAlongside most top-tier India venture funds." },
    { gx: 38, gy: 9, name: "What the fund taught me", role: "The other side of the table", portrait: "founder", hue: 300, beat: "learned",
      quote: "Fund formation, partnership dynamics, how early-stage companies are actually evaluated.\n\nSeeing deals from the cap-table side changes how you raise." },
  ],
  clipping: { gx: 16, gy: 9, title: "Operator inside a fund", source: "Investopad · Fund 0",
    body: "Helped build Fund 0 and supported portfolio companies including Meesho, Entri, Simsim, Amazon, and Forbes.\n\nDeal sourcing, growth, brand, product — operator inside a fund." },
  secret: { gx: 44, gy: 9, title: "Operator → investor → operator",
    body: "Time on the cap-table side teaches more about being a founder than years on the founder side." },
  minigame: { gx: 32, gy: 9, id: "pick-unicorn", label: "Mini-game: pick the unicorn" },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Operations", "Conversational AI", "Director-level marketing"],
};

// ─── SOLESEARCH (70w · hero, slightly larger) ──────────────────
const SOLE: Level = {
  id: "sole", index: 6, name: "SoleSearch",
  era: "2020-24 · CEO · $795K Raised",
  blurb: "India's leading sneaker, streetwear & collectibles platform. CNBC-TV18 featured.",
  story: "SOLESEARCH — co-founded with Prabal Baghla. Joined by Rannvijay Singha.\n$795K raised. 30+ events, ₹1cr+ in sales, ₹1cr+ in sponsorships.",
  palette: {
    sky: "#2a1238", skyMid: "#4a1a52", skyLow: "#1a0820",
    ground: "#150818", groundTop: "#3a1438",
    brick: "#c0388c", brickShade: "#7a1f5a",
    accent: "#ff9fd4", accentDim: "#cc6fa8",
    pipe: "#9a2f78", pipeShade: "#4a1240",
  },
  parallax: ["shelves"],
  metrics: { role: "Co-founder & CEO · SoleSearch", years: "2020-24",
    outcome: "$795K raised. 30+ events, ₹1cr+ sales, ₹1cr+ sponsorships. CNBC-TV18 featured.",
    bullets: [
      "Co-founded with Prabal Baghla. Joined by Rannvijay Singha as partner",
      "$795K raised — Venture Catalysts, Anthill Ventures, Cornerstone",
      "30+ live events, ₹1cr+ in event sales, ₹1cr+ in sponsorships",
      "Brand partners: Royal Enfield, boAt, Budweiser, 40+ homegrown labels",
      "Built SoleSearch Street — marketplace for Indian homegrown brands",
      "350K+ followers, retail in Mumbai and Hyderabad, CNBC-TV18 feature",
    ] },
  map: buildMap({
    width: 70, spawn: 2,
    npcGxs: [5, 18, 32, 48, 62],
    qBlock: 12, minigame: 42, secret: 56,
    coinTopGxs: [9, 16, 24, 30, 38, 46, 54, 64],
    coinMidGxs: [14, 22, 28, 36, 44, 52, 60, 66],
    platforms: [[7, 5], [20, 5], [34, 5], [48, 5], [60, 5]],
  }),
  coins: [
    { gx: 9, gy: 3, skill: "CEO" }, { gx: 16, gy: 3, skill: "Fundraising" },
    { gx: 24, gy: 3, skill: "Brand building" }, { gx: 30, gy: 3, skill: "Retail ops" },
    { gx: 38, gy: 3, skill: "PR & Press" }, { gx: 46, gy: 3, skill: "Community building" },
    { gx: 54, gy: 3, skill: "Event production" }, { gx: 64, gy: 3, skill: "Brand sponsorships" },
    { gx: 14, gy: 7, skill: "Growth storytelling" }, { gx: 22, gy: 7, skill: "Influencer marketing" },
    { gx: 28, gy: 7, skill: "Capital strategy" }, { gx: 36, gy: 7, skill: "DTC commerce" },
    { gx: 44, gy: 7, skill: "Culture marketing" }, { gx: 52, gy: 7, skill: "Marketplace operations" },
    { gx: 60, gy: 7, skill: "Startup scaling" }, { gx: 66, gy: 7, skill: "Strategic exits" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "SoleSearch", role: "Co-founder & CEO · 2020-24", portrait: "celeb", hue: 330, beat: "did",
      quote: "Co-founded India's leading sneaker and streetwear platform with Prabal Baghla. Later joined by Rannvijay Singha.\n\nRaised $795K. Stores in Mumbai and Hyderabad. Featured on CNBC-TV18." },
    { gx: 18, gy: 9, name: "Prabal Baghla", role: "Co-founder · Operations & retail", portrait: "founder", hue: 320, beat: "did",
      quote: "Co-founded SoleSearch. Built retail ops, warehousing, the authentication pipeline.\n\nIndia had no sneaker culture — we built it." },
    { gx: 32, gy: 9, name: "Events · ₹1cr+ in sales", role: "30+ live events, ₹1cr+ sponsorships", portrait: "fan", hue: 310, beat: "did",
      quote: "Ran 30+ live events across India. ₹1cr+ in event sales, ₹1cr+ in sponsorships.\n\nBrand partners: Royal Enfield, boAt, Budweiser, plus 40+ homegrown labels." },
    { gx: 48, gy: 9, name: "SoleSearch Street", role: "Marketplace for India's homegrown brands", portrait: "client", hue: 350, beat: "did",
      quote: "Built SoleSearch Street — a marketplace for Indian homegrown streetwear and lifestyle brands.\n\nGave 40+ small Indian labels their first real distribution." },
    { gx: 55, gy: 9, name: "Business of Fashion", role: "Press · Global fashion media", portrait: "client", hue: 345, beat: "did",
      quote: "One likely contender [in India's streetwear scene] is Param Minhas, co-founder of SoleSearch.\n\nSoleSearch achieved ₹30-35 crore in sales in the last fiscal year. — Business of Fashion, 2024" },
    { gx: 62, gy: 9, name: "Rannvijay Singha", role: "Partner · Brand & culture", portrait: "celeb", hue: 0, beat: "did",
      quote: "Joined SoleSearch as a partner — reach, brand, and the streetwear credibility India needed.\n\nLive events, curated drops, the face of the movement." },
  ],
  clipping: { gx: 12, gy: 9, title: "Why SoleSearch mattered", source: "SoleSearch · 2020-2024 · CNBC-TV18",
    body: "Created India's sneaker culture. Brand, community, events, media — all built from zero.\n\n30+ events, ₹1cr+ in sales, ₹1cr+ in sponsorships, 350K+ followers, two retail stores. Series A didn't close in time, sold for parts. Cultural impact is permanent." },
  secret: { gx: 56, gy: 9, title: "Why we sold for parts",
    body: "Series A didn't close in time. Chose to sell rather than die slow. Brand still shapes Indian sneaker culture." },
  minigame: { gx: 42, gy: 9, id: "spot-fake", label: "Mini-game: real or fake?" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "Director-level marketing", "Venture strategy", "Capital allocation"],
};

// ─── CATS CAN DANCE (70w · music label + pet culture ONLY) ────
const CCD: Level = {
  id: "ccd", index: 7, name: "Cats Can Dance",
  era: "Ongoing · Music Label + Pet Culture",
  isSideWorld: true,
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
  map: buildMap({ width: 50, spawn: 2, npcGxs: [5, 22, 38], qBlock: 16, minigame: 32, secret: 44,
    coinTopGxs: [10, 20, 30, 42], coinMidGxs: [14, 26, 36],
    platforms: [[8, 5], [22, 5], [36, 5]] }),
  coins: [
    { gx: 10, gy: 3, skill: "Music production" }, { gx: 20, gy: 3, skill: "Label A&R" },
    { gx: 30, gy: 3, skill: "Pet brand IP" }, { gx: 42, gy: 3, skill: "Live events" },
    { gx: 14, gy: 7, skill: "Creative direction" }, { gx: 26, gy: 7, skill: "Storytelling" },
    { gx: 36, gy: 7, skill: "Community building" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Cats Can Dance", role: "Music label · Pet culture brand", portrait: "client", hue: 30, beat: "did",
      quote: "A music label and pet-forward creative brand. Original music, a brand world for pets, and live events.\n\nNo brief. No client. The work that exists because it has to." },
    { gx: 22, gy: 9, name: "The Music", role: "Releases & sound", portrait: "fan", hue: 25, beat: "did",
      quote: "Original music as a label. Production, mixing, releases on Spotify and Apple Music.\n\nMusic was the first language. Still is." },
    { gx: 38, gy: 9, name: "Why a non-commercial home", role: "Where the soul lives", portrait: "fan", hue: 35, beat: "learned",
      quote: "Every commercial career needs a non-commercial home.\n\nCats Can Dance is the proof of life — the work that exists because it has to." },
  ],
  clipping: { gx: 16, gy: 9, title: "Why a label, why cats", source: "Cats Can Dance · Now",
    body: "A music label and a pet-culture brand built on the same instinct: make things that move people.\n\nIntentionally small. Intentionally weird." },
  secret: { gx: 44, gy: 9, title: "What's next",
    body: "More releases. More live shows. More cats. Open to artists, labels, and sponsors with taste." },
  minigame: { gx: 32, gy: 9, id: "rhythm-tap", label: "Mini-game: tap to the beat" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "Director-level marketing", "Venture strategy", "CEO", "Fundraising · $795K", "Brand building"],
};


// ─── FERE.AI (50w · AI × Crypto side-world, post-CCD) ─────────────────────
const FERE: Level = {
  id: "fere", index: 8, name: "Fere.ai",
  era: "2024-25 · AI × Crypto",
  blurb: "Year-long project with Akshaya Aron. Autonomous AI agents for financial markets.",
  story: "FERE.AI — reunited with Akshaya Aron (Octo → Quartic.ai → now Fere.ai).\nA year building AI-powered autonomous trading agents. $1.3M raised.",
  isSideWorld: true,
  palette: {
    sky: "#050d1a", skyMid: "#0a1f2e", skyLow: "#051014",
    ground: "#020810", groundTop: "#0a1a28",
    brick: "#1a8c6e", brickShade: "#0a4a3c",
    accent: "#00e8a0", accentDim: "#00b87a",
    pipe: "#106e54", pipeShade: "#053d2c",
  },
  parallax: ["racks", "stars"],
  metrics: { role: "Growth & Marketing Partner · Fere.ai", years: "2024-25",
    outcome: "Year-long project. AI autonomous agents for crypto markets. $1.3M raised.",
    bullets: [
      "Rejoined Akshaya Aron a decade after Octo/Quartic.ai",
      "Built growth and marketing strategy for Fere.ai — autonomous AI trading agents",
      "Fere.ai raised $1.3M led by Ethereal Ventures, Galaxy Vision Hill, Kosmos Ventures",
      "10M+ autonomous agent actions processed on platform launch",
      "Operated across Ethereum, Solana, Base, Arbitrum, BNB Chain, Polymarket",
    ] },
  map: buildMap({ width: 50, spawn: 2, npcGxs: [5, 22, 38], qBlock: 16, minigame: 32, secret: 44,
    coinTopGxs: [10, 20, 30, 42], coinMidGxs: [14, 26, 36],
    platforms: [[8, 5], [22, 5], [36, 5]] }),
  coins: [
    { gx: 10, gy: 3, skill: "AI agents" }, { gx: 20, gy: 3, skill: "Crypto marketing" },
    { gx: 30, gy: 3, skill: "DeFi growth" }, { gx: 42, gy: 3, skill: "Web3 narrative" },
    { gx: 14, gy: 7, skill: "Autonomous systems" }, { gx: 26, gy: 7, skill: "Fintech GTM" },
    { gx: 36, gy: 7, skill: "Token community" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Fere.ai", role: "AI × Crypto · 2024-25", portrait: "engineer", hue: 160, beat: "did",
      quote: "A year-long project with Akshaya Aron — a decade after Octo and Quartic.ai.\n\nFere builds autonomous AI agents for financial markets. Starting with crypto. Growing into everything." },
    { gx: 22, gy: 9, name: "Akshaya Aron", role: "Co-founder & CEO, Fere.ai", portrait: "founder", hue: 165, beat: "did",
      quote: "Co-founders Aron and Prakash have been building AI together since 2014. Over eleven years, three ventures, and successful exits. — GlobeNewswire, 2026.\n\nFere raised $1.3M from Ethereal Ventures, Galaxy Vision Hill & Kosmos Ventures." },
    { gx: 38, gy: 9, name: "What Fere taught me", role: "AI agents at the frontier", portrait: "investor", hue: 170, beat: "learned",
      quote: "When AI agents can act autonomously — research, wait, execute, learn — the marketing problem changes completely.\n\nYou're not selling a product. You're building trust in something people can't fully see." },
  ],
  clipping: { gx: 16, gy: 9, title: "Fere.ai raises $1.3M for autonomous AI trading agents", source: "GlobeNewswire · April 2026",
    body: "Fere is building the platform where autonomous AI agents manage your financial life. 10M+ autonomous agent actions processed.\n\nLed by Ethereal Ventures with Galaxy Vision Hill and Kosmos Ventures." },
  secret: { gx: 44, gy: 9, title: "Full circle",
    body: "Akshaya and I first built AI together in 2013. Twelve years later, the technology finally caught up to the vision." },
  minigame: { gx: 32, gy: 9, id: "chat-match", label: "Mini-game: pick the better AI prompt" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "B2B marketing", "Capital strategy", "CEO", "Fundraising", "Brand building", "Music production"],
};

// ─── ITERATE (50w · destination · final chapter) ─────────────
const ITERATE: Level = {
  id: "iterate", index: 9, name: "Iterate",
  era: "Now · AI-native Marketing Agency",
  blurb: "The destination. 15 years of building, brand, technology, and culture — pointed at one target.",
  story: "ITERATE — the convergence of everything.\n15 years of operator instinct. Pointed at marketing. Moving at the speed of AI.",
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
  map: buildMap({ width: 50, spawn: 2, npcGxs: [5, 18, 30, 40, 46], qBlock: 14, minigame: 32, secret: 44,
    coinTopGxs: [9, 18, 28, 42],
    coinMidGxs: [13, 22, 34, 46],
    platforms: [[7, 5], [20, 5], [34, 5], [42, 5]], flagAt: 48 }),
  coins: [
    { gx: 9, gy: 3, skill: "AI-powered marketing" }, { gx: 18, gy: 3, skill: "Brand systems" },
    { gx: 28, gy: 3, skill: "Growth engineering" }, { gx: 42, gy: 3, skill: "Founder coaching" },
    { gx: 13, gy: 7, skill: "Prompt strategy" }, { gx: 22, gy: 7, skill: "Taste-as-strategy" },
    { gx: 34, gy: 7, skill: "Speed × craft" },
  ],
  npcs: [
    { gx: 5, gy: 9, name: "Iterate", role: "Founder · AI-native marketing agency", portrait: "engineer", hue: 200, beat: "did",
      quote: "An AI-native marketing agency built on 15 years of operating across brand, technology, and growth.\n\nStrategy, creative, and technology in one room — moving at the speed of AI." },
    { gx: 18, gy: 9, name: "How Iterate works", role: "Strategy + creative + tech", portrait: "client", hue: 210, beat: "did",
      quote: "AI workflows where they make the work better, not cheaper.\n\nFor founders who want a partner, not a vendor." },
    { gx: 30, gy: 9, name: "The operator edge", role: "15 years of instinct as infrastructure", portrait: "investor", hue: 220, beat: "did",
      quote: "Every company I built compounds into the next.\n\nIterate is the first time I've been able to deploy the full stack at once — brand, growth, technology, taste." },
    { gx: 40, gy: 9, name: "What AI doesn't replace", role: "Why taste still wins", portrait: "fan", hue: 195, beat: "learned",
      quote: "AI amplifies people who already know what they're doing.\n\nEvery year of experience becomes a prompt. Every mistake becomes a guardrail." },
    { gx: 46, gy: 9, name: "Working with us", role: "Small number of founder partners", portrait: "founder", hue: 205, beat: "did",
      quote: "We take a small number of founder partners per quarter.\n\nIf you want a marketing agency that thinks like an operator — reach out." },
  ],
  clipping: { gx: 14, gy: 9, title: "AI-native, now", source: "Iterate · Now",
    body: "What happens when an operator who has lived through ecommerce, housing, AI, VC, sneakers, and music points everything at one target.\n\nMarketing that compounds." },
  secret: { gx: 44, gy: 9, title: "Working with us",
    body: "Small number of founder partners per quarter." },
  minigame: { gx: 32, gy: 9, id: "chat-match", label: "Mini-game: pick the better prompt" },
  cumulativeSkillsAtClear: ["Vision", "Operations", "Bootstrapping", "Conversational AI", "B2B marketing", "Capital strategy", "CEO", "Fundraising", "Brand building", "Music production", "AI-powered marketing"],
};

export const LEVELS: Level[] = [HOME, ORIGIN, GRP, HAB, AI, INVESTOPAD, SOLE, CCD, FERE, ITERATE];

export const CONTACT = {
  email: "param@catscandance.com",
  site: "https://catscandance.com",
  linkedin: "https://www.linkedin.com/in/paramminhas/",
  twitter: "https://twitter.com/paramminhas",
  spotify: "https://open.spotify.com/artist/catscandance",
  resume: "/resume",
};

// Real press mentions — used in ResumeView "Selected Press" section
export const PRESS: { outlet: string; title: string; url?: string }[] = [
  { outlet: "CNBC-TV18", title: "SoleSearch: Building India's sneaker culture from the ground up" },
  { outlet: "YourStory", title: "From Bengaluru to boardroom: Param Minhas on 15 years of building" },
  { outlet: "Inc42", title: "SoleSearch raises $795K to scale India's first sneaker marketplace" },
  { outlet: "Economic Times", title: "Rannvijay Singha backs SoleSearch, India's streetwear-first platform" },
  { outlet: "Quartic.ai", title: "Octo acquired — founding team joins Quartic.ai, India's enterprise AI pioneer" },
];

export const ALL_SKILLS_BY_LEVEL: Record<string, string[]> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l.coins.map((c) => c.skill)]),
);
