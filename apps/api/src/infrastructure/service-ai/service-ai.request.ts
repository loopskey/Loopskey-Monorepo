import {
  SERVICE_AI_CREDIT_PATTERN,
  SERVICE_AI_LIMITS,
  type ProviderChatMessage,
  type ProviderChatTurnRequest,
  type ProviderContentCandidate,
  type ProviderCpdContext,
  type ProviderDraftState,
  type ProviderGenerateRequest,
  type ProviderSubjectOption,
} from "./generated/service-ai.types";
import {
  BUDGET_PREFERENCE_OUTBOUND,
  CHAT_ROLE_OUTBOUND,
  CONTENT_TYPE_OUTBOUND,
  LEARNING_FORMAT_OUTBOUND,
  SKILL_LEVEL_OUTBOUND,
  STEP_TO_SECTION,
  TIME_COMMITMENT_OUTBOUND,
  toProviderDate,
} from "./service-ai.translation";
import {
  ServiceAiRequestError,
  type ChatTurnInput,
  type GenerateInput,
  type RoadmapCpdContext,
  type RoadmapDraftState,
  type RoadmapSubjectOption,
} from "./service-ai.port";

export type OutboundDrops = { formats: number; historyMessages: number };

const CREDIT_RULE = new RegExp(`${SERVICE_AI_CREDIT_PATTERN}$`);

const withinCount = <TItem>(
  value: TItem[],
  allowed: number,
  limit: string,
): TItem[] => {
  if (value.length > allowed)
    throw new ServiceAiRequestError(limit, value.length, allowed);
  return value;
};

const withinLength = (value: string, allowed: number, limit: string) => {
  if (value.length > allowed)
    throw new ServiceAiRequestError(limit, value.length, allowed);
  return value;
};

const text = (
  value: string | null | undefined,
  allowed: number,
  limit: string,
): string | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return withinLength(trimmed, allowed, limit);
};

export const toCreditString = (value: number, limit: string): string => {
  if (!Number.isFinite(value) || value < 0)
    throw new ServiceAiRequestError(limit, value, 0);
  const serialised = value
    .toFixed(2)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
  if (!CREDIT_RULE.test(serialised))
    throw new ServiceAiRequestError(limit, value, 999999.99);
  return serialised;
};

const unique = <T>(values: T[]) => [...new Set(values)];

const buildDraft = (
  draft: RoadmapDraftState,
  drops: OutboundDrops,
): ProviderDraftState => {
  const formats = draft.preferredFormats
    ? unique(
        draft.preferredFormats.map(
          (format) => LEARNING_FORMAT_OUTBOUND[format],
        ),
      )
    : null;
  /**
   * No format has been untranslatable since contract 1.1.0, so anything this
   * counts is a duplicate the caller supplied rather than contract loss.
   */
  drops.formats +=
    (draft.preferredFormats?.length ?? 0) - (formats?.length ?? 0);

  return {
    goal: text(draft.goal, SERVICE_AI_LIMITS.goalMaxLength, "goal"),
    context: text(draft.context, SERVICE_AI_LIMITS.contextMaxLength, "context"),
    target_role: text(
      draft.targetRole,
      SERVICE_AI_LIMITS.targetRoleMaxLength,
      "targetRole",
    ),
    goal_reason: text(
      draft.goalReason,
      SERVICE_AI_LIMITS.goalReasonMaxLength,
      "goalReason",
    ),
    certification_name: text(
      draft.certificationName,
      SERVICE_AI_LIMITS.certificationNameMaxLength,
      "certificationName",
    ),
    target_date: draft.targetDate ? toProviderDate(draft.targetDate) : null,
    skill_level: draft.skillLevel
      ? SKILL_LEVEL_OUTBOUND[draft.skillLevel]
      : null,
    available_time: draft.timeCommitment
      ? TIME_COMMITMENT_OUTBOUND[draft.timeCommitment]
      : null,
    budget: draft.budgetPreference
      ? BUDGET_PREFERENCE_OUTBOUND[draft.budgetPreference]
      : null,
    subjects: draft.subjects
      ? withinCount(
          unique(draft.subjects),
          SERVICE_AI_LIMITS.subjectsMaxItems,
          "subjects",
        )
      : null,
    formats: formats
      ? withinCount(formats, SERVICE_AI_LIMITS.formatsMaxItems, "formats")
      : null,
    content_types: draft.preferredContentTypes
      ? withinCount(
          unique(
            draft.preferredContentTypes.map(
              (type) => CONTENT_TYPE_OUTBOUND[type],
            ),
          ),
          SERVICE_AI_LIMITS.contentTypesMaxItems,
          "contentTypes",
        )
      : null,
    cpd_enabled: draft.cpdEnabled ?? null,
  };
};

