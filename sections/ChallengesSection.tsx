"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Flame,
  RefreshCw,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import { dailyChallenge, makeChallenge, rankForPoints } from "@/lib/challenges";
import { useAppState } from "@/store/AppStateProvider";
import type { Challenge, ChallengeProgress, SectionProps } from "@/types";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Confetti } from "@/components/Confetti";

/**
 * Big celebration shown each time a milestone of challenges is solved.
 * Progress hydrates client-side, so this never renders on the server (no
 * hydration mismatch from the animation).
 */
function CompletionBanner({
  solvedCount,
  rankName,
  onContinue,
  onNavigate,
}: {
  solvedCount: number;
  rankName: string;
  onContinue: () => void;
  onNavigate: SectionProps["onNavigate"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand to-accent p-6 text-white shadow-glow sm:p-8"
    >
      <Confetti count={26} loop />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Trophy className="h-7 w-7" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Milestone reached
          </p>
          <h2 className="text-2xl font-bold">
            {solvedCount} challenges solved! 🎉
          </h2>
          <p className="mt-1 text-sm text-white/90 text-pretty">
            You&rsquo;re a {rankName} and on a roll — keep the streak going for
            bonus points.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-soft transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            Keep playing →
          </button>
          <button
            type="button"
            onClick={() => onNavigate("palettes")}
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            View palettes
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Small labelled metric (points / streak / passed). */
function Metric({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          accent ? "bg-orange-100 text-orange-500" : "bg-brand-soft text-brand"
        )}
        aria-hidden
      >
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

/** Rank, points, streak and rank-progress bar. */
function ProgressPanel({
  progress,
  onReset,
}: {
  progress: ChallengeProgress;
  onReset: () => void;
}) {
  const rank = rankForPoints(progress.points);
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-2xl">
              {rank.current.emoji}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Your rank
              </p>
              <p className="text-lg font-bold text-ink">{rank.current.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Metric
              icon={<Star className="h-5 w-5" />}
              value={progress.points}
              label="Points"
            />
            <Metric
              icon={<Flame className="h-5 w-5" />}
              value={progress.streak}
              label="Streak"
              accent
            />
            <Metric
              icon={<Trophy className="h-5 w-5" />}
              value={progress.completed.length}
              label="Passed"
            />
          </div>

          <Button
            variant="danger"
            onClick={onReset}
            disabled={progress.attempts === 0}
            aria-label="Reset all challenge progress"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset
          </Button>
        </div>

        {/* Rank progress. */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>{rank.current.name}</span>
            <span>
              {rank.next
                ? `${rank.pointsToNext} pts to ${rank.next.name}`
                : "Top rank reached 👑"}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${rank.progress * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const SET_SIZE = 6;
const MILESTONE = 6;

export function ChallengesSection({ onNavigate }: SectionProps) {
  const { progress, resetProgress, toast } = useAppState();

  // The live practice "slots". A solved challenge is swapped for a fresh one,
  // so the stream never runs out and is never the same twice.
  const seedRef = useRef(1000);
  const [slots, setSlots] = useState<Challenge[]>(() =>
    Array.from({ length: SET_SIZE }, (_, i) => makeChallenge(`start-${i}`))
  );
  const [solved, setSolved] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const [round, setRound] = useState(1);

  // The daily challenge is stable for the whole calendar day, then rotates.
  const dateKey = new Date().toISOString().slice(0, 10);
  const daily = useMemo(() => dailyChallenge(dateKey), [dateKey]);

  const rankName = rankForPoints(progress.points).current.name;

  // Celebrate every milestone of solved challenges.
  useEffect(() => {
    if (solved > 0 && solved % MILESTONE === 0) setShowFinale(true);
  }, [solved]);

  // Replace the solved challenge with a brand-new one.
  const handleSolved = useCallback((solvedId: string) => {
    seedRef.current += 1;
    const fresh = makeChallenge(`live-${seedRef.current}`);
    setSlots((prev) => prev.map((c) => (c.id === solvedId ? fresh : c)));
    setSolved((n) => n + 1);
  }, []);

  const handleReset = () => {
    resetProgress();
    toast("Progress reset — fresh start!");
  };

  const handleNewSet = () => {
    const base = seedRef.current;
    setSlots(
      Array.from({ length: SET_SIZE }, (_, i) => makeChallenge(`live-${base + 1 + i}`))
    );
    seedRef.current = base + SET_SIZE;
    setRound((r) => r + 1);
    setShowFinale(false);
    toast("A fresh set of challenges! 🎲");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Practice"
        title="Challenges"
        description="Sharpen your eye for colour. Solve a challenge and a fresh one takes its place — earn points and stars, build a streak, and climb the ranks."
      />

      {/* Celebration each time you hit a milestone of solved challenges. */}
      <AnimatePresence>
        {showFinale && (
          <CompletionBanner
            solvedCount={solved}
            rankName={rankName}
            onContinue={() => setShowFinale(false)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>

      {/* Rank / points / streak. */}
      <ProgressPanel progress={progress} onReset={handleReset} />

      {/* Featured daily challenge. */}
      <Card className="overflow-hidden border-brand/30 shadow-glow">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-brand-soft/50 px-5 py-3">
          <CalendarDays className="h-4 w-4 text-brand" aria-hidden />
          <span className="text-sm font-semibold text-brand">
            Daily colour challenge
          </span>
          <span className="cl-chip ml-auto bg-brand text-xs font-semibold text-white">
            Daily
          </span>
          <span className="font-mono text-xs text-muted">{dateKey}</span>
          <span className="w-full text-xs text-muted">
            One special puzzle each day — a new colour arrives tomorrow.
          </span>
        </div>
        <CardBody>
          <ChallengeCard challenge={daily} />
        </CardBody>
      </Card>

      {/* Endless practice grid — solved cards are replaced with fresh ones. */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Practice challenges
            <span className="ml-2 font-mono normal-case text-muted/70">
              {solved} solved · round {round}
            </span>
          </h2>
          <Button variant="secondary" size="sm" onClick={handleNewSet}>
            <RefreshCw className="h-4 w-4" aria-hidden /> New challenges
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {slots.map((challenge) => (
              <motion.div
                key={challenge.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onSolved={() => handleSolved(challenge.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
