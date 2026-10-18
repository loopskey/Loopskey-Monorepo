"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TStaticInfoNavProps = {
  label: string;
  focusRing: string;
  sections: { id: string; title: string }[];
};

export const StaticInfoNav = ({
  label,
  sections,
  focusRing,
}: TStaticInfoNavProps) => {
  const [activeSectionId, setActiveSectionId] = useState(
    () => sections[0]?.id ?? "",
  );

  useEffect(() => {
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id)
          setActiveSectionId(visibleEntry.target.id);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5],
        rootMargin: "-120px 0px -45% 0px",
      },
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2 xl:max-h-[calc(100vh-20rem)] xl:flex-col xl:flex-nowrap xl:overflow-y-auto xl:pr-1">
        {sections.map((section, index) => {
          const isActive = activeSectionId === section.id;

          return (
            <li key={section.id} className="xl:w-full">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-300",
                  "xl:w-full xl:gap-3 xl:rounded-md xl:px-4 xl:py-3 xl:text-sm",
                  focusRing,
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold xl:flex",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                  )}
                >
                  {index + 1}
                </span>

                <span className="xl:line-clamp-1">{section.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
