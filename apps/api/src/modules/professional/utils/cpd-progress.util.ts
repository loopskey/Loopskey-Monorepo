import { CPDEvidenceType, CPDReportRecipientType } from "@prisma/client";

export const CPD_COMPLIANCE = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  ON_TRACK: "ON_TRACK",
  AT_RISK: "AT_RISK",
  REQUIREMENTS_COMPLETED: "REQUIREMENTS_COMPLETED",
  EVIDENCE_INCOMPLETE: "EVIDENCE_INCOMPLETE",
  REPORTING_PERIOD_EXPIRED: "REPORTING_PERIOD_EXPIRED",
} as const;

export type CpdComplianceStatus =
  (typeof CPD_COMPLIANCE)[keyof typeof CPD_COMPLIANCE];

export const CPD_MISSING = {
  REMAINING_CREDITS: "REMAINING_CREDITS",
  CATEGORY_BELOW_TARGET: "CATEGORY_BELOW_TARGET",
  MISSING_EVIDENCE: "MISSING_EVIDENCE",
  MISSING_REPORT_RECIPIENT: "MISSING_REPORT_RECIPIENT",
  DEADLINE_APPROACHING: "DEADLINE_APPROACHING",
  REPORTING_PERIOD_EXPIRED: "REPORTING_PERIOD_EXPIRED",
  REPORTING_NOT_STARTED: "REPORTING_NOT_STARTED",
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const DEADLINE_WINDOW_DAYS = 30;
const ON_TRACK_TOLERANCE = 0.6;

export type CategoryInput = {
  id: string;
  name: string;
  targetCredits: number;
  completedCredits: number;
};

export type CategoryProgress = {
  id: string;
  name: string;
  target: number;
  completed: number;
  remaining: number;
  progress: number;
  isComplete: boolean;
};

export const round2 = (value: number) => Math.round(value * 100) / 100;

export const computeEarned = (
  initialCompletedCredits: number,
  activityCredits: number,
) => round2(initialCompletedCredits + activityCredits);

export const computeCategoryProgress = (
  categories: CategoryInput[],
): CategoryProgress[] =>
  categories.map((category) => {
    const target = category.targetCredits;
    const completed = category.completedCredits;
    const remaining = Math.max(target - completed, 0);
    const progress = target > 0 ? (completed / target) * 100 : 0;
    return {
      id: category.id,
      name: category.name,
      target: round2(target),
      completed: round2(completed),
      remaining: round2(remaining),
      progress: round2(progress),
      isComplete: target <= 0 ? true : completed >= target,
    };
  });

export const countCategoriesMissing = (categories: CategoryProgress[]) =>
  categories.filter((category) => category.target > 0 && !category.isComplete)
    .length;

export const requiresFileEvidence = (evidenceTypes: CPDEvidenceType[]) =>
  evidenceTypes.includes(CPDEvidenceType.CERTIFICATE) ||
  evidenceTypes.includes(CPDEvidenceType.ATTENDANCE_PROOF);

export type ComplianceInput = {
  earned: number;
  total: number;
  categoriesMissing: number;
  evidenceMissing: number;
  reportingStart: Date;
  reportingEnd: Date;
  now?: Date;
};

export const computeCompliance = ({
  earned,
  total,
  categoriesMissing,
  evidenceMissing,
  reportingStart,
  reportingEnd,
  now = new Date(),
}: ComplianceInput): CpdComplianceStatus => {
  const startMs = reportingStart.getTime();
  const endMs = reportingEnd.getTime();
  const nowMs = now.getTime();

  if (nowMs < startMs) return CPD_COMPLIANCE.NOT_STARTED;

  const requirementsMet =
    total > 0 && earned >= total && categoriesMissing === 0;
  if (requirementsMet)
    return evidenceMissing > 0
      ? CPD_COMPLIANCE.EVIDENCE_INCOMPLETE
      : CPD_COMPLIANCE.REQUIREMENTS_COMPLETED;
  if (nowMs > endMs) return CPD_COMPLIANCE.REPORTING_PERIOD_EXPIRED;
  if (earned <= 0) return CPD_COMPLIANCE.NOT_STARTED;
  const span = Math.max(endMs - startMs, 1);
  const elapsedFraction = Math.min(Math.max((nowMs - startMs) / span, 0), 1);
  const expected = total * elapsedFraction;
  if (earned >= expected) return CPD_COMPLIANCE.ON_TRACK;
  if (earned >= expected * ON_TRACK_TOLERANCE)
    return CPD_COMPLIANCE.IN_PROGRESS;
  return CPD_COMPLIANCE.AT_RISK;
};

export type MissingRequirement = { code: string; detail?: string | null };

export type MissingInput = {
  earned: number;
  total: number;
  categories: CategoryProgress[];
  evidenceMissing: number;
  reportRecipientType: CPDReportRecipientType;
  reportRecipientLabel?: string | null;
  reportingStart: Date;
  reportingEnd: Date;
  now?: Date;
};

export const buildMissingRequirements = ({
  earned,
  total,
  categories,
  evidenceMissing,
  reportRecipientType,
  reportRecipientLabel,
  reportingStart,
  reportingEnd,
  now = new Date(),
}: MissingInput): MissingRequirement[] => {
  const missing: MissingRequirement[] = [];

  const remaining = round2(Math.max(total - earned, 0));
  if (remaining > 0)
    missing.push({
      code: CPD_MISSING.REMAINING_CREDITS,
      detail: `${remaining}`,
    });

  for (const category of categories)
    if (category.target > 0 && !category.isComplete)
      missing.push({
        code: CPD_MISSING.CATEGORY_BELOW_TARGET,
        detail: `${category.name}: ${category.remaining}`,
      });

  if (evidenceMissing > 0)
    missing.push({
      code: CPD_MISSING.MISSING_EVIDENCE,
      detail: `${evidenceMissing}`,
    });
  if (
    reportRecipientType !== CPDReportRecipientType.SELF &&
    !reportRecipientLabel?.trim()
  )
    missing.push({ code: CPD_MISSING.MISSING_REPORT_RECIPIENT });
  const nowMs = now.getTime();
  if (nowMs < reportingStart.getTime())
    missing.push({ code: CPD_MISSING.REPORTING_NOT_STARTED });
  else if (nowMs > reportingEnd.getTime())
    missing.push({ code: CPD_MISSING.REPORTING_PERIOD_EXPIRED });
  else {
    const daysLeft = Math.ceil((reportingEnd.getTime() - nowMs) / DAY_MS);
    if (daysLeft <= DEADLINE_WINDOW_DAYS && remaining > 0)
      missing.push({
        code: CPD_MISSING.DEADLINE_APPROACHING,
        detail: `${daysLeft}`,
      });
  }
  return missing;
};
