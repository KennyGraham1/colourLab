/**
 * Challenge definitions, scoring and constructive feedback.
 *
 * Challenges are deterministic given a seed so the "daily challenge" is stable
 * and progress can be keyed by id. Feedback is directional (which way to nudge)
 * rather than a bare right/wrong.
 */
import {
  hexToHsl,
  hslToHex,
  matchScore,
  rotateHue,
  temperature,
  type HSL,
} from "./color";
import type { Challenge, ChallengeType } from "@/types";

export const PASS_THRESHOLD = 80;

/* --------------------------- stars, points, ranks --------------------- */

/** Star rating (0–3) for a score: 1★ pass, 2★ great, 3★ near-perfect. */
export function starsForScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 97) return 3;
  if (score >= 90) return 2;
  if (score >= PASS_THRESHOLD) return 1;
  return 0;
}

/** Points awarded for a single check (streakAfter = streak *after* this pass). */
export function pointsForAttempt(score: number, streakAfter: number): number {
  const passed = score >= PASS_THRESHOLD;
  if (!passed) return Math.floor(score / 5); // small consolation for trying
  const streakBonus = Math.max(0, streakAfter - 1) * 10;
  const starBonus = starsForScore(score) * 15;
  return score + streakBonus + starBonus;
}

export interface Rank {
  name: string;
  min: number;
  emoji: string;
}

/** Progression ranks unlocked by total points. */
export const RANKS: Rank[] = [
  { name: "Colour Novice", min: 0, emoji: "🌱" },
  { name: "Colour Apprentice", min: 300, emoji: "🎨" },
  { name: "Colour Artisan", min: 800, emoji: "✨" },
  { name: "Colour Stylist", min: 1600, emoji: "🌈" },
  { name: "Colour Maestro", min: 2800, emoji: "🏅" },
  { name: "Colour Master", min: 4500, emoji: "👑" },
];

export interface RankInfo {
  current: Rank;
  next: Rank | null;
  /** 0–1 progress toward the next rank (1 when maxed). */
  progress: number;
  pointsToNext: number;
}

export function rankForPoints(points: number): RankInfo {
  let current = RANKS[0];
  let next: Rank | null = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  const progress = next
    ? Math.min(1, (points - current.min) / (next.min - current.min))
    : 1;
  const pointsToNext = next ? Math.max(0, next.min - points) : 0;
  return { current, next, progress, pointsToNext };
}

/* ----------------------------- seeded RNG ----------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* --------------------------- target helpers --------------------------- */

const adjust = (hsl: HSL): string => hslToHex(hsl);

function buildTarget(type: ChallengeType, baseHex: string): string {
  const hsl = hexToHsl(baseHex);
  switch (type) {
    case "match":
      return baseHex;
    case "warmer":
      // Nudge hue toward warm (red/orange) and add a little saturation.
      return adjust({
        h: (hsl.h > 180 ? hsl.h + 25 : hsl.h - 25 + 360) % 360,
        s: Math.min(100, hsl.s + 10),
        l: hsl.l,
      });
    case "cooler":
      return adjust({
        h: (hsl.h < 180 ? hsl.h + 25 : hsl.h - 25 + 360) % 360,
        s: Math.min(100, hsl.s + 5),
        l: hsl.l,
      });
    case "complementary":
      return rotateHue(baseHex, 180);
    case "tint":
      return adjust({ ...hsl, l: Math.min(100, hsl.l + 28) });
    case "shade":
      return adjust({ ...hsl, l: Math.max(0, hsl.l - 28) });
  }
}

const TYPE_META: Record<
  ChallengeType,
  { title: string; prompt: (base: string) => string }
> = {
  match: {
    title: "Mix the target",
    prompt: () => "Recreate the target colour as closely as you can.",
  },
  warmer: {
    title: "Make it warmer",
    prompt: () => "Shift the base colour toward a warmer feeling.",
  },
  cooler: {
    title: "Make it cooler",
    prompt: () => "Shift the base colour toward a cooler feeling.",
  },
  complementary: {
    title: "Find the complement",
    prompt: () => "Dial in the colour directly opposite on the wheel.",
  },
  tint: {
    title: "Lighten with a tint",
    prompt: () => "Add white to create a softer, lighter tint.",
  },
  shade: {
    title: "Deepen with a shade",
    prompt: () => "Add black to create a richer, darker shade.",
  },
};

