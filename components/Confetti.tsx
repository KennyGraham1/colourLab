"use client";

import { motion } from "framer-motion";

const COLORS = [
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
 * A lightweight confetti burst that fills its (relative) parent. Set `loop` for
 * a repeating celebration, or leave it off for a one-shot burst on mount.
 * Respects the global prefers-reduced-motion handling.
 */
export function Confetti({
  count = 16,
  loop = false,
  fall = 320,
}: {
  count?: number;
  loop?: boolean;
  /** How far (px) the pieces fall. */
  fall?: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const left = ((i + 0.5) / count) * 100;
        const delay = (i % 6) * 0.1;
        const drift = (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 6);
        const square = i % 3 === 0;
        return (
          <motion.span
            key={i}
            className={square ? "absolute top-0 h-2.5 w-2.5" : "absolute top-0 h-2 w-3"}
            style={{
              left: `${left}%`,
              background: color,
              borderRadius: square ? 2 : 9999,
            }}
            initial={{ y: -24, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: ["-24px", `${fall}px`],
              x: [0, drift],
              opacity: [0, 1, 1, 0],
              rotate: [0, 540],
            }}
            transition={{
              duration: 2.4,
              delay,
              ease: "easeIn",
              repeat: loop ? Infinity : 0,
              repeatDelay: loop ? 1.5 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
