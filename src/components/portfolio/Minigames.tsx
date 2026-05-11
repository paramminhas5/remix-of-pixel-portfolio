import { useEffect, useRef, useState } from "react";
import type { MinigameId } from "./data";
import { sfx } from "./audio";

export type MinigameResult = { win: boolean };

export function Minigame({
  id,
  accent,
  onDone,
}: {
  id: MinigameId;
  accent: string;
  onDone: (r: MinigameResult) => void;
}) {
  switch (id) {
    case "price-match":
      return <PriceMatch accent={accent} onDone={onDone} />;
    case "stack-blocks":
      return <StackBlocks accent={accent} onDone={onDone} />;
    case "chat-match":
      return <ChatMatch accent={accent} onDone={onDone} />;
    case "pick-unicorn":
      return <PickUnicorn accent={accent} onDone={onDone} />;
    case "spot-fake":
      return <SpotFake accent={accent} onDone={onDone} />;
    case "rhythm-tap":
      return <RhythmTap accent={accent} onDone={onDone} />;
  }
}

function Shell({
  accent,
  title,
  hint,
  children,
}: {
  accent: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border-2 p-5" style={{ borderColor: accent, background: "rgba(10,5,20,0.92)" }}>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
        Mini-game
      </div>
      <div className="mb-3 text-xl font-bold text-white" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14 }}>
        {title}
      </div>
      <div className="mb-4 text-xs text-white/70">{hint}</div>
      {children}
    </div>
  );
}

