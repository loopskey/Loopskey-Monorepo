"use client";

import { useMemo, useState } from "react";
import { TPrivacySection } from "@/types/hooks.types";
import { useI18n } from "@/hooks/useI18n";

const isPrivacyInfoCard = (
  value: unknown,
): value is TPrivacySection["infoCard"] => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.icon === "string" &&
    typeof item.title === "string" &&
    typeof item.text === "string"
  );
};

const isPrivacySection = (value: unknown): value is TPrivacySection => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const paragraphsValid =
    item.paragraphs === undefined ||
    (Array.isArray(item.paragraphs) &&
      item.paragraphs.every((paragraph) => typeof paragraph === "string"));
  const bulletsValid =
    item.bullets === undefined ||
    (Array.isArray(item.bullets) &&
      item.bullets.every((bullet) => typeof bullet === "string"));
  const contactItemsValid =
    item.contactItems === undefined ||
    (Array.isArray(item.contactItems) &&
      item.contactItems.every((contactItem) => {
        if (!contactItem || typeof contactItem !== "object") return false;
        const contact = contactItem as Record<string, unknown>;
        return (
          typeof contact.label === "string" &&
          typeof contact.value === "string" &&
          (contact.href === undefined || typeof contact.href === "string")
        );
      }));
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    paragraphsValid &&
    bulletsValid &&
    contactItemsValid &&
    (item.infoCard === undefined || isPrivacyInfoCard(item.infoCard))
  );
};

const isPrivacySectionArray = (value: unknown): value is TPrivacySection[] =>
  Array.isArray(value) && value.every(isPrivacySection);

export const usePrivacyPage = () => {
  const { t, traw } = useI18n();
  const sections = useMemo<TPrivacySection[]>(() => {
    const rawSections = traw<unknown>("privacyPage.sections", []);
    return isPrivacySectionArray(rawSections) ? rawSections : [];
  }, [traw]);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections[0]?.id ?? "introduction",
  );
  const activeSection = useMemo(() => {
    return (
      sections.find((section) => section.id === activeSectionId) ?? sections[0]
    );
  }, [sections, activeSectionId]);
  return {
    t,
    sections,
    activeSection,
    activeSectionId,
    setActiveSectionId,
  };
};
