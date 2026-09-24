import type {
  TAssociationRequirement,
  TAssociationRequirementActivity,
  TPlanActivity,
  TRequirementActivityRow,
  TRequirementOption,
  TRequirementSource,
  TRequirementTone,
} from "@/types/professional-requirement.types";
import type { TCpdPlan } from "@/types/cpd-plan.types";

const KEY_PREFIX: Record<TRequirementSource, string> = {
  ASSOCIATION: "association",
  PLAN: "plan",
};

const SOURCE_BY_PREFIX: Record<string, TRequirementSource> = {
  association: "ASSOCIATION",
  plan: "PLAN",
};

const CONTENT_PATH_BY_TYPE: Record<string, string> = {
  COURSE: "courses",
  EVENT: "events",
  PODCAST: "podcasts",
  YOUTUBE: "youtube",
};

export const ADD_ACTIVITY_HREF = "/dashboard/professional?tab=add-activity";

export const REQUIREMENT_PARAM = "requirement";
export const REQUIREMENT_NONE = "none";
export const LEARNING_CONTENT_PARAM = "learningContent";

export const RETURN_TO_PARAM = "returnTo";
export const RETURN_TO_TRACKER = "cpd-pdu-tracker";
export const RETURN_TO_REQUIREMENTS = "cpd-pdu-progress";
const KNOWN_RETURN_TARGETS = [RETURN_TO_TRACKER, RETURN_TO_REQUIREMENTS];

export const resolveReturnTo = (value: string | null | undefined) =>
  value && KNOWN_RETURN_TARGETS.includes(value) ? value : RETURN_TO_TRACKER;

export const returnTargetHref = (
  returnTo: string | null | undefined,
  requirementKeyValue?: string | null,
) => {
  const target = resolveReturnTo(returnTo);
  if (target === RETURN_TO_REQUIREMENTS) {
    const params = new URLSearchParams({ tab: target });
    if (requirementKeyValue) params.set(REQUIREMENT_PARAM, requirementKeyValue);
    return `/dashboard/professional?${params.toString()}`;
  }
  return `/dashboard/professional?tab=${target}`;
};

export const REQUIREMENT_TONE_CLASSES: Record<TRequirementTone, string> = {
  success: "text-success-soft-foreground bg-success-soft",
  info: "text-primary bg-primary/10",
  warning: "text-warning-soft-foreground bg-warning-soft",
  danger: "text-destructive-soft-foreground bg-destructive-soft",
  neutral: "text-muted-foreground bg-muted",
};

export const BAND_META: Record<
  string,
  { tone: TRequirementTone; icon: string }
> = {
  AT_RISK: { tone: "danger", icon: "AlertTriangle" },
  ON_TRACK: { tone: "success", icon: "TrendingUp" },
  NOT_STARTED: { tone: "neutral", icon: "Circle" },
  RENEWAL_READY: { tone: "success", icon: "CheckCircle2" },
};

export const ATTRIBUTION_STATE_TONE: Record<string, TRequirementTone> = {
  COUNTED: "success",
  AWAITING_REVIEW: "warning",
  REJECTED: "danger",
};

export const PDU_STATUS_TONE: Record<string, TRequirementTone> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
};

export const requirementKey = (source: TRequirementSource, id: string) =>
  `${KEY_PREFIX[source]}:${id}`;

export const parseRequirementKey = (
  key: string | null | undefined,
): { source: TRequirementSource; id: string } | null => {
  if (!key) return null;
  const separator = key.indexOf(":");
  if (separator < 1) return null;
  const source = SOURCE_BY_PREFIX[key.slice(0, separator)];
  const id = key.slice(separator + 1);
  return source && id ? { source, id } : null;
};

export const buildRequirementOptions = (
  associations: TAssociationRequirement[],
  plans: TCpdPlan[],
): TRequirementOption[] => {
  const options = [
    ...associations.map((requirement) => ({
      id: requirement.requirementId,
      key: requirementKey("ASSOCIATION", requirement.requirementId),
      label: requirement.name,
      source: "ASSOCIATION" as const,
    })),
    ...plans.map((plan) => ({
      id: plan.id,
      key: requirementKey("PLAN", plan.id),
      label: plan.certificationName,
      source: "PLAN" as const,
    })),
  ];
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.key)) return false;
    seen.add(option.key);
    return true;
  });
};

export const resolveActiveKey = (
  options: TRequirementOption[],
  preferred: string | null,
) =>
  options.some((option) => option.key === preferred)
    ? preferred
    : (options[0]?.key ?? null);

export const contentHref = (
  contentType: string | null | undefined,
  slug: string | null | undefined,
) => {
  const path = contentType ? CONTENT_PATH_BY_TYPE[contentType] : undefined;
  return path && slug ? `/${path}/${slug}` : null;
};

export const logActivityHref = (
  key: string,
  learningContentId?: string | null,
) => {
  const params = new URLSearchParams({
    [REQUIREMENT_PARAM]: key,
    [RETURN_TO_PARAM]: RETURN_TO_REQUIREMENTS,
  });
  if (learningContentId) params.set(LEARNING_CONTENT_PARAM, learningContentId);
  return `${ADD_ACTIVITY_HREF}&${params.toString()}`;
};

type RequirementT = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const CATEGORY_KEY = "professionalDashboard.cpdPduTracker.categories";

export const associationActivityRows = (
  t: RequirementT,
  activities: TAssociationRequirementActivity[],
): TRequirementActivityRow[] =>
  activities.map((activity) => ({
    id: activity.activityId,
    title: activity.title,
    date: activity.date,
    credits: activity.credits,
    isLate: activity.isLate,
    category: t(`${CATEGORY_KEY}.${activity.category}`),
    statusLabel: t(
      `cpdProgress.requirements.activities.state.${activity.state}`,
    ),
    note: activity.reviewNote
      ? t("cpdProgress.requirements.activities.reason", {
          note: activity.reviewNote,
        })
      : null,
    tone: ATTRIBUTION_STATE_TONE[activity.state] ?? "neutral",
  }));

export const planActivityRows = (
  t: RequirementT,
  activities: TPlanActivity[],
): TRequirementActivityRow[] =>
  activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    date: activity.date,
    credits: activity.pdus,
    isLate: false,
    category: t(`${CATEGORY_KEY}.${activity.category}`),
    statusLabel: t(
      `cpdProgress.requirements.activities.status.${activity.status}`,
    ),
    note: null,
    tone: PDU_STATUS_TONE[activity.status] ?? "neutral",
  }));

export const deadlineText = (
  t: RequirementT,
  dueDate: string | null | undefined,
  daysRemaining: number | null | undefined,
) => {
  if (!dueDate || daysRemaining === null || daysRemaining === undefined)
    return t("cpdProgress.requirements.noDeadline");
  if (daysRemaining === 0) return t("cpdProgress.requirements.dueToday");
  if (daysRemaining > 0)
    return t("cpdProgress.requirements.daysLeft", { count: daysRemaining });
  return t("cpdProgress.requirements.overdue", {
    count: Math.abs(daysRemaining),
  });
};
