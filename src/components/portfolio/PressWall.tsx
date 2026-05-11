// SoleSearch press wall — opens an overlay panel showing live or fallback
// press hits. Triggered when the player walks up to the press kiosk.
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSoleSearchPress } from "@/lib/press.functions";
import { SOLESEARCH_PRESS_FALLBACK } from "./pressFallback";

export function PressWall({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fetchPress = useServerFn(getSoleSearchPress);
  const { data, isLoading } = useQuery({
    queryKey: ["solesearch-press"],
    queryFn: () => fetchPress(),
    staleTime: 60 * 60 * 1000,
    enabled: open, // only fetch when the panel actually opens
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const items = data?.items ?? SOLESEARCH_PRESS_FALLBACK;
  const live = data?.source === "live";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-lg border-2 bg-[#160418] p-3 shadow-2xl sm:p-5"
        style={{ borderColor: "#ff006e", fontFamily: "'DM Mono', monospace" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="text-[10px] uppercase tracking-widest text-white/50"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              SoleSearch · Press Wall
            </div>
            <h2
              className="mt-1 text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What the press said.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              India's leading sneaker & streetwear platform — featured across
              business and culture press.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
          >
            ✕ esc
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: live ? "#2ecc71" : "#ffaa33" }}
          />
          <span>{isLoading ? "Loading…" : live ? "Live · Firecrawl" : "Curated"}</span>
        </div>

        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li key={it.url}>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block rounded-md border-2 border-white/10 bg-black/40 p-3 transition-transform hover:-translate-y-0.5 hover:border-[#ff006e]/60"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest text-[#ff9fd4]"
                  >
                    {it.source}
                  </span>
                  <span className="font-mono text-[8px] text-white/30">↗ open</span>
                </div>
                <div
                  className="mt-1 text-[13px] font-bold leading-tight text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {it.title}
                </div>
                {it.snippet ? (
                  <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/65">
                    {it.snippet}
                  </div>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
