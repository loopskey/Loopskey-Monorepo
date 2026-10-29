"use client";

import { LANDING_HUB_ITEM_CLASS_NAME } from "@/utils/landing-public.constant";
import { LANDING_HUB_LIST_CLASS_NAME } from "@/utils/landing-public.constant";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

import type { TLearningHubRowProps } from "@/types/landing-module.types";

import LandingContentSkeleton from "@modules/Landing/parts/LandingContentSkeleton";
import LandingEmptyState from "@modules/Landing/parts/LandingEmptyState";
import ContentCard from "@elements/content-card";
import Link from "@elements/localized-link";

const LearningHubRow = ({ row }: TLearningHubRowProps) => {
  const { t } = useI18n();
  const headingId = `landing-hub-${row.id}`;

  if (!row.isLoading && !row.isError && row.items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h3
          id={headingId}
          className="text-balance text-2xl font-bold tracking-tight text-foreground"
        >
          {row.title}
        </h3>

        <Link
          href={row.viewAllHref}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-primary"
        >
          {t("landing.learningHub.viewAll")}
          <span className="sr-only">: {row.title}</span>
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>

      {row.isLoading ? (
        <LandingContentSkeleton />
      ) : row.isError ? (
        <LandingEmptyState variant="error" onRetry={row.refetch} />
      ) : (
        <ul aria-labelledby={headingId} className={LANDING_HUB_LIST_CLASS_NAME}>
          {row.items.map((item) => (
            <li key={item.id} className={LANDING_HUB_ITEM_CLASS_NAME}>
              <ContentCard item={item} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LearningHubRow;
