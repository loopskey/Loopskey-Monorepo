import * as GQL from "@/lib/graphql/generated";

export const PDU_ACTIVITY_TYPES = [
  GQL.PduSource.Course,
  GQL.PduSource.Webinar,
  GQL.PduSource.Workshop,
  GQL.PduSource.Seminar,
  GQL.PduSource.Conference,
  GQL.PduSource.Meeting,
  GQL.PduSource.TrainingSession,
  GQL.PduSource.CertificationProgram,
  GQL.PduSource.SelfStudy,
  GQL.PduSource.ReadingArticle,
  GQL.PduSource.Podcast,
  GQL.PduSource.VideoLecture,
  GQL.PduSource.Mentorship,
  GQL.PduSource.Volunteering,
  GQL.PduSource.Teaching,
  GQL.PduSource.ExamAssessment,
  GQL.PduSource.Other,
] as const;

export const CREDIT_TYPES = [
  GQL.CreditType.Cpd,
  GQL.CreditType.Pdu,
  GQL.CreditType.Ceu,
  GQL.CreditType.TrainingHour,
] as const;

export const PDU_CATEGORIES = [
  GQL.PduCategory.Technical,
  GQL.PduCategory.ProfessionalPractice,
  GQL.PduCategory.Leadership,
  GQL.PduCategory.Ethics,
  GQL.PduCategory.Communication,
  GQL.PduCategory.Business,
  GQL.PduCategory.Strategic,
  GQL.PduCategory.Compliance,
  GQL.PduCategory.DigitalAi,
  GQL.PduCategory.ResearchInnovation,
  GQL.PduCategory.IndustryKnowledge,
  GQL.PduCategory.Other,
] as const;

export const PDU_COMPLETION_STATUSES = [
  GQL.PduCompletionStatus.Completed,
  GQL.PduCompletionStatus.Incomplete,
] as const;

export const PDU_SUB_CATEGORIES: Record<GQL.PduCategory, readonly string[]> = {
  [GQL.PduCategory.Technical]: [
    "Software Engineering",
    "Data & Analytics",
    "Cloud & Infrastructure",
    "Cybersecurity",
    "Quality & Testing",
  ],
  [GQL.PduCategory.ProfessionalPractice]: [
    "Project Management",
    "Risk Management",
    "Stakeholder Management",
    "Agile Practices",
  ],
  [GQL.PduCategory.Leadership]: [
    "Team Leadership",
    "Coaching & Mentoring",
    "Change Management",
    "Conflict Resolution",
  ],
  [GQL.PduCategory.Ethics]: [
    "Professional Conduct",
    "Anti-Corruption",
    "Responsible AI",
    "Data Ethics",
  ],
  [GQL.PduCategory.Communication]: [
    "Presentation Skills",
    "Technical Writing",
    "Negotiation",
    "Facilitation",
  ],
  [GQL.PduCategory.Business]: [
    "Strategy",
    "Finance",
    "Operations",
    "Product Management",
  ],
  [GQL.PduCategory.Strategic]: [
    "Business Strategy",
    "Portfolio Management",
    "Benefits Realisation",
  ],
  [GQL.PduCategory.Compliance]: [
    "Health & Safety",
    "Regulatory Compliance",
    "Privacy & GDPR",
    "Audit",
  ],
  [GQL.PduCategory.DigitalAi]: [
    "Artificial Intelligence",
    "Machine Learning",
    "Automation",
    "Digital Transformation",
  ],
  [GQL.PduCategory.ResearchInnovation]: [
    "Applied Research",
    "Innovation Management",
    "Design Thinking",
  ],
  [GQL.PduCategory.IndustryKnowledge]: [
    "Sector Trends",
    "Standards & Frameworks",
    "Competitor Analysis",
  ],
  [GQL.PduCategory.Other]: ["General"],
};

export const MAX_EVIDENCE_FILES = 5;
export const MAX_EVIDENCE_SIZE_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_EVIDENCE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_EVIDENCE_ACCEPT_ATTRIBUTE =
  ".pdf,.jpg,.jpeg,.png,.doc,.docx";

export const PDU_REPORTING_YEAR_MIN = 1900;
export const PDU_REPORTING_YEAR_MAX = new Date().getFullYear() + 1;

export const PDU_REPORTING_YEAR_OPTIONS = Array.from(
  { length: 11 },
  (_, index) => PDU_REPORTING_YEAR_MAX - index,
);

export const PDU_WIZARD_STEPS = [1, 2, 3, 4] as const;
export const PDU_WIZARD_LAST_STEP = 4;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const getPduMonthLabel = (month: number) =>
  MONTH_LABELS[month - 1] ?? String(month);

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const graphqlUrl =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:5700/graphql";

export const PDU_API_ORIGIN = graphqlUrl.replace(/\/graphql\/?$/, "");

export const getEvidenceUploadUrl = (activityId: string) =>
  `${PDU_API_ORIGIN}/professional/pdu-activities/${activityId}/files`;

export const getEvidenceFileUrl = (fileId: string) =>
  `${PDU_API_ORIGIN}/professional/pdu-activities/files/${fileId}`;
