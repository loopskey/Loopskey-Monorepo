import * as GQL from "@/lib/graphql/generated";

export const CPD_CREDIT_TYPES = [
  GQL.CreditType.Pdu,
  GQL.CreditType.Cpd,
  GQL.CreditType.Cpe,
  GQL.CreditType.Ceu,
  GQL.CreditType.TrainingHour,
] as const;

export const CPD_LEARNING_FORMATS = [
  GQL.LearningFormat.Course,
  GQL.LearningFormat.Webinar,
  GQL.LearningFormat.Workshop,
  GQL.LearningFormat.Video,
  GQL.LearningFormat.Podcast,
  GQL.LearningFormat.Article,
] as const;

export const CPD_TIME_COMMITMENTS = [
  GQL.LearningTimeCommitment.LessThanOneHour,
  GQL.LearningTimeCommitment.OneToThreeHours,
  GQL.LearningTimeCommitment.FourToSixHours,
  GQL.LearningTimeCommitment.SevenToTenHours,
  GQL.LearningTimeCommitment.MoreThanTenHours,
] as const;

export const CPD_EVIDENCE_TYPES = [
  GQL.CpdEvidenceType.Certificate,
  GQL.CpdEvidenceType.AttendanceProof,
  GQL.CpdEvidenceType.SelfDeclaration,
  GQL.CpdEvidenceType.Other,
] as const;

export const CPD_REMINDER_TIMINGS = [
  GQL.CpdReminderTiming.Days_7,
  GQL.CpdReminderTiming.Days_14,
  GQL.CpdReminderTiming.Days_30,
  GQL.CpdReminderTiming.Days_60,
] as const;

export const CPD_WIZARD_STEPS = [1, 2, 3, 4] as const;
export const CPD_WIZARD_LAST_STEP = 4;
export const CPD_TARGET_MAX = 100000;

export const CPD_STEP_FIELDS = {
  1: ["certificationName", "organization"],
  2: [
    "reportingStart",
    "reportingEnd",
    "creditType",
    "totalRequiredCredits",
    "initialCompletedCredits",
    "timeAvailable",
    "preferredFormats",
  ],
  3: ["categories"],
  4: [
    "evidenceTypes",
    "evidenceOtherNote",
    "reportRecipientType",
    "reportRecipientLabel",
    "remindersEnabled",
    "reminderTiming",
  ],
} as const;

export type CpdComplianceTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral";

export const CPD_COMPLIANCE_META: Record<
  string,
  { tone: CpdComplianceTone; icon: string }
> = {
  NOT_STARTED: { tone: "neutral", icon: "Circle" },
  IN_PROGRESS: { tone: "info", icon: "Loader" },
  ON_TRACK: { tone: "success", icon: "TrendingUp" },
  AT_RISK: { tone: "danger", icon: "AlertTriangle" },
  REQUIREMENTS_COMPLETED: { tone: "success", icon: "CheckCircle2" },
  EVIDENCE_INCOMPLETE: { tone: "warning", icon: "FileWarning" },
  REPORTING_PERIOD_EXPIRED: { tone: "danger", icon: "CalendarX" },
};

export const CPD_MISSING_ACTION: Record<string, string | undefined> = {
  REMAINING_CREDITS: "add-activity",
  CATEGORY_BELOW_TARGET: "add-activity",
  MISSING_EVIDENCE: "cpd-pdu-tracker",
  MISSING_REPORT_RECIPIENT: undefined,
  DEADLINE_APPROACHING: "add-activity",
  REPORTING_PERIOD_EXPIRED: undefined,
  REPORTING_NOT_STARTED: undefined,
};
