"use client";

import { TContentResultsProps } from "@/types/content-module.types";
import { toCardItems } from "@/lib/content-catalog/card-items";
import { useI18n } from "@/hooks/useI18n";

import ContentCard from "@elements/content-card";

const ContentResults = ({ page }: TContentResultsProps) => {
  const { t, language } = useI18n();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {toCardItems(page, t, language).map((item) => (
        <li key={`${item.kind}-${item.id}`} className="flex">
          <ContentCard item={item} className="w-full" />
        </li>
      ))}
    </ul>
  );
};

export default ContentResults;
