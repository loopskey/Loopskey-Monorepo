import type {
  RoadmapDraftField,
  RoadmapDraftState,
} from "@infrastructure/service-ai/service-ai.port";
import type {
  RoadmapDraftFields,
  RoadmapSubjectOption,
} from "@professional/types/professional-roadmap-chat.types";

/**
 * A field the provider can extract only counts as extractable while the value
 * it produces still fits the column it lands in. If the port and the schema
 * ever disagree — a new skill level on one side only — the field resolves to
 * `never` and listing it below stops compiling, which is the point.
 */
type Extractable<TField extends RoadmapDraftField> =
  NonNullable<RoadmapDraftState[TField]> extends RoadmapDraftFields[TField]
    ? TField
    : never;

type ExtractableField = {
  [TField in RoadmapDraftField]: Extractable<TField>;
}[RoadmapDraftField];

const EXTRACTABLE: readonly ExtractableField[] = [
  "goal",
  "targetRole",
  "goalReason",
  "context",
  "targetDate",
  "skillLevel",
  "timeCommitment",
  "budgetPreference",
  "subjects",
  "preferredFormats",
  "preferredContentTypes",
  "cpdEnabled",
  "certificationName",
] as const;

/**
 * What clearing each field leaves behind. Arrays empty rather than becoming
 * null because the columns are not nullable, and `cpdEnabled` returns to false
 * because retracting the opt-in is the same as never having given it.
 */
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
  /** Every field the turn spoke about, extracted or retracted. */
  answered: Set<RoadmapDraftField>;
};

/**
 * The professional may name a subject by what they saw on screen. The draft
 * stores taxonomy identifiers, so a label is resolved back to its identifier;
 * anything matching neither is kept verbatim rather than dropped, because
 * silently discarding an answer is worse than storing one the next turn's
 * options will constrain anyway.
 */
const toSubjectId = (
  value: string,
  options: readonly RoadmapSubjectOption[],
): string => {
  const wanted = value.trim();
  if (!wanted) return wanted;
  if (options.some((option) => option.id === wanted)) return wanted;
  const matched = options.find(
    (option) => option.label.toLowerCase() === wanted.toLowerCase(),
  );
  return matched ? matched.id : wanted;
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

/**
 * The `Extractable` guard above is what makes this assignment sound: the
 * signature refuses any value the column cannot hold, so the write itself only
 * has to sidestep TypeScript's inability to index a union key.
 */
const write = <TField extends RoadmapDraftField>(
  changes: Partial<RoadmapDraftFields>,
  field: TField,
  value: NonNullable<RoadmapDraftState[TField]> | RoadmapDraftFields[TField],
) => {
  (changes as Record<RoadmapDraftField, unknown>)[field] = value;
};

/**
 * The provider's documented merge rules, applied exactly:
 *
 * - a non-null value replaces what the draft held;
 * - a null or absent value means the turn said nothing about that field, and
 *   the draft keeps what it had — null is never a clear;
 * - a field named in the cleared list was retracted and returns to empty.
 *
 * Clears are applied after extractions so a field named in both ends up
 * cleared, which is the reading that cannot lose a retraction.
 */
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
    changes.subjects = extracted.subjects.map((subject) =>
      toSubjectId(subject, subjectOptions),
    );
  }

  for (const field of cleared) {
    answered.add(field);
    write(changes, field, CLEARED_VALUE[field]);
  }

  /**
   * The identifier is a resolved form of the name, so retracting the name must
   * take the identifier and the credits it supplied with it. Leaving them
   * behind would let the draft claim a catalogue certification the
   * professional has withdrawn.
   */
  if (cleared.includes("certificationName")) {
    changes.certificationId = null;
    changes.requiredCredits = null;
    changes.completedCredits = null;
  }

  for (const key of Object.keys(changes) as (keyof RoadmapDraftFields)[])
    if (equalToCurrent(current, key, changes[key])) delete changes[key];

  return { changes, answered };
};
