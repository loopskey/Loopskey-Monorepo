"use client";

import { ROADMAP_CATALOG_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { ContentPagination } from "@elements/pagination";
import { RoadmapTile } from "@elements/roadmap-tile";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { TRoadmapCatalogProps } from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const SKELETON_CARDS = ["first", "second", "third"] as const;

export const RoadmapCatalog = ({
  page,
  search,
  goNext,
  isError,
  onRetry,
  roadmaps,
  isLoading,
  isFetching,
  totalCount,
  goPrevious,
  hasNextPage,
  onSearchChange,
}: TRoadmapCatalogProps) => {
  const { t } = useI18n();

  return (
    <section
      id={ROADMAP_CATALOG_ELEMENT_ID}
      aria-labelledby="roadmap-catalog-title"
      className="scroll-mt-24 space-y-4"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <h2
          id="roadmap-catalog-title"
          className="text-lg font-semibold text-foreground"
        >
          {t(`${KEY}.catalogCard.title`)}
        </h2>
        <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-xs font-semibold text-brand-orange-text">
          {t(`${KEY}.library.catalogBadge`)}
        </span>
        <div className="relative w-full sm:ml-auto sm:w-72">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            className="h-10 pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label={t(`${KEY}.searchExploreRoadmaps`)}
            placeholder={t(`${KEY}.searchExploreRoadmaps`)}
          />
        </div>
      </div>

      {isLoading ? (
        <div aria-hidden className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SKELETON_CARDS.map((card) => (
            <Skeleton key={card} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="font-medium">{t(`${KEY}.loadError.title`)}</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {t(`${KEY}.loadError.description`)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={onRetry}
          >
            <L.RotateCcw aria-hidden />
            {t("professionalDashboard.common.refresh")}
          </Button>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="font-medium">{t(`${KEY}.emptyExploreTitle`)}</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {t(`${KEY}.emptyExploreDescription`)}
          </p>
        </div>
      ) : (
        <ul
          className={cn(
            "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-70 transition-opacity",
          )}
        >
          {roadmaps.map((roadmap) => (
            <li
              key={roadmap.id}
              className="flex flex-col gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <RoadmapTile category={roadmap.category} />
                {roadmap.isEnrolled ? (
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-soft-foreground">
                    {t(`${KEY}.enrolledTag`)}
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold leading-snug text-foreground">
                {roadmap.title}
              </h3>
              <p className="mt-auto flex flex-wrap gap-x-2 text-xs tabular-nums text-muted-foreground">
                <span>
                  {translateWithFallback(
                    t,
                    `content.enums.courseLevel.${roadmap.level}`,
                    humanizeEnumValue(roadmap.level),
                  )}
                </span>
                <span aria-hidden>·</span>
                <span>
                  {t(`${KEY}.hero.phasesCount`, { count: roadmap.phasesCount })}
                </span>
                {roadmap.estimatedWeeks ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      {t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks })}
                    </span>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}

      {page > 1 || hasNextPage ? (
        <ContentPagination
          page={page}
          onNext={goNext}
          isLoading={isFetching}
          canPrevious={page > 1}
          totalCount={totalCount}
          onPrevious={goPrevious}
          hasNextPage={hasNextPage}
        />
      ) : null}
    </section>
  );
};
