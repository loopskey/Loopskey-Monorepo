"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { TLearningParticlesBackgroundProps } from "@/types/element.types";
import { FloatingLines } from "@ui/floating-lines";
import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Static config kept at module scope so the FloatingLines WebGL effect, whose
// dependency array includes these, is not torn down and recreated on every
// parent render.
const DARK_LINES_GRADIENT = ["#e945f5", "#6f6f6f", "#6a6a6a"];
const DARK_ENABLED_WAVES: Array<"top" | "middle" | "bottom"> = [
  "top",
  "middle",
  "bottom",
];

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
};

/**
 * Theme-aware decorative background. Light mode renders a static, low-noise
 * white surface with a subtle electric-blue tint and never touches WebGL; dark
 * mode renders the animated FloatingLines background, falling back to a static
 * dark gradient when reduced motion is requested or WebGL is unavailable. Only
 * one of the two is ever active.
 */
export const LearningParticlesBackground = ({
  className,
  withBottomFade = true,
}: TLearningParticlesBackgroundProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [contextFailed, setContextFailed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => setWebglAvailable(isWebGLAvailable()), []);

  const handleContextError = useCallback(() => setContextFailed(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  // Never initialize WebGL in light mode, under reduced motion, without WebGL,
  // or after a lost context.
  const showLines =
    isDark && !reducedMotion && webglAvailable && !contextFailed;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Light: static, low-noise white with a subtle electric-blue tint. */}
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,112,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(99,154,255,0.10),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,246,255,0.88))]" />
      </div>

      {/* Dark: near-black base, with FloatingLines only when it is safe to run. */}
      <div className="absolute inset-0 hidden bg-[#09090b] dark:block">
        {showLines ? (
          <FloatingLines
            enabledWaves={DARK_ENABLED_WAVES}
            lineCount={8}
            lineDistance={8}
            bendRadius={8}
            bendStrength={-2}
            interactive
            parallax
            animationSpeed={1}
            linesGradient={DARK_LINES_GRADIENT}
            pointerTarget="window"
            onContextError={handleContextError}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,69,245,0.16),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(111,111,111,0.12),transparent_50%)]" />
        )}
      </div>

      {withBottomFade && (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
};
