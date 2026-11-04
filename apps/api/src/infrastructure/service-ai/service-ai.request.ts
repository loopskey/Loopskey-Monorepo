import {
  SERVICE_AI_CREDIT_PATTERN,
  SERVICE_AI_LIMITS,
  type ProviderChangeOperation,
  type ProviderChatMessage,
  type ProviderChatTurnRequest,
  type ProviderCurrentRoadmap,
  type ProviderEditTurnRequest,
  type ProviderRegenerateRequest,
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
  type CurrentRoadmap,
  type EditTurnInput,
  type GenerateInput,
  type RegenerateInput,
  type RoadmapChangeOperation,
  type RoadmapChatEntry,
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

const MAX_CANDIDATE_CREDITS = 999999.99;

const toCandidateCredits = (
  value: number | null | undefined,
  limit: string,
): number | null => {
  if (value === null || value === undefined || !Number.isFinite(value))
    return null;
  if (value <= 0) return null;
  const rounded = Math.round(value * 100) / 100;
  if (rounded > MAX_CANDIDATE_CREDITS)
    throw new ServiceAiRequestError(limit, value, MAX_CANDIDATE_CREDITS);
  return rounded;
};

const toDurationMinutes = (value: number | null | undefined): number | null =>
  value === null || value === undefined || !Number.isFinite(value) || value < 0
    ? null
    : Math.round(value);

const withUniqueIdentity = (
  candidates: GenerateInput["candidates"],
): GenerateInput["candidates"] => {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const identity = `${candidate.contentType}:${candidate.contentId}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

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

const buildHistory = (
  entries: RoadmapChatEntry[] | undefined,
  drops: OutboundDrops,
): ProviderChatMessage[] => {
  const history: ProviderChatMessage[] = [];
  for (const entry of entries ?? []) {
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
  return withinCount(history, SERVICE_AI_LIMITS.historyMaxItems, "history");
};

export const buildChatTurnRequest = (
  input: ChatTurnInput,
): { body: ProviderChatTurnRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };
  const draft =
    Object.keys(input.draft).length === 0 ? {} : buildDraft(input.draft, drops);
  const history = buildHistory(input.history, drops);

  return {
    drops,
    body: {
      history,
      locale: input.locale ?? "en",
      today: toProviderDate(input.today),
      draft,
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

const clip = (value: string, allowed: number) =>
  value.length > allowed ? value.slice(0, allowed) : value;

const clipped = (value: string | null | undefined, allowed: number) => {
  const trimmed = value?.trim();
  return trimmed ? clip(trimmed, allowed) : null;
};

const buildChangeOperations = (
  operations: RoadmapChangeOperation[],
  limit: string,
): ProviderChangeOperation[] =>
  withinCount(
    operations.map((operation) => ({
      operation: operation.operation,
      target_id: operation.targetId,
      instruction: withinLength(
        operation.instruction,
        SERVICE_AI_LIMITS.changeInstructionMaxLength,
        "changeInstruction",
      ),
    })),
    SERVICE_AI_LIMITS.changeOperationsMaxItems,
    limit,
  );

const buildCurrentRoadmap = (
  roadmap: CurrentRoadmap,
): ProviderCurrentRoadmap => {
  withinCount(
    roadmap.phases,
    SERVICE_AI_LIMITS.currentRoadmapPhasesMaxItems,
    "currentRoadmapPhases",
  );
  return {
    title: clipped(roadmap.title, SERVICE_AI_LIMITS.currentTitleMaxLength),
    description: clipped(
      roadmap.description,
      SERVICE_AI_LIMITS.currentDescriptionMaxLength,
    ),
    phases: roadmap.phases.map((phase) => {
      withinCount(
        phase.steps,
        SERVICE_AI_LIMITS.currentPhaseStepsMaxItems,
        "currentPhaseSteps",
      );
      return {
        phase_id: phase.phaseId,
        title: clip(phase.title, SERVICE_AI_LIMITS.currentTitleMaxLength),
        description: clipped(
          phase.description,
          SERVICE_AI_LIMITS.currentDescriptionMaxLength,
        ),
        estimated_weeks: Math.max(1, Math.round(phase.estimatedWeeks)),
        steps: phase.steps.map((step) => ({
          step_id: step.stepId,
          title: clip(step.title, SERVICE_AI_LIMITS.currentTitleMaxLength),
          description: clipped(
            step.description,
            SERVICE_AI_LIMITS.currentDescriptionMaxLength,
          ),
          content_id: step.contentId,
          content_type: step.contentType
            ? CONTENT_TYPE_OUTBOUND[step.contentType]
            : null,
          estimated_minutes: toDurationMinutes(step.estimatedMinutes),
          credits: toCandidateCredits(step.credits, "currentStepCredits"),
          progress: step.progress,
        })),
      };
    }),
  };
};

export const buildEditTurnRequest = (
  input: EditTurnInput,
): { body: ProviderEditTurnRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };
  return {
    drops,
    body: {
      locale: input.locale ?? "en",
      today: toProviderDate(input.today),
      draft: buildDraft(input.draft, drops),
      current_roadmap: buildCurrentRoadmap(input.currentRoadmap),
      history: buildHistory(input.history, drops),
      pending_changes: buildChangeOperations(
        input.pendingChanges,
        "pendingChanges",
      ),
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
  tags: withinCount(
    candidate.tags ?? [],
    SERVICE_AI_LIMITS.candidateTagsMaxItems,
    "candidateTags",
  ),
  title: withinLength(
    candidate.title,
    SERVICE_AI_LIMITS.candidateTitleMaxLength,
    "candidateTitle",
  ),
  is_free: candidate.isFree,
  summary: text(
    candidate.summary,
    SERVICE_AI_LIMITS.candidateSummaryMaxLength,
    "candidateSummary",
  ),
  content_id: withinLength(
    candidate.contentId,
    SERVICE_AI_LIMITS.candidateContentIdMaxLength,
    "candidateContentId",
  ),
  content_type: CONTENT_TYPE_OUTBOUND[candidate.contentType],
  level: candidate.level
    ? (SKILL_LEVEL_OUTBOUND[candidate.level] ?? null)
    : null,
  duration_minutes: toDurationMinutes(candidate.durationMinutes),
  credits: toCandidateCredits(candidate.credits, "candidateCredits"),
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

export const buildRegenerateRequest = (
  input: RegenerateInput,
): { body: ProviderRegenerateRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };

  const candidates = withinCount(
    withUniqueIdentity(input.candidates),
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
      candidates: candidates.map(buildCandidate),
      current_roadmap: buildCurrentRoadmap(input.currentRoadmap),
      change_operations: buildChangeOperations(
        input.changeOperations,
        "changeOperations",
      ),
      subject_options: buildSubjectOptions(input.subjectOptions),
      preservation: {
        preserve_completed_steps: input.preservation.completedSteps,
        preserve_in_progress_steps: input.preservation.inProgressSteps,
        preserve_unaffected_phases: input.preservation.unaffectedPhases,
      },
    },
  };
};

export const buildGenerateRequest = (
  input: GenerateInput,
): { body: ProviderGenerateRequest; drops: OutboundDrops } => {
  const drops: OutboundDrops = { formats: 0, historyMessages: 0 };

  const candidates = withUniqueIdentity(input.candidates);
  if (candidates.length < SERVICE_AI_LIMITS.candidatesMinItems)
    throw new ServiceAiRequestError(
      "candidatesMinItems",
      candidates.length,
      SERVICE_AI_LIMITS.candidatesMinItems,
    );
  withinCount(candidates, SERVICE_AI_LIMITS.candidatesMaxItems, "candidates");

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
      candidates: candidates.map(buildCandidate),
      subject_options: buildSubjectOptions(input.subjectOptions),
    },
  };
};
