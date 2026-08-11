import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export type ActivateOrganizationAccountInput = {
  confirmPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type AddOrganizationMemberInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  jobRole?: InputMaybe<Scalars['String']['input']>;
};

export type AdminAuditLog = {
  __typename?: 'AdminAuditLog';
  action: AuditAction;
  actorEmail?: Maybe<Scalars['String']['output']>;
  actorId?: Maybe<Scalars['ID']['output']>;
  actorName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AdminAuditLogFilter = {
  action?: InputMaybe<AuditAction>;
  entityId?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type AdminChartPoint = {
  __typename?: 'AdminChartPoint';
  date?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  professionals: Scalars['Int']['output'];
  providers: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AdminDashboardOverview = {
  __typename?: 'AdminDashboardOverview';
  approvedRequests: Scalars['Int']['output'];
  pendingRequests: Scalars['Int']['output'];
  rejectedRequests: Scalars['Int']['output'];
  requestTrend: Array<AdminRequestTrendPoint>;
  totalRequests: Scalars['Int']['output'];
};

export type AdminOrg = {
  __typename?: 'AdminOrg';
  activeMembers: Scalars['Int']['output'];
  averageCompliance: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownerEmail?: Maybe<Scalars['String']['output']>;
  ownerName?: Maybe<Scalars['String']['output']>;
  totalMembers: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminOrgAccessRequest = {
  __typename?: 'AdminOrgAccessRequest';
  approvedUserId?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expectedLicensedProfessionals: Scalars['Int']['output'];
  goals: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notificationFailureCode?: Maybe<Scalars['String']['output']>;
  notificationLastAttemptAt?: Maybe<Scalars['DateTime']['output']>;
  notificationSentAt?: Maybe<Scalars['DateTime']['output']>;
  notificationStatus: NotificationDeliveryStatus;
  organizationName: Scalars['String']['output'];
  organizationType: OrganizationType;
  rejectReason?: Maybe<Scalars['String']['output']>;
  representativeFullName: Scalars['String']['output'];
  representativeJobRole: Scalars['String']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedById?: Maybe<Scalars['ID']['output']>;
  reviewedByName?: Maybe<Scalars['String']['output']>;
  status: OrganizationAccessRequestStatus;
  updatedAt: Scalars['DateTime']['output'];
  workEmail: Scalars['String']['output'];
};

export type AdminOrgAccessRequestFilter = {
  search?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrganizationAccessRequestStatus>;
};

export type AdminOrgDetail = {
  __typename?: 'AdminOrgDetail';
  activeMembers: Scalars['Int']['output'];
  averageCompliance: Scalars['Float']['output'];
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  departments: Array<OrganizationDepartment>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inactiveMembers: Scalars['Int']['output'];
  industry?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  members: Array<AdminOrgMember>;
  name: Scalars['String']['output'];
  ownerEmail?: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['ID']['output'];
  ownerName?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<OrganizationSettings>;
  totalMembers: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type AdminOrgFilter = {
  country?: InputMaybe<Scalars['String']['input']>;
  industry?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminOrgMember = {
  __typename?: 'AdminOrgMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  completedLearning: Scalars['Int']['output'];
  compliance: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  departmentTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobRole?: Maybe<Scalars['String']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  organizationId: Scalars['ID']['output'];
  pdus: Scalars['Float']['output'];
  status: OrganizationMemberStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type AdminOrgMemberFilter = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  organizationId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type AdminPageInfo = {
  __typename?: 'AdminPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type AdminPagination = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminProfile = {
  __typename?: 'AdminProfile';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role: Role;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminRequestTrendPoint = {
  __typename?: 'AdminRequestTrendPoint';
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPremium: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  role: Role;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminUserFilter = {
  premiumOnly?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UserStatus>;
};

export enum AppLanguage {
  En = 'EN',
  Fr = 'FR'
}

/** Assignment status */
export enum AssignmentStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Completed = 'COMPLETED'
}

/** Target type of assignment */
export enum AssignmentTargetKind {
  All = 'ALL',
  Department = 'DEPARTMENT',
  Member = 'MEMBER',
  Role = 'ROLE'
}

/** Assignment type (HARD / SOFT) */
export enum AssignmentType {
  Hard = 'HARD',
  Soft = 'SOFT'
}

export enum AuditAction {
  AdminProfileUpdated = 'ADMIN_PROFILE_UPDATED',
  OrganizationAccountActivated = 'ORGANIZATION_ACCOUNT_ACTIVATED',
  OrganizationAccountCreated = 'ORGANIZATION_ACCOUNT_CREATED',
  OrganizationActivationResent = 'ORGANIZATION_ACTIVATION_RESENT',
  OrganizationMemberRemoved = 'ORGANIZATION_MEMBER_REMOVED',
  OrganizationMemberUpdated = 'ORGANIZATION_MEMBER_UPDATED',
  OrganizationNotificationFailed = 'ORGANIZATION_NOTIFICATION_FAILED',
  OrganizationSettingsUpdated = 'ORGANIZATION_SETTINGS_UPDATED',
  OrganizationViewed = 'ORGANIZATION_VIEWED',
  OrgAccessRequestApproved = 'ORG_ACCESS_REQUEST_APPROVED',
  OrgAccessRequestRejected = 'ORG_ACCESS_REQUEST_REJECTED',
  OrgAccessRequestSubmitted = 'ORG_ACCESS_REQUEST_SUBMITTED',
  UserExported = 'USER_EXPORTED',
  UserStatusUpdated = 'USER_STATUS_UPDATED'
}

export type AuthPayload = {
  __typename?: 'AuthPayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<AuthUser>;
};

export enum AuthRegisterRole {
  Professional = 'PROFESSIONAL',
  Provider = 'PROVIDER'
}

export type AuthUrl = {
  __typename?: 'AuthUrl';
  url: Scalars['String']['output'];
};

export type AuthUser = {
  __typename?: 'AuthUser';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  forcePasswordChange: Scalars['Boolean']['output'];
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role: Role;
  status: UserStatus;
};

export type BulkAddOrganizationMembersInput = {
  rows: Array<BulkOrganizationMemberRowInput>;
};

export type BulkAddOrganizationMembersResult = {
  __typename?: 'BulkAddOrganizationMembersResult';
  created: Scalars['Int']['output'];
  errors: Array<Scalars['String']['output']>;
  failed: Scalars['Int']['output'];
  totalRows: Scalars['Int']['output'];
  updated: Scalars['Int']['output'];
};

export type BulkOrganizationMemberRowInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  departmentTitle?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  jobRole?: InputMaybe<Scalars['String']['input']>;
};

export enum CpdEvidenceType {
  AttendanceProof = 'ATTENDANCE_PROOF',
  Certificate = 'CERTIFICATE',
  Other = 'OTHER',
  SelfDeclaration = 'SELF_DECLARATION'
}

export enum CpdPlanStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT'
}

export enum CpdReminderTiming {
  Days_7 = 'DAYS_7',
  Days_14 = 'DAYS_14',
  Days_30 = 'DAYS_30',
  Days_60 = 'DAYS_60'
}

export enum CpdReportRecipientType {
  Association = 'ASSOCIATION',
  Manager = 'MANAGER',
  Organization = 'ORGANIZATION',
  Other = 'OTHER',
  Self = 'SELF'
}

export enum CalendarEventType {
  Course = 'COURSE',
  Event = 'EVENT',
  Meeting = 'MEETING',
  Other = 'OTHER',
  Training = 'TRAINING',
  Webinar = 'WEBINAR'
}

export type Cart = {
  __typename?: 'Cart';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  items: Array<CartItem>;
  status: CartStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  cartId: Scalars['String']['output'];
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  priceSnapshot: Scalars['Float']['output'];
  status: CartItemStatus;
  titleSnapshot: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum CartItemStatus {
  Active = 'ACTIVE',
  Removed = 'REMOVED'
}

export enum CartStatus {
  Abandoned = 'ABANDONED',
  Active = 'ACTIVE',
  CheckedOut = 'CHECKED_OUT'
}

export enum CertificateSort {
  ExpirySoonest = 'EXPIRY_SOONEST',
  Name = 'NAME',
  Oldest = 'OLDEST',
  Recent = 'RECENT'
}

export enum CertificateStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  ExpiringSoon = 'EXPIRING_SOON',
  Revoked = 'REVOKED'
}

export enum CertificateStatusFilter {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  ExpiringSoon = 'EXPIRING_SOON'
}

export type Certification = {
  __typename?: 'Certification';
  abbreviation: Scalars['String']['output'];
  association?: Maybe<Scalars['String']['output']>;
  categories: Array<CertificationCategory>;
  creditType: CreditType;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  organization: Scalars['String']['output'];
  organizationAbbr?: Maybe<Scalars['String']['output']>;
  renewalCycleLabel: Scalars['String']['output'];
  renewalCycleMonths?: Maybe<Scalars['Int']['output']>;
  suggestedDeadline?: Maybe<Scalars['DateTime']['output']>;
  totalRequiredCredits: Scalars['Float']['output'];
};

export type CertificationCategory = {
  __typename?: 'CertificationCategory';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  requiredCredits: Scalars['Float']['output'];
};

export type CertificationSearchInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};

export type ChangePasswordInput = {
  confirmPassword: Scalars['String']['input'];
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CompleteProfessionalOnboardingInput = {
  certificationId?: InputMaybe<Scalars['ID']['input']>;
  certificationIssuer?: InputMaybe<Scalars['String']['input']>;
  certificationName?: InputMaybe<Scalars['String']['input']>;
  currentRole: Scalars['String']['input'];
  professionalGoal: ProfessionalGoal;
  skillsToImproveIds?: Array<Scalars['ID']['input']>;
  suggestSkills?: Scalars['Boolean']['input'];
};

/** Organization compliance cycle */
export enum ComplianceCycle {
  Annual = 'ANNUAL',
  Biannual = 'BIANNUAL',
  Quarterly = 'QUARTERLY'
}

export type ConfirmExternalLearningInput = {
  activityId: Scalars['String']['input'];
  certificateUrl?: InputMaybe<Scalars['String']['input']>;
  evidenceNote?: InputMaybe<Scalars['String']['input']>;
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
  pduHours?: InputMaybe<Scalars['Float']['input']>;
  status: ExternalLearningStatus;
};

export enum ContactInquiryType {
  AccessibilityFeedback = 'ACCESSIBILITY_FEEDBACK',
  AccountSupport = 'ACCOUNT_SUPPORT',
  AssociationPartnership = 'ASSOCIATION_PARTNERSHIP',
  ContentProviderInquiry = 'CONTENT_PROVIDER_INQUIRY',
  CpdPduTracking = 'CPD_PDU_TRACKING',
  GeneralQuestion = 'GENERAL_QUESTION',
  OrganizationSolution = 'ORGANIZATION_SOLUTION',
  Other = 'OTHER',
  PrivacyRequest = 'PRIVACY_REQUEST',
  SecurityConcern = 'SECURITY_CONCERN',
  TechnicalSupport = 'TECHNICAL_SUPPORT'
}

export type ContentActionInput = {
  contentId: Scalars['String']['input'];
  contentType: ContentType;
};

export type ContentActionPayload = {
  __typename?: 'ContentActionPayload';
  active?: Maybe<Scalars['Boolean']['output']>;
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ContentEnrollment = {
  __typename?: 'ContentEnrollment';
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  progress: Scalars['Int']['output'];
  startedAt: Scalars['DateTime']['output'];
  status: ContentEnrollmentStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export enum ContentEnrollmentStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Completed = 'COMPLETED'
}

export type ContentReview = {
  __typename?: 'ContentReview';
  comment?: Maybe<Scalars['String']['output']>;
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export enum ContentType {
  Course = 'COURSE',
  Event = 'EVENT',
  Podcast = 'PODCAST',
  Youtube = 'YOUTUBE'
}

export type Course = {
  __typename?: 'Course';
  category: CourseCategory;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  curriculumSections?: Maybe<Array<CurriculumSection>>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  instructor: Scalars['String']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isFree: Scalars['Boolean']['output'];
  lastUpdatedAt: Scalars['DateTime']['output'];
  learnings: Array<Scalars['String']['output']>;
  level: CourseLevel;
  price?: Maybe<Scalars['Float']['output']>;
  professionals: Scalars['Int']['output'];
  providerId?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  requirements: Array<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: CourseStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum CourseCategory {
  Business = 'BUSINESS',
  Compliance = 'COMPLIANCE',
  Cpd = 'CPD',
  Design = 'DESIGN',
  Education = 'EDUCATION',
  Engineering = 'ENGINEERING',
  Finance = 'FINANCE',
  Healthcare = 'HEALTHCARE',
  Leadership = 'LEADERSHIP',
  Marketing = 'MARKETING',
  Other = 'OTHER',
  Technology = 'TECHNOLOGY'
}

export type CourseFilterInput = {
  category?: InputMaybe<CourseCategory>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  level?: InputMaybe<CourseLevel>;
  minRating?: InputMaybe<Scalars['Float']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CourseStatus>;
};

export enum CourseLevel {
  Advanced = 'ADVANCED',
  AllLevels = 'ALL_LEVELS',
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE'
}

export type CoursePageInfo = {
  __typename?: 'CoursePageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type CoursePaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum CourseSortField {
  CreatedAt = 'CREATED_AT',
  Price = 'PRICE',
  Professionals = 'PROFESSIONALS',
  Rating = 'RATING',
  Title = 'TITLE',
  UpdatedAt = 'UPDATED_AT'
}

export type CourseSortInput = {
  direction?: InputMaybe<SortDirection>;
  field?: InputMaybe<CourseSortField>;
};

export enum CourseStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type CpdCategoryProgress = {
  __typename?: 'CpdCategoryProgress';
  completed: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isComplete: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  progress: Scalars['Float']['output'];
  remaining: Scalars['Float']['output'];
  target: Scalars['Float']['output'];
};

export type CpdMissingRequirement = {
  __typename?: 'CpdMissingRequirement';
  code: Scalars['String']['output'];
  detail?: Maybe<Scalars['String']['output']>;
};

export type CpdPlan = {
  __typename?: 'CpdPlan';
  categories: Array<CpdPlanCategory>;
  certificationId?: Maybe<Scalars['ID']['output']>;
  certificationName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  creditType: CreditType;
  evidenceOtherNote?: Maybe<Scalars['String']['output']>;
  evidenceTypes: Array<CpdEvidenceType>;
  id: Scalars['ID']['output'];
  initialCompletedCredits: Scalars['Float']['output'];
  organization: Scalars['String']['output'];
  preferredFormats: Array<LearningFormat>;
  reminderTiming?: Maybe<CpdReminderTiming>;
  remindersEnabled: Scalars['Boolean']['output'];
  reportRecipientLabel?: Maybe<Scalars['String']['output']>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars['DateTime']['output'];
  reportingStart: Scalars['DateTime']['output'];
  status: CpdPlanStatus;
  timeAvailable?: Maybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CpdPlanCategory = {
  __typename?: 'CpdPlanCategory';
  completedCredits: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  targetCredits: Scalars['Float']['output'];
};

export type CpdPlanCategoryInput = {
  completed?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  target: Scalars['Float']['input'];
};

export type CpdPlanProgress = {
  __typename?: 'CpdPlanProgress';
  activitiesCounted: Scalars['Int']['output'];
  activityCredits: Scalars['Float']['output'];
  categories: Array<CpdCategoryProgress>;
  categoriesMissing: Scalars['Int']['output'];
  complianceStatus: Scalars['String']['output'];
  earnedCredits: Scalars['Float']['output'];
  evidenceMissing: Scalars['Int']['output'];
  initialCompletedCredits: Scalars['Float']['output'];
  missingRequirements: Array<CpdMissingRequirement>;
  planId: Scalars['ID']['output'];
  progressPercent: Scalars['Float']['output'];
  remainingCredits: Scalars['Float']['output'];
  reportingExpired: Scalars['Boolean']['output'];
  reportingNotStarted: Scalars['Boolean']['output'];
  totalRequiredCredits: Scalars['Float']['output'];
};

export type CpdReportRecipientOption = {
  __typename?: 'CpdReportRecipientOption';
  description?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  type: CpdReportRecipientType;
};

export type CreateCalendarEventInput = {
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<ContentType>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: CalendarEventType;
};

export type CreateCertificateInput = {
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  cpdPlanId?: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  title: Scalars['String']['input'];
  validUntil: Scalars['String']['input'];
};

export type CreateCourseInput = {
  category: CourseCategory;
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  instructor: Scalars['String']['input'];
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  learnings?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<CourseLevel>;
  price?: InputMaybe<Scalars['Float']['input']>;
  requirements?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<CourseStatus>;
  title: Scalars['String']['input'];
};

export type CreateCpdPlanFromSuggestionInput = {
  certificationId: Scalars['ID']['input'];
  reportingEnd?: InputMaybe<Scalars['String']['input']>;
  reportingStart?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCpdPlanInput = {
  allowDuplicate?: InputMaybe<Scalars['Boolean']['input']>;
  categories?: InputMaybe<Array<CpdPlanCategoryInput>>;
  certificationId?: InputMaybe<Scalars['ID']['input']>;
  certificationName: Scalars['String']['input'];
  creditType: CreditType;
  evidenceOtherNote?: InputMaybe<Scalars['String']['input']>;
  evidenceTypes: Array<CpdEvidenceType>;
  initialCompletedCredits?: InputMaybe<Scalars['Float']['input']>;
  organization: Scalars['String']['input'];
  preferredFormats?: InputMaybe<Array<LearningFormat>>;
  reminderTiming?: InputMaybe<CpdReminderTiming>;
  remindersEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  reportRecipientLabel?: InputMaybe<Scalars['String']['input']>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars['String']['input'];
  reportingStart: Scalars['String']['input'];
  timeAvailable?: InputMaybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars['Float']['input'];
};

export type CreateEventInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category: EventCategory;
  currency?: InputMaybe<Scalars['String']['input']>;
  deliveryMode: EventDeliveryMode;
  description: Scalars['String']['input'];
  earlyBirdDiscount?: InputMaybe<Scalars['Float']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<AppLanguage>;
  location?: InputMaybe<Scalars['String']['input']>;
  onlineUrl?: InputMaybe<Scalars['String']['input']>;
  organizer?: InputMaybe<Scalars['String']['input']>;
  pdu?: InputMaybe<Scalars['Float']['input']>;
  pduCategory?: InputMaybe<PduCategory>;
  price?: InputMaybe<Scalars['Float']['input']>;
  promotionVideoUrl?: InputMaybe<Scalars['String']['input']>;
  registrationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  speaker?: InputMaybe<Scalars['String']['input']>;
  specificTopic?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['DateTime']['input'];
  status?: InputMaybe<EventStatus>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type: EventType;
};

export type CreateExternalLearningClickInput = {
  courseId?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  externalUrl: Scalars['String']['input'];
  provider?: InputMaybe<ExternalLearningProvider>;
  title: Scalars['String']['input'];
};

export type CreateOrganizationAssignmentInput = {
  courseId?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  targetKind: AssignmentTargetKind;
  targetMemberId?: InputMaybe<Scalars['String']['input']>;
  targetRole?: InputMaybe<Role>;
  title: Scalars['String']['input'];
  type: AssignmentType;
};

export type CreateOrganizationCpdCategoryInput = {
  category: PduCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  requiredHours: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CreateOrganizationDepartmentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePduActivityInput = {
  category: PduCategory;
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<ContentType>;
  creditType: CreditType;
  date: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  evidenceNote?: InputMaybe<Scalars['String']['input']>;
  evidenceUrl?: InputMaybe<Scalars['String']['input']>;
  issuingOrganization?: InputMaybe<Scalars['String']['input']>;
  learningOutcome?: InputMaybe<Scalars['String']['input']>;
  pdus: Scalars['Float']['input'];
  providerOrganizer: Scalars['String']['input'];
  relatedCertification?: InputMaybe<Scalars['String']['input']>;
  reportingYear: Scalars['Int']['input'];
  source: PduSource;
  subCategory?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePodcastEpisodeInput = {
  audioUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  episodeNumber: Scalars['Int']['input'];
  podcastId: Scalars['ID']['input'];
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePodcastInput = {
  category: PodcastCategory;
  description: Scalars['String']['input'];
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  host: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<PodcastStatus>;
  title: Scalars['String']['input'];
};

export type CreateProfessionalCredentialInput = {
  annualCpdHours?: InputMaybe<Scalars['Float']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  issuingOrganization: Scalars['String']['input'];
  licenceNumber?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pduTargetId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  status?: InputMaybe<UserStatus>;
};

export type CreateYouTubeChannelInput = {
  category: YouTubeCategory;
  channelUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<YouTubeChannelStatus>;
  subscribers?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type CreateYouTubeVideoInput = {
  channelId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  likes?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<YouTubeVideoStatus>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  views?: InputMaybe<Scalars['Int']['input']>;
};

export enum CreditType {
  Ceu = 'CEU',
  Cpd = 'CPD',
  Cpe = 'CPE',
  Pdu = 'PDU',
  TrainingHour = 'TRAINING_HOUR'
}

export type CsvExport = {
  __typename?: 'CsvExport';
  content: Scalars['String']['output'];
  filename: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
};

export type CurriculumLesson = {
  __typename?: 'CurriculumLesson';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isPreview: Scalars['Boolean']['output'];
  order: Scalars['Int']['output'];
  sectionId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: CurriculumLessonType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum CurriculumLessonType {
  Article = 'ARTICLE',
  Assignment = 'ASSIGNMENT',
  Download = 'DOWNLOAD',
  LiveSession = 'LIVE_SESSION',
  Quiz = 'QUIZ',
  Video = 'VIDEO'
}

export type CurriculumSection = {
  __typename?: 'CurriculumSection';
  courseId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lessons: Array<CurriculumLesson>;
  order: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Event = {
  __typename?: 'Event';
  attendees: Scalars['Int']['output'];
  averageRating: Scalars['Float']['output'];
  capacity?: Maybe<Scalars['Int']['output']>;
  category: EventCategory;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deliveryMode: EventDeliveryMode;
  description: Scalars['String']['output'];
  earlyBirdDiscount?: Maybe<Scalars['Float']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFree: Scalars['Boolean']['output'];
  language?: Maybe<AppLanguage>;
  location?: Maybe<Scalars['String']['output']>;
  onlineUrl?: Maybe<Scalars['String']['output']>;
  organizer?: Maybe<Scalars['String']['output']>;
  pdu: Scalars['Float']['output'];
  pduCategory?: Maybe<PduCategory>;
  price?: Maybe<Scalars['Float']['output']>;
  promotionVideoUrl?: Maybe<Scalars['String']['output']>;
  providerId?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  registrationEnabled: Scalars['Boolean']['output'];
  scheduleItems?: Maybe<Array<EventScheduleItem>>;
  slug: Scalars['String']['output'];
  speaker?: Maybe<Scalars['String']['output']>;
  specificTopic?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  status: EventStatus;
  timezone: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: EventType;
  updatedAt: Scalars['DateTime']['output'];
  views: Scalars['Int']['output'];
};

export type EventCatalogFilterInput = {
  category?: InputMaybe<EventCategory>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<EventType>;
};

export enum EventCategory {
  Business = 'BUSINESS',
  Compliance = 'COMPLIANCE',
  Cpd = 'CPD',
  Design = 'DESIGN',
  Education = 'EDUCATION',
  Engineering = 'ENGINEERING',
  Finance = 'FINANCE',
  Healthcare = 'HEALTHCARE',
  Leadership = 'LEADERSHIP',
  Marketing = 'MARKETING',
  Other = 'OTHER',
  Technology = 'TECHNOLOGY'
}

export enum EventDeliveryMode {
  Hybrid = 'HYBRID',
  InPerson = 'IN_PERSON',
  LiveOnline = 'LIVE_ONLINE',
  Recorded = 'RECORDED'
}

export type EventFilterInput = {
  category?: InputMaybe<EventCategory>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventStatus>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<EventType>;
};

export type EventPageInfo = {
  __typename?: 'EventPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type EventPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type EventRegistration = {
  __typename?: 'EventRegistration';
  attendedAt?: Maybe<Scalars['DateTime']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: EventRegistrationStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export enum EventRegistrationStatus {
  Attended = 'ATTENDED',
  Canceled = 'CANCELED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  NotAttended = 'NOT_ATTENDED',
  Registered = 'REGISTERED'
}

export type EventScheduleItem = {
  __typename?: 'EventScheduleItem';
  createdAt: Scalars['DateTime']['output'];
  dayNumber: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['DateTime']['output'];
  eventId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  speaker?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum EventSortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum EventSortField {
  Attendees = 'ATTENDEES',
  AverageRating = 'AVERAGE_RATING',
  CreatedAt = 'CREATED_AT',
  Price = 'PRICE',
  StartDate = 'START_DATE',
  Title = 'TITLE',
  UpdatedAt = 'UPDATED_AT',
  Views = 'VIEWS'
}

export type EventSortInput = {
  direction?: InputMaybe<EventSortDirection>;
  field?: InputMaybe<EventSortField>;
};

export enum EventStatus {
  Archived = 'ARCHIVED',
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export enum EventType {
  Conference = 'CONFERENCE',
  Course = 'COURSE',
  Networking = 'NETWORKING',
  Other = 'OTHER',
  Seminar = 'SEMINAR',
  Training = 'TRAINING',
  Webinar = 'WEBINAR',
  Workshop = 'WORKSHOP'
}

export enum ExperienceRange {
  ElevenToFifteenYears = 'ELEVEN_TO_FIFTEEN_YEARS',
  LessThanOneYear = 'LESS_THAN_ONE_YEAR',
  OneToTwoYears = 'ONE_TO_TWO_YEARS',
  SixteenPlusYears = 'SIXTEEN_PLUS_YEARS',
  SixToTenYears = 'SIX_TO_TEN_YEARS',
  ThreeToFiveYears = 'THREE_TO_FIVE_YEARS'
}

export type ExternalLearningActionResponse = {
  __typename?: 'ExternalLearningActionResponse';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ExternalLearningActivity = {
  __typename?: 'ExternalLearningActivity';
  certificateUrl?: Maybe<Scalars['String']['output']>;
  clickedAt: Scalars['DateTime']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  confirmedAt?: Maybe<Scalars['DateTime']['output']>;
  courseId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventId?: Maybe<Scalars['ID']['output']>;
  evidenceNote?: Maybe<Scalars['String']['output']>;
  externalUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  licenseNumber?: Maybe<Scalars['String']['output']>;
  pduHours?: Maybe<Scalars['Float']['output']>;
  provider: ExternalLearningProvider;
  rejectReason?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['DateTime']['output']>;
  remindedAt?: Maybe<Scalars['DateTime']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: ExternalLearningStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ExternalLearningFilterInput = {
  provider?: InputMaybe<ExternalLearningProvider>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ExternalLearningStatus>;
};

export enum ExternalLearningProvider {
  Coursera = 'COURSERA',
  Edx = 'EDX',
  LinkedinLearning = 'LINKEDIN_LEARNING',
  Other = 'OTHER',
  Udemy = 'UDEMY'
}

export enum ExternalLearningStatus {
  AskedConfirmation = 'ASKED_CONFIRMATION',
  Clicked = 'CLICKED',
  Completed = 'COMPLETED',
  EnrolledConfirmed = 'ENROLLED_CONFIRMED',
  EvidenceUploaded = 'EVIDENCE_UPLOADED',
  Ignored = 'IGNORED',
  Rejected = 'REJECTED',
  Started = 'STARTED',
  Verified = 'VERIFIED'
}

export type ForgotPasswordInput = {
  email: Scalars['String']['input'];
};

export enum LearningBudgetPreference {
  EmployerSponsored = 'EMPLOYER_SPONSORED',
  FreeOnly = 'FREE_ONLY',
  MixedFreeAndPaid = 'MIXED_FREE_AND_PAID',
  Premium = 'PREMIUM'
}

export enum LearningFormat {
  Article = 'ARTICLE',
  Course = 'COURSE',
  Podcast = 'PODCAST',
  Video = 'VIDEO',
  Webinar = 'WEBINAR',
  Workshop = 'WORKSHOP'
}

export enum LearningTimeCommitment {
  FourToSixHours = 'FOUR_TO_SIX_HOURS',
  LessThanOneHour = 'LESS_THAN_ONE_HOUR',
  MoreThanTenHours = 'MORE_THAN_TEN_HOURS',
  OneToThreeHours = 'ONE_TO_THREE_HOURS',
  SevenToTenHours = 'SEVEN_TO_TEN_HOURS'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role?: InputMaybe<Role>;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateOrganizationAccount: AuthPayload;
  addOrganizationMember: OrganizationMember;
  addToCart: ContentActionPayload;
  approveAdminOrgAccessRequest: AdminOrgAccessRequest;
  archiveCourse: Course;
  archiveEvent: Event;
  archivePodcast: Podcast;
  archiveYouTubeChannel: YouTubeChannel;
  bulkAddOrganizationMembers: BulkAddOrganizationMembersResult;
  cancelContentEnrollment: ContentActionPayload;
  cancelEvent: Event;
  cancelEventRegistration: EventRegistration;
  changePassword: AuthPayload;
  clearCart: ContentActionPayload;
  completeProfessionalOnboarding: ProfessionalDashboardProfile;
  confirmExternalLearning: ExternalLearningActivity;
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
  enrollContent: ContentActionPayload;
  forgotPassword: AuthPayload;
  ignoreExternalLearning: ExternalLearningActionResponse;
  login: AuthPayload;
  logout: AuthPayload;
  publishCourse: Course;
  publishEvent: Event;
  publishPodcast: Podcast;
  publishYouTubeChannel: YouTubeChannel;
  refreshToken: AuthPayload;
  register: AuthPayload;
  registerEvent: EventRegistration;
  rejectAdminOrgAccessRequest: AdminOrgAccessRequest;
  removeAdminOrganizationMember: AdminOrgMember;
  removeFromCart: ContentActionPayload;
  requestEmailChange: AuthPayload;
  resendAdminOrgAccessRequestNotification: AdminOrgAccessRequest;
  resendEmailOtp: AuthPayload;
  resendOrganizationActivation: AuthPayload;
  resetPassword: AuthPayload;
  resetProfessionalSettings: ProfessionalSettings;
  restoreCourse: Course;
  restoreEvent: Event;
  restorePodcast: Podcast;
  restoreUser: User;
  restoreYouTubeChannel: YouTubeChannel;
  setProfessionalCertificateCpdPlan: ProfessionalCertificate;
  startProfessionalOnboarding: ProfessionalDashboardProfile;
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
  requestId: Scalars['String']['input'];
};


export type MutationArchiveCourseArgs = {
  courseId: Scalars['String']['input'];
};


export type MutationArchiveEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationArchivePodcastArgs = {
  podcastId: Scalars['String']['input'];
};


export type MutationArchiveYouTubeChannelArgs = {
  channelId: Scalars['String']['input'];
};


export type MutationBulkAddOrganizationMembersArgs = {
  input: BulkAddOrganizationMembersInput;
};


export type MutationCancelContentEnrollmentArgs = {
  input: ContentActionInput;
};


export type MutationCancelEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationCancelEventRegistrationArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCompleteProfessionalOnboardingArgs = {
  input: CompleteProfessionalOnboardingInput;
};


export type MutationConfirmExternalLearningArgs = {
  input: ConfirmExternalLearningInput;
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


export type MutationDeleteCalendarEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteContentReviewArgs = {
  input: ContentActionInput;
};


export type MutationDeleteCourseArgs = {
  courseId: Scalars['String']['input'];
};


export type MutationDeleteCpdPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type MutationDeleteEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationDeleteOrganizationAssignmentArgs = {
  assignmentId: Scalars['String']['input'];
};


export type MutationDeleteOrganizationCpdCategoryArgs = {
  categoryId: Scalars['String']['input'];
};


export type MutationDeleteOrganizationDepartmentArgs = {
  departmentId: Scalars['String']['input'];
};


export type MutationDeletePodcastArgs = {
  podcastId: Scalars['String']['input'];
};


export type MutationDeletePodcastEpisodeArgs = {
  episodeId: Scalars['String']['input'];
};


export type MutationDeleteProfessionalCertificateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProfessionalCredentialArgs = {
  credentialId: Scalars['ID']['input'];
};


export type MutationDeleteProfessionalPduActivityArgs = {
  activityId: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationDeleteYouTubeChannelArgs = {
  channelId: Scalars['String']['input'];
};


export type MutationDeleteYouTubeVideoArgs = {
  videoId: Scalars['String']['input'];
};


export type MutationEnrollContentArgs = {
  input: ContentActionInput;
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationIgnoreExternalLearningArgs = {
  activityId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationPublishCourseArgs = {
  courseId: Scalars['String']['input'];
};


export type MutationPublishEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationPublishPodcastArgs = {
  podcastId: Scalars['String']['input'];
};


export type MutationPublishYouTubeChannelArgs = {
  channelId: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationRejectAdminOrgAccessRequestArgs = {
  input: RejectAdminOrgAccessRequestInput;
};


export type MutationRemoveAdminOrganizationMemberArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationRemoveFromCartArgs = {
  input: ContentActionInput;
};


export type MutationRequestEmailChangeArgs = {
  input: RequestEmailChangeInput;
};


export type MutationResendAdminOrgAccessRequestNotificationArgs = {
  requestId: Scalars['String']['input'];
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
  courseId: Scalars['String']['input'];
};


export type MutationRestoreEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationRestorePodcastArgs = {
  podcastId: Scalars['String']['input'];
};


export type MutationRestoreUserArgs = {
  userId: Scalars['String']['input'];
};


export type MutationRestoreYouTubeChannelArgs = {
  channelId: Scalars['String']['input'];
};


export type MutationSetProfessionalCertificateCpdPlanArgs = {
  input: SetCertificateCpdPlanInput;
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

export type MyWishlistInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<ContentType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  onlyWithRating?: InputMaybe<Scalars['Boolean']['input']>;
  onlyWithUrl?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<WishlistPriceFilter>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<WishlistSortBy>;
};

export enum NotificationDeliveryStatus {
  Failed = 'FAILED',
  NotRequested = 'NOT_REQUESTED',
  Pending = 'PENDING',
  Sent = 'SENT'
}

export type OrganizationAccessRequest = {
  __typename?: 'OrganizationAccessRequest';
  approvedUserId?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  expectedLicensedProfessionals: Scalars['Int']['output'];
  goals: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  organizationName: Scalars['String']['output'];
  organizationType: OrganizationType;
  rejectReason?: Maybe<Scalars['String']['output']>;
  representativeFullName: Scalars['String']['output'];
  representativeJobRole: Scalars['String']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedById?: Maybe<Scalars['String']['output']>;
  status: OrganizationAccessRequestStatus;
  updatedAt: Scalars['DateTime']['output'];
  workEmail: Scalars['String']['output'];
};

export type OrganizationAccessRequestFilterInput = {
  organizationType?: InputMaybe<OrganizationType>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrganizationAccessRequestStatus>;
};

export type OrganizationAccessRequestPageInfo = {
  __typename?: 'OrganizationAccessRequestPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type OrganizationAccessRequestPaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export enum OrganizationAccessRequestStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type OrganizationActionResponse = {
  __typename?: 'OrganizationActionResponse';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type OrganizationActivationStatus = {
  __typename?: 'OrganizationActivationStatus';
  organizationName?: Maybe<Scalars['String']['output']>;
  status: OrganizationActivationTokenStatus;
};

export enum OrganizationActivationTokenStatus {
  Expired = 'EXPIRED',
  Invalid = 'INVALID',
  Used = 'USED',
  Valid = 'VALID'
}

export type OrganizationAssignment = {
  __typename?: 'OrganizationAssignment';
  courseId?: Maybe<Scalars['String']['output']>;
  courseTitle?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdById: Scalars['ID']['output'];
  departmentId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  eventTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  members: Scalars['Int']['output'];
  organizationId: Scalars['ID']['output'];
  progress: Scalars['Float']['output'];
  status: AssignmentStatus;
  targetKind: AssignmentTargetKind;
  targetMemberId?: Maybe<Scalars['String']['output']>;
  targetRole?: Maybe<Role>;
  title: Scalars['String']['output'];
  type: AssignmentType;
  updatedAt: Scalars['DateTime']['output'];
};

export type OrganizationAssignmentFilterInput = {
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AssignmentStatus>;
  type?: InputMaybe<AssignmentType>;
};

export type OrganizationAssignmentStats = {
  __typename?: 'OrganizationAssignmentStats';
  activeAssignments: Scalars['Int']['output'];
  averageCompletionRate: Scalars['Float']['output'];
  totalAssignments: Scalars['Int']['output'];
  totalParticipants: Scalars['Int']['output'];
};

export type OrganizationAttentionMember = {
  __typename?: 'OrganizationAttentionMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  compliance: Scalars['Float']['output'];
  departmentTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  pduGoal: Scalars['Float']['output'];
  pdus: Scalars['Float']['output'];
  remainingPdus: Scalars['Float']['output'];
  userId: Scalars['ID']['output'];
};

export type OrganizationComplianceDistribution = {
  __typename?: 'OrganizationComplianceDistribution';
  atRisk: Scalars['Int']['output'];
  compliant: Scalars['Int']['output'];
  nonCompliant: Scalars['Int']['output'];
};

export type OrganizationCpdCategory = {
  __typename?: 'OrganizationCpdCategory';
  activeMembers?: Maybe<Scalars['Int']['output']>;
  category: PduCategory;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  organizationId: Scalars['ID']['output'];
  requiredHours: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  totalMembers?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OrganizationCpdCategoryFilterInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationCpdCategoryStats = {
  __typename?: 'OrganizationCpdCategoryStats';
  activeCategories: Scalars['Int']['output'];
  mostPopularActiveMembers: Scalars['Int']['output'];
  mostPopularCategory?: Maybe<Scalars['String']['output']>;
  totalCategories: Scalars['Int']['output'];
  totalRequiredHours: Scalars['Float']['output'];
};

export type OrganizationDepartment = {
  __typename?: 'OrganizationDepartment';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  organizationId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type OrganizationEventCatalogItem = {
  __typename?: 'OrganizationEventCatalogItem';
  averageRating: Scalars['Float']['output'];
  capacity?: Maybe<Scalars['Int']['output']>;
  category: EventCategory;
  currency: Scalars['String']['output'];
  deliveryMode: EventDeliveryMode;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFree: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  onlineUrl?: Maybe<Scalars['String']['output']>;
  pdu: Scalars['Float']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  rating: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  speaker?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  type: EventType;
};

export type OrganizationMember = {
  __typename?: 'OrganizationMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  completedLearning: Scalars['Int']['output'];
  compliance: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  departmentTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobRole?: Maybe<Scalars['String']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  organizationId: Scalars['ID']['output'];
  pdus: Scalars['Float']['output'];
  role: Role;
  status: OrganizationMemberStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type OrganizationMemberDetail = {
  __typename?: 'OrganizationMemberDetail';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  completedLearning: Scalars['Int']['output'];
  compliance: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  departmentId?: Maybe<Scalars['String']['output']>;
  departmentTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  jobRole?: Maybe<Scalars['String']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  lastCourseTitle?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organizationId: Scalars['ID']['output'];
  pduGoal: Scalars['Float']['output'];
  pduProgress: Scalars['Float']['output'];
  pdus: Scalars['Float']['output'];
  status: OrganizationMemberStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type OrganizationMemberFilterInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

/** Status of organization member */
export enum OrganizationMemberStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

export type OrganizationMembersStats = {
  __typename?: 'OrganizationMembersStats';
  activeMembers: Scalars['Int']['output'];
  averageCompliance: Scalars['Float']['output'];
  inactiveMembers: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
};

export type OrganizationOverview = {
  __typename?: 'OrganizationOverview';
  attentionMembers: Array<OrganizationAttentionMember>;
  complianceDistribution: OrganizationComplianceDistribution;
  summary: OrganizationOverviewSummary;
  trendingTopics: Array<OrganizationTrendingTopic>;
};

export type OrganizationOverviewSummary = {
  __typename?: 'OrganizationOverviewSummary';
  activeAssignments: Scalars['Int']['output'];
  activeMembers: Scalars['Int']['output'];
  averageCompliance: Scalars['Float']['output'];
  engagementRate: Scalars['Float']['output'];
  nonCompliantMembers: Scalars['Int']['output'];
  totalMembers: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
};

export type OrganizationPageInfo = {
  __typename?: 'OrganizationPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type OrganizationPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type OrganizationProfile = {
  __typename?: 'OrganizationProfile';
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  industry?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  memberLimit?: Maybe<Scalars['Int']['output']>;
  organizationName: Scalars['String']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type OrganizationReport = {
  __typename?: 'OrganizationReport';
  complianceTrend: Array<OrganizationReportTrendPoint>;
  departmentCompliance: Array<OrganizationReportDepartment>;
  summary: OrganizationReportSummary;
};

export type OrganizationReportDepartment = {
  __typename?: 'OrganizationReportDepartment';
  averagePdus: Scalars['Float']['output'];
  compliance: Scalars['Float']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  departmentTitle: Scalars['String']['output'];
  teamSize: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
};

export type OrganizationReportFilterInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  range?: InputMaybe<OrganizationReportRangeEnum>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export enum OrganizationReportRangeEnum {
  CurrentYear = 'CURRENT_YEAR',
  Custom = 'CUSTOM',
  LastQuarter = 'LAST_QUARTER'
}

export type OrganizationReportSummary = {
  __typename?: 'OrganizationReportSummary';
  averageCompliance: Scalars['Float']['output'];
  averagePdus: Scalars['Float']['output'];
  requiredHours: Scalars['Float']['output'];
  totalMembers: Scalars['Int']['output'];
  totalPdus: Scalars['Float']['output'];
};

export type OrganizationReportTopMember = {
  __typename?: 'OrganizationReportTopMember';
  completedLearning: Scalars['Int']['output'];
  compliance: Scalars['Float']['output'];
  departmentTitle?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  pdus: Scalars['Float']['output'];
  userId: Scalars['ID']['output'];
};

export type OrganizationReportTopMembersFilterInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationReportTrendPoint = {
  __typename?: 'OrganizationReportTrendPoint';
  compliance: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  label: Scalars['String']['output'];
  pdus: Scalars['Float']['output'];
};

export type OrganizationSettings = {
  __typename?: 'OrganizationSettings';
  assignmentNotifications: Scalars['Boolean']['output'];
  complianceAlerts: Scalars['Boolean']['output'];
  complianceCycle: ComplianceCycle;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  minimumPdu: Scalars['Float']['output'];
  organizationId: Scalars['ID']['output'];
  strictCompliance: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weeklySummaryReport: Scalars['Boolean']['output'];
};

export type OrganizationTrendingTopic = {
  __typename?: 'OrganizationTrendingTopic';
  count: Scalars['Int']['output'];
  percentage: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export enum OrganizationType {
  Association = 'ASSOCIATION',
  Company = 'COMPANY',
  Government = 'GOVERNMENT',
  NonProfit = 'NON_PROFIT',
  Other = 'OTHER',
  TrainingProvider = 'TRAINING_PROVIDER',
  University = 'UNIVERSITY'
}

export enum PduCategory {
  Business = 'BUSINESS',
  Communication = 'COMMUNICATION',
  Compliance = 'COMPLIANCE',
  DigitalAi = 'DIGITAL_AI',
  Ethics = 'ETHICS',
  IndustryKnowledge = 'INDUSTRY_KNOWLEDGE',
  Leadership = 'LEADERSHIP',
  Other = 'OTHER',
  ProfessionalPractice = 'PROFESSIONAL_PRACTICE',
  ResearchInnovation = 'RESEARCH_INNOVATION',
  Strategic = 'STRATEGIC',
  Technical = 'TECHNICAL'
}

export enum PduCompletionStatus {
  Completed = 'COMPLETED',
  Incomplete = 'INCOMPLETE'
}

export enum PduSource {
  CertificationProgram = 'CERTIFICATION_PROGRAM',
  Conference = 'CONFERENCE',
  Course = 'COURSE',
  Event = 'EVENT',
  ExamAssessment = 'EXAM_ASSESSMENT',
  Meeting = 'MEETING',
  Mentorship = 'MENTORSHIP',
  Other = 'OTHER',
  Podcast = 'PODCAST',
  ReadingArticle = 'READING_ARTICLE',
  SelfStudy = 'SELF_STUDY',
  Seminar = 'SEMINAR',
  Teaching = 'TEACHING',
  TrainingSession = 'TRAINING_SESSION',
  VideoLecture = 'VIDEO_LECTURE',
  Volunteering = 'VOLUNTEERING',
  Webinar = 'WEBINAR',
  Workshop = 'WORKSHOP',
  Youtube = 'YOUTUBE'
}

export enum PduStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type PaginatedAdminAuditLogs = {
  __typename?: 'PaginatedAdminAuditLogs';
  items: Array<AdminAuditLog>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedAdminOrg = {
  __typename?: 'PaginatedAdminOrg';
  items: Array<AdminOrg>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedAdminOrgAccessRequests = {
  __typename?: 'PaginatedAdminOrgAccessRequests';
  items: Array<AdminOrgAccessRequest>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedAdminOrgMembers = {
  __typename?: 'PaginatedAdminOrgMembers';
  items: Array<AdminOrgMember>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedAdminUser = {
  __typename?: 'PaginatedAdminUser';
  items: Array<AdminUser>;
  pageInfo: AdminPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedCourses = {
  __typename?: 'PaginatedCourses';
  items: Array<Course>;
  pageInfo: CoursePageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedEvents = {
  __typename?: 'PaginatedEvents';
  items: Array<Event>;
  pageInfo: EventPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedExternalLearning = {
  __typename?: 'PaginatedExternalLearning';
  items: Array<ExternalLearningActivity>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizationAccessRequests = {
  __typename?: 'PaginatedOrganizationAccessRequests';
  items: Array<OrganizationAccessRequest>;
  pageInfo: OrganizationAccessRequestPageInfo;
};

export type PaginatedOrganizationAssignments = {
  __typename?: 'PaginatedOrganizationAssignments';
  items: Array<OrganizationAssignment>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizationCpdCategories = {
  __typename?: 'PaginatedOrganizationCpdCategories';
  items: Array<OrganizationCpdCategory>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizationEventCatalog = {
  __typename?: 'PaginatedOrganizationEventCatalog';
  items: Array<OrganizationEventCatalogItem>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizationMembers = {
  __typename?: 'PaginatedOrganizationMembers';
  items: Array<OrganizationMember>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizationReportTopMembers = {
  __typename?: 'PaginatedOrganizationReportTopMembers';
  items: Array<OrganizationReportTopMember>;
  pageInfo: OrganizationPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedPodcasts = {
  __typename?: 'PaginatedPodcasts';
  items: Array<Podcast>;
  pageInfo: PodcastPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProfessionalCalendarEvents = {
  __typename?: 'PaginatedProfessionalCalendarEvents';
  items: Array<ProfessionalCalendarEvent>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProfessionalCertificates = {
  __typename?: 'PaginatedProfessionalCertificates';
  activeCertificates: Scalars['Int']['output'];
  items: Array<ProfessionalCertificate>;
  pageInfo: ProfessionalPageInfo;
  totalCertificates: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPdusEarned: Scalars['Float']['output'];
};

export type PaginatedProfessionalCourses = {
  __typename?: 'PaginatedProfessionalCourses';
  items: Array<ProfessionalCourse>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProfessionalExploreRoadmaps = {
  __typename?: 'PaginatedProfessionalExploreRoadmaps';
  items: Array<ProfessionalExploreRoadmap>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProfessionalPayments = {
  __typename?: 'PaginatedProfessionalPayments';
  items: Array<ProfessionalPayment>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
  totalSpent: Scalars['Float']['output'];
  totalTransactions: Scalars['Int']['output'];
};

export type PaginatedProfessionalPduActivities = {
  __typename?: 'PaginatedProfessionalPduActivities';
  items: Array<ProfessionalPduActivity>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProfessionalRoadmaps = {
  __typename?: 'PaginatedProfessionalRoadmaps';
  items: Array<ProfessionalRoadmap>;
  pageInfo: ProfessionalPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedPromotionRequests = {
  __typename?: 'PaginatedPromotionRequests';
  items: Array<PromotionRequest>;
  pageInfo: ProviderPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProviderAttendees = {
  __typename?: 'PaginatedProviderAttendees';
  items: Array<ProviderAttendee>;
  pageInfo: ProviderPageInfo;
  stats: ProviderAttendeesStats;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProviderEvents = {
  __typename?: 'PaginatedProviderEvents';
  items: Array<ProviderEventTableRow>;
  pageInfo: ProviderPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  items: Array<User>;
  pageInfo: UserPageInfo;
};

export type PaginatedWishlist = {
  __typename?: 'PaginatedWishlist';
  categories: Array<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  items: Array<WishlistItem>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginatedYouTubeChannels = {
  __typename?: 'PaginatedYouTubeChannels';
  items: Array<YouTubeChannel>;
  pageInfo: YouTubeChannelPageInfo;
  totalCount: Scalars['Int']['output'];
};

export enum PaymentStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Refunded = 'REFUNDED'
}

export type Podcast = {
  __typename?: 'Podcast';
  category: PodcastCategory;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description: Scalars['String']['output'];
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  episodeCount: Scalars['Int']['output'];
  host: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFeatured: Scalars['Boolean']['output'];
  listeners: Scalars['Int']['output'];
  providerId?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  status: PodcastStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum PodcastCategory {
  Ai = 'AI',
  Business = 'BUSINESS',
  Career = 'CAREER',
  Compliance = 'COMPLIANCE',
  Cpd = 'CPD',
  Data = 'DATA',
  Design = 'DESIGN',
  Education = 'EDUCATION',
  Engineering = 'ENGINEERING',
  Finance = 'FINANCE',
  Healthcare = 'HEALTHCARE',
  Leadership = 'LEADERSHIP',
  Marketing = 'MARKETING',
  Other = 'OTHER',
  Technology = 'TECHNOLOGY'
}

export type PodcastEpisode = {
  __typename?: 'PodcastEpisode';
  audioUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  episodeNumber: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  podcastId: Scalars['String']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PodcastFilterInput = {
  category?: InputMaybe<PodcastCategory>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PodcastStatus>;
};

export type PodcastPageInfo = {
  __typename?: 'PodcastPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type PodcastPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum PodcastSortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum PodcastSortField {
  CreatedAt = 'CREATED_AT',
  EpisodeCount = 'EPISODE_COUNT',
  Listeners = 'LISTENERS',
  Rating = 'RATING',
  Title = 'TITLE',
  UpdatedAt = 'UPDATED_AT'
}

export type PodcastSortInput = {
  direction?: InputMaybe<PodcastSortDirection>;
  field?: InputMaybe<PodcastSortField>;
};

export enum PodcastStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type PopularCategoriesInput = {
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type PopularCategory = {
  __typename?: 'PopularCategory';
  averageRating: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  courseCount: Scalars['Int']['output'];
  eventCount: Scalars['Int']['output'];
  podcastCount: Scalars['Int']['output'];
  popularityScore: Scalars['Float']['output'];
  totalItems: Scalars['Int']['output'];
  youtubeCount: Scalars['Int']['output'];
};

export type ProfessionalActionResponse = {
  __typename?: 'ProfessionalActionResponse';
  id: Scalars['ID']['output'];
};

export type ProfessionalCalendarEvent = {
  __typename?: 'ProfessionalCalendarEvent';
  attendedAt?: Maybe<Scalars['DateTime']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  durationMinutes: Scalars['Int']['output'];
  event?: Maybe<ProfessionalCalendarEventInfo>;
  eventId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isLive: Scalars['Boolean']['output'];
  isPast: Scalars['Boolean']['output'];
  isUpcoming: Scalars['Boolean']['output'];
  startsInMinutes?: Maybe<Scalars['Int']['output']>;
  status: EventRegistrationStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type ProfessionalCalendarEventInfo = {
  __typename?: 'ProfessionalCalendarEventInfo';
  deliveryMode: EventDeliveryMode;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  onlineUrl?: Maybe<Scalars['String']['output']>;
  pdu: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  timezone: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: EventType;
};

export type ProfessionalCalendarEventsFilterInput = {
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventRegistrationStatus>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type ProfessionalCertificate = {
  __typename?: 'ProfessionalCertificate';
  certificateNumber?: Maybe<Scalars['String']['output']>;
  certificateUrl?: Maybe<Scalars['String']['output']>;
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<ContentType>;
  cpdPlanId?: Maybe<Scalars['ID']['output']>;
  cpdPlanName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  evidenceFiles: Array<ProfessionalCertificateFile>;
  id: Scalars['ID']['output'];
  issuedAt: Scalars['DateTime']['output'];
  issuer?: Maybe<Scalars['String']['output']>;
  pduEarned: Scalars['Float']['output'];
  status: CertificateStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
  validUntil?: Maybe<Scalars['DateTime']['output']>;
  verificationCode: Scalars['String']['output'];
};

export type ProfessionalCertificateFile = {
  __typename?: 'ProfessionalCertificateFile';
  createdAt: Scalars['DateTime']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mimeType: Scalars['String']['output'];
  sizeBytes: Scalars['Int']['output'];
};

export type ProfessionalCertificateOption = {
  __typename?: 'ProfessionalCertificateOption';
  id: Scalars['ID']['output'];
  issuer?: Maybe<Scalars['String']['output']>;
  status: CertificateStatus;
  title: Scalars['String']['output'];
  validUntil?: Maybe<Scalars['DateTime']['output']>;
};

export type ProfessionalCertificateSummary = {
  __typename?: 'ProfessionalCertificateSummary';
  active: Scalars['Int']['output'];
  expired: Scalars['Int']['output'];
  expiringSoon: Scalars['Int']['output'];
  nearestExpiry?: Maybe<Scalars['DateTime']['output']>;
  total: Scalars['Int']['output'];
};

export type ProfessionalCourse = {
  __typename?: 'ProfessionalCourse';
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  courseCategory?: Maybe<CourseCategory>;
  courseCurrency?: Maybe<Scalars['String']['output']>;
  courseDescription?: Maybe<Scalars['String']['output']>;
  courseDurationMinutes?: Maybe<Scalars['Int']['output']>;
  courseImageUrl?: Maybe<Scalars['String']['output']>;
  courseIsFree?: Maybe<Scalars['Boolean']['output']>;
  courseLevel?: Maybe<CourseLevel>;
  coursePrice?: Maybe<Scalars['Float']['output']>;
  courseRating?: Maybe<Scalars['Float']['output']>;
  courseRatingCount?: Maybe<Scalars['Int']['output']>;
  courseSlug?: Maybe<Scalars['String']['output']>;
  courseTitle?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  progress: Scalars['Int']['output'];
  providerName?: Maybe<Scalars['String']['output']>;
  startedAt: Scalars['DateTime']['output'];
  status: ContentEnrollmentStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ProfessionalCpdPlan = {
  __typename?: 'ProfessionalCpdPlan';
  category: PduCategory;
  id: Scalars['ID']['output'];
  target: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type ProfessionalCredential = {
  __typename?: 'ProfessionalCredential';
  annualCpdHours?: Maybe<Scalars['Float']['output']>;
  certificationId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiryDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  issueDate?: Maybe<Scalars['DateTime']['output']>;
  issuingOrganization?: Maybe<Scalars['String']['output']>;
  licenceNumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pduTargetId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProfessionalDashboardProfile = {
  __typename?: 'ProfessionalDashboardProfile';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  certificatesEarned: Scalars['Int']['output'];
  completion: ProfessionalProfileCompletion;
  countryCode?: Maybe<Scalars['String']['output']>;
  coursesEnrolled: Scalars['Int']['output'];
  credentials: Array<ProfessionalCredential>;
  currentRole?: Maybe<Scalars['String']['output']>;
  currentSkillLevel?: Maybe<SkillLevel>;
  email?: Maybe<Scalars['String']['output']>;
  experienceRange?: Maybe<ExperienceRange>;
  favoriteSubjects: Array<ProfessionalTaxonomyTerm>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  industry?: Maybe<ProfessionalIndustry>;
  isEmailVerified: Scalars['Boolean']['output'];
  language?: Maybe<AppLanguage>;
  learningBudgetPreference?: Maybe<LearningBudgetPreference>;
  learningHours: Scalars['Float']['output'];
  learningTimeCommitment?: Maybe<LearningTimeCommitment>;
  linkedInUrl?: Maybe<Scalars['String']['output']>;
  mainSkillAreas: Array<ProfessionalTaxonomyTerm>;
  onboardingCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  preferredLearningFormats: Array<LearningFormat>;
  profession?: Maybe<Scalars['String']['output']>;
  professionalGoal?: Maybe<ProfessionalGoal>;
  professionalSummary?: Maybe<Scalars['String']['output']>;
  role: Role;
  skillsToImprove: Array<ProfessionalTaxonomyTerm>;
  status: UserStatus;
  targetSkillLevel?: Maybe<SkillLevel>;
  timeZone?: Maybe<Scalars['String']['output']>;
  workLocation?: Maybe<Scalars['String']['output']>;
};

export type ProfessionalExploreRoadmap = {
  __typename?: 'ProfessionalExploreRoadmap';
  category?: Maybe<CourseCategory>;
  description: Scalars['String']['output'];
  estimatedWeeks: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isEnrolled: Scalars['Boolean']['output'];
  level: CourseLevel;
  phasesCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  status: RoadmapStatus;
  title: Scalars['String']['output'];
  totalSteps: Scalars['Int']['output'];
};

export enum ProfessionalGoal {
  ExploreProfessionalPath = 'EXPLORE_PROFESSIONAL_PATH',
  GrowInCurrentRole = 'GROW_IN_CURRENT_ROLE',
  MaintainCertification = 'MAINTAIN_CERTIFICATION',
  PrepareForNextRole = 'PREPARE_FOR_NEXT_ROLE'
}

export enum ProfessionalIndustry {
  Construction = 'CONSTRUCTION',
  Education = 'EDUCATION',
  Engineering = 'ENGINEERING',
  Finance = 'FINANCE',
  Healthcare = 'HEALTHCARE',
  Legal = 'LEGAL',
  Manufacturing = 'MANUFACTURING',
  Marketing = 'MARKETING',
  NonProfit = 'NON_PROFIT',
  Other = 'OTHER',
  PublicSector = 'PUBLIC_SECTOR',
  Technology = 'TECHNOLOGY'
}

export type ProfessionalManualCalendarEvent = {
  __typename?: 'ProfessionalManualCalendarEvent';
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars['DateTime']['output'];
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isLive: Scalars['Boolean']['output'];
  isPast: Scalars['Boolean']['output'];
  isUpcoming: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  startsInMinutes?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  type: CalendarEventType;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type ProfessionalOverview = {
  __typename?: 'ProfessionalOverview';
  activeCourses: Scalars['Int']['output'];
  certificatesEarned: Scalars['Int']['output'];
  completedCourses: Scalars['Int']['output'];
  professionalName?: Maybe<Scalars['String']['output']>;
  totalPdus: Scalars['Float']['output'];
  upcomingEvents: Scalars['Int']['output'];
  yearlyPduGoalProgress: Scalars['Float']['output'];
};

export type ProfessionalPageInfo = {
  __typename?: 'ProfessionalPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type ProfessionalPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type ProfessionalPayment = {
  __typename?: 'ProfessionalPayment';
  amount: Scalars['Float']['output'];
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  providerPaymentId?: Maybe<Scalars['String']['output']>;
  receiptUrl?: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ProfessionalPduActivity = {
  __typename?: 'ProfessionalPduActivity';
  category: PduCategory;
  completionStatus: PduCompletionStatus;
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<ContentType>;
  createdAt: Scalars['DateTime']['output'];
  creditType: CreditType;
  date: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  evidenceFiles: Array<ProfessionalPduActivityFile>;
  evidenceNote?: Maybe<Scalars['String']['output']>;
  evidenceUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  issuingOrganization?: Maybe<Scalars['String']['output']>;
  learningOutcome?: Maybe<Scalars['String']['output']>;
  pdus: Scalars['Float']['output'];
  providerOrganizer?: Maybe<Scalars['String']['output']>;
  relatedCertification?: Maybe<Scalars['String']['output']>;
  reportingYear?: Maybe<Scalars['Int']['output']>;
  source: PduSource;
  status: PduStatus;
  subCategory?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProfessionalPduActivityFile = {
  __typename?: 'ProfessionalPduActivityFile';
  createdAt: Scalars['DateTime']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  sizeBytes: Scalars['Int']['output'];
};

export type ProfessionalPduActivityFilterInput = {
  activityType?: InputMaybe<PduSource>;
  category?: InputMaybe<PduCategory>;
  completionStatus?: InputMaybe<PduCompletionStatus>;
  creditType?: InputMaybe<CreditType>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  hasCertificate?: InputMaybe<Scalars['Boolean']['input']>;
  reportingYear?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ProfessionalPduActivitySummary = {
  __typename?: 'ProfessionalPduActivitySummary';
  activitiesWithEvidence: Scalars['Int']['output'];
  completedActivities: Scalars['Int']['output'];
  evidenceFilesCount: Scalars['Int']['output'];
};

export type ProfessionalPduCategorySummary = {
  __typename?: 'ProfessionalPduCategorySummary';
  category: PduCategory;
  pdus: Scalars['Float']['output'];
};

export type ProfessionalPduMonthlyPoint = {
  __typename?: 'ProfessionalPduMonthlyPoint';
  month: Scalars['Int']['output'];
  pdus: Scalars['Float']['output'];
};

export type ProfessionalPduReport = {
  __typename?: 'ProfessionalPduReport';
  activities: Scalars['Int']['output'];
  averagePerMonth: Scalars['Float']['output'];
  byCategory: Array<ProfessionalPduCategorySummary>;
  byMonth: Array<ProfessionalPduMonthlyPoint>;
  progressToGoal: Scalars['Float']['output'];
  targets: Array<ProfessionalPduTarget>;
  totalPdus: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type ProfessionalPduTarget = {
  __typename?: 'ProfessionalPduTarget';
  category: PduCategory;
  id: Scalars['String']['output'];
  target: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type ProfessionalProfile = {
  __typename?: 'ProfessionalProfile';
  createdAt: Scalars['DateTime']['output'];
  currentRole?: Maybe<Scalars['String']['output']>;
  experienceRange?: Maybe<ExperienceRange>;
  id: Scalars['ID']['output'];
  industry?: Maybe<ProfessionalIndustry>;
  interests: Array<Scalars['String']['output']>;
  profession?: Maybe<Scalars['String']['output']>;
  skills: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  workLocation?: Maybe<Scalars['String']['output']>;
};

export type ProfessionalProfileCompletion = {
  __typename?: 'ProfessionalProfileCompletion';
  completedCount: Scalars['Int']['output'];
  percentage: Scalars['Int']['output'];
  sections: Array<ProfessionalProfileSection>;
  totalSections: Scalars['Int']['output'];
};

export type ProfessionalProfileSection = {
  __typename?: 'ProfessionalProfileSection';
  isComplete: Scalars['Boolean']['output'];
  key: ProfileSectionKey;
  missingFields: Array<Scalars['String']['output']>;
};

export type ProfessionalRoadmap = {
  __typename?: 'ProfessionalRoadmap';
  category?: Maybe<CourseCategory>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedPhases: Scalars['Int']['output'];
  completedSteps: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  enrolledAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  level: CourseLevel;
  nextMilestoneProgress: Scalars['Int']['output'];
  nextPhaseTitle?: Maybe<Scalars['String']['output']>;
  phases: Array<ProfessionalRoadmapPhase>;
  phasesCount: Scalars['Int']['output'];
  progress: Scalars['Int']['output'];
  roadmapId: Scalars['ID']['output'];
  roadmapStatus: RoadmapStatus;
  slug: Scalars['String']['output'];
  status: RoadmapEnrollmentStatus;
  title: Scalars['String']['output'];
  totalSteps: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ProfessionalRoadmapPhase = {
  __typename?: 'ProfessionalRoadmapPhase';
  completed: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  progress: Scalars['Int']['output'];
  steps: Array<ProfessionalRoadmapStep>;
  stepsCount: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type ProfessionalRoadmapStep = {
  __typename?: 'ProfessionalRoadmapStep';
  contentId?: Maybe<Scalars['String']['output']>;
  contentType?: Maybe<ContentType>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type ProfessionalSearchInput = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ProfessionalSession = {
  __typename?: 'ProfessionalSession';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  status: SessionStatus;
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type ProfessionalSettings = {
  __typename?: 'ProfessionalSettings';
  courseUpdates: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  emailNotifications: Scalars['Boolean']['output'];
  eventReminders: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  interfaceLanguage: AppLanguage;
  loginAlerts: Scalars['Boolean']['output'];
  messages: Scalars['Boolean']['output'];
  profileVisibility: ProfileVisibility;
  pushNotifications: Scalars['Boolean']['output'];
  showCertificates: Scalars['Boolean']['output'];
  showEmail: Scalars['Boolean']['output'];
  showLearningProgress: Scalars['Boolean']['output'];
  theme: Theme;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ProfessionalTaxonomyGroup = {
  __typename?: 'ProfessionalTaxonomyGroup';
  groupKey: Scalars['String']['output'];
  groupLabel: Scalars['String']['output'];
  kind: ProfileTaxonomyKind;
  terms: Array<ProfessionalTaxonomyTerm>;
};

export type ProfessionalTaxonomyTerm = {
  __typename?: 'ProfessionalTaxonomyTerm';
  groupKey: Scalars['String']['output'];
  groupLabel: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  kind: ProfileTaxonomyKind;
  label: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export enum ProfileSectionKey {
  BasicProfile = 'BASIC_PROFILE',
  Certifications = 'CERTIFICATIONS',
  Preferences = 'PREFERENCES',
  ProfessionalDetails = 'PROFESSIONAL_DETAILS',
  SkillsInterests = 'SKILLS_INTERESTS'
}

export enum ProfileTaxonomyKind {
  Role = 'ROLE',
  SkillArea = 'SKILL_AREA',
  Subject = 'SUBJECT'
}

export enum ProfileVisibility {
  FollowersOnly = 'FOLLOWERS_ONLY',
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type PromotionRequest = {
  __typename?: 'PromotionRequest';
  budget?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventId: Scalars['ID']['output'];
  eventTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  promotionType: PromotionType;
  providerId: Scalars['ID']['output'];
  rejectReason?: Maybe<Scalars['String']['output']>;
  status: PromotionRequestStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PromotionRequestStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum PromotionType {
  ComboPackage = 'COMBO_PACKAGE',
  EmailCampaign = 'EMAIL_CAMPAIGN',
  FeaturedListing = 'FEATURED_LISTING',
  SocialMediaBoost = 'SOCIAL_MEDIA_BOOST'
}

export type ProviderAnalytics = {
  __typename?: 'ProviderAnalytics';
  avgFeePerAttendee: Scalars['Float']['output'];
  avgRating: Scalars['Float']['output'];
  conversionRate: Scalars['Float']['output'];
  eventTypeBreakdown: Array<ProviderBreakdownPoint>;
  pdusByCategory: Array<ProviderBreakdownPoint>;
  registrationsOverTime: Array<ProviderTimeSeriesPoint>;
  topPerformingEvents: Array<ProviderTopEvent>;
  totalRevenue: Scalars['Float']['output'];
};

export type ProviderAttendee = {
  __typename?: 'ProviderAttendee';
  attendedAt?: Maybe<Scalars['DateTime']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['ID']['output'];
  eventTitle: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  registrationDate: Scalars['DateTime']['output'];
  registrationId: Scalars['ID']['output'];
  status: EventRegistrationStatus;
  userId: Scalars['ID']['output'];
};

export type ProviderAttendeeStats = {
  __typename?: 'ProviderAttendeeStats';
  attendanceRate: Scalars['Float']['output'];
  attended: Scalars['Int']['output'];
  confirmed: Scalars['Int']['output'];
  totalRegistered: Scalars['Int']['output'];
};

export type ProviderAttendeesFilterInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventRegistrationStatus>;
};

export type ProviderAttendeesStats = {
  __typename?: 'ProviderAttendeesStats';
  attendanceRate: Scalars['Float']['output'];
  attended: Scalars['Int']['output'];
  confirmed: Scalars['Int']['output'];
  totalRegistered: Scalars['Int']['output'];
};

export type ProviderBreakdownPoint = {
  __typename?: 'ProviderBreakdownPoint';
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  value?: Maybe<Scalars['Float']['output']>;
};

export type ProviderDashboardPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum ProviderDashboardRange {
  Last_7Days = 'LAST_7_DAYS',
  Last_30Days = 'LAST_30_DAYS',
  Last_90Days = 'LAST_90_DAYS',
  ThisYear = 'THIS_YEAR'
}

export type ProviderDashboardRangeInput = {
  range?: InputMaybe<ProviderDashboardRange>;
};

export type ProviderEventTableRow = {
  __typename?: 'ProviderEventTableRow';
  id: Scalars['ID']['output'];
  pdu: Scalars['Float']['output'];
  registrants: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
  status: EventStatus;
  title: Scalars['String']['output'];
  views: Scalars['Int']['output'];
};

export type ProviderEventsFilterInput = {
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventStatus>;
};

export type ProviderOverview = {
  __typename?: 'ProviderOverview';
  conversionRate: Scalars['Float']['output'];
  providerName?: Maybe<Scalars['String']['output']>;
  statusBreakdown: ProviderStatusBreakdown;
  totalEvents: Scalars['Int']['output'];
  totalRegistrations: Scalars['Int']['output'];
  totalViews: Scalars['Int']['output'];
  upcomingSessions: Scalars['Int']['output'];
};

export type ProviderPageInfo = {
  __typename?: 'ProviderPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type ProviderProfile = {
  __typename?: 'ProviderProfile';
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isPremium: Scalars['Boolean']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type ProviderPromotionFilterInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  promotionType?: InputMaybe<PromotionType>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PromotionRequestStatus>;
};

export type ProviderSettings = {
  __typename?: 'ProviderSettings';
  aboutOrganization?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  eventReminderEnabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  newRegistrationAlertEnabled: Scalars['Boolean']['output'];
  organizationName?: Maybe<Scalars['String']['output']>;
  organizationProfile?: Maybe<Scalars['String']['output']>;
  providerId: Scalars['ID']['output'];
  reminderHoursBeforeEvent: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProviderStatusBreakdown = {
  __typename?: 'ProviderStatusBreakdown';
  archived: Scalars['Int']['output'];
  cancelled: Scalars['Int']['output'];
  draft: Scalars['Int']['output'];
  published: Scalars['Int']['output'];
};

export type ProviderTimeSeriesPoint = {
  __typename?: 'ProviderTimeSeriesPoint';
  date: Scalars['String']['output'];
  registrations: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type ProviderTopEvent = {
  __typename?: 'ProviderTopEvent';
  conversionRate: Scalars['Float']['output'];
  eventId: Scalars['String']['output'];
  registrations: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  views: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
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
  professionalCertificateIssuers: Array<Scalars['String']['output']>;
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
  requestId: Scalars['String']['input'];
};


export type QueryAdminOrgAccessRequestsArgs = {
  filter?: InputMaybe<AdminOrgAccessRequestFilter>;
  pagination?: InputMaybe<AdminPagination>;
};


export type QueryAdminOrganizationDetailArgs = {
  organizationId: Scalars['String']['input'];
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
  mode?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminUsersArgs = {
  filter?: InputMaybe<AdminUserFilter>;
  pagination?: InputMaybe<AdminPagination>;
};


export type QueryCertificationSearchArgs = {
  input: CertificationSearchInput;
};


export type QueryContentReviewsArgs = {
  contentId: Scalars['String']['input'];
  contentType: ContentType;
};


export type QueryCourseByIdArgs = {
  courseId: Scalars['String']['input'];
};


export type QueryCourseBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryCoursesArgs = {
  filter?: InputMaybe<CourseFilterInput>;
  pagination?: InputMaybe<CoursePaginationInput>;
  sort?: InputMaybe<CourseSortInput>;
};


export type QueryCpdPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type QueryCpdPlanProgressArgs = {
  planId: Scalars['ID']['input'];
};


export type QueryEventByIdArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryEventBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  filter?: InputMaybe<EventFilterInput>;
  pagination?: InputMaybe<EventPaginationInput>;
  sort?: InputMaybe<EventSortInput>;
};


export type QueryFeaturedCoursesArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFeaturedEventsArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFeaturedPodcastsArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFeaturedYouTubeChannelsArgs = {
  take?: InputMaybe<Scalars['Int']['input']>;
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
  contentId: Scalars['String']['input'];
  contentType: ContentType;
};


export type QueryMyWishlistArgs = {
  input?: InputMaybe<MyWishlistInput>;
};


export type QueryOrganizationAccessRequestByIdArgs = {
  requestId: Scalars['String']['input'];
};


export type QueryOrganizationAccessRequestsArgs = {
  filter?: InputMaybe<OrganizationAccessRequestFilterInput>;
  pagination?: InputMaybe<OrganizationAccessRequestPaginationInput>;
};


export type QueryOrganizationActivationStatusArgs = {
  token: Scalars['String']['input'];
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
  year?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrganizationEventCatalogArgs = {
  filter?: InputMaybe<EventCatalogFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
};


export type QueryOrganizationMemberDetailArgs = {
  memberId: Scalars['String']['input'];
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
  podcastId: Scalars['String']['input'];
};


export type QueryPodcastBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryPodcastEpisodesArgs = {
  podcastId: Scalars['String']['input'];
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
  id: Scalars['ID']['input'];
};


export type QueryProfessionalCertificatesArgs = {
  cpdPlanId?: InputMaybe<Scalars['ID']['input']>;
  filter?: InputMaybe<ProfessionalSearchInput>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
  sort?: InputMaybe<CertificateSort>;
  status?: InputMaybe<CertificateStatusFilter>;
  unlinkedOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryProfessionalContentCompletionArgs = {
  contentId: Scalars['ID']['input'];
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
  activityId: Scalars['ID']['input'];
};


export type QueryProfessionalPduReportArgs = {
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProfessionalProfileTaxonomyArgs = {
  kind?: InputMaybe<ProfileTaxonomyKind>;
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
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserByIdArgs = {
  userId: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilterInput>;
  pagination?: InputMaybe<UserPaginationInput>;
};


export type QueryYoutubeChannelByIdArgs = {
  channelId: Scalars['String']['input'];
};


export type QueryYoutubeChannelBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryYoutubeChannelsArgs = {
  filter?: InputMaybe<YouTubeChannelFilterInput>;
  pagination?: InputMaybe<YouTubeChannelPaginationInput>;
  sort?: InputMaybe<YouTubeChannelSortInput>;
};


export type QueryYoutubeVideosArgs = {
  channelId: Scalars['String']['input'];
};

export type RegisterInput = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: AuthRegisterRole;
};

export type RejectAdminOrgAccessRequestInput = {
  reason: Scalars['String']['input'];
  requestId: Scalars['String']['input'];
};

export type RequestEmailChangeInput = {
  newEmail: Scalars['String']['input'];
};

export type ResendEmailOtpInput = {
  email: Scalars['String']['input'];
};

export type ResendOrganizationActivationInput = {
  email: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  code: Scalars['String']['input'];
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export enum RoadmapEnrollmentStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Unenrolled = 'UNENROLLED'
}

export enum RoadmapStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export enum Role {
  Admin = 'ADMIN',
  Organization = 'ORGANIZATION',
  Professional = 'PROFESSIONAL',
  Provider = 'PROVIDER'
}

export enum SessionStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  Revoked = 'REVOKED'
}

export type SetCertificateCpdPlanInput = {
  certificateId: Scalars['ID']['input'];
  cpdPlanId?: InputMaybe<Scalars['ID']['input']>;
};

export enum SkillLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SubmitContactInquiryInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  idempotencyKey?: InputMaybe<Scalars['String']['input']>;
  inquiryType: ContactInquiryType;
  message: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
};

export type SubmitContactInquiryPayload = {
  __typename?: 'SubmitContactInquiryPayload';
  code: Scalars['String']['output'];
  referenceId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type SubmitContentReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  contentId: Scalars['String']['input'];
  contentType: ContentType;
  rating: Scalars['Int']['input'];
};

export type SubmitOrganizationAccessRequestInput = {
  country: Scalars['String']['input'];
  expectedLicensedProfessionals: Scalars['Int']['input'];
  goals: Scalars['String']['input'];
  organizationName: Scalars['String']['input'];
  organizationType: OrganizationType;
  representativeFullName: Scalars['String']['input'];
  representativeJobRole: Scalars['String']['input'];
  workEmail: Scalars['String']['input'];
};

export type SubmitPromotionRequestInput = {
  budget?: InputMaybe<Scalars['Float']['input']>;
  eventId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  promotionType: PromotionType;
};

export enum Theme {
  Dark = 'DARK',
  Light = 'LIGHT',
  System = 'SYSTEM'
}

export type UpdateAdminOrgMember = {
  completedLearning?: InputMaybe<Scalars['Int']['input']>;
  compliance?: InputMaybe<Scalars['Float']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  jobRole?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['ID']['input'];
  pdus?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type UpdateAdminOrgSettings = {
  assignmentNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  complianceAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  complianceCycle?: InputMaybe<ComplianceCycle>;
  minimumPdu?: InputMaybe<Scalars['Float']['input']>;
  organizationId: Scalars['String']['input'];
  strictCompliance?: InputMaybe<Scalars['Boolean']['input']>;
  weeklySummaryReport?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateAdminProfile = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAdminUserStatus = {
  status: UserStatus;
  userId: Scalars['String']['input'];
};

export type UpdateCertificateInput = {
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  issueDate: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  title: Scalars['String']['input'];
  validUntil: Scalars['String']['input'];
};

export type UpdateCourseInput = {
  category?: InputMaybe<CourseCategory>;
  courseId: Scalars['ID']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  learnings?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<CourseLevel>;
  price?: InputMaybe<Scalars['Float']['input']>;
  requirements?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<CourseStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCpdPlanInput = {
  allowDuplicate?: InputMaybe<Scalars['Boolean']['input']>;
  categories?: InputMaybe<Array<CpdPlanCategoryInput>>;
  certificationId?: InputMaybe<Scalars['ID']['input']>;
  certificationName: Scalars['String']['input'];
  creditType: CreditType;
  evidenceOtherNote?: InputMaybe<Scalars['String']['input']>;
  evidenceTypes: Array<CpdEvidenceType>;
  id: Scalars['ID']['input'];
  initialCompletedCredits?: InputMaybe<Scalars['Float']['input']>;
  organization: Scalars['String']['input'];
  preferredFormats?: InputMaybe<Array<LearningFormat>>;
  reminderTiming?: InputMaybe<CpdReminderTiming>;
  remindersEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  reportRecipientLabel?: InputMaybe<Scalars['String']['input']>;
  reportRecipientType: CpdReportRecipientType;
  reportingEnd: Scalars['String']['input'];
  reportingStart: Scalars['String']['input'];
  timeAvailable?: InputMaybe<LearningTimeCommitment>;
  totalRequiredCredits: Scalars['Float']['input'];
};

export type UpdateEnrollmentProgressInput = {
  contentId: Scalars['String']['input'];
  contentType: ContentType;
  progress: Scalars['Int']['input'];
};

export type UpdateEventInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<EventCategory>;
  currency?: InputMaybe<Scalars['String']['input']>;
  deliveryMode?: InputMaybe<EventDeliveryMode>;
  description?: InputMaybe<Scalars['String']['input']>;
  earlyBirdDiscount?: InputMaybe<Scalars['Float']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventId: Scalars['ID']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFree?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<AppLanguage>;
  location?: InputMaybe<Scalars['String']['input']>;
  onlineUrl?: InputMaybe<Scalars['String']['input']>;
  organizer?: InputMaybe<Scalars['String']['input']>;
  pdu?: InputMaybe<Scalars['Float']['input']>;
  pduCategory?: InputMaybe<PduCategory>;
  price?: InputMaybe<Scalars['Float']['input']>;
  promotionVideoUrl?: InputMaybe<Scalars['String']['input']>;
  registrationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  speaker?: InputMaybe<Scalars['String']['input']>;
  specificTopic?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<EventStatus>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<EventType>;
};

export type UpdateMeInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationAssignmentInput = {
  assignmentId: Scalars['String']['input'];
  courseId?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AssignmentStatus>;
  targetKind?: InputMaybe<AssignmentTargetKind>;
  targetMemberId?: InputMaybe<Scalars['String']['input']>;
  targetRole?: InputMaybe<Role>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<AssignmentType>;
};

export type UpdateOrganizationCpdCategoryInput = {
  category?: InputMaybe<PduCategory>;
  categoryId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  requiredHours?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationDepartmentInput = {
  departmentId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationMemberInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  jobRole?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  role?: InputMaybe<Role>;
  status?: InputMaybe<OrganizationMemberStatus>;
};

export type UpdateOrganizationMemberNotesInput = {
  memberId: Scalars['String']['input'];
  notes: Scalars['String']['input'];
};

export type UpdateOrganizationSettingsInput = {
  assignmentNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  complianceAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  complianceCycle?: InputMaybe<ComplianceCycle>;
  minimumPdu?: InputMaybe<Scalars['Float']['input']>;
  strictCompliance?: InputMaybe<Scalars['Boolean']['input']>;
  weeklySummaryReport?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdatePduActivityInput = {
  activityId: Scalars['ID']['input'];
  category?: InputMaybe<PduCategory>;
  completionStatus?: InputMaybe<PduCompletionStatus>;
  contentId?: InputMaybe<Scalars['String']['input']>;
  contentType?: InputMaybe<ContentType>;
  creditType?: InputMaybe<CreditType>;
  date?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  evidenceNote?: InputMaybe<Scalars['String']['input']>;
  evidenceUrl?: InputMaybe<Scalars['String']['input']>;
  issuingOrganization?: InputMaybe<Scalars['String']['input']>;
  learningOutcome?: InputMaybe<Scalars['String']['input']>;
  pdus?: InputMaybe<Scalars['Float']['input']>;
  providerOrganizer?: InputMaybe<Scalars['String']['input']>;
  relatedCertification?: InputMaybe<Scalars['String']['input']>;
  reportingYear?: InputMaybe<Scalars['Int']['input']>;
  source?: InputMaybe<PduSource>;
  status?: InputMaybe<PduStatus>;
  subCategory?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePodcastEpisodeInput = {
  audioUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  episodeId: Scalars['ID']['input'];
  episodeNumber?: InputMaybe<Scalars['Int']['input']>;
  podcastId?: InputMaybe<Scalars['ID']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePodcastInput = {
  category?: InputMaybe<PodcastCategory>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  host?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  podcastId: Scalars['ID']['input'];
  rating?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<PodcastStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfessionalBasicProfileInput = {
  countryCode?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  language?: InputMaybe<AppLanguage>;
  linkedInUrl?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfessionalCredentialInput = {
  annualCpdHours?: InputMaybe<Scalars['Float']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  issueDate: Scalars['String']['input'];
  issuingOrganization: Scalars['String']['input'];
  licenceNumber?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pduTargetId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfessionalDetailsInput = {
  currentRole?: InputMaybe<Scalars['String']['input']>;
  experienceRange?: InputMaybe<ExperienceRange>;
  industry?: InputMaybe<ProfessionalIndustry>;
  profession?: InputMaybe<Scalars['String']['input']>;
  professionalGoal?: InputMaybe<ProfessionalGoal>;
  professionalSummary?: InputMaybe<Scalars['String']['input']>;
  workLocation?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfessionalPreferencesInput = {
  learningBudgetPreference?: InputMaybe<LearningBudgetPreference>;
  learningTimeCommitment?: InputMaybe<LearningTimeCommitment>;
  preferredLearningFormats: Array<LearningFormat>;
};

export type UpdateProfessionalSettingsInput = {
  courseUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  eventReminders?: InputMaybe<Scalars['Boolean']['input']>;
  interfaceLanguage?: InputMaybe<AppLanguage>;
  loginAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  messages?: InputMaybe<Scalars['Boolean']['input']>;
  profileVisibility?: InputMaybe<ProfileVisibility>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  showCertificates?: InputMaybe<Scalars['Boolean']['input']>;
  showEmail?: InputMaybe<Scalars['Boolean']['input']>;
  showLearningProgress?: InputMaybe<Scalars['Boolean']['input']>;
  theme?: InputMaybe<Theme>;
};

export type UpdateProfessionalSkillsInput = {
  currentSkillLevel?: InputMaybe<SkillLevel>;
  favoriteSubjectIds: Array<Scalars['ID']['input']>;
  mainSkillAreaIds: Array<Scalars['ID']['input']>;
  skillsToImproveIds: Array<Scalars['ID']['input']>;
  targetSkillLevel?: InputMaybe<SkillLevel>;
};

export type UpdateProviderSettingsInput = {
  aboutOrganization?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  eventReminderEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  newRegistrationAlertEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  organizationName?: InputMaybe<Scalars['String']['input']>;
  organizationProfile?: InputMaybe<Scalars['String']['input']>;
  reminderHoursBeforeEvent?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateUserInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  status?: InputMaybe<UserStatus>;
  userId: Scalars['String']['input'];
};

export type UpdateUserStatusInput = {
  status: UserStatus;
  userId: Scalars['String']['input'];
};

export type UpdateYouTubeChannelInput = {
  category?: InputMaybe<YouTubeCategory>;
  channelId: Scalars['ID']['input'];
  channelUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<YouTubeChannelStatus>;
  subscribers?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateYouTubeVideoInput = {
  channelId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  likes?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<YouTubeVideoStatus>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  videoId: Scalars['ID']['input'];
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  views?: InputMaybe<Scalars['Int']['input']>;
};

export type UpsertPduTargetInput = {
  category: PduCategory;
  target: Scalars['Float']['input'];
  year: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  organizationProfile?: Maybe<OrganizationProfile>;
  phone?: Maybe<Scalars['String']['output']>;
  phoneVerifiedAt?: Maybe<Scalars['DateTime']['output']>;
  professionalProfile?: Maybe<ProfessionalProfile>;
  providerProfile?: Maybe<ProviderProfile>;
  role: Role;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserFilterInput = {
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UserStatus>;
};

export type UserPageInfo = {
  __typename?: 'UserPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type UserPaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export enum UserStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Disabled = 'DISABLED',
  Pending = 'PENDING'
}

export type VerifyEmailChangeInput = {
  code: Scalars['String']['input'];
  newEmail: Scalars['String']['input'];
};

export type VerifyEmailOtpInput = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type WishlistContent = {
  __typename?: 'WishlistContent';
  category?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFree: Scalars['Boolean']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  providerName?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type WishlistItem = {
  __typename?: 'WishlistItem';
  content?: Maybe<WishlistContent>;
  contentId: Scalars['String']['output'];
  contentType: ContentType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export enum WishlistPriceFilter {
  Free = 'FREE',
  Paid = 'PAID'
}

export enum WishlistSortBy {
  Newest = 'NEWEST',
  Oldest = 'OLDEST',
  PriceAsc = 'PRICE_ASC',
  PriceDesc = 'PRICE_DESC',
  RatingDesc = 'RATING_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC'
}

export enum YouTubeCategory {
  Ai = 'AI',
  Business = 'BUSINESS',
  Career = 'CAREER',
  Compliance = 'COMPLIANCE',
  Cpd = 'CPD',
  Data = 'DATA',
  Design = 'DESIGN',
  Education = 'EDUCATION',
  Engineering = 'ENGINEERING',
  Finance = 'FINANCE',
  Healthcare = 'HEALTHCARE',
  Leadership = 'LEADERSHIP',
  Marketing = 'MARKETING',
  Other = 'OTHER',
  Technology = 'TECHNOLOGY'
}

export type YouTubeChannel = {
  __typename?: 'YouTubeChannel';
  category: YouTubeCategory;
  channelUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isFeatured: Scalars['Boolean']['output'];
  provider?: Maybe<Scalars['String']['output']>;
  providerId?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Float']['output'];
  ratingCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  status: YouTubeChannelStatus;
  subscribers: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  videoCount: Scalars['Int']['output'];
  views: Scalars['Int']['output'];
};

export type YouTubeChannelFilterInput = {
  category?: InputMaybe<YouTubeCategory>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<YouTubeChannelStatus>;
};

export type YouTubeChannelPageInfo = {
  __typename?: 'YouTubeChannelPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export type YouTubeChannelPaginationInput = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export enum YouTubeChannelSortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum YouTubeChannelSortField {
  CreatedAt = 'CREATED_AT',
  Subscribers = 'SUBSCRIBERS',
  Title = 'TITLE',
  UpdatedAt = 'UPDATED_AT',
  VideoCount = 'VIDEO_COUNT',
  Views = 'VIEWS'
}

export type YouTubeChannelSortInput = {
  direction?: InputMaybe<YouTubeChannelSortDirection>;
  field?: InputMaybe<YouTubeChannelSortField>;
};

export enum YouTubeChannelStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type YouTubeVideo = {
  __typename?: 'YouTubeVideo';
  channelId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  likes: Scalars['Int']['output'];
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  status: YouTubeVideoStatus;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
  views: Scalars['Int']['output'];
};

export enum YouTubeVideoStatus {
  Archived = 'ARCHIVED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type AdminDashboardPageInfoFieldsFragment = { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type AdminDashboardProfileFieldsFragment = { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string };

export type AdminProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminProfileQuery = { __typename?: 'Query', adminProfile: { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string } };

export type UpdateAdminProfileMutationVariables = Exact<{
  input: UpdateAdminProfile;
}>;


export type UpdateAdminProfileMutation = { __typename?: 'Mutation', updateAdminProfile: { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string } };

export type AdminDashboardRequestTrendPointFieldsFragment = { __typename?: 'AdminRequestTrendPoint', date: string, count: number };

export type AdminDashboardOverviewFieldsFragment = { __typename?: 'AdminDashboardOverview', totalRequests: number, pendingRequests: number, approvedRequests: number, rejectedRequests: number, requestTrend: Array<{ __typename?: 'AdminRequestTrendPoint', date: string, count: number }> };

export type AdminDashboardOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardOverviewQuery = { __typename?: 'Query', adminDashboardOverview: { __typename?: 'AdminDashboardOverview', totalRequests: number, pendingRequests: number, approvedRequests: number, rejectedRequests: number, requestTrend: Array<{ __typename?: 'AdminRequestTrendPoint', date: string, count: number }> } };

export type AdminDashboardOrgFieldsFragment = { __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number };

export type AdminDashboardPaginatedOrganizationsFieldsFragment = { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> };

export type AdminDashboardOrgMemberFieldsFragment = { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, status: OrganizationMemberStatus, userId: string, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type AdminDashboardOrgDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string };

export type AdminDashboardOrgDetailFieldsFragment = { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, totalPdus: number, ownerName?: string | null, updatedAt: string, createdAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> };

export type AdminDashboardOrganizationSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type AdminOrganizationsQueryVariables = Exact<{
  filter?: InputMaybe<AdminOrgFilter>;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminOrganizationsQuery = { __typename?: 'Query', adminOrganizations: { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> } };

export type AdminOrganizationMembersQueryVariables = Exact<{
  filter: AdminOrgMemberFilter;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminOrganizationMembersQuery = { __typename?: 'Query', adminOrganizationMembers: { __typename?: 'PaginatedAdminOrgMembers', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, status: OrganizationMemberStatus, userId: string, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type AdminOrganizationDetailQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type AdminOrganizationDetailQuery = { __typename?: 'Query', adminOrganizationDetail: { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, totalPdus: number, ownerName?: string | null, updatedAt: string, createdAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> } };

export type UpdateAdminOrganizationSettingsMutationVariables = Exact<{
  input: UpdateAdminOrgSettings;
}>;


export type UpdateAdminOrganizationSettingsMutation = { __typename?: 'Mutation', updateAdminOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type AdminDashboardOrgAccessRequestFieldsFragment = { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null };

export type AdminDashboardPaginatedOrgAccessRequestsFieldsFragment = { __typename?: 'PaginatedAdminOrgAccessRequests', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null }> };

export type AdminOrgAccessRequestsQueryVariables = Exact<{
  filter?: InputMaybe<AdminOrgAccessRequestFilter>;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminOrgAccessRequestsQuery = { __typename?: 'Query', adminOrgAccessRequests: { __typename?: 'PaginatedAdminOrgAccessRequests', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null }> } };

export type AdminOrgAccessRequestDetailQueryVariables = Exact<{
  requestId: Scalars['String']['input'];
}>;


export type AdminOrgAccessRequestDetailQuery = { __typename?: 'Query', adminOrgAccessRequestDetail: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type ApproveAdminOrgAccessRequestMutationVariables = Exact<{
  requestId: Scalars['String']['input'];
}>;


export type ApproveAdminOrgAccessRequestMutation = { __typename?: 'Mutation', approveAdminOrgAccessRequest: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type RejectAdminOrgAccessRequestMutationVariables = Exact<{
  input: RejectAdminOrgAccessRequestInput;
}>;


export type RejectAdminOrgAccessRequestMutation = { __typename?: 'Mutation', rejectAdminOrgAccessRequest: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type ResendAdminOrgAccessRequestNotificationMutationVariables = Exact<{
  requestId: Scalars['String']['input'];
}>;


export type ResendAdminOrgAccessRequestNotificationMutation = { __typename?: 'Mutation', resendAdminOrgAccessRequestNotification: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type AdminDashboardUserFieldsFragment = { __typename?: 'AdminUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null };

export type AdminDashboardPaginatedUsersFieldsFragment = { __typename?: 'PaginatedAdminUser', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null }> };

export type AdminDashboardUserGrowthPointFieldsFragment = { __typename?: 'AdminChartPoint', date?: string | null, label: string, total: number, providers: number, professionals: number };

export type AdminUsersQueryVariables = Exact<{
  filter?: InputMaybe<AdminUserFilter>;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminUsersQuery = { __typename?: 'Query', adminUsers: { __typename?: 'PaginatedAdminUser', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null }> } };

export type AdminUserGrowthQueryVariables = Exact<{
  mode?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminUserGrowthQuery = { __typename?: 'Query', adminUserGrowth: Array<{ __typename?: 'AdminChartPoint', date?: string | null, label: string, total: number, providers: number, professionals: number }> };

export type UpdateAdminUserStatusMutationVariables = Exact<{
  input: UpdateAdminUserStatus;
}>;


export type UpdateAdminUserStatusMutation = { __typename?: 'Mutation', updateAdminUserStatus: { __typename?: 'AdminUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null } };

export type AdminDashboardAuditLogFieldsFragment = { __typename?: 'AdminAuditLog', id: string, action: AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null };

export type AdminDashboardPaginatedAuditLogsFieldsFragment = { __typename?: 'PaginatedAdminAuditLogs', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminAuditLog', id: string, action: AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null }> };

export type AdminAuditLogsQueryVariables = Exact<{
  filter?: InputMaybe<AdminAuditLogFilter>;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminAuditLogsQuery = { __typename?: 'Query', adminAuditLogs: { __typename?: 'PaginatedAdminAuditLogs', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminAuditLog', id: string, action: AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null }> } };

export type AdminOrgUsersPageInfoFieldsFragment = { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type AdminOrgUsersOrgFieldsFragment = { __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number };

export type AdminOrgUsersPaginatedOrgsFieldsFragment = { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> };

export type AdminOrgUsersMemberFieldsFragment = { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type AdminOrgUsersPaginatedMembersFieldsFragment = { __typename?: 'PaginatedAdminOrgMembers', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type AdminOrgUsersSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type AdminOrgUsersDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string };

export type AdminOrgUsersDetailFieldsFragment = { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string }>, members: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type AdminOrganizationUsersQueryVariables = Exact<{
  filter?: InputMaybe<AdminOrgFilter>;
  pagination?: InputMaybe<AdminPagination>;
}>;


export type AdminOrganizationUsersQuery = { __typename?: 'Query', adminOrganizations: { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> } };

export type AdminOrganizationUserDetailQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type AdminOrganizationUserDetailQuery = { __typename?: 'Query', adminOrganizationDetail: { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string }>, members: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type UpdateAdminOrganizationMemberMutationVariables = Exact<{
  input: UpdateAdminOrgMember;
}>;


export type UpdateAdminOrganizationMemberMutation = { __typename?: 'Mutation', updateAdminOrganizationMember: { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type RemoveAdminOrganizationMemberMutationVariables = Exact<{
  memberId: Scalars['String']['input'];
}>;


export type RemoveAdminOrganizationMemberMutation = { __typename?: 'Mutation', removeAdminOrganizationMember: { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type UpdateAdminOrganizationSettingsForUsersMutationVariables = Exact<{
  input: UpdateAdminOrgSettings;
}>;


export type UpdateAdminOrganizationSettingsForUsersMutation = { __typename?: 'Mutation', updateAdminOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type OrganizationAccessRequestsQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationAccessRequestFilterInput>;
  pagination?: InputMaybe<OrganizationAccessRequestPaginationInput>;
}>;


export type OrganizationAccessRequestsQuery = { __typename?: 'Query', organizationAccessRequests: { __typename?: 'PaginatedOrganizationAccessRequests', items: Array<{ __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, createdAt: string, updatedAt: string, workEmail: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationType: OrganizationType, organizationName: string, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number }>, pageInfo: { __typename?: 'OrganizationAccessRequestPageInfo', page: number, limit: number, totalPages: number, totalItems: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type OrganizationAccessRequestByIdQueryVariables = Exact<{
  requestId: Scalars['String']['input'];
}>;


export type OrganizationAccessRequestByIdQuery = { __typename?: 'Query', organizationAccessRequestById: { __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number } };

export type UsersQueryVariables = Exact<{
  filter?: InputMaybe<UserFilterInput>;
  pagination?: InputMaybe<UserPaginationInput>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'PaginatedUsers', items: Array<{ __typename?: 'User', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null }>, pageInfo: { __typename?: 'UserPageInfo', page: number, limit: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type UserByIdQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type UserByIdQuery = { __typename?: 'Query', userById: { __typename?: 'User', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null, professionalProfile?: { __typename?: 'ProfessionalProfile', id: string, skills: Array<string>, userId: string, industry?: ProfessionalIndustry | null, interests: Array<string>, createdAt: string, updatedAt: string, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null } | null, providerProfile?: { __typename?: 'ProviderProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, updatedAt: string, createdAt: string, isPremium: boolean, contactEmail?: string | null, contactPhone?: string | null, organizationName?: string | null } | null, organizationProfile?: { __typename?: 'OrganizationProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, country?: string | null, industry?: string | null, timezone?: string | null, createdAt: string, updatedAt: string, memberLimit?: number | null, contactEmail?: string | null, contactPhone?: string | null, organizationName: string } | null } };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, lastName?: string | null, avatarUrl?: string | null, firstName?: string | null, updatedAt: string } };

export type UpdateUserStatusMutationVariables = Exact<{
  input: UpdateUserStatusInput;
}>;


export type UpdateUserStatusMutation = { __typename?: 'Mutation', updateUserStatus: { __typename?: 'User', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, updatedAt: string } };

export type DeleteUserMutationVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, deletedAt?: string | null } };

export type RestoreUserMutationVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type RestoreUserMutation = { __typename?: 'Mutation', restoreUser: { __typename?: 'User', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, deletedAt?: string | null } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', success: boolean, code: string, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type VerifyEmailOtpMutationVariables = Exact<{
  input: VerifyEmailOtpInput;
}>;


export type VerifyEmailOtpMutation = { __typename?: 'Mutation', verifyEmailOtp: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type ResendEmailOtpMutationVariables = Exact<{
  input: ResendEmailOtpInput;
}>;


export type ResendEmailOtpMutation = { __typename?: 'Mutation', resendEmailOtp: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ForgotPasswordMutationVariables = Exact<{
  input: ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type OrganizationActivationStatusQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type OrganizationActivationStatusQuery = { __typename?: 'Query', organizationActivationStatus: { __typename?: 'OrganizationActivationStatus', status: OrganizationActivationTokenStatus, organizationName?: string | null } };

export type ActivateOrganizationAccountMutationVariables = Exact<{
  input: ActivateOrganizationAccountInput;
}>;


export type ActivateOrganizationAccountMutation = { __typename?: 'Mutation', activateOrganizationAccount: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ResendOrganizationActivationMutationVariables = Exact<{
  input: ResendOrganizationActivationInput;
}>;


export type ResendOrganizationActivationMutation = { __typename?: 'Mutation', resendOrganizationActivation: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, bio?: string | null, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type RequestEmailChangeMutationVariables = Exact<{
  input: RequestEmailChangeInput;
}>;


export type RequestEmailChangeMutation = { __typename?: 'Mutation', requestEmailChange: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };

export type VerifyEmailChangeMutationVariables = Exact<{
  input: VerifyEmailChangeInput;
}>;


export type VerifyEmailChangeMutation = { __typename?: 'Mutation', verifyEmailChange: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Role, email?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type GoogleOAuthUrlQueryVariables = Exact<{
  role: Role;
}>;


export type GoogleOAuthUrlQuery = { __typename?: 'Query', googleOAuthUrl: { __typename?: 'AuthUrl', url: string } };

export type LinkedInOAuthUrlQueryVariables = Exact<{
  role: Role;
}>;


export type LinkedInOAuthUrlQuery = { __typename?: 'Query', linkedinOAuthUrl: { __typename?: 'AuthUrl', url: string } };

export type ContentActionPayloadFieldsFragment = { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null };

export type WishlistContentFieldsFragment = { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null };

export type WishlistItemFieldsFragment = { __typename?: 'WishlistItem', id: string, userId: string, contentId: string, createdAt: string, contentType: ContentType, content?: { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null } | null };

export type MyWishlistQueryVariables = Exact<{
  input?: InputMaybe<MyWishlistInput>;
}>;


export type MyWishlistQuery = { __typename?: 'Query', myWishlist: { __typename?: 'PaginatedWishlist', page: number, limit: number, totalCount: number, categories: Array<string>, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean, items: Array<{ __typename?: 'WishlistItem', id: string, userId: string, contentId: string, createdAt: string, contentType: ContentType, content?: { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null } | null }> } };

export type ToggleWishlistMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type ToggleWishlistMutation = { __typename?: 'Mutation', toggleWishlist: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type ContentEnrollmentFieldsFragment = { __typename?: 'ContentEnrollment', id: string, userId: string, status: ContentEnrollmentStatus, progress: number, contentId: string, createdAt: string, startedAt: string, updatedAt: string, canceledAt?: string | null, contentType: ContentType, completedAt?: string | null };

export type ContentReviewFieldsFragment = { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType };

export type CartItemFieldsFragment = { __typename?: 'CartItem', id: string, cartId: string, status: CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType, titleSnapshot: string, priceSnapshot: number };

export type CartFieldsFragment = { __typename?: 'Cart', id: string, userId: string, status: CartStatus, createdAt: string, updatedAt: string, items: Array<{ __typename?: 'CartItem', id: string, cartId: string, status: CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType, titleSnapshot: string, priceSnapshot: number }> };

export type MyEnrollmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyEnrollmentsQuery = { __typename?: 'Query', myEnrollments: Array<{ __typename?: 'ContentEnrollment', id: string, userId: string, status: ContentEnrollmentStatus, progress: number, contentId: string, createdAt: string, startedAt: string, updatedAt: string, canceledAt?: string | null, contentType: ContentType, completedAt?: string | null }> };

export type MyCartQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCartQuery = { __typename?: 'Query', myCart?: { __typename?: 'Cart', id: string, userId: string, status: CartStatus, createdAt: string, updatedAt: string, items: Array<{ __typename?: 'CartItem', id: string, cartId: string, status: CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType, titleSnapshot: string, priceSnapshot: number }> } | null };

export type ContentReviewsQueryVariables = Exact<{
  contentType: ContentType;
  contentId: Scalars['String']['input'];
}>;


export type ContentReviewsQuery = { __typename?: 'Query', contentReviews: Array<{ __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType }> };

export type MyReviewForContentQueryVariables = Exact<{
  contentType: ContentType;
  contentId: Scalars['String']['input'];
}>;


export type MyReviewForContentQuery = { __typename?: 'Query', myReviewForContent?: { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType } | null };

export type EnrollContentMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type EnrollContentMutation = { __typename?: 'Mutation', enrollContent: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type CancelContentEnrollmentMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type CancelContentEnrollmentMutation = { __typename?: 'Mutation', cancelContentEnrollment: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type UpdateEnrollmentProgressMutationVariables = Exact<{
  input: UpdateEnrollmentProgressInput;
}>;


export type UpdateEnrollmentProgressMutation = { __typename?: 'Mutation', updateEnrollmentProgress: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type SubmitContentReviewMutationVariables = Exact<{
  input: SubmitContentReviewInput;
}>;


export type SubmitContentReviewMutation = { __typename?: 'Mutation', submitContentReview: { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: ContentType } };

export type DeleteContentReviewMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type DeleteContentReviewMutation = { __typename?: 'Mutation', deleteContentReview: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type AddToCartMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type RemoveFromCartMutationVariables = Exact<{
  input: ContentActionInput;
}>;


export type RemoveFromCartMutation = { __typename?: 'Mutation', removeFromCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type CourseFieldsFragment = { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type CoursePageInfoFieldsFragment = { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type CurriculumLessonFieldsFragment = { __typename?: 'CurriculumLesson', id: string, type: CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null };

export type CurriculumSectionFieldsFragment = { __typename?: 'CurriculumSection', id: string, title: string, order: number, courseId: string, description?: string | null, createdAt: string, updatedAt: string, lessons: Array<{ __typename?: 'CurriculumLesson', id: string, type: CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null }> };

export type CoursesQueryVariables = Exact<{
  filter?: InputMaybe<CourseFilterInput>;
  pagination?: InputMaybe<CoursePaginationInput>;
  sort?: InputMaybe<CourseSortInput>;
}>;


export type CoursesQuery = { __typename?: 'Query', courses: { __typename?: 'PaginatedCourses', totalCount: number, items: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, pageInfo: { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CourseByIdQueryVariables = Exact<{
  courseId: Scalars['String']['input'];
}>;


export type CourseByIdQuery = { __typename?: 'Query', courseById: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CourseBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type CourseBySlugQuery = { __typename?: 'Query', courseBySlug: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, curriculumSections?: Array<{ __typename?: 'CurriculumSection', id: string, title: string, order: number, courseId: string, description?: string | null, createdAt: string, updatedAt: string, lessons: Array<{ __typename?: 'CurriculumLesson', id: string, type: CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null }> }> | null } };

export type FeaturedCoursesQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FeaturedCoursesQuery = { __typename?: 'Query', featuredCourses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type MyProviderCoursesQueryVariables = Exact<{
  filter?: InputMaybe<CourseFilterInput>;
  pagination?: InputMaybe<CoursePaginationInput>;
  sort?: InputMaybe<CourseSortInput>;
}>;


export type MyProviderCoursesQuery = { __typename?: 'Query', myProviderCourses: { __typename?: 'PaginatedCourses', totalCount: number, items: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, pageInfo: { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreateCourseMutationVariables = Exact<{
  input: CreateCourseInput;
}>;


export type CreateCourseMutation = { __typename?: 'Mutation', createCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCourseMutationVariables = Exact<{
  input: UpdateCourseInput;
}>;


export type UpdateCourseMutation = { __typename?: 'Mutation', updateCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type PublishCourseMutationVariables = Exact<{
  courseId: Scalars['String']['input'];
}>;


export type PublishCourseMutation = { __typename?: 'Mutation', publishCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type ArchiveCourseMutationVariables = Exact<{
  courseId: Scalars['String']['input'];
}>;


export type ArchiveCourseMutation = { __typename?: 'Mutation', archiveCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCourseMutationVariables = Exact<{
  courseId: Scalars['String']['input'];
}>;


export type DeleteCourseMutation = { __typename?: 'Mutation', deleteCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type RestoreCourseMutationVariables = Exact<{
  courseId: Scalars['String']['input'];
}>;


export type RestoreCourseMutation = { __typename?: 'Mutation', restoreCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: CourseCategory, level: CourseLevel, status: CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CertificationCategoryFieldsFragment = { __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number };

export type CertificationFieldsFragment = { __typename?: 'Certification', id: string, name: string, abbreviation: string, organization: string, organizationAbbr?: string | null, association?: string | null, creditType: CreditType, renewalCycleLabel: string, renewalCycleMonths?: number | null, totalRequiredCredits: number, suggestedDeadline?: string | null, categories: Array<{ __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number }> };

export type CpdPlanCategoryFieldsFragment = { __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number };

export type CpdPlanFieldsFragment = { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> };

export type CpdCategoryProgressFieldsFragment = { __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean };

export type CpdMissingRequirementFieldsFragment = { __typename?: 'CpdMissingRequirement', code: string, detail?: string | null };

export type CpdPlanProgressFieldsFragment = { __typename?: 'CpdPlanProgress', planId: string, earnedCredits: number, initialCompletedCredits: number, activityCredits: number, totalRequiredCredits: number, remainingCredits: number, progressPercent: number, categoriesMissing: number, evidenceMissing: number, activitiesCounted: number, complianceStatus: string, reportingExpired: boolean, reportingNotStarted: boolean, categories: Array<{ __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean }>, missingRequirements: Array<{ __typename?: 'CpdMissingRequirement', code: string, detail?: string | null }> };

export type CpdReportRecipientOptionFieldsFragment = { __typename?: 'CpdReportRecipientOption', type: CpdReportRecipientType, label: string, description?: string | null };

export type CertificationSearchQueryVariables = Exact<{
  input: CertificationSearchInput;
}>;


export type CertificationSearchQuery = { __typename?: 'Query', certificationSearch: Array<{ __typename?: 'Certification', id: string, name: string, abbreviation: string, organization: string, organizationAbbr?: string | null, association?: string | null, creditType: CreditType, renewalCycleLabel: string, renewalCycleMonths?: number | null, totalRequiredCredits: number, suggestedDeadline?: string | null, categories: Array<{ __typename?: 'CertificationCategory', id: string, name: string, requiredCredits: number, order: number }> }> };

export type MyCpdPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCpdPlansQuery = { __typename?: 'Query', myCpdPlans: Array<{ __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> }> };

export type CpdPlanQueryVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type CpdPlanQuery = { __typename?: 'Query', cpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type CpdPlanProgressQueryVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type CpdPlanProgressQuery = { __typename?: 'Query', cpdPlanProgress: { __typename?: 'CpdPlanProgress', planId: string, earnedCredits: number, initialCompletedCredits: number, activityCredits: number, totalRequiredCredits: number, remainingCredits: number, progressPercent: number, categoriesMissing: number, evidenceMissing: number, activitiesCounted: number, complianceStatus: string, reportingExpired: boolean, reportingNotStarted: boolean, categories: Array<{ __typename?: 'CpdCategoryProgress', id: string, name: string, target: number, completed: number, remaining: number, progress: number, isComplete: boolean }>, missingRequirements: Array<{ __typename?: 'CpdMissingRequirement', code: string, detail?: string | null }> } };

export type CpdReportRecipientsQueryVariables = Exact<{ [key: string]: never; }>;


export type CpdReportRecipientsQuery = { __typename?: 'Query', cpdReportRecipients: Array<{ __typename?: 'CpdReportRecipientOption', type: CpdReportRecipientType, label: string, description?: string | null }> };

export type CreateCpdPlanMutationVariables = Exact<{
  input: CreateCpdPlanInput;
}>;


export type CreateCpdPlanMutation = { __typename?: 'Mutation', createCpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type CreateCpdPlanFromSuggestionMutationVariables = Exact<{
  input: CreateCpdPlanFromSuggestionInput;
}>;


export type CreateCpdPlanFromSuggestionMutation = { __typename?: 'Mutation', createCpdPlanFromSuggestion: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type UpdateCpdPlanMutationVariables = Exact<{
  input: UpdateCpdPlanInput;
}>;


export type UpdateCpdPlanMutation = { __typename?: 'Mutation', updateCpdPlan: { __typename?: 'CpdPlan', id: string, certificationId?: string | null, certificationName: string, organization: string, reportingStart: string, reportingEnd: string, creditType: CreditType, totalRequiredCredits: number, initialCompletedCredits: number, timeAvailable?: LearningTimeCommitment | null, preferredFormats: Array<LearningFormat>, evidenceTypes: Array<CpdEvidenceType>, evidenceOtherNote?: string | null, reportRecipientType: CpdReportRecipientType, reportRecipientLabel?: string | null, remindersEnabled: boolean, reminderTiming?: CpdReminderTiming | null, status: CpdPlanStatus, createdAt: string, updatedAt: string, categories: Array<{ __typename?: 'CpdPlanCategory', id: string, name: string, targetCredits: number, completedCredits: number, order: number }> } };

export type DeleteCpdPlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type DeleteCpdPlanMutation = { __typename?: 'Mutation', deleteCpdPlan: { __typename?: 'ProfessionalActionResponse', id: string } };

export type EventCardFieldsFragment = { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean };

export type EventScheduleItemFieldsFragment = { __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null };

export type EventDetailFieldsFragment = { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null };

export type EventRegistrationFieldsFragment = { __typename?: 'EventRegistration', id: string, userId: string, status: EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null };

export type EventPageInfoFieldsFragment = { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type EventsQueryVariables = Exact<{
  filter?: InputMaybe<EventFilterInput>;
  pagination?: InputMaybe<EventPaginationInput>;
  sort?: InputMaybe<EventSortInput>;
}>;


export type EventsQuery = { __typename?: 'Query', events: { __typename?: 'PaginatedEvents', totalCount: number, items: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }>, pageInfo: { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type EventByIdQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type EventByIdQuery = { __typename?: 'Query', eventById: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type EventBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type EventBySlugQuery = { __typename?: 'Query', eventBySlug: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type UpcomingEventsQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpcomingEventsQuery = { __typename?: 'Query', upcomingEvents: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }> };

export type FeaturedEventsQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FeaturedEventsQuery = { __typename?: 'Query', featuredEvents: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }> };

export type MyProviderEventsQueryVariables = Exact<{
  filter?: InputMaybe<EventFilterInput>;
  pagination?: InputMaybe<EventPaginationInput>;
  sort?: InputMaybe<EventSortInput>;
}>;


export type MyProviderEventsQuery = { __typename?: 'Query', myProviderEvents: { __typename?: 'PaginatedEvents', totalCount: number, items: Array<{ __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean }>, pageInfo: { __typename?: 'EventPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type MyRegisteredEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyRegisteredEventsQuery = { __typename?: 'Query', myRegisteredEvents: Array<{ __typename?: 'EventRegistration', id: string, userId: string, status: EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null }> };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type UpdateEventMutationVariables = Exact<{
  input: UpdateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean, scheduleItems?: Array<{ __typename?: 'EventScheduleItem', id: string, title: string, speaker?: string | null, eventId: string, endTime: string, updatedAt: string, createdAt: string, dayNumber: number, startTime: string, description?: string | null }> | null } };

export type RegisterEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type RegisterEventMutation = { __typename?: 'Mutation', registerEvent: { __typename?: 'EventRegistration', id: string, userId: string, status: EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null } };

export type CancelEventRegistrationMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type CancelEventRegistrationMutation = { __typename?: 'Mutation', cancelEventRegistration: { __typename?: 'EventRegistration', id: string, userId: string, status: EventRegistrationStatus, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, completedAt?: string | null } };

export type PublishEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type PublishEventMutation = { __typename?: 'Mutation', publishEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type ArchiveEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type ArchiveEventMutation = { __typename?: 'Mutation', archiveEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type CancelEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type CancelEventMutation = { __typename?: 'Mutation', cancelEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type DeleteEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type DeleteEventMutation = { __typename?: 'Mutation', deleteEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type RestoreEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type RestoreEventMutation = { __typename?: 'Mutation', restoreEvent: { __typename?: 'Event', id: string, pdu: number, slug: string, type: EventType, title: string, views: number, price?: number | null, status: EventStatus, isFree: boolean, rating: number, speaker?: string | null, endDate?: string | null, timezone: string, imageUrl?: string | null, category: EventCategory, location?: string | null, currency: string, capacity?: number | null, language?: AppLanguage | null, startDate: string, onlineUrl?: string | null, attendees: number, organizer?: string | null, updatedAt: string, deletedAt?: string | null, createdAt: string, providerId?: string | null, description: string, ratingCount: number, pduCategory?: PduCategory | null, deliveryMode: EventDeliveryMode, averageRating: number, specificTopic?: string | null, earlyBirdDiscount?: number | null, promotionVideoUrl?: string | null, registrationEnabled: boolean } };

export type ExternalLearningActivityFieldsFragment = { __typename?: 'ExternalLearningActivity', id: string, title: string, status: ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null };

export type PaginatedExternalLearningFieldsFragment = { __typename?: 'PaginatedExternalLearning', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ExternalLearningActivity', id: string, title: string, status: ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null }> };

export type TrackExternalLearningClickMutationVariables = Exact<{
  input: CreateExternalLearningClickInput;
}>;


export type TrackExternalLearningClickMutation = { __typename?: 'Mutation', trackExternalLearningClick: { __typename?: 'ExternalLearningActivity', id: string, title: string, status: ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null } };

export type MyExternalLearningActivitiesQueryVariables = Exact<{
  filter?: InputMaybe<ExternalLearningFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type MyExternalLearningActivitiesQuery = { __typename?: 'Query', myExternalLearningActivities: { __typename?: 'PaginatedExternalLearning', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ExternalLearningActivity', id: string, title: string, status: ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null }> } };

export type ConfirmExternalLearningMutationVariables = Exact<{
  input: ConfirmExternalLearningInput;
}>;


export type ConfirmExternalLearningMutation = { __typename?: 'Mutation', confirmExternalLearning: { __typename?: 'ExternalLearningActivity', id: string, title: string, status: ExternalLearningStatus, userId: string, eventId?: string | null, courseId?: string | null, provider: ExternalLearningProvider, pduHours?: number | null, clickedAt: string, createdAt: string, startedAt?: string | null, updatedAt: string, remindedAt?: string | null, rejectedAt?: string | null, verifiedAt?: string | null, externalUrl: string, confirmedAt?: string | null, completedAt?: string | null, rejectReason?: string | null, evidenceNote?: string | null, licenseNumber?: string | null, certificateUrl?: string | null } };

export type IgnoreExternalLearningMutationVariables = Exact<{
  activityId: Scalars['String']['input'];
}>;


export type IgnoreExternalLearningMutation = { __typename?: 'Mutation', ignoreExternalLearning: { __typename?: 'ExternalLearningActionResponse', code: string, success: boolean, message: string } };

export type PopularCategoryFieldsFragment = { __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number };

export type PopularCategoriesQueryVariables = Exact<{
  input?: InputMaybe<PopularCategoriesInput>;
}>;


export type PopularCategoriesQuery = { __typename?: 'Query', popularCategories: Array<{ __typename?: 'PopularCategory', category: string, totalItems: number, courseCount: number, eventCount: number, podcastCount: number, youtubeCount: number, averageRating: number, popularityScore: number }> };

export type OrganizationPageInfoFieldsFragment = { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type OrganizationOverviewSummaryFieldsFragment = { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number };

export type OrganizationComplianceDistributionFieldsFragment = { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number };

export type OrganizationAttentionMemberFieldsFragment = { __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null };

export type OrganizationTrendingTopicFieldsFragment = { __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number };

export type OrganizationOverviewFieldsFragment = { __typename?: 'OrganizationOverview', summary: { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number }, complianceDistribution: { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number }, attentionMembers: Array<{ __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null }>, trendingTopics: Array<{ __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number }> };

export type OrganizationOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationOverviewQuery = { __typename?: 'Query', organizationOverview: { __typename?: 'OrganizationOverview', summary: { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number }, complianceDistribution: { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number }, attentionMembers: Array<{ __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null }>, trendingTopics: Array<{ __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number }> } };

export type OrganizationSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type OrganizationDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string };

export type OrganizationCpdCategoryStatsFieldsFragment = { __typename?: 'OrganizationCpdCategoryStats', totalCategories: number, activeCategories: number, totalRequiredHours: number, mostPopularCategory?: string | null, mostPopularActiveMembers: number };

export type OrganizationCpdCategoryFieldsFragment = { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string };

export type PaginatedOrganizationCpdCategoriesFieldsFragment = { __typename?: 'PaginatedOrganizationCpdCategories', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationCpdCategory', id: string, title: string, category: PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string }> };

export type OrganizationCpdCategoryStatsQueryVariables = Exact<{
  year?: InputMaybe<Scalars['String']['input']>;
}>;


export type OrganizationCpdCategoryStatsQuery = { __typename?: 'Query', organizationCpdCategoryStats: { __typename?: 'OrganizationCpdCategoryStats', totalCategories: number, activeCategories: number, totalRequiredHours: number, mostPopularCategory?: string | null, mostPopularActiveMembers: number } };

export type OrganizationCpdCategoriesQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationCpdCategoryFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type OrganizationCpdCategoriesQuery = { __typename?: 'Query', organizationCpdCategories: { __typename?: 'PaginatedOrganizationCpdCategories', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationCpdCategory', id: string, title: string, category: PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string }> } };

export type CreateOrganizationCpdCategoryMutationVariables = Exact<{
  input: CreateOrganizationCpdCategoryInput;
}>;


export type CreateOrganizationCpdCategoryMutation = { __typename?: 'Mutation', createOrganizationCpdCategory: { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string } };

export type UpdateOrganizationCpdCategoryMutationVariables = Exact<{
  input: UpdateOrganizationCpdCategoryInput;
}>;


export type UpdateOrganizationCpdCategoryMutation = { __typename?: 'Mutation', updateOrganizationCpdCategory: { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string } };

export type DeleteOrganizationCpdCategoryMutationVariables = Exact<{
  categoryId: Scalars['String']['input'];
}>;


export type DeleteOrganizationCpdCategoryMutation = { __typename?: 'Mutation', deleteOrganizationCpdCategory: { __typename?: 'OrganizationActionResponse', code: string, message: string, success: boolean } };

export type OrganizationEventCatalogFieldsFragment = { __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: EventDeliveryMode, averageRating: number };

export type PaginatedOrganizationEventCatalogFieldsFragment = { __typename?: 'PaginatedOrganizationEventCatalog', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: EventDeliveryMode, averageRating: number }> };

export type OrganizationSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationSettingsQuery = { __typename?: 'Query', organizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type OrganizationDepartmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationDepartmentsQuery = { __typename?: 'Query', organizationDepartments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> };

export type OrganizationEventCatalogQueryVariables = Exact<{
  filter?: InputMaybe<EventCatalogFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type OrganizationEventCatalogQuery = { __typename?: 'Query', organizationEventCatalog: { __typename?: 'PaginatedOrganizationEventCatalog', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: EventDeliveryMode, averageRating: number }> } };

export type UpdateOrganizationSettingsMutationVariables = Exact<{
  input: UpdateOrganizationSettingsInput;
}>;


export type UpdateOrganizationSettingsMutation = { __typename?: 'Mutation', updateOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type CreateOrganizationDepartmentMutationVariables = Exact<{
  input: CreateOrganizationDepartmentInput;
}>;


export type CreateOrganizationDepartmentMutation = { __typename?: 'Mutation', createOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type UpdateOrganizationDepartmentMutationVariables = Exact<{
  input: UpdateOrganizationDepartmentInput;
}>;


export type UpdateOrganizationDepartmentMutation = { __typename?: 'Mutation', updateOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type DeleteOrganizationDepartmentMutationVariables = Exact<{
  departmentId: Scalars['String']['input'];
}>;


export type DeleteOrganizationDepartmentMutation = { __typename?: 'Mutation', deleteOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type AddOrganizationMemberMutationVariables = Exact<{
  input: AddOrganizationMemberInput;
}>;


export type AddOrganizationMemberMutation = { __typename?: 'Mutation', addOrganizationMember: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type UpdateOrganizationMemberMutationVariables = Exact<{
  input: UpdateOrganizationMemberInput;
}>;


export type UpdateOrganizationMemberMutation = { __typename?: 'Mutation', updateOrganizationMember: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type SubmitOrganizationAccessRequestMutationVariables = Exact<{
  input: SubmitOrganizationAccessRequestInput;
}>;


export type SubmitOrganizationAccessRequestMutation = { __typename?: 'Mutation', submitOrganizationAccessRequest: { __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: OrganizationAccessRequestStatus, country: string, createdAt: string, workEmail: string, updatedAt: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationName: string, organizationType: OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number } };

export type OrganizationMembersStatsFieldsFragment = { __typename?: 'OrganizationMembersStats', totalPdus: number, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number };

export type OrganizationMemberDetailFieldsFragment = { __typename?: 'OrganizationMemberDetail', id: string, pdus: number, notes?: string | null, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, pduGoal: number, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, pduProgress: number, departmentId?: string | null, lastActivityAt?: string | null, organizationId: string, lastCourseTitle?: string | null, departmentTitle?: string | null, completedLearning: number };

export type BulkAddOrganizationMembersResultFieldsFragment = { __typename?: 'BulkAddOrganizationMembersResult', errors: Array<string>, failed: number, created: number, updated: number, totalRows: number };

export type OrganizationMemberFieldsFragment = { __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type PaginatedOrganizationMembersFieldsFragment = { __typename?: 'PaginatedOrganizationMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type OrganizationMembersQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationMemberFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type OrganizationMembersQuery = { __typename?: 'Query', organizationMembers: { __typename?: 'PaginatedOrganizationMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type OrganizationMembersStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationMembersStatsQuery = { __typename?: 'Query', organizationMembersStats: { __typename?: 'OrganizationMembersStats', totalPdus: number, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number } };

export type OrganizationMemberDetailQueryVariables = Exact<{
  memberId: Scalars['String']['input'];
}>;


export type OrganizationMemberDetailQuery = { __typename?: 'Query', organizationMemberDetail: { __typename?: 'OrganizationMemberDetail', id: string, pdus: number, notes?: string | null, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, pduGoal: number, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, pduProgress: number, departmentId?: string | null, lastActivityAt?: string | null, organizationId: string, lastCourseTitle?: string | null, departmentTitle?: string | null, completedLearning: number } };

export type BulkAddOrganizationMembersMutationVariables = Exact<{
  input: BulkAddOrganizationMembersInput;
}>;


export type BulkAddOrganizationMembersMutation = { __typename?: 'Mutation', bulkAddOrganizationMembers: { __typename?: 'BulkAddOrganizationMembersResult', errors: Array<string>, failed: number, created: number, updated: number, totalRows: number } };

export type UpdateOrganizationMemberNotesMutationVariables = Exact<{
  input: UpdateOrganizationMemberNotesInput;
}>;


export type UpdateOrganizationMemberNotesMutation = { __typename?: 'Mutation', updateOrganizationMemberNotes: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Role, email?: string | null, userId: string, status: OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type OrganizationAssignmentStatsFieldsFragment = { __typename?: 'OrganizationAssignmentStats', totalAssignments: number, activeAssignments: number, totalParticipants: number, averageCompletionRate: number };

export type OrganizationAssignmentFieldsFragment = { __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null };

export type PaginatedOrganizationAssignmentsFieldsFragment = { __typename?: 'PaginatedOrganizationAssignments', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null }> };

export type OrganizationAssignmentsQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationAssignmentFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type OrganizationAssignmentsQuery = { __typename?: 'Query', organizationAssignments: { __typename?: 'PaginatedOrganizationAssignments', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null }> } };

export type CreateOrganizationAssignmentMutationVariables = Exact<{
  input: CreateOrganizationAssignmentInput;
}>;


export type CreateOrganizationAssignmentMutation = { __typename?: 'Mutation', createOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type OrganizationAssignmentStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationAssignmentStatsQuery = { __typename?: 'Query', organizationAssignmentStats: { __typename?: 'OrganizationAssignmentStats', totalAssignments: number, activeAssignments: number, totalParticipants: number, averageCompletionRate: number } };

export type UpdateOrganizationAssignmentMutationVariables = Exact<{
  input: UpdateOrganizationAssignmentInput;
}>;


export type UpdateOrganizationAssignmentMutation = { __typename?: 'Mutation', updateOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type DeleteOrganizationAssignmentMutationVariables = Exact<{
  assignmentId: Scalars['String']['input'];
}>;


export type DeleteOrganizationAssignmentMutation = { __typename?: 'Mutation', deleteOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: AssignmentType, title: string, status: AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Role | null, targetKind: AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type OrganizationReportSummaryFieldsFragment = { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number };

export type OrganizationReportTrendPointFieldsFragment = { __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number };

export type OrganizationReportDepartmentFieldsFragment = { __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string };

export type OrganizationReportFieldsFragment = { __typename?: 'OrganizationReport', summary: { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number }, complianceTrend: Array<{ __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number }>, departmentCompliance: Array<{ __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string }> };

export type OrganizationReportTopMemberFieldsFragment = { __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number };

export type PaginatedOrganizationReportTopMembersFieldsFragment = { __typename?: 'PaginatedOrganizationReportTopMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number }> };

export type OrganizationReportsQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationReportFilterInput>;
}>;


export type OrganizationReportsQuery = { __typename?: 'Query', organizationReports: { __typename?: 'OrganizationReport', summary: { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number }, complianceTrend: Array<{ __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number }>, departmentCompliance: Array<{ __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string }> } };

export type OrganizationReportTopMembersQueryVariables = Exact<{
  filter?: InputMaybe<OrganizationReportTopMembersFilterInput>;
  pagination?: InputMaybe<OrganizationPaginationInput>;
}>;


export type OrganizationReportTopMembersQuery = { __typename?: 'Query', organizationReportTopMembers: { __typename?: 'PaginatedOrganizationReportTopMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number }> } };

export type PodcastFieldsFragment = { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null };

export type PodcastEpisodeFieldsFragment = { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null };

export type PodcastPageInfoFieldsFragment = { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type PodcastsQueryVariables = Exact<{
  filter?: InputMaybe<PodcastFilterInput>;
  pagination?: InputMaybe<PodcastPaginationInput>;
  sort?: InputMaybe<PodcastSortInput>;
}>;


export type PodcastsQuery = { __typename?: 'Query', podcasts: { __typename?: 'PaginatedPodcasts', totalCount: number, items: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }>, pageInfo: { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type PodcastByIdQueryVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type PodcastByIdQuery = { __typename?: 'Query', podcastById: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type PodcastBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PodcastBySlugQuery = { __typename?: 'Query', podcastBySlug: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type FeaturedPodcastsQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FeaturedPodcastsQuery = { __typename?: 'Query', featuredPodcasts: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }> };

export type PodcastEpisodesQueryVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type PodcastEpisodesQuery = { __typename?: 'Query', podcastEpisodes: Array<{ __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null }> };

export type MyProviderPodcastsQueryVariables = Exact<{
  filter?: InputMaybe<PodcastFilterInput>;
  pagination?: InputMaybe<PodcastPaginationInput>;
  sort?: InputMaybe<PodcastSortInput>;
}>;


export type MyProviderPodcastsQuery = { __typename?: 'Query', myProviderPodcasts: { __typename?: 'PaginatedPodcasts', totalCount: number, items: Array<{ __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null }>, pageInfo: { __typename?: 'PodcastPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreatePodcastMutationVariables = Exact<{
  input: CreatePodcastInput;
}>;


export type CreatePodcastMutation = { __typename?: 'Mutation', createPodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type UpdatePodcastMutationVariables = Exact<{
  input: UpdatePodcastInput;
}>;


export type UpdatePodcastMutation = { __typename?: 'Mutation', updatePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type PublishPodcastMutationVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type PublishPodcastMutation = { __typename?: 'Mutation', publishPodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type ArchivePodcastMutationVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type ArchivePodcastMutation = { __typename?: 'Mutation', archivePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type DeletePodcastMutationVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type DeletePodcastMutation = { __typename?: 'Mutation', deletePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type RestorePodcastMutationVariables = Exact<{
  podcastId: Scalars['String']['input'];
}>;


export type RestorePodcastMutation = { __typename?: 'Mutation', restorePodcast: { __typename?: 'Podcast', id: string, host: string, slug: string, title: string, status: PodcastStatus, rating: number, category: PodcastCategory, imageUrl?: string | null, listeners: number, createdAt: string, updatedAt: string, deletedAt?: string | null, isFeatured: boolean, providerId?: string | null, description: string, ratingCount: number, episodeCount: number, durationMinutes?: number | null } };

export type CreatePodcastEpisodeMutationVariables = Exact<{
  input: CreatePodcastEpisodeInput;
}>;


export type CreatePodcastEpisodeMutation = { __typename?: 'Mutation', createPodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export type UpdatePodcastEpisodeMutationVariables = Exact<{
  input: UpdatePodcastEpisodeInput;
}>;


export type UpdatePodcastEpisodeMutation = { __typename?: 'Mutation', updatePodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export type DeletePodcastEpisodeMutationVariables = Exact<{
  episodeId: Scalars['String']['input'];
}>;


export type DeletePodcastEpisodeMutation = { __typename?: 'Mutation', deletePodcastEpisode: { __typename?: 'PodcastEpisode', id: string, title: string, audioUrl?: string | null, podcastId: string, updatedAt: string, createdAt: string, publishedAt?: string | null, description?: string | null, episodeNumber: number, durationMinutes?: number | null } };

export type ProfessionalPageInfoFieldsFragment = { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type ProfessionalSettingsFieldsFragment = { __typename?: 'ProfessionalSettings', id: string, theme: Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: ProfileVisibility, interfaceLanguage: AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean };

export type ProfessionalOverviewFieldsFragment = { __typename?: 'ProfessionalOverview', totalPdus: number, activeCourses: number, upcomingEvents: number, professionalName?: string | null, completedCourses: number, certificatesEarned: number, yearlyPduGoalProgress: number };

export type ProfessionalTaxonomyTermFieldsFragment = { __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number };

export type ProfessionalTaxonomyGroupFieldsFragment = { __typename?: 'ProfessionalTaxonomyGroup', kind: ProfileTaxonomyKind, groupKey: string, groupLabel: string, terms: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }> };

export type ProfessionalCredentialFieldsFragment = { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null };

export type ProfessionalCpdPlanFieldsFragment = { __typename?: 'ProfessionalCpdPlan', id: string, year: number, target: number, category: PduCategory };

export type ProfessionalProfileCompletionFieldsFragment = { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> };

export type ProfessionalDashboardProfileFieldsFragment = { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } };

export type ProfessionalSessionFieldsFragment = { __typename?: 'ProfessionalSession', id: string, userId: string, status: SessionStatus, ipAddress?: string | null, userAgent?: string | null, expiresAt: string, revokedAt?: string | null, createdAt: string, updatedAt: string };

export type ProfessionalCourseFieldsFragment = { __typename?: 'ProfessionalCourse', id: string, userId: string, status: ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null };

export type PaginatedProfessionalCoursesFieldsFragment = { __typename?: 'PaginatedProfessionalCourses', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCourse', id: string, userId: string, status: ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null }> };

export type ProfessionalPduTargetFieldsFragment = { __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: PduCategory };

export type ProfessionalPduCategorySummaryFieldsFragment = { __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: PduCategory };

export type ProfessionalPduMonthlyPointFieldsFragment = { __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number };

export type ProfessionalPduActivityFileFieldsFragment = { __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string };

export type ProfessionalPduActivityFieldsFragment = { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> };

export type ProfessionalPduReportFieldsFragment = { __typename?: 'ProfessionalPduReport', year: number, totalPdus: number, activities: number, progressToGoal: number, averagePerMonth: number, targets: Array<{ __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: PduCategory }>, byCategory: Array<{ __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: PduCategory }>, byMonth: Array<{ __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number }> };

export type PaginatedProfessionalPduActivitiesFieldsFragment = { __typename?: 'PaginatedProfessionalPduActivities', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> };

export type ProfessionalPaymentFieldsFragment = { __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: ContentType | null, providerPaymentId?: string | null };

export type PaginatedProfessionalPaymentsFieldsFragment = { __typename?: 'PaginatedProfessionalPayments', totalCount: number, totalSpent: number, totalTransactions: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: ContentType | null, providerPaymentId?: string | null }> };

export type ProfessionalCertificateFileFieldsFragment = { __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string };

export type ProfessionalCertificateFieldsFragment = { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> };

export type ProfessionalCertificateSummaryFieldsFragment = { __typename?: 'ProfessionalCertificateSummary', total: number, active: number, expiringSoon: number, expired: number, nearestExpiry?: string | null };

export type PaginatedProfessionalCertificatesFieldsFragment = { __typename?: 'PaginatedProfessionalCertificates', totalCount: number, totalPdusEarned: number, totalCertificates: number, activeCertificates: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> };

export type ProfessionalSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalSettingsQuery = { __typename?: 'Query', professionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: ProfileVisibility, interfaceLanguage: AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type ProfessionalOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalOverviewQuery = { __typename?: 'Query', professionalOverview: { __typename?: 'ProfessionalOverview', totalPdus: number, activeCourses: number, upcomingEvents: number, professionalName?: string | null, completedCourses: number, certificatesEarned: number, yearlyPduGoalProgress: number } };

export type ProfessionalDashboardProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalDashboardProfileQuery = { __typename?: 'Query', professionalDashboardProfile: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type ProfessionalProfileTaxonomyQueryVariables = Exact<{
  kind?: InputMaybe<ProfileTaxonomyKind>;
}>;


export type ProfessionalProfileTaxonomyQuery = { __typename?: 'Query', professionalProfileTaxonomy: Array<{ __typename?: 'ProfessionalTaxonomyGroup', kind: ProfileTaxonomyKind, groupKey: string, groupLabel: string, terms: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }> }> };

export type ProfessionalCpdPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalCpdPlansQuery = { __typename?: 'Query', professionalCpdPlans: Array<{ __typename?: 'ProfessionalCpdPlan', id: string, year: number, target: number, category: PduCategory }> };

export type ProfessionalActiveSessionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalActiveSessionsQuery = { __typename?: 'Query', professionalActiveSessions: Array<{ __typename?: 'ProfessionalSession', id: string, userId: string, status: SessionStatus, ipAddress?: string | null, userAgent?: string | null, expiresAt: string, revokedAt?: string | null, createdAt: string, updatedAt: string }> };

export type ProfessionalMyCoursesQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalMyCoursesQuery = { __typename?: 'Query', professionalMyCourses: { __typename?: 'PaginatedProfessionalCourses', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCourse', id: string, userId: string, status: ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null }> } };

export type ProfessionalPduReportQueryVariables = Exact<{
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProfessionalPduReportQuery = { __typename?: 'Query', professionalPduReport: { __typename?: 'ProfessionalPduReport', year: number, totalPdus: number, activities: number, progressToGoal: number, averagePerMonth: number, targets: Array<{ __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: PduCategory }>, byCategory: Array<{ __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: PduCategory }>, byMonth: Array<{ __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number }> } };

export type ProfessionalPduActivitiesQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalPduActivityFilterInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalPduActivitiesQuery = { __typename?: 'Query', professionalPduActivities: { __typename?: 'PaginatedProfessionalPduActivities', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> } };

export type ProfessionalPduActivityQueryVariables = Exact<{
  activityId: Scalars['ID']['input'];
}>;


export type ProfessionalPduActivityQuery = { __typename?: 'Query', professionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type ProfessionalPduActivitySummaryFieldsFragment = { __typename?: 'ProfessionalPduActivitySummary', completedActivities: number, activitiesWithEvidence: number, evidenceFilesCount: number };

export type ProfessionalPduActivitySummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalPduActivitySummaryQuery = { __typename?: 'Query', professionalPduActivitySummary: { __typename?: 'ProfessionalPduActivitySummary', completedActivities: number, activitiesWithEvidence: number, evidenceFilesCount: number } };

export type ProfessionalContentCompletionQueryVariables = Exact<{
  contentType: ContentType;
  contentId: Scalars['ID']['input'];
}>;


export type ProfessionalContentCompletionQuery = { __typename?: 'Query', professionalContentCompletion?: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } | null };

export type ProfessionalPaymentsQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalPaymentsQuery = { __typename?: 'Query', professionalPayments: { __typename?: 'PaginatedProfessionalPayments', totalCount: number, totalSpent: number, totalTransactions: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: ContentType | null, providerPaymentId?: string | null }> } };

export type ProfessionalCertificatesQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalSearchInput>;
  status?: InputMaybe<CertificateStatusFilter>;
  sort?: InputMaybe<CertificateSort>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  cpdPlanId?: InputMaybe<Scalars['ID']['input']>;
  unlinkedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalCertificatesQuery = { __typename?: 'Query', professionalCertificates: { __typename?: 'PaginatedProfessionalCertificates', totalCount: number, totalPdusEarned: number, totalCertificates: number, activeCertificates: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> } };

export type ProfessionalCertificateQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProfessionalCertificateQuery = { __typename?: 'Query', professionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type ProfessionalCertificateSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalCertificateSummaryQuery = { __typename?: 'Query', professionalCertificateSummary: { __typename?: 'ProfessionalCertificateSummary', total: number, active: number, expiringSoon: number, expired: number, nearestExpiry?: string | null } };

export type ProfessionalCertificateIssuersQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfessionalCertificateIssuersQuery = { __typename?: 'Query', professionalCertificateIssuers: Array<string> };

export type CreateProfessionalCertificateMutationVariables = Exact<{
  input: CreateCertificateInput;
}>;


export type CreateProfessionalCertificateMutation = { __typename?: 'Mutation', createProfessionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type UpdateProfessionalCertificateMutationVariables = Exact<{
  input: UpdateCertificateInput;
}>;


export type UpdateProfessionalCertificateMutation = { __typename?: 'Mutation', updateProfessionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type SetProfessionalCertificateCpdPlanMutationVariables = Exact<{
  input: SetCertificateCpdPlanInput;
}>;


export type SetProfessionalCertificateCpdPlanMutation = { __typename?: 'Mutation', setProfessionalCertificateCpdPlan: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type DeleteProfessionalCertificateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProfessionalCertificateMutation = { __typename?: 'Mutation', deleteProfessionalCertificate: { __typename?: 'ProfessionalActionResponse', id: string } };

export type UpdateProfessionalSettingsMutationVariables = Exact<{
  input: UpdateProfessionalSettingsInput;
}>;


export type UpdateProfessionalSettingsMutation = { __typename?: 'Mutation', updateProfessionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: ProfileVisibility, interfaceLanguage: AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type ResetProfessionalSettingsMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetProfessionalSettingsMutation = { __typename?: 'Mutation', resetProfessionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: ProfileVisibility, interfaceLanguage: AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type UpdateProfessionalBasicProfileMutationVariables = Exact<{
  input: UpdateProfessionalBasicProfileInput;
}>;


export type UpdateProfessionalBasicProfileMutation = { __typename?: 'Mutation', updateProfessionalBasicProfile: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalDetailsMutationVariables = Exact<{
  input: UpdateProfessionalDetailsInput;
}>;


export type UpdateProfessionalDetailsMutation = { __typename?: 'Mutation', updateProfessionalDetails: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalSkillsMutationVariables = Exact<{
  input: UpdateProfessionalSkillsInput;
}>;


export type UpdateProfessionalSkillsMutation = { __typename?: 'Mutation', updateProfessionalSkills: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type StartProfessionalOnboardingMutationVariables = Exact<{ [key: string]: never; }>;


export type StartProfessionalOnboardingMutation = { __typename?: 'Mutation', startProfessionalOnboarding: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type CompleteProfessionalOnboardingMutationVariables = Exact<{
  input: CompleteProfessionalOnboardingInput;
}>;


export type CompleteProfessionalOnboardingMutation = { __typename?: 'Mutation', completeProfessionalOnboarding: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalPreferencesMutationVariables = Exact<{
  input: UpdateProfessionalPreferencesInput;
}>;


export type UpdateProfessionalPreferencesMutation = { __typename?: 'Mutation', updateProfessionalPreferences: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: SkillLevel | null, currentSkillLevel?: SkillLevel | null, preferredLearningFormats: Array<LearningFormat>, learningTimeCommitment?: LearningTimeCommitment | null, learningBudgetPreference?: LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type CreateProfessionalCredentialMutationVariables = Exact<{
  input: CreateProfessionalCredentialInput;
}>;


export type CreateProfessionalCredentialMutation = { __typename?: 'Mutation', createProfessionalCredential: { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null } };

export type UpdateProfessionalCredentialMutationVariables = Exact<{
  input: UpdateProfessionalCredentialInput;
}>;


export type UpdateProfessionalCredentialMutation = { __typename?: 'Mutation', updateProfessionalCredential: { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null } };

export type DeleteProfessionalCredentialMutationVariables = Exact<{
  credentialId: Scalars['ID']['input'];
}>;


export type DeleteProfessionalCredentialMutation = { __typename?: 'Mutation', deleteProfessionalCredential: { __typename?: 'ProfessionalActionResponse', id: string } };

export type CreateProfessionalPduActivityMutationVariables = Exact<{
  input: CreatePduActivityInput;
}>;


export type CreateProfessionalPduActivityMutation = { __typename?: 'Mutation', createProfessionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type UpdateProfessionalPduActivityMutationVariables = Exact<{
  input: UpdatePduActivityInput;
}>;


export type UpdateProfessionalPduActivityMutation = { __typename?: 'Mutation', updateProfessionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: PduStatus, source: PduSource, category: PduCategory, creditType: CreditType, completionStatus: PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type DeleteProfessionalPduActivityMutationVariables = Exact<{
  activityId: Scalars['ID']['input'];
}>;


export type DeleteProfessionalPduActivityMutation = { __typename?: 'Mutation', deleteProfessionalPduActivity: { __typename?: 'ProfessionalActionResponse', id: string } };

export type UpsertProfessionalPduTargetMutationVariables = Exact<{
  input: UpsertPduTargetInput;
}>;


export type UpsertProfessionalPduTargetMutation = { __typename?: 'Mutation', upsertProfessionalPduTarget: { __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: PduCategory } };

export type ProfessionalRoadmapStepFieldsFragment = { __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: ContentType | null };

export type ProfessionalRoadmapPhaseFieldsFragment = { __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: ContentType | null }> };

export type ProfessionalRoadmapFieldsFragment = { __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: CourseLevel, title: string, userId: string, status: RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: ContentType | null }> }> };

export type ProfessionalExploreRoadmapFieldsFragment = { __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: CourseLevel, status: RoadmapStatus, imageUrl?: string | null, category?: CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number };

export type PaginatedProfessionalRoadmapsFieldsFragment = { __typename?: 'PaginatedProfessionalRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: CourseLevel, title: string, userId: string, status: RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: ContentType | null }> }> }> };

export type PaginatedProfessionalExploreRoadmapsFieldsFragment = { __typename?: 'PaginatedProfessionalExploreRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: CourseLevel, status: RoadmapStatus, imageUrl?: string | null, category?: CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number }> };

export type ProfessionalMyRoadmapsQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalMyRoadmapsQuery = { __typename?: 'Query', professionalMyRoadmaps: { __typename?: 'PaginatedProfessionalRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: CourseLevel, title: string, userId: string, status: RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: ContentType | null }> }> }> } };

export type ProfessionalExploreRoadmapsQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalSearchInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalExploreRoadmapsQuery = { __typename?: 'Query', professionalExploreRoadmaps: { __typename?: 'PaginatedProfessionalExploreRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: CourseLevel, status: RoadmapStatus, imageUrl?: string | null, category?: CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number }> } };

export type ProfessionalCalendarEventFieldsFragment = { __typename?: 'ProfessionalCalendarEvent', id: string, status: EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: EventDeliveryMode } | null };

export type PaginatedProfessionalCalendarEventsFieldsFragment = { __typename?: 'PaginatedProfessionalCalendarEvents', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCalendarEvent', id: string, status: EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: EventDeliveryMode } | null }> };

export type ProfessionalCalendarEventsQueryVariables = Exact<{
  filter?: InputMaybe<ProfessionalCalendarEventsFilterInput>;
  pagination?: InputMaybe<ProfessionalPaginationInput>;
}>;


export type ProfessionalCalendarEventsQuery = { __typename?: 'Query', professionalCalendarEvents: { __typename?: 'PaginatedProfessionalCalendarEvents', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCalendarEvent', id: string, status: EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: EventDeliveryMode } | null }> } };

export type ManualCalendarEventFieldsFragment = { __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null };

export type MyCalendarEntriesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCalendarEntriesQuery = { __typename?: 'Query', myCalendarEntries: Array<{ __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null }> };

export type CreateCalendarEventMutationVariables = Exact<{
  input: CreateCalendarEventInput;
}>;


export type CreateCalendarEventMutation = { __typename?: 'Mutation', createCalendarEvent: { __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null } };

export type DeleteCalendarEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteCalendarEventMutation = { __typename?: 'Mutation', deleteCalendarEvent: { __typename?: 'ProfessionalActionResponse', id: string } };

export type ProviderSettingsFieldsFragment = { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean };

export type ProviderStatusBreakdownFieldsFragment = { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number };

export type ProviderOverviewFieldsFragment = { __typename?: 'ProviderOverview', totalViews: number, totalEvents: number, providerName?: string | null, conversionRate: number, upcomingSessions: number, totalRegistrations: number, statusBreakdown: { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number } };

export type ProviderTimeSeriesPointFieldsFragment = { __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number };

export type ProviderBreakdownPointFieldsFragment = { __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null };

export type ProviderTopEventFieldsFragment = { __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number };

export type ProviderAnalyticsFieldsFragment = { __typename?: 'ProviderAnalytics', avgRating: number, totalRevenue: number, conversionRate: number, avgFeePerAttendee: number, registrationsOverTime: Array<{ __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number }>, pdusByCategory: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, eventTypeBreakdown: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, topPerformingEvents: Array<{ __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number }> };

export type CsvExportFieldsFragment = { __typename?: 'CsvExport', filename: string, mimeType: string, content: string };

export type ProviderPageInfoFieldsFragment = { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null };

export type ProviderEventTableRowFieldsFragment = { __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: EventStatus, startDate: string, registrants: number };

export type PaginatedProviderEventsFieldsFragment = { __typename?: 'PaginatedProviderEvents', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: EventStatus, startDate: string, registrants: number }> };

export type PromotionRequestFieldsFragment = { __typename?: 'PromotionRequest', id: string, note?: string | null, status: PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: PromotionType };

export type PaginatedPromotionRequestsFieldsFragment = { __typename?: 'PaginatedPromotionRequests', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'PromotionRequest', id: string, note?: string | null, status: PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: PromotionType }> };

export type ProviderSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProviderSettingsQuery = { __typename?: 'Query', providerSettings: { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean } };

export type ProviderOverviewQueryVariables = Exact<{
  input?: InputMaybe<ProviderDashboardRangeInput>;
}>;


export type ProviderOverviewQuery = { __typename?: 'Query', providerOverview: { __typename?: 'ProviderOverview', totalViews: number, totalEvents: number, providerName?: string | null, conversionRate: number, upcomingSessions: number, totalRegistrations: number, statusBreakdown: { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number } } };

export type ProviderAnalyticsQueryVariables = Exact<{
  input?: InputMaybe<ProviderDashboardRangeInput>;
}>;


export type ProviderAnalyticsQuery = { __typename?: 'Query', providerAnalytics: { __typename?: 'ProviderAnalytics', avgRating: number, totalRevenue: number, conversionRate: number, avgFeePerAttendee: number, registrationsOverTime: Array<{ __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number }>, pdusByCategory: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, eventTypeBreakdown: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, topPerformingEvents: Array<{ __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number }> } };

export type ProviderAnalyticsCsvQueryVariables = Exact<{
  input?: InputMaybe<ProviderDashboardRangeInput>;
}>;


export type ProviderAnalyticsCsvQuery = { __typename?: 'Query', providerAnalyticsCsv: { __typename?: 'CsvExport', filename: string, mimeType: string, content: string } };

export type ProviderEventsTableQueryVariables = Exact<{
  filter?: InputMaybe<ProviderEventsFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
}>;


export type ProviderEventsTableQuery = { __typename?: 'Query', providerEventsTable: { __typename?: 'PaginatedProviderEvents', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: EventStatus, startDate: string, registrants: number }> } };

export type ProviderPromotionRequestsQueryVariables = Exact<{
  filter?: InputMaybe<ProviderPromotionFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
}>;


export type ProviderPromotionRequestsQuery = { __typename?: 'Query', providerPromotionRequests: { __typename?: 'PaginatedPromotionRequests', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'PromotionRequest', id: string, note?: string | null, status: PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: PromotionType }> } };

export type UpdateProviderSettingsMutationVariables = Exact<{
  input: UpdateProviderSettingsInput;
}>;


export type UpdateProviderSettingsMutation = { __typename?: 'Mutation', updateProviderSettings: { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean } };

export type SubmitPromotionRequestMutationVariables = Exact<{
  input: SubmitPromotionRequestInput;
}>;


export type SubmitPromotionRequestMutation = { __typename?: 'Mutation', submitPromotionRequest: { __typename?: 'PromotionRequest', id: string, note?: string | null, status: PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: PromotionType } };

export type ProviderAttendeesStatsFieldsFragment = { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number };

export type PaginatedProviderAttendeesFieldsFragment = { __typename?: 'PaginatedProviderAttendees', totalCount: number, stats: { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number }, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string }> };

export type ProviderAttendeeFieldsFragment = { __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string };

export type ProviderAttendeesQueryVariables = Exact<{
  filter?: InputMaybe<ProviderAttendeesFilterInput>;
  pagination?: InputMaybe<ProviderDashboardPaginationInput>;
}>;


export type ProviderAttendeesQuery = { __typename?: 'Query', providerAttendees: { __typename?: 'PaginatedProviderAttendees', totalCount: number, stats: { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number }, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string }> } };

export type SubmitContactInquiryMutationVariables = Exact<{
  input: SubmitContactInquiryInput;
}>;


export type SubmitContactInquiryMutation = { __typename?: 'Mutation', submitContactInquiry: { __typename?: 'SubmitContactInquiryPayload', success: boolean, code: string, referenceId?: string | null } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null, professionalProfile?: { __typename?: 'ProfessionalProfile', id: string, userId: string, skills: Array<string>, industry?: ProfessionalIndustry | null, interests: Array<string>, createdAt: string, updatedAt: string, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: ExperienceRange | null } | null, providerProfile?: { __typename?: 'ProviderProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, contactEmail?: string | null, contactPhone?: string | null, organizationName?: string | null } | null, organizationProfile?: { __typename?: 'OrganizationProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, country?: string | null, industry?: string | null, timezone?: string | null, createdAt: string, updatedAt: string, memberLimit?: number | null, contactEmail?: string | null, contactPhone?: string | null, organizationName: string } | null } };

export type UpdateMeMutationVariables = Exact<{
  input: UpdateMeInput;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe: { __typename?: 'User', id: string, bio?: string | null, role: Role, email?: string | null, phone?: string | null, status: UserStatus, lastName?: string | null, fullName?: string | null, avatarUrl?: string | null, firstName?: string | null, updatedAt: string } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, role: Role, email?: string | null, phone?: string | null, status: UserStatus, fullName?: string | null, createdAt: string } };

export type YouTubeChannelFieldsFragment = { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null };

export type YouTubeVideoFieldsFragment = { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null };

export type YouTubeChannelPageInfoFieldsFragment = { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type YouTubeChannelsQueryVariables = Exact<{
  filter?: InputMaybe<YouTubeChannelFilterInput>;
  pagination?: InputMaybe<YouTubeChannelPaginationInput>;
  sort?: InputMaybe<YouTubeChannelSortInput>;
}>;


export type YouTubeChannelsQuery = { __typename?: 'Query', youtubeChannels: { __typename?: 'PaginatedYouTubeChannels', totalCount: number, items: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }>, pageInfo: { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type YouTubeChannelByIdQueryVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type YouTubeChannelByIdQuery = { __typename?: 'Query', youtubeChannelById: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type YouTubeChannelBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type YouTubeChannelBySlugQuery = { __typename?: 'Query', youtubeChannelBySlug: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type FeaturedYouTubeChannelsQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FeaturedYouTubeChannelsQuery = { __typename?: 'Query', featuredYouTubeChannels: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }> };

export type YouTubeVideosQueryVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type YouTubeVideosQuery = { __typename?: 'Query', youtubeVideos: Array<{ __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null }> };

export type MyProviderYouTubeChannelsQueryVariables = Exact<{
  filter?: InputMaybe<YouTubeChannelFilterInput>;
  pagination?: InputMaybe<YouTubeChannelPaginationInput>;
  sort?: InputMaybe<YouTubeChannelSortInput>;
}>;


export type MyProviderYouTubeChannelsQuery = { __typename?: 'Query', myProviderYouTubeChannels: { __typename?: 'PaginatedYouTubeChannels', totalCount: number, items: Array<{ __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null }>, pageInfo: { __typename?: 'YouTubeChannelPageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreateYouTubeChannelMutationVariables = Exact<{
  input: CreateYouTubeChannelInput;
}>;


export type CreateYouTubeChannelMutation = { __typename?: 'Mutation', createYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type UpdateYouTubeChannelMutationVariables = Exact<{
  input: UpdateYouTubeChannelInput;
}>;


export type UpdateYouTubeChannelMutation = { __typename?: 'Mutation', updateYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type PublishYouTubeChannelMutationVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type PublishYouTubeChannelMutation = { __typename?: 'Mutation', publishYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type ArchiveYouTubeChannelMutationVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type ArchiveYouTubeChannelMutation = { __typename?: 'Mutation', archiveYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type DeleteYouTubeChannelMutationVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type DeleteYouTubeChannelMutation = { __typename?: 'Mutation', deleteYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type RestoreYouTubeChannelMutationVariables = Exact<{
  channelId: Scalars['String']['input'];
}>;


export type RestoreYouTubeChannelMutation = { __typename?: 'Mutation', restoreYouTubeChannel: { __typename?: 'YouTubeChannel', id: string, slug: string, views: number, title: string, status: YouTubeChannelStatus, rating: number, provider?: string | null, category: YouTubeCategory, imageUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, channelUrl?: string | null, isFeatured: boolean, providerId?: string | null, videoCount: number, ratingCount: number, subscribers: number, description?: string | null } };

export type CreateYouTubeVideoMutationVariables = Exact<{
  input: CreateYouTubeVideoInput;
}>;


export type CreateYouTubeVideoMutation = { __typename?: 'Mutation', createYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export type UpdateYouTubeVideoMutationVariables = Exact<{
  input: UpdateYouTubeVideoInput;
}>;


export type UpdateYouTubeVideoMutation = { __typename?: 'Mutation', updateYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export type DeleteYouTubeVideoMutationVariables = Exact<{
  videoId: Scalars['String']['input'];
}>;


export type DeleteYouTubeVideoMutation = { __typename?: 'Mutation', deleteYouTubeVideo: { __typename?: 'YouTubeVideo', id: string, title: string, views: number, likes: number, status: YouTubeVideoStatus, videoUrl?: string | null, channelId: string, createdAt: string, updatedAt: string, description?: string | null, publishedAt?: string | null, thumbnailUrl?: string | null, durationMinutes?: number | null } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
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
export const AdminDashboardProfileFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardProfileFields on AdminProfile {
  id
  bio
  role
  email
  status
  fullName
  avatarUrl
  createdAt
  updatedAt
}
    `, {"fragmentName":"AdminDashboardProfileFields"}) as unknown as TypedDocumentString<AdminDashboardProfileFieldsFragment, unknown>;
export const AdminDashboardRequestTrendPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardRequestTrendPointFields on AdminRequestTrendPoint {
  date
  count
}
    `, {"fragmentName":"AdminDashboardRequestTrendPointFields"}) as unknown as TypedDocumentString<AdminDashboardRequestTrendPointFieldsFragment, unknown>;
export const AdminDashboardOverviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOverviewFields on AdminDashboardOverview {
  totalRequests
  pendingRequests
  approvedRequests
  rejectedRequests
  requestTrend {
    ...AdminDashboardRequestTrendPointFields
  }
}
    fragment AdminDashboardRequestTrendPointFields on AdminRequestTrendPoint {
  date
  count
}`, {"fragmentName":"AdminDashboardOverviewFields"}) as unknown as TypedDocumentString<AdminDashboardOverviewFieldsFragment, unknown>;
export const AdminDashboardPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"AdminDashboardPageInfoFields"}) as unknown as TypedDocumentString<AdminDashboardPageInfoFieldsFragment, unknown>;
export const AdminDashboardOrgFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  updatedAt
  createdAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}
    `, {"fragmentName":"AdminDashboardOrgFields"}) as unknown as TypedDocumentString<AdminDashboardOrgFieldsFragment, unknown>;
export const AdminDashboardPaginatedOrganizationsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardPaginatedOrganizationsFields on PaginatedAdminOrg {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardOrgFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  updatedAt
  createdAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}`, {"fragmentName":"AdminDashboardPaginatedOrganizationsFields"}) as unknown as TypedDocumentString<AdminDashboardPaginatedOrganizationsFieldsFragment, unknown>;
export const AdminDashboardOrgMemberFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrgMemberFields on AdminOrgMember {
  id
  pdus
  email
  status
  userId
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
    `, {"fragmentName":"AdminDashboardOrgMemberFields"}) as unknown as TypedDocumentString<AdminDashboardOrgMemberFieldsFragment, unknown>;
export const AdminDashboardOrganizationSettingsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}
    `, {"fragmentName":"AdminDashboardOrganizationSettingsFields"}) as unknown as TypedDocumentString<AdminDashboardOrganizationSettingsFieldsFragment, unknown>;
export const AdminDashboardOrgDepartmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrgDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}
    `, {"fragmentName":"AdminDashboardOrgDepartmentFields"}) as unknown as TypedDocumentString<AdminDashboardOrgDepartmentFieldsFragment, unknown>;
export const AdminDashboardOrgDetailFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrgDetailFields on AdminOrgDetail {
  id
  name
  ownerId
  logoUrl
  country
  website
  industry
  totalPdus
  ownerName
  updatedAt
  createdAt
  ownerEmail
  description
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
  settings {
    ...AdminDashboardOrganizationSettingsFields
  }
  departments {
    ...AdminDashboardOrgDepartmentFields
  }
}
    fragment AdminDashboardOrgDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}
fragment AdminDashboardOrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`, {"fragmentName":"AdminDashboardOrgDetailFields"}) as unknown as TypedDocumentString<AdminDashboardOrgDetailFieldsFragment, unknown>;
export const AdminDashboardOrgAccessRequestFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}
    `, {"fragmentName":"AdminDashboardOrgAccessRequestFields"}) as unknown as TypedDocumentString<AdminDashboardOrgAccessRequestFieldsFragment, unknown>;
export const AdminDashboardPaginatedOrgAccessRequestsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardPaginatedOrgAccessRequestsFields on PaginatedAdminOrgAccessRequests {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardOrgAccessRequestFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}`, {"fragmentName":"AdminDashboardPaginatedOrgAccessRequestsFields"}) as unknown as TypedDocumentString<AdminDashboardPaginatedOrgAccessRequestsFieldsFragment, unknown>;
export const AdminDashboardUserFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardUserFields on AdminUser {
  id
  role
  email
  status
  fullName
  location
  avatarUrl
  isPremium
  createdAt
  updatedAt
  lastLoginAt
}
    `, {"fragmentName":"AdminDashboardUserFields"}) as unknown as TypedDocumentString<AdminDashboardUserFieldsFragment, unknown>;
export const AdminDashboardPaginatedUsersFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardPaginatedUsersFields on PaginatedAdminUser {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardUserFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardUserFields on AdminUser {
  id
  role
  email
  status
  fullName
  location
  avatarUrl
  isPremium
  createdAt
  updatedAt
  lastLoginAt
}`, {"fragmentName":"AdminDashboardPaginatedUsersFields"}) as unknown as TypedDocumentString<AdminDashboardPaginatedUsersFieldsFragment, unknown>;
export const AdminDashboardUserGrowthPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardUserGrowthPointFields on AdminChartPoint {
  date
  label
  total
  providers
  professionals
}
    `, {"fragmentName":"AdminDashboardUserGrowthPointFields"}) as unknown as TypedDocumentString<AdminDashboardUserGrowthPointFieldsFragment, unknown>;
export const AdminDashboardAuditLogFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardAuditLogFields on AdminAuditLog {
  id
  action
  actorId
  entityId
  metadata
  createdAt
  actorEmail
  entityType
}
    `, {"fragmentName":"AdminDashboardAuditLogFields"}) as unknown as TypedDocumentString<AdminDashboardAuditLogFieldsFragment, unknown>;
export const AdminDashboardPaginatedAuditLogsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminDashboardPaginatedAuditLogsFields on PaginatedAdminAuditLogs {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardAuditLogFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardAuditLogFields on AdminAuditLog {
  id
  action
  actorId
  entityId
  metadata
  createdAt
  actorEmail
  entityType
}`, {"fragmentName":"AdminDashboardPaginatedAuditLogsFields"}) as unknown as TypedDocumentString<AdminDashboardPaginatedAuditLogsFieldsFragment, unknown>;
export const AdminOrgUsersPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"AdminOrgUsersPageInfoFields"}) as unknown as TypedDocumentString<AdminOrgUsersPageInfoFieldsFragment, unknown>;
export const AdminOrgUsersOrgFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  createdAt
  updatedAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}
    `, {"fragmentName":"AdminOrgUsersOrgFields"}) as unknown as TypedDocumentString<AdminOrgUsersOrgFieldsFragment, unknown>;
export const AdminOrgUsersPaginatedOrgsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersPaginatedOrgsFields on PaginatedAdminOrg {
  totalCount
  pageInfo {
    ...AdminOrgUsersPageInfoFields
  }
  items {
    ...AdminOrgUsersOrgFields
  }
}
    fragment AdminOrgUsersPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminOrgUsersOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  createdAt
  updatedAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}`, {"fragmentName":"AdminOrgUsersPaginatedOrgsFields"}) as unknown as TypedDocumentString<AdminOrgUsersPaginatedOrgsFieldsFragment, unknown>;
export const AdminOrgUsersMemberFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
    `, {"fragmentName":"AdminOrgUsersMemberFields"}) as unknown as TypedDocumentString<AdminOrgUsersMemberFieldsFragment, unknown>;
export const AdminOrgUsersPaginatedMembersFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersPaginatedMembersFields on PaginatedAdminOrgMembers {
  totalCount
  pageInfo {
    ...AdminOrgUsersPageInfoFields
  }
  items {
    ...AdminOrgUsersMemberFields
  }
}
    fragment AdminOrgUsersPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`, {"fragmentName":"AdminOrgUsersPaginatedMembersFields"}) as unknown as TypedDocumentString<AdminOrgUsersPaginatedMembersFieldsFragment, unknown>;
export const AdminOrgUsersSettingsFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}
    `, {"fragmentName":"AdminOrgUsersSettingsFields"}) as unknown as TypedDocumentString<AdminOrgUsersSettingsFieldsFragment, unknown>;
export const AdminOrgUsersDepartmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersDepartmentFields on OrganizationDepartment {
  id
  title
  organizationId
}
    `, {"fragmentName":"AdminOrgUsersDepartmentFields"}) as unknown as TypedDocumentString<AdminOrgUsersDepartmentFieldsFragment, unknown>;
export const AdminOrgUsersDetailFieldsFragmentDoc = new TypedDocumentString(`
    fragment AdminOrgUsersDetailFields on AdminOrgDetail {
  id
  name
  ownerId
  logoUrl
  country
  website
  industry
  ownerName
  totalPdus
  createdAt
  updatedAt
  ownerEmail
  description
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
  settings {
    ...AdminOrgUsersSettingsFields
  }
  departments {
    ...AdminOrgUsersDepartmentFields
  }
  members {
    ...AdminOrgUsersMemberFields
  }
}
    fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
fragment AdminOrgUsersSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}
fragment AdminOrgUsersDepartmentFields on OrganizationDepartment {
  id
  title
  organizationId
}`, {"fragmentName":"AdminOrgUsersDetailFields"}) as unknown as TypedDocumentString<AdminOrgUsersDetailFieldsFragment, unknown>;
export const ContentActionPayloadFieldsFragmentDoc = new TypedDocumentString(`
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}
    `, {"fragmentName":"ContentActionPayloadFields"}) as unknown as TypedDocumentString<ContentActionPayloadFieldsFragment, unknown>;
export const WishlistContentFieldsFragmentDoc = new TypedDocumentString(`
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}
    `, {"fragmentName":"WishlistContentFields"}) as unknown as TypedDocumentString<WishlistContentFieldsFragment, unknown>;
export const WishlistItemFieldsFragmentDoc = new TypedDocumentString(`
    fragment WishlistItemFields on WishlistItem {
  id
  userId
  contentId
  createdAt
  contentType
  content {
    ...WishlistContentFields
  }
}
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}`, {"fragmentName":"WishlistItemFields"}) as unknown as TypedDocumentString<WishlistItemFieldsFragment, unknown>;
export const ContentEnrollmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment ContentEnrollmentFields on ContentEnrollment {
  id
  userId
  status
  progress
  contentId
  createdAt
  startedAt
  updatedAt
  canceledAt
  contentType
  completedAt
}
    `, {"fragmentName":"ContentEnrollmentFields"}) as unknown as TypedDocumentString<ContentEnrollmentFieldsFragment, unknown>;
export const ContentReviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}
    `, {"fragmentName":"ContentReviewFields"}) as unknown as TypedDocumentString<ContentReviewFieldsFragment, unknown>;
export const CartItemFieldsFragmentDoc = new TypedDocumentString(`
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}
    `, {"fragmentName":"CartItemFields"}) as unknown as TypedDocumentString<CartItemFieldsFragment, unknown>;
export const CartFieldsFragmentDoc = new TypedDocumentString(`
    fragment CartFields on Cart {
  id
  userId
  status
  items {
    ...CartItemFields
  }
  createdAt
  updatedAt
}
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}`, {"fragmentName":"CartFields"}) as unknown as TypedDocumentString<CartFieldsFragment, unknown>;
export const CourseFieldsFragmentDoc = new TypedDocumentString(`
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
    `, {"fragmentName":"CourseFields"}) as unknown as TypedDocumentString<CourseFieldsFragment, unknown>;
export const CoursePageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"CoursePageInfoFields"}) as unknown as TypedDocumentString<CoursePageInfoFieldsFragment, unknown>;
export const CurriculumLessonFieldsFragmentDoc = new TypedDocumentString(`
    fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}
    `, {"fragmentName":"CurriculumLessonFields"}) as unknown as TypedDocumentString<CurriculumLessonFieldsFragment, unknown>;
export const CurriculumSectionFieldsFragmentDoc = new TypedDocumentString(`
    fragment CurriculumSectionFields on CurriculumSection {
  id
  title
  order
  courseId
  description
  lessons {
    ...CurriculumLessonFields
  }
  createdAt
  updatedAt
}
    fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}`, {"fragmentName":"CurriculumSectionFields"}) as unknown as TypedDocumentString<CurriculumSectionFieldsFragment, unknown>;
export const CertificationCategoryFieldsFragmentDoc = new TypedDocumentString(`
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}
    `, {"fragmentName":"CertificationCategoryFields"}) as unknown as TypedDocumentString<CertificationCategoryFieldsFragment, unknown>;
export const CertificationFieldsFragmentDoc = new TypedDocumentString(`
    fragment CertificationFields on Certification {
  id
  name
  abbreviation
  organization
  organizationAbbr
  association
  creditType
  renewalCycleLabel
  renewalCycleMonths
  totalRequiredCredits
  suggestedDeadline
  categories {
    ...CertificationCategoryFields
  }
}
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}`, {"fragmentName":"CertificationFields"}) as unknown as TypedDocumentString<CertificationFieldsFragment, unknown>;
export const CpdPlanCategoryFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
    `, {"fragmentName":"CpdPlanCategoryFields"}) as unknown as TypedDocumentString<CpdPlanCategoryFieldsFragment, unknown>;
export const CpdPlanFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}`, {"fragmentName":"CpdPlanFields"}) as unknown as TypedDocumentString<CpdPlanFieldsFragment, unknown>;
export const CpdCategoryProgressFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
    `, {"fragmentName":"CpdCategoryProgressFields"}) as unknown as TypedDocumentString<CpdCategoryProgressFieldsFragment, unknown>;
export const CpdMissingRequirementFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}
    `, {"fragmentName":"CpdMissingRequirementFields"}) as unknown as TypedDocumentString<CpdMissingRequirementFieldsFragment, unknown>;
export const CpdPlanProgressFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdPlanProgressFields on CpdPlanProgress {
  planId
  earnedCredits
  initialCompletedCredits
  activityCredits
  totalRequiredCredits
  remainingCredits
  progressPercent
  categoriesMissing
  evidenceMissing
  activitiesCounted
  complianceStatus
  reportingExpired
  reportingNotStarted
  categories {
    ...CpdCategoryProgressFields
  }
  missingRequirements {
    ...CpdMissingRequirementFields
  }
}
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}`, {"fragmentName":"CpdPlanProgressFields"}) as unknown as TypedDocumentString<CpdPlanProgressFieldsFragment, unknown>;
export const CpdReportRecipientOptionFieldsFragmentDoc = new TypedDocumentString(`
    fragment CpdReportRecipientOptionFields on CpdReportRecipientOption {
  type
  label
  description
}
    `, {"fragmentName":"CpdReportRecipientOptionFields"}) as unknown as TypedDocumentString<CpdReportRecipientOptionFieldsFragment, unknown>;
export const EventCardFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
    `, {"fragmentName":"EventCardFields"}) as unknown as TypedDocumentString<EventCardFieldsFragment, unknown>;
export const EventScheduleItemFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
    `, {"fragmentName":"EventScheduleItemFields"}) as unknown as TypedDocumentString<EventScheduleItemFieldsFragment, unknown>;
export const EventDetailFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}`, {"fragmentName":"EventDetailFields"}) as unknown as TypedDocumentString<EventDetailFieldsFragment, unknown>;
export const EventRegistrationFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}
    `, {"fragmentName":"EventRegistrationFields"}) as unknown as TypedDocumentString<EventRegistrationFieldsFragment, unknown>;
export const EventPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"EventPageInfoFields"}) as unknown as TypedDocumentString<EventPageInfoFieldsFragment, unknown>;
export const ExternalLearningActivityFieldsFragmentDoc = new TypedDocumentString(`
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}
    `, {"fragmentName":"ExternalLearningActivityFields"}) as unknown as TypedDocumentString<ExternalLearningActivityFieldsFragment, unknown>;
export const PaginatedExternalLearningFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedExternalLearningFields on PaginatedExternalLearning {
  totalCount
  pageInfo {
    nextCursor
    hasNextPage
  }
  items {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`, {"fragmentName":"PaginatedExternalLearningFields"}) as unknown as TypedDocumentString<PaginatedExternalLearningFieldsFragment, unknown>;
export const PopularCategoryFieldsFragmentDoc = new TypedDocumentString(`
    fragment PopularCategoryFields on PopularCategory {
  category
  totalItems
  courseCount
  eventCount
  podcastCount
  youtubeCount
  averageRating
  popularityScore
}
    `, {"fragmentName":"PopularCategoryFields"}) as unknown as TypedDocumentString<PopularCategoryFieldsFragment, unknown>;
export const OrganizationOverviewSummaryFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationOverviewSummaryFields on OrganizationOverviewSummary {
  totalPdus
  totalMembers
  activeMembers
  engagementRate
  averageCompliance
  activeAssignments
  nonCompliantMembers
}
    `, {"fragmentName":"OrganizationOverviewSummaryFields"}) as unknown as TypedDocumentString<OrganizationOverviewSummaryFieldsFragment, unknown>;
export const OrganizationComplianceDistributionFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationComplianceDistributionFields on OrganizationComplianceDistribution {
  atRisk
  compliant
  nonCompliant
}
    `, {"fragmentName":"OrganizationComplianceDistributionFields"}) as unknown as TypedDocumentString<OrganizationComplianceDistributionFieldsFragment, unknown>;
export const OrganizationAttentionMemberFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationAttentionMemberFields on OrganizationAttentionMember {
  id
  pdus
  email
  userId
  pduGoal
  fullName
  avatarUrl
  compliance
  remainingPdus
  departmentTitle
}
    `, {"fragmentName":"OrganizationAttentionMemberFields"}) as unknown as TypedDocumentString<OrganizationAttentionMemberFieldsFragment, unknown>;
export const OrganizationTrendingTopicFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationTrendingTopicFields on OrganizationTrendingTopic {
  title
  count
  percentage
}
    `, {"fragmentName":"OrganizationTrendingTopicFields"}) as unknown as TypedDocumentString<OrganizationTrendingTopicFieldsFragment, unknown>;
export const OrganizationOverviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationOverviewFields on OrganizationOverview {
  summary {
    ...OrganizationOverviewSummaryFields
  }
  complianceDistribution {
    ...OrganizationComplianceDistributionFields
  }
  attentionMembers {
    ...OrganizationAttentionMemberFields
  }
  trendingTopics {
    ...OrganizationTrendingTopicFields
  }
}
    fragment OrganizationOverviewSummaryFields on OrganizationOverviewSummary {
  totalPdus
  totalMembers
  activeMembers
  engagementRate
  averageCompliance
  activeAssignments
  nonCompliantMembers
}
fragment OrganizationComplianceDistributionFields on OrganizationComplianceDistribution {
  atRisk
  compliant
  nonCompliant
}
fragment OrganizationAttentionMemberFields on OrganizationAttentionMember {
  id
  pdus
  email
  userId
  pduGoal
  fullName
  avatarUrl
  compliance
  remainingPdus
  departmentTitle
}
fragment OrganizationTrendingTopicFields on OrganizationTrendingTopic {
  title
  count
  percentage
}`, {"fragmentName":"OrganizationOverviewFields"}) as unknown as TypedDocumentString<OrganizationOverviewFieldsFragment, unknown>;
export const OrganizationSettingsFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}
    `, {"fragmentName":"OrganizationSettingsFields"}) as unknown as TypedDocumentString<OrganizationSettingsFieldsFragment, unknown>;
export const OrganizationDepartmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}
    `, {"fragmentName":"OrganizationDepartmentFields"}) as unknown as TypedDocumentString<OrganizationDepartmentFieldsFragment, unknown>;
export const OrganizationCpdCategoryStatsFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationCpdCategoryStatsFields on OrganizationCpdCategoryStats {
  totalCategories
  activeCategories
  totalRequiredHours
  mostPopularCategory
  mostPopularActiveMembers
}
    `, {"fragmentName":"OrganizationCpdCategoryStatsFields"}) as unknown as TypedDocumentString<OrganizationCpdCategoryStatsFieldsFragment, unknown>;
export const OrganizationPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"OrganizationPageInfoFields"}) as unknown as TypedDocumentString<OrganizationPageInfoFieldsFragment, unknown>;
export const OrganizationCpdCategoryFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationCpdCategoryFields on OrganizationCpdCategory {
  id
  title
  category
  isActive
  updatedAt
  createdAt
  description
  totalMembers
  requiredHours
  activeMembers
  organizationId
}
    `, {"fragmentName":"OrganizationCpdCategoryFields"}) as unknown as TypedDocumentString<OrganizationCpdCategoryFieldsFragment, unknown>;
export const PaginatedOrganizationCpdCategoriesFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedOrganizationCpdCategoriesFields on PaginatedOrganizationCpdCategories {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationCpdCategoryFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationCpdCategoryFields on OrganizationCpdCategory {
  id
  title
  category
  isActive
  updatedAt
  createdAt
  description
  totalMembers
  requiredHours
  activeMembers
  organizationId
}`, {"fragmentName":"PaginatedOrganizationCpdCategoriesFields"}) as unknown as TypedDocumentString<PaginatedOrganizationCpdCategoriesFieldsFragment, unknown>;
export const OrganizationEventCatalogFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationEventCatalogFields on OrganizationEventCatalogItem {
  id
  pdu
  slug
  type
  title
  price
  isFree
  rating
  speaker
  category
  capacity
  location
  currency
  imageUrl
  startDate
  onlineUrl
  description
  deliveryMode
  averageRating
}
    `, {"fragmentName":"OrganizationEventCatalogFields"}) as unknown as TypedDocumentString<OrganizationEventCatalogFieldsFragment, unknown>;
export const PaginatedOrganizationEventCatalogFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedOrganizationEventCatalogFields on PaginatedOrganizationEventCatalog {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationEventCatalogFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationEventCatalogFields on OrganizationEventCatalogItem {
  id
  pdu
  slug
  type
  title
  price
  isFree
  rating
  speaker
  category
  capacity
  location
  currency
  imageUrl
  startDate
  onlineUrl
  description
  deliveryMode
  averageRating
}`, {"fragmentName":"PaginatedOrganizationEventCatalogFields"}) as unknown as TypedDocumentString<PaginatedOrganizationEventCatalogFieldsFragment, unknown>;
export const OrganizationMembersStatsFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationMembersStatsFields on OrganizationMembersStats {
  totalPdus
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
}
    `, {"fragmentName":"OrganizationMembersStatsFields"}) as unknown as TypedDocumentString<OrganizationMembersStatsFieldsFragment, unknown>;
export const OrganizationMemberDetailFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationMemberDetailFields on OrganizationMemberDetail {
  id
  pdus
  notes
  email
  userId
  status
  jobRole
  pduGoal
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  pduProgress
  departmentId
  lastActivityAt
  organizationId
  lastCourseTitle
  departmentTitle
  completedLearning
}
    `, {"fragmentName":"OrganizationMemberDetailFields"}) as unknown as TypedDocumentString<OrganizationMemberDetailFieldsFragment, unknown>;
export const BulkAddOrganizationMembersResultFieldsFragmentDoc = new TypedDocumentString(`
    fragment BulkAddOrganizationMembersResultFields on BulkAddOrganizationMembersResult {
  errors
  failed
  created
  updated
  totalRows
}
    `, {"fragmentName":"BulkAddOrganizationMembersResultFields"}) as unknown as TypedDocumentString<BulkAddOrganizationMembersResultFieldsFragment, unknown>;
export const OrganizationMemberFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
    `, {"fragmentName":"OrganizationMemberFields"}) as unknown as TypedDocumentString<OrganizationMemberFieldsFragment, unknown>;
export const PaginatedOrganizationMembersFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedOrganizationMembersFields on PaginatedOrganizationMembers {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationMemberFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`, {"fragmentName":"PaginatedOrganizationMembersFields"}) as unknown as TypedDocumentString<PaginatedOrganizationMembersFieldsFragment, unknown>;
export const OrganizationAssignmentStatsFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationAssignmentStatsFields on OrganizationAssignmentStats {
  totalAssignments
  activeAssignments
  totalParticipants
  averageCompletionRate
}
    `, {"fragmentName":"OrganizationAssignmentStatsFields"}) as unknown as TypedDocumentString<OrganizationAssignmentStatsFieldsFragment, unknown>;
export const OrganizationAssignmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}
    `, {"fragmentName":"OrganizationAssignmentFields"}) as unknown as TypedDocumentString<OrganizationAssignmentFieldsFragment, unknown>;
export const PaginatedOrganizationAssignmentsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedOrganizationAssignmentsFields on PaginatedOrganizationAssignments {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationAssignmentFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}`, {"fragmentName":"PaginatedOrganizationAssignmentsFields"}) as unknown as TypedDocumentString<PaginatedOrganizationAssignmentsFieldsFragment, unknown>;
export const OrganizationReportSummaryFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationReportSummaryFields on OrganizationReportSummary {
  totalPdus
  averagePdus
  totalMembers
  requiredHours
  averageCompliance
}
    `, {"fragmentName":"OrganizationReportSummaryFields"}) as unknown as TypedDocumentString<OrganizationReportSummaryFieldsFragment, unknown>;
export const OrganizationReportTrendPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationReportTrendPointFields on OrganizationReportTrendPoint {
  date
  pdus
  label
  compliance
}
    `, {"fragmentName":"OrganizationReportTrendPointFields"}) as unknown as TypedDocumentString<OrganizationReportTrendPointFieldsFragment, unknown>;
export const OrganizationReportDepartmentFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationReportDepartmentFields on OrganizationReportDepartment {
  teamSize
  totalPdus
  compliance
  averagePdus
  departmentId
  departmentTitle
}
    `, {"fragmentName":"OrganizationReportDepartmentFields"}) as unknown as TypedDocumentString<OrganizationReportDepartmentFieldsFragment, unknown>;
export const OrganizationReportFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationReportFields on OrganizationReport {
  summary {
    ...OrganizationReportSummaryFields
  }
  complianceTrend {
    ...OrganizationReportTrendPointFields
  }
  departmentCompliance {
    ...OrganizationReportDepartmentFields
  }
}
    fragment OrganizationReportSummaryFields on OrganizationReportSummary {
  totalPdus
  averagePdus
  totalMembers
  requiredHours
  averageCompliance
}
fragment OrganizationReportTrendPointFields on OrganizationReportTrendPoint {
  date
  pdus
  label
  compliance
}
fragment OrganizationReportDepartmentFields on OrganizationReportDepartment {
  teamSize
  totalPdus
  compliance
  averagePdus
  departmentId
  departmentTitle
}`, {"fragmentName":"OrganizationReportFields"}) as unknown as TypedDocumentString<OrganizationReportFieldsFragment, unknown>;
export const OrganizationReportTopMemberFieldsFragmentDoc = new TypedDocumentString(`
    fragment OrganizationReportTopMemberFields on OrganizationReportTopMember {
  id
  pdus
  email
  userId
  fullName
  compliance
  departmentTitle
  completedLearning
}
    `, {"fragmentName":"OrganizationReportTopMemberFields"}) as unknown as TypedDocumentString<OrganizationReportTopMemberFieldsFragment, unknown>;
export const PaginatedOrganizationReportTopMembersFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedOrganizationReportTopMembersFields on PaginatedOrganizationReportTopMembers {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationReportTopMemberFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationReportTopMemberFields on OrganizationReportTopMember {
  id
  pdus
  email
  userId
  fullName
  compliance
  departmentTitle
  completedLearning
}`, {"fragmentName":"PaginatedOrganizationReportTopMembersFields"}) as unknown as TypedDocumentString<PaginatedOrganizationReportTopMembersFieldsFragment, unknown>;
export const PodcastFieldsFragmentDoc = new TypedDocumentString(`
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
    `, {"fragmentName":"PodcastFields"}) as unknown as TypedDocumentString<PodcastFieldsFragment, unknown>;
export const PodcastEpisodeFieldsFragmentDoc = new TypedDocumentString(`
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}
    `, {"fragmentName":"PodcastEpisodeFields"}) as unknown as TypedDocumentString<PodcastEpisodeFieldsFragment, unknown>;
export const PodcastPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"PodcastPageInfoFields"}) as unknown as TypedDocumentString<PodcastPageInfoFieldsFragment, unknown>;
export const ProfessionalSettingsFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalSettingsFields on ProfessionalSettings {
  id
  theme
  userId
  messages
  updatedAt
  createdAt
  showEmail
  loginAlerts
  courseUpdates
  eventReminders
  showCertificates
  profileVisibility
  interfaceLanguage
  pushNotifications
  emailNotifications
  showLearningProgress
}
    `, {"fragmentName":"ProfessionalSettingsFields"}) as unknown as TypedDocumentString<ProfessionalSettingsFieldsFragment, unknown>;
export const ProfessionalOverviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalOverviewFields on ProfessionalOverview {
  totalPdus
  activeCourses
  upcomingEvents
  professionalName
  completedCourses
  certificatesEarned
  yearlyPduGoalProgress
}
    `, {"fragmentName":"ProfessionalOverviewFields"}) as unknown as TypedDocumentString<ProfessionalOverviewFieldsFragment, unknown>;
export const ProfessionalTaxonomyTermFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
    `, {"fragmentName":"ProfessionalTaxonomyTermFields"}) as unknown as TypedDocumentString<ProfessionalTaxonomyTermFieldsFragment, unknown>;
export const ProfessionalTaxonomyGroupFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalTaxonomyGroupFields on ProfessionalTaxonomyGroup {
  kind
  groupKey
  groupLabel
  terms {
    ...ProfessionalTaxonomyTermFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}`, {"fragmentName":"ProfessionalTaxonomyGroupFields"}) as unknown as TypedDocumentString<ProfessionalTaxonomyGroupFieldsFragment, unknown>;
export const ProfessionalCpdPlanFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCpdPlanFields on ProfessionalCpdPlan {
  id
  year
  target
  category
}
    `, {"fragmentName":"ProfessionalCpdPlanFields"}) as unknown as TypedDocumentString<ProfessionalCpdPlanFieldsFragment, unknown>;
export const ProfessionalCredentialFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
    `, {"fragmentName":"ProfessionalCredentialFields"}) as unknown as TypedDocumentString<ProfessionalCredentialFieldsFragment, unknown>;
export const ProfessionalProfileCompletionFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
    `, {"fragmentName":"ProfessionalProfileCompletionFields"}) as unknown as TypedDocumentString<ProfessionalProfileCompletionFieldsFragment, unknown>;
export const ProfessionalDashboardProfileFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}`, {"fragmentName":"ProfessionalDashboardProfileFields"}) as unknown as TypedDocumentString<ProfessionalDashboardProfileFieldsFragment, unknown>;
export const ProfessionalSessionFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalSessionFields on ProfessionalSession {
  id
  userId
  status
  ipAddress
  userAgent
  expiresAt
  revokedAt
  createdAt
  updatedAt
}
    `, {"fragmentName":"ProfessionalSessionFields"}) as unknown as TypedDocumentString<ProfessionalSessionFieldsFragment, unknown>;
export const ProfessionalPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"ProfessionalPageInfoFields"}) as unknown as TypedDocumentString<ProfessionalPageInfoFieldsFragment, unknown>;
export const ProfessionalCourseFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCourseFields on ProfessionalCourse {
  id
  userId
  status
  progress
  contentId
  startedAt
  createdAt
  updatedAt
  canceledAt
  courseSlug
  contentType
  completedAt
  courseTitle
  courseLevel
  coursePrice
  courseRating
  courseIsFree
  providerName
  courseCurrency
  courseImageUrl
  courseCategory
  courseDescription
  courseRatingCount
  courseDurationMinutes
}
    `, {"fragmentName":"ProfessionalCourseFields"}) as unknown as TypedDocumentString<ProfessionalCourseFieldsFragment, unknown>;
export const PaginatedProfessionalCoursesFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalCoursesFields on PaginatedProfessionalCourses {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCourseFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCourseFields on ProfessionalCourse {
  id
  userId
  status
  progress
  contentId
  startedAt
  createdAt
  updatedAt
  canceledAt
  courseSlug
  contentType
  completedAt
  courseTitle
  courseLevel
  coursePrice
  courseRating
  courseIsFree
  providerName
  courseCurrency
  courseImageUrl
  courseCategory
  courseDescription
  courseRatingCount
  courseDurationMinutes
}`, {"fragmentName":"PaginatedProfessionalCoursesFields"}) as unknown as TypedDocumentString<PaginatedProfessionalCoursesFieldsFragment, unknown>;
export const ProfessionalPduTargetFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduTargetFields on ProfessionalPduTarget {
  id
  year
  target
  category
}
    `, {"fragmentName":"ProfessionalPduTargetFields"}) as unknown as TypedDocumentString<ProfessionalPduTargetFieldsFragment, unknown>;
export const ProfessionalPduCategorySummaryFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduCategorySummaryFields on ProfessionalPduCategorySummary {
  pdus
  category
}
    `, {"fragmentName":"ProfessionalPduCategorySummaryFields"}) as unknown as TypedDocumentString<ProfessionalPduCategorySummaryFieldsFragment, unknown>;
export const ProfessionalPduMonthlyPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduMonthlyPointFields on ProfessionalPduMonthlyPoint {
  month
  pdus
}
    `, {"fragmentName":"ProfessionalPduMonthlyPointFields"}) as unknown as TypedDocumentString<ProfessionalPduMonthlyPointFieldsFragment, unknown>;
export const ProfessionalPduReportFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduReportFields on ProfessionalPduReport {
  year
  totalPdus
  activities
  progressToGoal
  averagePerMonth
  targets {
    ...ProfessionalPduTargetFields
  }
  byCategory {
    ...ProfessionalPduCategorySummaryFields
  }
  byMonth {
    ...ProfessionalPduMonthlyPointFields
  }
}
    fragment ProfessionalPduTargetFields on ProfessionalPduTarget {
  id
  year
  target
  category
}
fragment ProfessionalPduCategorySummaryFields on ProfessionalPduCategorySummary {
  pdus
  category
}
fragment ProfessionalPduMonthlyPointFields on ProfessionalPduMonthlyPoint {
  month
  pdus
}`, {"fragmentName":"ProfessionalPduReportFields"}) as unknown as TypedDocumentString<ProfessionalPduReportFieldsFragment, unknown>;
export const ProfessionalPduActivityFileFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
    `, {"fragmentName":"ProfessionalPduActivityFileFields"}) as unknown as TypedDocumentString<ProfessionalPduActivityFileFieldsFragment, unknown>;
export const ProfessionalPduActivityFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}`, {"fragmentName":"ProfessionalPduActivityFields"}) as unknown as TypedDocumentString<ProfessionalPduActivityFieldsFragment, unknown>;
export const PaginatedProfessionalPduActivitiesFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalPduActivitiesFields on PaginatedProfessionalPduActivities {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalPduActivityFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}`, {"fragmentName":"PaginatedProfessionalPduActivitiesFields"}) as unknown as TypedDocumentString<PaginatedProfessionalPduActivitiesFieldsFragment, unknown>;
export const ProfessionalPaymentFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPaymentFields on ProfessionalPayment {
  id
  title
  amount
  userId
  status
  paidAt
  currency
  contentId
  createdAt
  updatedAt
  receiptUrl
  contentType
  providerPaymentId
}
    `, {"fragmentName":"ProfessionalPaymentFields"}) as unknown as TypedDocumentString<ProfessionalPaymentFieldsFragment, unknown>;
export const PaginatedProfessionalPaymentsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalPaymentsFields on PaginatedProfessionalPayments {
  totalCount
  totalSpent
  totalTransactions
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalPaymentFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalPaymentFields on ProfessionalPayment {
  id
  title
  amount
  userId
  status
  paidAt
  currency
  contentId
  createdAt
  updatedAt
  receiptUrl
  contentType
  providerPaymentId
}`, {"fragmentName":"PaginatedProfessionalPaymentsFields"}) as unknown as TypedDocumentString<PaginatedProfessionalPaymentsFieldsFragment, unknown>;
export const ProfessionalCertificateSummaryFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCertificateSummaryFields on ProfessionalCertificateSummary {
  total
  active
  expiringSoon
  expired
  nearestExpiry
}
    `, {"fragmentName":"ProfessionalCertificateSummaryFields"}) as unknown as TypedDocumentString<ProfessionalCertificateSummaryFieldsFragment, unknown>;
export const ProfessionalCertificateFileFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
    `, {"fragmentName":"ProfessionalCertificateFileFields"}) as unknown as TypedDocumentString<ProfessionalCertificateFileFieldsFragment, unknown>;
export const ProfessionalCertificateFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}`, {"fragmentName":"ProfessionalCertificateFields"}) as unknown as TypedDocumentString<ProfessionalCertificateFieldsFragment, unknown>;
export const PaginatedProfessionalCertificatesFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalCertificatesFields on PaginatedProfessionalCertificates {
  totalCount
  totalPdusEarned
  totalCertificates
  activeCertificates
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCertificateFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}`, {"fragmentName":"PaginatedProfessionalCertificatesFields"}) as unknown as TypedDocumentString<PaginatedProfessionalCertificatesFieldsFragment, unknown>;
export const ProfessionalPduActivitySummaryFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalPduActivitySummaryFields on ProfessionalPduActivitySummary {
  completedActivities
  activitiesWithEvidence
  evidenceFilesCount
}
    `, {"fragmentName":"ProfessionalPduActivitySummaryFields"}) as unknown as TypedDocumentString<ProfessionalPduActivitySummaryFieldsFragment, unknown>;
export const ProfessionalRoadmapStepFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}
    `, {"fragmentName":"ProfessionalRoadmapStepFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapStepFieldsFragment, unknown>;
export const ProfessionalRoadmapPhaseFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalRoadmapPhaseFields on ProfessionalRoadmapPhase {
  id
  order
  title
  progress
  completed
  stepsCount
  description
  steps {
    ...ProfessionalRoadmapStepFields
  }
}
    fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}`, {"fragmentName":"ProfessionalRoadmapPhaseFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapPhaseFieldsFragment, unknown>;
export const ProfessionalRoadmapFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalRoadmapFields on ProfessionalRoadmap {
  id
  slug
  level
  title
  userId
  status
  imageUrl
  progress
  category
  updatedAt
  roadmapId
  enrolledAt
  totalSteps
  completedAt
  description
  phasesCount
  roadmapStatus
  completedSteps
  nextPhaseTitle
  completedPhases
  nextMilestoneProgress
  phases {
    ...ProfessionalRoadmapPhaseFields
  }
}
    fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}
fragment ProfessionalRoadmapPhaseFields on ProfessionalRoadmapPhase {
  id
  order
  title
  progress
  completed
  stepsCount
  description
  steps {
    ...ProfessionalRoadmapStepFields
  }
}`, {"fragmentName":"ProfessionalRoadmapFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapFieldsFragment, unknown>;
export const PaginatedProfessionalRoadmapsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalRoadmapsFields on PaginatedProfessionalRoadmaps {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalRoadmapFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}
fragment ProfessionalRoadmapPhaseFields on ProfessionalRoadmapPhase {
  id
  order
  title
  progress
  completed
  stepsCount
  description
  steps {
    ...ProfessionalRoadmapStepFields
  }
}
fragment ProfessionalRoadmapFields on ProfessionalRoadmap {
  id
  slug
  level
  title
  userId
  status
  imageUrl
  progress
  category
  updatedAt
  roadmapId
  enrolledAt
  totalSteps
  completedAt
  description
  phasesCount
  roadmapStatus
  completedSteps
  nextPhaseTitle
  completedPhases
  nextMilestoneProgress
  phases {
    ...ProfessionalRoadmapPhaseFields
  }
}`, {"fragmentName":"PaginatedProfessionalRoadmapsFields"}) as unknown as TypedDocumentString<PaginatedProfessionalRoadmapsFieldsFragment, unknown>;
export const ProfessionalExploreRoadmapFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalExploreRoadmapFields on ProfessionalExploreRoadmap {
  id
  slug
  title
  level
  status
  imageUrl
  category
  totalSteps
  isEnrolled
  description
  phasesCount
  estimatedWeeks
}
    `, {"fragmentName":"ProfessionalExploreRoadmapFields"}) as unknown as TypedDocumentString<ProfessionalExploreRoadmapFieldsFragment, unknown>;
export const PaginatedProfessionalExploreRoadmapsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalExploreRoadmapsFields on PaginatedProfessionalExploreRoadmaps {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalExploreRoadmapFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalExploreRoadmapFields on ProfessionalExploreRoadmap {
  id
  slug
  title
  level
  status
  imageUrl
  category
  totalSteps
  isEnrolled
  description
  phasesCount
  estimatedWeeks
}`, {"fragmentName":"PaginatedProfessionalExploreRoadmapsFields"}) as unknown as TypedDocumentString<PaginatedProfessionalExploreRoadmapsFieldsFragment, unknown>;
export const ProfessionalCalendarEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProfessionalCalendarEventFields on ProfessionalCalendarEvent {
  id
  status
  isLive
  isPast
  userId
  eventId
  createdAt
  updatedAt
  attendedAt
  isUpcoming
  completedAt
  durationMinutes
  startsInMinutes
  event {
    id
    pdu
    slug
    type
    title
    endDate
    timezone
    location
    onlineUrl
    startDate
    deliveryMode
  }
}
    `, {"fragmentName":"ProfessionalCalendarEventFields"}) as unknown as TypedDocumentString<ProfessionalCalendarEventFieldsFragment, unknown>;
export const PaginatedProfessionalCalendarEventsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProfessionalCalendarEventsFields on PaginatedProfessionalCalendarEvents {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCalendarEventFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCalendarEventFields on ProfessionalCalendarEvent {
  id
  status
  isLive
  isPast
  userId
  eventId
  createdAt
  updatedAt
  attendedAt
  isUpcoming
  completedAt
  durationMinutes
  startsInMinutes
  event {
    id
    pdu
    slug
    type
    title
    endDate
    timezone
    location
    onlineUrl
    startDate
    deliveryMode
  }
}`, {"fragmentName":"PaginatedProfessionalCalendarEventsFields"}) as unknown as TypedDocumentString<PaginatedProfessionalCalendarEventsFieldsFragment, unknown>;
export const ManualCalendarEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment ManualCalendarEventFields on ProfessionalManualCalendarEvent {
  id
  userId
  title
  type
  startDate
  endDate
  durationMinutes
  notes
  contentType
  contentId
  createdAt
  updatedAt
  isPast
  isLive
  isUpcoming
  startsInMinutes
}
    `, {"fragmentName":"ManualCalendarEventFields"}) as unknown as TypedDocumentString<ManualCalendarEventFieldsFragment, unknown>;
export const ProviderSettingsFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}
    `, {"fragmentName":"ProviderSettingsFields"}) as unknown as TypedDocumentString<ProviderSettingsFieldsFragment, unknown>;
export const ProviderStatusBreakdownFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}
    `, {"fragmentName":"ProviderStatusBreakdownFields"}) as unknown as TypedDocumentString<ProviderStatusBreakdownFieldsFragment, unknown>;
export const ProviderOverviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderOverviewFields on ProviderOverview {
  totalViews
  totalEvents
  providerName
  conversionRate
  upcomingSessions
  totalRegistrations
  statusBreakdown {
    ...ProviderStatusBreakdownFields
  }
}
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}`, {"fragmentName":"ProviderOverviewFields"}) as unknown as TypedDocumentString<ProviderOverviewFieldsFragment, unknown>;
export const ProviderTimeSeriesPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
    `, {"fragmentName":"ProviderTimeSeriesPointFields"}) as unknown as TypedDocumentString<ProviderTimeSeriesPointFieldsFragment, unknown>;
export const ProviderBreakdownPointFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
    `, {"fragmentName":"ProviderBreakdownPointFields"}) as unknown as TypedDocumentString<ProviderBreakdownPointFieldsFragment, unknown>;
export const ProviderTopEventFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}
    `, {"fragmentName":"ProviderTopEventFields"}) as unknown as TypedDocumentString<ProviderTopEventFieldsFragment, unknown>;
export const ProviderAnalyticsFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderAnalyticsFields on ProviderAnalytics {
  avgRating
  totalRevenue
  conversionRate
  avgFeePerAttendee
  registrationsOverTime {
    ...ProviderTimeSeriesPointFields
  }
  pdusByCategory {
    ...ProviderBreakdownPointFields
  }
  eventTypeBreakdown {
    ...ProviderBreakdownPointFields
  }
  topPerformingEvents {
    ...ProviderTopEventFields
  }
}
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}`, {"fragmentName":"ProviderAnalyticsFields"}) as unknown as TypedDocumentString<ProviderAnalyticsFieldsFragment, unknown>;
export const CsvExportFieldsFragmentDoc = new TypedDocumentString(`
    fragment CsvExportFields on CsvExport {
  filename
  mimeType
  content
}
    `, {"fragmentName":"CsvExportFields"}) as unknown as TypedDocumentString<CsvExportFieldsFragment, unknown>;
export const ProviderPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
    `, {"fragmentName":"ProviderPageInfoFields"}) as unknown as TypedDocumentString<ProviderPageInfoFieldsFragment, unknown>;
export const ProviderEventTableRowFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}
    `, {"fragmentName":"ProviderEventTableRowFields"}) as unknown as TypedDocumentString<ProviderEventTableRowFieldsFragment, unknown>;
export const PaginatedProviderEventsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProviderEventsFields on PaginatedProviderEvents {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderEventTableRowFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}`, {"fragmentName":"PaginatedProviderEventsFields"}) as unknown as TypedDocumentString<PaginatedProviderEventsFieldsFragment, unknown>;
export const PromotionRequestFieldsFragmentDoc = new TypedDocumentString(`
    fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}
    `, {"fragmentName":"PromotionRequestFields"}) as unknown as TypedDocumentString<PromotionRequestFieldsFragment, unknown>;
export const PaginatedPromotionRequestsFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedPromotionRequestsFields on PaginatedPromotionRequests {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...PromotionRequestFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}`, {"fragmentName":"PaginatedPromotionRequestsFields"}) as unknown as TypedDocumentString<PaginatedPromotionRequestsFieldsFragment, unknown>;
export const ProviderAttendeesStatsFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
    `, {"fragmentName":"ProviderAttendeesStatsFields"}) as unknown as TypedDocumentString<ProviderAttendeesStatsFieldsFragment, unknown>;
export const ProviderAttendeeFieldsFragmentDoc = new TypedDocumentString(`
    fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}
    `, {"fragmentName":"ProviderAttendeeFields"}) as unknown as TypedDocumentString<ProviderAttendeeFieldsFragment, unknown>;
export const PaginatedProviderAttendeesFieldsFragmentDoc = new TypedDocumentString(`
    fragment PaginatedProviderAttendeesFields on PaginatedProviderAttendees {
  totalCount
  stats {
    ...ProviderAttendeesStatsFields
  }
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderAttendeeFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}`, {"fragmentName":"PaginatedProviderAttendeesFields"}) as unknown as TypedDocumentString<PaginatedProviderAttendeesFieldsFragment, unknown>;
export const YouTubeChannelFieldsFragmentDoc = new TypedDocumentString(`
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
    `, {"fragmentName":"YouTubeChannelFields"}) as unknown as TypedDocumentString<YouTubeChannelFieldsFragment, unknown>;
export const YouTubeVideoFieldsFragmentDoc = new TypedDocumentString(`
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}
    `, {"fragmentName":"YouTubeVideoFields"}) as unknown as TypedDocumentString<YouTubeVideoFieldsFragment, unknown>;
export const YouTubeChannelPageInfoFieldsFragmentDoc = new TypedDocumentString(`
    fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"YouTubeChannelPageInfoFields"}) as unknown as TypedDocumentString<YouTubeChannelPageInfoFieldsFragment, unknown>;
export const AdminProfileDocument = new TypedDocumentString(`
    query AdminProfile {
  adminProfile {
    ...AdminDashboardProfileFields
  }
}
    fragment AdminDashboardProfileFields on AdminProfile {
  id
  bio
  role
  email
  status
  fullName
  avatarUrl
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<AdminProfileQuery, AdminProfileQueryVariables>;
export const UpdateAdminProfileDocument = new TypedDocumentString(`
    mutation UpdateAdminProfile($input: UpdateAdminProfile!) {
  updateAdminProfile(input: $input) {
    ...AdminDashboardProfileFields
  }
}
    fragment AdminDashboardProfileFields on AdminProfile {
  id
  bio
  role
  email
  status
  fullName
  avatarUrl
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateAdminProfileMutation, UpdateAdminProfileMutationVariables>;
export const AdminDashboardOverviewDocument = new TypedDocumentString(`
    query AdminDashboardOverview {
  adminDashboardOverview {
    ...AdminDashboardOverviewFields
  }
}
    fragment AdminDashboardRequestTrendPointFields on AdminRequestTrendPoint {
  date
  count
}
fragment AdminDashboardOverviewFields on AdminDashboardOverview {
  totalRequests
  pendingRequests
  approvedRequests
  rejectedRequests
  requestTrend {
    ...AdminDashboardRequestTrendPointFields
  }
}`) as unknown as TypedDocumentString<AdminDashboardOverviewQuery, AdminDashboardOverviewQueryVariables>;
export const AdminOrganizationsDocument = new TypedDocumentString(`
    query AdminOrganizations($filter: AdminOrgFilter, $pagination: AdminPagination) {
  adminOrganizations(filter: $filter, pagination: $pagination) {
    ...AdminDashboardPaginatedOrganizationsFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  updatedAt
  createdAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}
fragment AdminDashboardPaginatedOrganizationsFields on PaginatedAdminOrg {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardOrgFields
  }
}`) as unknown as TypedDocumentString<AdminOrganizationsQuery, AdminOrganizationsQueryVariables>;
export const AdminOrganizationMembersDocument = new TypedDocumentString(`
    query AdminOrganizationMembers($filter: AdminOrgMemberFilter!, $pagination: AdminPagination) {
  adminOrganizationMembers(filter: $filter, pagination: $pagination) {
    totalCount
    pageInfo {
      ...AdminDashboardPageInfoFields
    }
    items {
      ...AdminDashboardOrgMemberFields
    }
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardOrgMemberFields on AdminOrgMember {
  id
  pdus
  email
  status
  userId
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<AdminOrganizationMembersQuery, AdminOrganizationMembersQueryVariables>;
export const AdminOrganizationDetailDocument = new TypedDocumentString(`
    query AdminOrganizationDetail($organizationId: String!) {
  adminOrganizationDetail(organizationId: $organizationId) {
    ...AdminDashboardOrgDetailFields
  }
}
    fragment AdminDashboardOrgDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}
fragment AdminDashboardOrgDetailFields on AdminOrgDetail {
  id
  name
  ownerId
  logoUrl
  country
  website
  industry
  totalPdus
  ownerName
  updatedAt
  createdAt
  ownerEmail
  description
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
  settings {
    ...AdminDashboardOrganizationSettingsFields
  }
  departments {
    ...AdminDashboardOrgDepartmentFields
  }
}
fragment AdminDashboardOrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`) as unknown as TypedDocumentString<AdminOrganizationDetailQuery, AdminOrganizationDetailQueryVariables>;
export const UpdateAdminOrganizationSettingsDocument = new TypedDocumentString(`
    mutation UpdateAdminOrganizationSettings($input: UpdateAdminOrgSettings!) {
  updateAdminOrganizationSettings(input: $input) {
    ...AdminDashboardOrganizationSettingsFields
  }
}
    fragment AdminDashboardOrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`) as unknown as TypedDocumentString<UpdateAdminOrganizationSettingsMutation, UpdateAdminOrganizationSettingsMutationVariables>;
export const AdminOrgAccessRequestsDocument = new TypedDocumentString(`
    query AdminOrgAccessRequests($filter: AdminOrgAccessRequestFilter, $pagination: AdminPagination) {
  adminOrgAccessRequests(filter: $filter, pagination: $pagination) {
    ...AdminDashboardPaginatedOrgAccessRequestsFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}
fragment AdminDashboardPaginatedOrgAccessRequestsFields on PaginatedAdminOrgAccessRequests {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardOrgAccessRequestFields
  }
}`) as unknown as TypedDocumentString<AdminOrgAccessRequestsQuery, AdminOrgAccessRequestsQueryVariables>;
export const AdminOrgAccessRequestDetailDocument = new TypedDocumentString(`
    query AdminOrgAccessRequestDetail($requestId: String!) {
  adminOrgAccessRequestDetail(requestId: $requestId) {
    ...AdminDashboardOrgAccessRequestFields
  }
}
    fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}`) as unknown as TypedDocumentString<AdminOrgAccessRequestDetailQuery, AdminOrgAccessRequestDetailQueryVariables>;
export const ApproveAdminOrgAccessRequestDocument = new TypedDocumentString(`
    mutation ApproveAdminOrgAccessRequest($requestId: String!) {
  approveAdminOrgAccessRequest(requestId: $requestId) {
    ...AdminDashboardOrgAccessRequestFields
  }
}
    fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}`) as unknown as TypedDocumentString<ApproveAdminOrgAccessRequestMutation, ApproveAdminOrgAccessRequestMutationVariables>;
export const RejectAdminOrgAccessRequestDocument = new TypedDocumentString(`
    mutation RejectAdminOrgAccessRequest($input: RejectAdminOrgAccessRequestInput!) {
  rejectAdminOrgAccessRequest(input: $input) {
    ...AdminDashboardOrgAccessRequestFields
  }
}
    fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}`) as unknown as TypedDocumentString<RejectAdminOrgAccessRequestMutation, RejectAdminOrgAccessRequestMutationVariables>;
export const ResendAdminOrgAccessRequestNotificationDocument = new TypedDocumentString(`
    mutation ResendAdminOrgAccessRequestNotification($requestId: String!) {
  resendAdminOrgAccessRequestNotification(requestId: $requestId) {
    ...AdminDashboardOrgAccessRequestFields
  }
}
    fragment AdminDashboardOrgAccessRequestFields on AdminOrgAccessRequest {
  id
  goals
  status
  country
  workEmail
  createdAt
  updatedAt
  reviewedAt
  rejectReason
  reviewedByName
  organizationName
  organizationType
  representativeJobRole
  representativeFullName
  expectedLicensedProfessionals
  notificationStatus
  notificationSentAt
  notificationLastAttemptAt
  notificationFailureCode
}`) as unknown as TypedDocumentString<ResendAdminOrgAccessRequestNotificationMutation, ResendAdminOrgAccessRequestNotificationMutationVariables>;
export const AdminUsersDocument = new TypedDocumentString(`
    query AdminUsers($filter: AdminUserFilter, $pagination: AdminPagination) {
  adminUsers(filter: $filter, pagination: $pagination) {
    ...AdminDashboardPaginatedUsersFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardUserFields on AdminUser {
  id
  role
  email
  status
  fullName
  location
  avatarUrl
  isPremium
  createdAt
  updatedAt
  lastLoginAt
}
fragment AdminDashboardPaginatedUsersFields on PaginatedAdminUser {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardUserFields
  }
}`) as unknown as TypedDocumentString<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminUserGrowthDocument = new TypedDocumentString(`
    query AdminUserGrowth($mode: String) {
  adminUserGrowth(mode: $mode) {
    ...AdminDashboardUserGrowthPointFields
  }
}
    fragment AdminDashboardUserGrowthPointFields on AdminChartPoint {
  date
  label
  total
  providers
  professionals
}`) as unknown as TypedDocumentString<AdminUserGrowthQuery, AdminUserGrowthQueryVariables>;
export const UpdateAdminUserStatusDocument = new TypedDocumentString(`
    mutation UpdateAdminUserStatus($input: UpdateAdminUserStatus!) {
  updateAdminUserStatus(input: $input) {
    ...AdminDashboardUserFields
  }
}
    fragment AdminDashboardUserFields on AdminUser {
  id
  role
  email
  status
  fullName
  location
  avatarUrl
  isPremium
  createdAt
  updatedAt
  lastLoginAt
}`) as unknown as TypedDocumentString<UpdateAdminUserStatusMutation, UpdateAdminUserStatusMutationVariables>;
export const AdminAuditLogsDocument = new TypedDocumentString(`
    query AdminAuditLogs($filter: AdminAuditLogFilter, $pagination: AdminPagination) {
  adminAuditLogs(filter: $filter, pagination: $pagination) {
    ...AdminDashboardPaginatedAuditLogsFields
  }
}
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminDashboardAuditLogFields on AdminAuditLog {
  id
  action
  actorId
  entityId
  metadata
  createdAt
  actorEmail
  entityType
}
fragment AdminDashboardPaginatedAuditLogsFields on PaginatedAdminAuditLogs {
  totalCount
  pageInfo {
    ...AdminDashboardPageInfoFields
  }
  items {
    ...AdminDashboardAuditLogFields
  }
}`) as unknown as TypedDocumentString<AdminAuditLogsQuery, AdminAuditLogsQueryVariables>;
export const AdminOrganizationUsersDocument = new TypedDocumentString(`
    query AdminOrganizationUsers($filter: AdminOrgFilter, $pagination: AdminPagination) {
  adminOrganizations(filter: $filter, pagination: $pagination) {
    ...AdminOrgUsersPaginatedOrgsFields
  }
}
    fragment AdminOrgUsersPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
fragment AdminOrgUsersOrgFields on AdminOrg {
  id
  name
  logoUrl
  ownerName
  totalPdus
  createdAt
  updatedAt
  ownerEmail
  totalMembers
  activeMembers
  averageCompliance
}
fragment AdminOrgUsersPaginatedOrgsFields on PaginatedAdminOrg {
  totalCount
  pageInfo {
    ...AdminOrgUsersPageInfoFields
  }
  items {
    ...AdminOrgUsersOrgFields
  }
}`) as unknown as TypedDocumentString<AdminOrganizationUsersQuery, AdminOrganizationUsersQueryVariables>;
export const AdminOrganizationUserDetailDocument = new TypedDocumentString(`
    query AdminOrganizationUserDetail($organizationId: String!) {
  adminOrganizationDetail(organizationId: $organizationId) {
    ...AdminOrgUsersDetailFields
  }
}
    fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
fragment AdminOrgUsersSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}
fragment AdminOrgUsersDepartmentFields on OrganizationDepartment {
  id
  title
  organizationId
}
fragment AdminOrgUsersDetailFields on AdminOrgDetail {
  id
  name
  ownerId
  logoUrl
  country
  website
  industry
  ownerName
  totalPdus
  createdAt
  updatedAt
  ownerEmail
  description
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
  settings {
    ...AdminOrgUsersSettingsFields
  }
  departments {
    ...AdminOrgUsersDepartmentFields
  }
  members {
    ...AdminOrgUsersMemberFields
  }
}`) as unknown as TypedDocumentString<AdminOrganizationUserDetailQuery, AdminOrganizationUserDetailQueryVariables>;
export const UpdateAdminOrganizationMemberDocument = new TypedDocumentString(`
    mutation UpdateAdminOrganizationMember($input: UpdateAdminOrgMember!) {
  updateAdminOrganizationMember(input: $input) {
    ...AdminOrgUsersMemberFields
  }
}
    fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<UpdateAdminOrganizationMemberMutation, UpdateAdminOrganizationMemberMutationVariables>;
export const RemoveAdminOrganizationMemberDocument = new TypedDocumentString(`
    mutation RemoveAdminOrganizationMember($memberId: String!) {
  removeAdminOrganizationMember(memberId: $memberId) {
    ...AdminOrgUsersMemberFields
  }
}
    fragment AdminOrgUsersMemberFields on AdminOrgMember {
  id
  pdus
  email
  userId
  status
  jobRole
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<RemoveAdminOrganizationMemberMutation, RemoveAdminOrganizationMemberMutationVariables>;
export const UpdateAdminOrganizationSettingsForUsersDocument = new TypedDocumentString(`
    mutation UpdateAdminOrganizationSettingsForUsers($input: UpdateAdminOrgSettings!) {
  updateAdminOrganizationSettings(input: $input) {
    ...AdminOrgUsersSettingsFields
  }
}
    fragment AdminOrgUsersSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`) as unknown as TypedDocumentString<UpdateAdminOrganizationSettingsForUsersMutation, UpdateAdminOrganizationSettingsForUsersMutationVariables>;
export const OrganizationAccessRequestsDocument = new TypedDocumentString(`
    query OrganizationAccessRequests($filter: OrganizationAccessRequestFilterInput, $pagination: OrganizationAccessRequestPaginationInput) {
  organizationAccessRequests(filter: $filter, pagination: $pagination) {
    items {
      id
      goals
      status
      country
      createdAt
      updatedAt
      workEmail
      reviewedAt
      reviewedById
      rejectReason
      approvedUserId
      organizationType
      organizationName
      representativeJobRole
      representativeFullName
      expectedLicensedProfessionals
    }
    pageInfo {
      page
      limit
      totalPages
      totalItems
      hasNextPage
      hasPreviousPage
    }
  }
}
    `) as unknown as TypedDocumentString<OrganizationAccessRequestsQuery, OrganizationAccessRequestsQueryVariables>;
export const OrganizationAccessRequestByIdDocument = new TypedDocumentString(`
    query OrganizationAccessRequestById($requestId: String!) {
  organizationAccessRequestById(requestId: $requestId) {
    id
    goals
    status
    country
    workEmail
    createdAt
    updatedAt
    reviewedAt
    reviewedById
    rejectReason
    approvedUserId
    organizationName
    organizationType
    representativeJobRole
    representativeFullName
    expectedLicensedProfessionals
  }
}
    `) as unknown as TypedDocumentString<OrganizationAccessRequestByIdQuery, OrganizationAccessRequestByIdQueryVariables>;
export const UsersDocument = new TypedDocumentString(`
    query Users($filter: UserFilterInput, $pagination: UserPaginationInput) {
  users(filter: $filter, pagination: $pagination) {
    items {
      id
      bio
      role
      email
      phone
      status
      lastName
      fullName
      firstName
      avatarUrl
      createdAt
      updatedAt
      deletedAt
      lastLoginAt
      emailVerifiedAt
      phoneVerifiedAt
    }
    pageInfo {
      page
      limit
      totalItems
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
    `) as unknown as TypedDocumentString<UsersQuery, UsersQueryVariables>;
export const UserByIdDocument = new TypedDocumentString(`
    query UserById($userId: String!) {
  userById(userId: $userId) {
    id
    bio
    role
    email
    phone
    status
    lastName
    fullName
    firstName
    avatarUrl
    createdAt
    updatedAt
    deletedAt
    lastLoginAt
    emailVerifiedAt
    phoneVerifiedAt
    professionalProfile {
      id
      skills
      userId
      industry
      interests
      createdAt
      updatedAt
      profession
      currentRole
      workLocation
      experienceRange
    }
    providerProfile {
      id
      userId
      website
      logoUrl
      updatedAt
      createdAt
      isPremium
      contactEmail
      contactPhone
      organizationName
    }
    organizationProfile {
      id
      userId
      website
      logoUrl
      country
      industry
      timezone
      createdAt
      updatedAt
      memberLimit
      contactEmail
      contactPhone
      organizationName
    }
  }
}
    `) as unknown as TypedDocumentString<UserByIdQuery, UserByIdQueryVariables>;
export const UpdateUserDocument = new TypedDocumentString(`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    bio
    role
    email
    phone
    status
    fullName
    lastName
    avatarUrl
    firstName
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserStatusDocument = new TypedDocumentString(`
    mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
  updateUserStatus(input: $input) {
    id
    role
    email
    status
    fullName
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateUserStatusMutation, UpdateUserStatusMutationVariables>;
export const DeleteUserDocument = new TypedDocumentString(`
    mutation DeleteUser($userId: String!) {
  deleteUser(userId: $userId) {
    id
    role
    email
    status
    fullName
    deletedAt
  }
}
    `) as unknown as TypedDocumentString<DeleteUserMutation, DeleteUserMutationVariables>;
export const RestoreUserDocument = new TypedDocumentString(`
    mutation RestoreUser($userId: String!) {
  restoreUser(userId: $userId) {
    id
    role
    email
    status
    fullName
    deletedAt
  }
}
    `) as unknown as TypedDocumentString<RestoreUserMutation, RestoreUserMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    success
    code
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<RegisterMutation, RegisterMutationVariables>;
export const VerifyEmailOtpDocument = new TypedDocumentString(`
    mutation VerifyEmailOtp($input: VerifyEmailOtpInput!) {
  verifyEmailOtp(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<VerifyEmailOtpMutation, VerifyEmailOtpMutationVariables>;
export const ResendEmailOtpDocument = new TypedDocumentString(`
    mutation ResendEmailOtp($input: ResendEmailOtpInput!) {
  resendEmailOtp(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<ResendEmailOtpMutation, ResendEmailOtpMutationVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const RefreshTokenDocument = new TypedDocumentString(`
    mutation RefreshToken {
  refreshToken {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = new TypedDocumentString(`
    mutation ForgotPassword($input: ForgotPasswordInput!) {
  forgotPassword(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = new TypedDocumentString(`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const OrganizationActivationStatusDocument = new TypedDocumentString(`
    query OrganizationActivationStatus($token: String!) {
  organizationActivationStatus(token: $token) {
    status
    organizationName
  }
}
    `) as unknown as TypedDocumentString<OrganizationActivationStatusQuery, OrganizationActivationStatusQueryVariables>;
export const ActivateOrganizationAccountDocument = new TypedDocumentString(`
    mutation ActivateOrganizationAccount($input: ActivateOrganizationAccountInput!) {
  activateOrganizationAccount(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ActivateOrganizationAccountMutation, ActivateOrganizationAccountMutationVariables>;
export const ResendOrganizationActivationDocument = new TypedDocumentString(`
    mutation ResendOrganizationActivation($input: ResendOrganizationActivationInput!) {
  resendOrganizationActivation(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<ResendOrganizationActivationMutation, ResendOrganizationActivationMutationVariables>;
export const ChangePasswordDocument = new TypedDocumentString(`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const CurrentUserDocument = new TypedDocumentString(`
    query CurrentUser {
  currentUser {
    code
    success
    message
    user {
      id
      bio
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<CurrentUserQuery, CurrentUserQueryVariables>;
export const RequestEmailChangeDocument = new TypedDocumentString(`
    mutation RequestEmailChange($input: RequestEmailChangeInput!) {
  requestEmailChange(input: $input) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<RequestEmailChangeMutation, RequestEmailChangeMutationVariables>;
export const VerifyEmailChangeDocument = new TypedDocumentString(`
    mutation VerifyEmailChange($input: VerifyEmailChangeInput!) {
  verifyEmailChange(input: $input) {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<VerifyEmailChangeMutation, VerifyEmailChangeMutationVariables>;
export const GoogleOAuthUrlDocument = new TypedDocumentString(`
    query GoogleOAuthUrl($role: Role!) {
  googleOAuthUrl(role: $role) {
    url
  }
}
    `) as unknown as TypedDocumentString<GoogleOAuthUrlQuery, GoogleOAuthUrlQueryVariables>;
export const LinkedInOAuthUrlDocument = new TypedDocumentString(`
    query LinkedInOAuthUrl($role: Role!) {
  linkedinOAuthUrl(role: $role) {
    url
  }
}
    `) as unknown as TypedDocumentString<LinkedInOAuthUrlQuery, LinkedInOAuthUrlQueryVariables>;
export const MyWishlistDocument = new TypedDocumentString(`
    query MyWishlist($input: MyWishlistInput) {
  myWishlist(input: $input) {
    items {
      ...WishlistItemFields
    }
    page
    limit
    totalCount
    categories
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}
fragment WishlistItemFields on WishlistItem {
  id
  userId
  contentId
  createdAt
  contentType
  content {
    ...WishlistContentFields
  }
}`) as unknown as TypedDocumentString<MyWishlistQuery, MyWishlistQueryVariables>;
export const ToggleWishlistDocument = new TypedDocumentString(`
    mutation ToggleWishlist($input: ContentActionInput!) {
  toggleWishlist(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<ToggleWishlistMutation, ToggleWishlistMutationVariables>;
export const MyEnrollmentsDocument = new TypedDocumentString(`
    query MyEnrollments {
  myEnrollments {
    ...ContentEnrollmentFields
  }
}
    fragment ContentEnrollmentFields on ContentEnrollment {
  id
  userId
  status
  progress
  contentId
  createdAt
  startedAt
  updatedAt
  canceledAt
  contentType
  completedAt
}`) as unknown as TypedDocumentString<MyEnrollmentsQuery, MyEnrollmentsQueryVariables>;
export const MyCartDocument = new TypedDocumentString(`
    query MyCart {
  myCart {
    ...CartFields
  }
}
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}
fragment CartFields on Cart {
  id
  userId
  status
  items {
    ...CartItemFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MyCartQuery, MyCartQueryVariables>;
export const ContentReviewsDocument = new TypedDocumentString(`
    query ContentReviews($contentType: ContentType!, $contentId: String!) {
  contentReviews(contentType: $contentType, contentId: $contentId) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<ContentReviewsQuery, ContentReviewsQueryVariables>;
export const MyReviewForContentDocument = new TypedDocumentString(`
    query MyReviewForContent($contentType: ContentType!, $contentId: String!) {
  myReviewForContent(contentType: $contentType, contentId: $contentId) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<MyReviewForContentQuery, MyReviewForContentQueryVariables>;
export const EnrollContentDocument = new TypedDocumentString(`
    mutation EnrollContent($input: ContentActionInput!) {
  enrollContent(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<EnrollContentMutation, EnrollContentMutationVariables>;
export const CancelContentEnrollmentDocument = new TypedDocumentString(`
    mutation CancelContentEnrollment($input: ContentActionInput!) {
  cancelContentEnrollment(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<CancelContentEnrollmentMutation, CancelContentEnrollmentMutationVariables>;
export const UpdateEnrollmentProgressDocument = new TypedDocumentString(`
    mutation UpdateEnrollmentProgress($input: UpdateEnrollmentProgressInput!) {
  updateEnrollmentProgress(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<UpdateEnrollmentProgressMutation, UpdateEnrollmentProgressMutationVariables>;
export const SubmitContentReviewDocument = new TypedDocumentString(`
    mutation SubmitContentReview($input: SubmitContentReviewInput!) {
  submitContentReview(input: $input) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<SubmitContentReviewMutation, SubmitContentReviewMutationVariables>;
export const DeleteContentReviewDocument = new TypedDocumentString(`
    mutation DeleteContentReview($input: ContentActionInput!) {
  deleteContentReview(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<DeleteContentReviewMutation, DeleteContentReviewMutationVariables>;
export const AddToCartDocument = new TypedDocumentString(`
    mutation AddToCart($input: ContentActionInput!) {
  addToCart(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<AddToCartMutation, AddToCartMutationVariables>;
export const RemoveFromCartDocument = new TypedDocumentString(`
    mutation RemoveFromCart($input: ContentActionInput!) {
  removeFromCart(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = new TypedDocumentString(`
    mutation ClearCart {
  clearCart {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<ClearCartMutation, ClearCartMutationVariables>;
export const CoursesDocument = new TypedDocumentString(`
    query Courses($filter: CourseFilterInput, $pagination: CoursePaginationInput, $sort: CourseSortInput) {
  courses(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...CourseFields
    }
    totalCount
    pageInfo {
      ...CoursePageInfoFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<CoursesQuery, CoursesQueryVariables>;
export const CourseByIdDocument = new TypedDocumentString(`
    query CourseById($courseId: String!) {
  courseById(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<CourseByIdQuery, CourseByIdQueryVariables>;
export const CourseBySlugDocument = new TypedDocumentString(`
    query CourseBySlug($slug: String!) {
  courseBySlug(slug: $slug) {
    ...CourseFields
    curriculumSections {
      ...CurriculumSectionFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}
fragment CurriculumSectionFields on CurriculumSection {
  id
  title
  order
  courseId
  description
  lessons {
    ...CurriculumLessonFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CourseBySlugQuery, CourseBySlugQueryVariables>;
export const FeaturedCoursesDocument = new TypedDocumentString(`
    query FeaturedCourses($take: Int) {
  featuredCourses(take: $take) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<FeaturedCoursesQuery, FeaturedCoursesQueryVariables>;
export const MyProviderCoursesDocument = new TypedDocumentString(`
    query MyProviderCourses($filter: CourseFilterInput, $pagination: CoursePaginationInput, $sort: CourseSortInput) {
  myProviderCourses(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...CourseFields
    }
    totalCount
    pageInfo {
      ...CoursePageInfoFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderCoursesQuery, MyProviderCoursesQueryVariables>;
export const CreateCourseDocument = new TypedDocumentString(`
    mutation CreateCourse($input: CreateCourseInput!) {
  createCourse(input: $input) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<CreateCourseMutation, CreateCourseMutationVariables>;
export const UpdateCourseDocument = new TypedDocumentString(`
    mutation UpdateCourse($input: UpdateCourseInput!) {
  updateCourse(input: $input) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const PublishCourseDocument = new TypedDocumentString(`
    mutation PublishCourse($courseId: String!) {
  publishCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<PublishCourseMutation, PublishCourseMutationVariables>;
export const ArchiveCourseDocument = new TypedDocumentString(`
    mutation ArchiveCourse($courseId: String!) {
  archiveCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<ArchiveCourseMutation, ArchiveCourseMutationVariables>;
export const DeleteCourseDocument = new TypedDocumentString(`
    mutation DeleteCourse($courseId: String!) {
  deleteCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<DeleteCourseMutation, DeleteCourseMutationVariables>;
export const RestoreCourseDocument = new TypedDocumentString(`
    mutation RestoreCourse($courseId: String!) {
  restoreCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<RestoreCourseMutation, RestoreCourseMutationVariables>;
export const CertificationSearchDocument = new TypedDocumentString(`
    query CertificationSearch($input: CertificationSearchInput!) {
  certificationSearch(input: $input) {
    ...CertificationFields
  }
}
    fragment CertificationCategoryFields on CertificationCategory {
  id
  name
  requiredCredits
  order
}
fragment CertificationFields on Certification {
  id
  name
  abbreviation
  organization
  organizationAbbr
  association
  creditType
  renewalCycleLabel
  renewalCycleMonths
  totalRequiredCredits
  suggestedDeadline
  categories {
    ...CertificationCategoryFields
  }
}`) as unknown as TypedDocumentString<CertificationSearchQuery, CertificationSearchQueryVariables>;
export const MyCpdPlansDocument = new TypedDocumentString(`
    query MyCpdPlans {
  myCpdPlans {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MyCpdPlansQuery, MyCpdPlansQueryVariables>;
export const CpdPlanDocument = new TypedDocumentString(`
    query CpdPlan($planId: ID!) {
  cpdPlan(planId: $planId) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CpdPlanQuery, CpdPlanQueryVariables>;
export const CpdPlanProgressDocument = new TypedDocumentString(`
    query CpdPlanProgress($planId: ID!) {
  cpdPlanProgress(planId: $planId) {
    ...CpdPlanProgressFields
  }
}
    fragment CpdCategoryProgressFields on CpdCategoryProgress {
  id
  name
  target
  completed
  remaining
  progress
  isComplete
}
fragment CpdMissingRequirementFields on CpdMissingRequirement {
  code
  detail
}
fragment CpdPlanProgressFields on CpdPlanProgress {
  planId
  earnedCredits
  initialCompletedCredits
  activityCredits
  totalRequiredCredits
  remainingCredits
  progressPercent
  categoriesMissing
  evidenceMissing
  activitiesCounted
  complianceStatus
  reportingExpired
  reportingNotStarted
  categories {
    ...CpdCategoryProgressFields
  }
  missingRequirements {
    ...CpdMissingRequirementFields
  }
}`) as unknown as TypedDocumentString<CpdPlanProgressQuery, CpdPlanProgressQueryVariables>;
export const CpdReportRecipientsDocument = new TypedDocumentString(`
    query CpdReportRecipients {
  cpdReportRecipients {
    ...CpdReportRecipientOptionFields
  }
}
    fragment CpdReportRecipientOptionFields on CpdReportRecipientOption {
  type
  label
  description
}`) as unknown as TypedDocumentString<CpdReportRecipientsQuery, CpdReportRecipientsQueryVariables>;
export const CreateCpdPlanDocument = new TypedDocumentString(`
    mutation CreateCpdPlan($input: CreateCpdPlanInput!) {
  createCpdPlan(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCpdPlanMutation, CreateCpdPlanMutationVariables>;
export const CreateCpdPlanFromSuggestionDocument = new TypedDocumentString(`
    mutation CreateCpdPlanFromSuggestion($input: CreateCpdPlanFromSuggestionInput!) {
  createCpdPlanFromSuggestion(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CreateCpdPlanFromSuggestionMutation, CreateCpdPlanFromSuggestionMutationVariables>;
export const UpdateCpdPlanDocument = new TypedDocumentString(`
    mutation UpdateCpdPlan($input: UpdateCpdPlanInput!) {
  updateCpdPlan(input: $input) {
    ...CpdPlanFields
  }
}
    fragment CpdPlanCategoryFields on CpdPlanCategory {
  id
  name
  targetCredits
  completedCredits
  order
}
fragment CpdPlanFields on CpdPlan {
  id
  certificationId
  certificationName
  organization
  reportingStart
  reportingEnd
  creditType
  totalRequiredCredits
  initialCompletedCredits
  timeAvailable
  preferredFormats
  evidenceTypes
  evidenceOtherNote
  reportRecipientType
  reportRecipientLabel
  remindersEnabled
  reminderTiming
  status
  categories {
    ...CpdPlanCategoryFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<UpdateCpdPlanMutation, UpdateCpdPlanMutationVariables>;
export const DeleteCpdPlanDocument = new TypedDocumentString(`
    mutation DeleteCpdPlan($planId: ID!) {
  deleteCpdPlan(planId: $planId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteCpdPlanMutation, DeleteCpdPlanMutationVariables>;
export const EventsDocument = new TypedDocumentString(`
    query Events($filter: EventFilterInput, $pagination: EventPaginationInput, $sort: EventSortInput) {
  events(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...EventCardFields
    }
    totalCount
    pageInfo {
      ...EventPageInfoFields
    }
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<EventsQuery, EventsQueryVariables>;
export const EventByIdDocument = new TypedDocumentString(`
    query EventById($eventId: String!) {
  eventById(eventId: $eventId) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<EventByIdQuery, EventByIdQueryVariables>;
export const EventBySlugDocument = new TypedDocumentString(`
    query EventBySlug($slug: String!) {
  eventBySlug(slug: $slug) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<EventBySlugQuery, EventBySlugQueryVariables>;
export const UpcomingEventsDocument = new TypedDocumentString(`
    query UpcomingEvents($take: Int) {
  upcomingEvents(take: $take) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<UpcomingEventsQuery, UpcomingEventsQueryVariables>;
export const FeaturedEventsDocument = new TypedDocumentString(`
    query FeaturedEvents($take: Int) {
  featuredEvents(take: $take) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<FeaturedEventsQuery, FeaturedEventsQueryVariables>;
export const MyProviderEventsDocument = new TypedDocumentString(`
    query MyProviderEvents($filter: EventFilterInput, $pagination: EventPaginationInput, $sort: EventSortInput) {
  myProviderEvents(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...EventCardFields
    }
    totalCount
    pageInfo {
      ...EventPageInfoFields
    }
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventPageInfoFields on EventPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderEventsQuery, MyProviderEventsQueryVariables>;
export const MyRegisteredEventsDocument = new TypedDocumentString(`
    query MyRegisteredEvents {
  myRegisteredEvents {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<MyRegisteredEventsQuery, MyRegisteredEventsQueryVariables>;
export const CreateEventDocument = new TypedDocumentString(`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = new TypedDocumentString(`
    mutation UpdateEvent($input: UpdateEventInput!) {
  updateEvent(input: $input) {
    ...EventDetailFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}
fragment EventScheduleItemFields on EventScheduleItem {
  id
  title
  speaker
  eventId
  endTime
  updatedAt
  createdAt
  dayNumber
  startTime
  description
}
fragment EventDetailFields on Event {
  ...EventCardFields
  scheduleItems {
    ...EventScheduleItemFields
  }
}`) as unknown as TypedDocumentString<UpdateEventMutation, UpdateEventMutationVariables>;
export const RegisterEventDocument = new TypedDocumentString(`
    mutation RegisterEvent($eventId: String!) {
  registerEvent(eventId: $eventId) {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<RegisterEventMutation, RegisterEventMutationVariables>;
export const CancelEventRegistrationDocument = new TypedDocumentString(`
    mutation CancelEventRegistration($eventId: String!) {
  cancelEventRegistration(eventId: $eventId) {
    ...EventRegistrationFields
  }
}
    fragment EventRegistrationFields on EventRegistration {
  id
  userId
  status
  eventId
  createdAt
  updatedAt
  attendedAt
  completedAt
}`) as unknown as TypedDocumentString<CancelEventRegistrationMutation, CancelEventRegistrationMutationVariables>;
export const PublishEventDocument = new TypedDocumentString(`
    mutation PublishEvent($eventId: String!) {
  publishEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<PublishEventMutation, PublishEventMutationVariables>;
export const ArchiveEventDocument = new TypedDocumentString(`
    mutation ArchiveEvent($eventId: String!) {
  archiveEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<ArchiveEventMutation, ArchiveEventMutationVariables>;
export const CancelEventDocument = new TypedDocumentString(`
    mutation CancelEvent($eventId: String!) {
  cancelEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<CancelEventMutation, CancelEventMutationVariables>;
export const DeleteEventDocument = new TypedDocumentString(`
    mutation DeleteEvent($eventId: String!) {
  deleteEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<DeleteEventMutation, DeleteEventMutationVariables>;
export const RestoreEventDocument = new TypedDocumentString(`
    mutation RestoreEvent($eventId: String!) {
  restoreEvent(eventId: $eventId) {
    ...EventCardFields
  }
}
    fragment EventCardFields on Event {
  id
  pdu
  slug
  type
  title
  views
  price
  status
  isFree
  rating
  speaker
  endDate
  timezone
  imageUrl
  category
  location
  currency
  capacity
  language
  startDate
  onlineUrl
  attendees
  organizer
  updatedAt
  deletedAt
  createdAt
  providerId
  description
  ratingCount
  pduCategory
  deliveryMode
  averageRating
  specificTopic
  earlyBirdDiscount
  promotionVideoUrl
  registrationEnabled
}`) as unknown as TypedDocumentString<RestoreEventMutation, RestoreEventMutationVariables>;
export const TrackExternalLearningClickDocument = new TypedDocumentString(`
    mutation TrackExternalLearningClick($input: CreateExternalLearningClickInput!) {
  trackExternalLearningClick(input: $input) {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`) as unknown as TypedDocumentString<TrackExternalLearningClickMutation, TrackExternalLearningClickMutationVariables>;
export const MyExternalLearningActivitiesDocument = new TypedDocumentString(`
    query MyExternalLearningActivities($filter: ExternalLearningFilterInput, $pagination: OrganizationPaginationInput) {
  myExternalLearningActivities(filter: $filter, pagination: $pagination) {
    ...PaginatedExternalLearningFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}
fragment PaginatedExternalLearningFields on PaginatedExternalLearning {
  totalCount
  pageInfo {
    nextCursor
    hasNextPage
  }
  items {
    ...ExternalLearningActivityFields
  }
}`) as unknown as TypedDocumentString<MyExternalLearningActivitiesQuery, MyExternalLearningActivitiesQueryVariables>;
export const ConfirmExternalLearningDocument = new TypedDocumentString(`
    mutation ConfirmExternalLearning($input: ConfirmExternalLearningInput!) {
  confirmExternalLearning(input: $input) {
    ...ExternalLearningActivityFields
  }
}
    fragment ExternalLearningActivityFields on ExternalLearningActivity {
  id
  title
  status
  userId
  eventId
  courseId
  provider
  pduHours
  clickedAt
  createdAt
  startedAt
  updatedAt
  remindedAt
  rejectedAt
  verifiedAt
  externalUrl
  confirmedAt
  completedAt
  rejectReason
  evidenceNote
  licenseNumber
  certificateUrl
}`) as unknown as TypedDocumentString<ConfirmExternalLearningMutation, ConfirmExternalLearningMutationVariables>;
export const IgnoreExternalLearningDocument = new TypedDocumentString(`
    mutation IgnoreExternalLearning($activityId: String!) {
  ignoreExternalLearning(activityId: $activityId) {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<IgnoreExternalLearningMutation, IgnoreExternalLearningMutationVariables>;
export const PopularCategoriesDocument = new TypedDocumentString(`
    query PopularCategories($input: PopularCategoriesInput) {
  popularCategories(input: $input) {
    ...PopularCategoryFields
  }
}
    fragment PopularCategoryFields on PopularCategory {
  category
  totalItems
  courseCount
  eventCount
  podcastCount
  youtubeCount
  averageRating
  popularityScore
}`) as unknown as TypedDocumentString<PopularCategoriesQuery, PopularCategoriesQueryVariables>;
export const OrganizationOverviewDocument = new TypedDocumentString(`
    query OrganizationOverview {
  organizationOverview {
    ...OrganizationOverviewFields
  }
}
    fragment OrganizationOverviewSummaryFields on OrganizationOverviewSummary {
  totalPdus
  totalMembers
  activeMembers
  engagementRate
  averageCompliance
  activeAssignments
  nonCompliantMembers
}
fragment OrganizationComplianceDistributionFields on OrganizationComplianceDistribution {
  atRisk
  compliant
  nonCompliant
}
fragment OrganizationAttentionMemberFields on OrganizationAttentionMember {
  id
  pdus
  email
  userId
  pduGoal
  fullName
  avatarUrl
  compliance
  remainingPdus
  departmentTitle
}
fragment OrganizationTrendingTopicFields on OrganizationTrendingTopic {
  title
  count
  percentage
}
fragment OrganizationOverviewFields on OrganizationOverview {
  summary {
    ...OrganizationOverviewSummaryFields
  }
  complianceDistribution {
    ...OrganizationComplianceDistributionFields
  }
  attentionMembers {
    ...OrganizationAttentionMemberFields
  }
  trendingTopics {
    ...OrganizationTrendingTopicFields
  }
}`) as unknown as TypedDocumentString<OrganizationOverviewQuery, OrganizationOverviewQueryVariables>;
export const OrganizationCpdCategoryStatsDocument = new TypedDocumentString(`
    query OrganizationCpdCategoryStats($year: String) {
  organizationCpdCategoryStats(year: $year) {
    ...OrganizationCpdCategoryStatsFields
  }
}
    fragment OrganizationCpdCategoryStatsFields on OrganizationCpdCategoryStats {
  totalCategories
  activeCategories
  totalRequiredHours
  mostPopularCategory
  mostPopularActiveMembers
}`) as unknown as TypedDocumentString<OrganizationCpdCategoryStatsQuery, OrganizationCpdCategoryStatsQueryVariables>;
export const OrganizationCpdCategoriesDocument = new TypedDocumentString(`
    query OrganizationCpdCategories($filter: OrganizationCpdCategoryFilterInput, $pagination: OrganizationPaginationInput) {
  organizationCpdCategories(filter: $filter, pagination: $pagination) {
    ...PaginatedOrganizationCpdCategoriesFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationCpdCategoryFields on OrganizationCpdCategory {
  id
  title
  category
  isActive
  updatedAt
  createdAt
  description
  totalMembers
  requiredHours
  activeMembers
  organizationId
}
fragment PaginatedOrganizationCpdCategoriesFields on PaginatedOrganizationCpdCategories {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationCpdCategoryFields
  }
}`) as unknown as TypedDocumentString<OrganizationCpdCategoriesQuery, OrganizationCpdCategoriesQueryVariables>;
export const CreateOrganizationCpdCategoryDocument = new TypedDocumentString(`
    mutation CreateOrganizationCpdCategory($input: CreateOrganizationCpdCategoryInput!) {
  createOrganizationCpdCategory(input: $input) {
    ...OrganizationCpdCategoryFields
  }
}
    fragment OrganizationCpdCategoryFields on OrganizationCpdCategory {
  id
  title
  category
  isActive
  updatedAt
  createdAt
  description
  totalMembers
  requiredHours
  activeMembers
  organizationId
}`) as unknown as TypedDocumentString<CreateOrganizationCpdCategoryMutation, CreateOrganizationCpdCategoryMutationVariables>;
export const UpdateOrganizationCpdCategoryDocument = new TypedDocumentString(`
    mutation UpdateOrganizationCpdCategory($input: UpdateOrganizationCpdCategoryInput!) {
  updateOrganizationCpdCategory(input: $input) {
    ...OrganizationCpdCategoryFields
  }
}
    fragment OrganizationCpdCategoryFields on OrganizationCpdCategory {
  id
  title
  category
  isActive
  updatedAt
  createdAt
  description
  totalMembers
  requiredHours
  activeMembers
  organizationId
}`) as unknown as TypedDocumentString<UpdateOrganizationCpdCategoryMutation, UpdateOrganizationCpdCategoryMutationVariables>;
export const DeleteOrganizationCpdCategoryDocument = new TypedDocumentString(`
    mutation DeleteOrganizationCpdCategory($categoryId: String!) {
  deleteOrganizationCpdCategory(categoryId: $categoryId) {
    code
    message
    success
  }
}
    `) as unknown as TypedDocumentString<DeleteOrganizationCpdCategoryMutation, DeleteOrganizationCpdCategoryMutationVariables>;
export const OrganizationSettingsDocument = new TypedDocumentString(`
    query OrganizationSettings {
  organizationSettings {
    ...OrganizationSettingsFields
  }
}
    fragment OrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`) as unknown as TypedDocumentString<OrganizationSettingsQuery, OrganizationSettingsQueryVariables>;
export const OrganizationDepartmentsDocument = new TypedDocumentString(`
    query OrganizationDepartments {
  organizationDepartments {
    ...OrganizationDepartmentFields
  }
}
    fragment OrganizationDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}`) as unknown as TypedDocumentString<OrganizationDepartmentsQuery, OrganizationDepartmentsQueryVariables>;
export const OrganizationEventCatalogDocument = new TypedDocumentString(`
    query OrganizationEventCatalog($filter: EventCatalogFilterInput, $pagination: OrganizationPaginationInput) {
  organizationEventCatalog(filter: $filter, pagination: $pagination) {
    ...PaginatedOrganizationEventCatalogFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationEventCatalogFields on OrganizationEventCatalogItem {
  id
  pdu
  slug
  type
  title
  price
  isFree
  rating
  speaker
  category
  capacity
  location
  currency
  imageUrl
  startDate
  onlineUrl
  description
  deliveryMode
  averageRating
}
fragment PaginatedOrganizationEventCatalogFields on PaginatedOrganizationEventCatalog {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationEventCatalogFields
  }
}`) as unknown as TypedDocumentString<OrganizationEventCatalogQuery, OrganizationEventCatalogQueryVariables>;
export const UpdateOrganizationSettingsDocument = new TypedDocumentString(`
    mutation UpdateOrganizationSettings($input: UpdateOrganizationSettingsInput!) {
  updateOrganizationSettings(input: $input) {
    ...OrganizationSettingsFields
  }
}
    fragment OrganizationSettingsFields on OrganizationSettings {
  id
  createdAt
  updatedAt
  minimumPdu
  organizationId
  complianceCycle
  strictCompliance
  complianceAlerts
  weeklySummaryReport
  assignmentNotifications
}`) as unknown as TypedDocumentString<UpdateOrganizationSettingsMutation, UpdateOrganizationSettingsMutationVariables>;
export const CreateOrganizationDepartmentDocument = new TypedDocumentString(`
    mutation CreateOrganizationDepartment($input: CreateOrganizationDepartmentInput!) {
  createOrganizationDepartment(input: $input) {
    ...OrganizationDepartmentFields
  }
}
    fragment OrganizationDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}`) as unknown as TypedDocumentString<CreateOrganizationDepartmentMutation, CreateOrganizationDepartmentMutationVariables>;
export const UpdateOrganizationDepartmentDocument = new TypedDocumentString(`
    mutation UpdateOrganizationDepartment($input: UpdateOrganizationDepartmentInput!) {
  updateOrganizationDepartment(input: $input) {
    ...OrganizationDepartmentFields
  }
}
    fragment OrganizationDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}`) as unknown as TypedDocumentString<UpdateOrganizationDepartmentMutation, UpdateOrganizationDepartmentMutationVariables>;
export const DeleteOrganizationDepartmentDocument = new TypedDocumentString(`
    mutation DeleteOrganizationDepartment($departmentId: String!) {
  deleteOrganizationDepartment(departmentId: $departmentId) {
    ...OrganizationDepartmentFields
  }
}
    fragment OrganizationDepartmentFields on OrganizationDepartment {
  id
  title
  isActive
  createdAt
  updatedAt
  description
  organizationId
}`) as unknown as TypedDocumentString<DeleteOrganizationDepartmentMutation, DeleteOrganizationDepartmentMutationVariables>;
export const AddOrganizationMemberDocument = new TypedDocumentString(`
    mutation AddOrganizationMember($input: AddOrganizationMemberInput!) {
  addOrganizationMember(input: $input) {
    ...OrganizationMemberFields
  }
}
    fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<AddOrganizationMemberMutation, AddOrganizationMemberMutationVariables>;
export const UpdateOrganizationMemberDocument = new TypedDocumentString(`
    mutation UpdateOrganizationMember($input: UpdateOrganizationMemberInput!) {
  updateOrganizationMember(input: $input) {
    ...OrganizationMemberFields
  }
}
    fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<UpdateOrganizationMemberMutation, UpdateOrganizationMemberMutationVariables>;
export const SubmitOrganizationAccessRequestDocument = new TypedDocumentString(`
    mutation SubmitOrganizationAccessRequest($input: SubmitOrganizationAccessRequestInput!) {
  submitOrganizationAccessRequest(input: $input) {
    id
    goals
    status
    country
    createdAt
    workEmail
    updatedAt
    reviewedAt
    reviewedById
    rejectReason
    approvedUserId
    organizationName
    organizationType
    representativeJobRole
    representativeFullName
    expectedLicensedProfessionals
  }
}
    `) as unknown as TypedDocumentString<SubmitOrganizationAccessRequestMutation, SubmitOrganizationAccessRequestMutationVariables>;
export const OrganizationMembersDocument = new TypedDocumentString(`
    query OrganizationMembers($filter: OrganizationMemberFilterInput, $pagination: OrganizationPaginationInput) {
  organizationMembers(filter: $filter, pagination: $pagination) {
    ...PaginatedOrganizationMembersFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}
fragment PaginatedOrganizationMembersFields on PaginatedOrganizationMembers {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationMemberFields
  }
}`) as unknown as TypedDocumentString<OrganizationMembersQuery, OrganizationMembersQueryVariables>;
export const OrganizationMembersStatsDocument = new TypedDocumentString(`
    query OrganizationMembersStats {
  organizationMembersStats {
    ...OrganizationMembersStatsFields
  }
}
    fragment OrganizationMembersStatsFields on OrganizationMembersStats {
  totalPdus
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
}`) as unknown as TypedDocumentString<OrganizationMembersStatsQuery, OrganizationMembersStatsQueryVariables>;
export const OrganizationMemberDetailDocument = new TypedDocumentString(`
    query OrganizationMemberDetail($memberId: String!) {
  organizationMemberDetail(memberId: $memberId) {
    ...OrganizationMemberDetailFields
  }
}
    fragment OrganizationMemberDetailFields on OrganizationMemberDetail {
  id
  pdus
  notes
  email
  userId
  status
  jobRole
  pduGoal
  joinedAt
  fullName
  avatarUrl
  createdAt
  updatedAt
  compliance
  pduProgress
  departmentId
  lastActivityAt
  organizationId
  lastCourseTitle
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<OrganizationMemberDetailQuery, OrganizationMemberDetailQueryVariables>;
export const BulkAddOrganizationMembersDocument = new TypedDocumentString(`
    mutation BulkAddOrganizationMembers($input: BulkAddOrganizationMembersInput!) {
  bulkAddOrganizationMembers(input: $input) {
    ...BulkAddOrganizationMembersResultFields
  }
}
    fragment BulkAddOrganizationMembersResultFields on BulkAddOrganizationMembersResult {
  errors
  failed
  created
  updated
  totalRows
}`) as unknown as TypedDocumentString<BulkAddOrganizationMembersMutation, BulkAddOrganizationMembersMutationVariables>;
export const UpdateOrganizationMemberNotesDocument = new TypedDocumentString(`
    mutation UpdateOrganizationMemberNotes($input: UpdateOrganizationMemberNotesInput!) {
  updateOrganizationMemberNotes(input: $input) {
    ...OrganizationMemberFields
  }
}
    fragment OrganizationMemberFields on OrganizationMember {
  id
  pdus
  role
  email
  userId
  status
  jobRole
  fullName
  joinedAt
  createdAt
  avatarUrl
  updatedAt
  compliance
  departmentId
  organizationId
  departmentTitle
  completedLearning
}`) as unknown as TypedDocumentString<UpdateOrganizationMemberNotesMutation, UpdateOrganizationMemberNotesMutationVariables>;
export const OrganizationAssignmentsDocument = new TypedDocumentString(`
    query OrganizationAssignments($filter: OrganizationAssignmentFilterInput, $pagination: OrganizationPaginationInput) {
  organizationAssignments(filter: $filter, pagination: $pagination) {
    ...PaginatedOrganizationAssignmentsFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}
fragment PaginatedOrganizationAssignmentsFields on PaginatedOrganizationAssignments {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationAssignmentFields
  }
}`) as unknown as TypedDocumentString<OrganizationAssignmentsQuery, OrganizationAssignmentsQueryVariables>;
export const CreateOrganizationAssignmentDocument = new TypedDocumentString(`
    mutation CreateOrganizationAssignment($input: CreateOrganizationAssignmentInput!) {
  createOrganizationAssignment(input: $input) {
    ...OrganizationAssignmentFields
  }
}
    fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}`) as unknown as TypedDocumentString<CreateOrganizationAssignmentMutation, CreateOrganizationAssignmentMutationVariables>;
export const OrganizationAssignmentStatsDocument = new TypedDocumentString(`
    query OrganizationAssignmentStats {
  organizationAssignmentStats {
    ...OrganizationAssignmentStatsFields
  }
}
    fragment OrganizationAssignmentStatsFields on OrganizationAssignmentStats {
  totalAssignments
  activeAssignments
  totalParticipants
  averageCompletionRate
}`) as unknown as TypedDocumentString<OrganizationAssignmentStatsQuery, OrganizationAssignmentStatsQueryVariables>;
export const UpdateOrganizationAssignmentDocument = new TypedDocumentString(`
    mutation UpdateOrganizationAssignment($input: UpdateOrganizationAssignmentInput!) {
  updateOrganizationAssignment(input: $input) {
    ...OrganizationAssignmentFields
  }
}
    fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}`) as unknown as TypedDocumentString<UpdateOrganizationAssignmentMutation, UpdateOrganizationAssignmentMutationVariables>;
export const DeleteOrganizationAssignmentDocument = new TypedDocumentString(`
    mutation DeleteOrganizationAssignment($assignmentId: String!) {
  deleteOrganizationAssignment(assignmentId: $assignmentId) {
    ...OrganizationAssignmentFields
  }
}
    fragment OrganizationAssignmentFields on OrganizationAssignment {
  id
  type
  title
  status
  dueDate
  members
  eventId
  courseId
  progress
  createdAt
  updatedAt
  eventTitle
  targetRole
  targetKind
  createdById
  description
  courseTitle
  departmentId
  organizationId
  targetMemberId
}`) as unknown as TypedDocumentString<DeleteOrganizationAssignmentMutation, DeleteOrganizationAssignmentMutationVariables>;
export const OrganizationReportsDocument = new TypedDocumentString(`
    query OrganizationReports($filter: OrganizationReportFilterInput) {
  organizationReports(filter: $filter) {
    ...OrganizationReportFields
  }
}
    fragment OrganizationReportSummaryFields on OrganizationReportSummary {
  totalPdus
  averagePdus
  totalMembers
  requiredHours
  averageCompliance
}
fragment OrganizationReportTrendPointFields on OrganizationReportTrendPoint {
  date
  pdus
  label
  compliance
}
fragment OrganizationReportDepartmentFields on OrganizationReportDepartment {
  teamSize
  totalPdus
  compliance
  averagePdus
  departmentId
  departmentTitle
}
fragment OrganizationReportFields on OrganizationReport {
  summary {
    ...OrganizationReportSummaryFields
  }
  complianceTrend {
    ...OrganizationReportTrendPointFields
  }
  departmentCompliance {
    ...OrganizationReportDepartmentFields
  }
}`) as unknown as TypedDocumentString<OrganizationReportsQuery, OrganizationReportsQueryVariables>;
export const OrganizationReportTopMembersDocument = new TypedDocumentString(`
    query OrganizationReportTopMembers($filter: OrganizationReportTopMembersFilterInput, $pagination: OrganizationPaginationInput) {
  organizationReportTopMembers(filter: $filter, pagination: $pagination) {
    ...PaginatedOrganizationReportTopMembersFields
  }
}
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
fragment OrganizationReportTopMemberFields on OrganizationReportTopMember {
  id
  pdus
  email
  userId
  fullName
  compliance
  departmentTitle
  completedLearning
}
fragment PaginatedOrganizationReportTopMembersFields on PaginatedOrganizationReportTopMembers {
  totalCount
  pageInfo {
    ...OrganizationPageInfoFields
  }
  items {
    ...OrganizationReportTopMemberFields
  }
}`) as unknown as TypedDocumentString<OrganizationReportTopMembersQuery, OrganizationReportTopMembersQueryVariables>;
export const PodcastsDocument = new TypedDocumentString(`
    query Podcasts($filter: PodcastFilterInput, $pagination: PodcastPaginationInput, $sort: PodcastSortInput) {
  podcasts(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...PodcastFields
    }
    totalCount
    pageInfo {
      ...PodcastPageInfoFields
    }
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<PodcastsQuery, PodcastsQueryVariables>;
export const PodcastByIdDocument = new TypedDocumentString(`
    query PodcastById($podcastId: String!) {
  podcastById(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastByIdQuery, PodcastByIdQueryVariables>;
export const PodcastBySlugDocument = new TypedDocumentString(`
    query PodcastBySlug($slug: String!) {
  podcastBySlug(slug: $slug) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastBySlugQuery, PodcastBySlugQueryVariables>;
export const FeaturedPodcastsDocument = new TypedDocumentString(`
    query FeaturedPodcasts($take: Int) {
  featuredPodcasts(take: $take) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<FeaturedPodcastsQuery, FeaturedPodcastsQueryVariables>;
export const PodcastEpisodesDocument = new TypedDocumentString(`
    query PodcastEpisodes($podcastId: String!) {
  podcastEpisodes(podcastId: $podcastId) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<PodcastEpisodesQuery, PodcastEpisodesQueryVariables>;
export const MyProviderPodcastsDocument = new TypedDocumentString(`
    query MyProviderPodcasts($filter: PodcastFilterInput, $pagination: PodcastPaginationInput, $sort: PodcastSortInput) {
  myProviderPodcasts(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...PodcastFields
    }
    totalCount
    pageInfo {
      ...PodcastPageInfoFields
    }
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}
fragment PodcastPageInfoFields on PodcastPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderPodcastsQuery, MyProviderPodcastsQueryVariables>;
export const CreatePodcastDocument = new TypedDocumentString(`
    mutation CreatePodcast($input: CreatePodcastInput!) {
  createPodcast(input: $input) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<CreatePodcastMutation, CreatePodcastMutationVariables>;
export const UpdatePodcastDocument = new TypedDocumentString(`
    mutation UpdatePodcast($input: UpdatePodcastInput!) {
  updatePodcast(input: $input) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<UpdatePodcastMutation, UpdatePodcastMutationVariables>;
export const PublishPodcastDocument = new TypedDocumentString(`
    mutation PublishPodcast($podcastId: String!) {
  publishPodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<PublishPodcastMutation, PublishPodcastMutationVariables>;
export const ArchivePodcastDocument = new TypedDocumentString(`
    mutation ArchivePodcast($podcastId: String!) {
  archivePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<ArchivePodcastMutation, ArchivePodcastMutationVariables>;
export const DeletePodcastDocument = new TypedDocumentString(`
    mutation DeletePodcast($podcastId: String!) {
  deletePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<DeletePodcastMutation, DeletePodcastMutationVariables>;
export const RestorePodcastDocument = new TypedDocumentString(`
    mutation RestorePodcast($podcastId: String!) {
  restorePodcast(podcastId: $podcastId) {
    ...PodcastFields
  }
}
    fragment PodcastFields on Podcast {
  id
  host
  slug
  title
  status
  rating
  category
  imageUrl
  listeners
  createdAt
  updatedAt
  deletedAt
  isFeatured
  providerId
  description
  ratingCount
  episodeCount
  durationMinutes
}`) as unknown as TypedDocumentString<RestorePodcastMutation, RestorePodcastMutationVariables>;
export const CreatePodcastEpisodeDocument = new TypedDocumentString(`
    mutation CreatePodcastEpisode($input: CreatePodcastEpisodeInput!) {
  createPodcastEpisode(input: $input) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<CreatePodcastEpisodeMutation, CreatePodcastEpisodeMutationVariables>;
export const UpdatePodcastEpisodeDocument = new TypedDocumentString(`
    mutation UpdatePodcastEpisode($input: UpdatePodcastEpisodeInput!) {
  updatePodcastEpisode(input: $input) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<UpdatePodcastEpisodeMutation, UpdatePodcastEpisodeMutationVariables>;
export const DeletePodcastEpisodeDocument = new TypedDocumentString(`
    mutation DeletePodcastEpisode($episodeId: String!) {
  deletePodcastEpisode(episodeId: $episodeId) {
    ...PodcastEpisodeFields
  }
}
    fragment PodcastEpisodeFields on PodcastEpisode {
  id
  title
  audioUrl
  podcastId
  updatedAt
  createdAt
  publishedAt
  description
  episodeNumber
  durationMinutes
}`) as unknown as TypedDocumentString<DeletePodcastEpisodeMutation, DeletePodcastEpisodeMutationVariables>;
export const ProfessionalSettingsDocument = new TypedDocumentString(`
    query ProfessionalSettings {
  professionalSettings {
    ...ProfessionalSettingsFields
  }
}
    fragment ProfessionalSettingsFields on ProfessionalSettings {
  id
  theme
  userId
  messages
  updatedAt
  createdAt
  showEmail
  loginAlerts
  courseUpdates
  eventReminders
  showCertificates
  profileVisibility
  interfaceLanguage
  pushNotifications
  emailNotifications
  showLearningProgress
}`) as unknown as TypedDocumentString<ProfessionalSettingsQuery, ProfessionalSettingsQueryVariables>;
export const ProfessionalOverviewDocument = new TypedDocumentString(`
    query ProfessionalOverview {
  professionalOverview {
    ...ProfessionalOverviewFields
  }
}
    fragment ProfessionalOverviewFields on ProfessionalOverview {
  totalPdus
  activeCourses
  upcomingEvents
  professionalName
  completedCourses
  certificatesEarned
  yearlyPduGoalProgress
}`) as unknown as TypedDocumentString<ProfessionalOverviewQuery, ProfessionalOverviewQueryVariables>;
export const ProfessionalDashboardProfileDocument = new TypedDocumentString(`
    query ProfessionalDashboardProfile {
  professionalDashboardProfile {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<ProfessionalDashboardProfileQuery, ProfessionalDashboardProfileQueryVariables>;
export const ProfessionalProfileTaxonomyDocument = new TypedDocumentString(`
    query ProfessionalProfileTaxonomy($kind: ProfileTaxonomyKind) {
  professionalProfileTaxonomy(kind: $kind) {
    ...ProfessionalTaxonomyGroupFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalTaxonomyGroupFields on ProfessionalTaxonomyGroup {
  kind
  groupKey
  groupLabel
  terms {
    ...ProfessionalTaxonomyTermFields
  }
}`) as unknown as TypedDocumentString<ProfessionalProfileTaxonomyQuery, ProfessionalProfileTaxonomyQueryVariables>;
export const ProfessionalCpdPlansDocument = new TypedDocumentString(`
    query ProfessionalCpdPlans {
  professionalCpdPlans {
    ...ProfessionalCpdPlanFields
  }
}
    fragment ProfessionalCpdPlanFields on ProfessionalCpdPlan {
  id
  year
  target
  category
}`) as unknown as TypedDocumentString<ProfessionalCpdPlansQuery, ProfessionalCpdPlansQueryVariables>;
export const ProfessionalActiveSessionsDocument = new TypedDocumentString(`
    query ProfessionalActiveSessions {
  professionalActiveSessions {
    ...ProfessionalSessionFields
  }
}
    fragment ProfessionalSessionFields on ProfessionalSession {
  id
  userId
  status
  ipAddress
  userAgent
  expiresAt
  revokedAt
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<ProfessionalActiveSessionsQuery, ProfessionalActiveSessionsQueryVariables>;
export const ProfessionalMyCoursesDocument = new TypedDocumentString(`
    query ProfessionalMyCourses($filter: ProfessionalSearchInput, $pagination: ProfessionalPaginationInput) {
  professionalMyCourses(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalCoursesFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCourseFields on ProfessionalCourse {
  id
  userId
  status
  progress
  contentId
  startedAt
  createdAt
  updatedAt
  canceledAt
  courseSlug
  contentType
  completedAt
  courseTitle
  courseLevel
  coursePrice
  courseRating
  courseIsFree
  providerName
  courseCurrency
  courseImageUrl
  courseCategory
  courseDescription
  courseRatingCount
  courseDurationMinutes
}
fragment PaginatedProfessionalCoursesFields on PaginatedProfessionalCourses {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCourseFields
  }
}`) as unknown as TypedDocumentString<ProfessionalMyCoursesQuery, ProfessionalMyCoursesQueryVariables>;
export const ProfessionalPduReportDocument = new TypedDocumentString(`
    query ProfessionalPduReport($year: Int) {
  professionalPduReport(year: $year) {
    ...ProfessionalPduReportFields
  }
}
    fragment ProfessionalPduTargetFields on ProfessionalPduTarget {
  id
  year
  target
  category
}
fragment ProfessionalPduCategorySummaryFields on ProfessionalPduCategorySummary {
  pdus
  category
}
fragment ProfessionalPduMonthlyPointFields on ProfessionalPduMonthlyPoint {
  month
  pdus
}
fragment ProfessionalPduReportFields on ProfessionalPduReport {
  year
  totalPdus
  activities
  progressToGoal
  averagePerMonth
  targets {
    ...ProfessionalPduTargetFields
  }
  byCategory {
    ...ProfessionalPduCategorySummaryFields
  }
  byMonth {
    ...ProfessionalPduMonthlyPointFields
  }
}`) as unknown as TypedDocumentString<ProfessionalPduReportQuery, ProfessionalPduReportQueryVariables>;
export const ProfessionalPduActivitiesDocument = new TypedDocumentString(`
    query ProfessionalPduActivities($filter: ProfessionalPduActivityFilterInput, $pagination: ProfessionalPaginationInput) {
  professionalPduActivities(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalPduActivitiesFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}
fragment PaginatedProfessionalPduActivitiesFields on PaginatedProfessionalPduActivities {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalPduActivityFields
  }
}`) as unknown as TypedDocumentString<ProfessionalPduActivitiesQuery, ProfessionalPduActivitiesQueryVariables>;
export const ProfessionalPduActivityDocument = new TypedDocumentString(`
    query ProfessionalPduActivity($activityId: ID!) {
  professionalPduActivity(activityId: $activityId) {
    ...ProfessionalPduActivityFields
  }
}
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}`) as unknown as TypedDocumentString<ProfessionalPduActivityQuery, ProfessionalPduActivityQueryVariables>;
export const ProfessionalPduActivitySummaryDocument = new TypedDocumentString(`
    query ProfessionalPduActivitySummary {
  professionalPduActivitySummary {
    ...ProfessionalPduActivitySummaryFields
  }
}
    fragment ProfessionalPduActivitySummaryFields on ProfessionalPduActivitySummary {
  completedActivities
  activitiesWithEvidence
  evidenceFilesCount
}`) as unknown as TypedDocumentString<ProfessionalPduActivitySummaryQuery, ProfessionalPduActivitySummaryQueryVariables>;
export const ProfessionalContentCompletionDocument = new TypedDocumentString(`
    query ProfessionalContentCompletion($contentType: ContentType!, $contentId: ID!) {
  professionalContentCompletion(contentType: $contentType, contentId: $contentId) {
    ...ProfessionalPduActivityFields
  }
}
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}`) as unknown as TypedDocumentString<ProfessionalContentCompletionQuery, ProfessionalContentCompletionQueryVariables>;
export const ProfessionalPaymentsDocument = new TypedDocumentString(`
    query ProfessionalPayments($filter: ProfessionalSearchInput, $pagination: ProfessionalPaginationInput) {
  professionalPayments(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalPaymentsFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalPaymentFields on ProfessionalPayment {
  id
  title
  amount
  userId
  status
  paidAt
  currency
  contentId
  createdAt
  updatedAt
  receiptUrl
  contentType
  providerPaymentId
}
fragment PaginatedProfessionalPaymentsFields on PaginatedProfessionalPayments {
  totalCount
  totalSpent
  totalTransactions
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalPaymentFields
  }
}`) as unknown as TypedDocumentString<ProfessionalPaymentsQuery, ProfessionalPaymentsQueryVariables>;
export const ProfessionalCertificatesDocument = new TypedDocumentString(`
    query ProfessionalCertificates($filter: ProfessionalSearchInput, $status: CertificateStatusFilter, $sort: CertificateSort, $issuer: String, $cpdPlanId: ID, $unlinkedOnly: Boolean, $pagination: ProfessionalPaginationInput) {
  professionalCertificates(
    filter: $filter
    status: $status
    sort: $sort
    issuer: $issuer
    cpdPlanId: $cpdPlanId
    unlinkedOnly: $unlinkedOnly
    pagination: $pagination
  ) {
    ...PaginatedProfessionalCertificatesFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}
fragment PaginatedProfessionalCertificatesFields on PaginatedProfessionalCertificates {
  totalCount
  totalPdusEarned
  totalCertificates
  activeCertificates
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCertificateFields
  }
}`) as unknown as TypedDocumentString<ProfessionalCertificatesQuery, ProfessionalCertificatesQueryVariables>;
export const ProfessionalCertificateDocument = new TypedDocumentString(`
    query ProfessionalCertificate($id: ID!) {
  professionalCertificate(id: $id) {
    ...ProfessionalCertificateFields
  }
}
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}`) as unknown as TypedDocumentString<ProfessionalCertificateQuery, ProfessionalCertificateQueryVariables>;
export const ProfessionalCertificateSummaryDocument = new TypedDocumentString(`
    query ProfessionalCertificateSummary {
  professionalCertificateSummary {
    ...ProfessionalCertificateSummaryFields
  }
}
    fragment ProfessionalCertificateSummaryFields on ProfessionalCertificateSummary {
  total
  active
  expiringSoon
  expired
  nearestExpiry
}`) as unknown as TypedDocumentString<ProfessionalCertificateSummaryQuery, ProfessionalCertificateSummaryQueryVariables>;
export const ProfessionalCertificateIssuersDocument = new TypedDocumentString(`
    query ProfessionalCertificateIssuers {
  professionalCertificateIssuers
}
    `) as unknown as TypedDocumentString<ProfessionalCertificateIssuersQuery, ProfessionalCertificateIssuersQueryVariables>;
export const CreateProfessionalCertificateDocument = new TypedDocumentString(`
    mutation CreateProfessionalCertificate($input: CreateCertificateInput!) {
  createProfessionalCertificate(input: $input) {
    ...ProfessionalCertificateFields
  }
}
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}`) as unknown as TypedDocumentString<CreateProfessionalCertificateMutation, CreateProfessionalCertificateMutationVariables>;
export const UpdateProfessionalCertificateDocument = new TypedDocumentString(`
    mutation UpdateProfessionalCertificate($input: UpdateCertificateInput!) {
  updateProfessionalCertificate(input: $input) {
    ...ProfessionalCertificateFields
  }
}
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}`) as unknown as TypedDocumentString<UpdateProfessionalCertificateMutation, UpdateProfessionalCertificateMutationVariables>;
export const SetProfessionalCertificateCpdPlanDocument = new TypedDocumentString(`
    mutation SetProfessionalCertificateCpdPlan($input: SetCertificateCpdPlanInput!) {
  setProfessionalCertificateCpdPlan(input: $input) {
    ...ProfessionalCertificateFields
  }
}
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalCertificateFields on ProfessionalCertificate {
  id
  title
  issuer
  userId
  status
  issuedAt
  contentId
  pduEarned
  createdAt
  updatedAt
  validUntil
  contentType
  cpdPlanId
  cpdPlanName
  certificateUrl
  certificateNumber
  verificationCode
  evidenceFiles {
    ...ProfessionalCertificateFileFields
  }
}`) as unknown as TypedDocumentString<SetProfessionalCertificateCpdPlanMutation, SetProfessionalCertificateCpdPlanMutationVariables>;
export const DeleteProfessionalCertificateDocument = new TypedDocumentString(`
    mutation DeleteProfessionalCertificate($id: ID!) {
  deleteProfessionalCertificate(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalCertificateMutation, DeleteProfessionalCertificateMutationVariables>;
export const UpdateProfessionalSettingsDocument = new TypedDocumentString(`
    mutation UpdateProfessionalSettings($input: UpdateProfessionalSettingsInput!) {
  updateProfessionalSettings(input: $input) {
    ...ProfessionalSettingsFields
  }
}
    fragment ProfessionalSettingsFields on ProfessionalSettings {
  id
  theme
  userId
  messages
  updatedAt
  createdAt
  showEmail
  loginAlerts
  courseUpdates
  eventReminders
  showCertificates
  profileVisibility
  interfaceLanguage
  pushNotifications
  emailNotifications
  showLearningProgress
}`) as unknown as TypedDocumentString<UpdateProfessionalSettingsMutation, UpdateProfessionalSettingsMutationVariables>;
export const ResetProfessionalSettingsDocument = new TypedDocumentString(`
    mutation ResetProfessionalSettings {
  resetProfessionalSettings {
    ...ProfessionalSettingsFields
  }
}
    fragment ProfessionalSettingsFields on ProfessionalSettings {
  id
  theme
  userId
  messages
  updatedAt
  createdAt
  showEmail
  loginAlerts
  courseUpdates
  eventReminders
  showCertificates
  profileVisibility
  interfaceLanguage
  pushNotifications
  emailNotifications
  showLearningProgress
}`) as unknown as TypedDocumentString<ResetProfessionalSettingsMutation, ResetProfessionalSettingsMutationVariables>;
export const UpdateProfessionalBasicProfileDocument = new TypedDocumentString(`
    mutation UpdateProfessionalBasicProfile($input: UpdateProfessionalBasicProfileInput!) {
  updateProfessionalBasicProfile(input: $input) {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<UpdateProfessionalBasicProfileMutation, UpdateProfessionalBasicProfileMutationVariables>;
export const UpdateProfessionalDetailsDocument = new TypedDocumentString(`
    mutation UpdateProfessionalDetails($input: UpdateProfessionalDetailsInput!) {
  updateProfessionalDetails(input: $input) {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<UpdateProfessionalDetailsMutation, UpdateProfessionalDetailsMutationVariables>;
export const UpdateProfessionalSkillsDocument = new TypedDocumentString(`
    mutation UpdateProfessionalSkills($input: UpdateProfessionalSkillsInput!) {
  updateProfessionalSkills(input: $input) {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<UpdateProfessionalSkillsMutation, UpdateProfessionalSkillsMutationVariables>;
export const StartProfessionalOnboardingDocument = new TypedDocumentString(`
    mutation StartProfessionalOnboarding {
  startProfessionalOnboarding {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<StartProfessionalOnboardingMutation, StartProfessionalOnboardingMutationVariables>;
export const CompleteProfessionalOnboardingDocument = new TypedDocumentString(`
    mutation CompleteProfessionalOnboarding($input: CompleteProfessionalOnboardingInput!) {
  completeProfessionalOnboarding(input: $input) {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<CompleteProfessionalOnboardingMutation, CompleteProfessionalOnboardingMutationVariables>;
export const UpdateProfessionalPreferencesDocument = new TypedDocumentString(`
    mutation UpdateProfessionalPreferences($input: UpdateProfessionalPreferencesInput!) {
  updateProfessionalPreferences(input: $input) {
    ...ProfessionalDashboardProfileFields
  }
}
    fragment ProfessionalTaxonomyTermFields on ProfessionalTaxonomyTerm {
  id
  key
  kind
  label
  groupKey
  groupLabel
  sortOrder
}
fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}
fragment ProfessionalProfileCompletionFields on ProfessionalProfileCompletion {
  percentage
  completedCount
  totalSections
  sections {
    key
    isComplete
    missingFields
  }
}
fragment ProfessionalDashboardProfileFields on ProfessionalDashboardProfile {
  id
  bio
  role
  email
  phone
  status
  fullName
  avatarUrl
  isEmailVerified
  timeZone
  language
  countryCode
  linkedInUrl
  industry
  profession
  currentRole
  workLocation
  experienceRange
  professionalSummary
  professionalGoal
  onboardingCompletedAt
  targetSkillLevel
  currentSkillLevel
  mainSkillAreas {
    ...ProfessionalTaxonomyTermFields
  }
  favoriteSubjects {
    ...ProfessionalTaxonomyTermFields
  }
  skillsToImprove {
    ...ProfessionalTaxonomyTermFields
  }
  preferredLearningFormats
  learningTimeCommitment
  learningBudgetPreference
  credentials {
    ...ProfessionalCredentialFields
  }
  completion {
    ...ProfessionalProfileCompletionFields
  }
  learningHours
  coursesEnrolled
  certificatesEarned
}`) as unknown as TypedDocumentString<UpdateProfessionalPreferencesMutation, UpdateProfessionalPreferencesMutationVariables>;
export const CreateProfessionalCredentialDocument = new TypedDocumentString(`
    mutation CreateProfessionalCredential($input: CreateProfessionalCredentialInput!) {
  createProfessionalCredential(input: $input) {
    ...ProfessionalCredentialFields
  }
}
    fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}`) as unknown as TypedDocumentString<CreateProfessionalCredentialMutation, CreateProfessionalCredentialMutationVariables>;
export const UpdateProfessionalCredentialDocument = new TypedDocumentString(`
    mutation UpdateProfessionalCredential($input: UpdateProfessionalCredentialInput!) {
  updateProfessionalCredential(input: $input) {
    ...ProfessionalCredentialFields
  }
}
    fragment ProfessionalCredentialFields on ProfessionalCredential {
  id
  name
  issueDate
  expiryDate
  pduTargetId
  licenceNumber
  annualCpdHours
  certificationId
  issuingOrganization
}`) as unknown as TypedDocumentString<UpdateProfessionalCredentialMutation, UpdateProfessionalCredentialMutationVariables>;
export const DeleteProfessionalCredentialDocument = new TypedDocumentString(`
    mutation DeleteProfessionalCredential($credentialId: ID!) {
  deleteProfessionalCredential(credentialId: $credentialId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalCredentialMutation, DeleteProfessionalCredentialMutationVariables>;
export const CreateProfessionalPduActivityDocument = new TypedDocumentString(`
    mutation CreateProfessionalPduActivity($input: CreatePduActivityInput!) {
  createProfessionalPduActivity(input: $input) {
    ...ProfessionalPduActivityFields
  }
}
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}`) as unknown as TypedDocumentString<CreateProfessionalPduActivityMutation, CreateProfessionalPduActivityMutationVariables>;
export const UpdateProfessionalPduActivityDocument = new TypedDocumentString(`
    mutation UpdateProfessionalPduActivity($input: UpdatePduActivityInput!) {
  updateProfessionalPduActivity(input: $input) {
    ...ProfessionalPduActivityFields
  }
}
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
fragment ProfessionalPduActivityFields on ProfessionalPduActivity {
  id
  pdus
  date
  title
  status
  source
  category
  creditType
  completionStatus
  reportingYear
  providerOrganizer
  subCategory
  issuingOrganization
  relatedCertification
  learningOutcome
  evidenceNote
  updatedAt
  contentId
  createdAt
  description
  evidenceUrl
  contentType
  evidenceFiles {
    ...ProfessionalPduActivityFileFields
  }
}`) as unknown as TypedDocumentString<UpdateProfessionalPduActivityMutation, UpdateProfessionalPduActivityMutationVariables>;
export const DeleteProfessionalPduActivityDocument = new TypedDocumentString(`
    mutation DeleteProfessionalPduActivity($activityId: ID!) {
  deleteProfessionalPduActivity(activityId: $activityId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalPduActivityMutation, DeleteProfessionalPduActivityMutationVariables>;
export const UpsertProfessionalPduTargetDocument = new TypedDocumentString(`
    mutation UpsertProfessionalPduTarget($input: UpsertPduTargetInput!) {
  upsertProfessionalPduTarget(input: $input) {
    ...ProfessionalPduTargetFields
  }
}
    fragment ProfessionalPduTargetFields on ProfessionalPduTarget {
  id
  year
  target
  category
}`) as unknown as TypedDocumentString<UpsertProfessionalPduTargetMutation, UpsertProfessionalPduTargetMutationVariables>;
export const ProfessionalMyRoadmapsDocument = new TypedDocumentString(`
    query ProfessionalMyRoadmaps($filter: ProfessionalSearchInput, $pagination: ProfessionalPaginationInput) {
  professionalMyRoadmaps(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalRoadmapsFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}
fragment ProfessionalRoadmapPhaseFields on ProfessionalRoadmapPhase {
  id
  order
  title
  progress
  completed
  stepsCount
  description
  steps {
    ...ProfessionalRoadmapStepFields
  }
}
fragment ProfessionalRoadmapFields on ProfessionalRoadmap {
  id
  slug
  level
  title
  userId
  status
  imageUrl
  progress
  category
  updatedAt
  roadmapId
  enrolledAt
  totalSteps
  completedAt
  description
  phasesCount
  roadmapStatus
  completedSteps
  nextPhaseTitle
  completedPhases
  nextMilestoneProgress
  phases {
    ...ProfessionalRoadmapPhaseFields
  }
}
fragment PaginatedProfessionalRoadmapsFields on PaginatedProfessionalRoadmaps {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalRoadmapFields
  }
}`) as unknown as TypedDocumentString<ProfessionalMyRoadmapsQuery, ProfessionalMyRoadmapsQueryVariables>;
export const ProfessionalExploreRoadmapsDocument = new TypedDocumentString(`
    query ProfessionalExploreRoadmaps($filter: ProfessionalSearchInput, $pagination: ProfessionalPaginationInput) {
  professionalExploreRoadmaps(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalExploreRoadmapsFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalExploreRoadmapFields on ProfessionalExploreRoadmap {
  id
  slug
  title
  level
  status
  imageUrl
  category
  totalSteps
  isEnrolled
  description
  phasesCount
  estimatedWeeks
}
fragment PaginatedProfessionalExploreRoadmapsFields on PaginatedProfessionalExploreRoadmaps {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalExploreRoadmapFields
  }
}`) as unknown as TypedDocumentString<ProfessionalExploreRoadmapsQuery, ProfessionalExploreRoadmapsQueryVariables>;
export const ProfessionalCalendarEventsDocument = new TypedDocumentString(`
    query ProfessionalCalendarEvents($filter: ProfessionalCalendarEventsFilterInput, $pagination: ProfessionalPaginationInput) {
  professionalCalendarEvents(filter: $filter, pagination: $pagination) {
    ...PaginatedProfessionalCalendarEventsFields
  }
}
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
fragment ProfessionalCalendarEventFields on ProfessionalCalendarEvent {
  id
  status
  isLive
  isPast
  userId
  eventId
  createdAt
  updatedAt
  attendedAt
  isUpcoming
  completedAt
  durationMinutes
  startsInMinutes
  event {
    id
    pdu
    slug
    type
    title
    endDate
    timezone
    location
    onlineUrl
    startDate
    deliveryMode
  }
}
fragment PaginatedProfessionalCalendarEventsFields on PaginatedProfessionalCalendarEvents {
  totalCount
  pageInfo {
    ...ProfessionalPageInfoFields
  }
  items {
    ...ProfessionalCalendarEventFields
  }
}`) as unknown as TypedDocumentString<ProfessionalCalendarEventsQuery, ProfessionalCalendarEventsQueryVariables>;
export const MyCalendarEntriesDocument = new TypedDocumentString(`
    query MyCalendarEntries {
  myCalendarEntries {
    ...ManualCalendarEventFields
  }
}
    fragment ManualCalendarEventFields on ProfessionalManualCalendarEvent {
  id
  userId
  title
  type
  startDate
  endDate
  durationMinutes
  notes
  contentType
  contentId
  createdAt
  updatedAt
  isPast
  isLive
  isUpcoming
  startsInMinutes
}`) as unknown as TypedDocumentString<MyCalendarEntriesQuery, MyCalendarEntriesQueryVariables>;
export const CreateCalendarEventDocument = new TypedDocumentString(`
    mutation CreateCalendarEvent($input: CreateCalendarEventInput!) {
  createCalendarEvent(input: $input) {
    ...ManualCalendarEventFields
  }
}
    fragment ManualCalendarEventFields on ProfessionalManualCalendarEvent {
  id
  userId
  title
  type
  startDate
  endDate
  durationMinutes
  notes
  contentType
  contentId
  createdAt
  updatedAt
  isPast
  isLive
  isUpcoming
  startsInMinutes
}`) as unknown as TypedDocumentString<CreateCalendarEventMutation, CreateCalendarEventMutationVariables>;
export const DeleteCalendarEventDocument = new TypedDocumentString(`
    mutation DeleteCalendarEvent($id: ID!) {
  deleteCalendarEvent(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteCalendarEventMutation, DeleteCalendarEventMutationVariables>;
export const ProviderSettingsDocument = new TypedDocumentString(`
    query ProviderSettings {
  providerSettings {
    ...ProviderSettingsFields
  }
}
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}`) as unknown as TypedDocumentString<ProviderSettingsQuery, ProviderSettingsQueryVariables>;
export const ProviderOverviewDocument = new TypedDocumentString(`
    query ProviderOverview($input: ProviderDashboardRangeInput) {
  providerOverview(input: $input) {
    ...ProviderOverviewFields
  }
}
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}
fragment ProviderOverviewFields on ProviderOverview {
  totalViews
  totalEvents
  providerName
  conversionRate
  upcomingSessions
  totalRegistrations
  statusBreakdown {
    ...ProviderStatusBreakdownFields
  }
}`) as unknown as TypedDocumentString<ProviderOverviewQuery, ProviderOverviewQueryVariables>;
export const ProviderAnalyticsDocument = new TypedDocumentString(`
    query ProviderAnalytics($input: ProviderDashboardRangeInput) {
  providerAnalytics(input: $input) {
    ...ProviderAnalyticsFields
  }
}
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}
fragment ProviderAnalyticsFields on ProviderAnalytics {
  avgRating
  totalRevenue
  conversionRate
  avgFeePerAttendee
  registrationsOverTime {
    ...ProviderTimeSeriesPointFields
  }
  pdusByCategory {
    ...ProviderBreakdownPointFields
  }
  eventTypeBreakdown {
    ...ProviderBreakdownPointFields
  }
  topPerformingEvents {
    ...ProviderTopEventFields
  }
}`) as unknown as TypedDocumentString<ProviderAnalyticsQuery, ProviderAnalyticsQueryVariables>;
export const ProviderAnalyticsCsvDocument = new TypedDocumentString(`
    query ProviderAnalyticsCsv($input: ProviderDashboardRangeInput) {
  providerAnalyticsCsv(input: $input) {
    ...CsvExportFields
  }
}
    fragment CsvExportFields on CsvExport {
  filename
  mimeType
  content
}`) as unknown as TypedDocumentString<ProviderAnalyticsCsvQuery, ProviderAnalyticsCsvQueryVariables>;
export const ProviderEventsTableDocument = new TypedDocumentString(`
    query ProviderEventsTable($filter: ProviderEventsFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerEventsTable(filter: $filter, pagination: $pagination) {
    ...PaginatedProviderEventsFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}
fragment PaginatedProviderEventsFields on PaginatedProviderEvents {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderEventTableRowFields
  }
}`) as unknown as TypedDocumentString<ProviderEventsTableQuery, ProviderEventsTableQueryVariables>;
export const ProviderPromotionRequestsDocument = new TypedDocumentString(`
    query ProviderPromotionRequests($filter: ProviderPromotionFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerPromotionRequests(filter: $filter, pagination: $pagination) {
    ...PaginatedPromotionRequestsFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}
fragment PaginatedPromotionRequestsFields on PaginatedPromotionRequests {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...PromotionRequestFields
  }
}`) as unknown as TypedDocumentString<ProviderPromotionRequestsQuery, ProviderPromotionRequestsQueryVariables>;
export const UpdateProviderSettingsDocument = new TypedDocumentString(`
    mutation UpdateProviderSettings($input: UpdateProviderSettingsInput!) {
  updateProviderSettings(input: $input) {
    ...ProviderSettingsFields
  }
}
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}`) as unknown as TypedDocumentString<UpdateProviderSettingsMutation, UpdateProviderSettingsMutationVariables>;
export const SubmitPromotionRequestDocument = new TypedDocumentString(`
    mutation SubmitPromotionRequest($input: SubmitPromotionRequestInput!) {
  submitPromotionRequest(input: $input) {
    ...PromotionRequestFields
  }
}
    fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}`) as unknown as TypedDocumentString<SubmitPromotionRequestMutation, SubmitPromotionRequestMutationVariables>;
export const ProviderAttendeesDocument = new TypedDocumentString(`
    query ProviderAttendees($filter: ProviderAttendeesFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerAttendees(filter: $filter, pagination: $pagination) {
    ...PaginatedProviderAttendeesFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
fragment PaginatedProviderAttendeesFields on PaginatedProviderAttendees {
  totalCount
  stats {
    ...ProviderAttendeesStatsFields
  }
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderAttendeeFields
  }
}
fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}`) as unknown as TypedDocumentString<ProviderAttendeesQuery, ProviderAttendeesQueryVariables>;
export const SubmitContactInquiryDocument = new TypedDocumentString(`
    mutation SubmitContactInquiry($input: SubmitContactInquiryInput!) {
  submitContactInquiry(input: $input) {
    success
    code
    referenceId
  }
}
    `) as unknown as TypedDocumentString<SubmitContactInquiryMutation, SubmitContactInquiryMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    id
    bio
    role
    email
    phone
    status
    lastName
    fullName
    firstName
    avatarUrl
    updatedAt
    createdAt
    deletedAt
    lastLoginAt
    emailVerifiedAt
    phoneVerifiedAt
    professionalProfile {
      id
      userId
      skills
      industry
      interests
      createdAt
      updatedAt
      profession
      currentRole
      workLocation
      experienceRange
    }
    providerProfile {
      id
      userId
      website
      logoUrl
      isPremium
      createdAt
      updatedAt
      contactEmail
      contactPhone
      organizationName
    }
    organizationProfile {
      id
      userId
      website
      logoUrl
      country
      industry
      timezone
      createdAt
      updatedAt
      memberLimit
      contactEmail
      contactPhone
      organizationName
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const UpdateMeDocument = new TypedDocumentString(`
    mutation UpdateMe($input: UpdateMeInput!) {
  updateMe(input: $input) {
    id
    bio
    role
    email
    phone
    status
    lastName
    fullName
    avatarUrl
    firstName
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateMeMutation, UpdateMeMutationVariables>;
export const CreateUserDocument = new TypedDocumentString(`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    role
    email
    phone
    status
    fullName
    createdAt
  }
}
    `) as unknown as TypedDocumentString<CreateUserMutation, CreateUserMutationVariables>;
export const YouTubeChannelsDocument = new TypedDocumentString(`
    query YouTubeChannels($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput, $sort: YouTubeChannelSortInput) {
  youtubeChannels(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...YouTubeChannelFields
    }
    totalCount
    pageInfo {
      ...YouTubeChannelPageInfoFields
    }
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<YouTubeChannelsQuery, YouTubeChannelsQueryVariables>;
export const YouTubeChannelByIdDocument = new TypedDocumentString(`
    query YouTubeChannelById($channelId: String!) {
  youtubeChannelById(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<YouTubeChannelByIdQuery, YouTubeChannelByIdQueryVariables>;
export const YouTubeChannelBySlugDocument = new TypedDocumentString(`
    query YouTubeChannelBySlug($slug: String!) {
  youtubeChannelBySlug(slug: $slug) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<YouTubeChannelBySlugQuery, YouTubeChannelBySlugQueryVariables>;
export const FeaturedYouTubeChannelsDocument = new TypedDocumentString(`
    query FeaturedYouTubeChannels($take: Int) {
  featuredYouTubeChannels(take: $take) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<FeaturedYouTubeChannelsQuery, FeaturedYouTubeChannelsQueryVariables>;
export const YouTubeVideosDocument = new TypedDocumentString(`
    query YouTubeVideos($channelId: String!) {
  youtubeVideos(channelId: $channelId) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<YouTubeVideosQuery, YouTubeVideosQueryVariables>;
export const MyProviderYouTubeChannelsDocument = new TypedDocumentString(`
    query MyProviderYouTubeChannels($filter: YouTubeChannelFilterInput, $pagination: YouTubeChannelPaginationInput, $sort: YouTubeChannelSortInput) {
  myProviderYouTubeChannels(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...YouTubeChannelFields
    }
    totalCount
    pageInfo {
      ...YouTubeChannelPageInfoFields
    }
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}
fragment YouTubeChannelPageInfoFields on YouTubeChannelPageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderYouTubeChannelsQuery, MyProviderYouTubeChannelsQueryVariables>;
export const CreateYouTubeChannelDocument = new TypedDocumentString(`
    mutation CreateYouTubeChannel($input: CreateYouTubeChannelInput!) {
  createYouTubeChannel(input: $input) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<CreateYouTubeChannelMutation, CreateYouTubeChannelMutationVariables>;
export const UpdateYouTubeChannelDocument = new TypedDocumentString(`
    mutation UpdateYouTubeChannel($input: UpdateYouTubeChannelInput!) {
  updateYouTubeChannel(input: $input) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<UpdateYouTubeChannelMutation, UpdateYouTubeChannelMutationVariables>;
export const PublishYouTubeChannelDocument = new TypedDocumentString(`
    mutation PublishYouTubeChannel($channelId: String!) {
  publishYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<PublishYouTubeChannelMutation, PublishYouTubeChannelMutationVariables>;
export const ArchiveYouTubeChannelDocument = new TypedDocumentString(`
    mutation ArchiveYouTubeChannel($channelId: String!) {
  archiveYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<ArchiveYouTubeChannelMutation, ArchiveYouTubeChannelMutationVariables>;
export const DeleteYouTubeChannelDocument = new TypedDocumentString(`
    mutation DeleteYouTubeChannel($channelId: String!) {
  deleteYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<DeleteYouTubeChannelMutation, DeleteYouTubeChannelMutationVariables>;
export const RestoreYouTubeChannelDocument = new TypedDocumentString(`
    mutation RestoreYouTubeChannel($channelId: String!) {
  restoreYouTubeChannel(channelId: $channelId) {
    ...YouTubeChannelFields
  }
}
    fragment YouTubeChannelFields on YouTubeChannel {
  id
  slug
  views
  title
  status
  rating
  provider
  category
  imageUrl
  updatedAt
  createdAt
  deletedAt
  channelUrl
  isFeatured
  providerId
  videoCount
  ratingCount
  subscribers
  description
}`) as unknown as TypedDocumentString<RestoreYouTubeChannelMutation, RestoreYouTubeChannelMutationVariables>;
export const CreateYouTubeVideoDocument = new TypedDocumentString(`
    mutation CreateYouTubeVideo($input: CreateYouTubeVideoInput!) {
  createYouTubeVideo(input: $input) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<CreateYouTubeVideoMutation, CreateYouTubeVideoMutationVariables>;
export const UpdateYouTubeVideoDocument = new TypedDocumentString(`
    mutation UpdateYouTubeVideo($input: UpdateYouTubeVideoInput!) {
  updateYouTubeVideo(input: $input) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<UpdateYouTubeVideoMutation, UpdateYouTubeVideoMutationVariables>;
export const DeleteYouTubeVideoDocument = new TypedDocumentString(`
    mutation DeleteYouTubeVideo($videoId: String!) {
  deleteYouTubeVideo(videoId: $videoId) {
    ...YouTubeVideoFields
  }
}
    fragment YouTubeVideoFields on YouTubeVideo {
  id
  title
  views
  likes
  status
  videoUrl
  channelId
  createdAt
  updatedAt
  description
  publishedAt
  thumbnailUrl
  durationMinutes
}`) as unknown as TypedDocumentString<DeleteYouTubeVideoMutation, DeleteYouTubeVideoMutationVariables>;