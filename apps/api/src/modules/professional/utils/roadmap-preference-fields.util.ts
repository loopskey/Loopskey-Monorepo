import type { RoadmapWidgetField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

export const PREFERENCE_FIELD_ORDER: readonly RoadmapWidgetField[] = [
  "skillLevel",
  "subjects",
  "preferredFormats",
  "timeCommitment",
  "preferredDeliveryFormats",
  "budgetPreference",
] as const;

export const PREFERENCE_FIELDS: ReadonlySet<RoadmapWidgetField> = new Set(
  PREFERENCE_FIELD_ORDER,
);

export const isPreferenceFieldAnswered = (
  draft: RoadmapDraftFields,
  field: RoadmapWidgetField,
): boolean => {
  switch (field) {
    case "skillLevel":
      return draft.skillLevel !== null;
    case "subjects":
      return draft.subjects.length > 0;
    case "preferredFormats":
      return draft.preferredFormats.length > 0;
    case "timeCommitment":
      return draft.timeCommitment !== null;
    case "preferredDeliveryFormats":
      return draft.preferredDeliveryFormats.length > 0;
    case "budgetPreference":
      return draft.budgetPreference !== null;
    default:
      return true;
  }
};

export const firstMissingPreferenceField = (
  draft: RoadmapDraftFields,
): RoadmapWidgetField | null =>
  PREFERENCE_FIELD_ORDER.find(
    (field) => !isPreferenceFieldAnswered(draft, field),
  ) ?? null;
