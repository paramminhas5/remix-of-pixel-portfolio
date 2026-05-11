import { LEVELS, CONTACT } from "./data";

// Skills grouped by domain — pulled from the per-chapter coin definitions but
// deduped and re-categorised for a recruiter-friendly read.
const SKILL_GROUPS: { label: string; skills: string[] }[] = [
  {
    label: "Strategy & Leadership",
    skills: [
      "Founder ops",
      "Product strategy",
      "Fundraising",
      "Storytelling",
      "Vision",
      "First-principles",
      "Hiring",
      "Brand strategy",
    ],
  },
  {
    label: "Design & Direction",
    skills: [
      "Creative direction",
      "Brand identity",
      "Art direction",
      "UI / UX",
      "Visual systems",
      "Taste",
      "Typography",
    ],
  },
  {
    label: "Engineering & AI",
    skills: [
      "Full-stack",
      "Conversational AI",
      "LLM tooling",
      "Prompt engineering",
      "Data pipelines",
      "Web scraping",
      "Rapid prototyping",
    ],
  },
  {
    label: "Music & Performance",
    skills: ["Music production", "Mixing", "Live performance", "Sound design", "DJing"],
  },
  {
    label: "Growth & Marketing",
    skills: ["Community", "Content", "Distribution", "Sneaker culture", "Press / PR", "Partnerships"],
  },
];

const TOOLS = [
  "Figma",
  "Cursor",
  "Claude / GPT",
  "TypeScript",
  "React",
  "Node",
  "Postgres",
  "Ableton Live",
  "Logic Pro",
  "Notion",
];

const HIGHLIGHTS: { stat: string; label: string }[] = [
  { stat: "₹1cr+", label: "Event sales (SoleSearch)" },
  { stat: "₹1cr+", label: "Sponsorships closed" },
  { stat: "30+", label: "Live events produced" },
  { stat: "40+", label: "Indian brand partners" },
  { stat: "15 yrs", label: "Founder + operator" },
  { stat: "6", label: "Companies built or led" },
];

const COMPANIES = [
  "Meesho", "Entri", "Simsim", "Amazon", "Forbes",
  "Royal Enfield", "boAt", "Budweiser",
  "CNBC-TV18", "YourStory", "Inc42", "Economic Times",
  "Quartic.ai", "Investopad", "SoleSearch",
];

