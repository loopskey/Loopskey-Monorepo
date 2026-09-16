import { RoadmapDraftStep } from "@/lib/graphql/base";

export const ROADMAP_STEP_ORDER: RoadmapDraftStep[] = [
  RoadmapDraftStep.Goal,
  RoadmapDraftStep.GoalReason,
  RoadmapDraftStep.Context,
  RoadmapDraftStep.TargetDate,
  RoadmapDraftStep.Preferences,
  RoadmapDraftStep.CpdTracking,
  RoadmapDraftStep.Certification,
  RoadmapDraftStep.CpdRequirements,
  RoadmapDraftStep.Review,
];

export type RoadmapChatStage = "goal" | "preferences" | "cpdSetup" | "review";

export const ROADMAP_STAGE_STEPS: Record<RoadmapChatStage, RoadmapDraftStep[]> =
  {
    goal: [
      RoadmapDraftStep.Goal,
      RoadmapDraftStep.GoalReason,
      RoadmapDraftStep.Context,
      RoadmapDraftStep.TargetDate,
    ],
    preferences: [RoadmapDraftStep.Preferences],
    cpdSetup: [
      RoadmapDraftStep.CpdTracking,
      RoadmapDraftStep.Certification,
      RoadmapDraftStep.CpdRequirements,
    ],
    review: [RoadmapDraftStep.Review],
  };

export const ROADMAP_STAGE_ORDER: RoadmapChatStage[] = [
  "goal",
  "preferences",
  "cpdSetup",
  "review",
];

export const roadmapStageOf = (step: RoadmapDraftStep): RoadmapChatStage => {
  for (const stage of ROADMAP_STAGE_ORDER)
    if (ROADMAP_STAGE_STEPS[stage].includes(step)) return stage;
  return "goal";
};

export const isRoadmapStepReached = (
  current: RoadmapDraftStep,
  target: RoadmapDraftStep,
): boolean =>
  ROADMAP_STEP_ORDER.indexOf(current) >= ROADMAP_STEP_ORDER.indexOf(target);
