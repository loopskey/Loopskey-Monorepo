"use client";

import { useEffect, useMemo, useState } from "react";
import { buildStaticInfoOutline } from "@templates/static-info-page.utils";
import { PageKey } from "@templates/static-info-page.utils";
import { useI18n } from "@/hooks/useI18n";

export const useStaticInfoPage = (pageKey: PageKey, trackActive: boolean) => {
  const { t } = useI18n();
  const outline = useMemo(() => buildStaticInfoOutline(pageKey), [pageKey]);
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
  return { t, outline, activeSectionId, setActiveSectionId };
};
