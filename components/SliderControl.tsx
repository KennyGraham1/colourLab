"use client";

import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

export interface SliderControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  /** Right-aligned formatted value, e.g. "60%" or "#FF0000". */
  valueLabel?: string;
  /** Accent colour for the filled portion of the track + thumb. */
  color?: string;
  /** A CSS gradient for the track background (e.g. hue ramp). */
  trackGradient?: string;
  /** Hide the visible label text but keep it for screen readers. */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Accessible labelled slider with a coloured fill. Keyboard operable (it's a
 * native range input) with a visible focus ring and an explicit text value so
 * information is never conveyed by colour alone.
 */
export function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  valueLabel,
  color = "rgb(99 102 241)",
  trackGradient,
  hideLabel = false,
  disabled = false,
  id,
  className,
}: SliderControlProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const pct = ((value - min) / (max - min)) * 100;

  const trackStyle: CSSProperties = trackGradient
    ? { backgroundImage: trackGradient }
    : {
        backgroundImage: `linear-gradient(to right, ${color} ${pct}%, rgb(var(--surface-2)) ${pct}%)`,
      };

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium text-ink",
            hideLabel && "sr-only"
          )}
        >
          {label}
        </label>
        {valueLabel !== undefined && (
          <span
            className="font-mono text-xs tabular-nums text-muted"
            aria-hidden
          >
            {valueLabel}
          </span>
        )}
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={valueLabel}
        style={
          {
            ...trackStyle,
            "--thumb": color,
          } as CSSProperties
        }
        className="cl-range h-2.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      />
    </div>
  );
}
