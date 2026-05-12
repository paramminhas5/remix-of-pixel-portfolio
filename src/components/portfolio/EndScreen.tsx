import { CONTACT, LEVELS } from "./data";
import type { Level } from "./data";

export function ClearCard({
  level,
  earnedSkills,
  cumulative,
  hasMinigame,
  onContinue,
  onMap,
}: {
  level: Level;
  earnedSkills: string[];
  cumulative: string[];
  hasMinigame: boolean;
  onContinue: () => void;
  onMap: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-xl border-4 p-7 text-center shadow-2xl"
        style={{ borderColor: level.palette.accent, background: "linear-gradient(180deg, #0a0414 0%, #18082c 100%)" }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: level.palette.accent }}>
          World {level.index} clear
        </div>
        <h2 className="mt-2 text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {level.name}
        </h2>
        <div className="mt-1 font-mono text-xs text-white/60">{level.era}</div>
        {hasMinigame && (
          <div className="mt-3 font-mono text-xs" style={{ color: "#ffd24a" }}>★ MINI-GAME WON</div>
        )}
        <div className="mt-5 text-left">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/60">Skills earned this world</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {earnedSkills.length === 0 ? (
              <span className="text-xs text-white/50">No coins collected — replay to earn skills.</span>
            ) : (
              earnedSkills.map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 font-mono text-[11px]" style={{ borderColor: level.palette.accent, color: level.palette.accent }}>
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
        {cumulative.length > 0 && (
          <div className="mt-5 text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Total stack so far</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cumulative.map((s) => (
                <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <button
            onClick={onMap}
            className="flex-1 rounded border-2 border-white/30 py-2 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/10"
          >
            ▶ World Map
          </button>
          {level.index < LEVELS.length && (
            <button
              onClick={onContinue}
              className="flex-1 rounded border-2 py-2 font-mono text-[11px] uppercase tracking-widest text-white"
              style={{ borderColor: level.palette.accent, background: `${level.palette.accent}30` }}
            >
              Next World ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EndScreen({
  collectedSkills,
  collectedClippings,
  collectedQuotes,
  onRestart,
}: {
  collectedSkills: string[];
  collectedClippings: { levelId: string; title: string; body: string; source: string }[];
  collectedQuotes: { levelId: string; name: string; quote: string }[];
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#0a0414] via-[#1a0830] to-[#3a0e5f] p-6">
      <div className="mx-auto max-w-3xl py-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">— Game cleared —</div>
        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
          15 years. 7 worlds.
          <br />
          Still building.
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-sm text-white/70">
          You've walked the whole journey. Here's everything you found.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-5 text-left">
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Skill cloud</div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {collectedSkills.length === 0 ? (
              <span className="text-xs text-white/50">No skills collected. Replay to grab some coins.</span>
            ) : (
              collectedSkills.map((s, i) => {
                const size = 11 + ((i * 13) % 7);
                return (
                  <span key={s + i} className="rounded-full border border-white/30 px-3 py-1 font-mono text-white" style={{ fontSize: size }}>
                    {s}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {collectedClippings.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Clippings</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {collectedClippings.map((c, i) => {
                const lv = LEVELS.find((l) => l.id === c.levelId)!;
                return (
                  <div key={i} className="rounded border p-3" style={{ borderColor: lv.palette.accent }}>
                    <div className="font-mono text-[10px] uppercase" style={{ color: lv.palette.accent }}>{c.source}</div>
                    <div className="text-sm font-bold text-white">{c.title}</div>
                    <p className="mt-1 whitespace-pre-line text-xs text-white/70">{c.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {collectedQuotes.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Quote wall</div>
            <div className="mt-3 space-y-3">
              {collectedQuotes.map((q, i) => {
                const lv = LEVELS.find((l) => l.id === q.levelId)!;
                return (
                  <blockquote key={i} className="border-l-2 pl-3 text-sm italic text-white/85" style={{ borderColor: lv.palette.accent }}>
                    "{q.quote}"
                    <div className="mt-1 font-mono text-[10px] not-italic text-white/50">— {q.name}</div>
                  </blockquote>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary CTA — email */}
        <a
          href={`mailto:${CONTACT.email}`}
          className="mt-8 block w-full rounded border-2 border-emerald-300 bg-emerald-400/20 py-4 font-mono text-[13px] font-bold uppercase tracking-widest text-emerald-100 hover:bg-emerald-400/30 transition"
        >
          ✉ Get in touch — {CONTACT.email}
        </a>
        {/* Secondary links */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <a href={CONTACT.resume} className="rounded border-2 border-white/40 py-3 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/10">
            📄 Résumé
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="rounded border-2 border-white/40 py-3 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/10">
            LinkedIn ↗
          </a>
          <a href={CONTACT.twitter} target="_blank" rel="noreferrer" className="rounded border-2 border-white/40 py-3 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/10">
            Twitter ↗
          </a>
          <a href={CONTACT.site} target="_blank" rel="noreferrer" className="rounded border-2 border-white/40 py-3 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/10">
            catscandance.com ↗
          </a>
        </div>
        <button
          onClick={onRestart}
          className="mt-8 rounded border-2 border-white bg-white/10 px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-white/20"
        >
          ↺ New Game +
        </button>
      </div>
    </div>
  );
}

export function TouchControls({
  onLeft,
  onRight,
  onJump,
  onInteract,
}: {
  onLeft: (down: boolean) => void;
  onRight: (down: boolean) => void;
  onJump: (down: boolean) => void;
  onInteract: () => void;
}) {
  const btn =
    "select-none touch-manipulation rounded-full border-2 border-white/50 bg-black/65 backdrop-blur font-mono text-white shadow-2xl active:bg-white/30 active:scale-90 transition duration-75";
  const stop = (e: React.PointerEvent) => { e.preventDefault(); (e.target as Element).releasePointerCapture?.(e.pointerId); };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-30 flex items-end justify-between px-3 sm:hidden" style={{ touchAction: "none" }}>
      <div className="pointer-events-auto flex gap-2">
        <button
          className={`${btn} h-16 w-16 text-3xl`}
          onPointerDown={(e) => { e.preventDefault(); onLeft(true); }}
          onPointerUp={(e) => { stop(e); onLeft(false); }}
          onPointerCancel={(e) => { stop(e); onLeft(false); }}
          onPointerLeave={() => onLeft(false)}
        >◀</button>
        <button
          className={`${btn} h-16 w-16 text-3xl`}
          onPointerDown={(e) => { e.preventDefault(); onRight(true); }}
          onPointerUp={(e) => { stop(e); onRight(false); }}
          onPointerCancel={(e) => { stop(e); onRight(false); }}
          onPointerLeave={() => onRight(false)}
        >▶</button>
      </div>
      <div className="pointer-events-auto flex items-end gap-2">
        <button
          className={`${btn} h-14 w-14 text-[9px] leading-tight`}
          onPointerDown={(e) => { e.preventDefault(); onInteract(); }}
        >E<br />TALK</button>
        <button
          className={`${btn} h-20 w-20 text-sm font-bold`}
          onPointerDown={(e) => { e.preventDefault(); onJump(true); }}
          onPointerUp={(e) => { stop(e); onJump(false); }}
          onPointerCancel={(e) => { stop(e); onJump(false); }}
          onPointerLeave={() => onJump(false)}
        >A<br />JUMP</button>
      </div>
    </div>
  );
}
