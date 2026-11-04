"use client";

import { clampPercent, isRoadmapCompleted } from "@/utils/roadmap-library.util";
import { buildRoadmapLibraryHref } from "@/utils/roadmap-navigation.util";
import { ROADMAP_STATE_FILTERS } from "@/utils/roadmap-library.util";
import { groupRoadmapsByState } from "@/utils/roadmap-library.util";
import { buildRoadmapTabHref } from "@/utils/roadmap-navigation.util";
import { countRoadmapStates } from "@/utils/roadmap-library.util";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { filterRoadmaps } from "@/utils/roadmap-library.util";
import { RoadmapTile } from "@elements/roadmap-tile";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import type { TRoadmapSwitcherPanelProps } from "@/types/professional-roadmap-chat.types";
import type { TRoadmapStateFilter } from "@/utils/roadmap-library.util";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const RoadmapSwitcherPanel = ({
  roadmaps,
  totalCount,
  onNavigate,
  generatingGoal,
  activeRoadmapId,
}: TRoadmapSwitcherPanelProps) => {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<TRoadmapStateFilter>("all");

  const counts = countRoadmapStates(roadmaps);
  const groups = groupRoadmapsByState(
    filterRoadmaps(roadmaps, { search, state: stateFilter }),
  );
  const isPartial = totalCount > roadmaps.length;

  return (
    <div className="flex max-h-[min(42rem,calc(100dvh-8rem))] min-h-0 flex-col">
      <div className="space-y-3 border-b p-3.5">
        <div className="relative">
          <L.Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            className="h-11 pl-9"
            aria-label={t(`${KEY}.switcher.search`)}
            placeholder={t(`${KEY}.switcher.search`)}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div
          role="group"
          aria-label={t(`${KEY}.switcher.filters`)}
          className="flex flex-wrap gap-1.5"
        >
          {ROADMAP_STATE_FILTERS.map((filter) => {
            const isOn = stateFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isOn}
                onClick={() => setStateFilter(filter)}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {generatingGoal && stateFilter === "all" ? (
          <div className="mb-1 flex items-center gap-3 rounded-xl bg-muted p-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background text-primary">
              <L.Loader2
                aria-hidden
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {generatingGoal}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t(`${KEY}.switcher.generating`)}
              </span>
            </span>
          </div>
        ) : null}

        {groups.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            {t(`${KEY}.noRoadmapMatches`)}
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.state}
              aria-labelledby={`roadmap-group-${group.state}`}
            >
              <h3
                id={`roadmap-group-${group.state}`}
                className="px-2.5 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t(`${KEY}.states.${group.state}`)}
              </h3>
              <ul>
                {group.roadmaps.map((roadmap) => {
                  const isActive = roadmap.id === activeRoadmapId;
                  const isCompleted = isRoadmapCompleted(roadmap);
                  const progress = clampPercent(roadmap.progress);
                  return (
                    <li key={roadmap.id}>
                      <Link
                        scroll={false}
                        onClick={onNavigate}
                        href={buildRoadmapTabHref(roadmap.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-2.5 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "bg-accent" : "hover:bg-muted",
                        )}
                      >
                        <RoadmapTile
                          category={roadmap.category}
                          className="size-9 rounded-lg"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {roadmap.title}
                          </span>
                          <span className="block truncate text-xs tabular-nums text-muted-foreground">
                            {t(`${KEY}.ofSteps`, {
                              completed: roadmap.completedSteps,
                              total: roadmap.totalSteps,
                            })}
                          </span>
                        </span>
                        <span className="flex w-20 shrink-0 flex-col items-end gap-1.5">
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums",
                              isCompleted && "text-success-soft-foreground",
                            )}
                          >
                            {isCompleted ? (
                              <L.Check aria-hidden className="size-4" />
                            ) : (
                              `${progress}%`
                            )}
                          </span>
                          <span
                            aria-hidden
                            className="block h-1.5 w-full overflow-hidden rounded-full bg-muted"
                          >
                            <span
                              style={{ width: `${progress}%` }}
                              className={cn(
                                "block h-full rounded-full",
                                isCompleted ? "bg-success" : "bg-primary",
                              )}
                            />
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}

        {isPartial ? (
          <p className="px-2.5 pb-1 pt-3 text-xs text-muted-foreground">
            {t(`${KEY}.switcher.partial`, {
              shown: roadmaps.length,
              total: totalCount,
            })}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/40 p-3">
        <Button asChild variant="ghost" className="text-primary">
          <Link
            href={buildRoadmapLibraryHref(activeRoadmapId)}
            onClick={onNavigate}
          >
            <L.LayoutGrid aria-hidden />
            {t(`${KEY}.switcher.manageAll`)}
          </Link>
        </Button>
        <Button asChild className="ml-auto">
          <Link href={ROADMAP_CHAT_HREF} onClick={onNavigate}>
            <L.Plus aria-hidden />
            {t(`${KEY}.newRoadmap`)}
          </Link>
        </Button>
      </div>
    </div>
  );
};
