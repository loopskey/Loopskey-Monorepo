import { PduCompletionStatus, PduSource } from "@/lib/graphql/base";
import { CreditType, PduCategory } from "@/lib/graphql/base";

import {
  pduEvidenceFileUrl,
  DOCUMENT_MIME_TYPES,
  PDU_EVIDENCE_LIMITS,
  pduEvidenceUploadUrl,
  DOCUMENT_ACCEPT_ATTRIBUTE,
} from "@loopskey/api-contracts/upload";

export const PDU_ACTIVITY_TYPES = [
  PduSource.Course,
  PduSource.Webinar,
  PduSource.Workshop,
  PduSource.Seminar,
  PduSource.Conference,
  PduSource.Meeting,
  PduSource.TrainingSession,
  PduSource.CertificationProgram,
  PduSource.SelfStudy,
  PduSource.ReadingArticle,
  PduSource.Podcast,
  PduSource.VideoLecture,
  PduSource.Mentorship,
  PduSource.Volunteering,
  PduSource.Teaching,
  PduSource.ExamAssessment,
  PduSource.Other,
] as const;

export const CREDIT_TYPES = [
  CreditType.Cpd,
  CreditType.Pdu,
  CreditType.Ceu,
  CreditType.TrainingHour,
] as const;

export const PDU_CATEGORIES = [
  PduCategory.Technical,
  PduCategory.ProfessionalPractice,
  PduCategory.Leadership,
  PduCategory.Ethics,
  PduCategory.Communication,
  PduCategory.Business,
  PduCategory.Strategic,
  PduCategory.Compliance,
  PduCategory.DigitalAi,
  PduCategory.ResearchInnovation,
  PduCategory.IndustryKnowledge,
  PduCategory.Other,
] as const;

export const PDU_COMPLETION_STATUSES = [
  PduCompletionStatus.Completed,
  PduCompletionStatus.Incomplete,
] as const;

export const PDU_SUB_CATEGORIES: Record<PduCategory, readonly string[]> = {
  [PduCategory.Technical]: [
    "Software Engineering",
    "Data & Analytics",
    "Cloud & Infrastructure",
    "Cybersecurity",
    "Quality & Testing",
  ],
  [PduCategory.ProfessionalPractice]: [
    "Project Management",
    "Risk Management",
    "Stakeholder Management",
    "Agile Practices",
  ],
  [PduCategory.Leadership]: [
    "Team Leadership",
    "Coaching & Mentoring",
    "Change Management",
    "Conflict Resolution",
  ],
  [PduCategory.Ethics]: [
    "Professional Conduct",
    "Anti-Corruption",
    "Responsible AI",
    "Data Ethics",
  ],
  [PduCategory.Communication]: [
    "Presentation Skills",
    "Technical Writing",
    "Negotiation",
    "Facilitation",
  ],
  [PduCategory.Business]: [
    "Strategy",
    "Finance",
    "Operations",
    "Product Management",
  ],
  [PduCategory.Strategic]: [
    "Business Strategy",
    "Portfolio Management",
    "Benefits Realisation",
  ],
  [PduCategory.Compliance]: [
    "Health & Safety",
    "Regulatory Compliance",
    "Privacy & GDPR",
    "Audit",
  ],
  [PduCategory.DigitalAi]: [
    "Artificial Intelligence",
    "Machine Learning",
    "Automation",
    "Digital Transformation",
  ],
  [PduCategory.ResearchInnovation]: [
    "Applied Research",
    "Innovation Management",
    "Design Thinking",
  ],
  [PduCategory.IndustryKnowledge]: [
    "Sector Trends",
    "Standards & Frameworks",
    "Competitor Analysis",
  ],
  [PduCategory.Other]: ["General"],
};

export const MAX_EVIDENCE_FILES = PDU_EVIDENCE_LIMITS.maxFiles;
export const MAX_EVIDENCE_SIZE_BYTES = PDU_EVIDENCE_LIMITS.maxFileSizeBytes;

export const ACCEPTED_EVIDENCE_MIME_TYPES = DOCUMENT_MIME_TYPES;

export const ACCEPTED_EVIDENCE_ACCEPT_ATTRIBUTE = DOCUMENT_ACCEPT_ATTRIBUTE;

export const PDU_REPORTING_YEAR_MIN = 1900;
export const PDU_REPORTING_YEAR_MAX = new Date().getFullYear() + 1;

export const PDU_TARGET_MAX = 999;

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

/**
 * REST and GraphQL are assumed co-hosted. Deriving the origin this way is the
 * pre-existing behaviour, kept deliberately: making the REST origin its own
 * variable is a deployment-configuration change, not a refactor.
 */
export const PDU_API_ORIGIN = graphqlUrl.replace(/\/graphql\/?$/, "");

export const getEvidenceUploadUrl = (activityId: string) =>
  pduEvidenceUploadUrl(PDU_API_ORIGIN, activityId);

export const getEvidenceFileUrl = (fileId: string) =>
  pduEvidenceFileUrl(PDU_API_ORIGIN, fileId);
