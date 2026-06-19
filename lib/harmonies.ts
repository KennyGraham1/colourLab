/**
 * Colour harmonies and variations (tints / shades / tones) for the wheel
 * and theory sections. Everything is hue-based off a single base hex.
 */
import { clamp, hexToHsl, hslToHex, rotateHue, type HSL } from "./color";

export type HarmonyKind =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "monochromatic";

export interface Harmony {
  kind: HarmonyKind;
  label: string;
  description: string;
  colors: string[];
}

const fromHsl = (hsl: HSL): string => hslToHex(hsl);

export function complementary(hex: string): string[] {
  return [hex, rotateHue(hex, 180)];
}

export function analogous(hex: string, angle = 30): string[] {
  return [rotateHue(hex, -angle), hex, rotateHue(hex, angle)];
}

export function triadic(hex: string): string[] {
  return [hex, rotateHue(hex, 120), rotateHue(hex, 240)];
}

export function tetradic(hex: string): string[] {
  return [hex, rotateHue(hex, 90), rotateHue(hex, 180), rotateHue(hex, 270)];
}

export function splitComplementary(hex: string): string[] {
  return [hex, rotateHue(hex, 150), rotateHue(hex, 210)];
}

/** Lightness ramp at constant hue/saturation. */
export function monochromatic(hex: string, count = 5): string[] {
  const { h, s } = hexToHsl(hex);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    // Spread lightness across a pleasant range 22%–88%.
    const l = 22 + (i / Math.max(1, count - 1)) * 66;
    out.push(fromHsl({ h, s, l }));
  }
  return out;
}

/** Tints: mix toward white (raise lightness). */
export function tints(hex: string, count = 5): string[] {
  const { h, s, l } = hexToHsl(hex);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    out.push(fromHsl({ h, s, l: clamp(l + (100 - l) * t, 0, 100) }));
  }
  return out;
}

/** Shades: mix toward black (lower lightness). */
export function shades(hex: string, count = 5): string[] {
  const { h, s, l } = hexToHsl(hex);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    out.push(fromHsl({ h, s, l: clamp(l - l * t, 0, 100) }));
  }
  return out;
}

/** Tones: mix toward grey (lower saturation). */
export function tones(hex: string, count = 5): string[] {
  const { h, s, l } = hexToHsl(hex);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    out.push(fromHsl({ h, s: clamp(s - s * t, 0, 100), l }));
  }
  return out;
}

export function getHarmony(kind: HarmonyKind, hex: string): Harmony {
  switch (kind) {
    case "complementary":
      return {
        kind,
        label: "Complementary",
        description: "Two hues opposite each other on the wheel — high contrast.",
        colors: complementary(hex),
      };
    case "analogous":
      return {
        kind,
        label: "Analogous",
        description: "Neighbours on the wheel — calm and cohesive.",
        colors: analogous(hex),
      };
    case "triadic":
      return {
        kind,
        label: "Triadic",
        description: "Three hues evenly spaced — vibrant yet balanced.",
        colors: triadic(hex),
      };
    case "tetradic":
      return {
        kind,
        label: "Tetradic",
        description: "Two complementary pairs — rich and varied.",
        colors: tetradic(hex),
      };
    case "split-complementary":
      return {
        kind,
        label: "Split Complementary",
        description: "A hue plus the two neighbours of its complement.",
        colors: splitComplementary(hex),
      };
    case "monochromatic":
      return {
        kind,
        label: "Monochromatic",
        description: "One hue across a range of lightness — elegant and simple.",
        colors: monochromatic(hex),
      };
  }
}

export const HARMONY_KINDS: HarmonyKind[] = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "tetradic",
  "monochromatic",
];
