import {
  BUDGET_PREFERENCE_INBOUND,
  CONTENT_TYPE_INBOUND,
  DRAFT_FIELD_INBOUND,
  LEARNING_FORMAT_INBOUND,
  SECTION_INBOUND,
  SKILL_LEVEL_INBOUND,
  TIME_COMMITMENT_INBOUND,
  WIDGET_TYPE_INBOUND,
  fromProviderDate,
  inbound,
} from "./service-ai.translation";
import {
  type ChatTurnData,
  type GenerateData,
  type GeneratedRoadmapPhase,
  type GeneratedRoadmapStep,
  type RoadmapDraftField,
  type RoadmapDraftState,
  type RoadmapWidget,
} from "./service-ai.port";
import { type ProviderErrorResponse } from "./generated/service-ai.types";

class ResponseShapeError extends Error {}

const invalid = (path: string): never => {
  throw new ResponseShapeError(path);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const record = (value: unknown, path: string): Record<string, unknown> =>
  isRecord(value) ? value : invalid(path);

const absent = (value: unknown) => value === undefined || value === null;

const text = (value: unknown, path: string): string =>
  typeof value === "string" && value.length > 0 ? value : invalid(path);

const flag = (value: unknown, path: string): boolean =>
  typeof value === "boolean" ? value : invalid(path);

const count = (value: unknown, path: string, minimum: number): number =>
  typeof value === "number" && Number.isInteger(value) && value >= minimum
    ? value
    : invalid(path);

const list = (value: unknown, path: string): unknown[] =>
  Array.isArray(value) ? value : invalid(path);

const optional = <T>(
  value: unknown,
  path: string,
  parse: (value: unknown) => T | undefined,
): T | null => {
  if (absent(value)) return null;
  return parse(value) ?? invalid(path);
};

const enumeration =
  <TKey extends string, TValue>(table: Record<TKey, TValue>) =>
  (value: unknown) =>
    inbound(table, value);

const parseDraftState = (
  value: unknown,
  path: string,
): { draft: RoadmapDraftState; clearedFields: RoadmapDraftField[] } => {
  const fields = record(value, path);
  const strings = (raw: unknown, at: string, allowed?: number) =>
    optional(raw, at, (entry) => {
      if (!Array.isArray(entry)) return undefined;
      const parsed = entry.map((item) =>
        typeof item === "string" && item.length > 0 ? item : undefined,
      );
      if (parsed.some((item) => item === undefined)) return undefined;
      if (allowed !== undefined && parsed.length > allowed) return undefined;
      return parsed as string[];
    });

  const mapped = <T>(
    raw: unknown,
    at: string,
    parse: (v: unknown) => T | undefined,
  ) =>
    optional(raw, at, (entry) => {
      if (!Array.isArray(entry)) return undefined;
      const parsed = entry.map(parse);
      return parsed.some((item) => item === undefined)
        ? undefined
        : (parsed as T[]);
    });

  return {
    clearedFields:
      mapped(
        fields.cleared_fields,
        `${path}.cleared_fields`,
        enumeration(DRAFT_FIELD_INBOUND),
      ) ?? [],
    draft: {
      goal: optional(fields.goal, `${path}.goal`, (entry) =>
        typeof entry === "string" && entry.length > 0 ? entry : undefined,
      ),
      context: optional(fields.context, `${path}.context`, (entry) =>
        typeof entry === "string" && entry.length > 0 ? entry : undefined,
      ),
      targetRole: optional(
        fields.target_role,
        `${path}.target_role`,
        (entry) =>
          typeof entry === "string" && entry.length > 0 ? entry : undefined,
      ),
      goalReason: optional(
        fields.goal_reason,
        `${path}.goal_reason`,
        (entry) =>
          typeof entry === "string" && entry.length > 0 ? entry : undefined,
      ),
      certificationName: optional(
        fields.certification_name,
        `${path}.certification_name`,
        (entry) =>
          typeof entry === "string" && entry.length > 0 ? entry : undefined,
      ),
      targetDate: optional(
        fields.target_date,
        `${path}.target_date`,
        fromProviderDate,
      ),
      cpdEnabled: optional(
        fields.cpd_enabled,
        `${path}.cpd_enabled`,
        (entry) => (typeof entry === "boolean" ? entry : undefined),
      ),
      skillLevel: optional(
        fields.skill_level,
        `${path}.skill_level`,
        enumeration(SKILL_LEVEL_INBOUND),
      ),
      timeCommitment: optional(
        fields.available_time,
        `${path}.available_time`,
        enumeration(TIME_COMMITMENT_INBOUND),
      ),
      budgetPreference: optional(
        fields.budget,
        `${path}.budget`,
        enumeration(BUDGET_PREFERENCE_INBOUND),
      ),
      subjects: strings(fields.subjects, `${path}.subjects`),
      preferredFormats: mapped(
        fields.formats,
        `${path}.formats`,
        enumeration(LEARNING_FORMAT_INBOUND),
      ),
      preferredContentTypes: mapped(
        fields.content_types,
        `${path}.content_types`,
        enumeration(CONTENT_TYPE_INBOUND),
      ),
    },
  };
};

const parseWidget = (value: unknown, path: string): RoadmapWidget | null => {
  if (absent(value)) return null;
  const widget = record(value, path);
  return {
    type: inbound(WIDGET_TYPE_INBOUND, widget.type) ?? invalid(`${path}.type`),
    field:
      inbound(DRAFT_FIELD_INBOUND, widget.field) ?? invalid(`${path}.field`),
    maxSelections: absent(widget.max_selections)
      ? null
      : count(widget.max_selections, `${path}.max_selections`, 1),
    options: list(widget.options ?? [], `${path}.options`).map(
      (option, index) => {
        const entry = record(option, `${path}.options[${index}]`);
        return {
          value: text(entry.value, `${path}.options[${index}].value`),
          label: text(entry.label, `${path}.options[${index}].label`),
        };
      },
    ),
  };
};

const parseStep = (value: unknown, path: string): GeneratedRoadmapStep => {
  const step = record(value, path);
  return {
    order: count(step.order, `${path}.order`, 1),
    title: text(step.title, `${path}.title`),
    description: text(step.description, `${path}.description`),
    contentId: absent(step.content_id)
      ? null
      : text(step.content_id, `${path}.content_id`),
    estimatedMinutes: absent(step.estimated_minutes)
      ? null
      : count(step.estimated_minutes, `${path}.estimated_minutes`, 0),
    contentType: optional(
      step.content_type,
      `${path}.content_type`,
      enumeration(CONTENT_TYPE_INBOUND),
    ),
  };
};

const parsePhase = (value: unknown, path: string): GeneratedRoadmapPhase => {
  const phase = record(value, path);
  const steps = list(phase.steps, `${path}.steps`);
  if (!steps.length) invalid(`${path}.steps`);
  return {
    order: count(phase.order, `${path}.order`, 1),
    title: text(phase.title, `${path}.title`),
    description: text(phase.description, `${path}.description`),
    estimatedWeeks: count(phase.estimated_weeks, `${path}.estimated_weeks`, 1),
    steps: steps.map((step, index) =>
      parseStep(step, `${path}.steps[${index}]`),
    ),
  };
};

const guard = <T>(parse: () => T): T | undefined => {
  try {
    return parse();
  } catch (error) {
    if (error instanceof ResponseShapeError) return undefined;
    throw error;
  }
};

export const parseChatTurnResponse = (
  body: unknown,
): ChatTurnData | undefined =>
  guard(() => {
    const response = record(body, "chatTurn");
    const extracted = parseDraftState(response.extracted, "extracted");
    return {
      extracted: extracted.draft,
      clearedFields: extracted.clearedFields,
      widget: parseWidget(response.widget, "widget"),
      isComplete: flag(response.is_complete, "is_complete"),
      assistantMessage: text(response.assistant_message, "assistant_message"),
      needsClarification: flag(
        response.needs_clarification,
        "needs_clarification",
      ),
      suggestedNextSection: optional(
        response.suggested_next_step,
        "suggested_next_step",
        enumeration(SECTION_INBOUND),
      ),
    };
  });

export const parseGenerateResponse = (
  body: unknown,
): GenerateData | undefined =>
  guard(() => {
    const response = record(body, "generate");
    const phases = list(response.phases, "phases");
    if (!phases.length) invalid("phases");
    return {
      title: text(response.title, "title"),
      description: text(response.description, "description"),
      estimatedWeeks: count(response.estimated_weeks, "estimated_weeks", 1),
      level: inbound(SKILL_LEVEL_INBOUND, response.level) ?? invalid("level"),
      coverageNote: absent(response.coverage_note)
        ? null
        : text(response.coverage_note, "coverage_note"),
      phases: phases.map((phase, index) =>
        parsePhase(phase, `phases[${index}]`),
      ),
    };
  });

export const parseErrorEnvelope = (
  body: unknown,
): ProviderErrorResponse | undefined =>
  guard(() => {
    const envelope = record(body, "error");
    return {
      code: text(envelope.code, "error.code"),
      message: text(envelope.message, "error.message"),
      retryable: flag(envelope.retryable, "error.retryable"),
      correlation_id: absent(envelope.correlation_id)
        ? null
        : text(envelope.correlation_id, "error.correlation_id"),
    };
  });
