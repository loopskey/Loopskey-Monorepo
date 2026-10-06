import type { RoadmapSubjectOption } from "@professional/types/professional-roadmap-chat.types";
import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";
import type { RoadmapDraftField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapDraftState } from "@infrastructure/service-ai/service-ai.port";

type Extractable<TField extends RoadmapDraftField> =
  NonNullable<RoadmapDraftState[TField]> extends RoadmapDraftFields[TField]
    ? TField
    : never;

type ExtractableField = {
  [TField in RoadmapDraftField]: Extractable<TField>;
}[RoadmapDraftField];

const EXTRACTABLE: readonly ExtractableField[] = [
  "goal",
  "context",
  "subjects",
  "targetDate",
  "targetRole",
  "skillLevel",
  "goalReason",
  "cpdEnabled",
  "timeCommitment",
  "budgetPreference",
  "preferredFormats",
  "certificationName",
  "preferredContentTypes",
] as const;

const CLEARED_VALUE: {
  [TField in RoadmapDraftField]: RoadmapDraftFields[TField];
} = {
  goal: null,
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: null,
  skillLevel: null,
  timeCommitment: null,
  budgetPreference: null,
  subjects: [],
  preferredFormats: [],
  preferredContentTypes: [],
  cpdEnabled: false,
  certificationName: null,
};

export type MergeInput = {
  current: RoadmapDraftFields;
  extracted: RoadmapDraftState;
  cleared: readonly RoadmapDraftField[];
  subjectOptions: readonly RoadmapSubjectOption[];
};

export type MergeResult = {
  changes: Partial<RoadmapDraftFields>;
  answered: Set<RoadmapDraftField>;
};

const normalizeLabel = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const resolveSubjectId = (
  value: string,
  options: readonly RoadmapSubjectOption[],
): string | null => {
  const wanted = value.trim();
  if (!wanted) return null;
  if (options.some((option) => option.id === wanted)) return wanted;
  const normalized = normalizeLabel(wanted);
  const matched = options.find(
    (option) => normalizeLabel(option.label) === normalized,
  );
  return matched ? matched.id : null;
};

export const subjectLabelsOf = (
  ids: readonly string[],
  options: readonly RoadmapSubjectOption[],
): string[] => {
  const labelById = new Map(options.map((option) => [option.id, option.label]));
  return ids.map((id) => labelById.get(id) ?? id);
};

const equalToCurrent = (
  current: RoadmapDraftFields,
  key: keyof RoadmapDraftFields,
  value: unknown,
): boolean => {
  const existing = current[key];
  if (Array.isArray(existing) && Array.isArray(value))
    return (
      existing.length === value.length &&
      existing.every((item, index) => item === value[index])
    );
  if (existing instanceof Date && value instanceof Date)
    return existing.getTime() === value.getTime();
  return existing === value;
};

const write = <TField extends RoadmapDraftField>(
  changes: Partial<RoadmapDraftFields>,
  field: TField,
  value: NonNullable<RoadmapDraftState[TField]> | RoadmapDraftFields[TField],
) => {
  (changes as Record<RoadmapDraftField, unknown>)[field] = value;
};

export const mergeExtractedFields = ({
  current,
  extracted,
  cleared,
  subjectOptions,
}: MergeInput): MergeResult => {
  const changes: Partial<RoadmapDraftFields> = {};
  const answered = new Set<RoadmapDraftField>();

  for (const field of EXTRACTABLE) {
    if (field === "subjects") continue;
    const value = extracted[field];
    if (value === null || value === undefined) continue;
    answered.add(field);
    write(changes, field, value);
  }

  if (extracted.subjects !== null && extracted.subjects !== undefined) {
    answered.add("subjects");
    const valid = [
      ...new Set(
        extracted.subjects
          .map((subject) => resolveSubjectId(subject, subjectOptions))
          .filter((id): id is string => id !== null),
      ),
    ];
    if (valid.length > 0 || extracted.subjects.length === 0)
      changes.subjects = valid;
  }

  for (const field of cleared) {
    answered.add(field);
    write(changes, field, CLEARED_VALUE[field]);
  }

  if (cleared.includes("certificationName")) {
    changes.certificationId = null;
    changes.requiredCredits = null;
    changes.completedCredits = null;
  }
  for (const key of Object.keys(changes) as (keyof RoadmapDraftFields)[])
    if (equalToCurrent(current, key, changes[key])) delete changes[key];
  return { changes, answered };
};
