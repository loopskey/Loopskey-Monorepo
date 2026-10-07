import { RoadmapDraftStep } from "@prisma/client";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

export type RoadmapContractField =
  | "goal"
  | "subjects"
  | "skillLevel"
  | "cpdAnswered"
  | "timeCommitment"
  | "budgetPreference"
  | "certificationName";

export type RoadmapContractFieldsInput = Pick<
  RoadmapDraftFields,
  | "goal"
  | "subjects"
  | "skillLevel"
  | "cpdEnabled"
  | "cpdAnswered"
  | "timeCommitment"
  | "budgetPreference"
  | "certificationName"
>;

const STEP_OF_FIELD: Record<RoadmapContractField, RoadmapDraftStep> = {
  goal: RoadmapDraftStep.GOAL,
  skillLevel: RoadmapDraftStep.PREFERENCES,
  timeCommitment: RoadmapDraftStep.PREFERENCES,
  subjects: RoadmapDraftStep.PREFERENCES,
  budgetPreference: RoadmapDraftStep.PREFERENCES,
  cpdAnswered: RoadmapDraftStep.CPD_TRACKING,
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
  const needsCertification = draft.cpdAnswered && draft.cpdEnabled;

  const required: [RoadmapContractField, boolean][] = [
    ["goal", isFilled(draft.goal)],
    ["skillLevel", !!draft.skillLevel],
    ["timeCommitment", !!draft.timeCommitment],
    ["subjects", subjects.length > 0],
    ["budgetPreference", !!draft.budgetPreference],
    ["cpdAnswered", draft.cpdAnswered],
  ];
  if (needsCertification)
    required.push(["certificationName", isFilled(draft.certificationName)]);

  const missingFields = required
    .filter(([, isComplete]) => !isComplete)
    .map(([field]) => field);

  return {
    missingFields,
    requiredFieldCount: required.length,
    isValid: missingFields.length === 0,
    completedFieldCount: required.length - missingFields.length,
  };
};

export const roadmapContractProgress = (
  draft: RoadmapContractFieldsInput,
  knownSubjectIds?: ReadonlySet<string>,
) => {
  const { missingFields, requiredFieldCount, completedFieldCount } =
    getRoadmapDraftContractReadiness(draft, knownSubjectIds);
  return {
    missingFields,
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
