import { LEVELS, type Level } from "./data";

/**
 * "Cliff notes" overlay — opens with `?` key. Full career arc at a glance,
 * with click-to-warp to any chapter.
 */
export function CliffNotes({
  onClose,
  onJump,
}: {
  onClose: () => void;
  onJump: (l: Level) => void;
}) {
  const arc = LEVELS.filter((l) => l.id !== "home");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-lg border-2 border-white/20 bg-[#0a0814] p-3 shadow-2xl sm:p-5"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div
              className="text-[10px] uppercase tracking-widest text-white/50"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              Cliff notes · 30 seconds
            </div>
            <h2
              className="mt-1 text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Param Minhas — fifteen years, in one breath.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Builder. Designer. Creative Director. Music Producer. Tap any chapter to warp there.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            ✕ esc
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {arc.map((l) => {
            const m = l.metrics;
            return (
              <button
                key={l.id}
                onClick={() => {
                  onJump(l);
                  onClose();
                }}
                className="group rounded-md border-2 bg-black/50 p-3 text-left transition-transform hover:-translate-y-0.5"
                style={{ borderColor: l.palette.accent }}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: l.palette.accent }}
                  >
                    World {l.index} · {l.name}
                  </span>
                  <span className="font-mono text-[8px] text-white/40">{m?.years ?? l.era}</span>
                </div>
                <div
                  className="mt-1 text-[13px] font-bold leading-tight text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {m?.role ?? l.name}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-white/80">
                  {m?.outcome ?? l.blurb}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between text-[10px] text-white/40">
          <span>Press <span className="text-white/70">?</span> any time to reopen</span>
          <span>Press <span className="text-white/70">esc</span> to close</span>
        </div>
      </div>
    </div>
  );
}
