import { AssociationEvidencePolicy, PDUStatus } from "@prisma/client";
import { AssociationLateSubmissionPolicy } from "@prisma/client";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AttributionActivity = {
  id: string;
  date: Date;
  status: string;
  credits: number;
  category: string;
  creditType: string;
  hasEvidence: boolean;
  associationRequirementId?: string | null;
};

export type AttributionRequirement = {
  id: string;
  deadline: Date | null;
  creditType: CreditType;
  gracePeriodDays: number;
  reportingEnd: Date | null;
  reportingStart: Date | null;
  evidencePolicy: AssociationEvidencePolicy;
  lateSubmissionPolicy: AssociationLateSubmissionPolicy;
  categories: { id: string; mappedCategory: PDUCategory }[];
};

export type AttributionAssignment = {
  cycleStart: Date;
  cycleEnd: Date | null;
};

export type EffectiveWindow = {
  to: Date | null;
  from: Date | null;
  lateFrom: Date | null;
};

export type Attribution = {
  isLate: boolean;
  activityDate: Date;
  activityId: string;
  creditedAmount: number;
  categoryId: string | null;
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
  if (
    requirement.lateSubmissionPolicy ===
      AssociationLateSubmissionPolicy.NOT_ACCEPTED ||
    !to
  )
    return { from, to, lateFrom: null };
  return {
    from,
    to,
    lateFrom: new Date(to.getTime() + requirement.gracePeriodDays * DAY_MS),
  };
};

const withinWindow = (
  date: Date,
  window: EffectiveWindow,
  lateSubmissionPolicy: AssociationLateSubmissionPolicy,
) => {
  const at = date.getTime();
  if (window.from && at < window.from.getTime()) return null;
  if (!window.to || at <= window.to.getTime()) return { isLate: false };
  if (window.lateFrom && at <= window.lateFrom.getTime())
    return {
      isLate:
        lateSubmissionPolicy ===
        AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
    };
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
  if (
    activity.associationRequirementId &&
    activity.associationRequirementId !== requirement.id
  )
    return null;
  const placement = withinWindow(
    activity.date,
    effectiveWindow(requirement, assignment),
    requirement.lateSubmissionPolicy,
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
  percent: number;
  completedCredits: number;
  isMissingEvidence: boolean;
  awaitingReviewCount: number;
  uncategorisedCredits: number;
  byCategory: Map<string, number>;
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

export const calendarDayFloor = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const calendarDaysUntil = (from: Date, to: Date): number =>
  Math.round((calendarDayFloor(to) - calendarDayFloor(from)) / DAY_MS);

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const weightedCompletionFor = (
  requiredCredits: number,
  completedCredits: number,
) => {
  if (requiredCredits > 0)
    return round2((completedCredits / requiredCredits) * 100);
  return completedCredits > 0 ? 100 : 0;
};

export type OverallAssignment = {
  requiredCredits: number;
  completedCredits: number;
  awaitingReviewCount: number;
};

export type OverallInput = {
  onTrackThreshold: number;
  assignments: OverallAssignment[];
};

export type Overall = {
  percent: number;
  requiredCredits: number;
  completedCredits: number;
  awaitingReviewCount: number;
  band: AssociationComplianceBand;
};

export const overallFor = ({
  assignments,
  onTrackThreshold,
}: OverallInput): Overall => {
  const awaitingReviewCount = assignments.reduce(
    (total, assignment) => total + assignment.awaitingReviewCount,
    0,
  );

  const requiredCredits = assignments.reduce(
    (total, assignment) => total + assignment.requiredCredits,
    0,
  );

  const completedCredits = assignments.reduce(
    (total, assignment) => total + assignment.completedCredits,
    0,
  );

  const percent = weightedCompletionFor(requiredCredits, completedCredits);

  return {
    percent,
    requiredCredits,
    completedCredits,
    awaitingReviewCount,
    band: bandFor({ percent, awaitingReviewCount, onTrackThreshold }),
  };
};

export const paceFor = (
  cycleStart: Date | null,
  dueDate: Date | null,
  now: Date,
): number | null => {
  if (!cycleStart || !dueDate) return null;

  const span = dueDate.getTime() - cycleStart.getTime();
  if (span <= 0) return 100;

  const elapsed = now.getTime() - cycleStart.getTime();
  return Math.min(100, Math.max(0, (elapsed / span) * 100));
};
