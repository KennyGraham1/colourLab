"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SectionProps } from "@/types";
import { LESSONS, LESSON_BY_ID } from "@/lib/theory";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { TheoryLesson } from "@/components/TheoryLesson";
import { cn } from "@/lib/cn";

/**
 * Colour theory learning mode: a navigable list of lessons (sticky side nav on
 * desktop, scrollable pill row on mobile) beside a detail pane.
 */
// onNavigate is part of SectionProps but this section navigates within itself.
export function TheorySection(_props: SectionProps) {
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0].id);
  const selected = LESSON_BY_ID[selectedId] ?? LESSONS[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Learn"
        title="Colour Theory"
        description="Work through the fundamentals of colour — from primaries and temperature to harmonies and tints. Each lesson has a hands-on demo you can play with."
      />

      {/* Mobile: horizontal scrollable pill row of lessons. */}
      <div className="lg:hidden">
        <div
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label="Lessons"
        >
          {LESSONS.map((lesson) => {
            const active = lesson.id === selectedId;
            return (
              <button
                key={lesson.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(lesson.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  active
                    ? "border-brand bg-brand text-white shadow-soft"
                    : "border-border bg-surface text-muted hover:text-ink"
                )}
              >
                {lesson.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Desktop: sticky lesson nav. */}
        <nav
          aria-label="Lessons"
          className="hidden lg:block"
        >
          <ul className="sticky top-6 space-y-1.5">
            {LESSONS.map((lesson) => {
              const active = lesson.id === selectedId;
              return (
                <li key={lesson.id}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => setSelectedId(lesson.id)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      active
                        ? "border-brand bg-brand-soft shadow-soft"
                        : "border-transparent bg-surface hover:border-border hover:bg-surface-2"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        active ? "text-brand" : "text-ink"
                      )}
                    >
                      {lesson.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted text-pretty">
                      {lesson.short}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Detail pane. */}
        <Card className="p-6 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <TheoryLesson lesson={selected} />
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
