// Tiny Web Audio synth — no files, no deps.
let ctx: AudioContext | null = null;
let muted = true;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const W = window as unknown as { AudioContext?: typeof AudioContext };
    if (!W.AudioContext) return null;
    ctx = new W.AudioContext();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function beep(freq: number, dur: number, type: OscillatorType = "square", vol = 0.05) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export const sfx = {
  jump: () => beep(520, 0.12, "square", 0.04),
  coin: () => {
    beep(880, 0.08);
    setTimeout(() => beep(1320, 0.12), 60);
  },
  bump: () => beep(180, 0.08, "square", 0.04),
  power: () => {
    beep(440, 0.08);
    setTimeout(() => beep(660, 0.08), 70);
    setTimeout(() => beep(880, 0.12), 140);
  },
  clear: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle", 0.05), i * 120));
  },
  open: () => beep(660, 0.06, "triangle"),
  win: () => {
    [659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.2, "triangle", 0.05), i * 100));
  },
};
