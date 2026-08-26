"use client";

import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { useCallback, useState } from "react";
import { professionalApi } from "@/lib/rtk/endpoints/professional.api";
import { useDispatch } from "react-redux";

import * as API from "@/lib/rtk/endpoints/professional.api";

import type { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import type { TAppDispatch } from "@/lib/rtk/store";

type StepAction = "start" | "complete";

export type StepPending = { stepId: string; action: StepAction };

type MutableStep = {
  id: string;
  completedAt?: string | null;
  status?: RoadmapStepProgressStatus | null;
};

type MutablePhase = {
  id: string;
  progress: number;
  completed: boolean;
  steps: MutableStep[];
  completedSteps: number;
};

type MutableItem = {
  id: string;
  progress: number;
  completedSteps: number;
  phases: MutablePhase[];
  completedPhases: number;
};

type StepProgressResult = {
  stepId: string;
  progress: number;
  totalSteps: number;
  enrollmentId: string;
  phaseProgress: number;
  completedSteps: number;
  phaseCompleted: boolean;
  phaseId?: string | null;
  completedAt?: string | null;
  status: RoadmapStepProgressStatus;
};

const findItem = (draft: unknown, enrollmentId: string) =>
  (draft as { items?: MutableItem[] } | undefined)?.items?.find(
    (row) => row.id === enrollmentId,
  );

export const applyStepProgress = (
  draft: unknown,
  result: StepProgressResult,
) => {
  const item = findItem(draft, result.enrollmentId);
  if (!item) return;

  item.progress = result.progress;
  item.completedSteps = result.completedSteps;

  for (const phase of item.phases) {
    if (phase.id === result.phaseId) {
      phase.progress = result.phaseProgress;
      phase.completed = result.phaseCompleted;
    }
    for (const step of phase.steps)
      if (step.id === result.stepId) {
        step.status = result.status;
        step.completedAt = result.completedAt ?? null;
      }
  }

  item.completedPhases = item.phases.filter((phase) => phase.completed).length;
};

const applyOptimisticStatus = (
  draft: unknown,
  enrollmentId: string,
  stepId: string,
  action: StepAction,
) => {
  const item = findItem(draft, enrollmentId);
  if (!item) return;
  for (const phase of item.phases)
    for (const step of phase.steps)
      if (step.id === stepId)
        step.status =
          action === "complete"
            ? RoadmapStepProgressStatus.Completed
            : RoadmapStepProgressStatus.InProgress;
};

export const useRoadmapStepProgress = (
  variables: ProfessionalMyRoadmapsQueryVariables,
) => {
  const dispatch = useDispatch<TAppDispatch>();
  const [startStep] = API.useStartRoadmapStepMutation();
  const [completeStep] = API.useCompleteRoadmapStepMutation();
  const [pending, setPending] = useState<StepPending | null>(null);
  const [failedStepId, setFailedStepId] = useState<string | null>(null);

  const run = useCallback(
    async (action: StepAction, enrollmentId: string, stepId: string) => {
      setPending({ stepId, action });
      setFailedStepId(null);

      const patch = dispatch(
        professionalApi.util.updateQueryData(
          "professionalMyRoadmaps",
          variables,
          (draft) => applyOptimisticStatus(draft, enrollmentId, stepId, action),
        ),
      );

      try {
        const result = await (
          action === "complete"
            ? completeStep({ enrollmentId, stepId })
            : startStep({ enrollmentId, stepId })
        ).unwrap();

        dispatch(
          professionalApi.util.updateQueryData(
            "professionalMyRoadmaps",
            variables,
            (draft) => applyStepProgress(draft, result as StepProgressResult),
          ),
        );
        return result;
      } catch {
        patch.undo();
        setFailedStepId(stepId);
        return null;
      } finally {
        setPending(null);
      }
    },
    [completeStep, dispatch, startStep, variables],
  );

  return {
    pending,
    failedStepId,
    dismissFailure: useCallback(() => setFailedStepId(null), []),
    start: useCallback(
      (enrollmentId: string, stepId: string) =>
        run("start", enrollmentId, stepId),
      [run],
    ),
    complete: useCallback(
      (enrollmentId: string, stepId: string) =>
        run("complete", enrollmentId, stepId),
      [run],
    ),
  };
};