// ── Price Match ───────────────────────────────────────────────────
function PriceMatch({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const [prices] = useState(() => {
    const arr = [Math.floor(Math.random() * 30 + 60), Math.floor(Math.random() * 30 + 60), Math.floor(Math.random() * 30 + 60)];
    arr[Math.floor(Math.random() * 3)] = Math.floor(Math.random() * 20 + 25);
    return arr;
  });
  const min = Math.min(...prices);
  const [t, setT] = useState(60);
  useEffect(() => {
    const i = setInterval(() => setT((v) => Math.max(0, v - 1)), 100);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (t === 0) onDone({ win: false });
  }, [t, onDone]);
  return (
    <Shell accent={accent} title="The market stall: lowest price" hint="A customer's eyeing your crate. Pick the rupee tag that beats the rest. 6 seconds.">
      <div className="mb-3 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full transition-[width]" style={{ width: `${t * 1.66}%`, background: accent }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {prices.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              const win = p === min;
              if (win) sfx.win();
              else sfx.bump();
              onDone({ win });
            }}
            className="rounded border-2 py-4 font-mono text-lg transition hover:scale-105"
            style={{ borderColor: accent, color: "white" }}
          >
            ₹{p * 100}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ── Stack Blocks ──────────────────────────────────────────────────
function StackBlocks({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const [stack, setStack] = useState<number[]>([0]);
  const [pos, setPos] = useState(0);
  const dir = useRef(1);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setPos((p) => {
        let n = p + dir.current * 2.2;
        if (n > 80) {
          n = 80;
          dir.current = -1;
        }
        if (n < -80) {
          n = -80;
          dir.current = 1;
        }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const drop = () => {
    const top = stack[stack.length - 1];
    const offset = Math.abs(pos - top);
    if (offset > 35) {
      sfx.bump();
      onDone({ win: false });
      return;
    }
    sfx.coin();
    const next = [...stack, pos];
    if (next.length >= 4) {
      sfx.win();
      onDone({ win: true });
      return;
    }
    setStack(next);
  };
  return (
    <Shell accent={accent} title="Stack the apartments" hint="Tenants are moving in. Drop floors when aligned. Don't topple the building.">
      <div className="relative mx-auto h-44 w-full overflow-hidden rounded border-2" style={{ borderColor: accent, background: "rgba(255,255,255,0.04)" }}>
        {stack.map((sx, i) => (
          <div
            key={i}
            className="absolute h-8 w-20 rounded"
            style={{ left: `calc(50% + ${sx}px - 40px)`, bottom: i * 32, background: accent, opacity: 0.85 - i * 0.1 }}
          />
        ))}
        <div
          className="absolute h-8 w-20 rounded border-2 border-white"
          style={{ left: `calc(50% + ${pos}px - 40px)`, top: 8, background: accent }}
        />
      </div>
      <button
        onClick={drop}
        className="mt-3 w-full rounded border-2 py-2 font-mono text-sm font-bold text-white"
        style={{ borderColor: accent, background: "rgba(255,255,255,0.08)" }}
      >
        DROP
      </button>
    </Shell>
  );
}

// ── Chat Match ────────────────────────────────────────────────────
function ChatMatch({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const prompts = [
    { q: "User: hi, how do I reset my password?", a: ["Have you tried turning it off?", "Send a magic link to your email", "Sorry, I can't help."] },
    { q: "User: what's your refund policy?", a: ["No refunds.", "30-day refund — let me start it.", "I don't know."] },
    { q: "User: my order hasn't shipped.", a: ["Shipping in 2 business days, here's the tracking", "Wait longer.", "Refund only."] },
  ];
  const [i] = useState(() => Math.floor(Math.random() * prompts.length));
  const correct = 1;
  return (
    <Shell accent={accent} title="The 2013 chatbot — best reply" hint="A user just messaged. You're the bot. One shot.">
      <div className="mb-3 rounded bg-white/5 p-3 font-mono text-sm text-white/90">{prompts[i].q}</div>
      <div className="grid gap-2">
        {prompts[i].a.map((opt, k) => (
          <button
            key={k}
            onClick={() => {
              const win = k === correct;
              if (win) sfx.win();
              else sfx.bump();
              onDone({ win });
            }}
            className="rounded border-2 px-3 py-2 text-left text-sm text-white transition hover:translate-x-1"
            style={{ borderColor: accent }}
          >
            {opt}
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ── Pick Unicorn ──────────────────────────────────────────────────
function PickUnicorn({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const [opts] = useState(() => {
    const all = [
      { name: "DormPay", desc: "P2P payments for college kids in 2014", win: true },
      { name: "GroceryGo", desc: "On-demand toor dal, 90-min delivery", win: false },
      { name: "FaxMaster Pro", desc: "Fax-as-a-service for SMEs", win: false },
    ];
    return all.sort(() => Math.random() - 0.5);
  });
  return (
    <Shell accent={accent} title="Investopad: pick the unicorn" hint="Pre-seed cheque on the table. One pitch. One bet.">
      <div className="grid gap-2">
        {opts.map((o, i) => (
          <button
            key={i}
            onClick={() => {
              if (o.win) sfx.win();
              else sfx.bump();
              onDone({ win: o.win });
            }}
            className="rounded border-2 p-3 text-left transition hover:scale-[1.02]"
            style={{ borderColor: accent, color: "white" }}
          >
            <div className="font-mono text-sm font-bold" style={{ color: accent }}>
              {o.name}
            </div>
            <div className="text-xs text-white/70">{o.desc}</div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

// ── Spot Fake ─────────────────────────────────────────────────────
function SpotFake({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const [t, setT] = useState(50);
  const [pos] = useState(() => (Math.random() < 0.5 ? "L" : "R"));
  useEffect(() => {
    const i = setInterval(() => setT((v) => Math.max(0, v - 1)), 100);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (t === 0) onDone({ win: false });
  }, [t, onDone]);
  const Sneaker = ({ fake }: { fake: boolean }) => (
    <div className="relative h-32 w-full rounded border-2" style={{ borderColor: accent, background: "#0a0510" }}>
      <svg viewBox="0 0 120 60" className="h-full w-full">
        <path d="M5 45 Q15 30 35 28 L60 28 L70 18 L90 18 L100 28 Q115 30 115 42 L115 50 L5 50 Z" fill={accent} />
        <rect x="60" y="42" width="40" height="3" fill="white" opacity="0.6" />
        {/* logo: real = swoosh-ish curve, fake = mirrored/extra */}
        {fake ? (
          <>
            <path d="M40 35 Q55 32 70 36 L70 38 Q55 35 40 38 Z" fill="white" />
            <path d="M40 38 Q55 41 70 38" fill="none" stroke="white" />
          </>
        ) : (
          <path d="M40 35 Q55 32 70 36 L70 38 Q55 35 40 38 Z" fill="white" />
        )}
      </svg>
      <div className="absolute right-2 top-1 font-mono text-[10px] text-white/50">$240</div>
    </div>
  );
  return (
    <Shell accent={accent} title="Superkicks: real or fake?" hint="A buyer's at the shelf. Pick the AUTHENTIC pair. 5 seconds.">
      <div className="mb-3 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full" style={{ width: `${t * 2}%`, background: accent }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { const w = pos === "L"; w ? sfx.win() : sfx.bump(); onDone({ win: w }); }}>
          <Sneaker fake={pos !== "L"} />
        </button>
        <button onClick={() => { const w = pos === "R"; w ? sfx.win() : sfx.bump(); onDone({ win: w }); }}>
          <Sneaker fake={pos !== "R"} />
        </button>
      </div>
    </Shell>
  );
}

// ── Rhythm Tap ────────────────────────────────────────────────────
function RhythmTap({ accent, onDone }: { accent: string; onDone: (r: MinigameResult) => void }) {
  const [step, setStep] = useState(0);
  const [hits, setHits] = useState(0);
  const [missed, setMissed] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const ticks = [0, 600, 1200, 1800];
    const tos: ReturnType<typeof setTimeout>[] = [];
    ticks.forEach((ms, i) => {
      tos.push(
        setTimeout(() => {
          setStep(i + 1);
          setPulse(true);
          setTimeout(() => setPulse(false), 250);
        }, ms),
      );
    });
    tos.push(
      setTimeout(() => {
        const finalHits = hitsRef.current;
        if (finalHits >= 3) {
          sfx.win();
          onDone({ win: true });
        } else {
          sfx.bump();
          onDone({ win: false });
        }
      }, 2400),
    );
    return () => tos.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hitsRef = useRef(0);
  const tap = () => {
    if (pulse) {
      hitsRef.current += 1;
      setHits((h) => h + 1);
      sfx.coin();
    } else {
      setMissed((m) => m + 1);
      sfx.bump();
    }
  };
  return (
    <Shell accent={accent} title="Cats Can Dance: hit the beat" hint="The amp's hot. Tap on each pulse — land 3 of 4.">
      <div className="mb-3 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-6 rounded transition"
            style={{
              background: i <= step ? (pulse && i === step ? accent : "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.06)",
              boxShadow: pulse && i === step ? `0 0 20px ${accent}` : "none",
            }}
          />
        ))}
      </div>
      <button
        onClick={tap}
        className="w-full rounded border-2 py-6 font-mono text-xl text-white transition active:scale-95"
        style={{ borderColor: accent, background: pulse ? accent : "rgba(255,255,255,0.05)" }}
      >
        TAP
      </button>
      <div className="mt-2 text-center font-mono text-xs text-white/60">
        Hits {hits} · Misses {missed}
      </div>
    </Shell>
  );
}