const buildSubjectOptions = (
  options: RoadmapSubjectOption[] | undefined,
): ProviderSubjectOption[] => {
  const built = (options ?? []).map((option) => ({
    id: withinLength(
      option.id,
      SERVICE_AI_LIMITS.subjectOptionIdMaxLength,
      "subjectOptionId",
    ),
    label: withinLength(
      option.label,
      SERVICE_AI_LIMITS.subjectOptionLabelMaxLength,
      "subjectOptionLabel",
    ),
  }));
  return withinCount(
    built,
    SERVICE_AI_LIMITS.subjectOptionsMaxItems,
    "subjectOptions",
  );
};

export const buildChatTurnRequest = (
  input: ChatTurnInput,
): { body: ProviderChatTurnRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };

  const history: ProviderChatMessage[] = [];
  for (const entry of input.history ?? []) {
    const role = CHAT_ROLE_OUTBOUND[entry.role];
    const content = entry.content.trim();
    if (!role || !content) {
      drops.historyMessages += 1;
      continue;
    }
    history.push({
      role,
      content: withinLength(
        content,
        SERVICE_AI_LIMITS.historyMessageMaxLength,
        "historyMessage",
      ),
    });
  }
  withinCount(history, SERVICE_AI_LIMITS.historyMaxItems, "history");

  return {
    drops,
    body: {
      history,
      locale: input.locale ?? "en",
      today: toProviderDate(input.today),
      draft: buildDraft(input.draft, drops),
      current_step: STEP_TO_SECTION[input.currentStep],
      subject_options: buildSubjectOptions(input.subjectOptions),
      user_message: text(
        input.userMessage,
        SERVICE_AI_LIMITS.userMessageMaxLength,
        "userMessage",
      ),
    },
  };
};

const buildCandidate = (
  candidate: GenerateInput["candidates"][number],
): ProviderContentCandidate => ({
  tags: candidate.tags ?? [],
  title: candidate.title,
  is_free: candidate.isFree,
  summary: candidate.summary ?? null,
  content_id: candidate.contentId,
  content_type: CONTENT_TYPE_OUTBOUND[candidate.contentType],
  level: candidate.level ? SKILL_LEVEL_OUTBOUND[candidate.level] : null,
  duration_minutes: candidate.durationMinutes ?? null,
  credits:
    candidate.credits === null || candidate.credits === undefined
      ? null
      : toCreditString(candidate.credits, "candidateCredits"),
});

const buildCpd = (cpd: RoadmapCpdContext): ProviderCpdContext => ({
  organization: cpd.organization,
  certification_name: cpd.certificationName,
  reporting_end: cpd.reportingEnd ? toProviderDate(cpd.reportingEnd) : null,
  completed_credits: toCreditString(cpd.completedCredits, "completedCredits"),
  remaining_credits: toCreditString(cpd.remainingCredits, "remainingCredits"),
  total_required_credits: toCreditString(
    cpd.totalRequiredCredits,
    "totalRequiredCredits",
  ),
});

export const buildGenerateRequest = (
  input: GenerateInput,
): { body: ProviderGenerateRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };

  if (input.candidates.length < SERVICE_AI_LIMITS.candidatesMinItems)
    throw new ServiceAiRequestError(
      "candidatesMinItems",
      input.candidates.length,
      SERVICE_AI_LIMITS.candidatesMinItems,
    );
  withinCount(
    input.candidates,
    SERVICE_AI_LIMITS.candidatesMaxItems,
    "candidates",
  );

  const maxPhases = input.maxPhases ?? SERVICE_AI_LIMITS.maxPhasesDefault;
  if (
    maxPhases < SERVICE_AI_LIMITS.maxPhasesMinimum ||
    maxPhases > SERVICE_AI_LIMITS.maxPhasesMaximum
  )
    throw new ServiceAiRequestError(
      "maxPhases",
      maxPhases,
      SERVICE_AI_LIMITS.maxPhasesMaximum,
    );

  return {
    drops,
    body: {
      max_phases: maxPhases,
      locale: input.locale ?? "en",
      today: toProviderDate(input.today),
      draft: buildDraft(input.draft, drops),
      cpd: input.cpd ? buildCpd(input.cpd) : null,
      candidates: input.candidates.map(buildCandidate),
      subject_options: buildSubjectOptions(input.subjectOptions),
    },
  };
};
