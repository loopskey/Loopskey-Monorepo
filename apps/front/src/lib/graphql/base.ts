import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any };
};

export type ActivateAssociationAccountInput = {
  confirmPassword: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  token: Scalars["String"]["input"];
};

export type ActivateOrganizationAccountInput = {
  confirmPassword: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  token: Scalars["String"]["input"];
};

export type AddOrganizationMemberInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  jobRole?: InputMaybe<Scalars["String"]["input"]>;
};

export type AdminAuditLog = {
  __typename?: "AdminAuditLog";
  action: AuditAction;
  actorEmail?: Maybe<Scalars["String"]["output"]>;
  actorId?: Maybe<Scalars["ID"]["output"]>;
  actorName?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  entityId?: Maybe<Scalars["String"]["output"]>;
  entityType?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  ipAddress?: Maybe<Scalars["String"]["output"]>;
  metadata?: Maybe<Scalars["JSONObject"]["output"]>;
  userAgent?: Maybe<Scalars["String"]["output"]>;
};

export type AdminAuditLogFilter = {
  action?: InputMaybe<AuditAction>;
  entityId?: InputMaybe<Scalars["String"]["input"]>;
  from?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  to?: InputMaybe<Scalars["String"]["input"]>;
};

export type AdminChartPoint = {
  __typename?: "AdminChartPoint";
  date?: Maybe<Scalars["String"]["output"]>;
  label: Scalars["String"]["output"];
  professionals: Scalars["Int"]["output"];
  providers: Scalars["Int"]["output"];
  total: Scalars["Int"]["output"];
};

export type AdminDashboardOverview = {
  __typename?: "AdminDashboardOverview";
  approvedRequests: Scalars["Int"]["output"];
  pendingRequests: Scalars["Int"]["output"];
  rejectedRequests: Scalars["Int"]["output"];
  requestTrend: Array<AdminRequestTrendPoint>;
  totalRequests: Scalars["Int"]["output"];
};

