"use client";

import { useEffect, useMemo, useState } from "react";
import { TTermsNotice, TTermsSection } from "@/types/hooks.types";
import { TTermsContactItem } from "@/types/hooks.types";
import { useI18n } from "@/hooks/useI18n";

const isTermsContactItem = (value: unknown): value is TTermsContactItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<TTermsContactItem>;
  return (
    typeof item.label === "string" &&
    typeof item.value === "string" &&
    (item.href === undefined || typeof item.href === "string")
  );
};

const isTermsNotice = (value: unknown): value is TTermsNotice => {
  if (typeof value !== "object" || value === null) return false;
  const notice = value as Partial<TTermsNotice>;
  return (
    typeof notice.title === "string" &&
    typeof notice.text === "string" &&
    typeof notice.icon === "string" &&
    (notice.tone === undefined ||
      notice.tone === "info" ||
      notice.tone === "warn")
  );
};

const isTermsSection = (value: unknown): value is TTermsSection => {
  if (typeof value !== "object" || value === null) return false;
  const section = value as Partial<TTermsSection>;
  return (
    typeof section.id === "string" &&
    typeof section.title === "string" &&
    (section.paragraphs === undefined ||
      (Array.isArray(section.paragraphs) &&
        section.paragraphs.every((item) => typeof item === "string"))) &&
    (section.bullets === undefined ||
      (Array.isArray(section.bullets) &&
        section.bullets.every((item) => typeof item === "string"))) &&
    (section.notice === undefined || isTermsNotice(section.notice)) &&
    (section.contactItems === undefined ||
      (Array.isArray(section.contactItems) &&
        section.contactItems.every(isTermsContactItem)))
  );
};

const isTermsSectionArray = (value: unknown): value is TTermsSection[] =>
  Array.isArray(value) && value.every(isTermsSection);

export const useTermsPage = () => {
  const { t, traw } = useI18n();
  const sections = useMemo<TTermsSection[]>(() => {
    const rawSections = traw<unknown>("termsPage.sections", []);
    return isTermsSectionArray(rawSections) ? rawSections : [];
  }, [traw]);
  const [activeSectionId, setActiveSectionId] = useState<string>("overview");
  useEffect(() => {
    if (!sections.length) return;
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
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  return {
    t,
    sections,
    activeSectionId,
    setActiveSectionId,
  };
};
