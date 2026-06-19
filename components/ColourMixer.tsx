"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb, Plus, Shuffle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SliderControl } from "@/components/SliderControl";
import { ColourSwatch } from "@/components/ColourSwatch";
import { ColourPicker } from "@/components/ColourPicker";
import { ResultPreview } from "@/components/ResultPreview";
import { cn } from "@/lib/cn";
import { randomPleasantHex } from "@/lib/color";
import { getColorName } from "@/lib/colorNames";
import {
  ADDITIVE_PRIMARIES,
  SUBTRACTIVE_PRIMARIES,
  mixHex,
  type MixInput,
  type MixMode,
} from "@/lib/mixing";
import { uid } from "@/hooks/useLocalStorage";
import { useAppState } from "@/store/AppStateProvider";

interface Channel {
  id: string;
  hex: string;
  /** Strength 0..1; the slider edits this as a 0..100 percentage. */
  weight: number;
}

const MIN_CHANNELS = 2;
const MAX_CHANNELS = 6;

/** Build the default channel list for a mode: that model's primaries at full strength. */
function primaryChannels(mode: MixMode): Channel[] {
  const primaries = mode === "additive" ? ADDITIVE_PRIMARIES : SUBTRACTIVE_PRIMARIES;
  return primaries.map((p) => ({ id: uid("ch"), hex: p.hex, weight: 1 }));
}

/** Educational copy that changes with the mixing model. */
const MODE_INFO: Record<
  MixMode,
  { title: string; body: string; takeaway: string }
> = {
  additive: {
    title: "Additive — light & screens",
    body:
      "Additive mixing combines emitted light, so every colour you add makes the result brighter. " +
      "Full red, green and blue light overlap to produce pure white. This is exactly how phone, " +
      "TV and monitor pixels build every colour you see.",
    takeaway: "More light = brighter. Red + Green + Blue light = white.",
  },
  subtractive: {
    title: "Subtractive — paint & ink",
    body:
      "Subtractive mixing models pigments that absorb light, so each colour you add removes more of it " +
      "and the result gets darker. Cyan, magenta and yellow together approach a dark, muddy near-black. " +
      "This is how paint, dye and printing inks behave on paper.",
    takeaway: "More pigment = darker. Cyan + Magenta + Yellow ink = muddy dark.",
  },
};

/**
 * The Colour Mixer: pick a model (additive light vs subtractive pigment), tune
 * the strength of each colour channel, and read the mixed result with HEX/RGB/HSL.
 */
