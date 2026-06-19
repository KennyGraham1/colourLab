"use client";

import { useCallback, useRef, useState } from "react";

/** Copy-to-clipboard with a transient "copied" flag and a graceful fallback. */
export function useCopy(resetMs = 1400) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        setCopied(text);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copy, copied };
}
