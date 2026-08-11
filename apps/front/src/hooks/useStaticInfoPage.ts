"use client";

import { useEffect, useMemo, useState } from "react";
import { TStaticInfoPageContent } from "@/types/pages.types";
import { useI18n } from "@/hooks/useI18n";

import * as U from "@/utils/static-info-page.utils";

export const useStaticInfoPage = (pageKey: U.PageKey, trackActive: boolean) => {
  const { t, traw } = useI18n();
  const content = traw<TStaticInfoPageContent>(
    `staticPages.${pageKey}`,
    U.getStaticPageContent(pageKey),
  );
  const outline = useMemo(() => U.buildStaticInfoOutline(content), [content]);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    () => outline.sections[0]?.id ?? "",
  );
  const sectionIds = useMemo(
    () => outline.sections.map((section) => section.id),
    [outline],
  );
  useEffect(() => {
    if (!trackActive || !sectionIds.length) return;
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;
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

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sectionIds, trackActive]);

  useEffect(() => {
    setActiveSectionId((current) =>
      sectionIds.includes(current) ? current : (sectionIds[0] ?? ""),
    );
  }, [sectionIds]);

  return { t, outline, activeSectionId, setActiveSectionId };
};
