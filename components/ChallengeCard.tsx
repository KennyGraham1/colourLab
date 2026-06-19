"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";
import { randomPleasantHex } from "@/lib/color";
import { getColorName } from "@/lib/colorNames";
import { evaluateGuess, PASS_THRESHOLD, type Feedback } from "@/lib/challenges";
import { useAppState } from "@/store/AppStateProvider";
import type { Challenge } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ColourPicker } from "@/components/ColourPicker";
import { ColourSwatch } from "@/components/ColourSwatch";

/** Visual treatment for each difficulty level. Paired with the text label so the
 * meaning is never carried by colour alone. */
const DIFFICULTY_CHIP: Record<Challenge["difficulty"], string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-rose-50 text-rose-700 border-rose-200",
};

/** A calm, neutral starting guess so "match" challenges aren't pre-solved. */
const NEUTRAL_GUESS = "#9CA3AF";

/**
 * A single, self-contained practice challenge: shows the reference colours,
 * lets the user dial in a guess, scores it with constructive directional tips
 * and records the attempt to global progress.
 */
export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { recordAttempt, progress } = useAppState();

  // For "match" the target is shown, so we start from a neutral grey (the user
  // must actually recreate it). For directional challenges the user works from
  // the base colour toward the hidden goal, so we seed the guess with the base.
  const initialGuess =
    challenge.type === "match" ? NEUTRAL_GUESS : challenge.baseHex;

  const [guessHex, setGuessHex] = useState(initialGuess);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const best = progress.best[challenge.id];
  const showTarget = challenge.type === "match";

  const handleCheck = () => {
    const result = evaluateGuess(challenge, guessHex);
    recordAttempt(challenge.id, result.score);
    setFeedback(result);
  };

  const handleReset = () => {
    setFeedback(null);
    // Re-randomise the guess so a fresh attempt isn't anchored to the last one.
    setGuessHex(challenge.type === "match" ? randomPleasantHex() : challenge.baseHex);
  };

  return (
    <Card as="article" className="flex h-full flex-col">
      <CardHeader
        icon={<Target className="h-5 w-5" aria-hidden />}
        title={challenge.title}
        subtitle={challenge.prompt}
        action={
          <span
            className={cn(
              "cl-chip shrink-0 border text-xs font-semibold capitalize",
              DIFFICULTY_CHIP[challenge.difficulty]
            )}
          >
            {challenge.difficulty}
          </span>
        }
      />

      <CardBody className="flex flex-1 flex-col gap-5">
        {/* Reference colours: always the start, plus the target for "match". */}
        <div className="flex flex-wrap items-start gap-5">
          <ColourSwatch
            hex={challenge.baseHex}
            label={`Start · ${getColorName(challenge.baseHex)}`}
            showHex
            size="md"
          />
          {showTarget && (
            <ColourSwatch
              hex={challenge.targetHex}
              label={`Target · ${getColorName(challenge.targetHex)}`}
              showHex
              size="md"
            />
          )}
          {best !== undefined && (
            <div className="ml-auto self-center text-right">
              <p className="text-xs font-medium text-muted">Best score</p>
              <p className="font-mono text-lg font-bold text-ink">
                {best}
                <span className="text-sm text-muted"> / 100</span>
              </p>
            </div>
          )}
        </div>

        {/* Guess input. */}
        <div className="rounded-2xl border border-border bg-surface-2/40 p-4">
          <ColourPicker
            value={guessHex}
            onChange={(hex) => {
              setGuessHex(hex);
              // Clear stale feedback the moment the guess changes.
              if (feedback) setFeedback(null);
            }}
            label="Your colour"
            showPresets={false}
          />
        </div>

        {/* Before / after context. */}
        <div className="flex items-center justify-center gap-4">
          <ColourSwatch
            hex={guessHex}
            label={`Your guess · ${getColorName(guessHex)}`}
            showHex
            size="md"
          />
          <span className="text-muted" aria-hidden>
            →
          </span>
          <ColourSwatch
            hex={showTarget ? challenge.targetHex : challenge.baseHex}
            label={
              showTarget
                ? `Target · ${getColorName(challenge.targetHex)}`
                : `Start · ${getColorName(challenge.baseHex)}`
            }
            showHex
            size="md"
          />
        </div>

        {/* Actions. */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCheck} className="flex-1">
            <Check className="h-4 w-4" aria-hidden /> Check answer
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            aria-label="Try again and reset feedback"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Try again
          </Button>
        </div>

        {/* Feedback. */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={`${feedback.score}-${feedback.headline}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              role="status"
              aria-live="polite"
              className={cn(
                "mt-auto rounded-2xl border p-4",
                feedback.passed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-border bg-surface-2/60"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    feedback.passed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-brand-soft text-brand"
                  )}
                  aria-hidden
                >
                  {feedback.passed ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      feedback.passed ? "text-emerald-800" : "text-ink"
                    )}
                  >
                    {feedback.headline}
                  </p>

                  {/* Score: number + accessible progress bar. */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted">
                      <span>
                        Score{" "}
                        <span className="font-mono text-sm font-bold text-ink">
                          {feedback.score}
                        </span>
                        <span className="text-muted"> / 100</span>
                      </span>
                      <span>
                        {feedback.passed
                          ? "Passed"
                          : `Pass at ${PASS_THRESHOLD}`}
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2"
                      role="progressbar"
                      aria-label="Match score"
                      aria-valuenow={feedback.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          feedback.passed ? "bg-emerald-500" : "bg-brand"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${feedback.score}%` }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Constructive, directional tips. */}
                  {feedback.tips.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {feedback.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-ink"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                            aria-hidden
                          />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}
