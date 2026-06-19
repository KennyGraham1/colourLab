"use client";

import { useEffect, useId, useState } from "react";
import { Pipette, Shuffle } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  hexToHsl,
  hslToHex,
  normalizeHex,
  randomPleasantHex,
  readableTextColor,
} from "@/lib/color";
import { describeColorName } from "@/lib/colorNames";
import { SliderControl } from "./SliderControl";

const PRESETS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#FACC15",
  "#84CC16",
  "#22C55E",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#D946EF",
  "#EC4899",
  "#111827",
  "#6B7280",
  "#FFFFFF",
];

export interface ColourPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  /** Show HSL sliders (default true). */
  showSliders?: boolean;
  /** Show the preset swatch row (default true). */
  showPresets?: boolean;
  showRandom?: boolean;
  className?: string;
}

/**
 * A complete colour picker: native OS picker, validated hex field, HSL sliders
 * and quick presets. All controls stay in sync and are keyboard accessible.
 */
export function ColourPicker({
  value,
  onChange,
  label = "Colour",
  showSliders = true,
  showPresets = true,
  showRandom = true,
  className,
}: ColourPickerProps) {
  const safe = normalizeHex(value) ?? "#000000";
  const hsl = hexToHsl(safe);
  const name = describeColorName(safe);
  const hexId = useId();
  const [draft, setDraft] = useState(safe);

  // Keep the hex text field in sync when the colour changes elsewhere.
  useEffect(() => {
    setDraft(safe);
  }, [safe]);

  const commitDraft = (raw: string) => {
    const norm = normalizeHex(raw);
    if (norm) onChange(norm);
    else setDraft(safe); // revert invalid input
  };

  const setChannel = (patch: Partial<typeof hsl>) =>
    onChange(hslToHex({ ...hsl, ...patch }));

  const ink = readableTextColor(safe);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <label className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-inset ring-black/10 transition hover:scale-105">
          <span
            className="grid h-full w-full place-items-center"
            style={{ background: safe, color: ink }}
          >
            <Pipette className="h-5 w-5 opacity-70" aria-hidden />
          </span>
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label}: open colour picker`}
          />
        </label>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label
              htmlFor={hexId}
              className="text-sm font-medium text-ink"
            >
              {label}
            </label>
            {/* Live, friendly name of the current colour. */}
            <span
              className="truncate text-xs font-medium text-muted"
              title={name}
            >
              {name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-border bg-surface px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
              <span className="font-mono text-sm text-muted">#</span>
              <input
                id={hexId}
                value={draft.replace(/^#/, "")}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={(e) => commitDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitDraft(draft);
                }}
                spellCheck={false}
                maxLength={6}
                className="w-full bg-transparent py-2.5 font-mono text-sm uppercase tracking-wide text-ink outline-none"
                aria-label={`${label} hex value`}
              />
            </div>
            {showRandom && (
              <button
                type="button"
                onClick={() => onChange(randomPleasantHex())}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Random colour"
                title="Random colour"
              >
                <Shuffle className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      {showSliders && (
        <div className="space-y-3">
          <SliderControl
            label="Hue"
            value={Math.round(hsl.h)}
            min={0}
            max={360}
            valueLabel={`${Math.round(hsl.h)}°`}
            onChange={(h) => setChannel({ h })}
            trackGradient="linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))"
          />
          <SliderControl
            label="Saturation"
            value={Math.round(hsl.s)}
            valueLabel={`${Math.round(hsl.s)}%`}
            onChange={(s) => setChannel({ s })}
            trackGradient={`linear-gradient(to right, ${hslToHex({
              ...hsl,
              s: 0,
            })}, ${hslToHex({ ...hsl, s: 100 })})`}
          />
          <SliderControl
            label="Lightness"
            value={Math.round(hsl.l)}
            valueLabel={`${Math.round(hsl.l)}%`}
            onChange={(l) => setChannel({ l })}
            trackGradient={`linear-gradient(to right, #000, ${hslToHex({
              ...hsl,
              l: 50,
            })}, #fff)`}
          />
        </div>
      )}

      {showPresets && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Quick picks</p>
          <div className="grid grid-cols-8 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                title={p}
                aria-label={`Choose ${p}`}
                style={{ background: p }}
                className={cn(
                  "h-7 w-full rounded-md ring-1 ring-inset ring-black/10 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  safe === p && "ring-2 ring-brand ring-offset-1 ring-offset-surface"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
