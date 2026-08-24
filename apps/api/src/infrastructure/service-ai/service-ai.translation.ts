import {
  type PlatformBudgetPreference,
  type PlatformChatRole,
  type PlatformContentType,
  type PlatformDraftStep,
  type PlatformLearningFormat,
  type PlatformSkillLevel,
  type PlatformTimeCommitment,
  type RoadmapDraftField,
  type RoadmapSection,
  type RoadmapWidget,
} from "./service-ai.port";
import {
  type ProviderBudgetPreference,
  type ProviderContentType,
  type ProviderLearningFormat,
  type ProviderRoadmapField,
  type ProviderSkillLevel,
  type ProviderStepKey,
  type ProviderTimeCommitment,
  type ProviderWidget,
} from "./generated/service-ai.types";

/**
 * Contract 1.1.0 adopted this platform's own enum values, so these four tables
 * are now identity. They stay because they are the seam: platform and provider
 * vocabularies remain separate type universes that merely coincide today, and a
 * `Record<Platform…, Provider…>` stops compiling the day the provider drops a
 * value again — instead of silently sending something the service will reject.
 */
export const SKILL_LEVEL_OUTBOUND: Record<
  PlatformSkillLevel,
  ProviderSkillLevel
> = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
};

export const SKILL_LEVEL_INBOUND: Record<
  ProviderSkillLevel,
  PlatformSkillLevel
> = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
};

export const TIME_COMMITMENT_OUTBOUND: Record<
  PlatformTimeCommitment,
  ProviderTimeCommitment
> = {
  LESS_THAN_ONE_HOUR: "LESS_THAN_ONE_HOUR",
  ONE_TO_THREE_HOURS: "ONE_TO_THREE_HOURS",
  FOUR_TO_SIX_HOURS: "FOUR_TO_SIX_HOURS",
  SEVEN_TO_TEN_HOURS: "SEVEN_TO_TEN_HOURS",
  MORE_THAN_TEN_HOURS: "MORE_THAN_TEN_HOURS",
};

export const TIME_COMMITMENT_INBOUND: Record<
  ProviderTimeCommitment,
  PlatformTimeCommitment
> = {
  LESS_THAN_ONE_HOUR: "LESS_THAN_ONE_HOUR",
  ONE_TO_THREE_HOURS: "ONE_TO_THREE_HOURS",
  FOUR_TO_SIX_HOURS: "FOUR_TO_SIX_HOURS",
  SEVEN_TO_TEN_HOURS: "SEVEN_TO_TEN_HOURS",
  MORE_THAN_TEN_HOURS: "MORE_THAN_TEN_HOURS",
};

export const BUDGET_PREFERENCE_OUTBOUND: Record<
  PlatformBudgetPreference,
  ProviderBudgetPreference
> = {
  FREE_ONLY: "FREE_ONLY",
  MIXED_FREE_AND_PAID: "MIXED_FREE_AND_PAID",
  PREMIUM: "PREMIUM",
  EMPLOYER_SPONSORED: "EMPLOYER_SPONSORED",
};

export const BUDGET_PREFERENCE_INBOUND: Record<
  ProviderBudgetPreference,
  PlatformBudgetPreference
> = {
  FREE_ONLY: "FREE_ONLY",
  MIXED_FREE_AND_PAID: "MIXED_FREE_AND_PAID",
  PREMIUM: "PREMIUM",
  EMPLOYER_SPONSORED: "EMPLOYER_SPONSORED",
};

/**
 * Non-nullable since 1.1.0: every format this platform stores has a provider
 * target. Typed that way on purpose — reintroducing a `null` here has to be a
 * deliberate edit, not something a regenerated enum can do quietly.
 */
export const LEARNING_FORMAT_OUTBOUND: Record<
  PlatformLearningFormat,
  ProviderLearningFormat
> = {
  COURSE: "COURSE",
  WEBINAR: "WEBINAR",
  WORKSHOP: "WORKSHOP",
  VIDEO: "VIDEO",
  PODCAST: "PODCAST",
  ARTICLE: "ARTICLE",
};

export const LEARNING_FORMAT_INBOUND: Record<
  ProviderLearningFormat,
  PlatformLearningFormat
> = {
  COURSE: "COURSE",
  WEBINAR: "WEBINAR",
  WORKSHOP: "WORKSHOP",
  VIDEO: "VIDEO",
  PODCAST: "PODCAST",
  ARTICLE: "ARTICLE",
};

export const CONTENT_TYPE_OUTBOUND: Record<
  PlatformContentType,
  ProviderContentType
> = {
  EVENT: "EVENT",
  COURSE: "COURSE",
  PODCAST: "PODCAST",
  YOUTUBE: "YOUTUBE",
};

export const CONTENT_TYPE_INBOUND: Record<
  ProviderContentType,
  PlatformContentType
> = {
  COURSE: "COURSE",
  EVENT: "EVENT",
  PODCAST: "PODCAST",
  YOUTUBE: "YOUTUBE",
};

export const CHAT_ROLE_OUTBOUND: Record<
  PlatformChatRole,
  "user" | "assistant" | null
> = {
  PROFESSIONAL: "user",
  ASSISTANT: "assistant",
  SYSTEM: null,
};

export const STEP_TO_SECTION: Record<PlatformDraftStep, RoadmapSection> = {
  GOAL: "GOAL",
  GOAL_REASON: "GOAL",
  CONTEXT: "GOAL",
  TARGET_DATE: "GOAL",
  PREFERENCES: "PREFERENCES",
  CPD_TRACKING: "CPD_SETUP",
  CERTIFICATION: "CPD_SETUP",
  CPD_REQUIREMENTS: "CPD_SETUP",
  REVIEW: "REVIEW",
};

export const SECTION_INBOUND: Record<ProviderStepKey, RoadmapSection> = {
  GOAL: "GOAL",
  PREFERENCES: "PREFERENCES",
  CPD_SETUP: "CPD_SETUP",
  REVIEW: "REVIEW",
};

export const DRAFT_FIELD_INBOUND: Record<
  ProviderRoadmapField,
  RoadmapDraftField
> = {
  goal: "goal",
  target_role: "targetRole",
  goal_reason: "goalReason",
  context: "context",
  target_date: "targetDate",
  skill_level: "skillLevel",
  available_time: "timeCommitment",
  budget: "budgetPreference",
  subjects: "subjects",
  formats: "preferredFormats",
  content_types: "preferredContentTypes",
  cpd_enabled: "cpdEnabled",
  certification_name: "certificationName",
};

export const WIDGET_TYPE_INBOUND: Record<
  ProviderWidget["type"],
  RoadmapWidget["type"]
> = {
  text: "TEXT",
  date: "DATE",
  yes_no: "YES_NO",
  single_select: "SINGLE_SELECT",
  multi_select: "MULTI_SELECT",
};

export const inbound = <TKey extends string, TValue>(
  table: Record<TKey, TValue>,
  value: unknown,
): TValue | undefined => {
  if (typeof value !== "string") return undefined;
  return Object.prototype.hasOwnProperty.call(table, value)
    ? table[value as TKey]
    : undefined;
};

export const toProviderDate = (value: Date): string =>
  value.toISOString().slice(0, 10);

export const fromProviderDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
