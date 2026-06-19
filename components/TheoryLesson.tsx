"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Lesson } from "@/lib/theory";
import {
  hexToHsl,
  hslToHex,
  temperature,
  temperatureLabel,
  withHue,
} from "@/lib/color";
import {
  analogous,
  complementary,
  triadic,
  tints,
  shades,
  tones,
} from "@/lib/harmonies";
import { describeColorName, getColorName } from "@/lib/colorNames";
import { ColourSwatch } from "@/components/ColourSwatch";
import { ColourPicker } from "@/components/ColourPicker";
import { SliderControl } from "@/components/SliderControl";
import { cn } from "@/lib/cn";

/** A full hue ramp used for any "Hue" slider track. */
const HUE_GRADIENT =
  "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

/** Shared sub-heading for each demo block. */
function DemoTitle({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
      {children}
    </p>
  );
}

/**
 * "swatches" demo — a static row of named, copyable swatches.
 */
function SwatchesDemo({
  colors,
}: {
  colors: { hex: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {colors.map((c) => (
        <ColourSwatch
          key={`${c.hex}-${c.label}`}
          hex={c.hex}
          label={c.label}
          showHex
          copyable
          size="lg"
          className="w-24"
        />
      ))}
    </div>
  );
}

/** Friendly copy describing each harmony kind. */
const HARMONY_NOTE: Record<
  "complementary" | "analogous" | "triadic",
  string
> = {
  complementary:
    "Complementary pairs sit directly opposite each other — drag the hue and watch the partner stay across the wheel.",
  analogous:
    "Analogous colours are immediate neighbours, so they always feel calm and cohesive together.",
  triadic:
    "Triadic hues stay evenly spaced 120° apart, giving balance even as you change the base.",
};

const HARMONY_LABELS: Record<
  "complementary" | "analogous" | "triadic",
  string[]
> = {
  complementary: ["Base", "Complement"],
  analogous: ["Neighbour", "Base", "Neighbour"],
  triadic: ["Base", "Triad 2", "Triad 3"],
};

/**
 * "wheel-harmony" demo — a live hue slider that recomputes a harmony set.
 */
function WheelHarmonyDemo({
  harmony,
}: {
  harmony: "complementary" | "analogous" | "triadic";
}) {
  const [baseHex, setBaseHex] = useState("#3B82F6");
  const hue = Math.round(hexToHsl(baseHex).h);

  // Pick the matching harmony function for this lesson.
  const colors =
    harmony === "complementary"
      ? complementary(baseHex)
      : harmony === "analogous"
        ? analogous(baseHex)
        : triadic(baseHex);

  const labels = HARMONY_LABELS[harmony];

  return (
    <div className="space-y-4">
      <SliderControl
        label="Base hue"
        value={hue}
        min={0}
        max={360}
        valueLabel={`${hue}°`}
        trackGradient={HUE_GRADIENT}
        onChange={(h) => setBaseHex(withHue(baseHex, h))}
      />
      <div className="flex flex-wrap gap-4">
        {colors.map((hex, i) => (
          <ColourSwatch
            key={`${hex}-${i}`}
            hex={hex}
            label={`${labels[i] ?? `Colour ${i + 1}`} · ${getColorName(hex)}`}
            showHex
            copyable
            size="lg"
            className="w-24"
          />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {HARMONY_NOTE[harmony]}
      </p>
    </div>
  );
}

/**
 * "temperature" demo — move the hue and read off warm/cool, with fixed examples.
 */
function TemperatureDemo() {
  const [hue, setHue] = useState(20);
  const hex = hslToHex({ h: hue, s: 75, l: 55 });
  const temp = temperature(hex);

  const warmExample = "#FF6B35";
  const coolExample = "#2E78D2";

  return (
    <div className="space-y-4">
      <SliderControl
        label="Hue"
        value={hue}
        min={0}
        max={360}
        valueLabel={`${hue}°`}
        trackGradient={HUE_GRADIENT}
        onChange={setHue}
      />
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div
          className="grid h-24 w-32 place-items-center rounded-2xl ring-1 ring-inset ring-black/10"
          style={{ background: hex }}
        >
          <span className="cl-chip bg-surface/80 font-mono text-xs text-ink">
            {hex}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">
            {describeColorName(hex)}
          </p>
          <p className="text-sm font-medium text-brand">
            {temperatureLabel[temp]}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Warm colours advance toward you; cool colours recede into the
            background.
          </p>
        </div>
      </div>
      <div>
        <DemoTitle>Compare</DemoTitle>
        <div className="mt-2 flex flex-wrap gap-4">
          <ColourSwatch
            hex={warmExample}
            label={`Warm · ${getColorName(warmExample)}`}
            showHex
            copyable
            size="lg"
            className="w-24"
          />
          <ColourSwatch
            hex={coolExample}
            label={`Cool · ${getColorName(coolExample)}`}
            showHex
            copyable
            size="lg"
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}

type VariationTab = "tints" | "shades" | "tones";

const VARIATION_TABS: { id: VariationTab; label: string }[] = [
  { id: "tints", label: "Tints" },
  { id: "shades", label: "Shades" },
  { id: "tones", label: "Tones" },
];

const VARIATION_NOTE: Record<VariationTab, string> = {
  tints: "Tint = hue + white. The colour grows lighter and softer.",
  shades: "Shade = hue + black. The colour grows darker and richer.",
  tones: "Tone = hue + grey. The colour grows more muted.",
};

/**
 * "variation" demo — switch between tints / shades / tones ramps for a base hue.
 */
function VariationDemo({ variant }: { variant: VariationTab }) {
  const [baseHex, setBaseHex] = useState("#3B82F6");
  const [tab, setTab] = useState<VariationTab>(variant);

  const ramp =
    tab === "tints"
      ? tints(baseHex)
      : tab === "shades"
        ? shades(baseHex)
        : tones(baseHex);

  return (
    <div className="space-y-4">
      <ColourPicker
        value={baseHex}
        onChange={setBaseHex}
        label="Base colour"
        showPresets={false}
      />

      {/* Tabs to switch the ramp so the difference is felt directly. */}
      <div
        role="tablist"
        aria-label="Variation type"
        className="flex gap-1 rounded-xl bg-surface-2 p-1"
      >
        {VARIATION_TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                active
                  ? "bg-surface text-ink shadow-soft"
                  : "text-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        {ramp.map((hex, i) => (
          <ColourSwatch
            key={`${hex}-${i}`}
            hex={hex}
            label={getColorName(hex)}
            showHex
            copyable
            size="lg"
            className="w-20"
          />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {VARIATION_NOTE[tab]}
      </p>
    </div>
  );
}

const CHANNEL_META: Record<
  "saturation" | "lightness",
  { label: string; note: string }
> = {
  saturation: {
    label: "Saturation",
    note: "Saturation is how pure a colour is — high is vivid, low drifts toward grey.",
  },
  lightness: {
    label: "Lightness",
    note: "Lightness is how much light a colour has — from near-black up to near-white.",
  },
};

/** Base colours the user can apply the saturation / lightness change to. */
const BASE_HUES: { name: string; h: number }[] = [
  { name: "Red", h: 0 },
  { name: "Orange", h: 28 },
  { name: "Yellow", h: 50 },
  { name: "Green", h: 135 },
  { name: "Teal", h: 180 },
  { name: "Blue", h: 215 },
  { name: "Purple", h: 275 },
  { name: "Pink", h: 325 },
];

/**
 * "slider" demo — adjust one HSL channel on a fixed hue and read the result.
 */
function ChannelSliderDemo({
  channel,
}: {
  channel: "saturation" | "lightness";
}) {
  // Start from a vivid mid colour so both channels have somewhere to travel.
  const [value, setValue] = useState(channel === "saturation" ? 80 : 55);
  // The base hue the channel change is applied to — chosen by the user below.
  const [baseHue, setBaseHue] = useState(215);
  const baseHsl = { h: baseHue, s: 80, l: 55 };

  const hsl =
    channel === "saturation"
      ? { ...baseHsl, s: value }
      : { ...baseHsl, l: value };
  const hex = hslToHex(hsl);
  const meta = CHANNEL_META[channel];

  const trackGradient =
    channel === "saturation"
      ? `linear-gradient(to right, ${hslToHex({ ...baseHsl, s: 0 })}, ${hslToHex({ ...baseHsl, s: 100 })})`
      : `linear-gradient(to right, #000, ${hslToHex({ ...baseHsl, l: 50 })}, #fff)`;

  return (
    <div className="space-y-4">
      {/* Pick the base colour the channel change is applied to. */}
      <div>
        <DemoTitle>Base colour</DemoTitle>
        <div
          role="group"
          aria-label="Choose a base colour"
          className="mt-2 flex flex-wrap gap-2"
        >
          {BASE_HUES.map((b) => {
            const swatch = hslToHex({ h: b.h, s: 80, l: 55 });
            const active = b.h === baseHue;
            return (
              <button
                key={b.name}
                type="button"
                onClick={() => setBaseHue(b.h)}
                aria-pressed={active}
                aria-label={`Base colour ${b.name}`}
                title={b.name}
                style={{ background: swatch }}
                className={cn(
                  "h-8 w-8 rounded-lg ring-1 ring-inset ring-black/10 transition hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  active &&
                    "ring-2 ring-brand ring-offset-2 ring-offset-surface-2"
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="grid h-24 w-32 place-items-center rounded-2xl ring-1 ring-inset ring-black/10"
          style={{ background: hex }}
        >
          <span className="cl-chip bg-surface/80 font-mono text-xs text-ink">
            {hex}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-ink">
            {describeColorName(hex)}
          </p>
          <p className="text-sm font-medium text-muted">
            {meta.label}: {value}%
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{meta.note}</p>
        </div>
      </div>
      <SliderControl
        label={meta.label}
        value={value}
        min={0}
        max={100}
        valueLabel={`${value}%`}
        trackGradient={trackGradient}
        onChange={setValue}
      />
    </div>
  );
}

/** Renders the interactive demo for a lesson based on its `demo.kind`. */
function LessonDemoView({ lesson }: { lesson: Lesson }) {
  const { demo } = lesson;
  switch (demo.kind) {
    case "swatches":
      return <SwatchesDemo colors={demo.colors} />;
    case "wheel-harmony":
      return <WheelHarmonyDemo harmony={demo.harmony} />;
    case "temperature":
      return <TemperatureDemo />;
    case "variation":
      return <VariationDemo variant={demo.variant} />;
    case "slider":
      return <ChannelSliderDemo channel={demo.channel} />;
    default:
      return null;
  }
}

/**
 * Renders a single colour-theory lesson: heading, body, a highlighted takeaway
 * and the matching interactive demo.
 */
export function TheoryLesson({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink">
          {lesson.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-brand">{lesson.short}</p>
      </div>

      <p className="text-[15px] leading-relaxed text-muted text-pretty">
        {lesson.body}
      </p>

      {/* Highlighted takeaway line. */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-brand-soft px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
        <p className="text-sm font-medium text-ink">
          <span className="sr-only">Takeaway: </span>
          {lesson.takeaway}
        </p>
      </div>

      {/* Interactive demo. */}
      <div className="rounded-2xl border border-border bg-surface-2/50 p-5">
        <DemoTitle>Try it</DemoTitle>
        <div className="mt-3">
          <LessonDemoView lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
