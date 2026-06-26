"use client";

/**
 * App-wide client state shared across sections: saved palettes and challenge
 * progress, both persisted to localStorage. Also exposes a tiny toast channel
 * so any component can confirm an action (e.g. "Copied #FF0000").
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage, uid } from "@/hooks/useLocalStorage";
import {
  PASS_THRESHOLD,
  pointsForAttempt,
  starsForScore,
} from "@/lib/challenges";
import { hexToHsl, hexToRgb, hslToHex, normalizeHex } from "@/lib/color";
import type {
  ChallengeProgress,
  Palette,
  PaletteColor,
} from "@/types";

const STARTER_PALETTE: Palette = {
  id: "starter",
  name: "Sunset Study",
  colors: [
    { id: "s1", hex: "#FF6B6B", name: "Coral" },
    { id: "s2", hex: "#FFD93D", name: "Sun" },
    { id: "s3", hex: "#6BCB77", name: "Leaf" },
    { id: "s4", hex: "#4D96FF", name: "Sky" },
  ],
  createdAt: 0,
  updatedAt: 0,
};

interface Toast {
  id: string;
  message: string;
  hex?: string;
}

interface AppState {
  hydrated: boolean;

  // Palettes
  palettes: Palette[];
  createPalette: (name?: string) => string;
  deletePalette: (id: string) => void;
  renamePalette: (id: string, name: string) => void;
  clearPalette: (id: string) => void;
  addColorToPalette: (paletteId: string, hex: string, name?: string) => void;
  removeColorFromPalette: (paletteId: string, colorId: string) => void;
  /** Convenience: add to the most-recent palette, creating one if needed. */
  quickSaveColor: (hex: string, name?: string) => string;

  // Challenge progress
  progress: ChallengeProgress;
  recordAttempt: (challengeId: string, score: number) => void;
  resetProgress: () => void;

  // Theme
  /** The accent/brand colour the whole app is themed with. */
  themeHex: string;
  setThemeColor: (hex: string) => void;
  resetTheme: () => void;

  // Toasts
  toasts: Toast[];
  toast: (message: string, hex?: string) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

/** The app's default brand colour (matches globals.css). */
const DEFAULT_THEME = "#6366F1";

/**
 * Recolour the whole app by driving the CSS variables the design system reads.
 * --brand drives buttons/links/focus, --accent the gradient partner, and
 * --brand-soft the light backgrounds.
 */
function applyTheme(hex: string): void {
  if (typeof document === "undefined") return;
  const norm = normalizeHex(hex) ?? DEFAULT_THEME;
  const toVar = (h: string) => {
    const { r, g, b } = hexToRgb(h);
    return `${r} ${g} ${b}`;
  };
  const hsl = hexToHsl(norm);
  // A hue-shifted sibling makes the brand→accent gradients look intentional.
  const accent = hslToHex({ h: (hsl.h + 32) % 360, s: hsl.s, l: hsl.l });
  // A very light tint for soft backgrounds (bg-brand-soft).
  const soft = hslToHex({ h: hsl.h, s: Math.min(85, Math.max(35, hsl.s)), l: 92 });

  const root = document.documentElement;
  root.style.setProperty("--brand", toVar(norm));
  root.style.setProperty("--accent", toVar(accent));
  root.style.setProperty("--brand-soft", toVar(soft));
}

const EMPTY_PROGRESS: ChallengeProgress = {
  best: {},
  completed: [],
  attempts: 0,
  points: 0,
  streak: 0,
  bestStreak: 0,
  stars: {},
};

