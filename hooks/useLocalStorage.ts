"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * SSR-safe localStorage state. Starts from `initial` on the server and during
 * the first client render (avoiding hydration mismatches), then hydrates from
 * storage in an effect. Writes are persisted on change.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void, { hydrated: boolean }] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);
  keyRef.current = key;

  // Hydrate from storage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change (after hydration so we don't clobber stored data).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [value, hydrated]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next
    );
  }, []);

  return [value, set, { hydrated }];
}

/** Tiny id generator that doesn't depend on crypto being available. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
