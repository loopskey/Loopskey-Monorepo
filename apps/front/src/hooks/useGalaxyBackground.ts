"use client";

import { useEffect, useMemo, useState } from "react";
import { TGalaxyConfig, TThemeMode } from "@/types/element.types";
import { GALAXY_THEME_CONFIG } from "@utils/galaxy.constant";
import { GALAXY_LAYER_CLASS } from "@utils/galaxy.constant";
import { useTheme } from "next-themes";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useGalaxyBackground = () => {
  const { resolvedTheme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const mode: TThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  const config = useMemo<TGalaxyConfig>(
    () => ({
      ...GALAXY_THEME_CONFIG[mode],
      disableAnimation: prefersReducedMotion,
      mouseInteraction: !prefersReducedMotion,
    }),
    [mode, prefersReducedMotion],
  );
  return {
    config,
    isReady: Boolean(resolvedTheme),
    layerClassName: GALAXY_LAYER_CLASS[mode],
  };
};
