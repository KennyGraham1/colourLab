/**
 * Structured colour-theory lesson content. Each lesson carries a short
 * explanation plus the data an interactive example needs to render.
 */

export type LessonDemo =
  | { kind: "swatches"; colors: { hex: string; label: string }[] }
  | { kind: "wheel-harmony"; harmony: "complementary" | "analogous" | "triadic" }
  | { kind: "temperature" }
  | { kind: "variation"; variant: "tints" | "shades" | "tones" }
  | { kind: "slider"; channel: "saturation" | "lightness" };

export interface Lesson {
  id: string;
  title: string;
  short: string;
  body: string;
  takeaway: string;
  demo: LessonDemo;
}

export const LESSONS: Lesson[] = [
  {
    id: "primary",
    title: "Primary Colours",
    short: "The building blocks every other colour comes from.",
    body: "Primary colours cannot be made by mixing other colours together. In light (additive) the primaries are red, green and blue. In paint (subtractive) artists traditionally use red, yellow and blue, while printing uses cyan, magenta and yellow. Everything else is built from these starting points.",
    takeaway: "Primaries are the source — you mix outward from them.",
    demo: {
      kind: "swatches",
      colors: [
        { hex: "#FF0000", label: "Red" },
        { hex: "#FFFF00", label: "Yellow" },
        { hex: "#0000FF", label: "Blue" },
      ],
    },
  },
  {
    id: "secondary",
    title: "Secondary Colours",
    short: "Made by mixing two primaries in equal amounts.",
    body: "Mix two primaries and you get a secondary colour. With paint, red + yellow makes orange, yellow + blue makes green, and blue + red makes violet. Secondaries sit between their parent primaries on the colour wheel.",
    takeaway: "Two primaries combine into one secondary.",
    demo: {
      kind: "swatches",
      colors: [
        { hex: "#FF7A00", label: "Orange" },
        { hex: "#22A322", label: "Green" },
        { hex: "#7A2FBF", label: "Violet" },
      ],
    },
  },
  {
    id: "tertiary",
    title: "Tertiary Colours",
    short: "A primary mixed with a neighbouring secondary.",
    body: "Tertiary colours fill the gaps on the wheel — think red-orange, yellow-green or blue-violet. They're made by mixing a primary with the secondary next to it, giving twelve clearly distinct hues in total.",
    takeaway: "Primary + neighbouring secondary = a nuanced tertiary.",
    demo: {
      kind: "swatches",
      colors: [
        { hex: "#FF3D00", label: "Red-Orange" },
        { hex: "#9ACD32", label: "Yellow-Green" },
        { hex: "#3D5AFE", label: "Blue-Violet" },
      ],
    },
  },
  {
    id: "temperature",
    title: "Warm & Cool Colours",
    short: "Colours carry a feeling of temperature.",
    body: "Reds, oranges and yellows feel warm and tend to advance toward the viewer. Greens, blues and violets feel cool and tend to recede. Designers use temperature to set mood and create depth. Move the marker around the wheel to feel the shift.",
    takeaway: "Warm colours advance; cool colours recede.",
    demo: { kind: "temperature" },
  },
  {
    id: "complementary",
    title: "Complementary Colours",
    short: "Opposites on the wheel that make each other pop.",
    body: "Complementary colours sit directly across from one another on the wheel — like blue and orange, or red and green. Placed side by side they create strong contrast and vibrancy. Mixed together as paint, they neutralise into greys and browns.",
    takeaway: "Opposite hues = maximum contrast.",
    demo: { kind: "wheel-harmony", harmony: "complementary" },
  },
  {
    id: "analogous",
    title: "Analogous Colours",
    short: "Neighbours that blend harmoniously.",
    body: "Analogous colours sit next to each other on the wheel and share a common hue, so they blend naturally and feel calm and cohesive — think of a sunset moving from red to orange to yellow. Pick one to dominate and let the others support it.",
    takeaway: "Neighbouring hues feel harmonious together.",
    demo: { kind: "wheel-harmony", harmony: "analogous" },
  },
  {
    id: "triadic",
    title: "Triadic Colours",
    short: "Three evenly-spaced hues that stay balanced.",
    body: "A triadic scheme uses three hues spaced evenly around the wheel (120° apart). The result is vibrant and lively while remaining balanced. Let one hue lead and use the other two as accents.",
    takeaway: "Three evenly-spaced hues = balanced vibrancy.",
    demo: { kind: "wheel-harmony", harmony: "triadic" },
  },
  {
    id: "monochromatic",
    title: "Monochromatic Colours",
    short: "One hue across many lightness levels.",
    body: "A monochromatic palette takes a single hue and varies its lightness and saturation. The effect is elegant, unified and easy to balance because every colour shares the same root hue.",
    takeaway: "One hue, many values — clean and unified.",
    demo: { kind: "variation", variant: "tints" },
  },
  {
    id: "tints-shades-tones",
    title: "Shades, Tints & Tones",
    short: "Add white, black or grey to transform a hue.",
    body: "A tint is a hue mixed with white (lighter, softer). A shade is a hue mixed with black (darker, richer). A tone is a hue mixed with grey (more muted). These three moves let you build depth from a single colour without changing its hue.",
    takeaway: "Tint = +white, Shade = +black, Tone = +grey.",
    demo: { kind: "variation", variant: "shades" },
  },
  {
    id: "saturation-brightness",
    title: "Saturation & Brightness",
    short: "How pure and how light a colour is.",
    body: "Saturation describes how pure or intense a colour is — high saturation is vivid, low saturation drifts toward grey. Lightness (or brightness) describes how much light the colour has, from near-black to near-white. Together they give you precise control over mood.",
    takeaway: "Saturation = purity; lightness = how light or dark.",
    demo: { kind: "slider", channel: "saturation" },
  },
];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l])
);
