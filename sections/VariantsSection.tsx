"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Dices, Save } from "lucide-react";
import type { SectionProps } from "@/types";
import {
  randomPleasantHex,
  rotateHue,
  withSaturation,
} from "@/lib/color";
import { getColorName } from "@/lib/colorNames";
import {
  analogous,
  complementary,
  monochromatic,
  shades,
  splitComplementary,
  tetradic,
  tints,
  tones,
  triadic,
} from "@/lib/harmonies";
import { useCopy } from "@/hooks/useCopy";
import { useAppState } from "@/store/AppStateProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ColourPicker } from "@/components/ColourPicker";
import { ColourSwatch } from "@/components/ColourSwatch";
import { ResultPreview } from "@/components/ResultPreview";
import { SectionHeading } from "@/components/SectionHeading";

/** Evenly-spaced saturation steps at the base hue & lightness (grey → vivid). */
function saturationRamp(hex: string, n = 8): string[] {
  return Array.from({ length: n }, (_, i) =>
    withSaturation(hex, (i / (n - 1)) * 100)
  );
}

/** The same colour rotated around the wheel in equal steps. */
function hueRamp(hex: string, n = 12): string[] {
  return Array.from({ length: n }, (_, i) => rotateHue(hex, (360 / n) * i));
}

/** De-duplicate consecutive identical hexes so ramps don't repeat at the ends. */
function dedupe(colors: string[]): string[] {
  return colors.filter((c, i) => i === 0 || c !== colors[i - 1]);
}

interface VariantGroup {
  title: string;
  description: string;
  colors: string[];
}

/**
 * One labelled group of variant swatches, with copy-all and save-as-palette
 * actions. Every swatch is named so meaning isn't carried by colour alone.
 */
function VariantRow({ group }: { group: VariantGroup }) {
  const { createPalette, addColorToPalette, toast } = useAppState();
  const { copy, copied } = useCopy();
  const list = group.colors.join(" ");
  const isCopied = copied === list;

  const handleCopy = async () => {
    const ok = await copy(list);
    if (ok)
      toast(
        `Copied ${group.colors.length} ${group.title.toLowerCase()}`,
        group.colors[0]
      );
  };

  const handleSave = () => {
    const id = createPalette(`${group.title}`);
    group.colors.forEach((c) => addColorToPalette(id, c, getColorName(c)));
    toast(`Saved ${group.title}`, group.colors[0]);
  };

  return (
    <Card>
      <CardHeader
        title={group.title}
        subtitle={group.description}
        action={
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              aria-label={`Copy ${group.title} hex codes`}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-brand" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              aria-label={`Save ${group.title} as a palette`}
            >
              <Save className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        }
      />
      <CardBody>
        <div className="flex flex-wrap gap-3">
          {group.colors.map((c, i) => (
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
      </CardBody>
    </Card>
  );
}

export function VariantsSection({ onNavigate }: SectionProps) {
  const { quickSaveColor, toast } = useAppState();
  const [base, setBase] = useState("#3B82F6");

  // All variant families derived from the base colour.
  const variations = useMemo<VariantGroup[]>(
    () => [
      {
        title: "Tints",
        description: "The colour mixed toward white — lighter and softer.",
        colors: dedupe(tints(base, 8)),
      },
      {
        title: "Shades",
        description: "The colour mixed toward black — darker and richer.",
        colors: dedupe(shades(base, 8)),
      },
      {
        title: "Tones",
        description: "The colour mixed toward grey — calmer and more muted.",
        colors: dedupe(tones(base, 8)),
      },
      {
        title: "Monochromatic",
        description: "One hue across a full range of lightness.",
        colors: dedupe(monochromatic(base, 8)),
      },
      {
        title: "Saturation scale",
        description: "From grey to fully saturated at the same hue and lightness.",
        colors: dedupe(saturationRamp(base, 8)),
      },
      {
        title: "Hue rotations",
        description: "The colour stepped all the way around the wheel.",
        colors: dedupe(hueRamp(base, 12)),
      },
    ],
    [base]
  );

  const harmonies = useMemo<VariantGroup[]>(
    () => [
      {
        title: "Complementary",
        description: "The opposite hue — maximum contrast.",
        colors: complementary(base),
      },
      {
        title: "Analogous",
        description: "Neighbouring hues that sit together calmly.",
        colors: analogous(base),
      },
      {
        title: "Triadic",
        description: "Three hues evenly spaced for balanced vibrancy.",
        colors: triadic(base),
      },
      {
        title: "Split complementary",
        description: "A hue plus the two neighbours of its complement.",
        colors: splitComplementary(base),
      },
      {
        title: "Tetradic",
        description: "Two complementary pairs — rich and varied.",
        colors: tetradic(base),
      },
    ],
    [base]
  );

  const handleSaveBase = (hex: string) => {
    quickSaveColor(hex, getColorName(hex));
    toast(`Saved ${getColorName(hex)}`, hex);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Explore"
        title="Colour Variants"
        description="Enter any colour to see its full family — tints, shades, tones, monochromatic and saturation ramps, hue rotations and every harmony. Copy any group or save it as a palette."
        action={
          <Button variant="outline" onClick={() => setBase(randomPleasantHex())}>
            <Dices className="h-4 w-4" aria-hidden /> Random colour
          </Button>
        }
      />

      {/* Input + chosen colour preview. */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Choose a colour"
            subtitle="Type a hex, use the picker, or drag the sliders."
          />
          <CardBody>
            <ColourPicker value={base} onChange={setBase} label="Base colour" />
          </CardBody>
        </Card>

        <ResultPreview hex={base} title="Your colour" onSave={handleSaveBase} />
      </div>

      {/* Variation families. */}
      <GroupHeading>Variations</GroupHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        {variations.map((g) => (
          <VariantRow key={g.title} group={g} />
        ))}
      </div>

      {/* Harmonies. */}
      <GroupHeading>Harmonies</GroupHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {harmonies.map((g) => (
          <VariantRow key={g.title} group={g} />
        ))}
      </div>

      <p className="pt-2 text-center text-sm text-muted">
        Want to combine colours instead?{" "}
        <button
          type="button"
          onClick={() => onNavigate("mixer")}
          className="font-semibold text-brand underline-offset-2 hover:underline"
        >
          Open the Mixer
        </button>
        .
      </p>
    </div>
  );
}

function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-2 text-lg font-semibold tracking-tight text-ink">
      {children}
    </h2>
  );
}