const DIFFICULTY_ORDER = ["easy", "medium", "hard"] as const;

/* --------------------------- generators ------------------------------- */

export function generateChallenge(seedKey: string, type: ChallengeType): Challenge {
  const rand = mulberry32(seedFromString(`${seedKey}:${type}`));
  const h = Math.floor(rand() * 360);
  const s = 45 + Math.floor(rand() * 45);
  const l = 40 + Math.floor(rand() * 25);
  const baseHex = hslToHex({ h, s, l });
  const targetHex = buildTarget(type, baseHex);
  const difficulty =
    DIFFICULTY_ORDER[Math.min(2, Math.floor(rand() * 3))] ?? "easy";
  const meta = TYPE_META[type];
  return {
    id: `${seedKey}:${type}`,
    type,
    title: meta.title,
    prompt: meta.prompt(baseHex),
    baseHex,
    targetHex,
    difficulty,
  };
}

const PRACTICE_TYPES: ChallengeType[] = [
  "match",
  "warmer",
  "cooler",
  "complementary",
  "tint",
  "shade",
];

/** A stable set of practice challenges for the Challenges section. */
export function practiceChallenges(seedKey = "practice"): Challenge[] {
  return PRACTICE_TYPES.map((type, i) =>
    generateChallenge(`${seedKey}-${i + 1}`, type)
  );
}

/**
 * A single fresh, varied challenge for endless play. The type is derived from
 * the seed, so a unique seed yields a unique challenge with a unique id.
 */
export function makeChallenge(seedKey: string): Challenge {
  const rand = mulberry32(seedFromString(`make:${seedKey}`));
  const type =
    PRACTICE_TYPES[Math.floor(rand() * PRACTICE_TYPES.length)] ?? "match";
  return generateChallenge(seedKey, type);
}

/** Daily challenge derived from a yyyy-mm-dd date string (stable per day). */
export function dailyChallenge(dateKey: string): Challenge {
  const rand = mulberry32(seedFromString(dateKey));
  const type = PRACTICE_TYPES[Math.floor(rand() * PRACTICE_TYPES.length)] ?? "match";
  return generateChallenge(`daily-${dateKey}`, type);
}

/* --------------------------- scoring + feedback ----------------------- */

export interface Feedback {
  score: number;
  passed: boolean;
  headline: string;
  tips: string[];
}

const dir = (delta: number, more: string, less: string, eps = 6): string | null => {
  if (delta > eps) return more;
  if (delta < -eps) return less;
  return null;
};

export function evaluateGuess(challenge: Challenge, guessHex: string): Feedback {
  const score = matchScore(guessHex, challenge.targetHex);
  const passed = score >= PASS_THRESHOLD;

  const g = hexToHsl(guessHex);
  const t = hexToHsl(challenge.targetHex);
  const tips: string[] = [];

  // Hue guidance. The challenge uses a linear hue slider (0–360°), so advise
  // raising or lowering the hue value rather than "rotating" a wheel. dh is the
  // shortest signed distance, so its sign points the way toward the target.
  const dh = ((t.h - g.h + 540) % 360) - 180;
  const hueTip = dir(
    dh,
    "Increase the hue a little — slide it higher.",
    "Decrease the hue a little — slide it lower.",
    10
  );
  if (hueTip) tips.push(hueTip);

  const satTip = dir(
    t.s - g.s,
    "Increase the saturation — it needs more punch.",
    "Reduce the saturation — it's a touch too vivid."
  );
  if (satTip) tips.push(satTip);

  const lightTip = dir(
    t.l - g.l,
    "Lighten it slightly.",
    "Darken it slightly."
  );
  if (lightTip) tips.push(lightTip);

  let headline: string;
  if (passed) {
    headline =
      score >= 95
        ? "Spot on — that's a brilliant match!"
        : "Nicely done — that's a strong match.";
  } else if (score >= 60) {
    headline = "Close! A small nudge will get you there.";
  } else if (score >= 35) {
    headline = "Good attempt — you're heading the right way.";
  } else {
    headline = "Not quite yet — let's adjust the colour.";
  }

  // Reflect the challenge intent in feedback even on a pass.
  if (passed && tips.length === 0) {
    tips.push(
      temperature(guessHex) === temperature(challenge.targetHex)
        ? "The temperature matches the goal too."
        : "Great match on the colour values."
    );
  }

  return { score, passed, headline, tips: tips.slice(0, 3) };
}
