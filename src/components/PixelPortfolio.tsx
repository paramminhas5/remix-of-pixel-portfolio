import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LEVELS, type Level } from "./portfolio/data";
import {
  LevelView,
  type LevelEvent,
  type LevelHandle,
  type CollectedMap,
} from "./portfolio/Level";
import { WorldMap, emptyProgress, type Progress } from "./portfolio/WorldMap";
import { Hud, Inventory, TitleScreen, ContactPill, ContactSheet, UnlockToast } from "./portfolio/Hud";
import { DialogBox } from "./portfolio/DialogBox";
import { ClippingCard, SecretCard } from "./portfolio/Cards";
import { TouchControls } from "./portfolio/EndScreen";
import { Minigame } from "./portfolio/Minigames";
import { ChapterIntro } from "./portfolio/ChapterIntro";
import { ChapterFlash } from "./portfolio/ChapterFlash";
import { CliffNotes } from "./portfolio/CliffNotes";
import { SkillTree, getSkillIcon } from "./portfolio/SkillTree";
import { ResumeView } from "./portfolio/ResumeView";
import { PressWall } from "./portfolio/PressWall";
import { QuickBanner, type Banner } from "./portfolio/QuickBanner";
import { setMuted as setAudioMuted, sfx } from "./portfolio/audio";
import { setEngineMode } from "./portfolio/engine";
import type { Chapter } from "./portfolio/worldStitch";
import { usePortfolioMode, type PortfolioMode } from "@/hooks/usePortfolioMode";

const FONT_LINK_ID = "param-portfolio-fonts";
function ensureFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700&display=swap";
  document.head.appendChild(link);
}

function makeCollected(): CollectedMap {
  return Object.fromEntries(
    LEVELS.map((l) => [
      l.id,
      { coins: new Set<number>(), npcs: new Set<number>(), clipping: false, secret: false, minigame: false },
    ]),
  );
}

// ── Progress persistence ──────────────────────────────────────────────────────
const PROGRESS_KEY = "ppfolio.progress.v1";
const COLLECTED_KEY = "ppfolio.collected.v1";
const SKILLS_KEY = "ppfolio.skills.v1";
const CLIPPINGS_KEY = "ppfolio.clippings.v1";
const QUOTES_KEY = "ppfolio.quotes.v1";
const CLEARED_KEY = "ppfolio.cleared.v1";

function loadProgress(): import("./portfolio/WorldMap").Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return emptyProgress();
}
function saveProgress(p: import("./portfolio/WorldMap").Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}
function loadCollectedSkills(): { skill: string; levelId: string }[] {
  try { return JSON.parse(localStorage.getItem(SKILLS_KEY) ?? "[]"); } catch { return []; }
}
function loadCollectedClippings(): { levelId: string; title: string; body: string; source: string }[] {
  try { return JSON.parse(localStorage.getItem(CLIPPINGS_KEY) ?? "[]"); } catch { return []; }
}
function loadCollectedQuotes(): { levelId: string; name: string; quote: string }[] {
  try { return JSON.parse(localStorage.getItem(QUOTES_KEY) ?? "[]"); } catch { return []; }
}
function loadClearedSet(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CLEARED_KEY) ?? "[]")); } catch { return new Set(); }
}

