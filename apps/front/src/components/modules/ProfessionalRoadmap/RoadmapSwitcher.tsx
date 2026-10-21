"use client";

import { RoadmapEnrollmentStatus } from "@/lib/graphql/base";
import { RoadmapActionButtons } from "@modules/ProfessionalRoadmap/RoadmapActionButtons";
import { buildRoadmapTabHref } from "@/utils/roadmap-navigation.util";
import { RoadmapArt } from "@elements/roadmap-art";
import { useI18n } from "@/hooks/useI18n";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { TRoadmapSwitcherProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

export const RoadmapSwitcher = ({
  search,
  onEdit,
  roadmaps,
  showSearch,
  isFetching,
  onContinue,
  onSearchChange,
  activeRoadmapId,
  editingRoadmapId,
}: TRoadmapSwitcherProps) => {
  const { t } = useI18n();

  return (
    <nav aria-label={t(`${KEY}.myRoadmaps`)} className="space-y-3">
      {showSearch ? (
        <div className="relative w-full sm:max-w-xs">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            className="h-10 pl-9"
            onChange={onSearchChange}
            aria-label={t(`${KEY}.searchMyRoadmaps`)}
            placeholder={t(`${KEY}.searchMyRoadmaps`)}
          />
        </div>
      ) : null}

      {roadmaps.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {t(`${KEY}.noRoadmapMatches`)}
        </p>
      ) : (
        <ul
          className={cn(
            "flex snap-x gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-3",
            isFetching && "opacity-70 transition-opacity",
          )}
        >
          {roadmaps.map((roadmap) => {
            const progress = clampPercent(roadmap.progress);
            const isActive = roadmap.id === activeRoadmapId;
            const isCompleted =
              roadmap.status === RoadmapEnrollmentStatus.Completed ||
              progress >= 100;

            return (
              <li
                key={roadmap.id}
                className="min-w-0 shrink-0 basis-[min(15.5rem,78%)] snap-start sm:basis-auto"
              >
                <div
                  className={cn(
                    "flex h-full flex-col gap-3 rounded-xl border p-3 transition-colors",
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/40",
                  )}
                >
                  <Link
                    scroll={false}
                    href={buildRoadmapTabHref(roadmap.id)}
                    aria-current={isActive ? "true" : undefined}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <RoadmapArt
                      sizes="40px"
                      className="row-span-2 size-10"
                      category={roadmap.category}
                      imageUrl={roadmap.imageUrl}
                    />
                    <span className="truncate text-sm font-medium">
                      {roadmap.title}
                    </span>
                    <span className="truncate text-xs tabular-nums text-muted-foreground">
                      {isCompleted
                        ? t(`${KEY}.completed`)
                        : t(`${KEY}.ofSteps`, {
                            completed: roadmap.completedSteps,
                            total: roadmap.totalSteps,
                          })}
                    </span>
                    <span
                      aria-hidden
                      className="col-span-2 mt-2 block h-1 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        style={{ width: `${progress}%` }}
                        className={cn(
                          "block h-full rounded-full",
                          isCompleted ? "bg-success" : "bg-primary",
                        )}
                      />
                    </span>
                  </Link>

                  <RoadmapActionButtons
                    size="sm"
                    onEdit={onEdit}
                    roadmap={roadmap}
                    className="mt-auto"
                    onContinue={onContinue}
                    editingRoadmapId={editingRoadmapId}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};
