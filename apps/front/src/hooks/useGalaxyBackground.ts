"use client";

import { useEffect, useMemo, useState } from "react";
import { TGalaxyConfig } from "@/types/element.types";
import { GALAXY_LAYER_CLASS } from "@utils/galaxy.constant";
import { GALAXY_CONFIG } from "@utils/galaxy.constant";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useGalaxyBackground = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const config = useMemo<TGalaxyConfig>(
    () => ({
      ...GALAXY_CONFIG,
      disableAnimation: prefersReducedMotion,
      mouseInteraction: !prefersReducedMotion,
    }),
    [prefersReducedMotion],
  );

  return {
    config,
    isReady: mounted,
    layerClassName: GALAXY_LAYER_CLASS,
  };
};
