import { AssociationEvidencePolicy, PDUStatus } from "@prisma/client";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AttributionActivity = {
  id: string;
  category: string;
  creditType: string;
  credits: number;
  date: Date;
  status: string;
  hasEvidence: boolean;
};

export type AttributionRequirement = {
  creditType: CreditType;
  evidencePolicy: AssociationEvidencePolicy;
  reportingStart: Date | null;
  reportingEnd: Date | null;
  deadline: Date | null;
  gracePeriodDays: number;
  allowLateSubmission: boolean;
  categories: { id: string; mappedCategory: PDUCategory }[];
};

export type AttributionAssignment = {
  cycleStart: Date;
  cycleEnd: Date | null;
};

export type EffectiveWindow = {
  from: Date | null;
  to: Date | null;
  lateFrom: Date | null;
};

export type Attribution = {
  activityId: string;
  categoryId: string | null;
  creditedAmount: number;
  activityDate: Date;
  isLate: boolean;
  state: AssociationAttributionState;
};

const latest = (left: Date | null, right: Date | null) => {
  if (!left) return right;
  if (!right) return left;
  return left.getTime() >= right.getTime() ? left : right;
};

const earliest = (left: Date | null, right: Date | null) => {
  if (!left) return right;
  if (!right) return left;
  return left.getTime() <= right.getTime() ? left : right;
};

export const effectiveWindow = (
  requirement: AttributionRequirement,
  assignment: AttributionAssignment,
): EffectiveWindow => {
  const from = latest(assignment.cycleStart, requirement.reportingStart);
  const hardEnd = earliest(assignment.cycleEnd, requirement.reportingEnd);
  const to = earliest(hardEnd, requirement.deadline);

  if (!requirement.allowLateSubmission || !to)
    return { from, to, lateFrom: null };

  return {
    from,
    to,
    lateFrom: new Date(to.getTime() + requirement.gracePeriodDays * DAY_MS),
  };
};

const withinWindow = (date: Date, window: EffectiveWindow) => {
  const at = date.getTime();
  if (window.from && at < window.from.getTime()) return null;
  if (!window.to || at <= window.to.getTime()) return { isLate: false };
  if (window.lateFrom && at <= window.lateFrom.getTime())
    return { isLate: true };
  return null;
};

const stateFor = (
  activity: AttributionActivity,
  policy: AssociationEvidencePolicy,
): AssociationAttributionState | null => {
  if (activity.status === PDUStatus.REJECTED)
    return AssociationAttributionState.REJECTED;

  if (policy === AssociationEvidencePolicy.NOT_REQUIRED)
    return AssociationAttributionState.COUNTED;

  if (!activity.hasEvidence) return null;

  if (policy === AssociationEvidencePolicy.REQUIRED_NO_REVIEW)
    return AssociationAttributionState.COUNTED;

  return activity.status === PDUStatus.APPROVED
    ? AssociationAttributionState.COUNTED
    : AssociationAttributionState.AWAITING_REVIEW;
};

export const attributionFor = (
  activity: AttributionActivity,
  requirement: AttributionRequirement,
  assignment: AttributionAssignment,
): Attribution | null => {
  if (activity.creditType !== requirement.creditType) return null;

  const placement = withinWindow(
    activity.date,
    effectiveWindow(requirement, assignment),
  );
  if (!placement) return null;

  const state = stateFor(activity, requirement.evidencePolicy);
  if (!state) return null;

  const category = requirement.categories.find(
    (candidate) => candidate.mappedCategory === activity.category,
  );

  return {
    activityId: activity.id,
    categoryId: category?.id ?? null,
    creditedAmount:
      state === AssociationAttributionState.COUNTED
        ? Math.max(0, activity.credits)
        : 0,
    activityDate: activity.date,
    isLate: placement.isLate,
    state,
  };
};

export type AssignmentTotals = {
  completedCredits: number;
  percent: number;
  awaitingReviewCount: number;
  isMissingEvidence: boolean;
  byCategory: Map<string, number>;
  uncategorisedCredits: number;
};

export const totalsFor = (
  attributions: Attribution[],
  requiredCredits: number,
): AssignmentTotals => {
  const byCategory = new Map<string, number>();
  let completedCredits = 0;
  let uncategorisedCredits = 0;
  let awaitingReviewCount = 0;

  for (const attribution of attributions) {
    if (attribution.state === AssociationAttributionState.AWAITING_REVIEW) {
      awaitingReviewCount += 1;
      continue;
    }
    if (attribution.state !== AssociationAttributionState.COUNTED) continue;

    completedCredits += attribution.creditedAmount;

    if (!attribution.categoryId) {
      uncategorisedCredits += attribution.creditedAmount;
      continue;
    }

    byCategory.set(
      attribution.categoryId,
      (byCategory.get(attribution.categoryId) ?? 0) +
        attribution.creditedAmount,
    );
  }

  return {
    completedCredits,
    byCategory,
    uncategorisedCredits,
    awaitingReviewCount,
    isMissingEvidence: awaitingReviewCount > 0,
    percent:
      requiredCredits > 0
        ? (completedCredits / requiredCredits) * 100
        : completedCredits > 0
          ? 100
          : 0,
  };
};

export type BandInput = {
  percent: number;
  awaitingReviewCount: number;
  onTrackThreshold: number;
};

export const bandFor = ({
  percent,
  awaitingReviewCount,
  onTrackThreshold,
}: BandInput): AssociationComplianceBand => {
  if (percent >= 100 && awaitingReviewCount === 0)
    return AssociationComplianceBand.RENEWAL_READY;
  if (percent >= onTrackThreshold) return AssociationComplianceBand.ON_TRACK;
  if (percent <= 0) return AssociationComplianceBand.NOT_STARTED;
  return AssociationComplianceBand.AT_RISK;
};

export const daysRemaining = (
  dueDate: Date | null,
  now: Date,
): number | null => {
  if (!dueDate) return null;
  return Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);
};
