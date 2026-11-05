import { LEARNING_BUDGET_PREFERENCES } from "@/utils/professional-profile.constant";
import { LEARNING_TIME_COMMITMENTS } from "@/utils/professional-profile.constant";
import { DELIVERY_FORMATS } from "@/utils/professional-profile.constant";
import { LEARNING_FORMATS } from "@/utils/professional-profile.constant";
import { SKILL_LEVELS } from "@/utils/professional-profile.constant";
import { ContentType } from "@/lib/graphql/base";

import type { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import type { I18nContextValue } from "@/types/providers.types";

import type * as T from "@/types/professional-roadmap-chat.types";

const OPTION_NS = "professionalDashboard.profile.options";
const REVIEW_NS = "professionalRoadmapChat.review";

export type BriefField = keyof T.Patch;

export const briefFieldOf = (field: RoadmapDraftFieldKey): BriefField =>
  field
    .toLowerCase()
    .replace(/_([a-z])/g, (_match, letter: string) =>
      letter.toUpperCase(),
    ) as BriefField;

export const hasBriefValue = (value: T.Row["value"]) =>
  Array.isArray(value)
    ? value.length > 0
    : value !== null && value !== undefined && value !== "";

export const buildBriefRows = (
  draft: T.TRoadmapDraft,
): Record<BriefField, T.Row> => {
  const rows: T.Row[] = [
    {
      field: "goal",
      editor: { kind: "text", multiline: true },
      value: draft.goal,
    },
    {
      field: "targetRole",
      editor: { kind: "text", multiline: false },
      value: draft.targetRole,
    },
    {
      field: "goalReason",
      editor: { kind: "text", multiline: true },
      value: draft.goalReason,
    },
    {
      field: "context",
      editor: { kind: "text", multiline: true },
      value: draft.context,
    },
    { field: "targetDate", editor: { kind: "date" }, value: draft.targetDate },
    {
      field: "skillLevel",
      editor: {
        kind: "single",
        values: SKILL_LEVELS,
        labelNs: `${OPTION_NS}.skillLevel`,
      },
      value: draft.skillLevel,
    },
    {
      field: "timeCommitment",
      editor: {
        kind: "single",
        values: LEARNING_TIME_COMMITMENTS,
        labelNs: `${OPTION_NS}.learningTime`,
      },
      value: draft.timeCommitment,
    },
    {
      field: "budgetPreference",
      editor: {
        kind: "single",
        values: LEARNING_BUDGET_PREFERENCES,
        labelNs: `${OPTION_NS}.budget`,
      },
      value: draft.budgetPreference,
    },
    { field: "subjects", editor: { kind: "subjects" }, value: draft.subjects },
    {
      field: "preferredFormats",
      editor: {
        kind: "multi",
        values: LEARNING_FORMATS,
        labelNs: `${OPTION_NS}.learningFormat`,
      },
      value: draft.preferredFormats,
    },
    {
      field: "preferredContentTypes",
      editor: {
        kind: "multi",
        values: Object.values(ContentType),
        labelNs: "professionalRoadmapChat.enum.contentType",
      },
      value: draft.preferredContentTypes,
    },
    {
      field: "preferredDeliveryFormats",
      editor: {
        kind: "multi",
        values: DELIVERY_FORMATS,
        labelNs: `${OPTION_NS}.deliveryFormat`,
      },
      value: draft.preferredDeliveryFormats,
    },
    {
      field: "cpdEnabled",
      editor: { kind: "boolean" },
      value: draft.cpdAnswered ? draft.cpdEnabled : null,
    },
    {
      field: "certificationName",
      editor: { kind: "text", multiline: false },
      value: draft.certificationName,
    },
  ];
  return Object.fromEntries(rows.map((row) => [row.field, row])) as Record<
    BriefField,
    T.Row
  >;
};

export const briefRowText = (
  row: T.Row,
  draft: T.TRoadmapDraft,
  t: I18nContextValue["t"],
  language: string,
): string | null => {
  const { value, editor } = row;
  if (!hasBriefValue(value)) return null;
  if (editor.kind === "boolean")
    return value ? t(`${REVIEW_NS}.yes`) : t(`${REVIEW_NS}.no`);
  if (Array.isArray(value)) {
    if (editor.kind === "subjects")
      return value
        .map(
          (id) =>
            draft.subjectOptions.find((option) => option.id === id)?.label ??
            id,
        )
        .join(", ");
    if (editor.kind === "multi")
      return value.map((entry) => t(`${editor.labelNs}.${entry}`)).join(", ");
    return value.join(", ");
  }
  if (editor.kind === "single") return t(`${editor.labelNs}.${String(value)}`);
  if (editor.kind === "date")
    return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      new Date(String(value)),
    );
  return String(value);
};
