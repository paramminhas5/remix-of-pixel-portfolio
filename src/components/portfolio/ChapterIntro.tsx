import { useEffect, useState } from "react";
import type { Level } from "./data";

/**
 * Slide-in recruiter card shown when player enters a new chapter.
 * Auto-dismisses after ~6.5s; click body or ✕ to dismiss early.
 * On mobile anchored top-right (canvas toast lives top-center) and capped
 * to ~45vh with internal scroll so long copy never gets clipped.
 */
export function ChapterIntro({
  level,
  onDismiss,
}: {
  level: Level;
  onDismiss: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const m = level.metrics;

  useEffect(() => {
    const t = window.setTimeout(() => setExiting(true), 4200);
    const t2 = window.setTimeout(onDismiss, 4800);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [level.id, onDismiss]);

  if (!m) return null;
  const accent = level.palette.accent;

  const close = () => {
    setExiting(true);
    window.setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`pointer-events-auto absolute right-1 z-30 w-[min(78vw,280px)] origin-top-right transition-all duration-500 sm:left-4 sm:right-auto sm:top-4 sm:w-[320px] sm:origin-top-left ${
        exiting ? "translate-x-[110%] opacity-0 sm:translate-x-[-110%]" : "translate-x-0 opacity-100"
      }`}
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 4px)" }}
    >
      <div
        className="relative max-h-[40vh] overflow-y-auto rounded-md border-2 bg-black/90 p-3 shadow-2xl backdrop-blur-sm"
        style={{ borderColor: accent }}
        onClick={close}
      >
        {/* Close button — 40x40 hit area */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Dismiss chapter intro"
          className="absolute right-0 top-0 grid h-10 w-10 place-items-center text-white/60 hover:text-white"
        >
          ✕
        </button>

        <div className="flex items-start justify-between gap-2 pr-8">
          <div
            className="font-mono uppercase tracking-widest"
            style={{
              color: accent,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(8px, 2.2vw, 9px)",
            }}
          >
            World {level.index} · {level.name}
          </div>
          <span
            className="font-mono uppercase text-white/40"
            style={{ fontSize: "clamp(7px, 2vw, 8px)" }}
          >
            {m.years}
          </span>
        </div>
        <div
          className="mt-1 font-bold leading-tight text-white"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(12px, 3.4vw, 14px)",
          }}
        >
          {m.role}
        </div>
        <div
          className="mt-1 line-clamp-2 leading-snug text-white/85"
          style={{ fontSize: "clamp(10px, 2.6vw, 11px)" }}
        >
          {m.outcome}
        </div>
        <ul className="mt-2 space-y-1">
          {m.bullets.slice(0, 3).map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2 leading-snug text-white/70"
              style={{ fontSize: "clamp(9px, 2.4vw, 10px)" }}
            >
              <span style={{ color: accent }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div
          className="mt-2 text-right font-mono uppercase tracking-widest text-white/30"
          style={{ fontSize: "clamp(7px, 2vw, 8px)" }}
        >
          tap to dismiss
        </div>
      </div>
    </div>
  );
}
