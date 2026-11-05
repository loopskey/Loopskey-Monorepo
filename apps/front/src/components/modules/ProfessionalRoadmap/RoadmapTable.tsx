"use client";

import { TABLE_ROW_GRID_CLASS_NAME } from "@modules/ProfessionalRoadmap/RoadmapTableRow";
import { ROADMAP_STATE_FILTERS } from "@/utils/roadmap-library.util";
import { ContentPagination } from "@elements/pagination";
import { RoadmapTableRow } from "@modules/ProfessionalRoadmap/RoadmapTableRow";
import { ROADMAP_SORTS } from "@/utils/roadmap-library.util";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { TRoadmapTableProps } from "@/types/professional-roadmap-chat.types";
import type { TRoadmapSort } from "@/utils/roadmap-library.util";

import * as S from "@ui/select";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const SKELETON_ROWS = ["first", "second", "third", "fourth"] as const;

export const RoadmapTable = ({
  onEdit,
  library,
  onToggle,
  onContinue,
  onUnenroll,
  unenrollingId,
  openRoadmapId,
  renderDetails,
  editingRoadmapId,
}: TRoadmapTableProps) => {
  const { t } = useI18n();
  const { counts } = library;

  return (
    <div className="space-y-4">
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
            id="roadmap-table-sort"
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
              aria-labelledby="roadmap-table-sort"
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

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div
          aria-hidden
          className={cn(
            "hidden border-b bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground",
            TABLE_ROW_GRID_CLASS_NAME,
          )}
        >
          <span className="pl-11">{t(`${KEY}.library.columns.roadmap`)}</span>
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
            {library.roadmaps.map((roadmap) => {
              const isOpen = roadmap.id === openRoadmapId;
              return (
                <RoadmapTableRow
                  key={roadmap.id}
                  isOpen={isOpen}
                  onEdit={onEdit}
                  roadmap={roadmap}
                  onToggle={onToggle}
                  onContinue={onContinue}
                  onUnenroll={onUnenroll}
                  unenrollingId={unenrollingId}
                  editingRoadmapId={editingRoadmapId}
                  details={isOpen ? renderDetails(roadmap) : null}
                />
              );
            })}
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
  );
};
