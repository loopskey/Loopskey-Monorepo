import { LearningBudgetPreference } from "@prisma/client";
import { LearningTimeCommitment } from "@prisma/client";
import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";
import { SkillLevel } from "@prisma/client";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

export type WidgetAnswerInput = {
  answerField?: RoadmapDraftFieldKey | null;
  answerValue?: string | null;
};

const isMember = <TEnum extends Record<string, string>>(
  members: TEnum,
  value: string,
): value is TEnum[keyof TEnum] => Object.values(members).includes(value);

export const resolveWidgetAnswer = (
  input: WidgetAnswerInput,
): Partial<RoadmapDraftFields> | null | "invalid" => {
  const { answerField, answerValue } = input;
  if (!answerField && (answerValue === undefined || answerValue === null))
    return null;
  if (!answerField || typeof answerValue !== "string") return "invalid";

  switch (answerField) {
    case RoadmapDraftFieldKey.SKILL_LEVEL:
      return isMember(SkillLevel, answerValue)
        ? { skillLevel: answerValue }
        : "invalid";
    case RoadmapDraftFieldKey.TIME_COMMITMENT:
      return isMember(LearningTimeCommitment, answerValue)
        ? { timeCommitment: answerValue }
        : "invalid";
    case RoadmapDraftFieldKey.BUDGET_PREFERENCE:
      return isMember(LearningBudgetPreference, answerValue)
        ? { budgetPreference: answerValue }
        : "invalid";
    case RoadmapDraftFieldKey.CPD_ENABLED:
      return answerValue === "true" || answerValue === "false"
        ? { cpdEnabled: answerValue === "true", cpdAnswered: true }
        : "invalid";
    default:
      return "invalid";
  }
};
