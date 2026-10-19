"use client";

import { useEffect, useRef } from "react";
import { TSplitTextProps } from "@/types/element.types";
import { cn } from "@/lib/utils";

const ANIMATION_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export const SplitText = ({
  text,
  tag = "p",
  delay = 50,
  className = "",
  startDelay = 0,
  duration = 1.25,
  threshold = 0.1,
  ease = "power3.out",
  splitType = "chars",
  textAlign = "center",
  rootMargin = "-100px",
  inheritGradient = false,
  to = { opacity: 1, y: 0 },
  onLetterAnimationComplete,
  from = { opacity: 0, y: 40 },
}: TSplitTextProps) => {
  const ref = useRef<HTMLElement>(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  const fromKey = JSON.stringify(from);
  const toKey = JSON.stringify(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return;
    if (!window.matchMedia(ANIMATION_QUERY).matches) {
      onCompleteRef.current?.();
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const ready =
      document.fonts.status === "loaded"
        ? Promise.resolve()
        : document.fonts.ready;

    void ready
      .then(() => import("@elements/split-text-animation"))
      .then(({ animateSplitText }) => {
        if (cancelled || !ref.current) return;
        cleanup = animateSplitText(ref.current, {
          text,
          delay,
          startDelay,
          duration,
          ease,
          splitType,
          from,
          to,
          threshold,
          rootMargin,
          inheritGradient,
          onComplete: () => onCompleteRef.current?.(),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text,
    ease,
    delay,
    toKey,
    fromKey,
    duration,
    splitType,
    threshold,
    startDelay,
    rootMargin,
    inheritGradient,
  ]);

  const Tag = tag as React.ElementType;

  return (
    <Tag
      ref={ref}
      aria-hidden="true"
      style={{ textAlign, wordWrap: "break-word" }}
      className={cn(
        "split-parent relative inline-block overflow-hidden whitespace-normal",
        className,
      )}
    >
      {text}
    </Tag>
  );
};

export const countChars = (text: string) => text.length;
