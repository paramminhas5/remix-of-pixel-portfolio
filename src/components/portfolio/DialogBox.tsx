import type { Npc } from "./data";

export function DialogBox({
  npc,
  accent,
  onClose,
}: {
  npc: Npc;
  accent: string;
  onClose: () => void;
}) {
  const beat = npc.beat;
  const beatLabel = beat === "did" ? "WHAT I DID" : beat === "learned" ? "WHAT I LEARNED" : null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-2 sm:items-end sm:p-4 sm:pb-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative max-h-[70dvh] w-full max-w-2xl overflow-y-auto rounded-lg border-2 bg-black/95 p-3 shadow-2xl sm:p-4"
        style={{ borderColor: accent }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3 sm:gap-4">
          <Portrait kind={npc.portrait} hue={npc.hue} accent={accent} />
          <div className="min-w-0 flex-1">
            {beatLabel && (
              <div
                className="mb-1 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}` }}
              >
                {beatLabel}
              </div>
            )}
            <div className="font-mono text-[9px] uppercase tracking-widest sm:text-[10px]" style={{ color: accent }}>
              {npc.role}
            </div>
            <div className="text-base font-bold text-white sm:text-lg" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12 }}>
              {npc.name}
            </div>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-white/90 sm:text-sm">{npc.quote}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between font-mono text-[10px] text-white/40">
          <span className="hidden sm:inline">Press E or click to close</span>
          <button onClick={onClose} className="ml-auto rounded border border-white/30 px-3 py-1 text-white hover:bg-white/10">▶ CLOSE</button>
        </div>
      </div>
    </div>
  );
}

function Portrait({ kind, hue, accent }: { kind: Npc["portrait"]; hue: number; accent: string }) {
  // Simple SVG pixel-bust portrait. Variations differ by accessory.
  const skin = "#f0c8a0";
  const hair = `hsl(${hue}, 30%, 18%)`;
  const shirt = `hsl(${hue}, 60%, 38%)`;
  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded border-2"
      style={{ borderColor: accent, background: `hsl(${hue}, 50%, 10%)` }}
    >
      <svg viewBox="0 0 16 16" className="h-16 w-16" style={{ imageRendering: "pixelated" }}>
        {/* hair top */}
        <rect x="3" y="2" width="10" height="3" fill={hair} />
        {/* face */}
        <rect x="4" y="4" width="8" height="6" fill={skin} />
        {/* eyes */}
        <rect x="6" y="6" width="1" height="1" fill="#000" />
        <rect x="9" y="6" width="1" height="1" fill="#000" />
        {/* mouth */}
        <rect x="7" y="8" width="2" height="1" fill="#000" />
        {/* shirt */}
        <rect x="3" y="10" width="10" height="6" fill={shirt} />
        {/* accessory */}
        {kind === "celeb" && <rect x="5" y="6" width="6" height="1" fill={accent} opacity="0.6" />}
        {kind === "investor" && <rect x="6" y="11" width="4" height="1" fill={accent} />}
        {kind === "engineer" && <rect x="11" y="3" width="2" height="2" fill={accent} />}
        {kind === "tenant" && <rect x="3" y="2" width="10" height="2" fill={accent} />}
        {kind === "client" && <rect x="6" y="11" width="4" height="2" fill={accent} opacity="0.6" />}
        {kind === "fan" && <rect x="2" y="5" width="2" height="3" fill={accent} />}
      </svg>
    </div>
  );
}
