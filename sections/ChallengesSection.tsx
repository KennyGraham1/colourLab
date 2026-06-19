"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { dailyChallenge, practiceChallenges } from "@/lib/challenges";
import { useAppState } from "@/store/AppStateProvider";
import type { SectionProps } from "@/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChallengeCard } from "@/components/ChallengeCard";

/** Confetti colours for the all-complete celebration. */
const CONFETTI = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#22C55E",
  "#06B6D4",
  "#EF4444",
  "#FACC15",
  "#14B8A6",
  "#A855F7",
];

/**
 * Celebration banner shown when every practice challenge has been passed.
 * Server renders nothing here (progress hydrates client-side), so there's no
 * hydration mismatch from the animation.
 */
function CompletionBanner({
  total,
  attempts,
  onNavigate,
}: {
  total: number;
  attempts: number;
  onNavigate: SectionProps["onNavigate"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand to-accent p-6 text-white shadow-glow sm:p-8"
    >
      {/* Falling confetti. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute top-0 h-2.5 w-2.5 rounded-sm"
            style={{ left: `${4 + (i * 92) / CONFETTI.length}%`, background: c }}
            initial={{ y: -24, opacity: 0, rotate: 0 }}
            animate={{ y: ["-24px", "260px"], opacity: [0, 1, 1, 0], rotate: 540 }}
            transition={{
              duration: 2.6,
              delay: i * 0.13,
              ease: "easeIn",
              repeat: Infinity,
              repeatDelay: 1.6,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Trophy className="h-7 w-7" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            All challenges complete
          </p>
          <h2 className="text-2xl font-bold">You&rsquo;re a Colour Master! 🎉</h2>
          <p className="mt-1 text-sm text-white/90 text-pretty">
            You passed all {total} practice challenges
            {attempts > 0 ? ` in ${attempts} attempts` : ""}. Your eye for colour
            is dialled in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("palettes")}
          className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-soft transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
        >
          View your palettes
        </button>
      </div>
    </motion.div>
  );
}

/** A small labelled metric used in the progress summary row. */
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        {icon}
      </span>
      <div>
        <p className="font-mono text-xl font-bold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}

export function ChallengesSection({ onNavigate }: SectionProps) {
  const { progress, resetProgress, toast } = useAppState();

  // Stable per-day seed, e.g. "2026-06-19".
  const dateKey = new Date().toISOString().slice(0, 10);
  const daily = dailyChallenge(dateKey);
  const practice = practiceChallenges();

  // Completed when every practice challenge has been passed.
  const allPassed =
    practice.length > 0 &&
    practice.every((c) => progress.completed.includes(c.id));

  const handleReset = () => {
    resetProgress();
    toast("Progress reset — fresh start!");
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practice"
        title="Challenges"
        description="Sharpen your eye for colour. Read each prompt, dial in your answer and get constructive, directional feedback on how to get closer."
      />

      {/* Celebration once every practice challenge is passed. */}
      <AnimatePresence>
        {allPassed && (
          <CompletionBanner
            total={practice.length}
            attempts={progress.attempts}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      {/* Featured daily challenge. */}
      <Card className="overflow-hidden border-brand/30 shadow-glow">
        <div className="flex items-center gap-2 border-b border-border bg-brand-soft/50 px-5 py-3">
          <CalendarDays className="h-4 w-4 text-brand" aria-hidden />
          <span className="text-sm font-semibold text-brand">
            Daily colour challenge
          </span>
          <span className="cl-chip ml-auto bg-brand text-xs font-semibold text-white">
            Daily
          </span>
          <span className="font-mono text-xs text-muted">{dateKey}</span>
        </div>
        <CardBody>
          <ChallengeCard challenge={daily} />
        </CardBody>
      </Card>

      {/* Progress summary. */}
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Stat
              icon={<Trophy className="h-5 w-5" aria-hidden />}
              label="Challenges passed"
              value={progress.completed.length}
            />
            <Stat
              icon={<Sparkles className="h-5 w-5" aria-hidden />}
              label="Total attempts"
              value={progress.attempts}
            />
          </div>
          <Button
            variant="danger"
            onClick={handleReset}
            disabled={progress.attempts === 0}
            aria-label="Reset all challenge progress"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset progress
          </Button>
        </CardBody>
      </Card>

      {/* Practice grid. */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Practice challenges
        </h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {practice.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>
    </div>
  );
}
