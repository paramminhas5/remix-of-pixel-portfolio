import { useState } from "react";
import { LEVELS, type Level, CONTACT } from "./data";
import type { Progress } from "./WorldMap";
import type { Chapter } from "./worldStitch";
import type { PortfolioMode } from "@/hooks/usePortfolioMode";

export function Hud({
  chapter,
  coins,
  totalSkills,
  muted,
  onMute,
  onInventory,
  mode,
  onToggleMode,
  onSkipChapter,
  xp,
  nextUnlockXp,
  nextUnlockLabel,
  hardUnlocked,
  onCliffNotes,
}: {
  chapter: Chapter | null;
  coins: number;
  totalSkills: number;
  muted: boolean;
  onMute: () => void;
  onInventory: () => void;
  mode: PortfolioMode | null;
  onToggleMode: () => void;
  onSkipChapter: () => void;
  xp: number;
  nextUnlockXp: number | null;
  nextUnlockLabel: string | null;
  hardUnlocked?: boolean;
  onCliffNotes: () => void;
}) {
  const accent = chapter?.palette.accent ?? "#fff";
  const xpPct = nextUnlockXp ? Math.min(100, (xp / nextUnlockXp) * 100) : 100;
  const modeLabel = mode === "easy" ? "REGULAR" : mode === "quick" ? "SIM" : "HARD";
  const modeColor = mode === "easy" ? "#7cffb1" : mode === "quick" ? "#a8b5ff" : "#ff8c6b";
  return (
    <div className="flex flex-col gap-1 px-2 py-1.5 font-mono text-[9px] uppercase tracking-widest text-white sm:px-3 sm:py-2 sm:text-[10px]">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 sm:gap-x-3">
        <span style={{ color: accent }}>● W{chapter?.index ?? 0}</span>
        <span className="hidden text-white/70 sm:inline">{chapter?.name}</span>
        <span className="hidden text-white/30 sm:inline">·</span>
        <span title="Skills collected" className="whitespace-nowrap">★ {coins}/{totalSkills}</span>
        <button onClick={onInventory} className="rounded border border-white/30 px-1.5 py-0.5 hover:bg-white/10 sm:px-2">BAG</button>
        <button
          onClick={onCliffNotes}
          className="rounded border border-white/30 px-1.5 py-0.5 hover:bg-white/10 sm:px-2"
          title="Career overview — 30 seconds"
        >?</button>
        <button
          onClick={onToggleMode}
          className="rounded border px-1.5 py-0.5 hover:bg-white/10 sm:px-2"
          style={{ borderColor: modeColor, color: modeColor }}
          title={hardUnlocked ? "Cycle Regular / Sim / Hard" : "Toggle Regular ↔ Sim"}
        >
          {modeLabel}
        </button>
        <button onClick={onSkipChapter} className="hidden rounded border border-white/30 px-1.5 py-0.5 hover:bg-white/10 sm:inline-block sm:px-2" title="Skip to next chapter">
          SKIP ▶
        </button>
        <button onClick={onMute} className="rounded border border-white/30 px-1.5 py-0.5 hover:bg-white/10 sm:px-2" aria-label="Mute">
          {muted ? "♪̸" : "♪"}
        </button>
      </div>
      {nextUnlockLabel && (
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 w-24 overflow-hidden rounded bg-white/15 sm:w-32">
            <div className="absolute inset-y-0 left-0 transition-all" style={{ width: `${xpPct}%`, background: accent }} />
          </div>
          <span className="text-[8px] text-white/60">XP {xp}/{nextUnlockXp}<span className="hidden sm:inline"> · {nextUnlockLabel}</span></span>
        </div>
      )}
    </div>
  );
}

