import { useState } from "react";
import { LEVELS, type Level } from "./data";

export function CliffNotes({
  onClose,
  onJump,
}: {
  onClose: () => void;
  onJump: (l: Level) => void;
}) {
  const arc = LEVELS.filter((l) => l.id !== "home");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
              Builder. Designer. Creative Director. Music Producer. Click any chapter for the full story — or tap to warp there.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            ✕ esc
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {arc.map((l) => {
            const m = l.metrics;
            const isOpen = expandedId === l.id;
            return (
              <div
                key={l.id}
                className="rounded-md border-2 bg-black/50 transition-all"
                style={{ borderColor: isOpen ? l.palette.accent : `${l.palette.accent}60` }}
              >
                {/* Header row — always visible, click to expand */}
                <button
                  className="w-full p-3 text-left"
                  onClick={() => setExpandedId(isOpen ? null : l.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono text-[9px] uppercase tracking-widest shrink-0"
                          style={{ color: l.palette.accent }}
                        >
                          {l.isSideWorld ? "Side World" : `World ${l.index}`} · {l.name}
                        </span>
                        <span className="font-mono text-[8px] text-white/40">{m?.years ?? l.era}</span>
                      </div>
                      <div
                        className="mt-0.5 text-[13px] font-bold leading-tight text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {m?.role ?? l.name}
                      </div>
                      {!isOpen && (
                        <div className="mt-0.5 text-[11px] leading-snug text-white/65 line-clamp-1">
                          {m?.outcome ?? l.blurb}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-white/40 transition-transform" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>
                      ▶
                    </span>
                  </div>
                </button>

                {/* Expanded detail — full chapter summary */}
                {isOpen && (
                  <div className="border-t px-3 pb-3 pt-2" style={{ borderColor: `${l.palette.accent}40` }}>
                    <p className="text-[12px] italic text-white/75 mb-3">{m?.outcome ?? l.blurb}</p>
                    {m?.bullets && (
                      <ul className="space-y-1 mb-3">
                        {m.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2 text-[12px] text-white/80 leading-snug">
                            <span style={{ color: l.palette.accent }} className="shrink-0">▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { onJump(l); onClose(); }}
                        className="flex-1 rounded border-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:opacity-80"
                        style={{ borderColor: l.palette.accent, background: `${l.palette.accent}20` }}
                      >
                        ▶ Warp to world
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
