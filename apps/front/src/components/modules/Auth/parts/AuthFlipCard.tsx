"use client";

import { useAuthFlipCardHeight } from "@/hooks/useAuthFlipCard";
import { TAuthFlipCard } from "@/types/auth-module.types";
import { cn } from "@lib/utils";

const AuthFlipCard = ({
  front,
  back,
  flipped,
  className,
  minHeight = 400,
}: TAuthFlipCard) => {
  const { height, frontRef, backRef } = useAuthFlipCardHeight({
    minHeight,
    dependencies: [front, back],
  });

  return (
    <div
      className={cn(
        "relative mt-5 w-full overflow-visible [perspective:1400px]",
        className,
      )}
      style={{ height }}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        <div
          ref={frontRef}
          className={cn(
            "absolute inset-x-0 top-0 w-full [backface-visibility:hidden]",
            flipped && "pointer-events-none",
          )}
          aria-hidden={flipped}
        >
          {front}
        </div>

        <div
          ref={backRef}
          className={cn(
            "absolute inset-x-0 top-0 w-full [backface-visibility:hidden] [transform:rotateY(180deg)]",
            !flipped && "pointer-events-none",
          )}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </div>
    </div>
  );
};

export default AuthFlipCard;
