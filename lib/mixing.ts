/**
 * Colour mixing models for Colour Lab.
 *
 * Two physically-motivated models the app teaches:
 *
 *  - ADDITIVE (light / screens): channels add together. Full red + green + blue
 *    light => white. This is how displays work.
 *
 *  - SUBTRACTIVE (paint / ink): pigments absorb light, so mixing multiplies
 *    transmission. Modelled as a weighted geometric mean per channel, which
 *    yields the classic results: cyan + yellow => green, and mixing many hues
 *    drifts toward dark / muddy. This is how paint and printing work.
 */
import { clamp, hexToRgb, rgbToHex, type RGB } from "./color";

export type MixMode = "additive" | "subtractive";

export interface MixInput {
  hex: string;
  /** Relative strength / amount of this colour, 0–1 (sliders feed this). */
  weight: number;
}

const EPS = 1e-6;

/**
 * Additive mix: treat each colour as light scaled by its weight and sum the
 * channels. With three full-strength primaries this reaches white.
 */
function mixAdditive(inputs: MixInput[]): RGB {
  const acc = inputs.reduce(
    (sum, { hex, weight }) => {
      const rgb = hexToRgb(hex);
      const w = clamp(weight, 0, 1);
      return {
        r: sum.r + rgb.r * w,
        g: sum.g + rgb.g * w,
        b: sum.b + rgb.b * w,
      };
    },
    { r: 0, g: 0, b: 0 }
  );
  return { r: clamp(acc.r), g: clamp(acc.g), b: clamp(acc.b) };
}

/**
 * Subtractive mix: weighted geometric mean per channel (a multiply model).
 * Weights are normalised so this behaves like "how much of each paint".
 */
function mixSubtractive(inputs: MixInput[]): RGB {
  const active = inputs.filter((i) => i.weight > EPS);
  if (active.length === 0) return { r: 255, g: 255, b: 255 };

  const totalWeight = active.reduce((s, i) => s + clamp(i.weight, 0, 1), 0);
  if (totalWeight <= EPS) return { r: 255, g: 255, b: 255 };

  const logSum = { r: 0, g: 0, b: 0 };
  for (const { hex, weight } of active) {
    const rgb = hexToRgb(hex);
    const w = clamp(weight, 0, 1) / totalWeight;
    // Guard against log(0); a perfectly black pigment still absorbs fully.
    logSum.r += w * Math.log(Math.max(rgb.r, 1) / 255);
    logSum.g += w * Math.log(Math.max(rgb.g, 1) / 255);
    logSum.b += w * Math.log(Math.max(rgb.b, 1) / 255);
  }

  return {
    r: clamp(255 * Math.exp(logSum.r)),
    g: clamp(255 * Math.exp(logSum.g)),
    b: clamp(255 * Math.exp(logSum.b)),
  };
}

export function mixColors(inputs: MixInput[], mode: MixMode): RGB {
  if (inputs.length === 0) return { r: 0, g: 0, b: 0 };
  return mode === "additive" ? mixAdditive(inputs) : mixSubtractive(inputs);
}

export function mixHex(inputs: MixInput[], mode: MixMode): string {
  return rgbToHex(mixColors(inputs, mode));
}

/**
 * Linear two-colour blend at ratio t (0 = a, 1 = b). Useful for previews and
 * "halfway" demonstrations independent of the additive/subtractive models.
 */
export function blendHex(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const k = clamp(t, 0, 1);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * k,
    g: ca.g + (cb.g - ca.g) * k,
    b: ca.b + (cb.b - ca.b) * k,
  });
}

/** The canonical primaries for each model — used by the mixer presets. */
export const ADDITIVE_PRIMARIES = [
  { name: "Red", hex: "#FF0000" },
  { name: "Green", hex: "#00FF00" },
  { name: "Blue", hex: "#0000FF" },
] as const;

export const SUBTRACTIVE_PRIMARIES = [
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Yellow", hex: "#FFFF00" },
] as const;
