"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dices, Save } from "lucide-react";
import type { SectionProps } from "@/types";
import { cn } from "@/lib/cn";
import { describeColor, hexToHsl, randomPleasantHex, withLightness } from "@/lib/color";
import { describeColorName, getColorName } from "@/lib/colorNames";
import { getHarmony, HARMONY_KINDS, type HarmonyKind } from "@/lib/harmonies";
import { useCopy } from "@/hooks/useCopy";
import { useAppState } from "@/store/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ColourSwatch } from "@/components/ColourSwatch";
import { ColourWheel } from "@/components/ColourWheel";
import { SectionHeading } from "@/components/SectionHeading";
import { SliderControl } from "@/components/SliderControl";

/** The three "core" harmonies we surface first in the selector. */
const CORE_KINDS: HarmonyKind[] = ["complementary", "analogous", "triadic"];

// Order the selector so the core harmonies lead, then the rest.
const ORDERED_KINDS: HarmonyKind[] = [
  ...CORE_KINDS,
  ...HARMONY_KINDS.filter((k) => !CORE_KINDS.includes(k)),
];

export function WheelSection({ onNavigate: _onNavigate }: SectionProps) {
  const { createPalette, addColorToPalette, toast } = useAppState();
  const [base, setBase] = useState("#6366F1");
  const [kind, setKind] = useState<HarmonyKind>("complementary");

  const { copy, copied } = useCopy();

  // Current harmony derived from the base colour + selected kind.
  const harmony = useMemo(() => getHarmony(kind, base), [kind, base]);
  // Stable label per kind for the selector chips (label is base-independent).
  const kindLabels = useMemo(
    () =>
      ORDERED_KINDS.map((k) => ({ kind: k, label: getHarmony(k, base).label })),
    [base]
  );

  const lightness = Math.round(hexToHsl(base).l);
  const { hex, rgb, hsl } = describeColor(base);
  const baseName = describeColorName(base);

  const paletteString = harmony.colors.join(", ");
  const copiedPalette = copied === paletteString;

  // Copy every harmony colour as a single comma-separated string.
  const handleCopyPalette = async () => {
    const ok = await copy(paletteString);
    if (ok) toast(`Copied ${harmony.label} palette`, harmony.colors[0]);
  };

  // Persist the harmony as a new named palette.
  const handleSavePalette = () => {
    const name = `${harmony.label} palette`;
    const id = createPalette(name);
    harmony.colors.forEach((c) => addColorToPalette(id, c));
    toast(`Saved ${name}`, harmony.colors[0]);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Explore"
        title="Colour Wheel"
        description="Drag around the wheel to choose a hue and saturation, then explore the harmonies that radiate from it. Every harmony can be copied or saved as a palette."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — the interactive wheel + base colour details. */}
        <Card>
          <CardHeader
            title="Pick a base colour"
            subtitle="Angle sets the hue, distance from centre sets saturation."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBase(randomPleasantHex())}
              >
                <Dices className="h-4 w-4" aria-hidden />
                Random
              </Button>
            }
          />
          <CardBody className="space-y-6">
            <ColourWheel
              value={base}
              onChange={setBase}
              markers={harmony.colors}
            />

            {/* Friendly name of the currently selected colour. */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg font-bold text-ink">{baseName}</span>
              <span className="font-mono text-xs text-muted">{hex}</span>
            </div>

            <SliderControl
              label="Lightness"
              value={lightness}
              min={0}
              max={100}
              valueLabel={`${lightness}%`}
              color={base}
              onChange={(l) => setBase(withLightness(base, l))}
            />

            {/* Base colour codes with a copy-each control. */}
            <dl className="grid gap-2">
              {(
                [
                  ["HEX", hex],
                  ["RGB", rgb],
                  ["HSL", hsl],
                ] as const
              ).map(([label, val]) => {
                const isCopied = copied === val;
                return (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {label}
                    </dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-mono text-sm text-ink">{val}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Copy ${label} value ${val}`}
                        onClick={() => void copy(val)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-brand" aria-hidden />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardBody>
        </Card>

        {/* RIGHT — harmony selection + resulting swatches + actions. */}
        <Card>
          <CardHeader
            title="Harmonies"
            subtitle="Relationships built from your base hue."
          />
          <CardBody className="space-y-5">
            {/* Harmony kind selector. */}
            <div
              role="group"
              aria-label="Choose a harmony"
              className="flex flex-wrap gap-2"
            >
              {kindLabels.map(({ kind: k, label }) => {
                const active = k === kind;
                const core = CORE_KINDS.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      active
                        ? "border-transparent bg-brand text-white shadow-soft"
                        : "border-border bg-surface text-ink hover:bg-surface-2",
                      !active && core && "border-brand/40"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Description of the selected harmony. */}
            <p className="text-sm leading-relaxed text-muted text-pretty">
              {harmony.description}
            </p>

            {/* The harmony's colours. */}
            <div className="flex flex-wrap gap-4">
              {harmony.colors.map((c, i) => (
                <ColourSwatch
                  key={`${c}-${i}`}
                  hex={c}
                  label={getColorName(c)}
                  showHex
                  copyable
                  size="md"
                />
              ))}
            </div>

            {/* Actions. */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="secondary" onClick={handleCopyPalette}>
                {copiedPalette ? (
                  <Check className="h-4 w-4 text-brand" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                Copy palette
              </Button>
              <Button onClick={handleSavePalette}>
                <Save className="h-4 w-4" aria-hidden />
                Save as palette
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
