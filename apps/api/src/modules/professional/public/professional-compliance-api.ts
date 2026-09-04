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

export type ComplianceFileDescriptor = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type ComplianceActivityDetail = ComplianceActivity & {
  source: string;
  evidenceNote: string | null;
  evidenceUrl: string | null;
  reviewNote: string | null;
  files: ComplianceFileDescriptor[];
};

export type ComplianceCertificate = {
  id: string;
  userId: string;
  title: string;
  status: string;
  issuer: string | null;
  issuedAt: Date;
  validUntil: Date | null;
  creditsEarned: number;
  files: ComplianceFileDescriptor[];
};

export type ComplianceStoredFile = {
  file: ComplianceFileDescriptor;
  filePath: string;
  sourceId: string;
};

export type ContentEngagementQuery = {
  readonly userIds: readonly string[];
  readonly references: readonly {
    readonly contentType: string;
    readonly contentId: string;
  }[];
};

export type ContentEngagementProjection = {
  readonly contentType: string;
  readonly contentId: string;
  readonly memberCount: number;
  readonly credits: number;
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

  activityDetailsForOwners(
    activityIds: string[],
    ownerUserIds: string[],
  ): Promise<ComplianceActivityDetail[]>;

  certificatesForOwners(
    ownerUserIds: string[],
  ): Promise<ComplianceCertificate[]>;

  evidenceFileForOwners(
    fileId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceStoredFile | null>;

  certificateFileForOwners(
    fileId: string,
    ownerUserIds: string[],
  ): Promise<ComplianceStoredFile | null>;

  contentEngagement(
    query: ContentEngagementQuery,
  ): Promise<ContentEngagementProjection[]>;

  settleReview(command: SettleReviewCommand): Promise<boolean>;
}
