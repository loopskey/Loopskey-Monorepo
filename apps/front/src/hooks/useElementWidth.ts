"use client";

import { useEffect, useRef, useState } from "react";

export const useElementWidth = <TElement extends HTMLElement>() => {
  const ref = useRef<TElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
};
