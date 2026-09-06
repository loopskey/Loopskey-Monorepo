import {
  AssociationComplianceBand,
  AssociationMessageType,
} from "@prisma/client";

import { type AssociationAttentionSection } from "@association/enums/association-attention.enum";

export const NEW_JOINER_WINDOW_DAYS = 30;

export const CERTIFICATE_EXPIRY_WINDOW_DAYS = 90;

export const ATTENTION_PAGE_DEFAULT = 25;

export const ATTENTION_PAGE_MAX = 200;

export type AttentionRow = {
  memberId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  memberNumber: string | null;
  groupId: string | null;
  groupTitle: string | null;
  percent: number | null;
  band: AssociationComplianceBand | null;
  requiredCredits: number | null;
  completedCredits: number | null;
  deadline: Date | null;
  detail: string | null;
  detailDate: Date | null;
};

export type AttentionCounts = {
  belowThreshold: number;
  newJoiners: number;
  categoryBehind: number;
  expiringCertificates: number;
  readyReports: number;
};

export type MessageAudience = {
  section: AssociationAttentionSection;
  groupId?: string | null;
  memberIds?: string[] | null;
};

export type MessageSkip = {
  memberId: string;
  fullName: string | null;
  reason: string;
};

export type MessageBatchResult = {
  messageType: AssociationMessageType;
  acceptedCount: number;
  skippedCount: number;
  skipped: MessageSkip[];
};
