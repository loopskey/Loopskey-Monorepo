import { AssociationComplianceBand } from "@prisma/client";
import { PDUCategory, Prisma } from "@prisma/client";

export const REPORT_MEMBER_SELECT = {
  id: true,
  userId: true,
  status: true,
  memberNumber: true,
  groupId: true,
  group: { select: { title: true } },
  user: { select: { email: true, fullName: true } },
} satisfies Prisma.AssociationMemberSelect;

export type ReportMemberRecord = Prisma.AssociationMemberGetPayload<{
  select: typeof REPORT_MEMBER_SELECT;
}>;

export type ReportAssignmentRow = {
  assignmentId: string;
  requirementId: string;
  requirementName: string;
  requiredCredits: number;
  completedCredits: number;
  percent: number;
  band: AssociationComplianceBand;
  awaitingReviewCount: number;
  isMissingEvidence: boolean;
  dueDate: Date | null;
  daysRemaining: number | null;
};

export type ReportMemberRow = {
  memberId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  memberNumber: string | null;
  groupId: string | null;
  groupTitle: string | null;
  requiredCredits: number;
  completedCredits: number;
  percent: number;
  band: AssociationComplianceBand;
  awaitingReviewCount: number;
  isMissingEvidence: boolean;
  hasStarted: boolean;
  earliestUnmetDeadline: Date | null;
  assignments: ReportAssignmentRow[];
};

export type ReportCategoryRow = {
  categoryId: string;
  categoryName: string;
  requirementId: string;
  requirementName: string;
  mappedCategory: PDUCategory;
  requiredCredits: number;
  averageCompletedCredits: number;
  averagePercent: number;
  memberCount: number;
  belowHalfCount: number;
  behindCount: number;
  onTrackCount: number;
  atRiskCount: number;
};

export type ReportProjection = {
  at: Date;
  members: ReportMemberRow[];
  categories: ReportCategoryRow[];
  computedAt: Date | null;
  onTrackThreshold: number;
};

export type BandCounts = {
  renewalReady: number;
  onTrack: number;
  atRisk: number;
  notStarted: number;
};
