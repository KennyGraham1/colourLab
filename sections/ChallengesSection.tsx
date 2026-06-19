"use client";

import { CalendarDays, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { dailyChallenge, practiceChallenges } from "@/lib/challenges";
import { useAppState } from "@/store/AppStateProvider";
import type { SectionProps } from "@/types";
import { SectionHeading } from "@/components/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChallengeCard } from "@/components/ChallengeCard";

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
