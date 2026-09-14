import { type AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationComplianceBand, PDUCategory } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { AttributionRequirement } from "../utils/compliance-attribution.util";

export const CERTIFICATE_EXPIRY_WINDOW_DAYS = 30;

export const MEMBER_ATTENTION_WINDOW_DAYS = 30;

export const NEW_JOINER_WINDOW_DAYS = 30;

export const ATTENTION_PAGE_DEFAULT = 25;

export const ATTENTION_PAGE_MAX = 200;

export const CATEGORY_GROUP_MEMBERS_MAX = 200;

export type AttentionRow = {
  userId: string;
  memberId: string;
  email: string | null;
  detail: string | null;
  deadline: Date | null;
  groupId: string | null;
  percent: number | null;
  detailDate: Date | null;
  fullName: string | null;
  groupTitle: string | null;
  memberNumber: string | null;
  requiredCredits: number | null;
  completedCredits: number | null;
  band: AssociationComplianceBand | null;
};

export type AttentionCounts = {
  newJoiners: number;
  readyReports: number;
  belowThreshold: number;
  categoryBehind: number;
  expiringCertificates: number;
};

export type CategoryAttentionGroup = {
  categoryId: string;
  categoryName: string;
  requirementId: string;
  deadline: Date | null;
  affectedCount: number;
  requirementName: string;
  members: AttentionRow[];
};

export type MessageAudience = {
  groupId?: string | null;
  memberIds?: string[] | null;
  section: AssociationAttentionSection;
};

export type MessageSkip = {
  reason: string;
  memberId: string;
  fullName: string | null;
};

export type MessageBatchResult = {
  skippedCount: number;
  acceptedCount: number;
  skipped: MessageSkip[];
  messageType: AssociationMessageType;
};

export type TAssignmentForCompute = {
  id: string;
  cycleStart: Date;
  cycleEnd: Date | null;
  member: { id: string; userId: string };
  requirement: {
    id: string;
    associationId: string;
    deadline: Date | null;
    gracePeriodDays: number;
    reportingEnd: Date | null;
    reportingStart: Date | null;
    totalRequiredCredits: number;
    creditType: AttributionRequirement["creditType"];
    evidencePolicy: AttributionRequirement["evidencePolicy"];
    categories: { id: string; mappedCategory: PDUCategory }[];
    lateSubmissionPolicy: AttributionRequirement["lateSubmissionPolicy"];
  };
};

export type TRecomputeOutcome = {
  discarded: number;
  assignments: number;
  attributionsWritten: number;
  attributionsRemoved: number;
};

export type TAssignmentSnapshot = {
  band: string;
  percent: number;
  completedCredits: number;
  isMissingEvidence: boolean;
  awaitingReviewCount: number;
};

export type TAssignmentPreview = {
  wouldChange: boolean;
  current: TAssignmentSnapshot;
  computed: TAssignmentSnapshot;
};
