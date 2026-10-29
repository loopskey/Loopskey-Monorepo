"use client";

import { contentCardLabels } from "@/lib/content-catalog/card-labels";
import { useI18n } from "@/hooks/useI18n";
import { useMemo } from "react";

import type { TContentCardProps } from "@/types/content-module.types";

import ContentCardView from "./content-card-view";

const ContentCard = (props: TContentCardProps) => {
  const { t } = useI18n();
  const labels = useMemo(() => contentCardLabels(t), [t]);
  return <ContentCardView {...props} labels={labels} />;
};

export default ContentCard;
