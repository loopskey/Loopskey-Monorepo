"use client";

import { TLearningParticlesBackgroundProps } from "@/types/element.types";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import dynamic from "next/dynamic";

const FloatingLines = dynamic(
  () => import("@ui/floating-lines").then((module) => module.FloatingLines),
  { ssr: false },
);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,112,255,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(99,154,255,0.10),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,246,255,0.88))]" />
      </div>

      <div className="absolute inset-0 hidden bg-background dark:block">
        {showLines ? (
          <FloatingLines
            parallax
            interactive
            lineCount={8}
            bendRadius={8}
            lineDistance={8}
            bendStrength={-2}
            animationSpeed={1}
            pointerTarget="window"
            enabledWaves={DARK_ENABLED_WAVES}
            linesGradient={DARK_LINES_GRADIENT}
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
