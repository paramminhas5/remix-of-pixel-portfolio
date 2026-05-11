import { useCallback, useEffect, useState } from "react";

export type PortfolioMode = "easy" | "hard" | "quick";
export type ViewMode = "game" | "resume";

const MODE_KEY = "ppfolio.mode";
const VIEW_KEY = "ppfolio.viewMode";
const XP_KEY = "ppfolio.xp";
const UNLOCKS_KEY = "ppfolio.unlocks";
const SEEN_TITLE_KEY = "ppfolio.seenTitle";
const HARD_UNLOCK_KEY = "ppfolio.hardUnlocked";

export const UNLOCKS = [
  { xp: 5, id: "skin", label: "Alt skin: builder" },
  { xp: 12, id: "secret", label: "Secret B-side chapter" },
  { xp: 20, id: "commentary", label: "Director's commentary" },
  { xp: 35, id: "ngplus", label: "New Game+ (night palette)" },
] as const;

export type UnlockId = (typeof UNLOCKS)[number]["id"];

function readMode(): PortfolioMode {
  if (typeof window === "undefined") return "easy";
  const v = localStorage.getItem(MODE_KEY);
  return v === "easy" || v === "hard" || v === "quick" ? v : "easy";
}
function readView(): ViewMode {
  if (typeof window === "undefined") return "game";
  const v = localStorage.getItem(VIEW_KEY);
  return v === "resume" ? "resume" : "game";
}
function readXp(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(XP_KEY) ?? 0) || 0;
}
function readUnlocks(): UnlockId[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(UNLOCKS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function usePortfolioMode() {
  const [mode, setModeState] = useState<PortfolioMode>(() => readMode());
  const [viewMode, setViewModeState] = useState<ViewMode>(() => readView());
  const [xp, setXp] = useState<number>(() => readXp());
  const [unlocks, setUnlocks] = useState<UnlockId[]>(() => readUnlocks());
  const [seenTitle, setSeenTitle] = useState<boolean>(() =>
    typeof window === "undefined" ? false : localStorage.getItem(SEEN_TITLE_KEY) === "1",
  );
  const [hardUnlocked, setHardUnlockedState] = useState<boolean>(() =>
    typeof window === "undefined" ? false : localStorage.getItem(HARD_UNLOCK_KEY) === "1",
  );

  useEffect(() => {
    if (mode) localStorage.setItem(MODE_KEY, mode);
  }, [mode]);
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode);
  }, [viewMode]);
  useEffect(() => {
    localStorage.setItem(XP_KEY, String(xp));
  }, [xp]);
  useEffect(() => {
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
  }, [unlocks]);
  useEffect(() => {
    localStorage.setItem(HARD_UNLOCK_KEY, hardUnlocked ? "1" : "0");
  }, [hardUnlocked]);

  const setMode = useCallback((m: PortfolioMode) => {
    setModeState(m);
    localStorage.setItem(SEEN_TITLE_KEY, "1");
    setSeenTitle(true);
  }, []);

  const setViewMode = useCallback((v: ViewMode) => {
    setViewModeState(v);
    localStorage.setItem(SEEN_TITLE_KEY, "1");
    setSeenTitle(true);
  }, []);

  const markTitleSeen = useCallback(() => {
    localStorage.setItem(SEEN_TITLE_KEY, "1");
    setSeenTitle(true);
  }, []);

  const unlockHard = useCallback(() => setHardUnlockedState(true), []);

  const addXp = useCallback(
    (n = 1): { newUnlocks: typeof UNLOCKS[number][] } => {
      let newUnlocks: typeof UNLOCKS[number][] = [];
      setXp((prev) => {
        const next = prev + n;
        newUnlocks = UNLOCKS.filter((u) => prev < u.xp && next >= u.xp);
        if (newUnlocks.length) {
          setUnlocks((u) => Array.from(new Set([...u, ...newUnlocks.map((x) => x.id)])));
        }
        return next;
      });
      return { newUnlocks };
    },
    [],
  );

  const nextUnlock = UNLOCKS.find((u) => xp < u.xp) ?? null;

  return { mode, setMode, viewMode, setViewMode, xp, addXp, unlocks, nextUnlock, seenTitle, markTitleSeen, hardUnlocked, unlockHard };
}