export type AdminOrg = {
  __typename?: "AdminOrg";
  activeMembers: Scalars["Int"]["output"];
  averageCompliance: Scalars["Float"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  ownerEmail?: Maybe<Scalars["String"]["output"]>;
  ownerName?: Maybe<Scalars["String"]["output"]>;
  totalMembers: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type AdminOrgAccessRequest = {
  __typename?: "AdminOrgAccessRequest";
  approvedUserId?: Maybe<Scalars["String"]["output"]>;
  country: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  expectedLicensedProfessionals: Scalars["Int"]["output"];
  goals: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  notificationFailureCode?: Maybe<Scalars["String"]["output"]>;
  notificationLastAttemptAt?: Maybe<Scalars["DateTime"]["output"]>;
  notificationSentAt?: Maybe<Scalars["DateTime"]["output"]>;
  notificationStatus: NotificationDeliveryStatus;
  organizationName: Scalars["String"]["output"];
  organizationType: OrganizationType;
  rejectReason?: Maybe<Scalars["String"]["output"]>;
  representativeFullName: Scalars["String"]["output"];
  representativeJobRole: Scalars["String"]["output"];
  reviewedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewedById?: Maybe<Scalars["ID"]["output"]>;
  reviewedByName?: Maybe<Scalars["String"]["output"]>;
  status: OrganizationAccessRequestStatus;
  updatedAt: Scalars["DateTime"]["output"];
  workEmail: Scalars["String"]["output"];
};

export type AdminOrgAccessRequestFilter = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortDirection?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<OrganizationAccessRequestStatus>;
};

export type AdminOrgDetail = {
  __typename?: "AdminOrgDetail";
  activeMembers: Scalars["Int"]["output"];
  averageCompliance: Scalars["Float"]["output"];
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  departments: Array<OrganizationDepartment>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  inactiveMembers: Scalars["Int"]["output"];
  industry?: Maybe<Scalars["String"]["output"]>;
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  members: Array<AdminOrgMember>;
  name: Scalars["String"]["output"];
  ownerEmail?: Maybe<Scalars["String"]["output"]>;
  ownerId: Scalars["ID"]["output"];
  ownerName?: Maybe<Scalars["String"]["output"]>;
  settings?: Maybe<OrganizationSettings>;
  totalMembers: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  website?: Maybe<Scalars["String"]["output"]>;
};

export type AdminOrgFilter = {
  country?: InputMaybe<Scalars["String"]["input"]>;
  industry?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type AdminOrgMember = {
  __typename?: "AdminOrgMember";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  completedLearning: Scalars["Int"]["output"];
  compliance: Scalars["Float"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  departmentId?: Maybe<Scalars["ID"]["output"]>;
  departmentTitle?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  jobRole?: Maybe<Scalars["String"]["output"]>;
  joinedAt: Scalars["DateTime"]["output"];
  organizationId: Scalars["ID"]["output"];
  pdus: Scalars["Float"]["output"];
  status: OrganizationMemberStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type AdminOrgMemberFilter = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  organizationId: Scalars["String"]["input"];
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type AdminPageInfo = {
  __typename?: "AdminPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type AdminPagination = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AdminProfile = {
  __typename?: "AdminProfile";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  role: Role;
  status: UserStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export type AdminRequestTrendPoint = {
  __typename?: "AdminRequestTrendPoint";
  count: Scalars["Int"]["output"];
  date: Scalars["String"]["output"];
};

export type AdminUser = {
  __typename?: "AdminUser";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isPremium: Scalars["Boolean"]["output"];
  lastLoginAt?: Maybe<Scalars["DateTime"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  role: Role;
  status: UserStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export type AdminUserFilter = {
  premiumOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<UserStatus>;
};

export enum AppLanguage {
  En = "EN",
  Fr = "FR",
}

/** Assignment status */
export enum AssignmentStatus {
  Active = "ACTIVE",
  Archived = "ARCHIVED",
  Completed = "COMPLETED",
}

/** Target type of assignment */
export enum AssignmentTargetKind {
  All = "ALL",
  Department = "DEPARTMENT",
  Member = "MEMBER",
  Role = "ROLE",
}

/** Assignment type (HARD / SOFT) */
export enum AssignmentType {
  Hard = "HARD",
  Soft = "SOFT",
}

export type Association = {
  __typename?: "Association";
  contactEmail?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  ownerEmail?: Maybe<Scalars["String"]["output"]>;
  ownerFullName?: Maybe<Scalars["String"]["output"]>;
  ownerStatus: UserStatus;
  settings?: Maybe<AssociationSettings>;
  updatedAt: Scalars["DateTime"]["output"];
  website?: Maybe<Scalars["String"]["output"]>;
};

export type AssociationActionResponse = {
  __typename?: "AssociationActionResponse";
  association?: Maybe<Association>;
  code: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
};

export type AssociationActivationStatus = {
  __typename?: "AssociationActivationStatus";
  associationName?: Maybe<Scalars["String"]["output"]>;
  status: AssociationActivationTokenStatus;
};

export enum AssociationActivationTokenStatus {
  Expired = "EXPIRED",
  Invalid = "INVALID",
  Used = "USED",
  Valid = "VALID",
}

export type AssociationActivityCounts = {
  __typename?: "AssociationActivityCounts";
  awaitingReview: Scalars["Int"]["output"];
  counted: Scalars["Int"]["output"];
  rejected: Scalars["Int"]["output"];
};

export type AssociationActivityRequirement = {
  __typename?: "AssociationActivityRequirement";
  canReview: Scalars["Boolean"]["output"];
  creditedAmount: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type AssociationAssignmentProgress = {
  __typename?: "AssociationAssignmentProgress";
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  categories: Array<AssociationCategoryProgress>;
  completedCredits: Scalars["Float"]["output"];
  computedAt?: Maybe<Scalars["DateTime"]["output"]>;
  creditType: CreditType;
  cycleEnd?: Maybe<Scalars["DateTime"]["output"]>;
  cycleStart: Scalars["DateTime"]["output"];
  daysRemaining?: Maybe<Scalars["Int"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  evidencePolicy: AssociationEvidencePolicy;
  id: Scalars["ID"]["output"];
  isMissingEvidence: Scalars["Boolean"]["output"];
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
  requirementId: Scalars["ID"]["output"];
  requirementName: Scalars["String"]["output"];
};

/** Whether one activity counted toward a requirement, waits on a decision, or was rejected */
export enum AssociationAttributionState {
  AwaitingReview = "AWAITING_REVIEW",
  Counted = "COUNTED",
  Rejected = "REJECTED",
}

/** Which members a requirement applies to */
export enum AssociationAudienceKind {
  AllMembers = "ALL_MEMBERS",
  Group = "GROUP",
  SpecificMembers = "SPECIFIC_MEMBERS",
}

export type AssociationBulkInviteFailure = {
  __typename?: "AssociationBulkInviteFailure";
  code: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  reason: Scalars["String"]["output"];
  row: Scalars["Int"]["output"];
};

export type AssociationBulkInviteResult = {
  __typename?: "AssociationBulkInviteResult";
  failed: Scalars["Int"]["output"];
  failures: Array<AssociationBulkInviteFailure>;
  invited: Scalars["Int"]["output"];
  linked: Scalars["Int"]["output"];
  totalRows: Scalars["Int"]["output"];
};

export type AssociationCatalogItem = {
  __typename?: "AssociationCatalogItem";
  contentId: Scalars["ID"]["output"];
  contentType: ContentType;
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isAvailable: Scalars["Boolean"]["output"];
  provider?: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
};

export type AssociationCatalogSearchInput = {
  contentType?: InputMaybe<ContentType>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssociationCategoryProgress = {
  __typename?: "AssociationCategoryProgress";
  completedCredits: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type AssociationCategoryProgressRow = {
  __typename?: "AssociationCategoryProgressRow";
  atRiskCount: Scalars["Int"]["output"];
  averageCompletedCredits: Scalars["Float"]["output"];
  averagePercent: Scalars["Float"]["output"];
  behindCount: Scalars["Int"]["output"];
  belowHalfCount: Scalars["Int"]["output"];
  categoryId: Scalars["ID"]["output"];
  categoryName: Scalars["String"]["output"];
  mappedCategory: PduCategory;
  memberCount: Scalars["Int"]["output"];
  onTrackCount: Scalars["Int"]["output"];
  requiredCredits: Scalars["Float"]["output"];
  requirementId: Scalars["ID"]["output"];
  requirementName: Scalars["String"]["output"];
};

/** How far a member has got against what was required of them */
export enum AssociationComplianceBand {
  AtRisk = "AT_RISK",
  NotStarted = "NOT_STARTED",
  OnTrack = "ON_TRACK",
  RenewalReady = "RENEWAL_READY",
}

export type AssociationComplianceFilterInput = {
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  memberIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  requirementId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type AssociationComplianceSummary = {
  __typename?: "AssociationComplianceSummary";
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  computedAt?: Maybe<Scalars["DateTime"]["output"]>;
  isMissingEvidence: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
  percent: Scalars["Float"]["output"];
};

export type AssociationComplianceTrendPoint = {
  __typename?: "AssociationComplianceTrendPoint";
  at: Scalars["DateTime"]["output"];
  atRisk: Scalars["Int"]["output"];
  atRiskShare: Scalars["Float"]["output"];
  averageCompletion: Scalars["Float"]["output"];
  notStarted: Scalars["Int"]["output"];
  notStartedShare: Scalars["Float"]["output"];
  onTrack: Scalars["Int"]["output"];
  onTrackShare: Scalars["Float"]["output"];
  renewalReady: Scalars["Int"]["output"];
  renewalReadyShare: Scalars["Float"]["output"];
  totalMembers: Scalars["Int"]["output"];
};

export type AssociationCumulativePoint = {
  __typename?: "AssociationCumulativePoint";
  credits: Scalars["Float"]["output"];
  date: Scalars["DateTime"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type AssociationEvidenceFile = {
  __typename?: "AssociationEvidenceFile";
  fileName: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  mimeType: Scalars["String"]["output"];
  sizeBytes: Scalars["Int"]["output"];
};

/** Whether members must attach evidence, and whether it is reviewed */
export enum AssociationEvidencePolicy {
  NotRequired = "NOT_REQUIRED",
  RequiredNeedsReview = "REQUIRED_NEEDS_REVIEW",
  RequiredNoReview = "REQUIRED_NO_REVIEW",
}

export type AssociationGeneratedReport = {
  __typename?: "AssociationGeneratedReport";
  createdAt: Scalars["DateTime"]["output"];
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  failureReason?: Maybe<Scalars["String"]["output"]>;
  fileName: Scalars["String"]["output"];
  filter: AssociationGeneratedReportFilter;
  format: AssociationReportFormat;
  id: Scalars["ID"]["output"];
  readyAt?: Maybe<Scalars["DateTime"]["output"]>;
  reportType: AssociationReportType;
  rowCount?: Maybe<Scalars["Int"]["output"]>;
  sizeBytes?: Maybe<Scalars["Int"]["output"]>;
  state: AssociationGeneratedReportState;
};

export type AssociationGeneratedReportFilter = {
  __typename?: "AssociationGeneratedReportFilter";
  endDate?: Maybe<Scalars["String"]["output"]>;
  groupId?: Maybe<Scalars["ID"]["output"]>;
  includeInactive: Scalars["Boolean"]["output"];
  period: AssociationReportPeriod;
  requirementId?: Maybe<Scalars["ID"]["output"]>;
  startDate?: Maybe<Scalars["String"]["output"]>;
};

/** Whether an export is being generated, ready to download, failed, or past its retention */
export enum AssociationGeneratedReportState {
  Expired = "EXPIRED",
  Failed = "FAILED",
  Pending = "PENDING",
  Ready = "READY",
}

export type AssociationGroup = {
  __typename?: "AssociationGroup";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  memberCount: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type AssociationGroupCompliance = {
  __typename?: "AssociationGroupCompliance";
  atRisk: Scalars["Int"]["output"];
  averageCompletion: Scalars["Float"]["output"];
  groupId?: Maybe<Scalars["ID"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  memberCount: Scalars["Int"]["output"];
  notStarted: Scalars["Int"]["output"];
  onTrack: Scalars["Int"]["output"];
  renewalReady: Scalars["Int"]["output"];
};

export type AssociationGroupProgressRow = {
  __typename?: "AssociationGroupProgressRow";
  atRisk: Scalars["Int"]["output"];
  averageCompletion: Scalars["Float"]["output"];
  groupId?: Maybe<Scalars["ID"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  memberCount: Scalars["Int"]["output"];
  missingEvidenceCount: Scalars["Int"]["output"];
  notStarted: Scalars["Int"]["output"];
  notStartedCount: Scalars["Int"]["output"];
  onTrack: Scalars["Int"]["output"];
  renewalReady: Scalars["Int"]["output"];
};

/** Whether an invitation linked an account that already existed or sent a new one */
export enum AssociationInviteOutcome {
  InvitationSent = "INVITATION_SENT",
  LinkedExistingUser = "LINKED_EXISTING_USER",
}

export type AssociationInviteResult = {
  __typename?: "AssociationInviteResult";
  member: AssociationMember;
  outcome: AssociationInviteOutcome;
};

export type AssociationLearningContent = {
  __typename?: "AssociationLearningContent";
  audienceKind: AssociationAudienceKind;
  category: PduCategory;
  contentId?: Maybe<Scalars["ID"]["output"]>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  engagement?: Maybe<AssociationLearningEngagement>;
  externalUrl?: Maybe<Scalars["String"]["output"]>;
  groupId?: Maybe<Scalars["ID"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  indicativeCredits?: Maybe<Scalars["Float"]["output"]>;
  isAvailable: Scalars["Boolean"]["output"];
  isExternal: Scalars["Boolean"]["output"];
  provider?: Maybe<Scalars["String"]["output"]>;
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  requirementId?: Maybe<Scalars["ID"]["output"]>;
  requirementName?: Maybe<Scalars["String"]["output"]>;
  status: AssociationLearningContentStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  withdrawnAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type AssociationLearningContentFilterInput = {
  category?: InputMaybe<PduCategory>;
  contentType?: InputMaybe<ContentType>;
  isExternal?: InputMaybe<Scalars["Boolean"]["input"]>;
  requirementId?: InputMaybe<Scalars["ID"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AssociationLearningContentStatus>;
};

export type AssociationLearningContentIdInput = {
  learningContentId: Scalars["ID"]["input"];
};

/** Whether a library item is a draft, published, or withdrawn */
export enum AssociationLearningContentStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Withdrawn = "WITHDRAWN",
}

export type AssociationLearningEngagement = {
  __typename?: "AssociationLearningEngagement";
  credits: Scalars["Float"]["output"];
  memberCount: Scalars["Int"]["output"];
};

export type AssociationMember = {
  __typename?: "AssociationMember";
  activatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  deactivatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  group?: Maybe<AssociationMemberGroup>;
  id: Scalars["ID"]["output"];
  invitedAt: Scalars["DateTime"]["output"];
  memberNumber?: Maybe<Scalars["String"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  status: AssociationMemberStatus;
  userId: Scalars["ID"]["output"];
};

export type AssociationMemberActivity = {
  __typename?: "AssociationMemberActivity";
  canReview: Scalars["Boolean"]["output"];
  category: PduCategory;
  creditType: CreditType;
  credits: Scalars["Float"]["output"];
  date: Scalars["DateTime"]["output"];
  evidenceNote?: Maybe<Scalars["String"]["output"]>;
  evidenceUrl?: Maybe<Scalars["String"]["output"]>;
  files: Array<AssociationEvidenceFile>;
  hasEvidence: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  isLate: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
  requirements: Array<AssociationActivityRequirement>;
  reviewNote?: Maybe<Scalars["String"]["output"]>;
  source: PduSource;
  state: AssociationAttributionState;
  title: Scalars["String"]["output"];
};

export type AssociationMemberActivityFilterInput = {
  state?: InputMaybe<AssociationAttributionState>;
};

export type AssociationMemberCertificate = {
  __typename?: "AssociationMemberCertificate";
  creditsEarned: Scalars["Float"]["output"];
  files: Array<AssociationEvidenceFile>;
  id: Scalars["ID"]["output"];
  issuedAt: Scalars["DateTime"]["output"];
  issuer?: Maybe<Scalars["String"]["output"]>;
  memberId: Scalars["ID"]["output"];
  status: CertificateStatus;
  title: Scalars["String"]["output"];
  validUntil?: Maybe<Scalars["DateTime"]["output"]>;
};

export type AssociationMemberCompliance = {
  __typename?: "AssociationMemberCompliance";
  assignments: Array<AssociationAssignmentProgress>;
  isMissingEvidence: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
};

export type AssociationMemberDistribution = {
  __typename?: "AssociationMemberDistribution";
  atRisk: Scalars["Int"]["output"];
  atRiskShare: Scalars["Float"]["output"];
  notStarted: Scalars["Int"]["output"];
  notStartedShare: Scalars["Float"]["output"];
  onTrack: Scalars["Int"]["output"];
  onTrackShare: Scalars["Float"]["output"];
  renewalReady: Scalars["Int"]["output"];
  renewalReadyShare: Scalars["Float"]["output"];
  totalMembers: Scalars["Int"]["output"];
};

export type AssociationMemberFilterInput = {
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AssociationMemberStatus>;
};

export type AssociationMemberGroup = {
  __typename?: "AssociationMemberGroup";
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
};

export type AssociationMemberProfile = {
  __typename?: "AssociationMemberProfile";
  assignments: Array<AssociationAssignmentProgress>;
  certificates: Array<AssociationMemberCertificate>;
  cumulative: Array<AssociationCumulativePoint>;
  isMissingEvidence: Scalars["Boolean"]["output"];
  member: AssociationMember;
  summary: AssociationMemberSummary;
};

export type AssociationMemberProgressRow = {
  __typename?: "AssociationMemberProgressRow";
  assignments: Array<AssociationReportAssignment>;
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  completedCredits: Scalars["Float"]["output"];
  earliestUnmetDeadline?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  hasStarted: Scalars["Boolean"]["output"];
  isMissingEvidence: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
  memberNumber?: Maybe<Scalars["String"]["output"]>;
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type AssociationMemberRequirementOption = {
  __typename?: "AssociationMemberRequirementOption";
  audienceKind: AssociationAudienceKind;
  creditType: CreditType;
  deadline?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  isAssigned: Scalars["Boolean"]["output"];
  isMemberManaged: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  totalRequiredCredits: Scalars["Float"]["output"];
};

export type AssociationMemberRequirementsResult = {
  __typename?: "AssociationMemberRequirementsResult";
  added: Scalars["Int"]["output"];
  memberId: Scalars["ID"]["output"];
  removed: Scalars["Int"]["output"];
};

export type AssociationMemberStats = {
  __typename?: "AssociationMemberStats";
  activeMembers: Scalars["Int"]["output"];
  pendingActivation: Scalars["Int"]["output"];
  totalMembers: Scalars["Int"]["output"];
};

/** Where a member stands between invitation and membership */
export enum AssociationMemberStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  PendingActivation = "PENDING_ACTIVATION",
}

export type AssociationMemberSummary = {
  __typename?: "AssociationMemberSummary";
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  creditsCompleted: Scalars["Float"]["output"];
  creditsRemaining: Scalars["Float"]["output"];
  creditsRequired: Scalars["Float"]["output"];
  nearestDueDate?: Maybe<Scalars["DateTime"]["output"]>;
  nearestDueDays?: Maybe<Scalars["Int"]["output"]>;
  nearestRequirementId?: Maybe<Scalars["ID"]["output"]>;
  nearestRequirementName?: Maybe<Scalars["String"]["output"]>;
  pacePercent?: Maybe<Scalars["Float"]["output"]>;
  percent: Scalars["Float"]["output"];
};

export type AssociationMissingEvidenceRow = {
  __typename?: "AssociationMissingEvidenceRow";
  awaitingReviewCount: Scalars["Int"]["output"];
  completedCredits: Scalars["Float"]["output"];
  daysRemaining?: Maybe<Scalars["Int"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  memberId: Scalars["ID"]["output"];
  memberNumber?: Maybe<Scalars["String"]["output"]>;
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
  requirementId: Scalars["ID"]["output"];
  requirementName: Scalars["String"]["output"];
};

export type AssociationPageInfo = {
  __typename?: "AssociationPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type AssociationPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AssociationPendingReview = {
  __typename?: "AssociationPendingReview";
  activityDate: Scalars["DateTime"]["output"];
  activityId: Scalars["ID"]["output"];
  activityTitle: Scalars["String"]["output"];
  category: PduCategory;
  credits: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  memberId: Scalars["ID"]["output"];
  memberName?: Maybe<Scalars["String"]["output"]>;
  requirementId: Scalars["ID"]["output"];
  requirementName: Scalars["String"]["output"];
};

export type AssociationRenewalReadinessRow = {
  __typename?: "AssociationRenewalReadinessRow";
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  completedCredits: Scalars["Float"]["output"];
  earliestUnmetDeadline?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  groupTitle?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isRenewalReady: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
  memberNumber?: Maybe<Scalars["String"]["output"]>;
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type AssociationReportAssignment = {
  __typename?: "AssociationReportAssignment";
  assignmentId: Scalars["ID"]["output"];
  awaitingReviewCount: Scalars["Int"]["output"];
  band: AssociationComplianceBand;
  completedCredits: Scalars["Float"]["output"];
  daysRemaining?: Maybe<Scalars["Int"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  isMissingEvidence: Scalars["Boolean"]["output"];
  percent: Scalars["Float"]["output"];
  requiredCredits: Scalars["Float"]["output"];
  requirementId: Scalars["ID"]["output"];
  requirementName: Scalars["String"]["output"];
};

export type AssociationReportExportIdInput = {
  exportId: Scalars["ID"]["input"];
};

export type AssociationReportFilterInput = {
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  includeInactive?: InputMaybe<Scalars["Boolean"]["input"]>;
  period?: InputMaybe<AssociationReportPeriod>;
  requirementId?: InputMaybe<Scalars["ID"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
};

/** Whether an export is a branded document for circulation or a workbook for analysis */
export enum AssociationReportFormat {
  Excel = "EXCEL",
  Pdf = "PDF",
}

export type AssociationReportPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

/** The period a report covers, as a preset or an explicit range */
export enum AssociationReportPeriod {
  Custom = "CUSTOM",
  Last_30Days = "LAST_30_DAYS",
  Last_90Days = "LAST_90_DAYS",
  LastYear = "LAST_YEAR",
  ThisYear = "THIS_YEAR",
}

export type AssociationReportSummary = {
  __typename?: "AssociationReportSummary";
  atRisk: Scalars["Int"]["output"];
  atRiskChange: Scalars["Int"]["output"];
  atRiskShare: Scalars["Float"]["output"];
  averageCompletion: Scalars["Float"]["output"];
  computedAt?: Maybe<Scalars["DateTime"]["output"]>;
  missingEvidence: Scalars["Int"]["output"];
  missingEvidenceChange: Scalars["Int"]["output"];
  missingEvidenceShare: Scalars["Float"]["output"];
  onTrack: Scalars["Int"]["output"];
  onTrackChange: Scalars["Int"]["output"];
  onTrackShare: Scalars["Float"]["output"];
  periodEnd: Scalars["DateTime"]["output"];
  periodStart: Scalars["DateTime"]["output"];
  renewalReady: Scalars["Int"]["output"];
  renewalReadyChange: Scalars["Int"]["output"];
  renewalReadyShare: Scalars["Float"]["output"];
  totalMembers: Scalars["Int"]["output"];
  totalMembersChange: Scalars["Int"]["output"];
};

/** Which of the six reports an export renders */
export enum AssociationReportType {
  CategoryCompletion = "CATEGORY_COMPLETION",
  GroupProgress = "GROUP_PROGRESS",
  MemberProgress = "MEMBER_PROGRESS",
  MissingEvidence = "MISSING_EVIDENCE",
  OverviewSummary = "OVERVIEW_SUMMARY",
  RenewalReadiness = "RENEWAL_READINESS",
}

/** How often a requirement's obligation repeats */
export enum AssociationReportingCycle {
  Annual = "ANNUAL",
  MultiYear = "MULTI_YEAR",
  OneTime = "ONE_TIME",
}

export type AssociationRequirement = {
  __typename?: "AssociationRequirement";
  allowLateSubmission: Scalars["Boolean"]["output"];
  archivedAt?: Maybe<Scalars["DateTime"]["output"]>;
  assignedMemberCount: Scalars["Int"]["output"];
  audienceKind: AssociationAudienceKind;
  categories: Array<AssociationRequirementCategory>;
  createdAt: Scalars["DateTime"]["output"];
  creditType: CreditType;
  cycleLengthYears?: Maybe<Scalars["Int"]["output"]>;
  deadline?: Maybe<Scalars["DateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  evidencePolicy: AssociationEvidencePolicy;
  gracePeriodDays: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reminderTiming?: Maybe<CpdReminderTiming>;
  remindersEnabled: Scalars["Boolean"]["output"];
  reportingCycle: AssociationReportingCycle;
  reportingEnd?: Maybe<Scalars["DateTime"]["output"]>;
  reportingStart?: Maybe<Scalars["DateTime"]["output"]>;
  status: AssociationRequirementStatus;
  submissionClosesAt?: Maybe<Scalars["DateTime"]["output"]>;
  submissionOpensAt?: Maybe<Scalars["DateTime"]["output"]>;
  targets: Array<AssociationRequirementTarget>;
  totalRequiredCredits: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type AssociationRequirementCategory = {
  __typename?: "AssociationRequirementCategory";
  id: Scalars["ID"]["output"];
  mappedCategory: PduCategory;
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type AssociationRequirementCategoryInput = {
  mappedCategory: PduCategory;
  name: Scalars["String"]["input"];
  order?: InputMaybe<Scalars["Int"]["input"]>;
  requiredCredits: Scalars["Float"]["input"];
};

export type AssociationRequirementFilterInput = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AssociationRequirementStatus>;
};

export type AssociationRequirementIdInput = {
  requirementId: Scalars["ID"]["input"];
};

export type AssociationRequirementStats = {
  __typename?: "AssociationRequirementStats";
  draftRequirements: Scalars["Int"]["output"];
  membersCovered: Scalars["Int"]["output"];
  publishedRequirements: Scalars["Int"]["output"];
  totalRequirements: Scalars["Int"]["output"];
};

/** Where a requirement stands in its draft, published, archived life */
export enum AssociationRequirementStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type AssociationRequirementTarget = {
  __typename?: "AssociationRequirementTarget";
  groupId?: Maybe<Scalars["ID"]["output"]>;
  id: Scalars["ID"]["output"];
  kind: AssociationAudienceKind;
  label?: Maybe<Scalars["String"]["output"]>;
  memberId?: Maybe<Scalars["ID"]["output"]>;
};

export type AssociationReviewResult = {
  __typename?: "AssociationReviewResult";
  activityId: Scalars["ID"]["output"];
  approved: Scalars["Boolean"]["output"];
  memberId: Scalars["ID"]["output"];
  requirementId: Scalars["ID"]["output"];
};

export type AssociationSettings = {
  __typename?: "AssociationSettings";
  associationId: Scalars["ID"]["output"];
  atRiskThreshold: Scalars["Int"]["output"];
  complianceReminders: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  defaultCreditType: CreditType;
  id: Scalars["ID"]["output"];
  onTrackThreshold: Scalars["Int"]["output"];
  renewalRequiresReviewedEvidence: Scalars["Boolean"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  weeklyDigest: Scalars["Boolean"]["output"];
  welcomeMessages: Scalars["Boolean"]["output"];
};

export enum AuditAction {
  AdminProfileUpdated = "ADMIN_PROFILE_UPDATED",
  AssociationAccountActivated = "ASSOCIATION_ACCOUNT_ACTIVATED",
  AssociationAccountCreated = "ASSOCIATION_ACCOUNT_CREATED",
  AssociationActivationResent = "ASSOCIATION_ACTIVATION_RESENT",
  AssociationActivityApproved = "ASSOCIATION_ACTIVITY_APPROVED",
  AssociationActivityRejected = "ASSOCIATION_ACTIVITY_REJECTED",
  AssociationSettingsUpdated = "ASSOCIATION_SETTINGS_UPDATED",
  OrganizationAccountActivated = "ORGANIZATION_ACCOUNT_ACTIVATED",
  OrganizationAccountCreated = "ORGANIZATION_ACCOUNT_CREATED",
  OrganizationActivationResent = "ORGANIZATION_ACTIVATION_RESENT",
  OrganizationMemberRemoved = "ORGANIZATION_MEMBER_REMOVED",
  OrganizationMemberUpdated = "ORGANIZATION_MEMBER_UPDATED",
  OrganizationNotificationFailed = "ORGANIZATION_NOTIFICATION_FAILED",
  OrganizationSettingsUpdated = "ORGANIZATION_SETTINGS_UPDATED",
  OrganizationViewed = "ORGANIZATION_VIEWED",
  OrgAccessRequestApproved = "ORG_ACCESS_REQUEST_APPROVED",
  OrgAccessRequestRejected = "ORG_ACCESS_REQUEST_REJECTED",
  OrgAccessRequestSubmitted = "ORG_ACCESS_REQUEST_SUBMITTED",
  UserExported = "USER_EXPORTED",
  UserStatusUpdated = "USER_STATUS_UPDATED",
}

export type AuthPayload = {
  __typename?: "AuthPayload";
  code: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
  user?: Maybe<AuthUser>;
};

export enum AuthRegisterRole {
  Professional = "PROFESSIONAL",
  Provider = "PROVIDER",
}

export type AuthUrl = {
  __typename?: "AuthUrl";
  url: Scalars["String"]["output"];
};

export type AuthUser = {
  __typename?: "AuthUser";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  emailVerifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
  forcePasswordChange: Scalars["Boolean"]["output"];
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  role: Role;
  status: UserStatus;
};

export type BulkAddOrganizationMembersInput = {
  rows: Array<BulkOrganizationMemberRowInput>;
};

export type BulkAddOrganizationMembersResult = {
  __typename?: "BulkAddOrganizationMembersResult";
  created: Scalars["Int"]["output"];
  errors: Array<Scalars["String"]["output"]>;
  failed: Scalars["Int"]["output"];
  totalRows: Scalars["Int"]["output"];
  updated: Scalars["Int"]["output"];
};

export type BulkInviteAssociationMemberRowInput = {
  email: Scalars["String"]["input"];
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  groupTitle?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  memberNumber?: InputMaybe<Scalars["String"]["input"]>;
};

export type BulkInviteAssociationMembersInput = {
  rows: Array<BulkInviteAssociationMemberRowInput>;
};

export type BulkOrganizationMemberRowInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  departmentTitle?: InputMaybe<Scalars["String"]["input"]>;
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  jobRole?: InputMaybe<Scalars["String"]["input"]>;
};

export enum CpdEvidenceType {
  AttendanceProof = "ATTENDANCE_PROOF",
  Certificate = "CERTIFICATE",
  Other = "OTHER",
  SelfDeclaration = "SELF_DECLARATION",
}

export enum CpdPlanStatus {
  Active = "ACTIVE",
  Archived = "ARCHIVED",
  Completed = "COMPLETED",
  Draft = "DRAFT",
}

export enum CpdReminderTiming {
  Days_7 = "DAYS_7",
  Days_14 = "DAYS_14",
  Days_30 = "DAYS_30",
  Days_60 = "DAYS_60",
}

export enum CpdReportRecipientType {
  Association = "ASSOCIATION",
  Manager = "MANAGER",
  Organization = "ORGANIZATION",
  Other = "OTHER",
  Self = "SELF",
}

export enum CalendarEventType {
  Course = "COURSE",
  Event = "EVENT",
  Meeting = "MEETING",
  Other = "OTHER",
  Training = "TRAINING",
  Webinar = "WEBINAR",
}

export type Cart = {
  __typename?: "Cart";
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  items: Array<CartItem>;
  status: CartStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type CartItem = {
  __typename?: "CartItem";
  cartId: Scalars["String"]["output"];
  contentId: Scalars["String"]["output"];
  contentType: ContentType;
  createdAt: Scalars["DateTime"]["output"];
  currency: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  priceSnapshot: Scalars["Float"]["output"];
  status: CartItemStatus;
  titleSnapshot: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export enum CartItemStatus {
  Active = "ACTIVE",
  Removed = "REMOVED",
}

export enum CartStatus {
  Abandoned = "ABANDONED",
  Active = "ACTIVE",
  CheckedOut = "CHECKED_OUT",
}

export enum CertificateSort {
  ExpirySoonest = "EXPIRY_SOONEST",
  Name = "NAME",
  Oldest = "OLDEST",
  Recent = "RECENT",
}

export enum CertificateStatus {
  Active = "ACTIVE",
  Expired = "EXPIRED",
  ExpiringSoon = "EXPIRING_SOON",
  Revoked = "REVOKED",
}

export enum CertificateStatusFilter {
  Active = "ACTIVE",
  Expired = "EXPIRED",
  ExpiringSoon = "EXPIRING_SOON",
}

export type Certification = {
  __typename?: "Certification";
  abbreviation: Scalars["String"]["output"];
  association?: Maybe<Scalars["String"]["output"]>;
  categories: Array<CertificationCategory>;
  creditType: CreditType;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  organization: Scalars["String"]["output"];
  organizationAbbr?: Maybe<Scalars["String"]["output"]>;
  renewalCycleLabel: Scalars["String"]["output"];
  renewalCycleMonths?: Maybe<Scalars["Int"]["output"]>;
  suggestedDeadline?: Maybe<Scalars["DateTime"]["output"]>;
  totalRequiredCredits: Scalars["Float"]["output"];
};

export type CertificationCategory = {
  __typename?: "CertificationCategory";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  requiredCredits: Scalars["Float"]["output"];
};

export type CertificationSearchInput = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  query: Scalars["String"]["input"];
};

export type ChangePasswordInput = {
  confirmPassword: Scalars["String"]["input"];
  currentPassword: Scalars["String"]["input"];
  newPassword: Scalars["String"]["input"];
};

export type CompleteProfessionalOnboardingInput = {
  certificationId?: InputMaybe<Scalars["ID"]["input"]>;
  certificationIssuer?: InputMaybe<Scalars["String"]["input"]>;
  certificationName?: InputMaybe<Scalars["String"]["input"]>;
  currentRole: Scalars["String"]["input"];
  professionalGoal: ProfessionalGoal;
  skillsToImproveIds?: Array<Scalars["ID"]["input"]>;
  suggestSkills?: Scalars["Boolean"]["input"];
};

/** Organization compliance cycle */
export enum ComplianceCycle {
  Annual = "ANNUAL",
  Biannual = "BIANNUAL",
  Quarterly = "QUARTERLY",
}

export type ConfirmExternalLearningInput = {
  activityId: Scalars["String"]["input"];
  certificateUrl?: InputMaybe<Scalars["String"]["input"]>;
  evidenceNote?: InputMaybe<Scalars["String"]["input"]>;
  licenseNumber?: InputMaybe<Scalars["String"]["input"]>;
  pduHours?: InputMaybe<Scalars["Float"]["input"]>;
  status: ExternalLearningStatus;
};

export enum ContactInquiryType {
  AccessibilityFeedback = "ACCESSIBILITY_FEEDBACK",
  AccountSupport = "ACCOUNT_SUPPORT",
  AssociationPartnership = "ASSOCIATION_PARTNERSHIP",
  ContentProviderInquiry = "CONTENT_PROVIDER_INQUIRY",
  CpdPduTracking = "CPD_PDU_TRACKING",
  GeneralQuestion = "GENERAL_QUESTION",
  OrganizationSolution = "ORGANIZATION_SOLUTION",
  Other = "OTHER",
  PrivacyRequest = "PRIVACY_REQUEST",
  SecurityConcern = "SECURITY_CONCERN",
  TechnicalSupport = "TECHNICAL_SUPPORT",
}

export type ContentActionInput = {
  contentId: Scalars["String"]["input"];
  contentType: ContentType;
};

export type ContentActionPayload = {
  __typename?: "ContentActionPayload";
  active?: Maybe<Scalars["Boolean"]["output"]>;
  code: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
};

export type ContentEnrollment = {
  __typename?: "ContentEnrollment";
  canceledAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  contentId: Scalars["String"]["output"];
  contentType: ContentType;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  progress: Scalars["Int"]["output"];
  startedAt: Scalars["DateTime"]["output"];
  status: ContentEnrollmentStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export enum ContentEnrollmentStatus {
  Active = "ACTIVE",
  Canceled = "CANCELED",
  Completed = "COMPLETED",
}

export type ContentReview = {
  __typename?: "ContentReview";
  comment?: Maybe<Scalars["String"]["output"]>;
  contentId: Scalars["String"]["output"];
  contentType: ContentType;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  rating: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export enum ContentType {
  Course = "COURSE",
  Event = "EVENT",
  Podcast = "PODCAST",
  Youtube = "YOUTUBE",
}

export type Course = {
  __typename?: "Course";
  category: CourseCategory;
  createdAt: Scalars["DateTime"]["output"];
  currency: Scalars["String"]["output"];
  curriculumSections?: Maybe<Array<CurriculumSection>>;
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  description: Scalars["String"]["output"];
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  instructor: Scalars["String"]["output"];
  isFeatured: Scalars["Boolean"]["output"];
  isFree: Scalars["Boolean"]["output"];
  lastUpdatedAt: Scalars["DateTime"]["output"];
  learnings: Array<Scalars["String"]["output"]>;
  level: CourseLevel;
  price?: Maybe<Scalars["Float"]["output"]>;
  professionals: Scalars["Int"]["output"];
  providerId?: Maybe<Scalars["String"]["output"]>;
  rating: Scalars["Float"]["output"];
  ratingCount: Scalars["Int"]["output"];
  requirements: Array<Scalars["String"]["output"]>;
  slug: Scalars["String"]["output"];
  status: CourseStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export enum CourseCategory {
  Business = "BUSINESS",
  Compliance = "COMPLIANCE",
  Cpd = "CPD",
  Design = "DESIGN",
  Education = "EDUCATION",
  Engineering = "ENGINEERING",
  Finance = "FINANCE",
  Healthcare = "HEALTHCARE",
  Leadership = "LEADERSHIP",
  Marketing = "MARKETING",
  Other = "OTHER",
  Technology = "TECHNOLOGY",
}

export type CourseFilterInput = {
  category?: InputMaybe<CourseCategory>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  level?: InputMaybe<CourseLevel>;
  minRating?: InputMaybe<Scalars["Float"]["input"]>;
  providerId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<CourseStatus>;
};

export enum CourseLevel {
  Advanced = "ADVANCED",
  AllLevels = "ALL_LEVELS",
  Beginner = "BEGINNER",
  Intermediate = "INTERMEDIATE",
}

export type CoursePageInfo = {
  __typename?: "CoursePageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type CoursePaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum CourseSortField {
  CreatedAt = "CREATED_AT",
  Price = "PRICE",
  Professionals = "PROFESSIONALS",
  Rating = "RATING",
  Title = "TITLE",
  UpdatedAt = "UPDATED_AT",
}

export type CourseSortInput = {
  direction?: InputMaybe<SortDirection>;
  field?: InputMaybe<CourseSortField>;
};

export enum CourseStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type CpdCategoryProgress = {
  __typename?: "CpdCategoryProgress";
  completed: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  isComplete: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  progress: Scalars["Float"]["output"];
  remaining: Scalars["Float"]["output"];
  target: Scalars["Float"]["output"];
};

export type CpdMissingRequirement = {
  __typename?: "CpdMissingRequirement";
  code: Scalars["String"]["output"];
  detail?: Maybe<Scalars["String"]["output"]>;
};

export type CpdPlan = {
  __typename?: "CpdPlan";
  categories: Array<CpdPlanCategory>;
  certificationId?: Maybe<Scalars["ID"]["output"]>;
  certificationName: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  creditType: CreditType;
  evidenceOtherNote?: Maybe<Scalars["String"]["output"]>;
  evidenceTypes: Array<CpdEvidenceType>;
  id: Scalars["ID"]["output"];
  initialCompletedCredits: Scalars["Float"]["output"];
  organization: Scalars["String"]["output"];
  preferredFormats: Array<LearningFormat>;
  reminderTiming?: Maybe<CpdReminderTiming>;
  remindersEnabled: Scalars["Boolean"]["output"];
  reportRecipientLabel?: Maybe<Scalars["String"]["output"]>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars["DateTime"]["output"];
  reportingStart: Scalars["DateTime"]["output"];
  status: CpdPlanStatus;
  timeAvailable?: Maybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type CpdPlanCategory = {
  __typename?: "CpdPlanCategory";
  completedCredits: Scalars["Float"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  order: Scalars["Int"]["output"];
  targetCredits: Scalars["Float"]["output"];
};

export type CpdPlanCategoryInput = {
  completed?: InputMaybe<Scalars["Float"]["input"]>;
  name: Scalars["String"]["input"];
  target: Scalars["Float"]["input"];
};

export type CpdPlanProgress = {
  __typename?: "CpdPlanProgress";
  activitiesCounted: Scalars["Int"]["output"];
  activityCredits: Scalars["Float"]["output"];
  categories: Array<CpdCategoryProgress>;
  categoriesMissing: Scalars["Int"]["output"];
  complianceStatus: Scalars["String"]["output"];
  earnedCredits: Scalars["Float"]["output"];
  evidenceMissing: Scalars["Int"]["output"];
  initialCompletedCredits: Scalars["Float"]["output"];
  missingRequirements: Array<CpdMissingRequirement>;
  planId: Scalars["ID"]["output"];
  progressPercent: Scalars["Float"]["output"];
  remainingCredits: Scalars["Float"]["output"];
  reportingExpired: Scalars["Boolean"]["output"];
  reportingNotStarted: Scalars["Boolean"]["output"];
  totalRequiredCredits: Scalars["Float"]["output"];
};

export type CpdReportRecipientOption = {
  __typename?: "CpdReportRecipientOption";
  description?: Maybe<Scalars["String"]["output"]>;
  label: Scalars["String"]["output"];
  type: CpdReportRecipientType;
};

export type CreateAssociationAccountInput = {
  country?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  logoUrl?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  representativeFullName: Scalars["String"]["input"];
  website?: InputMaybe<Scalars["String"]["input"]>;
  workEmail: Scalars["String"]["input"];
};

export type CreateAssociationGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreateAssociationLearningContentInput = {
  category: PduCategory;
  contentId?: InputMaybe<Scalars["ID"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  externalProvider?: InputMaybe<Scalars["String"]["input"]>;
  externalTitle?: InputMaybe<Scalars["String"]["input"]>;
  externalUrl?: InputMaybe<Scalars["String"]["input"]>;
  indicativeCredits?: InputMaybe<Scalars["Float"]["input"]>;
  requirementId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CreateAssociationRequirementDraftInput = {
  creditType?: InputMaybe<CreditType>;
  name: Scalars["String"]["input"];
};

export type CreateCalendarEventInput = {
  contentId?: InputMaybe<Scalars["String"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  startDate: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  type: CalendarEventType;
};

export type CreateCertificateInput = {
  certificateNumber?: InputMaybe<Scalars["String"]["input"]>;
  cpdPlanId?: InputMaybe<Scalars["String"]["input"]>;
  issueDate: Scalars["String"]["input"];
  issuer: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  validUntil: Scalars["String"]["input"];
};

export type CreateCourseInput = {
  category: CourseCategory;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  description: Scalars["String"]["input"];
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  instructor: Scalars["String"]["input"];
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  learnings?: InputMaybe<Array<Scalars["String"]["input"]>>;
  level?: InputMaybe<CourseLevel>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  requirements?: InputMaybe<Array<Scalars["String"]["input"]>>;
  status?: InputMaybe<CourseStatus>;
  title: Scalars["String"]["input"];
};

export type CreateCpdPlanFromSuggestionInput = {
  certificationId: Scalars["ID"]["input"];
  reportingEnd?: InputMaybe<Scalars["String"]["input"]>;
  reportingStart?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateCpdPlanInput = {
  allowDuplicate?: InputMaybe<Scalars["Boolean"]["input"]>;
  categories?: InputMaybe<Array<CpdPlanCategoryInput>>;
  certificationId?: InputMaybe<Scalars["ID"]["input"]>;
  certificationName: Scalars["String"]["input"];
  creditType: CreditType;
  evidenceOtherNote?: InputMaybe<Scalars["String"]["input"]>;
  evidenceTypes: Array<CpdEvidenceType>;
  initialCompletedCredits?: InputMaybe<Scalars["Float"]["input"]>;
  organization: Scalars["String"]["input"];
  preferredFormats?: InputMaybe<Array<LearningFormat>>;
  reminderTiming?: InputMaybe<CpdReminderTiming>;
  remindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  reportRecipientLabel?: InputMaybe<Scalars["String"]["input"]>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars["String"]["input"];
  reportingStart: Scalars["String"]["input"];
  timeAvailable?: InputMaybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars["Float"]["input"];
};

export type CreateEventInput = {
  capacity?: InputMaybe<Scalars["Int"]["input"]>;
  category: EventCategory;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  deliveryMode: EventDeliveryMode;
  description: Scalars["String"]["input"];
  earlyBirdDiscount?: InputMaybe<Scalars["Float"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  language?: InputMaybe<AppLanguage>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  onlineUrl?: InputMaybe<Scalars["String"]["input"]>;
  organizer?: InputMaybe<Scalars["String"]["input"]>;
  pdu?: InputMaybe<Scalars["Float"]["input"]>;
  pduCategory?: InputMaybe<PduCategory>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  promotionVideoUrl?: InputMaybe<Scalars["String"]["input"]>;
  registrationEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  speaker?: InputMaybe<Scalars["String"]["input"]>;
  specificTopic?: InputMaybe<Scalars["String"]["input"]>;
  startDate: Scalars["DateTime"]["input"];
  status?: InputMaybe<EventStatus>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
  type: EventType;
};

export type CreateExternalLearningClickInput = {
  courseId?: InputMaybe<Scalars["String"]["input"]>;
  eventId?: InputMaybe<Scalars["String"]["input"]>;
  externalUrl: Scalars["String"]["input"];
  provider?: InputMaybe<ExternalLearningProvider>;
  title: Scalars["String"]["input"];
};

export type CreateOrganizationAssignmentInput = {
  courseId?: InputMaybe<Scalars["String"]["input"]>;
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["String"]["input"]>;
  eventId?: InputMaybe<Scalars["String"]["input"]>;
  targetKind: AssignmentTargetKind;
  targetMemberId?: InputMaybe<Scalars["String"]["input"]>;
  targetRole?: InputMaybe<Role>;
  title: Scalars["String"]["input"];
  type: AssignmentType;
};

export type CreateOrganizationCpdCategoryInput = {
  category: PduCategory;
  description?: InputMaybe<Scalars["String"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  requiredHours: Scalars["Float"]["input"];
  title: Scalars["String"]["input"];
};

export type CreateOrganizationDepartmentInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreatePduActivityInput = {
  category: PduCategory;
  contentId?: InputMaybe<Scalars["String"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  creditType: CreditType;
  date: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  evidenceNote?: InputMaybe<Scalars["String"]["input"]>;
  evidenceUrl?: InputMaybe<Scalars["String"]["input"]>;
  issuingOrganization?: InputMaybe<Scalars["String"]["input"]>;
  learningOutcome?: InputMaybe<Scalars["String"]["input"]>;
  pdus: Scalars["Float"]["input"];
  providerOrganizer: Scalars["String"]["input"];
  relatedCertification?: InputMaybe<Scalars["String"]["input"]>;
  reportingYear: Scalars["Int"]["input"];
  source: PduSource;
  subCategory?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreatePodcastEpisodeInput = {
  audioUrl?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  episodeNumber: Scalars["Int"]["input"];
  podcastId: Scalars["ID"]["input"];
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreatePodcastInput = {
  category: PodcastCategory;
  description: Scalars["String"]["input"];
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  host: Scalars["String"]["input"];
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  rating?: InputMaybe<Scalars["Float"]["input"]>;
  status?: InputMaybe<PodcastStatus>;
  title: Scalars["String"]["input"];
};

export type CreateProfessionalCredentialInput = {
  annualCpdHours?: InputMaybe<Scalars["Float"]["input"]>;
  expiryDate?: InputMaybe<Scalars["String"]["input"]>;
  issueDate: Scalars["String"]["input"];
  issuingOrganization: Scalars["String"]["input"];
  licenceNumber?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  pduTargetId?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateUserInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  password: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Role>;
  status?: InputMaybe<UserStatus>;
};

export type CreateYouTubeChannelInput = {
  category: YouTubeCategory;
  channelUrl?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<YouTubeChannelStatus>;
  subscribers?: InputMaybe<Scalars["Int"]["input"]>;
  title: Scalars["String"]["input"];
};

export type CreateYouTubeVideoInput = {
  channelId: Scalars["ID"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  likes?: InputMaybe<Scalars["Int"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<YouTubeVideoStatus>;
  thumbnailUrl?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
  videoUrl?: InputMaybe<Scalars["String"]["input"]>;
  views?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum CreditType {
  Ceu = "CEU",
  Cpd = "CPD",
  Cpe = "CPE",
  Pdu = "PDU",
  TrainingHour = "TRAINING_HOUR",
}

export type CsvExport = {
  __typename?: "CsvExport";
  content: Scalars["String"]["output"];
  filename: Scalars["String"]["output"];
  mimeType: Scalars["String"]["output"];
};

export type CurriculumLesson = {
  __typename?: "CurriculumLesson";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  isPreview: Scalars["Boolean"]["output"];
  order: Scalars["Int"]["output"];
  sectionId: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  type: CurriculumLessonType;
  updatedAt: Scalars["DateTime"]["output"];
};

export enum CurriculumLessonType {
  Article = "ARTICLE",
  Assignment = "ASSIGNMENT",
  Download = "DOWNLOAD",
  LiveSession = "LIVE_SESSION",
  Quiz = "QUIZ",
  Video = "VIDEO",
}

export type CurriculumSection = {
  __typename?: "CurriculumSection";
  courseId: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lessons: Array<CurriculumLesson>;
  order: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type Event = {
  __typename?: "Event";
  attendees: Scalars["Int"]["output"];
  averageRating: Scalars["Float"]["output"];
  capacity?: Maybe<Scalars["Int"]["output"]>;
  category: EventCategory;
  createdAt: Scalars["DateTime"]["output"];
  currency: Scalars["String"]["output"];
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  deliveryMode: EventDeliveryMode;
  description: Scalars["String"]["output"];
  earlyBirdDiscount?: Maybe<Scalars["Float"]["output"]>;
  endDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isFree: Scalars["Boolean"]["output"];
  language?: Maybe<AppLanguage>;
  location?: Maybe<Scalars["String"]["output"]>;
  onlineUrl?: Maybe<Scalars["String"]["output"]>;
  organizer?: Maybe<Scalars["String"]["output"]>;
  pdu: Scalars["Float"]["output"];
  pduCategory?: Maybe<PduCategory>;
  price?: Maybe<Scalars["Float"]["output"]>;
  promotionVideoUrl?: Maybe<Scalars["String"]["output"]>;
  providerId?: Maybe<Scalars["String"]["output"]>;
  rating: Scalars["Float"]["output"];
  ratingCount: Scalars["Int"]["output"];
  registrationEnabled: Scalars["Boolean"]["output"];
  scheduleItems?: Maybe<Array<EventScheduleItem>>;
  slug: Scalars["String"]["output"];
  speaker?: Maybe<Scalars["String"]["output"]>;
  specificTopic?: Maybe<Scalars["String"]["output"]>;
  startDate: Scalars["DateTime"]["output"];
  status: EventStatus;
  timezone: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  type: EventType;
  updatedAt: Scalars["DateTime"]["output"];
  views: Scalars["Int"]["output"];
};

export type EventCatalogFilterInput = {
  category?: InputMaybe<EventCategory>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<EventType>;
};

export enum EventCategory {
  Business = "BUSINESS",
  Compliance = "COMPLIANCE",
  Cpd = "CPD",
  Design = "DESIGN",
  Education = "EDUCATION",
  Engineering = "ENGINEERING",
  Finance = "FINANCE",
  Healthcare = "HEALTHCARE",
  Leadership = "LEADERSHIP",
  Marketing = "MARKETING",
  Other = "OTHER",
  Technology = "TECHNOLOGY",
}

export enum EventDeliveryMode {
  Hybrid = "HYBRID",
  InPerson = "IN_PERSON",
  LiveOnline = "LIVE_ONLINE",
  Recorded = "RECORDED",
}

export type EventFilterInput = {
  category?: InputMaybe<EventCategory>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  fromDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  providerId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<EventStatus>;
  toDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  type?: InputMaybe<EventType>;
};

export type EventPageInfo = {
  __typename?: "EventPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type EventPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type EventRegistration = {
  __typename?: "EventRegistration";
  attendedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  eventId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  status: EventRegistrationStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export enum EventRegistrationStatus {
  Attended = "ATTENDED",
  Canceled = "CANCELED",
  Cancelled = "CANCELLED",
  Completed = "COMPLETED",
  NotAttended = "NOT_ATTENDED",
  Registered = "REGISTERED",
}

export type EventScheduleItem = {
  __typename?: "EventScheduleItem";
  createdAt: Scalars["DateTime"]["output"];
  dayNumber: Scalars["Int"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  endTime: Scalars["DateTime"]["output"];
  eventId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  speaker?: Maybe<Scalars["String"]["output"]>;
  startTime: Scalars["DateTime"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export enum EventSortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export enum EventSortField {
  Attendees = "ATTENDEES",
  AverageRating = "AVERAGE_RATING",
  CreatedAt = "CREATED_AT",
  Price = "PRICE",
  StartDate = "START_DATE",
  Title = "TITLE",
  UpdatedAt = "UPDATED_AT",
  Views = "VIEWS",
}

export type EventSortInput = {
  direction?: InputMaybe<EventSortDirection>;
  field?: InputMaybe<EventSortField>;
};

export enum EventStatus {
  Archived = "ARCHIVED",
  Cancelled = "CANCELLED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export enum EventType {
  Conference = "CONFERENCE",
  Course = "COURSE",
  Networking = "NETWORKING",
  Other = "OTHER",
  Seminar = "SEMINAR",
  Training = "TRAINING",
  Webinar = "WEBINAR",
  Workshop = "WORKSHOP",
}

export enum ExperienceRange {
  ElevenToFifteenYears = "ELEVEN_TO_FIFTEEN_YEARS",
  LessThanOneYear = "LESS_THAN_ONE_YEAR",
  OneToTwoYears = "ONE_TO_TWO_YEARS",
  SixteenPlusYears = "SIXTEEN_PLUS_YEARS",
  SixToTenYears = "SIX_TO_TEN_YEARS",
  ThreeToFiveYears = "THREE_TO_FIVE_YEARS",
}

export type ExternalLearningActionResponse = {
  __typename?: "ExternalLearningActionResponse";
  code: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
};

export type ExternalLearningActivity = {
  __typename?: "ExternalLearningActivity";
  certificateUrl?: Maybe<Scalars["String"]["output"]>;
  clickedAt: Scalars["DateTime"]["output"];
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  confirmedAt?: Maybe<Scalars["DateTime"]["output"]>;
  courseId?: Maybe<Scalars["ID"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  eventId?: Maybe<Scalars["ID"]["output"]>;
  evidenceNote?: Maybe<Scalars["String"]["output"]>;
  externalUrl: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  licenseNumber?: Maybe<Scalars["String"]["output"]>;
  pduHours?: Maybe<Scalars["Float"]["output"]>;
  provider: ExternalLearningProvider;
  rejectReason?: Maybe<Scalars["String"]["output"]>;
  rejectedAt?: Maybe<Scalars["DateTime"]["output"]>;
  remindedAt?: Maybe<Scalars["DateTime"]["output"]>;
  startedAt?: Maybe<Scalars["DateTime"]["output"]>;
  status: ExternalLearningStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
  verifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type ExternalLearningFilterInput = {
  provider?: InputMaybe<ExternalLearningProvider>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<ExternalLearningStatus>;
};

export enum ExternalLearningProvider {
  Coursera = "COURSERA",
  Edx = "EDX",
  LinkedinLearning = "LINKEDIN_LEARNING",
  Other = "OTHER",
  Udemy = "UDEMY",
}

export enum ExternalLearningStatus {
  AskedConfirmation = "ASKED_CONFIRMATION",
  Clicked = "CLICKED",
  Completed = "COMPLETED",
  EnrolledConfirmed = "ENROLLED_CONFIRMED",
  EvidenceUploaded = "EVIDENCE_UPLOADED",
  Ignored = "IGNORED",
  Rejected = "REJECTED",
  Started = "STARTED",
  Verified = "VERIFIED",
}

export type ForgotPasswordInput = {
  email: Scalars["String"]["input"];
};

export type InviteAssociationMemberInput = {
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  memberNumber?: InputMaybe<Scalars["String"]["input"]>;
};

export enum LearningBudgetPreference {
  EmployerSponsored = "EMPLOYER_SPONSORED",
  FreeOnly = "FREE_ONLY",
  MixedFreeAndPaid = "MIXED_FREE_AND_PAID",
  Premium = "PREMIUM",
}

export enum LearningFormat {
  Article = "ARTICLE",
  Course = "COURSE",
  Podcast = "PODCAST",
  Video = "VIDEO",
  Webinar = "WEBINAR",
  Workshop = "WORKSHOP",
}

export enum LearningTimeCommitment {
  FourToSixHours = "FOUR_TO_SIX_HOURS",
  LessThanOneHour = "LESS_THAN_ONE_HOUR",
  MoreThanTenHours = "MORE_THAN_TEN_HOURS",
  OneToThreeHours = "ONE_TO_THREE_HOURS",
  SevenToTenHours = "SEVEN_TO_TEN_HOURS",
}

export type LoginInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  role?: InputMaybe<Role>;
};

export type Mutation = {
  __typename?: "Mutation";
  activateAssociationAccount: AuthPayload;
  activateOrganizationAccount: AuthPayload;
  addOrganizationMember: OrganizationMember;
  addToCart: ContentActionPayload;
  approveAdminOrgAccessRequest: AdminOrgAccessRequest;
  archiveAssociationRequirement: AssociationRequirement;
  archiveCourse: Course;
  archiveEvent: Event;
  archivePodcast: Podcast;
  archiveYouTubeChannel: YouTubeChannel;
  bulkAddOrganizationMembers: BulkAddOrganizationMembersResult;
  bulkInviteAssociationMembers: AssociationBulkInviteResult;
  cancelContentEnrollment: ContentActionPayload;
  cancelEvent: Event;
  cancelEventRegistration: EventRegistration;
  changePassword: AuthPayload;
  clearCart: ContentActionPayload;
  completeProfessionalOnboarding: ProfessionalDashboardProfile;
  completeRoadmapStep: RoadmapStepProgress;
  confirmExternalLearning: ExternalLearningActivity;
  createAssociationAccount: AssociationActionResponse;
  createAssociationGroup: AssociationGroup;
  createAssociationLearningContent: AssociationLearningContent;
  createAssociationRequirementDraft: AssociationRequirement;
  createCalendarEvent: ProfessionalManualCalendarEvent;
  createCourse: Course;
  createCpdPlan: CpdPlan;
  createCpdPlanFromSuggestion: CpdPlan;
  createEvent: Event;
  createOrganizationAssignment: OrganizationAssignment;
  createOrganizationCpdCategory: OrganizationCpdCategory;
  createOrganizationDepartment: OrganizationDepartment;
  createPodcast: Podcast;
  createPodcastEpisode: PodcastEpisode;
  createProfessionalCertificate: ProfessionalCertificate;
  createProfessionalCredential: ProfessionalCredential;
  createProfessionalPduActivity: ProfessionalPduActivity;
  createUser: User;
  createYouTubeChannel: YouTubeChannel;
  createYouTubeVideo: YouTubeVideo;
  deleteAssociationLearningContent: AssociationActionResponse;
  deleteCalendarEvent: ProfessionalActionResponse;
  deleteContentReview: ContentActionPayload;
  deleteCourse: Course;
  deleteCpdPlan: ProfessionalActionResponse;
  deleteEvent: Event;
  deleteOrganizationAssignment: OrganizationAssignment;
  deleteOrganizationCpdCategory: OrganizationActionResponse;
  deleteOrganizationDepartment: OrganizationDepartment;
  deletePodcast: Podcast;
  deletePodcastEpisode: PodcastEpisode;
  deleteProfessionalCertificate: ProfessionalActionResponse;
  deleteProfessionalCredential: ProfessionalActionResponse;
  deleteProfessionalPduActivity: ProfessionalActionResponse;
  deleteUser: User;
  deleteYouTubeChannel: YouTubeChannel;
  deleteYouTubeVideo: YouTubeVideo;
  dismissProfessionalOnboarding: ProfessionalDashboardProfile;
  enrollContent: ContentActionPayload;
  forgotPassword: AuthPayload;
  ignoreExternalLearning: ExternalLearningActionResponse;
  inviteAssociationMember: AssociationInviteResult;
  login: AuthPayload;
  logout: AuthPayload;
  patchRoadmapDraft: ProfessionalRoadmapDraft;
  publishAssociationLearningContent: AssociationLearningContent;
  publishAssociationRequirement: AssociationRequirement;
  publishCourse: Course;
  publishEvent: Event;
  publishPodcast: Podcast;
  publishYouTubeChannel: YouTubeChannel;
  recomputeAssociationCompliance: AssociationActionResponse;
  refreshToken: AuthPayload;
  register: AuthPayload;
  registerEvent: EventRegistration;
  rejectAdminOrgAccessRequest: AdminOrgAccessRequest;
  removeAdminOrganizationMember: AdminOrgMember;
  removeFromCart: ContentActionPayload;
  requestAssociationReportExport: AssociationGeneratedReport;
  requestEmailChange: AuthPayload;
  requestRoadmapGeneration: ProfessionalRoadmapDraft;
  resendAdminOrgAccessRequestNotification: AdminOrgAccessRequest;
  resendAssociationActivation: AssociationActionResponse;
  resendAssociationMemberInvitation: AssociationMember;
  resendEmailOtp: AuthPayload;
  resendOrganizationActivation: AuthPayload;
  resetPassword: AuthPayload;
  resetProfessionalSettings: ProfessionalSettings;
  restoreCourse: Course;
  restoreEvent: Event;
  restorePodcast: Podcast;
  restoreUser: User;
  restoreYouTubeChannel: YouTubeChannel;
  retryAssociationReportExport: AssociationGeneratedReport;
  reviewAssociationLearningActivity: AssociationReviewResult;
  sendRoadmapChatTurn: ProfessionalRoadmapDraft;
  setAssociationGroupActive: AssociationGroup;
  setAssociationMemberRequirements: AssociationMemberRequirementsResult;
  setAssociationMemberStatus: AssociationMember;
  setProfessionalCertificateCpdPlan: ProfessionalCertificate;
  startProfessionalOnboarding: ProfessionalDashboardProfile;
  startRoadmapDraft: ProfessionalRoadmapDraft;
  startRoadmapStep: RoadmapStepProgress;
  submitContactInquiry: SubmitContactInquiryPayload;
  submitContentReview: ContentReview;
  submitOrganizationAccessRequest: OrganizationAccessRequest;
  submitPromotionRequest: PromotionRequest;
  toggleWishlist: ContentActionPayload;
  trackExternalLearningClick: ExternalLearningActivity;
  updateAdminOrganizationMember: AdminOrgMember;
  updateAdminOrganizationSettings: OrganizationSettings;
  updateAdminProfile: AdminProfile;
  updateAdminUserStatus: AdminUser;
  updateAssociationGroup: AssociationGroup;
  updateAssociationLearningContent: AssociationLearningContent;
  updateAssociationMember: AssociationMember;
  updateAssociationProfile: Association;
  updateAssociationRequirementAudience: AssociationRequirement;
  updateAssociationRequirementCategories: AssociationRequirement;
  updateAssociationRequirementDetails: AssociationRequirement;
  updateAssociationRequirementEvidenceRules: AssociationRequirement;
  updateAssociationRequirementReportingRules: AssociationRequirement;
  updateCourse: Course;
  updateCpdPlan: CpdPlan;
  updateEnrollmentProgress: ContentActionPayload;
  updateEvent: Event;
  updateMe: User;
  updateOrganizationAssignment: OrganizationAssignment;
  updateOrganizationCpdCategory: OrganizationCpdCategory;
  updateOrganizationDepartment: OrganizationDepartment;
  updateOrganizationMember: OrganizationMember;
  updateOrganizationMemberNotes: OrganizationMember;
  updateOrganizationSettings: OrganizationSettings;
  updatePodcast: Podcast;
  updatePodcastEpisode: PodcastEpisode;
  updateProfessionalBasicProfile: ProfessionalDashboardProfile;
  updateProfessionalCertificate: ProfessionalCertificate;
  updateProfessionalCredential: ProfessionalCredential;
  updateProfessionalDetails: ProfessionalDashboardProfile;
  updateProfessionalPduActivity: ProfessionalPduActivity;
  updateProfessionalPreferences: ProfessionalDashboardProfile;
  updateProfessionalSettings: ProfessionalSettings;
  updateProfessionalSkills: ProfessionalDashboardProfile;
  updateProviderSettings: ProviderSettings;
  updateUser: User;
  updateUserStatus: User;
  updateYouTubeChannel: YouTubeChannel;
  updateYouTubeVideo: YouTubeVideo;
  upsertProfessionalPduTarget: ProfessionalPduTarget;
  verifyEmailChange: AuthPayload;
  verifyEmailOtp: AuthPayload;
  withdrawAssociationLearningContent: AssociationLearningContent;
};

export type MutationActivateAssociationAccountArgs = {
  input: ActivateAssociationAccountInput;
};

export type MutationActivateOrganizationAccountArgs = {
  input: ActivateOrganizationAccountInput;
};

export type MutationAddOrganizationMemberArgs = {
  input: AddOrganizationMemberInput;
};

export type MutationAddToCartArgs = {
  input: ContentActionInput;
};

export type MutationApproveAdminOrgAccessRequestArgs = {
  requestId: Scalars["String"]["input"];
};

export type MutationArchiveAssociationRequirementArgs = {
  input: AssociationRequirementIdInput;
};

export type MutationArchiveCourseArgs = {
  courseId: Scalars["String"]["input"];
};

export type MutationArchiveEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationArchivePodcastArgs = {
  podcastId: Scalars["String"]["input"];
};

export type MutationArchiveYouTubeChannelArgs = {
  channelId: Scalars["String"]["input"];
};

export type MutationBulkAddOrganizationMembersArgs = {
  input: BulkAddOrganizationMembersInput;
};

export type MutationBulkInviteAssociationMembersArgs = {
  input: BulkInviteAssociationMembersInput;
};

export type MutationCancelContentEnrollmentArgs = {
  input: ContentActionInput;
};

export type MutationCancelEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationCancelEventRegistrationArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type MutationCompleteProfessionalOnboardingArgs = {
  input: CompleteProfessionalOnboardingInput;
};

export type MutationCompleteRoadmapStepArgs = {
  enrollmentId: Scalars["ID"]["input"];
  stepId: Scalars["ID"]["input"];
};

export type MutationConfirmExternalLearningArgs = {
  input: ConfirmExternalLearningInput;
};

export type MutationCreateAssociationAccountArgs = {
  input: CreateAssociationAccountInput;
};

export type MutationCreateAssociationGroupArgs = {
  input: CreateAssociationGroupInput;
};

export type MutationCreateAssociationLearningContentArgs = {
  input: CreateAssociationLearningContentInput;
};

export type MutationCreateAssociationRequirementDraftArgs = {
  input: CreateAssociationRequirementDraftInput;
};

export type MutationCreateCalendarEventArgs = {
  input: CreateCalendarEventInput;
};

export type MutationCreateCourseArgs = {
  input: CreateCourseInput;
};

export type MutationCreateCpdPlanArgs = {
  input: CreateCpdPlanInput;
};

export type MutationCreateCpdPlanFromSuggestionArgs = {
  input: CreateCpdPlanFromSuggestionInput;
};

export type MutationCreateEventArgs = {
  input: CreateEventInput;
};

export type MutationCreateOrganizationAssignmentArgs = {
  input: CreateOrganizationAssignmentInput;
};

export type MutationCreateOrganizationCpdCategoryArgs = {
  input: CreateOrganizationCpdCategoryInput;
};

export type MutationCreateOrganizationDepartmentArgs = {
  input: CreateOrganizationDepartmentInput;
};

export type MutationCreatePodcastArgs = {
  input: CreatePodcastInput;
};

export type MutationCreatePodcastEpisodeArgs = {
  input: CreatePodcastEpisodeInput;
};

export type MutationCreateProfessionalCertificateArgs = {
  input: CreateCertificateInput;
};

export type MutationCreateProfessionalCredentialArgs = {
  input: CreateProfessionalCredentialInput;
};

export type MutationCreateProfessionalPduActivityArgs = {
  input: CreatePduActivityInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationCreateYouTubeChannelArgs = {
  input: CreateYouTubeChannelInput;
};

export type MutationCreateYouTubeVideoArgs = {
  input: CreateYouTubeVideoInput;
};

export type MutationDeleteAssociationLearningContentArgs = {
  input: AssociationLearningContentIdInput;
};

export type MutationDeleteCalendarEventArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteContentReviewArgs = {
  input: ContentActionInput;
};

export type MutationDeleteCourseArgs = {
  courseId: Scalars["String"]["input"];
};

export type MutationDeleteCpdPlanArgs = {
  planId: Scalars["ID"]["input"];
};

export type MutationDeleteEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationDeleteOrganizationAssignmentArgs = {
  assignmentId: Scalars["String"]["input"];
};

export type MutationDeleteOrganizationCpdCategoryArgs = {
  categoryId: Scalars["String"]["input"];
};

export type MutationDeleteOrganizationDepartmentArgs = {
  departmentId: Scalars["String"]["input"];
};

export type MutationDeletePodcastArgs = {
  podcastId: Scalars["String"]["input"];
};

export type MutationDeletePodcastEpisodeArgs = {
  episodeId: Scalars["String"]["input"];
};

export type MutationDeleteProfessionalCertificateArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationDeleteProfessionalCredentialArgs = {
  credentialId: Scalars["ID"]["input"];
};

export type MutationDeleteProfessionalPduActivityArgs = {
  activityId: Scalars["ID"]["input"];
};

export type MutationDeleteUserArgs = {
  userId: Scalars["String"]["input"];
};

export type MutationDeleteYouTubeChannelArgs = {
  channelId: Scalars["String"]["input"];
};

export type MutationDeleteYouTubeVideoArgs = {
  videoId: Scalars["String"]["input"];
};

export type MutationEnrollContentArgs = {
  input: ContentActionInput;
};

export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};

export type MutationIgnoreExternalLearningArgs = {
  activityId: Scalars["String"]["input"];
};

export type MutationInviteAssociationMemberArgs = {
  input: InviteAssociationMemberInput;
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationPatchRoadmapDraftArgs = {
  input: PatchRoadmapDraftInput;
};

export type MutationPublishAssociationLearningContentArgs = {
  input: PublishAssociationLearningContentInput;
};

export type MutationPublishAssociationRequirementArgs = {
  input: AssociationRequirementIdInput;
};

export type MutationPublishCourseArgs = {
  courseId: Scalars["String"]["input"];
};

export type MutationPublishEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationPublishPodcastArgs = {
  podcastId: Scalars["String"]["input"];
};

export type MutationPublishYouTubeChannelArgs = {
  channelId: Scalars["String"]["input"];
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationRegisterEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationRejectAdminOrgAccessRequestArgs = {
  input: RejectAdminOrgAccessRequestInput;
};

export type MutationRemoveAdminOrganizationMemberArgs = {
  memberId: Scalars["String"]["input"];
};

export type MutationRemoveFromCartArgs = {
  input: ContentActionInput;
};

export type MutationRequestAssociationReportExportArgs = {
  input: RequestAssociationReportExportInput;
};

export type MutationRequestEmailChangeArgs = {
  input: RequestEmailChangeInput;
};

export type MutationRequestRoadmapGenerationArgs = {
  draftId: Scalars["ID"]["input"];
};

export type MutationResendAdminOrgAccessRequestNotificationArgs = {
  requestId: Scalars["String"]["input"];
};

export type MutationResendAssociationActivationArgs = {
  input: ResendAssociationActivationInput;
};

export type MutationResendAssociationMemberInvitationArgs = {
  input: ResendAssociationMemberInvitationInput;
};

export type MutationResendEmailOtpArgs = {
  input: ResendEmailOtpInput;
};

export type MutationResendOrganizationActivationArgs = {
  input: ResendOrganizationActivationInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationRestoreCourseArgs = {
  courseId: Scalars["String"]["input"];
};

export type MutationRestoreEventArgs = {
  eventId: Scalars["String"]["input"];
};

export type MutationRestorePodcastArgs = {
  podcastId: Scalars["String"]["input"];
};

export type MutationRestoreUserArgs = {
  userId: Scalars["String"]["input"];
};

export type MutationRestoreYouTubeChannelArgs = {
  channelId: Scalars["String"]["input"];
};

export type MutationRetryAssociationReportExportArgs = {
  input: AssociationReportExportIdInput;
};

export type MutationReviewAssociationLearningActivityArgs = {
  input: ReviewAssociationLearningActivityInput;
};

export type MutationSendRoadmapChatTurnArgs = {
  input: RoadmapChatTurnInput;
};

export type MutationSetAssociationGroupActiveArgs = {
  input: SetAssociationGroupActiveInput;
};

export type MutationSetAssociationMemberRequirementsArgs = {
  input: SetAssociationMemberRequirementsInput;
};

export type MutationSetAssociationMemberStatusArgs = {
  input: SetAssociationMemberStatusInput;
};

export type MutationSetProfessionalCertificateCpdPlanArgs = {
  input: SetCertificateCpdPlanInput;
};

export type MutationStartRoadmapStepArgs = {
  enrollmentId: Scalars["ID"]["input"];
  stepId: Scalars["ID"]["input"];
};

export type MutationSubmitContactInquiryArgs = {
  input: SubmitContactInquiryInput;
};

export type MutationSubmitContentReviewArgs = {
  input: SubmitContentReviewInput;
};

export type MutationSubmitOrganizationAccessRequestArgs = {
  input: SubmitOrganizationAccessRequestInput;
};

export type MutationSubmitPromotionRequestArgs = {
  input: SubmitPromotionRequestInput;
};

export type MutationToggleWishlistArgs = {
  input: ContentActionInput;
};

export type MutationTrackExternalLearningClickArgs = {
  input: CreateExternalLearningClickInput;
};

export type MutationUpdateAdminOrganizationMemberArgs = {
  input: UpdateAdminOrgMember;
};

export type MutationUpdateAdminOrganizationSettingsArgs = {
  input: UpdateAdminOrgSettings;
};

export type MutationUpdateAdminProfileArgs = {
  input: UpdateAdminProfile;
};

export type MutationUpdateAdminUserStatusArgs = {
  input: UpdateAdminUserStatus;
};

export type MutationUpdateAssociationGroupArgs = {
  input: UpdateAssociationGroupInput;
};

export type MutationUpdateAssociationLearningContentArgs = {
  input: UpdateAssociationLearningContentInput;
};

export type MutationUpdateAssociationMemberArgs = {
  input: UpdateAssociationMemberInput;
};

export type MutationUpdateAssociationProfileArgs = {
  input: UpdateAssociationProfileInput;
};

export type MutationUpdateAssociationRequirementAudienceArgs = {
  input: UpdateAssociationRequirementAudienceInput;
};

export type MutationUpdateAssociationRequirementCategoriesArgs = {
  input: UpdateAssociationRequirementCategoriesInput;
};

export type MutationUpdateAssociationRequirementDetailsArgs = {
  input: UpdateAssociationRequirementDetailsInput;
};

export type MutationUpdateAssociationRequirementEvidenceRulesArgs = {
  input: UpdateAssociationRequirementEvidenceRulesInput;
};

export type MutationUpdateAssociationRequirementReportingRulesArgs = {
  input: UpdateAssociationRequirementReportingRulesInput;
};

export type MutationUpdateCourseArgs = {
  input: UpdateCourseInput;
};

export type MutationUpdateCpdPlanArgs = {
  input: UpdateCpdPlanInput;
};

export type MutationUpdateEnrollmentProgressArgs = {
  input: UpdateEnrollmentProgressInput;
};

export type MutationUpdateEventArgs = {
  input: UpdateEventInput;
};

export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};

export type MutationUpdateOrganizationAssignmentArgs = {
  input: UpdateOrganizationAssignmentInput;
};

export type MutationUpdateOrganizationCpdCategoryArgs = {
  input: UpdateOrganizationCpdCategoryInput;
};

export type MutationUpdateOrganizationDepartmentArgs = {
  input: UpdateOrganizationDepartmentInput;
};

export type MutationUpdateOrganizationMemberArgs = {
  input: UpdateOrganizationMemberInput;
};

export type MutationUpdateOrganizationMemberNotesArgs = {
  input: UpdateOrganizationMemberNotesInput;
};

export type MutationUpdateOrganizationSettingsArgs = {
  input: UpdateOrganizationSettingsInput;
};

export type MutationUpdatePodcastArgs = {
  input: UpdatePodcastInput;
};

export type MutationUpdatePodcastEpisodeArgs = {
  input: UpdatePodcastEpisodeInput;
};

export type MutationUpdateProfessionalBasicProfileArgs = {
  input: UpdateProfessionalBasicProfileInput;
};

export type MutationUpdateProfessionalCertificateArgs = {
  input: UpdateCertificateInput;
};

export type MutationUpdateProfessionalCredentialArgs = {
  input: UpdateProfessionalCredentialInput;
};

export type MutationUpdateProfessionalDetailsArgs = {
  input: UpdateProfessionalDetailsInput;
};

export type MutationUpdateProfessionalPduActivityArgs = {
  input: UpdatePduActivityInput;
};

export type MutationUpdateProfessionalPreferencesArgs = {
  input: UpdateProfessionalPreferencesInput;
};

export type MutationUpdateProfessionalSettingsArgs = {
  input: UpdateProfessionalSettingsInput;
};

export type MutationUpdateProfessionalSkillsArgs = {
  input: UpdateProfessionalSkillsInput;
};

export type MutationUpdateProviderSettingsArgs = {
  input: UpdateProviderSettingsInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserStatusArgs = {
  input: UpdateUserStatusInput;
};

export type MutationUpdateYouTubeChannelArgs = {
  input: UpdateYouTubeChannelInput;
};

export type MutationUpdateYouTubeVideoArgs = {
  input: UpdateYouTubeVideoInput;
};

export type MutationUpsertProfessionalPduTargetArgs = {
  input: UpsertPduTargetInput;
};

export type MutationVerifyEmailChangeArgs = {
  input: VerifyEmailChangeInput;
};

export type MutationVerifyEmailOtpArgs = {
  input: VerifyEmailOtpInput;
};

export type MutationWithdrawAssociationLearningContentArgs = {
  input: AssociationLearningContentIdInput;
};

export type MyWishlistInput = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  onlyWithRating?: InputMaybe<Scalars["Boolean"]["input"]>;
  onlyWithUrl?: InputMaybe<Scalars["Boolean"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  price?: InputMaybe<WishlistPriceFilter>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  sortBy?: InputMaybe<WishlistSortBy>;
};

export enum NotificationDeliveryStatus {
  Failed = "FAILED",
  NotRequested = "NOT_REQUESTED",
  Pending = "PENDING",
  Sent = "SENT",
}

export type OrganizationAccessRequest = {
  __typename?: "OrganizationAccessRequest";
  approvedUserId?: Maybe<Scalars["String"]["output"]>;
  country: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  expectedLicensedProfessionals: Scalars["Int"]["output"];
  goals: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  organizationName: Scalars["String"]["output"];
  organizationType: OrganizationType;
  rejectReason?: Maybe<Scalars["String"]["output"]>;
  representativeFullName: Scalars["String"]["output"];
  representativeJobRole: Scalars["String"]["output"];
  reviewedAt?: Maybe<Scalars["DateTime"]["output"]>;
  reviewedById?: Maybe<Scalars["String"]["output"]>;
  status: OrganizationAccessRequestStatus;
  updatedAt: Scalars["DateTime"]["output"];
  workEmail: Scalars["String"]["output"];
};

export type OrganizationAccessRequestFilterInput = {
  organizationType?: InputMaybe<OrganizationType>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<OrganizationAccessRequestStatus>;
};

export type OrganizationAccessRequestPageInfo = {
  __typename?: "OrganizationAccessRequestPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  limit: Scalars["Int"]["output"];
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type OrganizationAccessRequestPaginationInput = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum OrganizationAccessRequestStatus {
  Approved = "APPROVED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}

export type OrganizationActionResponse = {
  __typename?: "OrganizationActionResponse";
  code: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  success: Scalars["Boolean"]["output"];
};

export type OrganizationActivationStatus = {
  __typename?: "OrganizationActivationStatus";
  organizationName?: Maybe<Scalars["String"]["output"]>;
  status: OrganizationActivationTokenStatus;
};

export enum OrganizationActivationTokenStatus {
  Expired = "EXPIRED",
  Invalid = "INVALID",
  Used = "USED",
  Valid = "VALID",
}

export type OrganizationAssignment = {
  __typename?: "OrganizationAssignment";
  courseId?: Maybe<Scalars["String"]["output"]>;
  courseTitle?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  createdById: Scalars["ID"]["output"];
  departmentId?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  eventId?: Maybe<Scalars["String"]["output"]>;
  eventTitle?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  members: Scalars["Int"]["output"];
  organizationId: Scalars["ID"]["output"];
  progress: Scalars["Float"]["output"];
  status: AssignmentStatus;
  targetKind: AssignmentTargetKind;
  targetMemberId?: Maybe<Scalars["String"]["output"]>;
  targetRole?: Maybe<Role>;
  title: Scalars["String"]["output"];
  type: AssignmentType;
  updatedAt: Scalars["DateTime"]["output"];
};

export type OrganizationAssignmentFilterInput = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AssignmentStatus>;
  type?: InputMaybe<AssignmentType>;
};

export type OrganizationAssignmentStats = {
  __typename?: "OrganizationAssignmentStats";
  activeAssignments: Scalars["Int"]["output"];
  averageCompletionRate: Scalars["Float"]["output"];
  totalAssignments: Scalars["Int"]["output"];
  totalParticipants: Scalars["Int"]["output"];
};

export type OrganizationAttentionMember = {
  __typename?: "OrganizationAttentionMember";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  compliance: Scalars["Float"]["output"];
  departmentTitle?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  pduGoal: Scalars["Float"]["output"];
  pdus: Scalars["Float"]["output"];
  remainingPdus: Scalars["Float"]["output"];
  userId: Scalars["ID"]["output"];
};

export type OrganizationComplianceDistribution = {
  __typename?: "OrganizationComplianceDistribution";
  atRisk: Scalars["Int"]["output"];
  compliant: Scalars["Int"]["output"];
  nonCompliant: Scalars["Int"]["output"];
};

export type OrganizationCpdCategory = {
  __typename?: "OrganizationCpdCategory";
  activeMembers?: Maybe<Scalars["Int"]["output"]>;
  category: PduCategory;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  organizationId: Scalars["ID"]["output"];
  requiredHours: Scalars["Float"]["output"];
  title: Scalars["String"]["output"];
  totalMembers?: Maybe<Scalars["Int"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type OrganizationCpdCategoryFilterInput = {
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  year?: InputMaybe<Scalars["String"]["input"]>;
};

export type OrganizationCpdCategoryStats = {
  __typename?: "OrganizationCpdCategoryStats";
  activeCategories: Scalars["Int"]["output"];
  mostPopularActiveMembers: Scalars["Int"]["output"];
  mostPopularCategory?: Maybe<Scalars["String"]["output"]>;
  totalCategories: Scalars["Int"]["output"];
  totalRequiredHours: Scalars["Float"]["output"];
};

export type OrganizationDepartment = {
  __typename?: "OrganizationDepartment";
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  organizationId: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type OrganizationEventCatalogItem = {
  __typename?: "OrganizationEventCatalogItem";
  averageRating: Scalars["Float"]["output"];
  capacity?: Maybe<Scalars["Int"]["output"]>;
  category: EventCategory;
  currency: Scalars["String"]["output"];
  deliveryMode: EventDeliveryMode;
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isFree: Scalars["Boolean"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  onlineUrl?: Maybe<Scalars["String"]["output"]>;
  pdu: Scalars["Float"]["output"];
  price?: Maybe<Scalars["Float"]["output"]>;
  rating: Scalars["Float"]["output"];
  slug: Scalars["String"]["output"];
  speaker?: Maybe<Scalars["String"]["output"]>;
  startDate: Scalars["DateTime"]["output"];
  title: Scalars["String"]["output"];
  type: EventType;
};

export type OrganizationMember = {
  __typename?: "OrganizationMember";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  completedLearning: Scalars["Int"]["output"];
  compliance: Scalars["Float"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  departmentId?: Maybe<Scalars["ID"]["output"]>;
  departmentTitle?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  jobRole?: Maybe<Scalars["String"]["output"]>;
  joinedAt: Scalars["DateTime"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  organizationId: Scalars["ID"]["output"];
  pdus: Scalars["Float"]["output"];
  role: Role;
  status: OrganizationMemberStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type OrganizationMemberDetail = {
  __typename?: "OrganizationMemberDetail";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  completedLearning: Scalars["Int"]["output"];
  compliance: Scalars["Float"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  departmentId?: Maybe<Scalars["String"]["output"]>;
  departmentTitle?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  jobRole?: Maybe<Scalars["String"]["output"]>;
  joinedAt: Scalars["DateTime"]["output"];
  lastActivityAt?: Maybe<Scalars["DateTime"]["output"]>;
  lastCourseTitle?: Maybe<Scalars["String"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  organizationId: Scalars["ID"]["output"];
  pduGoal: Scalars["Float"]["output"];
  pduProgress: Scalars["Float"]["output"];
  pdus: Scalars["Float"]["output"];
  status: OrganizationMemberStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type OrganizationMemberFilterInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

/** Status of organization member */
export enum OrganizationMemberStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

export type OrganizationMembersStats = {
  __typename?: "OrganizationMembersStats";
  activeMembers: Scalars["Int"]["output"];
  averageCompliance: Scalars["Float"]["output"];
  inactiveMembers: Scalars["Int"]["output"];
  totalMembers: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
};

export type OrganizationOverview = {
  __typename?: "OrganizationOverview";
  attentionMembers: Array<OrganizationAttentionMember>;
  complianceDistribution: OrganizationComplianceDistribution;
  summary: OrganizationOverviewSummary;
  trendingTopics: Array<OrganizationTrendingTopic>;
};

export type OrganizationOverviewSummary = {
  __typename?: "OrganizationOverviewSummary";
  activeAssignments: Scalars["Int"]["output"];
  activeMembers: Scalars["Int"]["output"];
  averageCompliance: Scalars["Float"]["output"];
  engagementRate: Scalars["Float"]["output"];
  nonCompliantMembers: Scalars["Int"]["output"];
  totalMembers: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
};

export type OrganizationPageInfo = {
  __typename?: "OrganizationPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type OrganizationPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type OrganizationProfile = {
  __typename?: "OrganizationProfile";
  contactEmail?: Maybe<Scalars["String"]["output"]>;
  contactPhone?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  industry?: Maybe<Scalars["String"]["output"]>;
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  memberLimit?: Maybe<Scalars["Int"]["output"]>;
  organizationName: Scalars["String"]["output"];
  timezone?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
  website?: Maybe<Scalars["String"]["output"]>;
};

export type OrganizationReport = {
  __typename?: "OrganizationReport";
  complianceTrend: Array<OrganizationReportTrendPoint>;
  departmentCompliance: Array<OrganizationReportDepartment>;
  summary: OrganizationReportSummary;
};

export type OrganizationReportDepartment = {
  __typename?: "OrganizationReportDepartment";
  averagePdus: Scalars["Float"]["output"];
  compliance: Scalars["Float"]["output"];
  departmentId?: Maybe<Scalars["ID"]["output"]>;
  departmentTitle: Scalars["String"]["output"];
  teamSize: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
};

export type OrganizationReportFilterInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  range?: InputMaybe<OrganizationReportRangeEnum>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
};

export enum OrganizationReportRangeEnum {
  CurrentYear = "CURRENT_YEAR",
  Custom = "CUSTOM",
  LastQuarter = "LAST_QUARTER",
}

export type OrganizationReportSummary = {
  __typename?: "OrganizationReportSummary";
  averageCompliance: Scalars["Float"]["output"];
  averagePdus: Scalars["Float"]["output"];
  requiredHours: Scalars["Float"]["output"];
  totalMembers: Scalars["Int"]["output"];
  totalPdus: Scalars["Float"]["output"];
};

export type OrganizationReportTopMember = {
  __typename?: "OrganizationReportTopMember";
  completedLearning: Scalars["Int"]["output"];
  compliance: Scalars["Float"]["output"];
  departmentTitle?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  pdus: Scalars["Float"]["output"];
  userId: Scalars["ID"]["output"];
};

export type OrganizationReportTopMembersFilterInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  endDate?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["String"]["input"]>;
};

export type OrganizationReportTrendPoint = {
  __typename?: "OrganizationReportTrendPoint";
  compliance: Scalars["Float"]["output"];
  date: Scalars["String"]["output"];
  label: Scalars["String"]["output"];
  pdus: Scalars["Float"]["output"];
};

export type OrganizationSettings = {
  __typename?: "OrganizationSettings";
  assignmentNotifications: Scalars["Boolean"]["output"];
  complianceAlerts: Scalars["Boolean"]["output"];
  complianceCycle: ComplianceCycle;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  minimumPdu: Scalars["Float"]["output"];
  organizationId: Scalars["ID"]["output"];
  strictCompliance: Scalars["Boolean"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  weeklySummaryReport: Scalars["Boolean"]["output"];
};

export type OrganizationTrendingTopic = {
  __typename?: "OrganizationTrendingTopic";
  count: Scalars["Int"]["output"];
  percentage: Scalars["Float"]["output"];
  title: Scalars["String"]["output"];
};

export enum OrganizationType {
  Association = "ASSOCIATION",
  Company = "COMPANY",
  Government = "GOVERNMENT",
  NonProfit = "NON_PROFIT",
  Other = "OTHER",
  TrainingProvider = "TRAINING_PROVIDER",
  University = "UNIVERSITY",
}

export enum PduCategory {
  Business = "BUSINESS",
  Communication = "COMMUNICATION",
  Compliance = "COMPLIANCE",
  DigitalAi = "DIGITAL_AI",
  Ethics = "ETHICS",
  IndustryKnowledge = "INDUSTRY_KNOWLEDGE",
  Leadership = "LEADERSHIP",
  Other = "OTHER",
  ProfessionalPractice = "PROFESSIONAL_PRACTICE",
  ResearchInnovation = "RESEARCH_INNOVATION",
  Strategic = "STRATEGIC",
  Technical = "TECHNICAL",
}

export enum PduCompletionStatus {
  Completed = "COMPLETED",
  Incomplete = "INCOMPLETE",
}

export enum PduSource {
  CertificationProgram = "CERTIFICATION_PROGRAM",
  Conference = "CONFERENCE",
  Course = "COURSE",
  Event = "EVENT",
  ExamAssessment = "EXAM_ASSESSMENT",
  Meeting = "MEETING",
  Mentorship = "MENTORSHIP",
  Other = "OTHER",
  Podcast = "PODCAST",
  ReadingArticle = "READING_ARTICLE",
  SelfStudy = "SELF_STUDY",
  Seminar = "SEMINAR",
  Teaching = "TEACHING",
  TrainingSession = "TRAINING_SESSION",
  VideoLecture = "VIDEO_LECTURE",
  Volunteering = "VOLUNTEERING",
  Webinar = "WEBINAR",
  Workshop = "WORKSHOP",
  Youtube = "YOUTUBE",
}

export enum PduStatus {
  Approved = "APPROVED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}

export type PaginatedAdminAuditLogs = {
  __typename?: "PaginatedAdminAuditLogs";
  items: Array<AdminAuditLog>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAdminOrg = {
  __typename?: "PaginatedAdminOrg";
  items: Array<AdminOrg>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAdminOrgAccessRequests = {
  __typename?: "PaginatedAdminOrgAccessRequests";
  items: Array<AdminOrgAccessRequest>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAdminOrgMembers = {
  __typename?: "PaginatedAdminOrgMembers";
  items: Array<AdminOrgMember>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAdminUser = {
  __typename?: "PaginatedAdminUser";
  items: Array<AdminUser>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationGeneratedReports = {
  __typename?: "PaginatedAssociationGeneratedReports";
  items: Array<AssociationGeneratedReport>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationLearningContents = {
  __typename?: "PaginatedAssociationLearningContents";
  items: Array<AssociationLearningContent>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationMemberActivities = {
  __typename?: "PaginatedAssociationMemberActivities";
  counts: AssociationActivityCounts;
  items: Array<AssociationMemberActivity>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationMemberProgress = {
  __typename?: "PaginatedAssociationMemberProgress";
  items: Array<AssociationMemberProgressRow>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationMembers = {
  __typename?: "PaginatedAssociationMembers";
  items: Array<AssociationMember>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationMissingEvidence = {
  __typename?: "PaginatedAssociationMissingEvidence";
  items: Array<AssociationMissingEvidenceRow>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationRenewalReadiness = {
  __typename?: "PaginatedAssociationRenewalReadiness";
  items: Array<AssociationRenewalReadinessRow>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedAssociationRequirements = {
  __typename?: "PaginatedAssociationRequirements";
  items: Array<AssociationRequirement>;
  pageInfo: AssociationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedCourses = {
  __typename?: "PaginatedCourses";
  items: Array<Course>;
  pageInfo: CoursePageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedEvents = {
  __typename?: "PaginatedEvents";
  items: Array<Event>;
  pageInfo: EventPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedExternalLearning = {
  __typename?: "PaginatedExternalLearning";
  items: Array<ExternalLearningActivity>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedOrganizationAccessRequests = {
  __typename?: "PaginatedOrganizationAccessRequests";
  items: Array<OrganizationAccessRequest>;
  pageInfo: OrganizationAccessRequestPageInfo;
};

export type PaginatedOrganizationAssignments = {
  __typename?: "PaginatedOrganizationAssignments";
  items: Array<OrganizationAssignment>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedOrganizationCpdCategories = {
  __typename?: "PaginatedOrganizationCpdCategories";
  items: Array<OrganizationCpdCategory>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedOrganizationEventCatalog = {
  __typename?: "PaginatedOrganizationEventCatalog";
  items: Array<OrganizationEventCatalogItem>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedOrganizationMembers = {
  __typename?: "PaginatedOrganizationMembers";
  items: Array<OrganizationMember>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedOrganizationReportTopMembers = {
  __typename?: "PaginatedOrganizationReportTopMembers";
  items: Array<OrganizationReportTopMember>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedPodcasts = {
  __typename?: "PaginatedPodcasts";
  items: Array<Podcast>;
  pageInfo: PodcastPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProfessionalCalendarEvents = {
  __typename?: "PaginatedProfessionalCalendarEvents";
  items: Array<ProfessionalCalendarEvent>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProfessionalCertificates = {
  __typename?: "PaginatedProfessionalCertificates";
  activeCertificates: Scalars["Int"]["output"];
  items: Array<ProfessionalCertificate>;
  pageInfo: ProfessionalPageInfo;
  totalCertificates: Scalars["Int"]["output"];
  totalCount: Scalars["Int"]["output"];
  totalPdusEarned: Scalars["Float"]["output"];
};

export type PaginatedProfessionalCourses = {
  __typename?: "PaginatedProfessionalCourses";
  items: Array<ProfessionalCourse>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProfessionalExploreRoadmaps = {
  __typename?: "PaginatedProfessionalExploreRoadmaps";
  items: Array<ProfessionalExploreRoadmap>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProfessionalPayments = {
  __typename?: "PaginatedProfessionalPayments";
  items: Array<ProfessionalPayment>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
  totalSpent: Scalars["Float"]["output"];
  totalTransactions: Scalars["Int"]["output"];
};

export type PaginatedProfessionalPduActivities = {
  __typename?: "PaginatedProfessionalPduActivities";
  items: Array<ProfessionalPduActivity>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProfessionalRoadmaps = {
  __typename?: "PaginatedProfessionalRoadmaps";
  items: Array<ProfessionalRoadmap>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedPromotionRequests = {
  __typename?: "PaginatedPromotionRequests";
  items: Array<PromotionRequest>;
  pageInfo: ProviderPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProviderAttendees = {
  __typename?: "PaginatedProviderAttendees";
  items: Array<ProviderAttendee>;
  pageInfo: ProviderPageInfo;
  stats: ProviderAttendeesStats;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProviderEvents = {
  __typename?: "PaginatedProviderEvents";
  items: Array<ProviderEventTableRow>;
  pageInfo: ProviderPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedRoadmapChatMessages = {
  __typename?: "PaginatedRoadmapChatMessages";
  items: Array<RoadmapChatMessage>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedUsers = {
  __typename?: "PaginatedUsers";
  items: Array<User>;
  pageInfo: UserPageInfo;
};

export type PaginatedWishlist = {
  __typename?: "PaginatedWishlist";
  categories: Array<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  items: Array<WishlistItem>;
  limit: Scalars["Int"]["output"];
  page: Scalars["Int"]["output"];
  totalCount: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type PaginatedYouTubeChannels = {
  __typename?: "PaginatedYouTubeChannels";
  items: Array<YouTubeChannel>;
  pageInfo: YouTubeChannelPageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type PatchRoadmapDraftInput = {
  budgetPreference?: InputMaybe<LearningBudgetPreference>;
  certificationId?: InputMaybe<Scalars["ID"]["input"]>;
  certificationName?: InputMaybe<Scalars["String"]["input"]>;
  completedCredits?: InputMaybe<Scalars["Float"]["input"]>;
  context?: InputMaybe<Scalars["String"]["input"]>;
  cpdEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  draftId: Scalars["ID"]["input"];
  goal?: InputMaybe<Scalars["String"]["input"]>;
  goalReason?: InputMaybe<Scalars["String"]["input"]>;
  preferredContentTypes?: InputMaybe<Array<ContentType>>;
  preferredFormats?: InputMaybe<Array<LearningFormat>>;
  requiredCredits?: InputMaybe<Scalars["Float"]["input"]>;
  skillLevel?: InputMaybe<SkillLevel>;
  subjects?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  targetDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  targetRole?: InputMaybe<Scalars["String"]["input"]>;
  timeCommitment?: InputMaybe<LearningTimeCommitment>;
};

export enum PaymentStatus {
  Cancelled = "CANCELLED",
  Failed = "FAILED",
  Paid = "PAID",
  Pending = "PENDING",
  Refunded = "REFUNDED",
}

export type Podcast = {
  __typename?: "Podcast";
  category: PodcastCategory;
  createdAt: Scalars["DateTime"]["output"];
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  description: Scalars["String"]["output"];
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  episodeCount: Scalars["Int"]["output"];
  host: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isFeatured: Scalars["Boolean"]["output"];
  listeners: Scalars["Int"]["output"];
  providerId?: Maybe<Scalars["String"]["output"]>;
  rating: Scalars["Float"]["output"];
  ratingCount: Scalars["Int"]["output"];
  slug: Scalars["String"]["output"];
  status: PodcastStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export enum PodcastCategory {
  Ai = "AI",
  Business = "BUSINESS",
  Career = "CAREER",
  Compliance = "COMPLIANCE",
  Cpd = "CPD",
  Data = "DATA",
  Design = "DESIGN",
  Education = "EDUCATION",
  Engineering = "ENGINEERING",
  Finance = "FINANCE",
  Healthcare = "HEALTHCARE",
  Leadership = "LEADERSHIP",
  Marketing = "MARKETING",
  Other = "OTHER",
  Technology = "TECHNOLOGY",
}

export type PodcastEpisode = {
  __typename?: "PodcastEpisode";
  audioUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  episodeNumber: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  podcastId: Scalars["String"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type PodcastFilterInput = {
  category?: InputMaybe<PodcastCategory>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  providerId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<PodcastStatus>;
};

export type PodcastPageInfo = {
  __typename?: "PodcastPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type PodcastPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum PodcastSortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export enum PodcastSortField {
  CreatedAt = "CREATED_AT",
  EpisodeCount = "EPISODE_COUNT",
  Listeners = "LISTENERS",
  Rating = "RATING",
  Title = "TITLE",
  UpdatedAt = "UPDATED_AT",
}

export type PodcastSortInput = {
  direction?: InputMaybe<PodcastSortDirection>;
  field?: InputMaybe<PodcastSortField>;
};

export enum PodcastStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type PopularCategoriesInput = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type PopularCategory = {
  __typename?: "PopularCategory";
  averageRating: Scalars["Float"]["output"];
  category: Scalars["String"]["output"];
  courseCount: Scalars["Int"]["output"];
  eventCount: Scalars["Int"]["output"];
  podcastCount: Scalars["Int"]["output"];
  popularityScore: Scalars["Float"]["output"];
  totalItems: Scalars["Int"]["output"];
  youtubeCount: Scalars["Int"]["output"];
};

export type ProfessionalActionResponse = {
  __typename?: "ProfessionalActionResponse";
  id: Scalars["ID"]["output"];
};

export type ProfessionalCalendarEvent = {
  __typename?: "ProfessionalCalendarEvent";
  attendedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  durationMinutes: Scalars["Int"]["output"];
  event?: Maybe<ProfessionalCalendarEventInfo>;
  eventId: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  isLive: Scalars["Boolean"]["output"];
  isPast: Scalars["Boolean"]["output"];
  isUpcoming: Scalars["Boolean"]["output"];
  startsInMinutes?: Maybe<Scalars["Int"]["output"]>;
  status: EventRegistrationStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type ProfessionalCalendarEventInfo = {
  __typename?: "ProfessionalCalendarEventInfo";
  deliveryMode: EventDeliveryMode;
  endDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  location?: Maybe<Scalars["String"]["output"]>;
  onlineUrl?: Maybe<Scalars["String"]["output"]>;
  pdu: Scalars["Float"]["output"];
  slug: Scalars["String"]["output"];
  startDate: Scalars["DateTime"]["output"];
  timezone: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  type: EventType;
};

export type ProfessionalCalendarEventsFilterInput = {
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  from?: InputMaybe<Scalars["DateTime"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<EventRegistrationStatus>;
  to?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type ProfessionalCertificate = {
  __typename?: "ProfessionalCertificate";
  certificateNumber?: Maybe<Scalars["String"]["output"]>;
  certificateUrl?: Maybe<Scalars["String"]["output"]>;
  contentId?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<ContentType>;
  cpdPlanId?: Maybe<Scalars["ID"]["output"]>;
  cpdPlanName?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  evidenceFiles: Array<ProfessionalCertificateFile>;
  id: Scalars["ID"]["output"];
  issuedAt: Scalars["DateTime"]["output"];
  issuer?: Maybe<Scalars["String"]["output"]>;
  pduEarned: Scalars["Float"]["output"];
  status: CertificateStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
  validUntil?: Maybe<Scalars["DateTime"]["output"]>;
  verificationCode: Scalars["String"]["output"];
};

export type ProfessionalCertificateFile = {
  __typename?: "ProfessionalCertificateFile";
  createdAt: Scalars["DateTime"]["output"];
  fileName: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  mimeType: Scalars["String"]["output"];
  sizeBytes: Scalars["Int"]["output"];
};

export type ProfessionalCertificateOption = {
  __typename?: "ProfessionalCertificateOption";
  id: Scalars["ID"]["output"];
  issuer?: Maybe<Scalars["String"]["output"]>;
  status: CertificateStatus;
  title: Scalars["String"]["output"];
  validUntil?: Maybe<Scalars["DateTime"]["output"]>;
};

export type ProfessionalCertificateSummary = {
  __typename?: "ProfessionalCertificateSummary";
  active: Scalars["Int"]["output"];
  expired: Scalars["Int"]["output"];
  expiringSoon: Scalars["Int"]["output"];
  nearestExpiry?: Maybe<Scalars["DateTime"]["output"]>;
  total: Scalars["Int"]["output"];
};

export type ProfessionalCourse = {
  __typename?: "ProfessionalCourse";
  canceledAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  contentId: Scalars["String"]["output"];
  contentType: ContentType;
  courseCategory?: Maybe<CourseCategory>;
  courseCurrency?: Maybe<Scalars["String"]["output"]>;
  courseDescription?: Maybe<Scalars["String"]["output"]>;
  courseDurationMinutes?: Maybe<Scalars["Int"]["output"]>;
  courseImageUrl?: Maybe<Scalars["String"]["output"]>;
  courseIsFree?: Maybe<Scalars["Boolean"]["output"]>;
  courseLevel?: Maybe<CourseLevel>;
  coursePrice?: Maybe<Scalars["Float"]["output"]>;
  courseRating?: Maybe<Scalars["Float"]["output"]>;
  courseRatingCount?: Maybe<Scalars["Int"]["output"]>;
  courseSlug?: Maybe<Scalars["String"]["output"]>;
  courseTitle?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  progress: Scalars["Int"]["output"];
  providerName?: Maybe<Scalars["String"]["output"]>;
  startedAt: Scalars["DateTime"]["output"];
  status: ContentEnrollmentStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type ProfessionalCpdPlan = {
  __typename?: "ProfessionalCpdPlan";
  category: PduCategory;
  id: Scalars["ID"]["output"];
  target: Scalars["Float"]["output"];
  year: Scalars["Int"]["output"];
};

export type ProfessionalCredential = {
  __typename?: "ProfessionalCredential";
  annualCpdHours?: Maybe<Scalars["Float"]["output"]>;
  certificationId?: Maybe<Scalars["ID"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  expiryDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  issueDate?: Maybe<Scalars["DateTime"]["output"]>;
  issuingOrganization?: Maybe<Scalars["String"]["output"]>;
  licenceNumber?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  pduTargetId?: Maybe<Scalars["ID"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProfessionalDashboardProfile = {
  __typename?: "ProfessionalDashboardProfile";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  certificatesEarned: Scalars["Int"]["output"];
  completion: ProfessionalProfileCompletion;
  countryCode?: Maybe<Scalars["String"]["output"]>;
  coursesEnrolled: Scalars["Int"]["output"];
  credentials: Array<ProfessionalCredential>;
  currentRole?: Maybe<Scalars["String"]["output"]>;
  currentSkillLevel?: Maybe<SkillLevel>;
  email?: Maybe<Scalars["String"]["output"]>;
  experienceRange?: Maybe<ExperienceRange>;
  favoriteSubjects: Array<ProfessionalTaxonomyTerm>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  industry?: Maybe<ProfessionalIndustry>;
  isEmailVerified: Scalars["Boolean"]["output"];
  language?: Maybe<AppLanguage>;
  learningBudgetPreference?: Maybe<LearningBudgetPreference>;
  learningHours: Scalars["Float"]["output"];
  learningTimeCommitment?: Maybe<LearningTimeCommitment>;
  linkedInUrl?: Maybe<Scalars["String"]["output"]>;
  mainSkillAreas: Array<ProfessionalTaxonomyTerm>;
  onboardingCompletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  onboardingDismissedAt?: Maybe<Scalars["DateTime"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  preferredLearningFormats: Array<LearningFormat>;
  profession?: Maybe<Scalars["String"]["output"]>;
  professionalGoal?: Maybe<ProfessionalGoal>;
  professionalSummary?: Maybe<Scalars["String"]["output"]>;
  role: Role;
  skillsToImprove: Array<ProfessionalTaxonomyTerm>;
  status: UserStatus;
  targetSkillLevel?: Maybe<SkillLevel>;
  timeZone?: Maybe<Scalars["String"]["output"]>;
  workLocation?: Maybe<Scalars["String"]["output"]>;
};

export type ProfessionalExploreRoadmap = {
  __typename?: "ProfessionalExploreRoadmap";
  category?: Maybe<CourseCategory>;
  description: Scalars["String"]["output"];
  estimatedWeeks: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isEnrolled: Scalars["Boolean"]["output"];
  level: CourseLevel;
  phasesCount: Scalars["Int"]["output"];
  slug: Scalars["String"]["output"];
  status: RoadmapStatus;
  title: Scalars["String"]["output"];
  totalSteps: Scalars["Int"]["output"];
};

export enum ProfessionalGoal {
  ExploreProfessionalPath = "EXPLORE_PROFESSIONAL_PATH",
  GrowInCurrentRole = "GROW_IN_CURRENT_ROLE",
  MaintainCertification = "MAINTAIN_CERTIFICATION",
  PrepareForNextRole = "PREPARE_FOR_NEXT_ROLE",
}

export enum ProfessionalIndustry {
  Construction = "CONSTRUCTION",
  Education = "EDUCATION",
  Engineering = "ENGINEERING",
  Finance = "FINANCE",
  Healthcare = "HEALTHCARE",
  Legal = "LEGAL",
  Manufacturing = "MANUFACTURING",
  Marketing = "MARKETING",
  NonProfit = "NON_PROFIT",
  Other = "OTHER",
  PublicSector = "PUBLIC_SECTOR",
  Technology = "TECHNOLOGY",
}

export type ProfessionalManualCalendarEvent = {
  __typename?: "ProfessionalManualCalendarEvent";
  contentId?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars["DateTime"]["output"];
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  endDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  isLive: Scalars["Boolean"]["output"];
  isPast: Scalars["Boolean"]["output"];
  isUpcoming: Scalars["Boolean"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  startDate: Scalars["DateTime"]["output"];
  startsInMinutes?: Maybe<Scalars["Int"]["output"]>;
  title: Scalars["String"]["output"];
  type: CalendarEventType;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
};

export type ProfessionalOverview = {
  __typename?: "ProfessionalOverview";
  activeCourses: Scalars["Int"]["output"];
  certificatesEarned: Scalars["Int"]["output"];
  completedCourses: Scalars["Int"]["output"];
  professionalName?: Maybe<Scalars["String"]["output"]>;
  totalPdus: Scalars["Float"]["output"];
  upcomingEvents: Scalars["Int"]["output"];
  yearlyPduGoalProgress: Scalars["Float"]["output"];
};

export type ProfessionalPageInfo = {
  __typename?: "ProfessionalPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type ProfessionalPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ProfessionalPayment = {
  __typename?: "ProfessionalPayment";
  amount: Scalars["Float"]["output"];
  contentId?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars["DateTime"]["output"];
  currency: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  paidAt?: Maybe<Scalars["DateTime"]["output"]>;
  providerPaymentId?: Maybe<Scalars["String"]["output"]>;
  receiptUrl?: Maybe<Scalars["String"]["output"]>;
  status: PaymentStatus;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type ProfessionalPduActivity = {
  __typename?: "ProfessionalPduActivity";
  category: PduCategory;
  completionStatus: PduCompletionStatus;
  contentId?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars["DateTime"]["output"];
  creditType: CreditType;
  date: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  evidenceFiles: Array<ProfessionalPduActivityFile>;
  evidenceNote?: Maybe<Scalars["String"]["output"]>;
  evidenceUrl?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["String"]["output"];
  issuingOrganization?: Maybe<Scalars["String"]["output"]>;
  learningOutcome?: Maybe<Scalars["String"]["output"]>;
  pdus: Scalars["Float"]["output"];
  providerOrganizer?: Maybe<Scalars["String"]["output"]>;
  relatedCertification?: Maybe<Scalars["String"]["output"]>;
  reportingYear?: Maybe<Scalars["Int"]["output"]>;
  source: PduSource;
  status: PduStatus;
  subCategory?: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProfessionalPduActivityFile = {
  __typename?: "ProfessionalPduActivityFile";
  createdAt: Scalars["DateTime"]["output"];
  fileName: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  mimeType: Scalars["String"]["output"];
  sizeBytes: Scalars["Int"]["output"];
};

export type ProfessionalPduActivityFilterInput = {
  activityType?: InputMaybe<PduSource>;
  category?: InputMaybe<PduCategory>;
  completionStatus?: InputMaybe<PduCompletionStatus>;
  creditType?: InputMaybe<CreditType>;
  dateFrom?: InputMaybe<Scalars["String"]["input"]>;
  dateTo?: InputMaybe<Scalars["String"]["input"]>;
  hasCertificate?: InputMaybe<Scalars["Boolean"]["input"]>;
  reportingYear?: InputMaybe<Scalars["Int"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProfessionalPduActivitySummary = {
  __typename?: "ProfessionalPduActivitySummary";
  activitiesWithEvidence: Scalars["Int"]["output"];
  completedActivities: Scalars["Int"]["output"];
  evidenceFilesCount: Scalars["Int"]["output"];
};

export type ProfessionalPduCategorySummary = {
  __typename?: "ProfessionalPduCategorySummary";
  category: PduCategory;
  pdus: Scalars["Float"]["output"];
};

export type ProfessionalPduMonthlyPoint = {
  __typename?: "ProfessionalPduMonthlyPoint";
  month: Scalars["Int"]["output"];
  pdus: Scalars["Float"]["output"];
};

export type ProfessionalPduReport = {
  __typename?: "ProfessionalPduReport";
  activities: Scalars["Int"]["output"];
  averagePerMonth: Scalars["Float"]["output"];
  byCategory: Array<ProfessionalPduCategorySummary>;
  byMonth: Array<ProfessionalPduMonthlyPoint>;
  progressToGoal: Scalars["Float"]["output"];
  targets: Array<ProfessionalPduTarget>;
  totalPdus: Scalars["Float"]["output"];
  year: Scalars["Int"]["output"];
};

export type ProfessionalPduTarget = {
  __typename?: "ProfessionalPduTarget";
  category: PduCategory;
  id: Scalars["String"]["output"];
  target: Scalars["Float"]["output"];
  year: Scalars["Int"]["output"];
};

export type ProfessionalProfile = {
  __typename?: "ProfessionalProfile";
  createdAt: Scalars["DateTime"]["output"];
  currentRole?: Maybe<Scalars["String"]["output"]>;
  experienceRange?: Maybe<ExperienceRange>;
  id: Scalars["ID"]["output"];
  industry?: Maybe<ProfessionalIndustry>;
  interests: Array<Scalars["String"]["output"]>;
  profession?: Maybe<Scalars["String"]["output"]>;
  skills: Array<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
  workLocation?: Maybe<Scalars["String"]["output"]>;
};

export type ProfessionalProfileCompletion = {
  __typename?: "ProfessionalProfileCompletion";
  completedCount: Scalars["Int"]["output"];
  percentage: Scalars["Int"]["output"];
  sections: Array<ProfessionalProfileSection>;
  totalSections: Scalars["Int"]["output"];
};

export type ProfessionalProfileSection = {
  __typename?: "ProfessionalProfileSection";
  isComplete: Scalars["Boolean"]["output"];
  key: ProfileSectionKey;
  missingFields: Array<Scalars["String"]["output"]>;
};

export type ProfessionalRoadmap = {
  __typename?: "ProfessionalRoadmap";
  category?: Maybe<CourseCategory>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedPhases: Scalars["Int"]["output"];
  completedSteps: Scalars["Int"]["output"];
  coverageNote?: Maybe<Scalars["String"]["output"]>;
  description: Scalars["String"]["output"];
  earnedCredits: Scalars["Float"]["output"];
  enrolledAt: Scalars["DateTime"]["output"];
  estimatedWeeks?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  level: CourseLevel;
  nextMilestoneProgress: Scalars["Int"]["output"];
  nextPhaseTitle?: Maybe<Scalars["String"]["output"]>;
  phases: Array<ProfessionalRoadmapPhase>;
  phasesCount: Scalars["Int"]["output"];
  progress: Scalars["Int"]["output"];
  requiredCredits?: Maybe<Scalars["Float"]["output"]>;
  roadmapId: Scalars["ID"]["output"];
  roadmapStatus: RoadmapStatus;
  slug: Scalars["String"]["output"];
  source: RoadmapSource;
  status: RoadmapEnrollmentStatus;
  targetDate?: Maybe<Scalars["DateTime"]["output"]>;
  title: Scalars["String"]["output"];
  totalSteps: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type ProfessionalRoadmapDraft = {
  __typename?: "ProfessionalRoadmapDraft";
  budgetPreference?: Maybe<LearningBudgetPreference>;
  certificationId?: Maybe<Scalars["ID"]["output"]>;
  certificationName?: Maybe<Scalars["String"]["output"]>;
  completedCredits?: Maybe<Scalars["Float"]["output"]>;
  context?: Maybe<Scalars["String"]["output"]>;
  cpdEnabled: Scalars["Boolean"]["output"];
  currentStep: RoadmapDraftStep;
  failureReason?: Maybe<Scalars["String"]["output"]>;
  goal?: Maybe<Scalars["String"]["output"]>;
  goalReason?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  isComplete: Scalars["Boolean"]["output"];
  needsClarification: Scalars["Boolean"]["output"];
  preferredContentTypes: Array<ContentType>;
  preferredFormats: Array<LearningFormat>;
  requiredCredits?: Maybe<Scalars["Float"]["output"]>;
  skillLevel?: Maybe<SkillLevel>;
  status: RoadmapDraftStatus;
  subjectOptions: Array<RoadmapSubjectOption>;
  subjects: Array<Scalars["String"]["output"]>;
  targetDate?: Maybe<Scalars["DateTime"]["output"]>;
  targetRole?: Maybe<Scalars["String"]["output"]>;
  timeCommitment?: Maybe<LearningTimeCommitment>;
  transcript: PaginatedRoadmapChatMessages;
  updatedAt: Scalars["DateTime"]["output"];
  wasRefused: Scalars["Boolean"]["output"];
  widget?: Maybe<RoadmapWidget>;
};

export type ProfessionalRoadmapPhase = {
  __typename?: "ProfessionalRoadmapPhase";
  completed: Scalars["Boolean"]["output"];
  completedSteps: Scalars["Int"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  estimatedWeeks?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  order: Scalars["Int"]["output"];
  progress: Scalars["Int"]["output"];
  steps: Array<ProfessionalRoadmapStep>;
  stepsCount: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
};

export type ProfessionalRoadmapStep = {
  __typename?: "ProfessionalRoadmapStep";
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  contentId?: Maybe<Scalars["String"]["output"]>;
  contentType?: Maybe<ContentType>;
  description?: Maybe<Scalars["String"]["output"]>;
  estimatedMinutes?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  order: Scalars["Int"]["output"];
  status?: Maybe<RoadmapStepProgressStatus>;
  title: Scalars["String"]["output"];
};

export type ProfessionalSearchInput = {
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProfessionalSession = {
  __typename?: "ProfessionalSession";
  createdAt: Scalars["DateTime"]["output"];
  expiresAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  ipAddress?: Maybe<Scalars["String"]["output"]>;
  revokedAt?: Maybe<Scalars["DateTime"]["output"]>;
  status: SessionStatus;
  updatedAt: Scalars["DateTime"]["output"];
  userAgent?: Maybe<Scalars["String"]["output"]>;
  userId: Scalars["ID"]["output"];
};

export type ProfessionalSettings = {
  __typename?: "ProfessionalSettings";
  courseUpdates: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  emailNotifications: Scalars["Boolean"]["output"];
  eventReminders: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  interfaceLanguage: AppLanguage;
  loginAlerts: Scalars["Boolean"]["output"];
  messages: Scalars["Boolean"]["output"];
  profileVisibility: ProfileVisibility;
  pushNotifications: Scalars["Boolean"]["output"];
  showCertificates: Scalars["Boolean"]["output"];
  showEmail: Scalars["Boolean"]["output"];
  showLearningProgress: Scalars["Boolean"]["output"];
  theme: Theme;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["ID"]["output"];
};

export type ProfessionalTaxonomyGroup = {
  __typename?: "ProfessionalTaxonomyGroup";
  groupKey: Scalars["String"]["output"];
  groupLabel: Scalars["String"]["output"];
  kind: ProfileTaxonomyKind;
  terms: Array<ProfessionalTaxonomyTerm>;
};

export type ProfessionalTaxonomyTerm = {
  __typename?: "ProfessionalTaxonomyTerm";
  groupKey: Scalars["String"]["output"];
  groupLabel: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  key: Scalars["String"]["output"];
  kind: ProfileTaxonomyKind;
  label: Scalars["String"]["output"];
  sortOrder: Scalars["Int"]["output"];
};

export enum ProfileSectionKey {
  BasicProfile = "BASIC_PROFILE",
  Certifications = "CERTIFICATIONS",
  Preferences = "PREFERENCES",
  ProfessionalDetails = "PROFESSIONAL_DETAILS",
  SkillsInterests = "SKILLS_INTERESTS",
}

export enum ProfileTaxonomyKind {
  Role = "ROLE",
  SkillArea = "SKILL_AREA",
  Subject = "SUBJECT",
}

export enum ProfileVisibility {
  FollowersOnly = "FOLLOWERS_ONLY",
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type PromotionRequest = {
  __typename?: "PromotionRequest";
  budget?: Maybe<Scalars["Float"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  eventId: Scalars["ID"]["output"];
  eventTitle: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  note?: Maybe<Scalars["String"]["output"]>;
  promotionType: PromotionType;
  providerId: Scalars["ID"]["output"];
  rejectReason?: Maybe<Scalars["String"]["output"]>;
  status: PromotionRequestStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export enum PromotionRequestStatus {
  Approved = "APPROVED",
  Cancelled = "CANCELLED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}

export enum PromotionType {
  ComboPackage = "COMBO_PACKAGE",
  EmailCampaign = "EMAIL_CAMPAIGN",
  FeaturedListing = "FEATURED_LISTING",
  SocialMediaBoost = "SOCIAL_MEDIA_BOOST",
}

export type ProviderAnalytics = {
  __typename?: "ProviderAnalytics";
  avgFeePerAttendee: Scalars["Float"]["output"];
  avgRating: Scalars["Float"]["output"];
  conversionRate: Scalars["Float"]["output"];
  eventTypeBreakdown: Array<ProviderBreakdownPoint>;
  pdusByCategory: Array<ProviderBreakdownPoint>;
  registrationsOverTime: Array<ProviderTimeSeriesPoint>;
  topPerformingEvents: Array<ProviderTopEvent>;
  totalRevenue: Scalars["Float"]["output"];
};

export type ProviderAttendee = {
  __typename?: "ProviderAttendee";
  attendedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  eventId: Scalars["ID"]["output"];
  eventTitle: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  registrationDate: Scalars["DateTime"]["output"];
  registrationId: Scalars["ID"]["output"];
  status: EventRegistrationStatus;
  userId: Scalars["ID"]["output"];
};

export type ProviderAttendeeStats = {
  __typename?: "ProviderAttendeeStats";
  attendanceRate: Scalars["Float"]["output"];
  attended: Scalars["Int"]["output"];
  confirmed: Scalars["Int"]["output"];
  totalRegistered: Scalars["Int"]["output"];
};

export type ProviderAttendeesFilterInput = {
  eventId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<EventRegistrationStatus>;
};

export type ProviderAttendeesStats = {
  __typename?: "ProviderAttendeesStats";
  attendanceRate: Scalars["Float"]["output"];
  attended: Scalars["Int"]["output"];
  confirmed: Scalars["Int"]["output"];
  totalRegistered: Scalars["Int"]["output"];
};

export type ProviderBreakdownPoint = {
  __typename?: "ProviderBreakdownPoint";
  count: Scalars["Int"]["output"];
  label: Scalars["String"]["output"];
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type ProviderDashboardPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum ProviderDashboardRange {
  Last_7Days = "LAST_7_DAYS",
  Last_30Days = "LAST_30_DAYS",
  Last_90Days = "LAST_90_DAYS",
  ThisYear = "THIS_YEAR",
}

export type ProviderDashboardRangeInput = {
  range?: InputMaybe<ProviderDashboardRange>;
};

export type ProviderEventTableRow = {
  __typename?: "ProviderEventTableRow";
  id: Scalars["ID"]["output"];
  pdu: Scalars["Float"]["output"];
  registrants: Scalars["Int"]["output"];
  startDate: Scalars["DateTime"]["output"];
  status: EventStatus;
  title: Scalars["String"]["output"];
  views: Scalars["Int"]["output"];
};

export type ProviderEventsFilterInput = {
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<EventStatus>;
};

export type ProviderOverview = {
  __typename?: "ProviderOverview";
  conversionRate: Scalars["Float"]["output"];
  providerName?: Maybe<Scalars["String"]["output"]>;
  statusBreakdown: ProviderStatusBreakdown;
  totalEvents: Scalars["Int"]["output"];
  totalRegistrations: Scalars["Int"]["output"];
  totalViews: Scalars["Int"]["output"];
  upcomingSessions: Scalars["Int"]["output"];
};

export type ProviderPageInfo = {
  __typename?: "ProviderPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type ProviderProfile = {
  __typename?: "ProviderProfile";
  contactEmail?: Maybe<Scalars["String"]["output"]>;
  contactPhone?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  isPremium: Scalars["Boolean"]["output"];
  logoUrl?: Maybe<Scalars["String"]["output"]>;
  organizationName?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  userId: Scalars["String"]["output"];
  website?: Maybe<Scalars["String"]["output"]>;
};

export type ProviderPromotionFilterInput = {
  eventId?: InputMaybe<Scalars["String"]["input"]>;
  promotionType?: InputMaybe<PromotionType>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<PromotionRequestStatus>;
};

export type ProviderSettings = {
  __typename?: "ProviderSettings";
  aboutOrganization?: Maybe<Scalars["String"]["output"]>;
  contactEmail?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  eventReminderEnabled: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  newRegistrationAlertEnabled: Scalars["Boolean"]["output"];
  organizationName?: Maybe<Scalars["String"]["output"]>;
  organizationProfile?: Maybe<Scalars["String"]["output"]>;
  providerId: Scalars["ID"]["output"];
  reminderHoursBeforeEvent: Scalars["Int"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type ProviderStatusBreakdown = {
  __typename?: "ProviderStatusBreakdown";
  archived: Scalars["Int"]["output"];
  cancelled: Scalars["Int"]["output"];
  draft: Scalars["Int"]["output"];
  published: Scalars["Int"]["output"];
};

export type ProviderTimeSeriesPoint = {
  __typename?: "ProviderTimeSeriesPoint";
  date: Scalars["String"]["output"];
  registrations: Scalars["Int"]["output"];
  revenue: Scalars["Float"]["output"];
};

export type ProviderTopEvent = {
  __typename?: "ProviderTopEvent";
  conversionRate: Scalars["Float"]["output"];
  eventId: Scalars["String"]["output"];
  registrations: Scalars["Int"]["output"];
  revenue: Scalars["Float"]["output"];
  title: Scalars["String"]["output"];
  views: Scalars["Int"]["output"];
};

export type PublishAssociationLearningContentInput = {
  audienceKind: AssociationAudienceKind;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  learningContentId: Scalars["ID"]["input"];
};

export type Query = {
  __typename?: "Query";
  adminAuditLogs: PaginatedAdminAuditLogs;
  adminDashboardOverview: AdminDashboardOverview;
  adminOrgAccessRequestDetail: AdminOrgAccessRequest;
  adminOrgAccessRequests: PaginatedAdminOrgAccessRequests;
  adminOrganizationDetail: AdminOrgDetail;
  adminOrganizationMembers: PaginatedAdminOrgMembers;
  adminOrganizations: PaginatedAdminOrg;
  adminProfile: AdminProfile;
  adminUserGrowth: Array<AdminChartPoint>;
  adminUsers: PaginatedAdminUser;
  associationActivationStatus: AssociationActivationStatus;
  associationCatalogSearch: Array<AssociationCatalogItem>;
  associationCategoryCompletionReport: Array<AssociationCategoryProgressRow>;
  associationComplianceByGroup: Array<AssociationGroupCompliance>;
  associationComplianceTrend: Array<AssociationComplianceTrendPoint>;
  associationGeneratedReport: AssociationGeneratedReport;
  associationGeneratedReports: PaginatedAssociationGeneratedReports;
  associationGroupProgressReport: Array<AssociationGroupProgressRow>;
  associationGroups: Array<AssociationGroup>;
  associationLearningContent: AssociationLearningContent;
  associationLearningContents: PaginatedAssociationLearningContents;
  associationMemberActivities: PaginatedAssociationMemberActivities;
  associationMemberCompliance: AssociationMemberCompliance;
  associationMemberComplianceList: Array<AssociationComplianceSummary>;
  associationMemberDistribution: AssociationMemberDistribution;
  associationMemberProfile: AssociationMemberProfile;
  associationMemberProgressReport: PaginatedAssociationMemberProgress;
  associationMemberRequirementOptions: Array<AssociationMemberRequirementOption>;
  associationMemberStats: AssociationMemberStats;
  associationMembers: PaginatedAssociationMembers;
  associationMissingEvidenceReport: PaginatedAssociationMissingEvidence;
  associationPendingReviews: Array<AssociationPendingReview>;
  associationProfile: Association;
  associationProgressByCategory: Array<AssociationCategoryProgressRow>;
  associationRenewalReadinessReport: PaginatedAssociationRenewalReadiness;
  associationReportSummary: AssociationReportSummary;
  associationRequirement: AssociationRequirement;
  associationRequirementStats: AssociationRequirementStats;
  associationRequirements: PaginatedAssociationRequirements;
  certificationSearch: Array<Certification>;
  contentReviews: Array<ContentReview>;
  courseById: Course;
  courseBySlug: Course;
  courses: PaginatedCourses;
  cpdPlan: CpdPlan;
  cpdPlanProgress: CpdPlanProgress;
  cpdReportRecipients: Array<CpdReportRecipientOption>;
  currentUser: AuthPayload;
  eventById: Event;
  eventBySlug: Event;
  events: PaginatedEvents;
  featuredCourses: Array<Course>;
  featuredEvents: Array<Event>;
  featuredPodcasts: Array<Podcast>;
  featuredYouTubeChannels: Array<YouTubeChannel>;
  googleOAuthUrl: AuthUrl;
  linkedinOAuthUrl: AuthUrl;
  me: User;
  myCalendarEntries: Array<ProfessionalManualCalendarEvent>;
  myCart?: Maybe<Cart>;
  myCpdPlans: Array<CpdPlan>;
  myEnrollments: Array<ContentEnrollment>;
  myExternalLearningActivities: PaginatedExternalLearning;
  myProviderCourses: PaginatedCourses;
  myProviderEvents: PaginatedEvents;
  myProviderPodcasts: PaginatedPodcasts;
  myProviderYouTubeChannels: PaginatedYouTubeChannels;
  myRegisteredEvents: Array<EventRegistration>;
  myReviewForContent?: Maybe<ContentReview>;
  myWishlist: PaginatedWishlist;
  organizationAccessRequestById: OrganizationAccessRequest;
  organizationAccessRequests: PaginatedOrganizationAccessRequests;
  organizationActivationStatus: OrganizationActivationStatus;
  organizationAssignmentStats: OrganizationAssignmentStats;
  organizationAssignments: PaginatedOrganizationAssignments;
  organizationCpdCategories: PaginatedOrganizationCpdCategories;
  organizationCpdCategoryStats: OrganizationCpdCategoryStats;
  organizationDepartments: Array<OrganizationDepartment>;
  organizationEventCatalog: PaginatedOrganizationEventCatalog;
  organizationMemberDetail: OrganizationMemberDetail;
  organizationMembers: PaginatedOrganizationMembers;
  organizationMembersStats: OrganizationMembersStats;
  organizationOverview: OrganizationOverview;
  organizationReportTopMembers: PaginatedOrganizationReportTopMembers;
  organizationReports: OrganizationReport;
  organizationSettings: OrganizationSettings;
  podcastById: Podcast;
  podcastBySlug: Podcast;
  podcastEpisodes: Array<PodcastEpisode>;
  podcasts: PaginatedPodcasts;
  popularCategories: Array<PopularCategory>;
  professionalActiveSessions: Array<ProfessionalSession>;
  professionalCalendarEvents: PaginatedProfessionalCalendarEvents;
  professionalCertificate: ProfessionalCertificate;
  professionalCertificateIssuers: Array<Scalars["String"]["output"]>;
  professionalCertificateOptions: Array<ProfessionalCertificateOption>;
  professionalCertificateSummary: ProfessionalCertificateSummary;
  professionalCertificates: PaginatedProfessionalCertificates;
  professionalContentCompletion?: Maybe<ProfessionalPduActivity>;
  professionalCpdPlans: Array<ProfessionalCpdPlan>;
  professionalDashboardProfile: ProfessionalDashboardProfile;
  professionalExploreRoadmaps: PaginatedProfessionalExploreRoadmaps;
  professionalMyCourses: PaginatedProfessionalCourses;
  professionalMyRoadmaps: PaginatedProfessionalRoadmaps;
  professionalOverview: ProfessionalOverview;
  professionalPayments: PaginatedProfessionalPayments;
  professionalPduActivities: PaginatedProfessionalPduActivities;
  professionalPduActivity: ProfessionalPduActivity;
  professionalPduActivitySummary: ProfessionalPduActivitySummary;
  professionalPduReport: ProfessionalPduReport;
  professionalProfileTaxonomy: Array<ProfessionalTaxonomyGroup>;
  professionalRoadmapDraft?: Maybe<ProfessionalRoadmapDraft>;
  professionalRoadmapRecommendations: Array<RoadmapRecommendation>;
  professionalSettings: ProfessionalSettings;
  providerAnalytics: ProviderAnalytics;
  providerAnalyticsCsv: CsvExport;
  providerAttendees: PaginatedProviderAttendees;
  providerEventsTable: PaginatedProviderEvents;
  providerOverview: ProviderOverview;
  providerPromotionRequests: PaginatedPromotionRequests;
  providerSettings: ProviderSettings;
  upcomingEvents: Array<Event>;
  userById: User;
  users: PaginatedUsers;
  youtubeChannelById: YouTubeChannel;
  youtubeChannelBySlug: YouTubeChannel;
  youtubeChannels: PaginatedYouTubeChannels;
  youtubeVideos: Array<YouTubeVideo>;
};

export type QueryAdminAuditLogsArgs = {
  filter?: InputMaybe<AdminAuditLogFilter>;
  pagination?: InputMaybe<AdminPagination>;
};

export type QueryAdminOrgAccessRequestDetailArgs = {
  requestId: Scalars["String"]["input"];
};

export type QueryAdminOrgAccessRequestsArgs = {
  filter?: InputMaybe<AdminOrgAccessRequestFilter>;
  pagination?: InputMaybe<AdminPagination>;
};

export type QueryAdminOrganizationDetailArgs = {
  organizationId: Scalars["String"]["input"];
};

export type QueryAdminOrganizationMembersArgs = {
  filter: AdminOrgMemberFilter;
  pagination?: InputMaybe<AdminPagination>;
};

export type QueryAdminOrganizationsArgs = {
  filter?: InputMaybe<AdminOrgFilter>;
  pagination?: InputMaybe<AdminPagination>;
};

export type QueryAdminUserGrowthArgs = {
  mode?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryAdminUsersArgs = {
  filter?: InputMaybe<AdminUserFilter>;
  pagination?: InputMaybe<AdminPagination>;
};

export type QueryAssociationActivationStatusArgs = {
  token: Scalars["String"]["input"];
};

export type QueryAssociationCatalogSearchArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  input: AssociationCatalogSearchInput;
};

export type QueryAssociationCategoryCompletionReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationComplianceByGroupArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationComplianceTrendArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationGeneratedReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  exportId: Scalars["ID"]["input"];
};

export type QueryAssociationGeneratedReportsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  pagination?: InputMaybe<AssociationReportPaginationInput>;
};

export type QueryAssociationGroupProgressReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationGroupsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryAssociationLearningContentArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  learningContentId: Scalars["ID"]["input"];
};

export type QueryAssociationLearningContentsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationLearningContentFilterInput>;
  pagination?: InputMaybe<AssociationPaginationInput>;
};

export type QueryAssociationMemberActivitiesArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationMemberActivityFilterInput>;
  memberId: Scalars["ID"]["input"];
  pagination?: InputMaybe<AssociationPaginationInput>;
};

export type QueryAssociationMemberComplianceArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  memberId: Scalars["ID"]["input"];
};

export type QueryAssociationMemberComplianceListArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationComplianceFilterInput>;
};

export type QueryAssociationMemberDistributionArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationMemberProfileArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  memberId: Scalars["ID"]["input"];
};

export type QueryAssociationMemberProgressReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
  pagination?: InputMaybe<AssociationReportPaginationInput>;
};

export type QueryAssociationMemberRequirementOptionsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  memberId: Scalars["ID"]["input"];
};

export type QueryAssociationMemberStatsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryAssociationMembersArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationMemberFilterInput>;
  pagination?: InputMaybe<AssociationPaginationInput>;
};

export type QueryAssociationMissingEvidenceReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
  pagination?: InputMaybe<AssociationReportPaginationInput>;
};

export type QueryAssociationPendingReviewsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationComplianceFilterInput>;
};

export type QueryAssociationProfileArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryAssociationProgressByCategoryArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationRenewalReadinessReportArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
  pagination?: InputMaybe<AssociationReportPaginationInput>;
};

export type QueryAssociationReportSummaryArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationReportFilterInput>;
};

export type QueryAssociationRequirementArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  requirementId: Scalars["ID"]["input"];
};

export type QueryAssociationRequirementStatsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type QueryAssociationRequirementsArgs = {
  associationId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<AssociationRequirementFilterInput>;
  pagination?: InputMaybe<AssociationPaginationInput>;
};

export type QueryCertificationSearchArgs = {
  input: CertificationSearchInput;
};

export type QueryContentReviewsArgs = {
  contentId: Scalars["String"]["input"];
  contentType: ContentType;
};

export type QueryCourseByIdArgs = {
  courseId: Scalars["String"]["input"];
};

export type QueryCourseBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryCoursesArgs = {
  filter?: InputMaybe<CourseFilterInput>;
  pagination?: InputMaybe<CoursePaginationInput>;
  sort?: InputMaybe<CourseSortInput>;
};

export type QueryCpdPlanArgs = {
  planId: Scalars["ID"]["input"];
};

export type QueryCpdPlanProgressArgs = {
  planId: Scalars["ID"]["input"];
};

export type QueryEventByIdArgs = {
  eventId: Scalars["String"]["input"];
};

export type QueryEventBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryEventsArgs = {
  filter?: InputMaybe<EventFilterInput>;
  pagination?: InputMaybe<EventPaginationInput>;
  sort?: InputMaybe<EventSortInput>;
};

export type QueryFeaturedCoursesArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFeaturedEventsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFeaturedPodcastsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryFeaturedYouTubeChannelsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryGoogleOAuthUrlArgs = {
  role: Role;
};

export type QueryLinkedinOAuthUrlArgs = {
  role: Role;
};

export type QueryMyExternalLearningActivitiesArgs = {
  filter?: InputMaybe<ExternalLearningFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryMyProviderCoursesArgs = {
  filter?: InputMaybe<CourseFilterInput>;
  pagination?: InputMaybe<CoursePaginationInput>;
  sort?: InputMaybe<CourseSortInput>;
};

export type QueryMyProviderEventsArgs = {
  filter?: InputMaybe<EventFilterInput>;
  pagination?: InputMaybe<EventPaginationInput>;
  sort?: InputMaybe<EventSortInput>;
};

export type QueryMyProviderPodcastsArgs = {
  filter?: InputMaybe<PodcastFilterInput>;
  pagination?: InputMaybe<PodcastPaginationInput>;
  sort?: InputMaybe<PodcastSortInput>;
};

export type QueryMyProviderYouTubeChannelsArgs = {
  filter?: InputMaybe<YouTubeChannelFilterInput>;
  pagination?: InputMaybe<YouTubeChannelPaginationInput>;
  sort?: InputMaybe<YouTubeChannelSortInput>;
};

export type QueryMyReviewForContentArgs = {
  contentId: Scalars["String"]["input"];
  contentType: ContentType;
};

export type QueryMyWishlistArgs = {
  input?: InputMaybe<MyWishlistInput>;
};

export type QueryOrganizationAccessRequestByIdArgs = {
  requestId: Scalars["String"]["input"];
};

export type QueryOrganizationAccessRequestsArgs = {
  filter?: InputMaybe<OrganizationAccessRequestFilterInput>;
  pagination?: InputMaybe<OrganizationAccessRequestPaginationInput>;
};

export type QueryOrganizationActivationStatusArgs = {
  token: Scalars["String"]["input"];
};

export type QueryOrganizationAssignmentsArgs = {
  filter?: InputMaybe<OrganizationAssignmentFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryOrganizationCpdCategoriesArgs = {
  filter?: InputMaybe<OrganizationCpdCategoryFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryOrganizationCpdCategoryStatsArgs = {
  year?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryOrganizationEventCatalogArgs = {
  filter?: InputMaybe<EventCatalogFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryOrganizationMemberDetailArgs = {
  memberId: Scalars["String"]["input"];
};

export type QueryOrganizationMembersArgs = {
  filter?: InputMaybe<OrganizationMemberFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryOrganizationReportTopMembersArgs = {
  filter?: InputMaybe<OrganizationReportTopMembersFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};

export type QueryOrganizationReportsArgs = {
  filter?: InputMaybe<OrganizationReportFilterInput>;
};

export type QueryPodcastByIdArgs = {
  podcastId: Scalars["String"]["input"];
};

export type QueryPodcastBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryPodcastEpisodesArgs = {
  podcastId: Scalars["String"]["input"];
};

export type QueryPodcastsArgs = {
  filter?: InputMaybe<PodcastFilterInput>;
  pagination?: InputMaybe<PodcastPaginationInput>;
  sort?: InputMaybe<PodcastSortInput>;
};

export type QueryPopularCategoriesArgs = {
  input?: InputMaybe<PopularCategoriesInput>;
};

export type QueryProfessionalCalendarEventsArgs = {
  filter?: InputMaybe<ProfessionalCalendarEventsFilterInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalCertificateArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryProfessionalCertificatesArgs = {
  cpdPlanId?: InputMaybe<Scalars["ID"]["input"]>;
  filter?: InputMaybe<ProfessionalSearchInput>;
  issuer?: InputMaybe<Scalars["String"]["input"]>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
  sort?: InputMaybe<CertificateSort>;
  status?: InputMaybe<CertificateStatusFilter>;
  unlinkedOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryProfessionalContentCompletionArgs = {
  contentId: Scalars["ID"]["input"];
  contentType: ContentType;
};

export type QueryProfessionalExploreRoadmapsArgs = {
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalMyCoursesArgs = {
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalMyRoadmapsArgs = {
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalPaymentsArgs = {
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalPduActivitiesArgs = {
  filter?: InputMaybe<ProfessionalPduActivityFilterInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalPduActivityArgs = {
  activityId: Scalars["ID"]["input"];
};

export type QueryProfessionalPduReportArgs = {
  year?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryProfessionalProfileTaxonomyArgs = {
  kind?: InputMaybe<ProfileTaxonomyKind>;
};

export type QueryProfessionalRoadmapDraftArgs = {
  draftId?: InputMaybe<Scalars["ID"]["input"]>;
  transcript?: InputMaybe<ProfessionalPaginationInput>;
};

export type QueryProfessionalRoadmapRecommendationsArgs = {
  enrollmentId: Scalars["ID"]["input"];
};

export type QueryProviderAnalyticsArgs = {
  input?: InputMaybe<ProviderDashboardRangeInput>;
};

export type QueryProviderAnalyticsCsvArgs = {
  input?: InputMaybe<ProviderDashboardRangeInput>;
};

export type QueryProviderAttendeesArgs = {
  filter?: InputMaybe<ProviderAttendeesFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
};

export type QueryProviderEventsTableArgs = {
  filter?: InputMaybe<ProviderEventsFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
};

export type QueryProviderOverviewArgs = {
  input?: InputMaybe<ProviderDashboardRangeInput>;
};

export type QueryProviderPromotionRequestsArgs = {
  filter?: InputMaybe<ProviderPromotionFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
};

export type QueryUpcomingEventsArgs = {
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryUserByIdArgs = {
  userId: Scalars["String"]["input"];
};

export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilterInput>;
  pagination?: InputMaybe<UserPaginationInput>;
};

export type QueryYoutubeChannelByIdArgs = {
  channelId: Scalars["String"]["input"];
};

export type QueryYoutubeChannelBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryYoutubeChannelsArgs = {
  filter?: InputMaybe<YouTubeChannelFilterInput>;
  pagination?: InputMaybe<YouTubeChannelPaginationInput>;
  sort?: InputMaybe<YouTubeChannelSortInput>;
};

export type QueryYoutubeVideosArgs = {
  channelId: Scalars["String"]["input"];
};

export type RegisterInput = {
  confirmPassword: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  role: AuthRegisterRole;
};

export type RejectAdminOrgAccessRequestInput = {
  reason: Scalars["String"]["input"];
  requestId: Scalars["String"]["input"];
};

export type RequestAssociationReportExportInput = {
  filter?: InputMaybe<AssociationReportFilterInput>;
  format: AssociationReportFormat;
  locale?: InputMaybe<Scalars["String"]["input"]>;
  reportType: AssociationReportType;
};

export type RequestEmailChangeInput = {
  newEmail: Scalars["String"]["input"];
};

export type ResendAssociationActivationInput = {
  associationId: Scalars["ID"]["input"];
};

export type ResendAssociationMemberInvitationInput = {
  memberId: Scalars["ID"]["input"];
};

export type ResendEmailOtpInput = {
  email: Scalars["String"]["input"];
};

export type ResendOrganizationActivationInput = {
  email: Scalars["String"]["input"];
};

export type ResetPasswordInput = {
  code: Scalars["String"]["input"];
  confirmPassword: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  newPassword: Scalars["String"]["input"];
};

export type ReviewAssociationLearningActivityInput = {
  activityId: Scalars["ID"]["input"];
  approve: Scalars["Boolean"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type RoadmapChatMessage = {
  __typename?: "RoadmapChatMessage";
  content: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  role: RoadmapChatRole;
  stepKey: RoadmapDraftStep;
  widget?: Maybe<RoadmapWidget>;
};

export enum RoadmapChatRole {
  Assistant = "ASSISTANT",
  Professional = "PROFESSIONAL",
  System = "SYSTEM",
}

export type RoadmapChatTurnInput = {
  draftId: Scalars["ID"]["input"];
  message: Scalars["String"]["input"];
};

export enum RoadmapDraftFieldKey {
  BudgetPreference = "BUDGET_PREFERENCE",
  CertificationName = "CERTIFICATION_NAME",
  Context = "CONTEXT",
  CpdEnabled = "CPD_ENABLED",
  Goal = "GOAL",
  GoalReason = "GOAL_REASON",
  PreferredContentTypes = "PREFERRED_CONTENT_TYPES",
  PreferredFormats = "PREFERRED_FORMATS",
  SkillLevel = "SKILL_LEVEL",
  Subjects = "SUBJECTS",
  TargetDate = "TARGET_DATE",
  TargetRole = "TARGET_ROLE",
  TimeCommitment = "TIME_COMMITMENT",
}

export enum RoadmapDraftStatus {
  Collecting = "COLLECTING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Generating = "GENERATING",
  Ready = "READY",
}

export enum RoadmapDraftStep {
  Certification = "CERTIFICATION",
  Context = "CONTEXT",
  CpdRequirements = "CPD_REQUIREMENTS",
  CpdTracking = "CPD_TRACKING",
  Goal = "GOAL",
  GoalReason = "GOAL_REASON",
  Preferences = "PREFERENCES",
  Review = "REVIEW",
  TargetDate = "TARGET_DATE",
}

export enum RoadmapEnrollmentStatus {
  Active = "ACTIVE",
  Completed = "COMPLETED",
  Unenrolled = "UNENROLLED",
}

export type RoadmapRecommendation = {
  __typename?: "RoadmapRecommendation";
  contentId: Scalars["ID"]["output"];
  contentType: ContentType;
  credits?: Maybe<Scalars["Float"]["output"]>;
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  isFree: Scalars["Boolean"]["output"];
  summary?: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
};

export enum RoadmapSource {
  Catalog = "CATALOG",
  Generated = "GENERATED",
}

export enum RoadmapStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type RoadmapStepProgress = {
  __typename?: "RoadmapStepProgress";
  completedAt?: Maybe<Scalars["DateTime"]["output"]>;
  completedSteps: Scalars["Int"]["output"];
  enrollmentId: Scalars["ID"]["output"];
  phaseCompleted: Scalars["Boolean"]["output"];
  phaseId?: Maybe<Scalars["ID"]["output"]>;
  phaseProgress: Scalars["Int"]["output"];
  progress: Scalars["Int"]["output"];
  status: RoadmapStepProgressStatus;
  stepId: Scalars["ID"]["output"];
  totalSteps: Scalars["Int"]["output"];
};

export enum RoadmapStepProgressStatus {
  Completed = "COMPLETED",
  InProgress = "IN_PROGRESS",
}

export type RoadmapSubjectOption = {
  __typename?: "RoadmapSubjectOption";
  id: Scalars["ID"]["output"];
  label: Scalars["String"]["output"];
};

export type RoadmapWidget = {
  __typename?: "RoadmapWidget";
  field: RoadmapDraftFieldKey;
  maxSelections?: Maybe<Scalars["Int"]["output"]>;
  options: Array<RoadmapWidgetOption>;
  type: RoadmapWidgetKind;
};

export enum RoadmapWidgetKind {
  Date = "DATE",
  MultiSelect = "MULTI_SELECT",
  SingleSelect = "SINGLE_SELECT",
  Text = "TEXT",
  YesNo = "YES_NO",
}

export type RoadmapWidgetOption = {
  __typename?: "RoadmapWidgetOption";
  label: Scalars["String"]["output"];
  value: Scalars["String"]["output"];
};

export enum Role {
  Admin = "ADMIN",
  Association = "ASSOCIATION",
  Organization = "ORGANIZATION",
  Professional = "PROFESSIONAL",
  Provider = "PROVIDER",
}

export enum SessionStatus {
  Active = "ACTIVE",
  Expired = "EXPIRED",
  Revoked = "REVOKED",
}

export type SetAssociationGroupActiveInput = {
  groupId: Scalars["ID"]["input"];
  isActive: Scalars["Boolean"]["input"];
};

export type SetAssociationMemberRequirementsInput = {
  memberId: Scalars["ID"]["input"];
  requirementIds: Array<Scalars["ID"]["input"]>;
};

export type SetAssociationMemberStatusInput = {
  memberId: Scalars["ID"]["input"];
  status: AssociationMemberStatus;
};

export type SetCertificateCpdPlanInput = {
  certificateId: Scalars["ID"]["input"];
  cpdPlanId?: InputMaybe<Scalars["ID"]["input"]>;
};

export enum SkillLevel {
  Advanced = "ADVANCED",
  Beginner = "BEGINNER",
  Expert = "EXPERT",
  Intermediate = "INTERMEDIATE",
}

export enum SortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export type SubmitContactInquiryInput = {
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  idempotencyKey?: InputMaybe<Scalars["String"]["input"]>;
  inquiryType: ContactInquiryType;
  message: Scalars["String"]["input"];
  organization?: InputMaybe<Scalars["String"]["input"]>;
};

export type SubmitContactInquiryPayload = {
  __typename?: "SubmitContactInquiryPayload";
  code: Scalars["String"]["output"];
  referenceId?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
};

export type SubmitContentReviewInput = {
  comment?: InputMaybe<Scalars["String"]["input"]>;
  contentId: Scalars["String"]["input"];
  contentType: ContentType;
  rating: Scalars["Int"]["input"];
};

export type SubmitOrganizationAccessRequestInput = {
  country: Scalars["String"]["input"];
  expectedLicensedProfessionals: Scalars["Int"]["input"];
  goals: Scalars["String"]["input"];
  organizationName: Scalars["String"]["input"];
  organizationType: OrganizationType;
  representativeFullName: Scalars["String"]["input"];
  representativeJobRole: Scalars["String"]["input"];
  workEmail: Scalars["String"]["input"];
};

export type SubmitPromotionRequestInput = {
  budget?: InputMaybe<Scalars["Float"]["input"]>;
  eventId: Scalars["String"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  promotionType: PromotionType;
};

export enum Theme {
  Dark = "DARK",
  Light = "LIGHT",
  System = "SYSTEM",
}

export type UpdateAdminOrgMember = {
  completedLearning?: InputMaybe<Scalars["Int"]["input"]>;
  compliance?: InputMaybe<Scalars["Float"]["input"]>;
  departmentId?: InputMaybe<Scalars["ID"]["input"]>;
  jobRole?: InputMaybe<Scalars["String"]["input"]>;
  memberId: Scalars["ID"]["input"];
  pdus?: InputMaybe<Scalars["Float"]["input"]>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type UpdateAdminOrgSettings = {
  assignmentNotifications?: InputMaybe<Scalars["Boolean"]["input"]>;
  complianceAlerts?: InputMaybe<Scalars["Boolean"]["input"]>;
  complianceCycle?: InputMaybe<ComplianceCycle>;
  minimumPdu?: InputMaybe<Scalars["Float"]["input"]>;
  organizationId: Scalars["String"]["input"];
  strictCompliance?: InputMaybe<Scalars["Boolean"]["input"]>;
  weeklySummaryReport?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateAdminProfile = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  bio?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAdminUserStatus = {
  status: UserStatus;
  userId: Scalars["String"]["input"];
};

export type UpdateAssociationGroupInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  groupId: Scalars["ID"]["input"];
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAssociationLearningContentInput = {
  category: PduCategory;
  contentId?: InputMaybe<Scalars["ID"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  externalProvider?: InputMaybe<Scalars["String"]["input"]>;
  externalTitle?: InputMaybe<Scalars["String"]["input"]>;
  externalUrl?: InputMaybe<Scalars["String"]["input"]>;
  indicativeCredits?: InputMaybe<Scalars["Float"]["input"]>;
  learningContentId: Scalars["ID"]["input"];
  requirementId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UpdateAssociationMemberInput = {
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  memberId: Scalars["ID"]["input"];
  memberNumber?: InputMaybe<Scalars["String"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAssociationProfileInput = {
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  logoUrl?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  website?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAssociationRequirementAudienceInput = {
  audienceKind: AssociationAudienceKind;
  groupId?: InputMaybe<Scalars["ID"]["input"]>;
  memberIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  requirementId: Scalars["ID"]["input"];
};

export type UpdateAssociationRequirementCategoriesInput = {
  categories: Array<AssociationRequirementCategoryInput>;
  requirementId: Scalars["ID"]["input"];
};

export type UpdateAssociationRequirementDetailsInput = {
  creditType?: InputMaybe<CreditType>;
  cycleLengthYears?: InputMaybe<Scalars["Int"]["input"]>;
  deadline?: InputMaybe<Scalars["DateTime"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  reminderTiming?: InputMaybe<CpdReminderTiming>;
  remindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  reportingCycle?: InputMaybe<AssociationReportingCycle>;
  requirementId: Scalars["ID"]["input"];
  totalRequiredCredits?: InputMaybe<Scalars["Float"]["input"]>;
};

export type UpdateAssociationRequirementEvidenceRulesInput = {
  evidencePolicy: AssociationEvidencePolicy;
  requirementId: Scalars["ID"]["input"];
};

export type UpdateAssociationRequirementReportingRulesInput = {
  allowLateSubmission?: InputMaybe<Scalars["Boolean"]["input"]>;
  gracePeriodDays?: InputMaybe<Scalars["Int"]["input"]>;
  reportingEnd?: InputMaybe<Scalars["DateTime"]["input"]>;
  reportingStart?: InputMaybe<Scalars["DateTime"]["input"]>;
  requirementId: Scalars["ID"]["input"];
  submissionClosesAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  submissionOpensAt?: InputMaybe<Scalars["DateTime"]["input"]>;
};

export type UpdateCertificateInput = {
  certificateNumber?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  issueDate: Scalars["String"]["input"];
  issuer: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  validUntil: Scalars["String"]["input"];
};

export type UpdateCourseInput = {
  category?: InputMaybe<CourseCategory>;
  courseId: Scalars["ID"]["input"];
  currency?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  instructor?: InputMaybe<Scalars["String"]["input"]>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  learnings?: InputMaybe<Array<Scalars["String"]["input"]>>;
  level?: InputMaybe<CourseLevel>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  requirements?: InputMaybe<Array<Scalars["String"]["input"]>>;
  status?: InputMaybe<CourseStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateCpdPlanInput = {
  allowDuplicate?: InputMaybe<Scalars["Boolean"]["input"]>;
  categories?: InputMaybe<Array<CpdPlanCategoryInput>>;
  certificationId?: InputMaybe<Scalars["ID"]["input"]>;
  certificationName: Scalars["String"]["input"];
  creditType: CreditType;
  evidenceOtherNote?: InputMaybe<Scalars["String"]["input"]>;
  evidenceTypes: Array<CpdEvidenceType>;
  id: Scalars["ID"]["input"];
  initialCompletedCredits?: InputMaybe<Scalars["Float"]["input"]>;
  organization: Scalars["String"]["input"];
  preferredFormats?: InputMaybe<Array<LearningFormat>>;
  reminderTiming?: InputMaybe<CpdReminderTiming>;
  remindersEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  reportRecipientLabel?: InputMaybe<Scalars["String"]["input"]>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars["String"]["input"];
  reportingStart: Scalars["String"]["input"];
  timeAvailable?: InputMaybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars["Float"]["input"];
};

export type UpdateEnrollmentProgressInput = {
  contentId: Scalars["String"]["input"];
  contentType: ContentType;
  progress: Scalars["Int"]["input"];
};

export type UpdateEventInput = {
  capacity?: InputMaybe<Scalars["Int"]["input"]>;
  category?: InputMaybe<EventCategory>;
  currency?: InputMaybe<Scalars["String"]["input"]>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  earlyBirdDiscount?: InputMaybe<Scalars["Float"]["input"]>;
  endDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  eventId: Scalars["ID"]["input"];
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFree?: InputMaybe<Scalars["Boolean"]["input"]>;
  language?: InputMaybe<AppLanguage>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  onlineUrl?: InputMaybe<Scalars["String"]["input"]>;
  organizer?: InputMaybe<Scalars["String"]["input"]>;
  pdu?: InputMaybe<Scalars["Float"]["input"]>;
  pduCategory?: InputMaybe<PduCategory>;
  price?: InputMaybe<Scalars["Float"]["input"]>;
  promotionVideoUrl?: InputMaybe<Scalars["String"]["input"]>;
  registrationEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  speaker?: InputMaybe<Scalars["String"]["input"]>;
  specificTopic?: InputMaybe<Scalars["String"]["input"]>;
  startDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<EventStatus>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<EventType>;
};

export type UpdateMeInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  bio?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOrganizationAssignmentInput = {
  assignmentId: Scalars["String"]["input"];
  courseId?: InputMaybe<Scalars["String"]["input"]>;
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["String"]["input"]>;
  eventId?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AssignmentStatus>;
  targetKind?: InputMaybe<AssignmentTargetKind>;
  targetMemberId?: InputMaybe<Scalars["String"]["input"]>;
  targetRole?: InputMaybe<Role>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<AssignmentType>;
};

export type UpdateOrganizationCpdCategoryInput = {
  category?: InputMaybe<PduCategory>;
  categoryId: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  requiredHours?: InputMaybe<Scalars["Float"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOrganizationDepartmentInput = {
  departmentId: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateOrganizationMemberInput = {
  departmentId?: InputMaybe<Scalars["String"]["input"]>;
  jobRole?: InputMaybe<Scalars["String"]["input"]>;
  memberId: Scalars["String"]["input"];
  role?: InputMaybe<Role>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type UpdateOrganizationMemberNotesInput = {
  memberId: Scalars["String"]["input"];
  notes: Scalars["String"]["input"];
};

export type UpdateOrganizationSettingsInput = {
  assignmentNotifications?: InputMaybe<Scalars["Boolean"]["input"]>;
  complianceAlerts?: InputMaybe<Scalars["Boolean"]["input"]>;
  complianceCycle?: InputMaybe<ComplianceCycle>;
  minimumPdu?: InputMaybe<Scalars["Float"]["input"]>;
  strictCompliance?: InputMaybe<Scalars["Boolean"]["input"]>;
  weeklySummaryReport?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdatePduActivityInput = {
  activityId: Scalars["ID"]["input"];
  category?: InputMaybe<PduCategory>;
  completionStatus?: InputMaybe<PduCompletionStatus>;
  contentId?: InputMaybe<Scalars["String"]["input"]>;
  contentType?: InputMaybe<ContentType>;
  creditType?: InputMaybe<CreditType>;
  date?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  evidenceNote?: InputMaybe<Scalars["String"]["input"]>;
  evidenceUrl?: InputMaybe<Scalars["String"]["input"]>;
  issuingOrganization?: InputMaybe<Scalars["String"]["input"]>;
  learningOutcome?: InputMaybe<Scalars["String"]["input"]>;
  pdus?: InputMaybe<Scalars["Float"]["input"]>;
  providerOrganizer?: InputMaybe<Scalars["String"]["input"]>;
  relatedCertification?: InputMaybe<Scalars["String"]["input"]>;
  reportingYear?: InputMaybe<Scalars["Int"]["input"]>;
  source?: InputMaybe<PduSource>;
  status?: InputMaybe<PduStatus>;
  subCategory?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePodcastEpisodeInput = {
  audioUrl?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  episodeId: Scalars["ID"]["input"];
  episodeNumber?: InputMaybe<Scalars["Int"]["input"]>;
  podcastId?: InputMaybe<Scalars["ID"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePodcastInput = {
  category?: InputMaybe<PodcastCategory>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  host?: InputMaybe<Scalars["String"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  podcastId: Scalars["ID"]["input"];
  rating?: InputMaybe<Scalars["Float"]["input"]>;
  status?: InputMaybe<PodcastStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProfessionalBasicProfileInput = {
  countryCode?: InputMaybe<Scalars["String"]["input"]>;
  fullName: Scalars["String"]["input"];
  language?: InputMaybe<AppLanguage>;
  linkedInUrl?: InputMaybe<Scalars["String"]["input"]>;
  timeZone?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProfessionalCredentialInput = {
  annualCpdHours?: InputMaybe<Scalars["Float"]["input"]>;
  expiryDate?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  issueDate: Scalars["String"]["input"];
  issuingOrganization: Scalars["String"]["input"];
  licenceNumber?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  pduTargetId?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProfessionalDetailsInput = {
  currentRole?: InputMaybe<Scalars["String"]["input"]>;
  experienceRange?: InputMaybe<ExperienceRange>;
  industry?: InputMaybe<ProfessionalIndustry>;
  profession?: InputMaybe<Scalars["String"]["input"]>;
  professionalGoal?: InputMaybe<ProfessionalGoal>;
  professionalSummary?: InputMaybe<Scalars["String"]["input"]>;
  workLocation?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProfessionalPreferencesInput = {
  learningBudgetPreference?: InputMaybe<LearningBudgetPreference>;
  learningTimeCommitment?: InputMaybe<LearningTimeCommitment>;
  preferredLearningFormats: Array<LearningFormat>;
};

export type UpdateProfessionalSettingsInput = {
  courseUpdates?: InputMaybe<Scalars["Boolean"]["input"]>;
  emailNotifications?: InputMaybe<Scalars["Boolean"]["input"]>;
  eventReminders?: InputMaybe<Scalars["Boolean"]["input"]>;
  interfaceLanguage?: InputMaybe<AppLanguage>;
  loginAlerts?: InputMaybe<Scalars["Boolean"]["input"]>;
  messages?: InputMaybe<Scalars["Boolean"]["input"]>;
  profileVisibility?: InputMaybe<ProfileVisibility>;
  pushNotifications?: InputMaybe<Scalars["Boolean"]["input"]>;
  showCertificates?: InputMaybe<Scalars["Boolean"]["input"]>;
  showEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
  showLearningProgress?: InputMaybe<Scalars["Boolean"]["input"]>;
  theme?: InputMaybe<Theme>;
};

export type UpdateProfessionalSkillsInput = {
  currentSkillLevel?: InputMaybe<SkillLevel>;
  favoriteSubjectIds: Array<Scalars["ID"]["input"]>;
  mainSkillAreaIds: Array<Scalars["ID"]["input"]>;
  skillsToImproveIds: Array<Scalars["ID"]["input"]>;
  targetSkillLevel?: InputMaybe<SkillLevel>;
};

export type UpdateProviderSettingsInput = {
  aboutOrganization?: InputMaybe<Scalars["String"]["input"]>;
  contactEmail?: InputMaybe<Scalars["String"]["input"]>;
  eventReminderEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  newRegistrationAlertEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationName?: InputMaybe<Scalars["String"]["input"]>;
  organizationProfile?: InputMaybe<Scalars["String"]["input"]>;
  reminderHoursBeforeEvent?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpdateUserInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  bio?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Role>;
  status?: InputMaybe<UserStatus>;
  userId: Scalars["String"]["input"];
};

export type UpdateUserStatusInput = {
  status: UserStatus;
  userId: Scalars["String"]["input"];
};

export type UpdateYouTubeChannelInput = {
  category?: InputMaybe<YouTubeCategory>;
  channelId: Scalars["ID"]["input"];
  channelUrl?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<YouTubeChannelStatus>;
  subscribers?: InputMaybe<Scalars["Int"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateYouTubeVideoInput = {
  channelId?: InputMaybe<Scalars["ID"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  durationMinutes?: InputMaybe<Scalars["Int"]["input"]>;
  likes?: InputMaybe<Scalars["Int"]["input"]>;
  publishedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  status?: InputMaybe<YouTubeVideoStatus>;
  thumbnailUrl?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  videoId: Scalars["ID"]["input"];
  videoUrl?: InputMaybe<Scalars["String"]["input"]>;
  views?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UpsertPduTargetInput = {
  category: PduCategory;
  target: Scalars["Float"]["input"];
  year: Scalars["Int"]["input"];
};

export type User = {
  __typename?: "User";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  emailVerifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
  firstName?: Maybe<Scalars["String"]["output"]>;
  fullName?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lastLoginAt?: Maybe<Scalars["DateTime"]["output"]>;
  lastName?: Maybe<Scalars["String"]["output"]>;
  organizationProfile?: Maybe<OrganizationProfile>;
  phone?: Maybe<Scalars["String"]["output"]>;
  phoneVerifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
  professionalProfile?: Maybe<ProfessionalProfile>;
  providerProfile?: Maybe<ProviderProfile>;
  role: Role;
  status: UserStatus;
  updatedAt: Scalars["DateTime"]["output"];
};

export type UserFilterInput = {
  includeDeleted?: InputMaybe<Scalars["Boolean"]["input"]>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<UserStatus>;
};

export type UserPageInfo = {
  __typename?: "UserPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  limit: Scalars["Int"]["output"];
  page: Scalars["Int"]["output"];
  totalItems: Scalars["Int"]["output"];
  totalPages: Scalars["Int"]["output"];
};

export type UserPaginationInput = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum UserStatus {
  Active = "ACTIVE",
  Deleted = "DELETED",
  Disabled = "DISABLED",
  Pending = "PENDING",
}

export type VerifyEmailChangeInput = {
  code: Scalars["String"]["input"];
  newEmail: Scalars["String"]["input"];
};

export type VerifyEmailOtpInput = {
  code: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
};

export type WishlistContent = {
  __typename?: "WishlistContent";
  category?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isFree: Scalars["Boolean"]["output"];
  price?: Maybe<Scalars["Float"]["output"]>;
  providerName?: Maybe<Scalars["String"]["output"]>;
  rating?: Maybe<Scalars["Float"]["output"]>;
  slug?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type WishlistItem = {
  __typename?: "WishlistItem";
  content?: Maybe<WishlistContent>;
  contentId: Scalars["String"]["output"];
  contentType: ContentType;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["String"]["output"];
  userId: Scalars["String"]["output"];
};

export enum WishlistPriceFilter {
  Free = "FREE",
  Paid = "PAID",
}

export enum WishlistSortBy {
  Newest = "NEWEST",
  Oldest = "OLDEST",
  PriceAsc = "PRICE_ASC",
  PriceDesc = "PRICE_DESC",
  RatingDesc = "RATING_DESC",
  TitleAsc = "TITLE_ASC",
  TitleDesc = "TITLE_DESC",
}

export enum YouTubeCategory {
  Ai = "AI",
  Business = "BUSINESS",
  Career = "CAREER",
  Compliance = "COMPLIANCE",
  Cpd = "CPD",
  Data = "DATA",
  Design = "DESIGN",
  Education = "EDUCATION",
  Engineering = "ENGINEERING",
  Finance = "FINANCE",
  Healthcare = "HEALTHCARE",
  Leadership = "LEADERSHIP",
  Marketing = "MARKETING",
  Other = "OTHER",
  Technology = "TECHNOLOGY",
}

export type YouTubeChannel = {
  __typename?: "YouTubeChannel";
  category: YouTubeCategory;
  channelUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  isFeatured: Scalars["Boolean"]["output"];
  provider?: Maybe<Scalars["String"]["output"]>;
  providerId?: Maybe<Scalars["String"]["output"]>;
  rating: Scalars["Float"]["output"];
  ratingCount: Scalars["Int"]["output"];
  slug: Scalars["String"]["output"];
  status: YouTubeChannelStatus;
  subscribers: Scalars["Int"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  videoCount: Scalars["Int"]["output"];
  views: Scalars["Int"]["output"];
};

export type YouTubeChannelFilterInput = {
  category?: InputMaybe<YouTubeCategory>;
  isFeatured?: InputMaybe<Scalars["Boolean"]["input"]>;
  providerId?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<YouTubeChannelStatus>;
};

export type YouTubeChannelPageInfo = {
  __typename?: "YouTubeChannelPageInfo";
  hasNextPage: Scalars["Boolean"]["output"];
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type YouTubeChannelPaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  take?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum YouTubeChannelSortDirection {
  Asc = "ASC",
  Desc = "DESC",
}

export enum YouTubeChannelSortField {
  CreatedAt = "CREATED_AT",
  Subscribers = "SUBSCRIBERS",
  Title = "TITLE",
  UpdatedAt = "UPDATED_AT",
  VideoCount = "VIDEO_COUNT",
  Views = "VIEWS",
}

export type YouTubeChannelSortInput = {
  direction?: InputMaybe<YouTubeChannelSortDirection>;
  field?: InputMaybe<YouTubeChannelSortField>;
};

export enum YouTubeChannelStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type YouTubeVideo = {
  __typename?: "YouTubeVideo";
  channelId: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  durationMinutes?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  likes: Scalars["Int"]["output"];
  publishedAt?: Maybe<Scalars["DateTime"]["output"]>;
  status: YouTubeVideoStatus;
  thumbnailUrl?: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  videoUrl?: Maybe<Scalars["String"]["output"]>;
  views: Scalars["Int"]["output"];
};

export enum YouTubeVideoStatus {
  Archived = "ARCHIVED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
