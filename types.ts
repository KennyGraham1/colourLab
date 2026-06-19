/** Shared domain types for Colour Lab. */

export interface PaletteColor {
  id: string;
  hex: string;
  /** Optional human label, e.g. "Sky" or a source note like "Mixer". */
  name?: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColor[];
  createdAt: number;
  updatedAt: number;
}

export type SectionId =
  | "home"
  | "mixer"
  | "theory"
  | "wheel"
  | "variants"
  | "challenges"
  | "palettes";

/** Every section receives a navigation callback to jump between sections. */
export interface SectionProps {
  onNavigate: (id: SectionId) => void;
}

export type ChallengeType =
  | "match"
  | "warmer"
  | "cooler"
  | "complementary"
  | "tint"
  | "shade";

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  /** Starting colour the user manipulates or references. */
  baseHex: string;
  /** The colour they are trying to reach (computed for generated challenges). */
  targetHex: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface ChallengeAttempt {
  challengeId: string;
  guessHex: string;
  score: number;
  passed: boolean;
  at: number;
}

export interface ChallengeProgress {
  /** Best score (0–100) achieved per challenge id. */
  best: Record<string, number>;
  /** Total challenges passed (score >= pass threshold). */
  completed: string[];
  attempts: number;
}
