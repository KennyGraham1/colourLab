"use client";

import { Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ColourMixer } from "@/components/ColourMixer";
import { SectionHeading } from "@/components/SectionHeading";
import type { SectionProps } from "@/types";

/** The Colour Mixer section: heading + the interactive mixing tool. */
export function MixerSection({ onNavigate }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Mixer"
        title="Colour Mixer"
        description="Combine colours with light (additive) or pigment (subtractive) models, tune each one's strength, and read the mixed result as HEX, RGB and HSL."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("palettes")}
          >
            <Layers className="h-4 w-4" aria-hidden /> View palettes
          </Button>
        }
      />
      <ColourMixer />
    </div>
  );
}
