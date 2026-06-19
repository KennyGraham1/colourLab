"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Beaker,
  BookOpen,
  Copy,
  Layers,
  Palette,
  Sparkles,
  Shuffle,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ColourSwatch } from "@/components/ColourSwatch";
import { cn } from "@/lib/cn";
import { describeColor, randomPleasantHex, readableTextColor } from "@/lib/color";
import { useAppState } from "@/store/AppStateProvider";
import type { SectionId, SectionProps } from "@/types";

/** Static, attractive swatch set used as the hero's animated visual. */
const HERO_SWATCHES = [
  "#6C5CE7",
  "#00B894",
  "#FDCB6E",
  "#E17055",
  "#0984E3",
] as const;

interface FeatureCard {
  id: Exclude<SectionId, "home">;
  title: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: FeatureCard[] = [
  {
    id: "mixer",
    title: "Mixer",
    description: "Blend colours with light or pigment and read the result.",
    icon: Beaker,
  },
  {
    id: "theory",
    title: "Theory",
    description: "Bite-size lessons on hue, temperature, tints and tones.",
    icon: BookOpen,
  },
  {
    id: "wheel",
    title: "Colour wheel",
    description: "Spin harmonies — complementary, analogous, triadic and more.",
    icon: Palette,
  },
  {
    id: "challenges",
    title: "Challenges",
    description: "Train your eye by matching, warming and cooling targets.",
    icon: Target,
  },
  {
    id: "palettes",
    title: "Palettes",
    description: "Save the colours you love and build reusable sets.",
    icon: Layers,
  },
];

export function HomeSection({ onNavigate }: SectionProps) {
  const { hydrated, palettes, progress, quickSaveColor, toast } = useAppState();

  // The "random colour experiment" mini. Seeded once on mount, reshuffled on demand.
  const [experiment, setExperiment] = useState<string>(() => randomPleasantHex());
  const described = useMemo(() => describeColor(experiment), [experiment]);
  const experimentInk = readableTextColor(described.hex);

  const shuffle = () => setExperiment(randomPleasantHex());

  const copyHex = async () => {
    try {
      await navigator.clipboard.writeText(described.hex);
      toast(`Copied ${described.hex}`, described.hex);
    } catch {
      toast(described.hex, described.hex);
    }
  };

  const saveExperiment = () => {
    quickSaveColor(described.hex);
    toast(`Saved ${described.hex} to palette`, described.hex);
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="cl-card relative overflow-hidden p-6 sm:p-10">
        {/* Soft decorative gradient blob, gently looping. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand to-accent opacity-20 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Colour Lab
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl">
              Learn how colours work — by mixing them
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted text-pretty">
              Colour Lab is a hands-on playground for colour theory. Mix colours
              with light and pigment, explore relationships on the wheel, work
              through quick lessons, sharpen your eye with challenges, and save
              the palettes you build along the way.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onNavigate("mixer")}>
                <Beaker className="h-4 w-4" aria-hidden /> Start mixing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("wheel")}
              >
                <Palette className="h-4 w-4" aria-hidden /> Explore the wheel
              </Button>
            </div>

            {/* Stats strip — only shown after hydration so SSR/client agree. */}
            {hydrated && (
              <dl className="mt-6 flex flex-wrap gap-6">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Saved palettes
                  </dt>
                  <dd className="text-2xl font-bold text-ink">
                    {palettes.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Challenges completed
                  </dt>
                  <dd className="text-2xl font-bold text-ink">
                    {progress.completed.length}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Animated hero visual: a fanned row of demo swatches. */}
          <div className="flex items-end justify-center gap-2 sm:gap-3">
            {HERO_SWATCHES.map((hex, i) => (
              <motion.div
                key={hex}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="flex-1"
              >
                <motion.div
                  className="aspect-[2/3] rounded-2xl border border-border shadow-lift"
                  style={{ background: hex }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.25,
                  }}
                />
                <p className="mt-1.5 text-center font-mono text-[10px] text-muted">
                  {hex}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RANDOM COLOUR EXPERIMENT */}
      <section className="cl-card overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
          {/* Big swatch of the current experiment colour. */}
          <motion.div
            animate={{ background: described.hex }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex min-h-[160px] items-end p-4"
            style={{ background: described.hex, color: experimentInk }}
          >
            <p className="font-mono text-2xl font-bold">{described.hex}</p>
          </motion.div>

          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Random colour experiment
                </h2>
                <p className="mt-0.5 text-sm text-muted text-pretty">
                  Roll a pleasant colour, inspect its values, then copy or save it.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={shuffle}>
                <Shuffle className="h-4 w-4" aria-hidden /> Shuffle
              </Button>
            </div>

            <dl className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: "HEX", value: described.hex },
                  { key: "RGB", value: described.rgb },
                  { key: "HSL", value: described.hsl },
                ] as const
              ).map((row) => (
                <div
                  key={row.key}
                  className="rounded-xl bg-surface-2 px-3 py-2"
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {row.key}
                  </dt>
                  <dd className="mt-0.5 truncate font-mono text-sm text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyHex}>
                <Copy className="h-4 w-4" aria-hidden /> Copy HEX
              </Button>
              <Button variant="outline" size="sm" onClick={saveExperiment}>
                <Layers className="h-4 w-4" aria-hidden /> Save to palette
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Everything in the lab
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${feature.title}`}
                onClick={() => onNavigate(feature.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNavigate(feature.id);
                  }
                }}
                className={cn(
                  "group flex cursor-pointer flex-col gap-3 p-5",
                  "transition-all duration-150 hover:-translate-y-1 hover:shadow-lift",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                )}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted text-pretty">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}

          {/* A subtle "what you'll build" card pairing a swatch with its label. */}
          <Card className="flex flex-col gap-3 p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-muted">
              <Trophy className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-base font-semibold text-ink">Start anywhere</h3>
              <p className="mt-1 text-sm text-muted text-pretty">
                No setup needed — every tool works straight away.
              </p>
            </div>
            <div className="mt-1 flex gap-1.5">
              {HERO_SWATCHES.slice(0, 4).map((hex) => (
                <ColourSwatch key={hex} hex={hex} size="sm" showHex={false} />
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
