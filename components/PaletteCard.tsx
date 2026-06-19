"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ColourPicker } from "@/components/ColourPicker";
import { ColourSwatch } from "@/components/ColourSwatch";
import { useCopy } from "@/hooks/useCopy";
import { useAppState } from "@/store/AppStateProvider";
import { describeColor, normalizeHex } from "@/lib/color";
import { getColorName } from "@/lib/colorNames";
import { cn } from "@/lib/cn";
import type { Palette } from "@/types";

/**
 * Turn a palette name into a safe-ish file stem, e.g. "Sunset Study #2" -> "sunset-study-2".
 * Falls back to "palette" when nothing usable remains.
 */
function fileStem(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "palette";
}

/**
 * Set ctx.font to the largest size (down to a floor) at which `text` fits in
 * `maxWidth`, so colour names never overflow their block in the PNG export.
 */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  family: string,
  weight = ""
): void {
  let size = baseSize;
  const set = () => (ctx.font = `${weight} ${size}px ${family}`.trim());
  set();
  while (ctx.measureText(text).width > maxWidth && size > 9) {
    size -= 1;
    set();
  }
}

/** Trigger a browser download for a Blob using a temporary anchor. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick so the click has a chance to start.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function PaletteCard({ palette }: { palette: Palette }) {
  const {
    renamePalette,
    addColorToPalette,
    removeColorFromPalette,
    clearPalette,
    deletePalette,
    toast,
  } = useAppState();
  const { copy, copied } = useCopy();

  // Local draft for the editable name so typing feels instant; commit on blur.
  const [name, setName] = useState(palette.name);
  const [adding, setAdding] = useState(false);
  const [draftHex, setDraftHex] = useState("#4D96FF");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmTimer = useRef<number | null>(null);

  // Keep the local name in sync if the palette is renamed elsewhere.
  useEffect(() => {
    setName(palette.name);
  }, [palette.name]);

  useEffect(
    () => () => {
      if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    },
    []
  );

  const colors = palette.colors;
  const hexList = colors.map((c) => c.hex);
  const allHexes = hexList.join(" ");
  const copiedAll = copied === allHexes && allHexes.length > 0;

  const commitName = () => {
    const next = name.trim();
    if (!next) {
      // Don't allow an empty name; revert to the stored value.
      setName(palette.name);
      return;
    }
    if (next !== palette.name) renamePalette(palette.id, next);
  };

  const handleAdd = () => {
    const norm = normalizeHex(draftHex);
    if (!norm) return;
    addColorToPalette(palette.id, norm);
    toast(`Added ${getColorName(norm)}`, norm);
  };

  const handleCopyAll = async () => {
    if (!allHexes) return;
    const ok = await copy(allHexes);
    if (ok) toast(`Copied ${colors.length} colour${colors.length === 1 ? "" : "s"}`);
  };

  const handleExportJson = () => {
    // A clean, human-friendly export: every colour carries its name + values,
    // not just a hex code.
    const exportData = {
      name: palette.name,
      colorCount: colors.length,
      colors: colors.map((c) => {
        const safe = normalizeHex(c.hex) ?? c.hex;
        const d = describeColor(safe);
        return {
          hex: safe,
          name: getColorName(safe),
          ...(c.name ? { label: c.name } : {}),
          rgb: d.rgb,
          hsl: d.hsl,
        };
      }),
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${fileStem(palette.name)}.json`);
    toast("Exported JSON");
  };

  const handleExportPng = () => {
    if (colors.length === 0) {
      toast("Add a colour to export an image");
      return;
    }

    // Lay out each colour as a tall block with its NAME and hex label underneath.
    const block = 160;
    const labelBand = 60;
    const pad = 10;
    const sans =
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

    const canvas = document.createElement("canvas");
    canvas.width = block * colors.length;
    canvas.height = block + labelBand;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast("Could not render image");
      return;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    colors.forEach((c, i) => {
      const safe = normalizeHex(c.hex) ?? "#000000";
      const x = i * block;
      const cx = x + block / 2;
      // Colour block.
      ctx.fillStyle = safe;
      ctx.fillRect(x, 0, block, block);
      // Dark label band so name + hex are always legible.
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(x, block, block, labelBand);
      // Colour name (bold, auto-sized to fit the block width).
      ctx.fillStyle = "#ffffff";
      fitFont(ctx, getColorName(safe), block - pad * 2, 15, sans, "600");
      ctx.fillText(getColorName(safe), cx, block + 22);
      // Hex code below the name.
      ctx.fillStyle = "#cbd5e1";
      ctx.font = `13px ${mono}`;
      ctx.fillText(safe, cx, block + 42);
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        toast("Could not render image");
        return;
      }
      downloadBlob(blob, `${fileStem(palette.name)}.png`);
      toast("Exported PNG");
    }, "image/png");
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      // Auto-cancel the confirm state if the user walks away.
      confirmTimer.current = window.setTimeout(
        () => setConfirmingDelete(false),
        4000
      );
      return;
    }
    if (confirmTimer.current) window.clearTimeout(confirmTimer.current);
    deletePalette(palette.id);
  };

  const nameId = `palette-name-${palette.id}`;

  return (
    <Card as="article" className="flex h-full flex-col">
      <CardHeader
        title={
          <div className="flex flex-col">
            <label htmlFor={nameId} className="sr-only">
              Palette name
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setName(palette.name);
                  e.currentTarget.blur();
                }
              }}
              spellCheck={false}
              placeholder="Palette name"
              aria-label="Palette name"
              className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-base font-semibold text-ink outline-none transition hover:border-border focus:border-brand focus:bg-surface focus-visible:ring-2 focus-visible:ring-brand/30"
            />
          </div>
        }
        subtitle={
          <span className="px-1">
            {colors.length === 0
              ? "No colours yet"
              : `${colors.length} colour${colors.length === 1 ? "" : "s"}`}
          </span>
        }
      />

      <CardBody className="flex flex-1 flex-col gap-4">
        {/* Colour grid */}
        {colors.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-6 text-center text-sm text-muted">
            This palette is empty. Add a colour below to get started.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <AnimatePresence initial={false}>
              {colors.map((c) => {
                const colorLabel = c.name ?? getColorName(c.hex);
                return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="group relative"
                >
                  <ColourSwatch
                    hex={c.hex}
                    label={colorLabel}
                    showHex
                    copyable
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorFromPalette(palette.id, c.id)}
                    aria-label={`Remove ${colorLabel}`}
                    title="Remove colour"
                    className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-border bg-surface text-muted opacity-0 shadow-soft transition hover:text-rose-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {/* Add colour */}
        <div>
          {adding ? (
            <div className="space-y-3 rounded-2xl border border-border bg-surface-2/50 p-3">
              <ColourPicker
                value={draftHex}
                onChange={setDraftHex}
                label="New colour"
                showPresets={false}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAdd}>
                  <Plus className="h-4 w-4" aria-hidden />
                  Add to palette
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdding(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdding(true)}
              aria-label="Add a colour to this palette"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add colour
            </Button>
          )}
        </div>

        {/* Actions row (pinned to the bottom of the card) */}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyAll}
            disabled={colors.length === 0}
            aria-label="Copy all hex codes"
          >
            {copiedAll ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            {copiedAll ? "Copied" : "Copy"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJson}
            aria-label="Export palette as JSON"
          >
            <Download className="h-4 w-4" aria-hidden />
            JSON
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPng}
            disabled={colors.length === 0}
            aria-label="Export palette as PNG image"
          >
            <ImageIcon className="h-4 w-4" aria-hidden />
            PNG
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => clearPalette(palette.id)}
            disabled={colors.length === 0}
            aria-label="Remove all colours from this palette"
          >
            Clear
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            onBlur={() => setConfirmingDelete(false)}
            aria-label={
              confirmingDelete
                ? "Confirm delete palette"
                : "Delete this palette"
            }
            className={cn(confirmingDelete && "ring-2 ring-rose-300")}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {confirmingDelete ? "Confirm" : "Delete"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
