"use client";

import {
  useCallback,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { clamp, hexToHsl, hslToHex, readableTextColor } from "@/lib/color";

export interface ColourWheelProps {
  value: string;
  onChange: (hex: string) => void;
  /** Extra colours (e.g. harmony partners) drawn as small reference dots. */
  markers?: string[];
  /** Diameter in px. Responsive: caps at this, shrinks on small screens. */
  size?: number;
  className?: string;
}

/**
 * Convert an HSL hue/saturation into an {x, y} position (0..1) on the disc,
 * where the centre is (0.5, 0.5). Hue maps to angle, saturation to radius.
 *
 * The visual conic-gradient starts at the top (`from 90deg`) and runs
 * clockwise, so hue 0 (red) sits at the top. We mirror that math here so the
 * markers line up with the painted hues.
 */
function hslToPoint(h: number, s: number): { x: number; y: number } {
  // -90deg so hue 0 is at the top; convert to radians.
  const angle = ((h - 90) * Math.PI) / 180;
  const radius = clamp(s, 0, 100) / 100 / 2; // 0..0.5 of the disc
  return {
    x: 0.5 + Math.cos(angle) * radius,
    y: 0.5 + Math.sin(angle) * radius,
  };
}

/** Inverse of {@link hslToPoint}: a pointer position (0..1) -> {h, s}. */
function pointToHsl(px: number, py: number): { h: number; s: number } {
  const dx = px - 0.5;
  const dy = py - 0.5;
  // Angle back to hue, re-adding the 90deg offset and normalising to 0..360.
  let h = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  h = ((h % 360) + 360) % 360;
  // Distance from centre; full saturation at the rim (radius 0.5).
  const dist = Math.sqrt(dx * dx + dy * dy);
  const s = clamp((dist / 0.5) * 100, 0, 100);
  return { h, s };
}

/**
 * Interactive HSL colour wheel. Hue is the angle around the disc and saturation
 * is the distance from the centre; lightness is preserved from the current
 * value so dragging never changes how light/dark the colour is.
 *
 * Fully keyboard operable via arrow keys, and exposed as an ARIA slider.
 */
export function ColourWheel({
  value,
  onChange,
  markers = [],
  size = 280,
  className,
}: ColourWheelProps) {
  const discRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const { h, s, l } = hexToHsl(value);

  // Emit a new colour from a hue/saturation pair, keeping current lightness.
  const emit = useCallback(
    (nextH: number, nextS: number) => {
      onChange(hslToHex({ h: nextH, s: clamp(nextS, 0, 100), l }));
    },
    [onChange, l]
  );

  // Translate a pointer event into hue/saturation and emit the new colour.
  const updateFromEvent = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const disc = discRef.current;
      if (!disc) return;
      const rect = disc.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const { h: nh, s: ns } = pointToHsl(px, py);
      emit(nh, ns);
    },
    [emit]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromEvent(e);
    },
    [updateFromEvent]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      updateFromEvent(e);
    },
    [updateFromEvent]
  );

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Arrow keys: left/right nudge hue, up/down nudge saturation.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let handled = true;
      switch (e.key) {
        case "ArrowLeft":
          emit(h - 2, s);
          break;
        case "ArrowRight":
          emit(h + 2, s);
          break;
        case "ArrowUp":
          emit(h, s + 2);
          break;
        case "ArrowDown":
          emit(h, s - 2);
          break;
        default:
          handled = false;
      }
      if (handled) e.preventDefault();
    },
    [emit, h, s]
  );

  // Disc background: white centre fading out, over a full-hue conic gradient.
  const discStyle: CSSProperties = {
    background:
      "radial-gradient(circle at center, #fff 0%, rgba(255,255,255,0) 70%), " +
      "conic-gradient(from 90deg, " +
      "hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), " +
      "hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))",
  };

  const current = hslToPoint(h, s);
  const currentHex = hslToHex({ h, s, l });

  return (
    <div
      className={cn("mx-auto w-full select-none", className)}
      style={{ maxWidth: size }}
    >
      <div
        ref={discRef}
        role="slider"
        tabIndex={0}
        aria-label="Colour wheel. Drag or use arrow keys to set hue and saturation."
        aria-valuetext={`${currentHex}, hue ${Math.round(h)} degrees, saturation ${Math.round(
          s
        )} percent`}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(h)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={discStyle}
        className={cn(
          "relative aspect-square w-full touch-none rounded-full",
          "shadow-lift ring-1 ring-inset ring-black/10",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "cursor-crosshair"
        )}
      >
        {/* Reference markers for harmony colours. */}
        {markers.map((markerHex, i) => {
          const { h: mh, s: ms } = hexToHsl(markerHex);
          const p = hslToPoint(mh, ms);
          // Skip the dot that coincides with the current selection to avoid clutter.
          const isCurrent = Math.abs(mh - h) < 0.5 && Math.abs(ms - s) < 0.5;
          if (isCurrent) return null;
          return (
            <span
              key={`${markerHex}-${i}`}
              aria-hidden
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-soft"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                background: markerHex,
              }}
            />
          );
        })}

        {/* The draggable marker for the current value. */}
        <span
          aria-hidden
          className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-white shadow-lift"
          style={{
            left: `${current.x * 100}%`,
            top: `${current.y * 100}%`,
            background: currentHex,
            boxShadow: `0 0 0 1px ${readableTextColor(currentHex) === "#FFFFFF" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.2)"}`,
          }}
        />
      </div>
    </div>
  );
}
