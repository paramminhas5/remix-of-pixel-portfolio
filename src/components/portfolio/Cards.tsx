import type { Clipping, Secret } from "./data";

export function ClippingCard({
  clip,
  accent,
  onClose,
}: {
  clip: Clipping;
  accent: string;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div
        className="max-h-[80dvh] w-[92vw] max-w-[540px] overflow-y-auto rounded-lg border-2 bg-black/95 p-4 shadow-2xl sm:p-6"
        style={{ borderColor: accent }}
      >
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          ★ Why it mattered · Press Clipping
        </div>
        <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
          {clip.title}
        </h3>
        <div className="mt-1 font-mono text-[11px] text-white/50">{clip.source}</div>
        <p className="mt-4 whitespace-pre-line text-[13px] leading-relaxed text-white/90 sm:text-sm">{clip.body}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded border-2 py-2 font-mono text-[11px] uppercase tracking-widest text-white"
          style={{ borderColor: accent, background: `${accent}20` }}
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

export function SecretCard({
  secret,
  accent,
  onClose,
}: {
  secret: Secret;
  accent: string;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80dvh] w-[92vw] max-w-[480px] overflow-y-auto rounded-lg border-2 bg-black/95 p-4 shadow-2xl sm:p-6" style={{ borderColor: accent }}>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          ✦ Secret unlocked
        </div>
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {secret.title}
        </h3>
        <p className="mt-3 text-[13px] italic leading-relaxed text-white/85 sm:text-sm">{secret.body}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded border-2 py-2 font-mono text-[11px] uppercase tracking-widest text-white"
          style={{ borderColor: accent, background: `${accent}20` }}
        >
          Climb back up
        </button>
      </div>
    </Modal>
  );
}

export function StoryCard({
  title,
  story,
  accent,
  onClose,
}: {
  title: string;
  story: string;
  accent: string;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="rounded-lg border-2 bg-black/95 p-6 shadow-2xl" style={{ borderColor: accent, maxWidth: 520 }}>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          Now entering
        </div>
        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85">{story}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded border-2 py-2 font-mono text-[11px] uppercase tracking-widest text-white"
          style={{ borderColor: accent, background: `${accent}20` }}
        >
          ▶ Start
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
