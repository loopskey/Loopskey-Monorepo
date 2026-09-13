import { type AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";

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
