import { LEVELS, type Level } from "./data";

export type Progress = Record<
  string,
  { cleared: boolean; coins: number; npcs: number; clipping: boolean; secret: boolean; minigame: boolean }
>;

export function emptyProgress(): Progress {
  return Object.fromEntries(
    LEVELS.map((l) => [l.id, { cleared: false, coins: 0, npcs: 0, clipping: false, secret: false, minigame: false }]),
  );
}

// Chapter icon emoji per level — kept simple, themed, matches in-world props.
const CHAPTER_ICON: Record<string, string> = {
  origin: "✦",
  grp: "₹",
  hab: "⌂",
  ai: "◈",
  investopad: "▲",
  sole: "♔",
  ccd: "♪",
  fere: "⬡",
  iterate: "◐",
};

// Pixel-art wooden chapter ribbon — pinned to top of game.
export function WorldMap({
  progress,
  activeLevelId,
  onWarp,
}: {
  progress: Progress;
  activeLevelId: string | null;
  onWarp: (l: Level) => void;
}) {
  return (
    <div
      className="relative z-30 w-full select-none border-b-2 border-[#3a210d] shadow-[0_4px_0_0_rgba(0,0,0,0.5)]"
      style={{
        background:
          "repeating-linear-gradient(90deg, #6b3a18 0px, #7a4220 14px, #6b3a18 28px, #5a2f12 42px), linear-gradient(180deg, #8a4a22 0%, #5a2f12 100%)",
        backgroundBlendMode: "multiply",
        fontFamily: "'Press Start 2P', monospace",
      }}
    >
      {/* nail dots row */}
      <div className="absolute inset-x-0 top-0 hidden h-2 items-start justify-between px-3 opacity-70 sm:flex">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#1a0a02] shadow-[inset_0_-1px_0_#5a2f12]" />
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] items-stretch gap-1 overflow-x-auto px-2 pt-2 pb-1.5 sm:gap-2 sm:px-3 sm:pt-3 sm:pb-2">
        <div className="hidden shrink-0 items-center pr-2 text-[8px] uppercase tracking-[0.25em] text-[#fde2bf] sm:flex">
          PARAM.exe
        </div>
        {LEVELS.map((l, i) => {
          const p = progress[l.id] ?? { cleared: false, coins: 0, npcs: 0, clipping: false, secret: false, minigame: false };
          const active = activeLevelId === l.id;
          const allCoins = p.coins >= l.coins.length && l.coins.length > 0;
          const icon = CHAPTER_ICON[l.id] ?? String(l.index);
          return (
            <button
              key={l.id}
              onClick={() => onWarp(l)}
              title={`${l.name} — ${l.blurb}`}
              style={{ minWidth: 84 }}
              className="group relative flex shrink-0 flex-col items-center justify-center transition-transform hover:-translate-y-0.5 sm:min-w-[110px]"
            >
              {/* lantern flame above active */}
              {active && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span
                    className="block h-2 w-2 animate-pulse rounded-full"
                    style={{
                      background: l.palette.accent,
                      boxShadow: `0 0 10px ${l.palette.accent}, 0 0 18px ${l.palette.accent}`,
                    }}
                  />
                </div>
              )}

              {/* Carved wooden chapter sign */}
              <div
                className="relative flex h-9 w-full items-center justify-center sm:h-12"
                style={{
                  imageRendering: "pixelated",
                  background: active
                    ? `linear-gradient(180deg, ${l.palette.brick} 0%, ${l.palette.brickShade} 100%)`
                    : "linear-gradient(180deg, #4a2810 0%, #2e1808 100%)",
                  border: `2px solid ${active ? "#fde2bf" : "#1a0a02"}`,
                  boxShadow: active
                    ? `inset 0 0 0 1px ${l.palette.accent}, 0 2px 0 0 #1a0a02`
                    : "inset 0 -2px 0 0 rgba(0,0,0,0.4), 0 2px 0 0 #1a0a02",
                  borderRadius: 2,
                }}
              >
                {/* corner pegs */}
                <span className="absolute left-1 top-1 h-1 w-1 bg-[#1a0a02]" />
                <span className="absolute right-1 top-1 h-1 w-1 bg-[#1a0a02]" />
                <span className="absolute left-1 bottom-1 h-1 w-1 bg-[#1a0a02]" />
                <span className="absolute right-1 bottom-1 h-1 w-1 bg-[#1a0a02]" />

                {/* side-world badge */}
                {l.isSideWorld && (
                  <div className="absolute -left-1 bottom-0 translate-y-full pt-0.5">
                    <span className="block rounded-sm bg-white/20 px-1 font-mono text-[5px] uppercase tracking-widest text-white/60">side</span>
                  </div>
                )}
                {/* number stripe */}
                <div
                  className="absolute left-0 right-0 top-0 h-[3px]"
                  style={{ background: l.palette.accent, opacity: active ? 1 : 0.7 }}
                />

                <div className="flex flex-col items-center leading-none">
                  <span
                    className="text-[14px]"
                    style={{ color: active ? "#fff" : l.palette.accent, textShadow: "1px 1px 0 #000" }}
                  >
                    {icon}
                  </span>
                  <span
                    className="mt-0.5 text-[7px]"
                    style={{ color: active ? "#fff" : "#fde2bf", textShadow: "1px 1px 0 #000" }}
                  >
                    W{l.index}
                  </span>
                </div>

                {/* stamps */}
                {p.cleared && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center text-[8px]"
                    style={{
                      background: "#3ddc7a",
                      color: "#0a2a14",
                      border: "1px solid #1a0a02",
                      boxShadow: "0 1px 0 #1a0a02",
                    }}
                  >
                    ✓
                  </span>
                )}
                {p.minigame && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center text-[8px]"
                    style={{
                      background: "#ffd24a",
                      color: "#3a2200",
                      border: "1px solid #1a0a02",
                    }}
                  >
                    ★
                  </span>
                )}
                {allCoins && (
                  <span
                    className="absolute -left-1 -top-1 flex h-3 items-center justify-center px-1 text-[6px] font-bold"
                    style={{ background: "#fff", color: "#000", border: "1px solid #1a0a02" }}
                  >
                    100
                  </span>
                )}
              </div>

              {/* chapter name plank — always visible, full name */}
              <div
                className="mt-1 w-full px-0.5 text-center text-[7px] uppercase tracking-wider sm:text-[9px] leading-tight"
                style={{ color: active ? l.palette.accent : "#fde2bf", textShadow: "1px 1px 0 #1a0a02" }}
              >
                {l.name}
              </div>

              {/* hover tooltip */}
              <div
                className="pointer-events-none absolute top-full z-20 mt-2 hidden max-w-[180px] rounded border border-[#1a0a02] bg-[#fde2bf] px-2 py-1 text-[8px] normal-case text-[#3a210d] shadow-[0_2px_0_#1a0a02] group-hover:block"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                <div className="font-bold">{l.era}</div>
                <div className="mt-0.5 leading-snug">{l.blurb}</div>
              </div>

              {/* connector rope to next chapter */}
              {i < LEVELS.length - 1 && (
                <span className="absolute right-[-6px] top-6 h-0.5 w-3 bg-[#1a0a02]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
