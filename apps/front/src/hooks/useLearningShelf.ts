"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import type { FocusEvent, PointerEvent } from "react";

type TUseLearningShelfArgs = {
  itemCount: number;
  onSequenceEnd: () => void;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const IN_VIEW_THRESHOLD = 0.35;

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const getServerReducedMotion = () => false;

export const useLearningShelf = ({
  itemCount,
  onSequenceEnd,
}: TUseLearningShelfArgs) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [requestedIndex, setRequestedIndex] = useState(0);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  const activeIndex = Math.min(requestedIndex, itemCount - 1);
  const lastIndex = itemCount - 1;

  const isRunning =
    !prefersReducedMotion &&
    !isUserPaused &&
    !isHovered &&
    !hasKeyboardFocus &&
    isInView &&
    isPageVisible;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: IN_VIEW_THRESHOLD },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () =>
      setIsPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () =>
      document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      startTransition(() => {
        setRequestedIndex(((index % itemCount) + itemCount) % itemCount);
      });
    },
    [itemCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);

  const goPrevious = useCallback(
    () => goTo(activeIndex - 1),
    [goTo, activeIndex],
  );

  const advance = useCallback(() => {
    if (activeIndex >= lastIndex) {
      onSequenceEnd();
      return;
    }
    goTo(activeIndex + 1);
  }, [activeIndex, lastIndex, onSequenceEnd, goTo]);

  const togglePause = useCallback(() => {
    setHasKeyboardFocus(false);
    setIsUserPaused((current) => !current);
  }, []);

  const handlePointerEnter = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => setIsHovered(false), []);

  const handleFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    setHasKeyboardFocus(event.target.matches(":focus-visible"));
  }, []);

  const handleBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setHasKeyboardFocus(false);
  }, []);

  return {
    goTo,
    goNext,
    advance,
    isRunning,
    goPrevious,
    activeIndex,
    handleBlur,
    handleFocus,
    isUserPaused,
    togglePause,
    containerRef,
    handlePointerEnter,
    handlePointerLeave,
    prefersReducedMotion,
  };
};
