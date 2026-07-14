"use client";

import { NEAT_GRADIENT_THEME_CONFIG } from "@utils/neat-gradient.constant";
import { NEAT_GRADIENT_BASE_CONFIG } from "@utils/neat-gradient.constant";
import { useEffect, useRef } from "react";
import { TNeatGradientMode } from "@/types/element.types";
import { NeatGradient } from "@firecms/neat";
import { useTheme } from "next-themes";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useNeatGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !resolvedTheme) return;
    const mode: TNeatGradientMode = resolvedTheme === "dark" ? "dark" : "light";
    const prefersReducedMotion =
      window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const gradient = new NeatGradient({
      ref: canvas,
      ...NEAT_GRADIENT_BASE_CONFIG,
      ...NEAT_GRADIENT_THEME_CONFIG[mode],
      licenseKey: process.env.NEXT_PUBLIC_NEAT_LICENSE_KEY,
      speed: prefersReducedMotion ? 0 : NEAT_GRADIENT_BASE_CONFIG.speed,
    });
    return () => gradient.destroy();
  }, [resolvedTheme]);

  return { canvasRef };
};
