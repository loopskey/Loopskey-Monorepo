"use client";

import { TGalaxyBackgroundProps } from "@/types/element.types";
import { GALAXY_BACKDROP_CLASS } from "@utils/galaxy.constant";
import { useGalaxyBackground } from "@hooks/useGalaxyBackground";
import { Galaxy } from "@ui/galaxy";
import { cn } from "@/lib/utils";

export const GalaxyBackground = ({
  className,
  withBottomFade = true,
}: TGalaxyBackgroundProps) => {
  const { config, isReady, layerClassName } = useGalaxyBackground();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-background",
        className,
      )}
    >
      <div className={cn("absolute inset-0", GALAXY_BACKDROP_CLASS)} />

      {isReady && (
        <div className={cn("absolute inset-0", layerClassName)}>
          <Galaxy {...config} mouseTarget="window" />
        </div>
      )}

      {withBottomFade && (
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
};
