import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

export const toDraftFields = (
  draft: RoadmapDraftFields,
): RoadmapDraftFields => ({
  goal: draft.goal,
  context: draft.context,
  subjects: draft.subjects,
  targetDate: draft.targetDate,
  targetRole: draft.targetRole,
  goalReason: draft.goalReason,
  skillLevel: draft.skillLevel,
  cpdEnabled: draft.cpdEnabled,
  cpdAnswered: draft.cpdAnswered,
  timeCommitment: draft.timeCommitment,
  certificationId: draft.certificationId,
  requiredCredits: draft.requiredCredits,
  completedCredits: draft.completedCredits,
  budgetPreference: draft.budgetPreference,
  preferredFormats: draft.preferredFormats,
  certificationName: draft.certificationName,
  preferredContentTypes: draft.preferredContentTypes,
  preferredDeliveryFormats: draft.preferredDeliveryFormats,
});