export function ResumeView({ onBackToGame }: { onBackToGame: () => void }) {
  const chapters = LEVELS.filter((l) => l.id !== "home");

  return (
    <div className="resume-root min-h-screen w-full overflow-y-auto bg-[#fafaf7] text-[#1a1a1a]">
      <style>{`
        .resume-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .resume-serif { font-family: 'Playfair Display', Georgia, serif; }
        .resume-mono { font-family: 'DM Mono', ui-monospace, monospace; }
        @page { size: A4; margin: 14mm; }
        @media print {
          .resume-root { background: #fff !important; color: #111 !important; }
          .resume-no-print { display: none !important; }
          .resume-card { break-inside: avoid; }
          .resume-page-break { break-before: page; page-break-before: always; }
          a { color: #111 !important; text-decoration: underline; }
        }
      `}</style>

      {/* Top bar */}
      <div className="resume-no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="resume-mono text-[10px] uppercase tracking-widest text-black/50">Resume · Param Minhas</div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-full border border-black/20 px-3 py-1 resume-mono text-[10px] uppercase text-black/70 hover:bg-black/5"
          >
            ⎙ Print / PDF
          </button>
          <button
            onClick={onBackToGame}
            className="rounded-full border border-emerald-700 bg-emerald-700 px-3 py-1 resume-mono text-[10px] uppercase text-white hover:bg-emerald-800"
          >
            ▶ Play game
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10 sm:py-14">
        {/* HERO */}
        <header className="mb-10 border-b border-black/10 pb-8">
          <div className="resume-mono text-[10px] uppercase tracking-[0.3em] text-black/50">
            Builder · Designer · Creative Director · Music Producer
          </div>
          <h1 className="resume-serif mt-1 text-4xl font-bold leading-tight sm:text-6xl">Param Minhas</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/75 sm:text-base">
            15 years of building across e-commerce, real estate, conversational AI, sneaker culture, and AI-native marketing.
            Founder, operator, and creative director — same person shipped each chapter.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 resume-mono text-[11px]">
            <a href={`mailto:${CONTACT.email}`} className="rounded-full border border-black/25 px-3 py-1 hover:bg-black/5">
              ✉ {CONTACT.email}
            </a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener" className="rounded-full border border-black/25 px-3 py-1 hover:bg-black/5">
              in/paramminhas
            </a>
            <a href={CONTACT.twitter} target="_blank" rel="noopener" className="rounded-full border border-black/25 px-3 py-1 hover:bg-black/5">
              @paramminhas
            </a>
            <a href={CONTACT.site} target="_blank" rel="noopener" className="rounded-full border border-black/25 px-3 py-1 hover:bg-black/5">
              ★ catscandance.com
            </a>
          </div>
        </header>

        {/* HIGHLIGHTS — recruiter-friendly stat strip */}
        <section className="resume-card mb-10">
          <SectionHeading>Highlights</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="rounded border border-black/15 bg-white p-3">
                <div className="resume-serif text-2xl font-bold leading-none text-black">{h.stat}</div>
                <div className="resume-mono mt-1 text-[10px] uppercase tracking-widest text-black/55">{h.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO-COLUMN BODY */}
        <div className="grid gap-10 sm:grid-cols-3">
          {/* LEFT — Skills, Tools, Education */}
          <aside className="space-y-8 sm:col-span-1">
            <section className="resume-card">
              <SectionHeading>Skills</SectionHeading>
              <div className="space-y-3">
                {SKILL_GROUPS.map((g) => (
                  <div key={g.label}>
                    <div className="resume-mono mb-1 text-[9px] uppercase tracking-widest text-black/50">{g.label}</div>
                    <div className="flex flex-wrap gap-1">
                      {g.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded border border-black/15 bg-white px-1.5 py-0.5 resume-mono text-[10px] text-black/75"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="resume-card">
              <SectionHeading>Tools</SectionHeading>
              <div className="flex flex-wrap gap-1">
                {TOOLS.map((t) => (
                  <span key={t} className="rounded border border-black/15 px-1.5 py-0.5 resume-mono text-[10px] text-black/70">
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section className="resume-card">
              <SectionHeading>Languages</SectionHeading>
              <div className="resume-mono text-[11px] text-black/70">English · Hindi · Punjabi</div>
            </section>

            <section className="resume-card">
              <SectionHeading>Based</SectionHeading>
              <div className="resume-mono text-[11px] text-black/70">Bengaluru · Open to remote / EU / US</div>
            </section>
          </aside>

          {/* RIGHT — Experience + Press */}
          <main className="space-y-10 sm:col-span-2">
            <section>
              <SectionHeading>Experience</SectionHeading>
              <div className="space-y-7">
                {chapters.map((lv) => {
                  const m = lv.metrics;
                  if (!m) return null;
                  return (
                    <article key={lv.id} className="resume-card border-l-2 pl-4" style={{ borderColor: lv.palette.accent }}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="resume-serif text-lg font-bold leading-tight sm:text-xl">{lv.name}</h3>
                        <span className="resume-mono text-[10px] uppercase tracking-widest text-black/50">{m.years}</span>
                      </div>
                      <div className="resume-mono mt-0.5 text-[11px] uppercase tracking-wider text-black/60">{m.role}</div>
                      <p className="mt-2 text-sm italic text-black/70">{m.outcome}</p>
                      <ul className="mt-2 space-y-1">
                        {m.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2 text-sm leading-snug text-black/80">
                            <span style={{ color: lv.palette.accent }}>▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeading>Selected press</SectionHeading>
              <ul className="space-y-2">
                {chapters.map((lv) => (
                  <li key={lv.id} className="flex items-baseline gap-3">
                    <span className="resume-mono shrink-0 text-[10px] uppercase tracking-widest text-black/40">
                      {lv.clipping.source}
                    </span>
                    <span className="text-sm text-black/80">{lv.clipping.title}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeading>Selected work</SectionHeading>
              <ul className="space-y-1 resume-mono text-[12px] text-black/75">
                <li><a className="underline" href={CONTACT.site} target="_blank" rel="noopener">catscandance.com</a> — studio + record label</li>
                <li><a className="underline" href={CONTACT.linkedin} target="_blank" rel="noopener">linkedin.com/in/paramminhas</a> — full work history</li>
                <li><a className="underline" href={CONTACT.twitter} target="_blank" rel="noopener">@paramminhas</a> — building in public</li>
              </ul>
            </section>
          </main>
        </div>

        <footer className="mt-16 border-t border-black/10 pt-6 text-center resume-mono text-[10px] uppercase tracking-widest text-black/40">
          Built as a 2D side-scrolling portfolio · Press ▶ Play to walk through it
        </footer>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="resume-mono mb-3 border-b border-black/15 pb-1 text-[11px] font-bold uppercase tracking-[0.25em] text-black/80">
      {children}
    </h2>
  );
}
