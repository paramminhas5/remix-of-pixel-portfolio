// Param Portfolio v5 — level data, NPCs, collectibles
// Tile characters used in `map`:
//   '.' empty   '#' solid ground   '=' brick (solid)   'B' bumpable brick (with clipping)
//   'P' pipe (solid, decorative)   'F' goal flag   'S' player spawn
//   'C' coin (skill)   'N' NPC spawn   'M' mini-game trigger   'H' hidden secret tile
// Map rows are read top-to-bottom. Width = max row length. Pad with '.' as needed.

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
  /** Story beat — drives the chip in the dialog box. */
  beat?: "did" | "learned";
};
export type Clipping = {
  gx: number;
  gy: number;
  title: string;
  body: string;
  source: string;
};
export type Secret = {
  gx: number;
  gy: number;
  title: string;
  body: string;
};
export type MinigameTrigger = {
  gx: number;
  gy: number;
  id: MinigameId;
  label: string;
};

export type Level = {
  id: string;
  index: number; // 1..7
  name: string;
  era: string;
  blurb: string; // shown on world map
  story: string; // shown when player enters level
  palette: {
    sky: string;
    skyMid: string;
    skyLow: string;
    ground: string;
    groundTop: string;
    brick: string;
    brickShade: string;
    accent: string;
    accentDim: string;
    pipe: string;
    pipeShade: string;
  };
  parallax: ("city" | "trees" | "racks" | "apartments" | "desk" | "shelves" | "stars")[];
  /** Recruiter-card content shown when entering a chapter. */
  metrics?: {
    role: string;
    years: string;
    outcome: string;
    bullets: string[];
  };
  map: string;
  spawn?: { gx: number; gy: number }; // overrides 'S' if present
  coins: Coin[];
  npcs: Npc[];
  clipping: Clipping;
  secret: Secret;
  minigame: MinigameTrigger;
  cumulativeSkillsAtClear: string[]; // shown on level-clear card alongside coin skills
};

export const TILE = 28; // px per tile on screen
export const ROWS = 14;

// Quick helper: parse template-literal map (drops leading/trailing blank lines).
export function parseMap(s: string): string[] {
  return s
    .replace(/^\n+|\n+$/g, "")
    .split("\n")
    .map((row) => row.replace(/\s+$/g, ""));
}

