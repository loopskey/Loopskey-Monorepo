export const PROFESSIONAL_COMPLIANCE_API = Symbol(
  "PROFESSIONAL_COMPLIANCE_API",
);

export type ComplianceActivity = {
  date: Date;
  id: string;
  title: string;
  status: string;
  userId: string;
  credits: number;
  category: string;
  creditType: string;
  hasEvidence: boolean;
};

export type ComplianceActivityQuery = {
  to?: Date | null;
  userIds: string[];
  from?: Date | null;
};

export type SettleReviewCommand = {
  approve: boolean;
  activityId: string;
  ownerUserIds: string[];
  reviewNote?: string | null;
};

export interface ProfessionalComplianceApi {
  activitiesForMembers(
    query: ComplianceActivityQuery,
  ): Promise<ComplianceActivity[]>;

  activityForOwners(
    activityId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceActivity | null>;

  settleReview(command: SettleReviewCommand): Promise<boolean>;
}
