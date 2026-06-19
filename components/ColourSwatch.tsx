"use client";

import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { normalizeHex, readableTextColor } from "@/lib/color";
import { useCopy } from "@/hooks/useCopy";

export interface ColourSwatchProps {
  hex: string;
  label?: string;
  /** Show the hex code overlaid on the swatch. */
  showHex?: boolean;
  /** Make the swatch copy its hex on click. */
  copyable?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  title?: string;
}

const SIZES = {
  sm: "h-10 w-10 rounded-lg text-[10px]",
  md: "h-16 w-16 rounded-xl text-xs",
  lg: "h-24 w-full rounded-2xl text-sm",
};

/**
 * A single colour swatch. Always pairs the colour with its hex text (so meaning
 * isn't carried by colour alone) and can copy to the clipboard on click.
 */
export function ColourSwatch({
  hex,
  label,
  showHex = false,
  copyable = false,
  size = "md",
  className,
  onClick,
  selected = false,
  title,
}: ColourSwatchProps) {
  const safe = normalizeHex(hex) ?? "#000000";
  const ink = readableTextColor(safe);
  const { copy, copied } = useCopy();

  const handleClick = () => {
    if (onClick) return onClick();
    if (copyable) void copy(safe);
  };

  const interactive = copyable || !!onClick;
  const isCopied = copied === safe;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={interactive ? handleClick : undefined}
        disabled={!interactive}
        title={title ?? safe}
        aria-label={
          copyable ? `Copy ${label ? `${label} ` : ""}${safe}` : label ?? safe
        }
        style={{ background: safe, color: ink }}
        className={cn(
          "relative grid place-items-center font-mono font-semibold ring-1 ring-inset ring-black/10 transition",
          SIZES[size],
          interactive &&
            "cursor-pointer hover:scale-[1.04] hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          selected && "ring-2 ring-brand ring-offset-2 ring-offset-surface",
          !interactive && "cursor-default"
        )}
      >
        {copyable && (
          <span className="absolute right-1 top-1 opacity-0 transition group-hover:opacity-100">
            {isCopied ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </span>
        )}
        {showHex && <span className="px-1 text-center leading-tight">{safe}</span>}
      </button>
      {label && (
        <span className="max-w-[6rem] truncate text-center text-xs text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
