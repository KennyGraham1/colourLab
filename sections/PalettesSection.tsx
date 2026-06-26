"use client";

import { Library, Paintbrush, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PaletteCard } from "@/components/PaletteCard";
import { EmptyState, SectionHeading } from "@/components/SectionHeading";
import { useAppState } from "@/store/AppStateProvider";
import { describeColorName } from "@/lib/colorNames";
import type { SectionProps } from "@/types";

export function PalettesSection({ onNavigate }: SectionProps) {
  const { hydrated, palettes, createPalette, toast, themeHex, resetTheme } =
    useAppState();

  const handleNew = () => {
    createPalette();
    toast("New palette created");
  };

  const handleResetTheme = () => {
    resetTheme();
    toast("Theme reset to default");
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Library"
        title="Saved Palettes"
        description="Build and keep colour sets for your projects. Palettes are saved in this browser, so they stay with you between visits."
        action={
          <Button onClick={handleNew} aria-label="Create a new palette">
            <Plus className="h-4 w-4" aria-hidden />
            New palette
          </Button>
        }
      />

      {/* App theme control. */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft">
        <span
          className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-inset ring-black/10"
          style={{ background: themeHex }}
          aria-hidden
        />
        <div className="mr-auto min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Paintbrush className="h-4 w-4 text-brand" aria-hidden /> App theme
          </p>
          <p className="text-xs text-muted text-pretty">
            Hover a colour below and click the brush to recolour the whole app.
            Currently {describeColorName(themeHex)} ({themeHex}).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetTheme}>
          <RotateCcw className="h-4 w-4" aria-hidden /> Reset theme
        </Button>
      </div>

      {!hydrated ? (
        // Subtle skeleton while localStorage loads, avoiding an empty-state flash.
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-border bg-surface-2/60"
              aria-hidden
            />
          ))}
          <span className="sr-only">Loading palettes…</span>
        </div>
      ) : palettes.length === 0 ? (
        <EmptyState
          icon={<Library className="h-6 w-6" aria-hidden />}
          title="No palettes yet"
          description="Create an empty palette to start collecting colours, or head to the Mixer to craft some first."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4" aria-hidden />
                Create palette
              </Button>
              <Button variant="outline" onClick={() => onNavigate("mixer")}>
                <Sparkles className="h-4 w-4" aria-hidden />
                Open Mixer
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {palettes.map((p) => (
            <PaletteCard key={p.id} palette={p} />
          ))}
        </div>
      )}
    </div>
  );
}
