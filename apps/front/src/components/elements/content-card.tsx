"use client";

import { useI18n } from "@/hooks/useI18n";

import type { TContentCardProps } from "@/types/content-module.types";

import ContentCardView from "./content-card-view";

const ContentCard = (props: TContentCardProps) => {
  const { t } = useI18n();
  return (
    <ContentCardView
      {...props}
      viewDetails={t("content.card.viewDetails")}
      originalLanguage={t("content.card.originalLanguage")}
    />
  );
};

export default ContentCard;
