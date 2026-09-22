"use client";

import { useCallback, useRef, useState } from "react";
import { useEffect, useLayoutEffect } from "react";
import { TUseAuthStepHeightOptions } from "@/types/hooks.types";

export const useAuthStepHeight = ({
  stepKey,
  minHeight = 0,
}: TUseAuthStepHeightOptions) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(
    minHeight || undefined,
  );

  const measure = useCallback(() => {
    const contentHeight = contentRef.current?.scrollHeight ?? 0;
    setHeight(Math.max(contentHeight, minHeight));
  }, [minHeight]);

  useLayoutEffect(() => {
    measure();
  }, [stepKey, measure]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;
    let animationFrameId = 0;
    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(measure);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(contentElement);
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [stepKey, measure]);

  return { height, contentRef };
};
