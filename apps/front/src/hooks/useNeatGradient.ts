"use client";

import { NEAT_GRADIENT_CONFIG } from "@utils/neat-gradient.constant";
import { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useNeatGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefersReducedMotion =
      window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const gradient = new NeatGradient({
      ref: canvas,
      ...NEAT_GRADIENT_CONFIG,
      licenseKey: process.env.NEXT_PUBLIC_NEAT_LICENSE_KEY,
      speed: prefersReducedMotion ? 0 : NEAT_GRADIENT_CONFIG.speed,
    });
    return () => gradient.destroy();
  }, []);

  return { canvasRef };
};
