"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reactive reduced-motion preference.
 *
 * The existing callers read `matchMedia(...).matches` once inside an effect,
 * which is enough for a one-shot animation but not for a component that has to
 * keep re-rendering — the chat transcript animates on every turn, so it has to
 * notice if the preference changes mid-session.
 *
 * Starts `false` so the server render and the first client render agree; the
 * effect corrects it before anything animates.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    setPrefersReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches);

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
};
