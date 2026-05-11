// Full-screen flash + chapter title that fires whenever the active chapter id
// changes. Mounted once in PixelPortfolio; key changes drive the animation.
import { useEffect, useState } from "react";
import type { Chapter } from "./worldStitch";

export function ChapterFlash({ chapter }: { chapter: Chapter | null }) {
  const [shown, setShown] = useState<Chapter | null>(null);
  const [phase, setPhase] = useState<"in" | "hold" | "out" | "off">("off");

  useEffect(() => {
    if (!chapter) return;
    setShown(chapter);
    setPhase("in");
    const t1 = window.setTimeout(() => setPhase("hold"), 280);
    const t2 = window.setTimeout(() => setPhase("out"), 900);
    const t3 = window.setTimeout(() => setPhase("off"), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [chapter?.levelId]);

  if (!shown || phase === "off") return null;
  const opacity = phase === "in" ? 0.9 : phase === "hold" ? 0.55 : 0;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center transition-opacity duration-500"
      style={{ background: shown.palette.accent + "33", opacity }}
    >
      <div className="text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/80">
          World {shown.index} · {shown.era}
        </div>
        <div
          className="mt-3 text-3xl sm:text-5xl font-bold drop-shadow-2xl"
          style={{ color: shown.palette.accent, textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}
        >
          {shown.name.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
