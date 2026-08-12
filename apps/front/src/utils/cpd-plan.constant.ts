import * as API from "@/lib/graphql/base";

export const CPD_CREDIT_TYPES = [
  API.CreditType.Pdu,
  API.CreditType.Cpd,
  API.CreditType.Cpe,
  API.CreditType.Ceu,
  API.CreditType.TrainingHour,
] as const;

export const CPD_LEARNING_FORMATS = [
  API.LearningFormat.Course,
  API.LearningFormat.Webinar,
  API.LearningFormat.Workshop,
  API.LearningFormat.Video,
  API.LearningFormat.Podcast,
  API.LearningFormat.Article,
] as const;

export const CPD_TIME_COMMITMENTS = [
  API.LearningTimeCommitment.LessThanOneHour,
  API.LearningTimeCommitment.OneToThreeHours,
  API.LearningTimeCommitment.FourToSixHours,
  API.LearningTimeCommitment.SevenToTenHours,
  API.LearningTimeCommitment.MoreThanTenHours,
] as const;

export const CPD_EVIDENCE_TYPES = [
  API.CpdEvidenceType.Certificate,
  API.CpdEvidenceType.AttendanceProof,
  API.CpdEvidenceType.SelfDeclaration,
  API.CpdEvidenceType.Other,
] as const;

export const CPD_REMINDER_TIMINGS = [
  API.CpdReminderTiming.Days_7,
  API.CpdReminderTiming.Days_14,
  API.CpdReminderTiming.Days_30,
  API.CpdReminderTiming.Days_60,
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
