"use client";

import { LIBRARY_ROW_GRID_CLASS_NAME } from "@modules/ProfessionalRoadmap/RoadmapLibraryRow";
import { ROADMAP_STATE_FILTERS } from "@/utils/roadmap-library.util";
import { buildRoadmapTabHref } from "@/utils/roadmap-navigation.util";
import { RoadmapLibraryRow } from "@modules/ProfessionalRoadmap/RoadmapLibraryRow";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { useRoadmapLibrary } from "@/hooks/useRoadmapLibrary";
import { ContentPagination } from "@elements/pagination";
import { ROADMAP_TAB_HREF } from "@/utils/roadmap-navigation.util";
import { RoadmapCatalog } from "@modules/ProfessionalRoadmap/RoadmapCatalog";
import { ROADMAP_SORTS } from "@/utils/roadmap-library.util";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { TRoadmapLibraryProps } from "@/types/professional-roadmap-chat.types";
import type { TRoadmapSort } from "@/utils/roadmap-library.util";

import Link from "next/link";

import * as S from "@ui/select";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const SKELETON_ROWS = ["first", "second", "third", "fourth"] as const;

export const RoadmapLibrary = ({
  onEdit,
  onUnenroll,
  unenrollingId,
  totalRoadmaps,
  activeRoadmapId,
  editingRoadmapId,
}: TRoadmapLibraryProps) => {
  const { t } = useI18n();
  const library = useRoadmapLibrary(totalRoadmaps);
  const { counts, explore } = library;

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Link
          href={
            activeRoadmapId
              ? buildRoadmapTabHref(activeRoadmapId)
              : ROADMAP_TAB_HREF
          }
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <L.ChevronLeft aria-hidden className="size-4" />
          {t(`${KEY}.library.back`)}
        </Link>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t(`${KEY}.library.title`)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${KEY}.library.summary`, {
                total: library.totalCount,
                inProgress: counts.inProgress,
                completed: counts.completed,
              })}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={ROADMAP_CHAT_HREF}>
              <L.Plus aria-hidden />
              {t(`${KEY}.newRoadmap`)}
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <L.Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              className="h-10 pl-9"
              value={library.search}
              aria-label={t(`${KEY}.switcher.search`)}
              placeholder={t(`${KEY}.switcher.search`)}
              onChange={(event) => library.changeSearch(event.target.value)}
            />
          </div>

          <div
            role="group"
            aria-label={t(`${KEY}.switcher.filters`)}
            className="flex flex-wrap gap-1.5"
          >
            {ROADMAP_STATE_FILTERS.map((filter) => {
              const isOn = library.stateFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => library.setStateFilter(filter)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isOn
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40",
                  )}
                >
                  {t(`${KEY}.states.${filter}`)}
                  <span className="ml-1 font-normal tabular-nums opacity-80">
                    {counts[filter]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <span
              id="roadmap-library-sort"
              className="text-sm text-muted-foreground"
            >
              {t(`${KEY}.library.sort`)}
            </span>
            <S.Select
              value={library.sort}
              onValueChange={(value) => library.setSort(value as TRoadmapSort)}
            >
              <S.SelectTrigger
                size="sm"
                className="w-40 rounded-lg"
                aria-labelledby="roadmap-library-sort"
              >
                <S.SelectValue />
              </S.SelectTrigger>
              <S.SelectContent>
                {ROADMAP_SORTS.map((sort) => (
                  <S.SelectItem key={sort} value={sort}>
                    {t(`${KEY}.library.sorts.${sort}`)}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <div
            aria-hidden
            className={cn(
              "hidden border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground",
              LIBRARY_ROW_GRID_CLASS_NAME,
            )}
          >
            <span>{t(`${KEY}.library.columns.roadmap`)}</span>
            <span>{t(`${KEY}.library.columns.progress`)}</span>
            <span>{t(`${KEY}.library.columns.nextStep`)}</span>
            <span className="text-right">
              {t(`${KEY}.library.columns.actions`)}
            </span>
          </div>

          {library.isLoading ? (
            <div aria-hidden className="space-y-px">
              {SKELETON_ROWS.map((row) => (
                <Skeleton key={row} className="h-[4.5rem] rounded-none" />
              ))}
            </div>
          ) : library.isError ? (
            <div className="p-8 text-center">
              <p className="font-medium">{t(`${KEY}.loadError.title`)}</p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                {t(`${KEY}.loadError.description`)}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => library.refetch()}
              >
                <L.RotateCcw aria-hidden />
                {t("professionalDashboard.common.refresh")}
              </Button>
            </div>
          ) : library.totalCount === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <span className="rounded-full bg-accent p-4 text-primary">
                <L.Route aria-hidden className="size-7" />
              </span>
              <p className="mt-4 font-medium">
                {t(`${KEY}.emptyMyRoadmapsTitle`)}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                {t(`${KEY}.emptyMyRoadmapsDescription`)}
              </p>
            </div>
          ) : library.roadmaps.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {t(`${KEY}.library.emptyFilter`)}
            </p>
          ) : (
            <ul
              className={cn(
                library.isFetching && "opacity-70 transition-opacity",
              )}
            >
              {library.roadmaps.map((roadmap) => (
                <RoadmapLibraryRow
                  key={roadmap.id}
                  onEdit={onEdit}
                  roadmap={roadmap}
                  onUnenroll={onUnenroll}
                  unenrollingId={unenrollingId}
                  editingRoadmapId={editingRoadmapId}
                  isActive={roadmap.id === activeRoadmapId}
                />
              ))}
            </ul>
          )}
        </div>

        {library.page > 1 || library.hasNextPage ? (
          <ContentPagination
            page={library.page}
            onNext={library.goNext}
            isLoading={library.isFetching}
            canPrevious={library.page > 1}
            onPrevious={library.goPrevious}
            totalCount={library.totalCount}
            hasNextPage={library.hasNextPage}
          />
        ) : null}
      </div>

      <RoadmapCatalog
        page={explore.page}
        goNext={explore.goNext}
        isError={explore.isError}
        roadmaps={explore.roadmaps}
        isLoading={explore.isLoading}
        search={library.exploreSearch}
        isFetching={explore.isFetching}
        totalCount={explore.totalCount}
        goPrevious={explore.goPrevious}
        hasNextPage={explore.hasNextPage}
        onRetry={() => explore.refetch()}
        onSearchChange={library.changeExploreSearch}
      />
    </div>
  );
};
