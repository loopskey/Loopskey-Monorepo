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
  cpdPlanId: string | null;
  contentType: string | null;
  contentId: string | null;
  associationRequirementId: string | null;
  associationLearningContentId: string | null;
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
  provider: string | null;
  reviewNote: string | null;
  evidenceUrl: string | null;
  evidenceNote: string | null;
  files: ComplianceFileDescriptor[];
};

export type ComplianceCertificate = {
  id: string;
  title: string;
  userId: string;
  status: string;
  issuedAt: Date;
  issuer: string | null;
  creditsEarned: number;
  validUntil: Date | null;
  linkedTo: string | null;
  files: ComplianceFileDescriptor[];
};

export type ComplianceStoredFile = {
  filePath: string;
  sourceId: string;
  file: ComplianceFileDescriptor;
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

export type ProfessionalLanguageProjection = {
  readonly userId: string;
  readonly language: string | null;
};

export interface ProfessionalComplianceApi {
  languagesForOwners(
    ownerUserIds: readonly string[],
  ): Promise<ProfessionalLanguageProjection[]>;

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