export default function PixelPortfolio() {
  useEffect(ensureFonts, []);

  const { mode, setMode, viewMode, setViewMode, xp, addXp, nextUnlock, seenTitle, hardUnlocked, unlockHard } = usePortfolioMode();
  void seenTitle;
  const [titleOpen, setTitleOpen] = useState<boolean>(true);
  // Default to easy mode immediately so first-frame movement is fast & smooth.
  useEffect(() => { if (!mode) setEngineMode("easy"); }, [mode]);
  const [contactOpen, setContactOpen] = useState(false);
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  const [skillToast, setSkillToast] = useState<{ skill: string; accent: string } | null>(null);
  const [introLevel, setIntroLevel] = useState<Level | null>(null);
  const [cliffOpen, setCliffOpen] = useState(false);
  const [skillTreeOpen, setSkillTreeOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const bannerIdRef = useRef(0);
  const pushBanner = useCallback((b: Omit<Banner, "id">) => {
    bannerIdRef.current += 1;
    const id = bannerIdRef.current;
    setBanners((prev) => [...prev.slice(-1), { ...b, id }]);
  }, []);

  // Apply mode to engine whenever it changes; also reset transient input
  // synchronously so a held key from the previous mode doesn't keep moving.
  useEffect(() => {
    if (mode) setEngineMode(mode);
    handleRef.current?.pressLeft(false);
    handleRef.current?.pressRight(false);
    handleRef.current?.pressJump(false);
  }, [mode]);

  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [collected, setCollected] = useState<CollectedMap>(() => makeCollected());
  const [clearedSet, setClearedSet] = useState<Set<string>>(() => loadClearedSet());
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  const [collectedSkills, setCollectedSkills] = useState<{ skill: string; levelId: string }[]>(() => loadCollectedSkills());
  const [collectedClippings, setCollectedClippings] = useState<
    { levelId: string; title: string; body: string; source: string }[]
  >(() => loadCollectedClippings());
  const [collectedQuotes, setCollectedQuotes] = useState<{ levelId: string; name: string; quote: string }[]>(() => loadCollectedQuotes());

  // overlays
  const [npcOpen, setNpcOpen] = useState<{ levelId: string; index: number } | null>(null);
  const [clipOpen, setClipOpen] = useState<Level | null>(null);
  const [secretOpen, setSecretOpen] = useState<Level | null>(null);
  const [minigameOpen, setMinigameOpen] = useState<Level | null>(null);
  const [invOpen, setInvOpen] = useState(false);
  const [pressOpen, setPressOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  useEffect(() => setAudioMuted(muted), [muted]);

  const totalSkills = useMemo(() => LEVELS.reduce((a, l) => a + l.coins.length, 0), []);

  const handleRef = useRef<LevelHandle | null>(null);

  // Persist progress & inventory to localStorage on every change
  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { try { localStorage.setItem(SKILLS_KEY, JSON.stringify(collectedSkills)); } catch {} }, [collectedSkills]);
  useEffect(() => { try { localStorage.setItem(CLIPPINGS_KEY, JSON.stringify(collectedClippings)); } catch {} }, [collectedClippings]);
  useEffect(() => { try { localStorage.setItem(QUOTES_KEY, JSON.stringify(collectedQuotes)); } catch {} }, [collectedQuotes]);
  useEffect(() => { try { localStorage.setItem(CLEARED_KEY, JSON.stringify([...clearedSet])); } catch {} }, [clearedSet]);

  const overlayOpen = !!(npcOpen || clipOpen || secretOpen || minigameOpen || invOpen || cliffOpen || pressOpen);
  useEffect(() => {
    handleRef.current?.pauseInputs(overlayOpen);
  }, [overlayOpen]);

  // shortcuts: Tab → bag; K → skills; Esc closes overlays
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setInvOpen((v) => !v);
      } else if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setCliffOpen((v) => !v);
      } else if (e.key === "k" || e.key === "K") {
        setSkillTreeOpen((v) => !v);
      } else if (e.key === "p" || e.key === "P") {
        setPressOpen((v) => !v);
      } else if (e.key === "Escape") {
        setNpcOpen(null);
        setClipOpen(null);
        setSecretOpen(null);
        setMinigameOpen(null);
        setInvOpen(false);
        setCliffOpen(false);
        setSkillTreeOpen(false);
        setPressOpen(false);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [activeChapter?.levelId]);

  // Detect 100% completion → unlock Hard mode permanently.
  useEffect(() => {
    if (hardUnlocked) return;
    const allSkills = collectedSkills.length >= totalSkills;
    const allClips = LEVELS.every((l) => l.id === "home" || collected[l.id]?.clipping);
    const allSecrets = LEVELS.every((l) => l.id === "home" || collected[l.id]?.secret);
    const allNpcs = LEVELS.every((l) =>
      l.id === "home" || (collected[l.id]?.npcs.size ?? 0) >= l.npcs.length,
    );
    if (allSkills && allClips && allSecrets && allNpcs) {
      unlockHard();
      setUnlockToast("★ HARD MODE UNLOCKED — toggle in HUD or restart");
      window.setTimeout(() => setUnlockToast(null), 4000);
    }
  }, [collected, collectedSkills.length, totalSkills, hardUnlocked, unlockHard]);

  // (Quick mode no longer auto-closes modals — it suppresses them entirely
  // and pushes a non-blocking banner instead. See handleEvent below.)

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const handleEvent = useCallback(
    (e: LevelEvent) => {
      const isQuick = modeRef.current === "quick";
      if (e.kind === "coin") {
        setCollected((prev) => {
          const cur = prev[e.levelId];
          if (cur.coins.has(e.index)) return prev;
          const next = { ...cur, coins: new Set(cur.coins).add(e.index) };
          return { ...prev, [e.levelId]: next };
        });
        setProgress((p) => ({
          ...p,
          [e.levelId]: { ...p[e.levelId], coins: Math.min((p[e.levelId].coins ?? 0) + 1, 99) },
        }));
        setCollectedSkills((s) =>
          s.some((x) => x.skill === e.skill && x.levelId === e.levelId) ? s : [...s, { skill: e.skill, levelId: e.levelId }],
        );
        const lv = LEVELS.find((l) => l.id === e.levelId);
        setSkillToast({ skill: e.skill, accent: lv?.palette.accent ?? "#ffd24a" });
        window.setTimeout(() => setSkillToast((s) => (s?.skill === e.skill ? null : s)), 1800);
        const { newUnlocks } = addXp(1);
        if (newUnlocks.length) {
          setUnlockToast(newUnlocks[0].label);
          setTimeout(() => setUnlockToast(null), 2400);
        }
      } else if (e.kind === "npc") {
        const lv = LEVELS.find((l) => l.id === e.levelId)!;
        const npc = lv.npcs[e.index];
        setCollected((prev) => {
          const cur = prev[e.levelId];
          if (cur.npcs.has(e.index)) return prev;
          return { ...prev, [e.levelId]: { ...cur, npcs: new Set(cur.npcs).add(e.index) } };
        });
        setProgress((p) => ({
          ...p,
          [e.levelId]: { ...p[e.levelId], npcs: Math.min((p[e.levelId].npcs ?? 0) + 1, 99) },
        }));
        setCollectedQuotes((q) =>
          q.some((x) => x.quote === npc.quote) ? q : [...q, { levelId: e.levelId, name: npc.name, quote: npc.quote }],
        );
        if (isQuick) {
          pushBanner({ title: `${npc.name} · ${npc.role}`, body: npc.quote, accent: lv.palette.accent });
        } else {
          setNpcOpen({ levelId: e.levelId, index: e.index });
        }
      } else if (e.kind === "clipping") {
        const lv = LEVELS.find((l) => l.id === e.levelId)!;
        setCollected((prev) => ({ ...prev, [e.levelId]: { ...prev[e.levelId], clipping: true } }));
        setProgress((p) => ({ ...p, [e.levelId]: { ...p[e.levelId], clipping: true } }));
        setCollectedClippings((c) =>
          c.some((x) => x.title === lv.clipping.title)
            ? c
            : [...c, { levelId: e.levelId, title: lv.clipping.title, body: lv.clipping.body, source: lv.clipping.source }],
        );
        if (isQuick) {
          pushBanner({ title: `📰 ${lv.clipping.source}`, body: lv.clipping.title, accent: lv.palette.accent });
        } else {
          setClipOpen(lv);
        }
      } else if (e.kind === "secret") {
        const lv = LEVELS.find((l) => l.id === e.levelId)!;
        setCollected((prev) => ({ ...prev, [e.levelId]: { ...prev[e.levelId], secret: true } }));
        setProgress((p) => ({ ...p, [e.levelId]: { ...p[e.levelId], secret: true } }));
        if (isQuick) {
          pushBanner({ title: `★ Secret · ${lv.name}`, body: lv.secret.title, accent: lv.palette.accent });
        } else {
          setSecretOpen(lv);
        }
      } else if (e.kind === "minigame") {
        const lv = LEVELS.find((l) => l.id === e.levelId)!;
        if (isQuick) {
          // Skip minigame entirely in quick mode — silently mark as complete
          setCollected((prev) => ({ ...prev, [e.levelId]: { ...prev[e.levelId], minigame: true } }));
          setProgress((p) => ({ ...p, [e.levelId]: { ...p[e.levelId], minigame: true } }));
        } else {
          setMinigameOpen(lv);
        }
      } else if (e.kind === "clear") {
        setClearedSet((s) => {
          if (s.has(e.levelId)) return s;
          const n = new Set(s);
          n.add(e.levelId);
          return n;
        });
        setProgress((p) => ({ ...p, [e.levelId]: { ...p[e.levelId], cleared: true } }));
      } else if (e.kind === "endLink") {
        if (e.href === "#restart") {
          handleRef.current?.warpToChapter("home");
        } else {
          window.open(e.href, "_blank", "noopener");
        }
      }
    },
    [pushBanner, addXp],
  );

  // Resume view: render entirely separate page, no canvas
  if (viewMode === "resume") {
    return <ResumeView onBackToGame={() => { setViewMode("game"); if (!mode) setTitleOpen(true); }} />;
  }

  return (
    <div
      className="fixed inset-0 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#05030d] text-white"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* TOP: pixel-art chapter ribbon (sticky-style at top of game) */}
      <WorldMap
        progress={progress}
        activeLevelId={activeChapter?.levelId ?? "home"}
        onWarp={(l) => handleRef.current?.warpToChapter(l.id)}
      />

      {/* The continuous world fills the remaining viewport */}
      <div className="relative flex-1 overflow-hidden">
        <LevelView
          collected={collected}
          clearedSet={clearedSet}
          onEvent={handleEvent}
          onReady={(h) => (handleRef.current = h)}
          paused={overlayOpen || titleOpen || skillTreeOpen}
          onActiveChapter={(c) => {
            setActiveChapter(c);
            const lv = LEVELS.find((l) => l.id === c.levelId);
            if (lv && lv.metrics) setIntroLevel(lv);
          }}
          easyMode={mode === "easy" || mode === "quick"}
          quickMode={mode === "quick"}
        />

        {/* Chapter intro card (recruiter info, slides in on entry) */}
        {introLevel && (
          <ChapterIntro level={introLevel} onDismiss={() => setIntroLevel(null)} />
        )}

        <ChapterFlash chapter={activeChapter} />

        {/* Top-right contact pill — always visible for recruiters.
            On mobile, Resume + Contact stack tightly; on desktop side-by-side. */}
        <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
          <ContactPill onOpen={() => setContactOpen(true)} />
          <button
            onClick={() => setViewMode("resume")}
            className="pointer-events-auto rounded-full border border-amber-300/40 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-amber-200 shadow-lg backdrop-blur hover:bg-amber-300/10 sm:px-3 sm:text-[10px]"
          >
            📄 Resume
          </button>
        </div>

        {/* SoleSearch press wall trigger — only visible on the SoleSearch chapter */}
        {activeChapter?.levelId === "sole" && (
          <button
            onClick={() => setPressOpen(true)}
            className="pointer-events-auto absolute left-2 top-2 z-10 rounded-md border-2 border-[#ff006e] bg-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#ff9fd4] shadow-lg backdrop-blur hover:bg-[#ff006e]/15 sm:left-4 sm:top-4 sm:text-[11px] animate-pulse"
            style={{ animationDuration: "2.4s" }}
          >
            📰 Press Wall [P]
          </button>
        )}

        {/* HUD overlay: bottom bar. On mobile, pad bottom so touch controls
            (Jump button is ~72px tall + 12px inset) don't overlap. */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 z-10 flex flex-col gap-2 p-2 pb-[100px] sm:p-4 sm:pb-4">
          <div className="pointer-events-auto max-w-[calc(100vw-1rem)] self-start rounded-md border border-white/15 bg-black/65 backdrop-blur-sm sm:max-w-none">
            <Hud
              chapter={activeChapter}
              coins={collectedSkills.length}
              totalSkills={totalSkills}
              muted={muted}
              onMute={() => setMuted((m) => !m)}
              onInventory={() => setInvOpen(true)}
              mode={mode}
              hardUnlocked={hardUnlocked}
              onToggleMode={() => {
                const next: PortfolioMode = hardUnlocked
                  ? (mode === "easy" ? "quick" : mode === "quick" ? "hard" : "easy")
                  : (mode === "easy" ? "quick" : "easy");
                setMode(next);
              }}
              onSkipChapter={() => handleRef.current?.warpToNextChapter()}
              onCliffNotes={() => setCliffOpen(true)}
              xp={xp}
              nextUnlockXp={nextUnlock?.xp ?? null}
              nextUnlockLabel={nextUnlock?.label ?? null}
            />
          </div>
          <div className="pointer-events-auto hidden self-start sm:block">
            <button
              onClick={() => setSkillTreeOpen(true)}
              className="rounded-md border border-white/20 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur-sm hover:bg-white/10"
            >
              ⚛ Skills [K]
            </button>
          </div>
          <ControlsHint mode={mode} />
        </div>
      </div>

      {titleOpen && (
        <TitleScreen
          hardUnlocked={hardUnlocked}
          onPick={(m) => {
            // Close title FIRST so the canvas un-pauses immediately on tap.
            setTitleOpen(false);
            setMode(m);
          }}
          onResume={() => {
            setTitleOpen(false);
            setViewMode("resume");
          }}
        />
      )}
      {contactOpen && <ContactSheet onClose={() => setContactOpen(false)} />}
      {unlockToast && <UnlockToast label={unlockToast} />}
      {skillToast && (
        <div
          className="pointer-events-none fixed left-1/2 top-32 z-[60] -translate-x-1/2 rounded-lg border-2 bg-black/85 px-4 py-2 text-center font-mono text-[12px] uppercase tracking-widest shadow-2xl backdrop-blur"
          style={{ borderColor: skillToast.accent, color: skillToast.accent }}
        >
          {getSkillIcon(skillToast.skill)} +Skill · <span className="text-white">{skillToast.skill}</span>
        </div>
      )}
      {skillTreeOpen && (
        <SkillTree collectedSkills={collectedSkills} onClose={() => setSkillTreeOpen(false)} />
      )}
      <QuickBanner banners={banners} onExpire={(id) => setBanners((bs) => bs.filter((b) => b.id !== id))} />

      {/* Overlays */}
      {npcOpen && (() => {
        const lv = LEVELS.find((l) => l.id === npcOpen.levelId)!;
        return (
          <DialogBox
            npc={lv.npcs[npcOpen.index]}
            accent={lv.palette.accent}
            onClose={() => setNpcOpen(null)}
          />
        );
      })()}
      {clipOpen && (
        <ClippingCard clip={clipOpen.clipping} accent={clipOpen.palette.accent} onClose={() => setClipOpen(null)} />
      )}
      {secretOpen && (
        <SecretCard secret={secretOpen.secret} accent={secretOpen.palette.accent} onClose={() => setSecretOpen(null)} />
      )}
      {minigameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md">
            <Minigame
              id={minigameOpen.minigame.id}
              accent={minigameOpen.palette.accent}
              onDone={(r) => {
                const lv = minigameOpen;
                setMinigameOpen(null);
                if (r.win) {
                  sfx.win();
                  setCollected((prev) => ({ ...prev, [lv.id]: { ...prev[lv.id], minigame: true } }));
                  setProgress((p) => ({ ...p, [lv.id]: { ...p[lv.id], minigame: true } }));
                }
              }}
            />
            <button
              onClick={() => setMinigameOpen(null)}
              className="mt-2 w-full rounded border border-white/30 py-2 font-mono text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10"
            >
              ✕ Skip
            </button>
          </div>
        </div>
      )}

      {invOpen && (
        <Inventory
          collectedSkills={collectedSkills}
          collectedClippings={collectedClippings}
          collectedQuotes={collectedQuotes}
          progress={progress}
          onClose={() => setInvOpen(false)}
          onJump={(l) => {
            setInvOpen(false);
            handleRef.current?.warpToChapter(l.id);
          }}
        />
      )}

      {cliffOpen && (
        <CliffNotes
          onClose={() => setCliffOpen(false)}
          onJump={(l) => handleRef.current?.warpToChapter(l.id)}
        />
      )}

      <PressWall open={pressOpen} onClose={() => setPressOpen(false)} />

      <TouchControls
        onLeft={(d) => handleRef.current?.pressLeft(d)}
        onRight={(d) => handleRef.current?.pressRight(d)}
        onJump={(d) => handleRef.current?.pressJump(d)}
        onInteract={() => handleRef.current?.pressInteract()}
      />
    </div>
  );
}

