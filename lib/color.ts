/**
 * Core colour model + conversions for Colour Lab.
 *
 * Conventions:
 *  - RGB channels are 0–255 (integers when displayed, may be fractional mid-calc).
 *  - HSL: h in 0–360, s/l in 0–100.
 *  - Hex strings are always returned uppercase with a leading "#", e.g. "#1A2B3C".
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type Temperature = "warm" | "cool" | "neutral";

export const clamp = (n: number, min = 0, max = 255): number =>
  Math.min(max, Math.max(min, n));

export const round = (n: number, dp = 0): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/* ------------------------------------------------------------------ */
/* Hex <-> RGB                                                         */
/* ------------------------------------------------------------------ */

/** Normalise loose hex input ("#abc", "abc", "aabbcc") -> "#AABBCC" or null. */
export function normalizeHex(input: string): string | null {
  if (!input) return null;
  let hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

export function isValidHex(input: string): boolean {
  return normalizeHex(input) !== null;
}

export function hexToRgb(hex: string): RGB {
  const norm = normalizeHex(hex) ?? "#000000";
  const int = parseInt(norm.slice(1), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) =>
    clamp(Math.round(n)).toString(16).padStart(2, "0");
  return `#${(toHex(r) + toHex(g) + toHex(b)).toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/* RGB <-> HSL                                                         */
/* ------------------------------------------------------------------ */

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h: round(h, 1), s: round(s * 100, 1), l: round(l * 100, 1) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hh = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export const hexToHsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: HSL): string => rgbToHex(hslToRgb(hsl));

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const formatRgb = ({ r, g, b }: RGB): string =>
  `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

export const formatHsl = ({ h, s, l }: HSL): string =>
  `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;

/** All three representations of a single colour, ready for display/copy. */
export interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  rgbObj: RGB;
  hslObj: HSL;
}

export function describeColor(hex: string): ColorValues {
  const safe = normalizeHex(hex) ?? "#000000";
  const rgbObj = hexToRgb(safe);
  const hslObj = rgbToHsl(rgbObj);
  return {
    hex: safe,
    rgb: formatRgb(rgbObj),
    hsl: formatHsl(hslObj),
    rgbObj,
    hslObj,
  };
}

/* ------------------------------------------------------------------ */
/* Luminance, contrast & accessibility                                */
/* ------------------------------------------------------------------ */

/** WCAG relative luminance (0–1). */
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return round((light + 0.05) / (dark + 0.05), 2);
}

export interface ContrastResult {
  ratio: number;
  aa: boolean; // normal text
  aaLarge: boolean; // large text / UI
  aaa: boolean;
  label: string;
}

export function rateContrast(a: RGB, b: RGB): ContrastResult {
  const ratio = contrastRatio(a, b);
  return {
    ratio,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    label:
      ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail",
  };
}

/** Pick black or white text that reads best on the given background. */
export function readableTextColor(hex: string): "#000000" | "#FFFFFF" {
  const rgb = hexToRgb(hex);
  const onWhite = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const onBlack = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
  return onWhite >= onBlack ? "#FFFFFF" : "#000000";
}

export function isLight(hex: string): boolean {
  return relativeLuminance(hexToRgb(hex)) > 0.5;
}

/* ------------------------------------------------------------------ */
/* Temperature (warm / cool / neutral)                                */
/* ------------------------------------------------------------------ */

export function temperature(hex: string): Temperature {
  const { h, s } = hexToHsl(hex);
  if (s < 8) return "neutral";
  // Warm: reds, oranges, yellows, magentas. Cool: greens, cyans, blues, violets.
  if (h <= 70 || h >= 300) return "warm";
  if (h >= 130 && h <= 270) return "cool";
  return "neutral"; // transitional yellow-greens / blue-violets
}

export const temperatureLabel: Record<Temperature, string> = {
  warm: "Warm",
  cool: "Cool",
  neutral: "Neutral",
};

/* ------------------------------------------------------------------ */
/* Adjustments (used by tints/shades/tones + challenges)              */
/* ------------------------------------------------------------------ */

export function withLightness(hex: string, l: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: clamp(l, 0, 100) });
}

export function withSaturation(hex: string, s: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, s: clamp(s, 0, 100) });
}

export function withHue(hex: string, h: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, h: ((h % 360) + 360) % 360 });
}

export function lighten(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: clamp(hsl.l + amount, 0, 100) });
}

export function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

export function saturate(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, s: clamp(hsl.s + amount, 0, 100) });
}

export function rotateHue(hex: string, degrees: number): string {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, h: hsl.h + degrees });
}

/* ------------------------------------------------------------------ */
/* Distance / similarity (for challenge scoring)                      */
/* ------------------------------------------------------------------ */

/** Perceptual-ish distance 0–100 between two hex colours (lower = closer). */
export function colorDistance(a: string, b: string): number {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  // Weighted euclidean ("redmean") approximation of perceived difference.
  const rmean = (ca.r + cb.r) / 2;
  const dr = ca.r - cb.r;
  const dg = ca.g - cb.g;
  const db = ca.b - cb.b;
  const dist = Math.sqrt(
    (2 + rmean / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rmean) / 256) * db * db
  );
  // Max possible ~765; normalise to 0–100.
  return round((dist / 765) * 100, 2);
}

/** 0–100 similarity score, 100 = identical. */
export function matchScore(a: string, b: string): number {
  const d = colorDistance(a, b);
  return round(Math.max(0, 100 - d * 1.6), 0);
}

/* ------------------------------------------------------------------ */
/* Random                                                             */
/* ------------------------------------------------------------------ */

export function randomHex(): string {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0").toUpperCase()}`;
}

/** A random colour that's pleasant (controlled saturation/lightness). */
export function randomPleasantHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 35); // 55–90
  const l = 45 + Math.floor(Math.random() * 25); // 45–70
  return hslToHex({ h, s, l });
}