/** Fill in any fields missing from older stored progress. */
function normalizeProgress(p: ChallengeProgress | undefined): ChallengeProgress {
  return {
    best: p?.best ?? {},
    completed: p?.completed ?? [],
    attempts: p?.attempts ?? 0,
    points: p?.points ?? 0,
    streak: p?.streak ?? 0,
    bestStreak: p?.bestStreak ?? 0,
    stars: p?.stars ?? {},
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [palettes, setPalettes, { hydrated: pHydrated }] = useLocalStorage<
    Palette[]
  >("colourlab.palettes.v1", [STARTER_PALETTE]);
  const [progressRaw, setProgress, { hydrated: cHydrated }] =
    useLocalStorage<ChallengeProgress>("colourlab.progress.v1", EMPTY_PROGRESS);
  // Always expose a complete progress object even if older data is missing keys.
  const progress = useMemo(() => normalizeProgress(progressRaw), [progressRaw]);

  const [themeHex, setThemeHex] = useLocalStorage<string>(
    "colourlab.theme.v1",
    DEFAULT_THEME
  );

  // Apply the theme to the document whenever it changes (client only).
  useEffect(() => {
    applyTheme(themeHex);
  }, [themeHex]);

  const setThemeColor = useCallback(
    (hex: string) => setThemeHex(normalizeHex(hex) ?? DEFAULT_THEME),
    [setThemeHex]
  );
  const resetTheme = useCallback(
    () => setThemeHex(DEFAULT_THEME),
    [setThemeHex]
  );

  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, hex?: string) => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, message, hex }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const touch = (p: Palette): Palette => ({ ...p, updatedAt: Date.now() });

  const createPalette = useCallback(
    (name = "Untitled palette") => {
      const id = uid("pal");
      const now = Date.now();
      const palette: Palette = {
        id,
        name,
        colors: [],
        createdAt: now,
        updatedAt: now,
      };
      setPalettes((prev) => [palette, ...prev]);
      return id;
    },
    [setPalettes]
  );

  const deletePalette = useCallback(
    (id: string) => setPalettes((prev) => prev.filter((p) => p.id !== id)),
    [setPalettes]
  );

  const renamePalette = useCallback(
    (id: string, name: string) =>
      setPalettes((prev) =>
        prev.map((p) => (p.id === id ? touch({ ...p, name }) : p))
      ),
    [setPalettes]
  );

  const clearPalette = useCallback(
    (id: string) =>
      setPalettes((prev) =>
        prev.map((p) => (p.id === id ? touch({ ...p, colors: [] }) : p))
      ),
    [setPalettes]
  );

  const addColorToPalette = useCallback(
    (paletteId: string, hex: string, name?: string) => {
      const color: PaletteColor = { id: uid("col"), hex, name };
      setPalettes((prev) =>
        prev.map((p) =>
          p.id === paletteId
            ? touch({ ...p, colors: [...p.colors, color] })
            : p
        )
      );
    },
    [setPalettes]
  );

  const removeColorFromPalette = useCallback(
    (paletteId: string, colorId: string) =>
      setPalettes((prev) =>
        prev.map((p) =>
          p.id === paletteId
            ? touch({ ...p, colors: p.colors.filter((c) => c.id !== colorId) })
            : p
        )
      ),
    [setPalettes]
  );

  const quickSaveColor = useCallback(
    (hex: string, name?: string) => {
      let targetId = "";
      setPalettes((prev) => {
        const list = [...prev];
        let target = list[0];
        if (!target) {
          const now = Date.now();
          target = {
            id: uid("pal"),
            name: "My palette",
            colors: [],
            createdAt: now,
            updatedAt: now,
          };
          list.unshift(target);
        }
        targetId = target.id;
        return list.map((p) =>
          p.id === target!.id
            ? touch({
                ...p,
                colors: [...p.colors, { id: uid("col"), hex, name }],
              })
            : p
        );
      });
      return targetId;
    },
    [setPalettes]
  );

  const recordAttempt = useCallback(
    (challengeId: string, score: number) => {
      setProgress((prevRaw) => {
        const prev = normalizeProgress(prevRaw);
        const passed = score >= PASS_THRESHOLD;
        const best = Math.max(prev.best[challengeId] ?? 0, score);
        const completed =
          passed && !prev.completed.includes(challengeId)
            ? [...prev.completed, challengeId]
            : prev.completed;
        const streak = passed ? prev.streak + 1 : 0;
        const bestStreak = Math.max(prev.bestStreak, streak);
        const star = starsForScore(score);
        const stars = {
          ...prev.stars,
          [challengeId]: Math.max(prev.stars[challengeId] ?? 0, star),
        };
        const points = prev.points + pointsForAttempt(score, streak);
        return {
          best: { ...prev.best, [challengeId]: best },
          completed,
          attempts: prev.attempts + 1,
          points,
          streak,
          bestStreak,
          stars,
        };
      });
    },
    [setProgress]
  );

  const resetProgress = useCallback(
    () => setProgress(EMPTY_PROGRESS),
    [setProgress]
  );

  const value = useMemo<AppState>(
    () => ({
      hydrated: pHydrated && cHydrated,
      palettes,
      createPalette,
      deletePalette,
      renamePalette,
      clearPalette,
      addColorToPalette,
      removeColorFromPalette,
      quickSaveColor,
      progress,
      recordAttempt,
      resetProgress,
      themeHex,
      setThemeColor,
      resetTheme,
      toasts,
      toast,
      dismissToast,
    }),
    [
      pHydrated,
      cHydrated,
      palettes,
      createPalette,
      deletePalette,
      renamePalette,
      clearPalette,
      addColorToPalette,
      removeColorFromPalette,
      quickSaveColor,
      progress,
      recordAttempt,
      resetProgress,
      themeHex,
      setThemeColor,
      resetTheme,
      toasts,
      toast,
      dismissToast,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useAppState must be used within an AppStateProvider");
  return ctx;
}