function ControlsHint({ mode }: { mode: PortfolioMode | null }) {
  if (mode === "quick") {
    return (
      <div className="pointer-events-none hidden flex-wrap items-center gap-2 self-start rounded-md bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white/55 backdrop-blur-sm sm:flex sm:gap-3 sm:text-[10px]">
        <span>auto-tour · ~3 min</span>
        <span>tap to advance</span>
        <span>k skills</span>
      </div>
    );
  }
  if (mode === "easy") {
    return (
      <div className="pointer-events-none hidden flex-wrap items-center gap-2 self-start rounded-md bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white/55 backdrop-blur-sm sm:flex sm:gap-3 sm:text-[10px]">
        <span>← → walk</span>
        <span>space jump</span>
        <span>npcs auto-talk</span>
        <span>tab bag</span>
        <span>k skills</span>
        <span>? cliff notes</span>
      </div>
    );
  }
  return (
    <div className="pointer-events-none hidden flex-wrap items-center gap-2 self-start rounded-md bg-black/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-white/55 backdrop-blur-sm sm:flex sm:gap-3 sm:text-[10px]">
      <span>← →</span>
      <span>shift run</span>
      <span>space hold = jump</span>
      <span>space x2 = double</span>
      <span>e talk</span>
      <span>tab bag</span>
      <span>k skills</span>
      <span>? cliff notes</span>
    </div>
  );
}
