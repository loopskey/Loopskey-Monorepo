"use client";

import { TLearningParticlesBackgroundProps } from "@/types/element.types";
import { useNeatGradient } from "@hooks/useNeatGradient";
import { cn } from "@/lib/utils";

export const LearningParticlesBackground = ({
  className,
  withBottomFade = true,
}: TLearningParticlesBackgroundProps) => {
  const { canvasRef } = useNeatGradient();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-[#210751]",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ transform: "scaleX(-1)" }}
      />

      {withBottomFade && (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
};