// ─────────────────────────────────────────────────────────────────
// LEVEL 1 — ORIGIN (Bengaluru, the beginning)
// ─────────────────────────────────────────────────────────────────
const ORIGIN: Level = {
  id: "origin",
  index: 1,
  name: "Origin",
  era: "Bengaluru · The Beginning",
  blurb: "Where the story starts.",
  story:
    "BENGALURU. Builder. Designer. Creative Director. Music Producer.\nA serial entrepreneur — before Indian tech had a bleeding edge.",
  palette: {
    sky: "#f7d6b3",
    skyMid: "#f5b78a",
    skyLow: "#c98968",
    ground: "#5e3a25",
    groundTop: "#9a6b3f",
    brick: "#c9874a",
    brickShade: "#7a4d28",
    accent: "#fff1b0",
    accentDim: "#e6c47a",
    pipe: "#a85d2c",
    pipeShade: "#5a3014",
  },
  parallax: ["city"],
  metrics: {
    role: "Beginning · Bengaluru",
    years: "Pre-2010",
    outcome: "Curiosity → craft → companies.",
    bullets: ["Self-taught code, design & music", "Built before there was a scene", "Learned by shipping"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Vision" },
    { gx: 19, gy: 3, skill: "Storytelling" },
    { gx: 32, gy: 3, skill: "Taste" },
    { gx: 9, gy: 7, skill: "First-principles" },
    { gx: 27, gy: 7, skill: "Curiosity" },
    { gx: 20, gy: 3, skill: "Hustle" },
  ],
  npcs: [
    {
      gx: 5,
      gy: 10,
      name: "Param Minhas",
      role: "Builder · Designer · Director",
      portrait: "founder",
      hue: 280,
      beat: "did",
      quote:
        "Builder. Designer. Creative Director. Music Producer.\n\nA serial entrepreneur across ecommerce, real estate, AI, sneaker culture, and now marketing and music. Fifteen years of founding, failing, learning, and building again — in that order.",
    },
    {
      gx: 23,
      gy: 8,
      name: "The Throughline",
      role: "What ties it all together",
      portrait: "celeb",
      hue: 30,
      beat: "learned",
      quote:
        "Every chapter compounds. Nothing you build is wasted — the skills from each era feed the next one. The founder who built a price-comparison engine in college is the same one who raised $795K a decade later.\n\nA portfolio is proof of curiosity. That drive is the only constant.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why this matters",
    source: "Param Minhas · 2010 → now",
    body: "A career is just a portfolio of bets and what you learned from each one.\n\nFifteen years of starting things — some scaled, some sold, some still going. The same person built ecommerce in college, housing during the OYO era, conversational AI in 2013, sneaker culture during lockdown, and is now building AI-native marketing.\n\nThat range is the point.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "Origin Story",
    body: "First computer at 9. First band at 13. First product at 19. First company at 21. None of it was a plan — all of it was inevitable.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "price-match",
    label: "Warm-up: spot the lowest price",
  },
  cumulativeSkillsAtClear: [],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 2 — GETRIGHTPRICE
// ─────────────────────────────────────────────────────────────────
const GRP: Level = {
  id: "grp",
  index: 2,
  name: "GetRightPrice",
  era: "2010 · First Startup",
  blurb: "India's first price comparison engine. Built in college.",
  story:
    "GETRIGHTPRICE — comparing electronics across Indian e-commerce before the market existed.\nBacked by Sidharth Rao of Webchutney.",
  palette: {
    sky: "#cfe7c2",
    skyMid: "#a8d39a",
    skyLow: "#6fa86c",
    ground: "#2c4a2a",
    groundTop: "#5a8c4a",
    brick: "#7c5a2e",
    brickShade: "#4a3418",
    accent: "#fff2a8",
    accentDim: "#d4c068",
    pipe: "#3f7a3a",
    pipeShade: "#1f4a1c",
  },
  parallax: ["trees"],
  metrics: {
    role: "Founding member · GetRightPrice",
    years: "2010 · College",
    outcome: "India's first price-comparison engine. Angel-backed.",
    bullets: ["Backed by Sidharth Rao (Webchutney)", "Web-scaled e-commerce data", "0→1 product, in college"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Product 0→1" },
    { gx: 19, gy: 3, skill: "Web scraping" },
    { gx: 32, gy: 3, skill: "Scrappy execution" },
    { gx: 9, gy: 7, skill: "Early growth" },
    { gx: 27, gy: 7, skill: "Founding-team" },
    { gx: 20, gy: 3, skill: "Resilience" },
  ],
  npcs: [
    {
      gx: 7,
      gy: 8,
      name: "GetRightPrice",
      role: "Founding team · 2010 · Bengaluru",
      portrait: "founder",
      hue: 100,
      beat: "did",
      quote:
        "Founding team of one of India's first price-comparison engines for electronics. Backed by Sidharth Rao of Webchutney.\n\nBuilt in college — before Indian ecommerce was a real market. Which is kind of the whole point.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What it taught me",
      role: "First-mover lessons",
      portrait: "investor",
      hue: 140,
      beat: "learned",
      quote:
        "How ecommerce actually works — cataloguing, pricing logic, affiliate models, crawling inventory at scale. The invisible plumbing most people use but never see.\n\nAnd that shipping beats permission. Every time.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why being early mattered",
    source: "GetRightPrice · ~2010",
    body: "Being in the room before Flipkart and Amazon dominated India meant understanding the market from first principles.\n\nThat knowledge never left. You cannot teach first-mover pattern recognition — you have to live it. Every market I've entered since has felt familiar because of this one.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "Lessons from #1",
    body: "First company taught everything: the market is real even when the category isn't. Shipping beats permission. And every co-founder you pick will define the next decade.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "price-match",
    label: "Mini-game: pick the lowest price",
  },
  cumulativeSkillsAtClear: ["Vision", "Storytelling", "Taste"],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 3 — HAB HOUSING
// ─────────────────────────────────────────────────────────────────
const HAB: Level = {
  id: "hab",
  index: 3,
  name: "Hab Housing",
  era: "2012 · Real Estate",
  blurb: "Standardised budget rentals. ₹1Cr revenue. Bootstrapped.",
  story:
    "HAB HOUSING — same problem as OYO, same time, no VC money.\nScaled to ₹1Cr in revenue. Pure hustle.",
  palette: {
    sky: "#ffd1a3",
    skyMid: "#f6a268",
    skyLow: "#b06138",
    ground: "#3a1f10",
    groundTop: "#8c4f24",
    brick: "#c47833",
    brickShade: "#7a4318",
    accent: "#ffe2a8",
    accentDim: "#e6b070",
    pipe: "#a05420",
    pipeShade: "#5a2c0c",
  },
  parallax: ["apartments"],
  metrics: {
    role: "Founder · Hab Housing",
    years: "2012-13",
    outcome: "₹1Cr revenue. Bootstrapped. Same playbook as OYO, no VC.",
    bullets: ["Standardised budget rentals", "₹1 crore revenue, no funding", "Sold operations & moved on"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Operations" },
    { gx: 19, gy: 3, skill: "Unit economics" },
    { gx: 32, gy: 3, skill: "Sales" },
    { gx: 9, gy: 7, skill: "Bootstrapping" },
    { gx: 27, gy: 7, skill: "Hospitality" },
    { gx: 20, gy: 3, skill: "P&L" },
  ],
  npcs: [
    {
      gx: 7,
      gy: 9,
      name: "Hab Housing",
      role: "Founder · 2012 · Bengaluru",
      portrait: "founder",
      hue: 25,
      beat: "did",
      quote:
        "Standardised budget rental housing across Bengaluru — the same problem OYO was solving, at exactly the same time, without VC money.\n\nScaled to ₹1 crore in revenue from rentals. Pure operational discipline.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What ₹1Cr taught me",
      role: "Bootstrapping with no safety net",
      portrait: "tenant",
      hue: 30,
      beat: "learned",
      quote:
        "How to actually build a company. Operations, unit economics, customer acquisition, retention — all without a safety net.\n\nWhen there is no VC money, every decision is real. That discipline never leaves you.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why ₹1Cr bootstrapped matters",
    source: "Hab Housing · 2012-13",
    body: "Proving you can build ₹1Cr in revenue with zero external capital is the most important thing a founder can do.\n\nIt means you understand the business, not just the pitch. We saw the playbook OYO would run, didn't have the appetite to raise the war chest, sold the operations and took the lessons.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "Why I left",
    body: "We saw the playbook OYO would run. We didn't have the appetite to raise the war chest. Sold the operations, took the lessons, started the next thing.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "stack-blocks",
    label: "Mini-game: stack the apartments",
  },
  cumulativeSkillsAtClear: ["Vision", "Product 0→1", "Web scraping", "Founding-team"],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 4 — AI / OCTO / QUARTIC
// ─────────────────────────────────────────────────────────────────
const AI: Level = {
  id: "ai",
  index: 4,
  name: "AI Era",
  era: "2013-17 · Octo → Quartic.ai",
  blurb: "India's first chatbot product. Founding team of Octo. Director of Marketing at Quartic.ai.",
  story:
    "CHATBOT (2013) → OCTO → QUARTIC.AI.\nFounding team of one of India's earliest AI products. Years before AI meant anything here.",
  palette: {
    sky: "#3d4a78",
    skyMid: "#4f5a92",
    skyLow: "#2a3358",
    ground: "#101a30",
    groundTop: "#2a3a5a",
    brick: "#4a6e9a",
    brickShade: "#26385a",
    accent: "#9fe8ff",
    accentDim: "#6fb6cc",
    pipe: "#3a6280",
    pipeShade: "#1f3548",
  },
  parallax: ["racks", "stars"],
  metrics: {
    role: "Founding team Octo · Director Marketing Quartic.ai",
    years: "2013-17",
    outcome: "One of India's first chatbot products. Acquired.",
    bullets: ["Conversational AI in 2013 — early as it gets", "Octo acquired by Quartic.ai", "Took industrial AI story global"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Conversational AI" },
    { gx: 19, gy: 3, skill: "MarTech" },
    { gx: 32, gy: 3, skill: "Enterprise AI" },
    { gx: 9, gy: 7, skill: "Director-level marketing" },
    { gx: 27, gy: 7, skill: "M&A integration" },
    { gx: 20, gy: 3, skill: "Pioneer mindset" },
  ],
  npcs: [
    {
      gx: 5,
      gy: 9,
      name: "Octo → Quartic.ai",
      role: "Founding team · 2013 · India",
      portrait: "engineer",
      hue: 195,
      beat: "did",
      quote:
        "Founding team of one of India's first chatbot products in 2013. Then founding team of Octo — a marketing platform years ahead of its time.\n\nOcto was acquired by Quartic.ai. I became Director of Marketing post-acquisition and took the enterprise AI story global.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What AI taught me",
      role: "Product marketing & UX, the hard way",
      portrait: "investor",
      hue: 200,
      beat: "learned",
      quote:
        "Product marketing and UI/UX from the ground up. How to translate deeply technical products into things humans actually want to use.\n\nClosing the gap between what engineers build and what users understand — that's the whole job.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why being on an AI team in 2013 mattered",
    source: "Octo → Quartic.ai",
    body: "Being on a founding AI team in 2013 is like being in Bengaluru tech before Infosys went public.\n\nThat pattern recognition — understanding AI products before they were mainstream — is a rare unfair advantage. Now every demo deck has 'conversational AI' on slide 2. Being early is the same as being wrong, until it isn't.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "Before it was cool",
    body: "We pitched 'conversational AI' in 2013 and got blank stares. Now every demo deck has it on slide 2. Being early is the same as being wrong — until it isn't.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "chat-match",
    label: "Mini-game: match the chatbot reply",
  },
  cumulativeSkillsAtClear: [
    "Vision",
    "Product 0→1",
    "Operations",
    "Bootstrapping",
    "Sales",
  ],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 5 — INVESTOPAD
// ─────────────────────────────────────────────────────────────────
const INVESTOPAD: Level = {
  id: "investopad",
  index: 5,
  name: "Investopad",
  era: "Growth & Tech Partner",
  blurb: "Built Fund 0 with Rohan & Arjun Malhotra.",
  story:
    "INVESTOPAD — the family office of Rohan & Arjun Malhotra.\nPartner for Growth & Technology. Built Fund 0 from scratch.",
  palette: {
    sky: "#5a3a72",
    skyMid: "#7a4a8c",
    skyLow: "#3a2050",
    ground: "#1c0e2c",
    groundTop: "#3a2050",
    brick: "#9a6fc4",
    brickShade: "#5a3a78",
    accent: "#f0c4ff",
    accentDim: "#b88ad4",
    pipe: "#7a4cb0",
    pipeShade: "#3f2266",
  },
  parallax: ["stars"],
  metrics: {
    role: "Partner · Growth & Tech · Investopad",
    years: "Post-Octo",
    outcome: "Built Fund 0 with Rohan & Arjun Malhotra.",
    bullets: ["Capital × tech × growth strategy", "Portfolio support & sourcing", "Operator → investor → operator"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Venture strategy" },
    { gx: 19, gy: 3, skill: "Capital allocation" },
    { gx: 32, gy: 3, skill: "Growth partnerships" },
    { gx: 9, gy: 7, skill: "Portfolio support" },
    { gx: 27, gy: 7, skill: "Network" },
    { gx: 20, gy: 3, skill: "Deal sense" },
  ],
  npcs: [
    {
      gx: 5,
      gy: 9,
      name: "Investopad",
      role: "Growth & Tech Partner · Fund 0",
      portrait: "investor",
      hue: 270,
      beat: "did",
      quote:
        "Partner for Growth and Technology at Investopad — the family office of Rohan and Arjun Malhotra.\n\nHelped build their Fund 0 from scratch: deal sourcing, portfolio analysis, founder relationships, growth strategy.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What the fund taught me",
      role: "The other side of the table",
      portrait: "founder",
      hue: 300,
      beat: "learned",
      quote:
        "Fund formation, VC partnership dynamics, how to analyse early-stage companies, and what separates investable founders from good ones.\n\nSeeing deals from the other side of the table changes how you raise — forever.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why an operator should sit inside a fund",
    source: "Investopad · Fund 0",
    body: "Most founders only ever see VC from the pitch side. Sitting inside a fund gives you an entirely different lens.\n\nUnderstanding how money thinks is an unfair advantage when you're the one raising. Six months on the cap table side teaches you more about being a founder than six years on the founder side.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "From operator to investor and back",
    body: "Six months on the cap table side teaches you more about being a founder than six years on the founder side. I went back to building with new eyes.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "pick-unicorn",
    label: "Mini-game: pick the unicorn",
  },
  cumulativeSkillsAtClear: [
    "Vision",
    "Product 0→1",
    "Operations",
    "Conversational AI",
    "Director-level marketing",
  ],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 6 — SOLESEARCH
// ─────────────────────────────────────────────────────────────────
const SOLE: Level = {
  id: "sole",
  index: 6,
  name: "SoleSearch",
  era: "2020-24 · CEO · $795K Raised",
  blurb: "India's leading sneaker, streetwear & collectibles platform. CNBC-TV18 featured.",
  story:
    "SOLESEARCH — co-founded with Prabal Baghla. Joined by Rannvijay Singha.\nIndia's leading platform for authentic sneakers, streetwear & collectibles.",
  palette: {
    sky: "#2a1238",
    skyMid: "#4a1a52",
    skyLow: "#1a0820",
    ground: "#150818",
    groundTop: "#3a1438",
    brick: "#c0388c",
    brickShade: "#7a1f5a",
    accent: "#ff9fd4",
    accentDim: "#cc6fa8",
    pipe: "#9a2f78",
    pipeShade: "#4a1240",
  },
  parallax: ["shelves"],
  metrics: {
    role: "Co-founder & CEO · SoleSearch",
    years: "2020-24",
    outcome: "$795K raised. India's leading sneaker & streetwear platform.",
    bullets: ["Joined by Rannvijay Singha", "Featured on CNBC-TV18", "Mumbai + Hyderabad retail"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "CEO" },
    { gx: 19, gy: 3, skill: "Fundraising · $795K" },
    { gx: 32, gy: 3, skill: "Brand building" },
    { gx: 9, gy: 7, skill: "Retail ops" },
    { gx: 27, gy: 7, skill: "PR & Press" },
    { gx: 20, gy: 3, skill: "Community" },
  ],
  npcs: [
    {
      gx: 5,
      gy: 9,
      name: "SoleSearch",
      role: "Co-founder & CEO · 2020-24",
      portrait: "celeb",
      hue: 330,
      beat: "did",
      quote:
        "Co-founded India's leading sneaker and streetwear platform with Prabal Baghla. Later joined by Rannvijay Singha.\n\nRaised $795K from Venture Catalysts, Anthill Ventures and Cornerstone. Stores in Mumbai and Hyderabad. Featured on CNBC-TV18.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What culture taught me",
      role: "Building a movement, not a store",
      portrait: "investor",
      hue: 340,
      beat: "learned",
      quote:
        "How to raise money. How to build a social movement — 350K+ followers, millions of viral reels, 20K YouTube, 30+ live events.\n\nHow to move culture through content, community, and live experiences. The product was the community.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why SoleSearch still matters",
    source: "SoleSearch · 2020-2024 · CNBC-TV18",
    body: "SoleSearch did not just sell sneakers — it created India's sneaker culture.\n\nThe brand, community, events, and media — all built from zero. Series A did not close in time. Sold for parts. The cultural impact is permanent. Sometimes a beautiful exit is the right end of a beautiful chapter.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "Why we sold for parts",
    body: "Series A didn't close in time. We chose to sell rather than die slow. The brand still shapes Indian sneaker culture. Sometimes a beautiful exit is the right end of a beautiful chapter.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "spot-fake",
    label: "Mini-game: real or fake?",
  },
  cumulativeSkillsAtClear: [
    "Vision",
    "Operations",
    "Bootstrapping",
    "Conversational AI",
    "Director-level marketing",
    "Venture strategy",
    "Capital allocation",
  ],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 7 — CATS CAN DANCE + ITERATE
// ─────────────────────────────────────────────────────────────────
const CCD: Level = {
  id: "ccd",
  index: 7,
  name: "Cats Can Dance",
  era: "Now · Agency + Music",
  blurb: "Full-service marketing + AI-led marketing + music production.",
  story:
    "CATS CAN DANCE + ITERATE — agency and AI-led marketing.\nAnd music production. Companies and music: both start with silence.",
  palette: {
    sky: "#1c1228",
    skyMid: "#3a1f3a",
    skyLow: "#5a2c2c",
    ground: "#180c0a",
    groundTop: "#3a1c14",
    brick: "#c47844",
    brickShade: "#7a4318",
    accent: "#ffd29a",
    accentDim: "#cc9966",
    pipe: "#a85a28",
    pipeShade: "#5a2c10",
  },
  parallax: ["desk"],
  metrics: {
    role: "Founder · Cats Can Dance + Iterate",
    years: "Now",
    outcome: "Full-service marketing + AI-led marketing + music.",
    bullets: ["Creativity = strategy", "AI-native by default", "Releasing music in parallel"],
  },
  map: `
........................................
........................................
........................................
......C............C............C......
........................................
....====.......====........====........
........................................
.........C.................C............
S....N........?........N....M.....H...F
########################################
########################################
########################################
########################################
########################################
`,
  coins: [
    { gx: 6, gy: 3, skill: "Creative direction" },
    { gx: 19, gy: 3, skill: "AI-led marketing" },
    { gx: 32, gy: 3, skill: "Music production" },
    { gx: 9, gy: 7, skill: "Brand systems" },
    { gx: 27, gy: 7, skill: "Founder coaching" },
    { gx: 20, gy: 3, skill: "Taste-as-strategy" },
  ],
  npcs: [
    {
      gx: 5,
      gy: 9,
      name: "Cats Can Dance + Iterate",
      role: "Building now · Marketing + AI + Music",
      portrait: "client",
      hue: 30,
      beat: "did",
      quote:
        "Cats Can Dance — a music and pet-forward creative brand where music and play live without a brief.\n\nIterate — an AI-led marketing agency. The convergence of 15 years of building, growth strategy, brand, technology, and culture into something that moves at the speed of AI.",
    },
    {
      gx: 23,
      gy: 8,
      name: "What the work taught me",
      role: "Why AI doesn't replace taste",
      portrait: "fan",
      hue: 35,
      beat: "learned",
      quote:
        "AI does not replace creative thinking — it amplifies it for people who already know what they're doing. Speed plus strategy plus creativity is unbeatable.\n\nEvery year of experience is a prompt. Creativity needs a home that isn't commercial — that's where the soul lives.",
    },
  ],
  clipping: {
    gx: 14, gy: 8,
    title: "Why everything converges here",
    source: "Cats Can Dance + Iterate · Now",
    body: "Every chapter of this story converges here. The future of brands is AI-native.\n\nIterate is what happens when a builder who has lived through ecommerce, housing, AI, VC, sneakers, music, and marketing points everything at one target. Cats Can Dance is the proof of life — the thing that exists because it has to, not because someone paid for it.",
  },
  secret: {
    gx: 34, gy: 8,
    title: "What's next?",
    body: "More companies. More music. More work that makes people feel something. If you're a founder, an investor, or a label — let's talk.",
  },
  minigame: {
    gx: 28, gy: 8,
    id: "rhythm-tap",
    label: "Mini-game: tap to the beat",
  },
  cumulativeSkillsAtClear: [
    "Vision",
    "Operations",
    "Bootstrapping",
    "Conversational AI",
    "Director-level marketing",
    "Venture strategy",
    "CEO",
    "Fundraising · $795K",
    "Brand building",
  ],
};

// ─────────────────────────────────────────────────────────────────
// LEVEL 0 — HOME (the prologue)
// ─────────────────────────────────────────────────────────────────
const HOME: Level = {
  id: "home",
  index: 0,
  name: "Home",
  era: "Bedroom · The Prologue",
  blurb: "Where the curiosity began.",
  story:
    "BEDROOM. A CRT, a guitar, a stack of books.\nHold SPACE to charge a jump. Double-tap SPACE in the air to double-jump.\nWalk right when you're ready.",
  palette: {
    sky: "#a8b4d8",
    skyMid: "#c8b8d4",
    skyLow: "#e8c4b0",
    ground: "#3a2c4a",
    groundTop: "#7a5a78",
    brick: "#9a7ab0",
    brickShade: "#5a3f7a",
    accent: "#fff0c8",
    accentDim: "#d4b888",
    pipe: "#7a5fa0",
    pipeShade: "#3f2a5a",
  },
  parallax: ["stars"],
  metrics: {
    role: "Prologue",
    years: "Bedroom",
    outcome: "Where the curiosity began.",
    bullets: ["Books, a guitar, a CRT, dial-up", "← → walk · SPACE jump · E talk", "Walk right when you're ready"],
  },
  map: `
.................................
.................................
.................................
......C............C.............
.................................
....====...........====..........
.................................
.................................
......N........?......H..........
.................................
##############...################
##############...################
##############...################
##############...################
`,
  spawn: { gx: 2, gy: 9 },
  coins: [
    { gx: 6, gy: 3, skill: "Curiosity" },
    { gx: 19, gy: 3, skill: "Restlessness" },
  ],
  npcs: [
    {
      gx: 6,
      gy: 9,
      name: "Welcome",
      role: "Bedroom · The Prologue",
      portrait: "founder",
      hue: 220,
      beat: "did",
      quote:
        "This is a portfolio you walk through. 15 years of building, told as a side-scroller.\n\nMove right with ← →. Press space to jump. Each chapter is a real company I built — talk to the people, read the press clippings, collect the skills.",
    },
  ],
  clipping: {
    gx: 14,
    gy: 9,
    title: "Why a playable portfolio",
    source: "About",
    body: "A résumé is a list. A portfolio is a walk-through.\n\nFifteen years of starting things — some scaled, some sold, some still going. All of it one continuous story. Keep walking right and you'll meet every chapter.",
  },
  secret: {
    gx: 22,
    gy: 9,
    title: "Tutorial",
    body: "← → walk · SHIFT run · SPACE (hold) charged jump · SPACE again mid-air = double jump · E talk/read · TAB bag · click a node above to fast-travel.",
  },
  minigame: {
    gx: 28,
    gy: 9,
    id: "rhythm-tap",
    label: "Warm-up: tap to the beat",
  },
  cumulativeSkillsAtClear: [],
};

export const LEVELS: Level[] = [HOME, ORIGIN, GRP, HAB, AI, INVESTOPAD, SOLE, CCD];

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
