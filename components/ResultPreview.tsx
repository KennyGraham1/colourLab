"use client";

import { motion } from "framer-motion";
import { Check, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  describeColor,
  readableTextColor,
  temperature,
  temperatureLabel,
} from "@/lib/color";
import { useCopy } from "@/hooks/useCopy";

interface ValueRow {
  key: "HEX" | "RGB" | "HSL";
  value: string;
}

/**
 * Large preview of a resulting colour with its HEX / RGB / HSL values, each
 * individually copyable, plus an optional "add to palette" action.
 */
export function ResultPreview({
  hex,
  title = "Result",
  onSave,
  className,
}: {
  hex: string;
  title?: string;
  onSave?: (hex: string) => void;
  className?: string;
}) {
  const { hex: safe, rgb, hsl } = describeColor(hex);
  const ink = readableTextColor(safe);
  const { copy, copied } = useCopy();
  const temp = temperature(safe);

  const rows: ValueRow[] = [
    { key: "HEX", value: safe },
    { key: "RGB", value: rgb },
    { key: "HSL", value: hsl },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-soft",
        className
      )}
    >
      <motion.div
        layout
        animate={{ background: safe }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex h-40 items-end p-4"
        style={{ background: safe, color: ink }}
      >
        <div className="flex w-full items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">
              {title}
            </p>
            <p className="font-mono text-2xl font-bold">{safe}</p>
          </div>
          <span
            className="rounded-full bg-black/15 px-2.5 py-1 text-xs font-semibold backdrop-blur"
            style={{ color: ink }}
          >
            {temperatureLabel[temp]}
          </span>
        </div>
      </motion.div>

      <div className="divide-y divide-border">
        {rows.map((row) => {
          const isCopied = copied === row.value;
          return (
            <button
              key={row.key}
              type="button"
              onClick={() => void copy(row.value)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
              aria-label={`Copy ${row.key} value ${row.value}`}
            >
              <span className="w-10 shrink-0 text-xs font-semibold text-muted">
                {row.key}
              </span>
              <span className="flex-1 truncate font-mono text-sm text-ink">
                {row.value}
              </span>
              {isCopied ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <Check className="h-3.5 w-3.5" aria-hidden /> Copied
                </span>
              ) : (
                <Copy className="h-4 w-4 text-muted" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      {onSave && (
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => onSave(safe)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-soft py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add to palette
          </button>
        </div>
      )}
    </div>
  );
}
