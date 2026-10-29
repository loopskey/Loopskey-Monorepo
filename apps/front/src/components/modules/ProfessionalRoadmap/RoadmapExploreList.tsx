"use client";

import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { ContentPagination } from "@elements/pagination";
import { RoadmapArt } from "@elements/roadmap-art";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { RoadmapExploreListProps } from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const SKELETON_ROWS = ["first", "second", "third"] as const;

export const RoadmapExploreList = ({
  page,
  search,
  onNext,
  isError,
  onRetry,
  roadmaps,
  isLoading,
  isFetching,
  totalCount,
  onPrevious,
  hasNextPage,
  onSearchChange,
}: RoadmapExploreListProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t(`${KEY}.exploreUnavailable`)}
        </p>

        <div className="relative w-full shrink-0 sm:max-w-xs">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            className="h-10 pl-9"
            onChange={onSearchChange}
            aria-label={t(`${KEY}.searchExploreRoadmaps`)}
            placeholder={t(`${KEY}.searchExploreRoadmaps`)}
          />
        </div>
      </div>

      {isLoading ? (
        <div aria-hidden className="space-y-2">
          {SKELETON_ROWS.map((row) => (
            <Skeleton key={row} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
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
            <L.RotateCcw className="size-4" />
            {t("professionalDashboard.common.refresh")}
          </Button>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">{t(`${KEY}.emptyExploreTitle`)}</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            {t(`${KEY}.emptyExploreDescription`)}
          </p>
        </div>
      ) : (
        <ul
          className={cn(
            "overflow-hidden rounded-lg border",
            isFetching && "opacity-70 transition-opacity",
          )}
        >
          {roadmaps.map((roadmap) => (
            <li
              key={roadmap.id}
              className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
            >
              <RoadmapArt
                className="size-10"
                category={roadmap.category}
              />

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium break-words">
                  {roadmap.title}
                </p>
                <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-muted-foreground">
                  {roadmap.category ? (
                    <span>
                      {translateWithFallback(
                        t,
                        `content.enums.courseCategory.${roadmap.category}`,
                        humanizeEnumValue(roadmap.category),
                      )}
                    </span>
                  ) : null}
                  <span>
                    {translateWithFallback(
                      t,
                      `content.enums.courseLevel.${roadmap.level}`,
                      humanizeEnumValue(roadmap.level),
                    )}
                  </span>
                  <span>
                    {t(`${KEY}.hero.phasesCount`, {
                      count: roadmap.phasesCount,
                    })}
                  </span>
                  {roadmap.estimatedWeeks ? (
                    <span>
                      {t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks })}
                    </span>
                  ) : null}
                </p>
              </div>

              {roadmap.isEnrolled ? (
                <span className="shrink-0 rounded-full bg-success-soft px-2 py-px text-[11px] font-semibold text-success-soft-foreground">
                  {t(`${KEY}.enrolledTag`)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {page > 1 || hasNextPage ? (
        <ContentPagination
          page={page}
          onNext={onNext}
          isLoading={isFetching}
          canPrevious={page > 1}
          totalCount={totalCount}
          onPrevious={onPrevious}
          hasNextPage={hasNextPage}
        />
      ) : null}
    </div>
  );
};
