"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAppState } from "@/store/AppStateProvider";
import { readableTextColor } from "@/lib/color";

/** Renders the global toast stack. Mount once near the app root. */
export function Toaster() {
  const { toasts, dismissToast } = useAppState();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-ink/95 px-4 py-2.5 text-sm font-medium text-white shadow-lift backdrop-blur"
          >
            {t.hex ? (
              <span
                className="grid h-5 w-5 place-items-center rounded-md ring-1 ring-white/30"
                style={{ background: t.hex }}
              >
                <Check
                  className="h-3 w-3"
                  style={{ color: readableTextColor(t.hex) }}
                  aria-hidden
                />
              </span>
            ) : (
              <Check className="h-4 w-4 text-emerald-400" aria-hidden />
            )}
            <span>{t.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
