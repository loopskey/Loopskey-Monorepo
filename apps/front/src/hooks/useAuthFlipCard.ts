"use client";

import { useCallback, useRef, useState } from "react";
import { useEffect, useLayoutEffect } from "react";
import { TUseAuthFlipCardOptions } from "@/types/hooks.types";

export const useAuthFlipCardHeight = ({
  minHeight = 400,
  dependencies = [],
}: TUseAuthFlipCardOptions = {}) => {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState(minHeight);

  const updateHeight = useCallback(() => {
    const frontHeight = frontRef.current?.scrollHeight ?? 0;
    const backHeight = backRef.current?.scrollHeight ?? 0;
    const nextHeight = Math.max(frontHeight, backHeight, minHeight);
    setHeight((currentHeight) => {
      if (currentHeight === nextHeight) return currentHeight;
      return nextHeight;
    });
  }, [minHeight]);

  useLayoutEffect(() => {
    updateHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateHeight, ...dependencies]);

  useEffect(() => {
    const frontElement = frontRef.current;
    const backElement = backRef.current;
    if (!frontElement || !backElement) return;
    let animationFrameId = 0;
    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        updateHeight();
      });
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(frontElement);
    resizeObserver.observe(backElement);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateHeight]);

  return {
    height,
    backRef,
    frontRef,
    updateHeight,
  };
};
