/* eslint-disable */
/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source: contracts/roadmap-ai/roadmap-openapi.json
 * Regenerate: npm run codegen --workspace api
 *
 * service-ai.types-drift.spec.ts fails when regeneration produces a diff, so
 * a provider-side contract change cannot land without this file changing.
 */

/** The contract version these types were generated from. */
export const SERVICE_AI_CONTRACT_VERSION = "1.1.0";

export const SERVICE_AI_LIMITS = {
  historyMaxItems: 12,
  historyMessageMaxLength: 2500,
  userMessageMaxLength: 2000,
  subjectOptionsMaxItems: 100,
  candidatesMaxItems: 50,
  candidatesMinItems: 1,
  maxPhasesMaximum: 8,
  maxPhasesMinimum: 1,
  maxPhasesDefault: 4,
  subjectsMaxItems: 5,
  formatsMaxItems: 6,
  contentTypesMaxItems: 4,
  goalMaxLength: 500,
  targetRoleMaxLength: 250,
  goalReasonMaxLength: 1000,
  contextMaxLength: 2000,
  certificationNameMaxLength: 250,
  candidateTitleMaxLength: 500,
  candidateSummaryMaxLength: 1500,
  candidateContentIdMaxLength: 128,
  candidateTagsMaxItems: 20,
  subjectOptionIdMaxLength: 128,
  subjectOptionLabelMaxLength: 250,
} as const;

/** The provider's own decimal-string rule for every credit field. */
export const SERVICE_AI_CREDIT_PATTERN = "^(?!^[-+.]*$)[+-]?0*(?:\\d{0,6}|(?=[\\d.]{1,9}0*$)\\d{0,6}\\.\\d{0,2}0*$)";

export type ProviderBudgetPreference = "FREE_ONLY" | "MIXED_FREE_AND_PAID" | "PREMIUM" | "EMPLOYER_SPONSORED";

export type ProviderChatMessage = {
  content: string;
  role: "user" | "assistant";
};

export type ProviderChatTurnRequest = {
  current_step: ProviderStepKey;
  draft: ProviderDraftState;
  history?: ProviderChatMessage[];
  locale?: "fa" | "en";
  subject_options?: ProviderSubjectOption[];
  today: string;
  user_message?: string | null;
};

export type ProviderChatTurnResponse = {
  assistant_message: string;
  extracted: ProviderExtractedFields;
  is_complete: boolean;
  needs_clarification: boolean;
  suggested_next_step: ProviderStepKey | null;
  widget: ProviderWidget | null;
};

export type ProviderContentCandidate = {
  content_id: string;
  content_type: ProviderContentType;
  credits?: number | string | null;
  duration_minutes?: number | null;
  is_free: boolean;
  level?: ProviderSkillLevel | null;
  summary?: string | null;
  tags?: string[];
  title: string;
};

export type ProviderContentType = "COURSE" | "EVENT" | "PODCAST" | "YOUTUBE";

export type ProviderCpdContext = {
  certification_name: string;
  completed_credits: number | string;
  organization: string;
  remaining_credits: number | string;
  reporting_end?: string | null;
  total_required_credits: number | string;
};

export type ProviderDraftState = {
  available_time?: ProviderTimeCommitment | null;
  budget?: ProviderBudgetPreference | null;
  certification_name?: string | null;
  content_types?: ProviderContentType[] | null;
  context?: string | null;
  cpd_enabled?: boolean | null;
  formats?: ProviderLearningFormat[] | null;
  goal?: string | null;
  goal_reason?: string | null;
  skill_level?: ProviderSkillLevel | null;
  subjects?: string[] | null;
  target_date?: string | null;
  target_role?: string | null;
};

export type ProviderErrorResponse = {
  code: string;
  correlation_id?: string | null;
  message: string;
  retryable: boolean;
};

export type ProviderExtractedFields = {
  available_time?: ProviderTimeCommitment | null;
  budget?: ProviderBudgetPreference | null;
  certification_name?: string | null;
  cleared_fields?: ProviderRoadmapField[] | null;
  content_types?: ProviderContentType[] | null;
  context?: string | null;
  cpd_enabled?: boolean | null;
  formats?: ProviderLearningFormat[] | null;
  goal?: string | null;
  goal_reason?: string | null;
  skill_level?: ProviderSkillLevel | null;
  subjects?: string[] | null;
  target_date?: string | null;
  target_role?: string | null;
};

export type ProviderGateStatsResponse = {
  inflight: number;
  rejected: number;
  waiting: number;
};

export type ProviderGenerateRequest = {
  candidates: ProviderContentCandidate[];
  cpd?: ProviderCpdContext | null;
  draft: ProviderDraftState;
  locale?: "fa" | "en";
  max_phases?: number;
  subject_options?: ProviderSubjectOption[];
  today: string;
};

export type ProviderGenerateResponse = {
  coverage_note?: string | null;
  description: string;
  estimated_weeks: number;
  level: ProviderSkillLevel;
  phases: ProviderGeneratedPhase[];
  title: string;
};

export type ProviderGeneratedPhase = {
  description: string;
  estimated_weeks: number;
  order: number;
  steps: ProviderGeneratedStep[];
  title: string;
};

export type ProviderGeneratedStep = {
  content_id?: string | null;
  content_type?: ProviderContentType | null;
  description: string;
  estimated_minutes?: number | null;
  order: number;
  title: string;
};

export type ProviderLearningFormat = "COURSE" | "WEBINAR" | "WORKSHOP" | "VIDEO" | "PODCAST" | "ARTICLE";

export type ProviderRoadmapField = "goal" | "target_role" | "goal_reason" | "context" | "target_date" | "skill_level" | "available_time" | "budget" | "subjects" | "formats" | "content_types" | "cpd_enabled" | "certification_name";

export type ProviderSkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type ProviderStatsResponse = {
  chat: ProviderGateStatsResponse;
  generate: ProviderGateStatsResponse;
  uptime_seconds: number;
};

export type ProviderStepKey = "GOAL" | "PREFERENCES" | "CPD_SETUP" | "REVIEW";

export type ProviderSubjectOption = {
  id: string;
  label: string;
};

export type ProviderTimeCommitment = "LESS_THAN_ONE_HOUR" | "ONE_TO_THREE_HOURS" | "FOUR_TO_SIX_HOURS" | "SEVEN_TO_TEN_HOURS" | "MORE_THAN_TEN_HOURS";

export type ProviderWidget = {
  field: ProviderRoadmapField;
  max_selections?: number | null;
  options?: ProviderWidgetOption[];
  type: "text" | "single_select" | "multi_select" | "date" | "yes_no";
};

export type ProviderWidgetOption = {
  label: string;
  value: string;
};
