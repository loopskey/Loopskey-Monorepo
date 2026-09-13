"use client";

import { useEffect, useState } from "react";

export const useMediaQuery = (query: string): boolean | null => {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};
