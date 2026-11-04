import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

type ComparableKey = Exclude<
  keyof RoadmapDraftFields,
  | "cpdAnswered"
  | "certificationId"
  | "requiredCredits"
  | "completedCredits"
  | "preferredDeliveryFormats"
> &
  string;

const COMPARED: readonly ComparableKey[] = [
  "goal",
  "context",
  "subjects",
  "goalReason",
  "targetRole",
  "targetDate",
  "cpdEnabled",
  "skillLevel",
  "timeCommitment",
  "budgetPreference",
  "preferredFormats",
  "certificationName",
  "preferredContentTypes",
];

const normalise = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return String(value.getTime());
  if (Array.isArray(value))
    return JSON.stringify([...value].map(String).sort());
  if (typeof value === "string") return value.trim();
  return String(value);
};

export const changedDraftFields = (
  baseline: RoadmapDraftFields,
  current: RoadmapDraftFields,
): ComparableKey[] =>
  COMPARED.filter(
    (field) => normalise(baseline[field]) !== normalise(current[field]),
  );
