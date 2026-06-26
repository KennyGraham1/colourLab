"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/**
 * A 0–3 star rating. `animate` pops the earned stars in one-by-one (used in the
 * win feedback). Always exposes an accessible label so it isn't colour-only.
 */
export function Stars({
  value,
  max = 3,
  size = "md",
  animate = false,
  className,
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const earned = i < value;
        return (
          <motion.span
            key={i}
            initial={animate ? { scale: 0, rotate: -30 } : false}
            animate={animate ? { scale: 1, rotate: 0 } : undefined}
            transition={{
              delay: animate ? 0.12 * i : 0,
              type: "spring",
              stiffness: 380,
              damping: 14,
            }}
          >
            <Star
              className={cn(
                SIZES[size],
                earned
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-border"
              )}
              aria-hidden
            />
          </motion.span>
        );
      })}
    </span>
  );
}
