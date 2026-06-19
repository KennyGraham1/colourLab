"use client";

import { Library, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PaletteCard } from "@/components/PaletteCard";
import { EmptyState, SectionHeading } from "@/components/SectionHeading";
import { useAppState } from "@/store/AppStateProvider";
import type { SectionProps } from "@/types";

export function PalettesSection({ onNavigate }: SectionProps) {
  const { hydrated, palettes, createPalette, toast } = useAppState();

  const handleNew = () => {
    createPalette();
    toast("New palette created");
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
