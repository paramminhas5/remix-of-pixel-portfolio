import { LEVELS } from "./data";

const ICONS: Record<string, string> = {
  Vision: "🌅", Storytelling: "📜", Taste: "✨", "First-principles": "🧭", Curiosity: "🔭", Hustle: "🔥",
  "Product 0→1": "🛠", "Web scraping": "🕸", "Scrappy execution": "⚡", "Early growth": "📈", "Founding-team": "👥", Resilience: "🛡",
  Operations: "⚙", "Unit economics": "💸", Sales: "🤝", Bootstrapping: "🥾", Hospitality: "🏠", "P&L": "📊",
  "Conversational AI": "💬", MarTech: "📡", "Enterprise AI": "🤖", "Director-level marketing": "🎯", "M&A integration": "🔗", "Pioneer mindset": "🚀",
  "Venture strategy": "🧠", "Capital allocation": "🏦", "Growth partnerships": "🌐", "Portfolio support": "💼", Network: "🕸", "Deal sense": "🎲",
  CEO: "👑", "Fundraising · $795K": "💰", "Brand building": "🏷", "Retail ops": "🏬", "PR & Press": "📰", Community: "🫂",
  "Creative direction": "🎨", "AI-led marketing": "🪄", "Music production": "🎵", "Brand systems": "🧩", "Founder coaching": "🧗", "Taste-as-strategy": "🎭",
  Restlessness: "🔄",
};

export function SkillTree({
  collectedSkills,
  onClose,
}: {
  collectedSkills: { skill: string; levelId: string }[];
  onClose: () => void;
}) {
  const collectedSet = new Set(collectedSkills.map((s) => `${s.levelId}:${s.skill}`));
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-xl border-2 border-white/30 bg-[#0c0820] p-4 sm:p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Skill Tree · K</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Skills earned across worlds
            </h2>
            <p className="mt-1 font-mono text-[10px] text-white/50">
              Each coin you grab unlocks a real skill from that chapter of the journey.
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded border border-white/30 px-3 py-1 font-mono text-[10px] uppercase text-white hover:bg-white/10">
            ✕
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {LEVELS.filter((l) => l.id !== "home").map((lv) => {
            const total = lv.coins.length;
            const earned = lv.coins.filter((c) => collectedSet.has(`${lv.id}:${c.skill}`)).length;
            return (
              <div key={lv.id} className="rounded-lg border bg-black/40 p-3" style={{ borderColor: lv.palette.accent }}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: lv.palette.accent }}>
                      W{lv.index} · {lv.era}
                    </div>
                    <div className="text-base font-bold text-white">{lv.name}</div>
                  </div>
                  <div className="font-mono text-[10px] text-white/60">{earned}/{total}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lv.coins.map((c) => {
                    const has = collectedSet.has(`${lv.id}:${c.skill}`);
                    return (
                      <span
                        key={c.skill}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[10px] transition"
                        style={{
                          borderColor: has ? lv.palette.accent : "rgba(255,255,255,0.15)",
                          color: has ? lv.palette.accent : "rgba(255,255,255,0.35)",
                          background: has ? `${lv.palette.accent}12` : "transparent",
                          filter: has ? "none" : "blur(0.4px)",
                        }}
                      >
                        <span>{ICONS[c.skill] ?? "★"}</span>
                        <span>{has ? c.skill : "???"}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function getSkillIcon(skill: string): string {
  return ICONS[skill] ?? "★";
}
