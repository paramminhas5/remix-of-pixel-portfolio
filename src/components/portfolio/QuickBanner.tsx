import { useEffect, useState } from "react";

export type Banner = {
  id: number;
  title: string;
  body: string;
  accent: string;
};

export function QuickBanner({ banners, onExpire }: { banners: Banner[]; onExpire: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed z-40 flex flex-col gap-2
                 left-1/2 -translate-x-1/2 w-[92vw] max-w-sm
                 bottom-[120px]
                 sm:left-auto sm:right-3 sm:translate-x-0 sm:top-24 sm:bottom-auto sm:w-80"
    >
      {banners.map((b) => (
        <BannerCard key={b.id} banner={b} onExpire={() => onExpire(b.id)} />
      ))}
    </div>
  );
}

function BannerCard({ banner, onExpire }: { banner: Banner; onExpire: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => setVisible(false), 2400);
    const t3 = setTimeout(onExpire, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onExpire]);
  return (
    <div
      className="overflow-hidden rounded-lg border bg-black/85 shadow-2xl backdrop-blur transition-all duration-300"
      style={{
        borderColor: banner.accent,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
      }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ background: banner.accent }} />
        <div className="flex-1 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: banner.accent }}>
            {banner.title}
          </div>
          <div className="mt-0.5 line-clamp-3 text-[12px] leading-snug text-white/90">{banner.body}</div>
        </div>
      </div>
    </div>
  );
}
