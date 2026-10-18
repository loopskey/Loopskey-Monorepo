"use client";

import { useEffect, useRef, useState } from "react";
import { TRevealOnScrollProps } from "@/types/element.types";
import { cn } from "@/lib/utils";

type TRevealPhase = "static" | "hidden" | "shown";

const getHiddenClass = (direction: TRevealOnScrollProps["direction"]) => {
  switch (direction) {
    case "left":
      return "-translate-x-12 translate-y-0";
    case "right":
      return "translate-x-12 translate-y-0";
    case "down":
      return "-translate-y-12 translate-x-0";
    case "up":
    default:
      return "translate-y-12 translate-x-0";
  }
};

export const RevealOnScroll = ({
  children,
  className,
  delay = 0,
  direction = "up",
}: TRevealOnScrollProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<TRevealPhase>("static");

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    setPhase("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase("shown");
        observer.unobserve(entry.target);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: phase === "shown" ? `${delay}ms` : "0ms" }}
      className={cn(
        phase === "hidden" && `${getHiddenClass(direction)} opacity-0`,
        phase === "shown" &&
          "translate-x-0 translate-y-0 opacity-100 transition-all duration-700 ease-out will-change-transform",
        className,
      )}
    >
      {children}
    </div>
  );
};
