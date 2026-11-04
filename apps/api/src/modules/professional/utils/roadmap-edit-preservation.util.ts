import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import { contentKey } from "@professional/utils/roadmap-edit-shape.util";

import type { RoadmapChangeOperation } from "@infrastructure/service-ai/service-ai.port";
import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { StepProgressByStep } from "@professional/utils/roadmap-edit-shape.util";
import type { EditableRoadmap } from "@professional/utils/roadmap-edit-shape.util";
import type { CandidateKey } from "@professional/utils/roadmap-generation-verify.util";

export type PreservationPolicy = {
  completedSteps: boolean;
  inProgressSteps: boolean;
  unaffectedPhases: boolean;
};

export const FULL_PRESERVATION: PreservationPolicy = {
  completedSteps: true,
  inProgressSteps: true,
  unaffectedPhases: true,
};

export type ProtectedStep = {
  title: string;
  stepId: string;
  key: string | null;
  contentId: string | null;
  contentType: PlatformContentType | null;
};

const isProtected = (
  progress: StepProgressByStep,
  stepId: string,
  policy: PreservationPolicy,
) => {
  const status = progress.get(stepId);
  if (status === "COMPLETED") return policy.completedSteps;
  if (status === "IN_PROGRESS") return policy.inProgressSteps;
  return false;
};

export const protectedStepsOf = (
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
  policy: PreservationPolicy = FULL_PRESERVATION,
): ProtectedStep[] =>
  roadmap.phases.flatMap((phase) =>
    phase.steps
      .filter((step) => isProtected(progress, step.id, policy))
      .map((step) => ({
        stepId: step.id,
        title: step.title,
        key: contentKey(step.contentType, step.contentId),
        contentId: step.contentId,
        contentType: step.contentType,
      })),
  );

export const unidentifiableProtectedSteps = (protectedSteps: ProtectedStep[]) =>
  protectedSteps.filter((step) => step.key === null);

const WHOLE_ROADMAP_OPERATIONS: ReadonlySet<string> = new Set([
  "MODIFY_ROADMAP",
  "REBUILD_ROADMAP",
  "UPDATE_DRAFT",
]);

export const unaffectedPhaseIds = (
  roadmap: EditableRoadmap,
  operations: readonly RoadmapChangeOperation[],
  draftChanged: boolean,
): string[] => {
  if (draftChanged) return [];
  if (operations.some((op) => WHOLE_ROADMAP_OPERATIONS.has(op.operation)))
    return [];

  const stepToPhase = new Map<string, string>();
  for (const phase of roadmap.phases)
    for (const step of phase.steps) stepToPhase.set(step.id, phase.id);

  const affected = new Set<string>();
  for (const op of operations) {
    const target = op.targetId;
    if (!target) continue;
    if (stepToPhase.has(target)) affected.add(stepToPhase.get(target)!);
    else affected.add(target);
  }
  return roadmap.phases
    .map((phase) => phase.id)
    .filter((id) => !affected.has(id));
};

export const preservedContent = (
  roadmap: EditableRoadmap,
  protectedSteps: ProtectedStep[],
  unaffected: readonly string[],
  retainEverything: boolean,
): CandidateKey[] => {
  const kept = new Map<string, CandidateKey>();
  const keep = (
    contentType: PlatformContentType | null,
    contentId: string | null,
  ) => {
    const key = contentKey(contentType, contentId);
    if (key && contentType && contentId && !kept.has(key))
      kept.set(key, { contentType, contentId, isFree: true });
  };
  for (const step of protectedSteps) keep(step.contentType, step.contentId);
  const unaffectedSet = new Set(unaffected);
  for (const phase of roadmap.phases)
    if (retainEverything || unaffectedSet.has(phase.id))
      for (const step of phase.steps) keep(step.contentType, step.contentId);
  return [...kept.values()];
};

export type PreservationVerdict =
  | { ok: true }
  | { ok: false; violation: RoadmapGenerationViolation; offending: string };

export const verifyPreservation = (input: {
  roadmap: EditableRoadmap;
  protectedSteps: ProtectedStep[];
  unaffected: readonly string[];
  generated: {
    steps: { contentId: string | null; contentType: string | null }[];
  }[];
}): PreservationVerdict => {
  const present = new Set<string>();
  for (const phase of input.generated)
    for (const step of phase.steps) {
      const key = contentKey(step.contentType, step.contentId);
      if (key) present.add(key);
    }

  for (const step of input.protectedSteps)
    if (step.key && !present.has(step.key))
      return {
        ok: false,
        violation: RoadmapGenerationViolation.PROTECTED_CONTENT_DROPPED,
        offending: step.key,
      };

  const unaffectedSet = new Set(input.unaffected);
  for (const phase of input.roadmap.phases) {
    if (!unaffectedSet.has(phase.id)) continue;
    for (const step of phase.steps) {
      const key = contentKey(step.contentType, step.contentId);
      if (key && !present.has(key))
        return {
          ok: false,
          violation: RoadmapGenerationViolation.UNAFFECTED_PHASE_CHANGED,
          offending: key,
        };
    }
  }
  return { ok: true };
};
