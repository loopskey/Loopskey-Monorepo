import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { RoadmapEnrollmentStatus } from "@/lib/graphql/base";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { RoadmapSource } from "@/lib/graphql/base";

import type { TProfessionalRoadmap } from "@/types/professional-dashboard.types";

export type TRoadmapState = "inProgress" | "notStarted" | "completed";
export type TRoadmapStateFilter = "all" | TRoadmapState;
export type TRoadmapSort = "newest" | "progress" | "name";

export const ROADMAP_LIST_TAKE = 50;

export const ROADMAP_STATES: TRoadmapState[] = [
  "inProgress",
  "notStarted",
  "completed",
];

export const ROADMAP_STATE_FILTERS: TRoadmapStateFilter[] = [
  "all",
  ...ROADMAP_STATES,
];

export const ROADMAP_SORTS: TRoadmapSort[] = ["newest", "progress", "name"];

export const clampPercent = (value: number) =>
  Math.min(Math.max(Math.round(value), 0), 100);

export const isRoadmapCompleted = (roadmap: TProfessionalRoadmap) =>
  roadmap.status === RoadmapEnrollmentStatus.Completed ||
  roadmap.progress >= 100;

export const roadmapState = (roadmap: TProfessionalRoadmap): TRoadmapState => {
  if (isRoadmapCompleted(roadmap)) return "completed";
  const hasStarted =
    roadmap.completedSteps > 0 ||
    roadmap.phases.some((phase) =>
      phase.steps.some(
        (step) => step.status === RoadmapStepProgressStatus.InProgress,
      ),
    );
  return hasStarted ? "inProgress" : "notStarted";
};

export const countRoadmapStates = (roadmaps: TProfessionalRoadmap[]) => {
  const counts: Record<TRoadmapStateFilter, number> = {
    all: roadmaps.length,
    inProgress: 0,
    notStarted: 0,
    completed: 0,
  };
  for (const roadmap of roadmaps) counts[roadmapState(roadmap)] += 1;
  return counts;
};

export const filterRoadmaps = (
  roadmaps: TProfessionalRoadmap[],
  { search, state }: { search: string; state: TRoadmapStateFilter },
) => {
  const term = search.trim().toLocaleLowerCase();
  return roadmaps.filter(
    (roadmap) =>
      (state === "all" || roadmapState(roadmap) === state) &&
      (!term || roadmap.title.toLocaleLowerCase().includes(term)),
  );
};

export const sortRoadmaps = (
  roadmaps: TProfessionalRoadmap[],
  sort: TRoadmapSort,
  locale?: string,
) => {
  const compare: Record<
    TRoadmapSort,
    (a: TProfessionalRoadmap, b: TProfessionalRoadmap) => number
  > = {
    newest: (a, b) => Date.parse(b.enrolledAt) - Date.parse(a.enrolledAt),
    progress: (a, b) => b.progress - a.progress,
    name: (a, b) => a.title.localeCompare(b.title, locale),
  };
  return [...roadmaps].sort(compare[sort]);
};

export const groupRoadmapsByState = (roadmaps: TProfessionalRoadmap[]) =>
  ROADMAP_STATES.map((state) => ({
    state,
    roadmaps: roadmaps.filter((roadmap) => roadmapState(roadmap) === state),
  })).filter((group) => group.roadmaps.length > 0);

export const nextStepTitle = (roadmap: TProfessionalRoadmap) =>
  findNextActionableStep(roadmap.phases)?.title ?? null;

export const canEditRoadmap = (roadmap: TProfessionalRoadmap) =>
  roadmap.source === RoadmapSource.Generated && Boolean(roadmap.draftId);
