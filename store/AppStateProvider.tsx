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
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage, uid } from "@/hooks/useLocalStorage";
import { PASS_THRESHOLD } from "@/lib/challenges";
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

  // Toasts
  toasts: Toast[];
  toast: (message: string, hex?: string) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

const EMPTY_PROGRESS: ChallengeProgress = {
  best: {},
  completed: [],
  attempts: 0,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [palettes, setPalettes, { hydrated: pHydrated }] = useLocalStorage<
    Palette[]
  >("colourlab.palettes.v1", [STARTER_PALETTE]);
  const [progress, setProgress, { hydrated: cHydrated }] =
    useLocalStorage<ChallengeProgress>("colourlab.progress.v1", EMPTY_PROGRESS);

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
      setProgress((prev) => {
        const best = Math.max(prev.best[challengeId] ?? 0, score);
        const completed =
          score >= PASS_THRESHOLD && !prev.completed.includes(challengeId)
            ? [...prev.completed, challengeId]
            : prev.completed;
        return {
          best: { ...prev.best, [challengeId]: best },
          completed,
          attempts: prev.attempts + 1,
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
