"use client";

import { TDetailPageHeaderProps } from "@/types/content-module.types";
import { ArrowLeft, Star } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

import Link from "next/link";

const DetailPageHeader = ({
  title,
  badge,
  chips,
  rating,
  byline,
  category,
  ratingCount,
}: TDetailPageHeaderProps) => {
  const { t } = useI18n();

  const extraChips = [category, ...(chips ?? [])].filter(Boolean);

  return (
    <header className="space-y-4">
      <Link
        href="/content"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("contentDetails.common.backToContent")}
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
          {badge}
        </span>

        {extraChips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-muted/70 px-3 py-1.5 text-xs font-bold text-muted-foreground"
          >
            {chip}
          </span>
        ))}

        {typeof rating === "number" && rating > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-3 py-1.5 text-xs font-extrabold text-warning-soft-foreground">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-warning-soft-foreground" />
            {rating.toFixed(1)}
            {typeof ratingCount === "number" && ratingCount > 0 && (
              <span className="text-muted-foreground">({ratingCount})</span>
            )}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-medium tracking-tight sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      {byline && <p className="text-base text-muted-foreground">{byline}</p>}
    </header>
  );
};

export default DetailPageHeader;