// Title overlay: cinematic intro shown on first load (or via "Replay intro").
export function TitleScreen({
  onPick,
  onResume,
  onClose,
  showClose,
  hardUnlocked,
}: {
  onPick: (m: PortfolioMode) => void;
  onResume?: () => void;
  onClose?: () => void;
  showClose?: boolean;
  hardUnlocked?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2a1a4a 0%, #0a0414 55%, #000 100%)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* parallax silhouette layers */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-32 opacity-40"
          style={{
            background:
              "linear-gradient(to top, #1a0830 0%, transparent 100%)",
            clipPath:
              "polygon(0 100%, 0 60%, 8% 70%, 16% 50%, 24% 65%, 32% 45%, 42% 60%, 52% 40%, 62% 55%, 72% 35%, 82% 50%, 92% 30%, 100% 45%, 100% 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 opacity-70"
          style={{
            background: "#0a0414",
            clipPath:
              "polygon(0 100%, 0 70%, 12% 80%, 22% 60%, 35% 75%, 48% 55%, 60% 70%, 72% 50%, 85% 65%, 100% 55%, 100% 100%)",
          }}
        />
      </div>

      {/* starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${(i * 53) % 100}%`,
              left: `${(i * 37) % 100}%`,
              width: i % 7 === 0 ? 3 : 2,
              height: i % 7 === 0 ? 3 : 2,
              opacity: 0.25 + ((i * 7) % 7) / 12,
              animation: `twinkle ${2 + (i % 5)}s ease-in-out ${i * 0.13}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle { from { opacity: 0.15 } to { opacity: 0.95 } }
        @keyframes title-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(168,181,255,0.35), 0 0 40px rgba(168,181,255,0.15) }
          50% { text-shadow: 0 0 30px rgba(168,181,255,0.55), 0 0 60px rgba(168,181,255,0.25) }
        }
        @keyframes cursor-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
        @keyframes start-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(124,255,177,0.5) }
          50% { transform: scale(1.02); box-shadow: 0 0 0 12px rgba(124,255,177,0) }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-xl text-center text-white">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/50">
          A Portfolio · Side-Scroller
        </div>
        <h1
          className="mt-3 font-bold leading-[0.95]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(40px, 11vw, 76px)",
            animation: "title-glow 4s ease-in-out infinite",
          }}
        >
          Param Minhas
        </h1>
        <div
          className="mt-3 font-mono uppercase tracking-[0.3em] text-white/70"
          style={{ fontSize: "clamp(9px, 2.4vw, 12px)" }}
        >
          Builder · Designer · Director · Producer
          <span style={{ animation: "cursor-blink 1s step-end infinite" }}>▍</span>
        </div>
        <p
          className="mx-auto mt-5 max-w-md text-white/75"
          style={{ fontSize: "clamp(12px, 3vw, 14px)", lineHeight: 1.55 }}
        >
          15 years of building, told as a side-scroller. Walk it, talk to people, collect the story.
        </p>

        <button
          onClick={() => onPick("easy")}
          onPointerDown={(e) => {
            e.preventDefault();
            onPick("easy");
          }}
          className="mt-7 w-full rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-emerald-400/30 py-5 font-mono text-[14px] font-bold uppercase tracking-[0.3em] text-emerald-100 transition active:scale-[0.97] sm:text-[16px]"
          style={{ animation: "start-pulse 2.5s ease-in-out infinite" }}
        >
          ▶ Press Start
        </button>

        {/* Cliff-notes shortcut hint */}
        {/* Secondary action row */}
        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          {onResume && (
            <button
              onClick={onResume}
              className="rounded-full border border-white/30 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:bg-white/15 transition"
            >
              📄 Résumé
            </button>
          )}
          <button
            onClick={() => {/* Cliff notes opened via keyboard ? — shown as hint */}}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/15 transition"
            title="Press ? in-game for the 30-second career overview"
          >
            ? Career overview
          </button>
          <button
            onClick={() => onPick("quick")}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/15 transition"
          >
            ⚡ Sim tour
          </button>
          <a
            href="mailto:param@catscandance.com"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/15 transition"
          >
            ✉ Contact
          </a>
        </div>

        {hardUnlocked && (
          <button
            onClick={() => onPick("hard")}
            className="mt-4 inline-block rounded-full border border-rose-400/60 bg-rose-400/10 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-rose-200 hover:bg-rose-400/20"
          >
            ★ Hard mode unlocked
          </button>
        )}

        {showClose && (
          <button
            onClick={onClose}
            className="mt-5 block w-full rounded border border-white/20 py-2 font-mono text-[10px] uppercase tracking-widest text-white/60 hover:bg-white/10"
          >
            ✕ Close
          </button>
        )}

        {/* Chapter chips strip — shows the 6 worlds at a glance */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {LEVELS.filter((l) => l.id !== "home").map((l) => (
            <span
              key={l.id}
              className="rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest sm:text-[9px]"
              style={{ borderColor: l.palette.accent, color: l.palette.accent, background: `${l.palette.accent}10` }}
              title={l.era}
            >
              W{l.index} · {l.name}
            </span>
          ))}
        </div>

        <div className="mt-4 font-mono text-[8px] uppercase tracking-[0.3em] text-white/30">
          ← → walk · space jump · e talk · esc close
        </div>
      </div>
    </div>
  );
}


// Always-visible Hire / Contact pill (top-right of the game)
export function ContactPill({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="pointer-events-auto rounded-full border border-white/40 bg-black/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white shadow-lg backdrop-blur hover:scale-105 hover:bg-white/10"
    >
      ✉ Hire / Contact
    </button>
  );
}

export function ContactSheet({ onClose }: { onClose: () => void }) {
  const items: { label: string; sub: string; href: string; icon: string }[] = [
    { label: "Email", sub: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: "✉" },
    { label: "LinkedIn", sub: "in/paramminhas", href: CONTACT.linkedin, icon: "in" },
    { label: "Twitter / X", sub: "@paramminhas", href: CONTACT.twitter, icon: "𝕏" },
    { label: "Studio", sub: "catscandance.com", href: CONTACT.site, icon: "★" },
  ];
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border-2 border-white/30 bg-[#0c0820] p-6 text-white shadow-2xl">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-white/50">Contact</div>
        <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Let's talk.
        </h2>
        <div className="grid gap-2">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target={it.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 p-3 transition hover:scale-[1.02] hover:bg-white/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 font-mono text-sm">{it.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-bold">{it.label}</div>
                <div className="font-mono text-[11px] text-white/60">{it.sub}</div>
              </div>
              <span className="font-mono text-[10px] text-white/50">↗</span>
            </a>
          ))}
          <button
            onClick={() => navigator.clipboard?.writeText(CONTACT.email)}
            className="rounded border border-white/30 py-2 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:bg-white/10"
          >
            📋 Copy email
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded border border-white/30 py-2 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}

// Floating unlock toast
export function UnlockToast({ label }: { label: string }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2 animate-fade-in rounded-lg border-2 border-yellow-300 bg-black/85 px-4 py-2 text-center font-mono text-[11px] uppercase tracking-widest text-yellow-200 shadow-2xl backdrop-blur">
      ★ Unlocked · <span className="text-white">{label}</span>
    </div>
  );
}


export function Inventory({
  collectedSkills,
  collectedClippings,
  collectedQuotes,
  progress,
  onClose,
  onJump,
}: {
  collectedSkills: { skill: string; levelId: string }[];
  collectedClippings: { levelId: string; title: string; body: string; source: string }[];
  collectedQuotes: { levelId: string; name: string; quote: string }[];
  progress: Progress;
  onClose: () => void;
  onJump: (l: Level) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-xl border-2 border-white/30 bg-[#0c0820] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Inventory · Pause</div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              What you've collected
            </h2>
          </div>
          <button onClick={onClose} className="rounded border border-white/30 px-3 py-1 font-mono text-[10px] uppercase text-white hover:bg-white/10">
            ▶ Resume
          </button>
        </div>

        <Section title="Skills earned" accent="#ffd24a">
          {collectedSkills.length === 0 ? (
            <Empty text="Collect coins in each world to earn skill chips." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {collectedSkills.map((s, i) => {
                const lv = LEVELS.find((l) => l.id === s.levelId)!;
                return (
                  <span
                    key={i}
                    className="rounded-full border px-3 py-1 font-mono text-[11px]"
                    style={{ borderColor: lv.palette.accent, color: lv.palette.accent, background: `${lv.palette.accent}10` }}
                  >
                    {s.skill}
                  </span>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Press clippings" accent="#a8b5ff">
          {collectedClippings.length === 0 ? (
            <Empty text="Hit ? blocks to unlock press clippings." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {collectedClippings.map((c, i) => {
                const lv = LEVELS.find((l) => l.id === c.levelId)!;
                return (
                  <div key={i} className="rounded border p-3" style={{ borderColor: lv.palette.accent }}>
                    <div className="font-mono text-[10px] uppercase" style={{ color: lv.palette.accent }}>{c.source}</div>
                    <div className="text-sm font-bold text-white">{c.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="People you met" accent="#ff8c6b">
          {collectedQuotes.length === 0 ? (
            <Empty text="Walk up to characters and press E to meet them." />
          ) : (
            <PeopleCards quotes={collectedQuotes} />
          )}
        </Section>

        <Section title="Worlds" accent="#ffffff">
          <div className="grid gap-2 sm:grid-cols-2">
            {LEVELS.map((l) => {
              const p = progress[l.id] ?? { cleared: false, coins: 0, npcs: 0, clipping: false, secret: false, minigame: false };
              return (
                <button
                  key={l.id}
                  onClick={() => onJump(l)}
                  className="flex items-center justify-between rounded border p-3 text-left transition hover:scale-[1.02]"
                  style={{ borderColor: l.palette.accent, background: `${l.palette.accent}08` }}
                >
                  <div>
                    <div className="font-mono text-[10px] uppercase" style={{ color: l.palette.accent }}>
                      World {l.index}
                    </div>
                    <div className="text-sm font-bold text-white">{l.name}</div>
                    <div className="font-mono text-[10px] text-white/50">
                      ⊙ {p.coins}/{l.coins.length} · ✓{p.cleared ? " cleared" : " open"} · ★{p.minigame ? " star" : " —"}
                    </div>
                  </div>
                  <span className="text-white/60">▶</span>
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

const PORTRAIT_EMOJI: Record<string, string> = {
  founder: "🧑‍💻", investor: "📈", tenant: "🏠", engineer: "⚙️",
  celeb: "⭐", client: "🤝", fan: "🎮",
};

function PeopleCards({ quotes }: { quotes: { levelId: string; name: string; quote: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {quotes.map((q, i) => {
        const lv = LEVELS.find((l) => l.id === q.levelId)!;
        // Find the full NPC data for portrait
        const npcData = lv?.npcs.find((n) => n.name === q.name);
        const emoji = PORTRAIT_EMOJI[npcData?.portrait ?? "founder"] ?? "🧑‍💻";
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            className="rounded-lg border overflow-hidden transition-all"
            style={{ borderColor: isOpen ? lv.palette.accent : `${lv.palette.accent}50` }}
          >
            <button
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition"
              onClick={() => setOpenIdx(isOpen ? null : i)}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg"
                style={{ borderColor: lv.palette.accent, background: `${lv.palette.accent}15` }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white leading-tight">{q.name}</div>
                <div className="font-mono text-[10px] text-white/50" style={{ color: lv.palette.accentDim }}>
                  {npcData?.role ?? lv.era}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-white/30 transition-transform" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>▶</span>
            </button>
            {isOpen && (
              <div
                className="border-t px-4 py-3 text-sm leading-relaxed text-white/80 italic"
                style={{ borderColor: `${lv.palette.accent}40` }}
              >
                "{q.quote}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-sm" style={{ background: accent }} />
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded border border-dashed border-white/20 p-3 text-xs text-white/50">{text}</div>;
}
