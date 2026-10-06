import { RoadmapDraftStep } from "@prisma/client";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

export type RoadmapContractField =
  | "goal"
  | "skillLevel"
  | "timeCommitment"
  | "subjects"
  | "certificationName";

export type RoadmapContractFieldsInput = Pick<
  RoadmapDraftFields,
  | "goal"
  | "skillLevel"
  | "timeCommitment"
  | "subjects"
  | "cpdEnabled"
  | "certificationName"
>;

const BASE_CONTRACT_FIELD_COUNT = 4;

const STEP_OF_FIELD: Record<RoadmapContractField, RoadmapDraftStep> = {
  goal: RoadmapDraftStep.GOAL,
  skillLevel: RoadmapDraftStep.PREFERENCES,
  timeCommitment: RoadmapDraftStep.PREFERENCES,
  subjects: RoadmapDraftStep.PREFERENCES,
  certificationName: RoadmapDraftStep.CERTIFICATION,
};

const isFilled = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;

export const getRoadmapDraftContractReadiness = (
  draft: RoadmapContractFieldsInput,
  knownSubjectIds?: ReadonlySet<string>,
) => {
  const subjects = knownSubjectIds
    ? draft.subjects.filter((id) => knownSubjectIds.has(id))
    : draft.subjects;
  const missingFields: RoadmapContractField[] = [];
  if (!isFilled(draft.goal)) missingFields.push("goal");
  if (!draft.skillLevel) missingFields.push("skillLevel");
  if (!draft.timeCommitment) missingFields.push("timeCommitment");
  if (subjects.length === 0) missingFields.push("subjects");
  if (draft.cpdEnabled && !isFilled(draft.certificationName))
    missingFields.push("certificationName");

  const requiredFieldCount =
    BASE_CONTRACT_FIELD_COUNT + (draft.cpdEnabled ? 1 : 0);

  return {
    missingFields,
    requiredFieldCount,
    isValid: missingFields.length === 0,
    completedFieldCount: requiredFieldCount - missingFields.length,
  };
};

export const roadmapContractProgress = (
  draft: RoadmapContractFieldsInput,
  knownSubjectIds?: ReadonlySet<string>,
) => {
  const { missingFields, requiredFieldCount, completedFieldCount } =
    getRoadmapDraftContractReadiness(draft, knownSubjectIds);
  return {
    requiredFieldCount,
    completedFieldCount,
    remainingFields: [
      ...new Set(missingFields.map((field) => STEP_OF_FIELD[field])),
    ],
  };
};

export const stepOfFirstMissingField = (
  missingFields: readonly RoadmapContractField[],
): RoadmapDraftStep | null =>
  missingFields.length > 0 ? STEP_OF_FIELD[missingFields[0]] : null;