export function ColourMixer() {
  const { quickSaveColor, toast } = useAppState();

  const [mode, setMode] = useState<MixMode>("subtractive");
  const [channels, setChannels] = useState<Channel[]>(() =>
    primaryChannels("subtractive")
  );
  const [activeId, setActiveId] = useState<string>(() => channels[0]?.id ?? "");

  // Switching model resets the channel list to that model's canonical primaries.
  const handleMode = (next: MixMode) => {
    if (next === mode) return;
    const fresh = primaryChannels(next);
    setMode(next);
    setChannels(fresh);
    setActiveId(fresh[0]?.id ?? "");
  };

  const updateChannel = (id: string, patch: Partial<Channel>) =>
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );

  const addChannel = () =>
    setChannels((prev) => {
      if (prev.length >= MAX_CHANNELS) return prev;
      const next: Channel = { id: uid("ch"), hex: randomPleasantHex(), weight: 0.6 };
      setActiveId(next.id);
      return [...prev, next];
    });

  const removeChannel = (id: string) =>
    setChannels((prev) => {
      if (prev.length <= MIN_CHANNELS) return prev;
      const next = prev.filter((c) => c.id !== id);
      // Keep a valid active channel if we removed the selected one.
      if (id === activeId) setActiveId(next[0]?.id ?? "");
      return next;
    });

  // Randomise every channel: a fresh pleasant hue and a random strength.
  const randomise = () =>
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        hex: randomPleasantHex(),
        weight: Math.round((0.3 + Math.random() * 0.7) * 100) / 100,
      }))
    );

  const activeChannel = channels.find((c) => c.id === activeId) ?? channels[0];

  const inputs: MixInput[] = useMemo(
    () => channels.map((c) => ({ hex: c.hex, weight: c.weight })),
    [channels]
  );
  const resultHex = useMemo(() => mixHex(inputs, mode), [inputs, mode]);

  const handleSave = (hex: string) => {
    quickSaveColor(hex, "Mixed");
    toast("Added to palette", hex);
  };

  const info = MODE_INFO[mode];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT: controls */}
      <Card>
        <CardHeader
          title="Mix colours"
          subtitle="Choose a model, then tune each colour's strength."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={randomise}
              aria-label="Random experiment: randomise every colour"
            >
              <Shuffle className="h-4 w-4" aria-hidden /> Random
            </Button>
          }
        />
        <CardBody className="space-y-5">
          {/* Mode segmented control */}
          <div
            role="group"
            aria-label="Mixing model"
            className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface-2 p-1"
          >
            <ModeButton
              active={mode === "additive"}
              onClick={() => handleMode("additive")}
              title="Additive"
              subtitle="Light / Screens"
            />
            <ModeButton
              active={mode === "subtractive"}
              onClick={() => handleMode("subtractive")}
              title="Subtractive"
              subtitle="Paint / Ink"
            />
          </div>

          {/* Channel list */}
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {channels.map((c) => {
                const pct = Math.round(c.weight * 100);
                const selected = c.id === activeChannel?.id;
                const name = getColorName(c.hex);
                return (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                  >
                    <ColourSwatch
                      hex={c.hex}
                      size="sm"
                      onClick={() => setActiveId(c.id)}
                      selected={selected}
                      title={`Select ${name} (${c.hex})`}
                    />
                    <div className="min-w-0 flex-1">
                      <SliderControl
                        label={`Strength of ${name}`}
                        hideLabel
                        value={pct}
                        valueLabel={`${pct}%`}
                        color={c.hex}
                        onChange={(v) => updateChannel(c.id, { weight: v / 100 })}
                      />
                      <span className="mt-0.5 flex items-baseline gap-1.5 text-xs">
                        <span className="truncate font-medium text-ink">
                          {name}
                        </span>
                        <span className="shrink-0 font-mono text-muted">
                          {c.hex}
                        </span>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChannel(c.id)}
                      disabled={channels.length <= MIN_CHANNELS}
                      aria-label={`Remove ${name}`}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <Button
            variant="outline"
            size="sm"
            onClick={addChannel}
            disabled={channels.length >= MAX_CHANNELS}
            aria-label="Add colour to the mix"
          >
            <Plus className="h-4 w-4" aria-hidden /> Add colour
          </Button>

          {/* Active channel editor */}
          {activeChannel && (
            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <p className="mb-3 text-sm font-medium text-ink">
                Editing{" "}
                <span className="text-brand">
                  {getColorName(activeChannel.hex)}
                </span>{" "}
                <span className="font-mono text-xs text-muted">
                  {activeChannel.hex}
                </span>
              </p>
              <ColourPicker
                value={activeChannel.hex}
                onChange={(hex) => updateChannel(activeChannel.id, { hex })}
                label="Active colour"
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* RIGHT: result, before→after, explanation */}
      <div className="space-y-6">
        <ResultPreview hex={resultHex} title="Mixed result" onSave={handleSave} />

        {/* Before → after strip */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center gap-4">
              <ul className="flex flex-wrap items-end gap-3">
                {channels.map((c) => (
                  <li key={c.id} className="flex flex-col items-center gap-1">
                    <ColourSwatch
                      hex={c.hex}
                      size="sm"
                      title={`${getColorName(c.hex)} (${c.hex})`}
                    />
                    <span className="font-mono text-[11px] tabular-nums text-muted">
                      {Math.round(c.weight * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-muted"
                aria-label="mixes to"
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <ColourSwatch hex={resultHex} size="md" />
                <span className="text-xs font-semibold text-ink">
                  {getColorName(resultHex)}
                </span>
                <span className="font-mono text-[11px] text-muted">
                  {resultHex}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Mode explanation */}
        <Card>
          <CardHeader
            title={info.title}
            icon={<Lightbulb className="h-4 w-4" aria-hidden />}
          />
          <CardBody className="space-y-3">
            <p className="text-sm leading-relaxed text-muted text-pretty">
              {info.body}
            </p>
            <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-medium text-brand">
              Takeaway: {info.takeaway}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/** One half of the additive/subtractive segmented control. */
function ModeButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-xl px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
        active
          ? "bg-surface text-ink shadow-soft"
          : "text-muted hover:text-ink"
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block text-xs text-muted">{subtitle}</span>
    </button>
  );
}
