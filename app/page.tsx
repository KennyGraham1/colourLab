"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/Toaster";
import { HomeSection } from "@/sections/HomeSection";
import { MixerSection } from "@/sections/MixerSection";
import { TheorySection } from "@/sections/TheorySection";
import { WheelSection } from "@/sections/WheelSection";
import { VariantsSection } from "@/sections/VariantsSection";
import { ChallengesSection } from "@/sections/ChallengesSection";
import { PalettesSection } from "@/sections/PalettesSection";
import type { SectionId, SectionProps } from "@/types";

const SECTIONS: Record<SectionId, (props: SectionProps) => JSX.Element> = {
  home: HomeSection,
  mixer: MixerSection,
  theory: TheorySection,
  wheel: WheelSection,
  variants: VariantsSection,
  challenges: ChallengesSection,
  palettes: PalettesSection,
};

export default function Page() {
  const [section, setSection] = useState<SectionId>("home");
  const navigate = (id: SectionId) => {
    setSection(id);
    // Bring the user back to the top of the content when switching sections.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const Active = SECTIONS[section];

  return (
    <>
      <AppShell active={section} onNavigate={navigate}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Active onNavigate={navigate} />
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <Toaster />
    </>
  );
}
