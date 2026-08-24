import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ProfessionalPageInfoFieldsFragment = { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type ProfessionalSettingsFieldsFragment = { __typename?: 'ProfessionalSettings', id: string, theme: Types.Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: Types.ProfileVisibility, interfaceLanguage: Types.AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean };

export type ProfessionalOverviewFieldsFragment = { __typename?: 'ProfessionalOverview', totalPdus: number, activeCourses: number, upcomingEvents: number, professionalName?: string | null, completedCourses: number, certificatesEarned: number, yearlyPduGoalProgress: number };

export type ProfessionalTaxonomyTermFieldsFragment = { __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number };

export type ProfessionalTaxonomyGroupFieldsFragment = { __typename?: 'ProfessionalTaxonomyGroup', kind: Types.ProfileTaxonomyKind, groupKey: string, groupLabel: string, terms: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }> };

export type ProfessionalCredentialFieldsFragment = { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null };

export type ProfessionalCpdPlanFieldsFragment = { __typename?: 'ProfessionalCpdPlan', id: string, year: number, target: number, category: Types.PduCategory };

export type ProfessionalProfileCompletionFieldsFragment = { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> };

export type ProfessionalDashboardProfileFieldsFragment = { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } };

export type ProfessionalSessionFieldsFragment = { __typename?: 'ProfessionalSession', id: string, userId: string, status: Types.SessionStatus, ipAddress?: string | null, userAgent?: string | null, expiresAt: string, revokedAt?: string | null, createdAt: string, updatedAt: string };

export type ProfessionalCourseFieldsFragment = { __typename?: 'ProfessionalCourse', id: string, userId: string, status: Types.ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: Types.ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: Types.CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: Types.CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null };

export type PaginatedProfessionalCoursesFieldsFragment = { __typename?: 'PaginatedProfessionalCourses', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCourse', id: string, userId: string, status: Types.ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: Types.ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: Types.CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: Types.CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null }> };

export type ProfessionalPduTargetFieldsFragment = { __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: Types.PduCategory };

export type ProfessionalPduCategorySummaryFieldsFragment = { __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: Types.PduCategory };

export type ProfessionalPduMonthlyPointFieldsFragment = { __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number };

export type ProfessionalPduActivityFileFieldsFragment = { __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string };

export type ProfessionalPduActivityFieldsFragment = { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> };

export type ProfessionalPduReportFieldsFragment = { __typename?: 'ProfessionalPduReport', year: number, totalPdus: number, activities: number, progressToGoal: number, averagePerMonth: number, targets: Array<{ __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: Types.PduCategory }>, byCategory: Array<{ __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: Types.PduCategory }>, byMonth: Array<{ __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number }> };

export type PaginatedProfessionalPduActivitiesFieldsFragment = { __typename?: 'PaginatedProfessionalPduActivities', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> };

export type ProfessionalPaymentFieldsFragment = { __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: Types.PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: Types.ContentType | null, providerPaymentId?: string | null };

export type PaginatedProfessionalPaymentsFieldsFragment = { __typename?: 'PaginatedProfessionalPayments', totalCount: number, totalSpent: number, totalTransactions: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: Types.PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: Types.ContentType | null, providerPaymentId?: string | null }> };

export type ProfessionalCertificateFileFieldsFragment = { __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string };

export type ProfessionalCertificateFieldsFragment = { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> };

export type ProfessionalCertificateSummaryFieldsFragment = { __typename?: 'ProfessionalCertificateSummary', total: number, active: number, expiringSoon: number, expired: number, nearestExpiry?: string | null };

export type PaginatedProfessionalCertificatesFieldsFragment = { __typename?: 'PaginatedProfessionalCertificates', totalCount: number, totalPdusEarned: number, totalCertificates: number, activeCertificates: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> };

export type ProfessionalSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalSettingsQuery = { __typename?: 'Query', professionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Types.Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: Types.ProfileVisibility, interfaceLanguage: Types.AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type ProfessionalOverviewQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalOverviewQuery = { __typename?: 'Query', professionalOverview: { __typename?: 'ProfessionalOverview', totalPdus: number, activeCourses: number, upcomingEvents: number, professionalName?: string | null, completedCourses: number, certificatesEarned: number, yearlyPduGoalProgress: number } };

export type ProfessionalDashboardProfileQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalDashboardProfileQuery = { __typename?: 'Query', professionalDashboardProfile: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type ProfessionalProfileTaxonomyQueryVariables = Types.Exact<{
  kind?: Types.InputMaybe<Types.ProfileTaxonomyKind>;
}>;


export type ProfessionalProfileTaxonomyQuery = { __typename?: 'Query', professionalProfileTaxonomy: Array<{ __typename?: 'ProfessionalTaxonomyGroup', kind: Types.ProfileTaxonomyKind, groupKey: string, groupLabel: string, terms: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }> }> };

export type ProfessionalCpdPlansQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalCpdPlansQuery = { __typename?: 'Query', professionalCpdPlans: Array<{ __typename?: 'ProfessionalCpdPlan', id: string, year: number, target: number, category: Types.PduCategory }> };

export type ProfessionalActiveSessionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalActiveSessionsQuery = { __typename?: 'Query', professionalActiveSessions: Array<{ __typename?: 'ProfessionalSession', id: string, userId: string, status: Types.SessionStatus, ipAddress?: string | null, userAgent?: string | null, expiresAt: string, revokedAt?: string | null, createdAt: string, updatedAt: string }> };

export type ProfessionalMyCoursesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalSearchInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalMyCoursesQuery = { __typename?: 'Query', professionalMyCourses: { __typename?: 'PaginatedProfessionalCourses', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCourse', id: string, userId: string, status: Types.ContentEnrollmentStatus, progress: number, contentId: string, startedAt: string, createdAt: string, updatedAt: string, canceledAt?: string | null, courseSlug?: string | null, contentType: Types.ContentType, completedAt?: string | null, courseTitle?: string | null, courseLevel?: Types.CourseLevel | null, coursePrice?: number | null, courseRating?: number | null, courseIsFree?: boolean | null, providerName?: string | null, courseCurrency?: string | null, courseImageUrl?: string | null, courseCategory?: Types.CourseCategory | null, courseDescription?: string | null, courseRatingCount?: number | null, courseDurationMinutes?: number | null }> } };

export type ProfessionalPduReportQueryVariables = Types.Exact<{
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ProfessionalPduReportQuery = { __typename?: 'Query', professionalPduReport: { __typename?: 'ProfessionalPduReport', year: number, totalPdus: number, activities: number, progressToGoal: number, averagePerMonth: number, targets: Array<{ __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: Types.PduCategory }>, byCategory: Array<{ __typename?: 'ProfessionalPduCategorySummary', pdus: number, category: Types.PduCategory }>, byMonth: Array<{ __typename?: 'ProfessionalPduMonthlyPoint', month: number, pdus: number }> } };

export type ProfessionalPduActivitiesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalPduActivityFilterInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalPduActivitiesQuery = { __typename?: 'Query', professionalPduActivities: { __typename?: 'PaginatedProfessionalPduActivities', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> } };

export type ProfessionalPduActivityQueryVariables = Types.Exact<{
  activityId: Types.Scalars['ID']['input'];
}>;


export type ProfessionalPduActivityQuery = { __typename?: 'Query', professionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type ProfessionalPduActivitySummaryFieldsFragment = { __typename?: 'ProfessionalPduActivitySummary', completedActivities: number, activitiesWithEvidence: number, evidenceFilesCount: number };

export type ProfessionalPduActivitySummaryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalPduActivitySummaryQuery = { __typename?: 'Query', professionalPduActivitySummary: { __typename?: 'ProfessionalPduActivitySummary', completedActivities: number, activitiesWithEvidence: number, evidenceFilesCount: number } };

export type ProfessionalContentCompletionQueryVariables = Types.Exact<{
  contentType: Types.ContentType;
  contentId: Types.Scalars['ID']['input'];
}>;


export type ProfessionalContentCompletionQuery = { __typename?: 'Query', professionalContentCompletion?: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } | null };

export type ProfessionalPaymentsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalSearchInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalPaymentsQuery = { __typename?: 'Query', professionalPayments: { __typename?: 'PaginatedProfessionalPayments', totalCount: number, totalSpent: number, totalTransactions: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalPayment', id: string, title: string, amount: number, userId: string, status: Types.PaymentStatus, paidAt?: string | null, currency: string, contentId?: string | null, createdAt: string, updatedAt: string, receiptUrl?: string | null, contentType?: Types.ContentType | null, providerPaymentId?: string | null }> } };

export type ProfessionalCertificatesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalSearchInput>;
  status?: Types.InputMaybe<Types.CertificateStatusFilter>;
  sort?: Types.InputMaybe<Types.CertificateSort>;
  issuer?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cpdPlanId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  unlinkedOnly?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalCertificatesQuery = { __typename?: 'Query', professionalCertificates: { __typename?: 'PaginatedProfessionalCertificates', totalCount: number, totalPdusEarned: number, totalCertificates: number, activeCertificates: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> }> } };

export type ProfessionalCertificateQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type ProfessionalCertificateQuery = { __typename?: 'Query', professionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type ProfessionalCertificateSummaryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalCertificateSummaryQuery = { __typename?: 'Query', professionalCertificateSummary: { __typename?: 'ProfessionalCertificateSummary', total: number, active: number, expiringSoon: number, expired: number, nearestExpiry?: string | null } };

export type ProfessionalCertificateIssuersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProfessionalCertificateIssuersQuery = { __typename?: 'Query', professionalCertificateIssuers: Array<string> };

export type CreateProfessionalCertificateMutationVariables = Types.Exact<{
  input: Types.CreateCertificateInput;
}>;


export type CreateProfessionalCertificateMutation = { __typename?: 'Mutation', createProfessionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type UpdateProfessionalCertificateMutationVariables = Types.Exact<{
  input: Types.UpdateCertificateInput;
}>;


export type UpdateProfessionalCertificateMutation = { __typename?: 'Mutation', updateProfessionalCertificate: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type SetProfessionalCertificateCpdPlanMutationVariables = Types.Exact<{
  input: Types.SetCertificateCpdPlanInput;
}>;


export type SetProfessionalCertificateCpdPlanMutation = { __typename?: 'Mutation', setProfessionalCertificateCpdPlan: { __typename?: 'ProfessionalCertificate', id: string, title: string, issuer?: string | null, userId: string, status: Types.CertificateStatus, issuedAt: string, contentId?: string | null, pduEarned: number, createdAt: string, updatedAt: string, validUntil?: string | null, contentType?: Types.ContentType | null, cpdPlanId?: string | null, cpdPlanName?: string | null, certificateUrl?: string | null, certificateNumber?: string | null, verificationCode: string, evidenceFiles: Array<{ __typename?: 'ProfessionalCertificateFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type DeleteProfessionalCertificateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteProfessionalCertificateMutation = { __typename?: 'Mutation', deleteProfessionalCertificate: { __typename?: 'ProfessionalActionResponse', id: string } };

export type UpdateProfessionalSettingsMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalSettingsInput;
}>;


export type UpdateProfessionalSettingsMutation = { __typename?: 'Mutation', updateProfessionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Types.Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: Types.ProfileVisibility, interfaceLanguage: Types.AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type ResetProfessionalSettingsMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ResetProfessionalSettingsMutation = { __typename?: 'Mutation', resetProfessionalSettings: { __typename?: 'ProfessionalSettings', id: string, theme: Types.Theme, userId: string, messages: boolean, updatedAt: string, createdAt: string, showEmail: boolean, loginAlerts: boolean, courseUpdates: boolean, eventReminders: boolean, showCertificates: boolean, profileVisibility: Types.ProfileVisibility, interfaceLanguage: Types.AppLanguage, pushNotifications: boolean, emailNotifications: boolean, showLearningProgress: boolean } };

export type UpdateProfessionalBasicProfileMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalBasicProfileInput;
}>;


export type UpdateProfessionalBasicProfileMutation = { __typename?: 'Mutation', updateProfessionalBasicProfile: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalDetailsMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalDetailsInput;
}>;


export type UpdateProfessionalDetailsMutation = { __typename?: 'Mutation', updateProfessionalDetails: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalSkillsMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalSkillsInput;
}>;


export type UpdateProfessionalSkillsMutation = { __typename?: 'Mutation', updateProfessionalSkills: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type StartProfessionalOnboardingMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type StartProfessionalOnboardingMutation = { __typename?: 'Mutation', startProfessionalOnboarding: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type CompleteProfessionalOnboardingMutationVariables = Types.Exact<{
  input: Types.CompleteProfessionalOnboardingInput;
}>;


export type CompleteProfessionalOnboardingMutation = { __typename?: 'Mutation', completeProfessionalOnboarding: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type UpdateProfessionalPreferencesMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalPreferencesInput;
}>;


export type UpdateProfessionalPreferencesMutation = { __typename?: 'Mutation', updateProfessionalPreferences: { __typename?: 'ProfessionalDashboardProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, isEmailVerified: boolean, timeZone?: string | null, language?: Types.AppLanguage | null, countryCode?: string | null, linkedInUrl?: string | null, industry?: Types.ProfessionalIndustry | null, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null, professionalSummary?: string | null, professionalGoal?: Types.ProfessionalGoal | null, onboardingCompletedAt?: string | null, targetSkillLevel?: Types.SkillLevel | null, currentSkillLevel?: Types.SkillLevel | null, preferredLearningFormats: Array<Types.LearningFormat>, learningTimeCommitment?: Types.LearningTimeCommitment | null, learningBudgetPreference?: Types.LearningBudgetPreference | null, learningHours: number, coursesEnrolled: number, certificatesEarned: number, mainSkillAreas: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, favoriteSubjects: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, skillsToImprove: Array<{ __typename?: 'ProfessionalTaxonomyTerm', id: string, key: string, kind: Types.ProfileTaxonomyKind, label: string, groupKey: string, groupLabel: string, sortOrder: number }>, credentials: Array<{ __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null }>, completion: { __typename?: 'ProfessionalProfileCompletion', percentage: number, completedCount: number, totalSections: number, sections: Array<{ __typename?: 'ProfessionalProfileSection', key: Types.ProfileSectionKey, isComplete: boolean, missingFields: Array<string> }> } } };

export type CreateProfessionalCredentialMutationVariables = Types.Exact<{
  input: Types.CreateProfessionalCredentialInput;
}>;


export type CreateProfessionalCredentialMutation = { __typename?: 'Mutation', createProfessionalCredential: { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null } };

export type UpdateProfessionalCredentialMutationVariables = Types.Exact<{
  input: Types.UpdateProfessionalCredentialInput;
}>;


export type UpdateProfessionalCredentialMutation = { __typename?: 'Mutation', updateProfessionalCredential: { __typename?: 'ProfessionalCredential', id: string, name: string, issueDate?: string | null, expiryDate?: string | null, pduTargetId?: string | null, licenceNumber?: string | null, annualCpdHours?: number | null, certificationId?: string | null, issuingOrganization?: string | null } };

export type DeleteProfessionalCredentialMutationVariables = Types.Exact<{
  credentialId: Types.Scalars['ID']['input'];
}>;


export type DeleteProfessionalCredentialMutation = { __typename?: 'Mutation', deleteProfessionalCredential: { __typename?: 'ProfessionalActionResponse', id: string } };

export type CreateProfessionalPduActivityMutationVariables = Types.Exact<{
  input: Types.CreatePduActivityInput;
}>;


export type CreateProfessionalPduActivityMutation = { __typename?: 'Mutation', createProfessionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type UpdateProfessionalPduActivityMutationVariables = Types.Exact<{
  input: Types.UpdatePduActivityInput;
}>;


export type UpdateProfessionalPduActivityMutation = { __typename?: 'Mutation', updateProfessionalPduActivity: { __typename?: 'ProfessionalPduActivity', id: string, pdus: number, date: string, title: string, status: Types.PduStatus, source: Types.PduSource, category: Types.PduCategory, creditType: Types.CreditType, completionStatus: Types.PduCompletionStatus, reportingYear?: number | null, providerOrganizer?: string | null, subCategory?: string | null, issuingOrganization?: string | null, relatedCertification?: string | null, learningOutcome?: string | null, evidenceNote?: string | null, updatedAt: string, contentId?: string | null, createdAt: string, description?: string | null, evidenceUrl?: string | null, contentType?: Types.ContentType | null, evidenceFiles: Array<{ __typename?: 'ProfessionalPduActivityFile', id: string, fileName: string, mimeType: string, sizeBytes: number, createdAt: string }> } };

export type DeleteProfessionalPduActivityMutationVariables = Types.Exact<{
  activityId: Types.Scalars['ID']['input'];
}>;


export type DeleteProfessionalPduActivityMutation = { __typename?: 'Mutation', deleteProfessionalPduActivity: { __typename?: 'ProfessionalActionResponse', id: string } };

export type UpsertProfessionalPduTargetMutationVariables = Types.Exact<{
  input: Types.UpsertPduTargetInput;
}>;


export type UpsertProfessionalPduTargetMutation = { __typename?: 'Mutation', upsertProfessionalPduTarget: { __typename?: 'ProfessionalPduTarget', id: string, year: number, target: number, category: Types.PduCategory } };

export type ProfessionalRoadmapStepFieldsFragment = { __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: Types.ContentType | null };

export type ProfessionalRoadmapPhaseFieldsFragment = { __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: Types.ContentType | null }> };

export type ProfessionalRoadmapFieldsFragment = { __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: Types.CourseLevel, title: string, userId: string, status: Types.RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: Types.CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: Types.RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: Types.ContentType | null }> }> };

export type ProfessionalExploreRoadmapFieldsFragment = { __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: Types.CourseLevel, status: Types.RoadmapStatus, imageUrl?: string | null, category?: Types.CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number };

export type PaginatedProfessionalRoadmapsFieldsFragment = { __typename?: 'PaginatedProfessionalRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: Types.CourseLevel, title: string, userId: string, status: Types.RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: Types.CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: Types.RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: Types.ContentType | null }> }> }> };

export type PaginatedProfessionalExploreRoadmapsFieldsFragment = { __typename?: 'PaginatedProfessionalExploreRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: Types.CourseLevel, status: Types.RoadmapStatus, imageUrl?: string | null, category?: Types.CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number }> };

export type ProfessionalMyRoadmapsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalSearchInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalMyRoadmapsQuery = { __typename?: 'Query', professionalMyRoadmaps: { __typename?: 'PaginatedProfessionalRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalRoadmap', id: string, slug: string, level: Types.CourseLevel, title: string, userId: string, status: Types.RoadmapEnrollmentStatus, imageUrl?: string | null, progress: number, category?: Types.CourseCategory | null, updatedAt: string, roadmapId: string, enrolledAt: string, totalSteps: number, completedAt?: string | null, description: string, phasesCount: number, roadmapStatus: Types.RoadmapStatus, completedSteps: number, nextPhaseTitle?: string | null, completedPhases: number, nextMilestoneProgress: number, phases: Array<{ __typename?: 'ProfessionalRoadmapPhase', id: string, order: number, title: string, progress: number, completed: boolean, stepsCount: number, description?: string | null, steps: Array<{ __typename?: 'ProfessionalRoadmapStep', id: string, order: number, title: string, contentId?: string | null, description?: string | null, contentType?: Types.ContentType | null }> }> }> } };

export type ProfessionalExploreRoadmapsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalSearchInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalExploreRoadmapsQuery = { __typename?: 'Query', professionalExploreRoadmaps: { __typename?: 'PaginatedProfessionalExploreRoadmaps', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalExploreRoadmap', id: string, slug: string, title: string, level: Types.CourseLevel, status: Types.RoadmapStatus, imageUrl?: string | null, category?: Types.CourseCategory | null, totalSteps: number, isEnrolled: boolean, description: string, phasesCount: number, estimatedWeeks: number }> } };

export type ProfessionalCalendarEventFieldsFragment = { __typename?: 'ProfessionalCalendarEvent', id: string, status: Types.EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: Types.EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: Types.EventDeliveryMode } | null };

export type PaginatedProfessionalCalendarEventsFieldsFragment = { __typename?: 'PaginatedProfessionalCalendarEvents', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCalendarEvent', id: string, status: Types.EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: Types.EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: Types.EventDeliveryMode } | null }> };

export type ProfessionalCalendarEventsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProfessionalCalendarEventsFilterInput>;
  pagination?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalCalendarEventsQuery = { __typename?: 'Query', professionalCalendarEvents: { __typename?: 'PaginatedProfessionalCalendarEvents', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'ProfessionalCalendarEvent', id: string, status: Types.EventRegistrationStatus, isLive: boolean, isPast: boolean, userId: string, eventId: string, createdAt: string, updatedAt: string, attendedAt?: string | null, isUpcoming: boolean, completedAt?: string | null, durationMinutes: number, startsInMinutes?: number | null, event?: { __typename?: 'ProfessionalCalendarEventInfo', id: string, pdu: number, slug: string, type: Types.EventType, title: string, endDate?: string | null, timezone: string, location?: string | null, onlineUrl?: string | null, startDate: string, deliveryMode: Types.EventDeliveryMode } | null }> } };

export type ManualCalendarEventFieldsFragment = { __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: Types.CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: Types.ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null };

export type MyCalendarEntriesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyCalendarEntriesQuery = { __typename?: 'Query', myCalendarEntries: Array<{ __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: Types.CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: Types.ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null }> };

export type CreateCalendarEventMutationVariables = Types.Exact<{
  input: Types.CreateCalendarEventInput;
}>;


export type CreateCalendarEventMutation = { __typename?: 'Mutation', createCalendarEvent: { __typename?: 'ProfessionalManualCalendarEvent', id: string, userId: string, title: string, type: Types.CalendarEventType, startDate: string, endDate?: string | null, durationMinutes?: number | null, notes?: string | null, contentType?: Types.ContentType | null, contentId?: string | null, createdAt: string, updatedAt: string, isPast: boolean, isLive: boolean, isUpcoming: boolean, startsInMinutes?: number | null } };

export type DeleteCalendarEventMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DeleteCalendarEventMutation = { __typename?: 'Mutation', deleteCalendarEvent: { __typename?: 'ProfessionalActionResponse', id: string } };

export type RoadmapWidgetFieldsFragment = { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> };

export type RoadmapChatMessageFieldsFragment = { __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null };

export type ProfessionalRoadmapDraftFieldsFragment = { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } };

export type ProfessionalRoadmapDraftQueryVariables = Types.Exact<{
  draftId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  transcript?: Types.InputMaybe<Types.ProfessionalPaginationInput>;
}>;


export type ProfessionalRoadmapDraftQuery = { __typename?: 'Query', professionalRoadmapDraft?: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } | null };

export type StartRoadmapDraftMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type StartRoadmapDraftMutation = { __typename?: 'Mutation', startRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type SendRoadmapChatTurnMutationVariables = Types.Exact<{
  input: Types.RoadmapChatTurnInput;
}>;


export type SendRoadmapChatTurnMutation = { __typename?: 'Mutation', sendRoadmapChatTurn: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export type PatchRoadmapDraftMutationVariables = Types.Exact<{
  input: Types.PatchRoadmapDraftInput;
}>;


export type PatchRoadmapDraftMutation = { __typename?: 'Mutation', patchRoadmapDraft: { __typename?: 'ProfessionalRoadmapDraft', id: string, status: Types.RoadmapDraftStatus, currentStep: Types.RoadmapDraftStep, isComplete: boolean, needsClarification: boolean, wasRefused: boolean, updatedAt: string, goal?: string | null, targetRole?: string | null, goalReason?: string | null, context?: string | null, targetDate?: string | null, skillLevel?: Types.SkillLevel | null, timeCommitment?: Types.LearningTimeCommitment | null, budgetPreference?: Types.LearningBudgetPreference | null, subjects: Array<string>, preferredFormats: Array<Types.LearningFormat>, preferredContentTypes: Array<Types.ContentType>, cpdEnabled: boolean, certificationId?: string | null, certificationName?: string | null, requiredCredits?: number | null, completedCredits?: number | null, subjectOptions: Array<{ __typename?: 'RoadmapSubjectOption', id: string, label: string }>, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null, transcript: { __typename?: 'PaginatedRoadmapChatMessages', totalCount: number, pageInfo: { __typename?: 'ProfessionalPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'RoadmapChatMessage', id: string, role: Types.RoadmapChatRole, content: string, stepKey: Types.RoadmapDraftStep, createdAt: string, widget?: { __typename?: 'RoadmapWidget', type: Types.RoadmapWidgetKind, field: Types.RoadmapDraftFieldKey, maxSelections?: number | null, options: Array<{ __typename?: 'RoadmapWidgetOption', value: string, label: string }> } | null }> } } };

export const ProfessionalSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalOverviewFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalTaxonomyTermFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalTaxonomyGroupFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCpdPlanFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalCpdPlanFields on ProfessionalCpdPlan {
  id
  year
  target
  category
}
    `, {"fragmentName":"ProfessionalCpdPlanFields"}) as unknown as TypedDocumentString<ProfessionalCpdPlanFieldsFragment, unknown>;
export const ProfessionalCredentialFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalProfileCompletionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalDashboardProfileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalSessionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPageInfoFields on ProfessionalPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"ProfessionalPageInfoFields"}) as unknown as TypedDocumentString<ProfessionalPageInfoFieldsFragment, unknown>;
export const ProfessionalCourseFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalCoursesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduTargetFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPduTargetFields on ProfessionalPduTarget {
  id
  year
  target
  category
}
    `, {"fragmentName":"ProfessionalPduTargetFields"}) as unknown as TypedDocumentString<ProfessionalPduTargetFieldsFragment, unknown>;
export const ProfessionalPduCategorySummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPduCategorySummaryFields on ProfessionalPduCategorySummary {
  pdus
  category
}
    `, {"fragmentName":"ProfessionalPduCategorySummaryFields"}) as unknown as TypedDocumentString<ProfessionalPduCategorySummaryFieldsFragment, unknown>;
export const ProfessionalPduMonthlyPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPduMonthlyPointFields on ProfessionalPduMonthlyPoint {
  month
  pdus
}
    `, {"fragmentName":"ProfessionalPduMonthlyPointFields"}) as unknown as TypedDocumentString<ProfessionalPduMonthlyPointFieldsFragment, unknown>;
export const ProfessionalPduReportFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduActivityFileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPduActivityFileFields on ProfessionalPduActivityFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
    `, {"fragmentName":"ProfessionalPduActivityFileFields"}) as unknown as TypedDocumentString<ProfessionalPduActivityFileFieldsFragment, unknown>;
export const ProfessionalPduActivityFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalPduActivitiesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPaymentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalPaymentsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCertificateSummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalCertificateSummaryFields on ProfessionalCertificateSummary {
  total
  active
  expiringSoon
  expired
  nearestExpiry
}
    `, {"fragmentName":"ProfessionalCertificateSummaryFields"}) as unknown as TypedDocumentString<ProfessionalCertificateSummaryFieldsFragment, unknown>;
export const ProfessionalCertificateFileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalCertificateFileFields on ProfessionalCertificateFile {
  id
  fileName
  mimeType
  sizeBytes
  createdAt
}
    `, {"fragmentName":"ProfessionalCertificateFileFields"}) as unknown as TypedDocumentString<ProfessionalCertificateFileFieldsFragment, unknown>;
export const ProfessionalCertificateFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalCertificatesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduActivitySummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalPduActivitySummaryFields on ProfessionalPduActivitySummary {
  completedActivities
  activitiesWithEvidence
  evidenceFilesCount
}
    `, {"fragmentName":"ProfessionalPduActivitySummaryFields"}) as unknown as TypedDocumentString<ProfessionalPduActivitySummaryFieldsFragment, unknown>;
export const ProfessionalRoadmapStepFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalRoadmapStepFields on ProfessionalRoadmapStep {
  id
  order
  title
  contentId
  description
  contentType
}
    `, {"fragmentName":"ProfessionalRoadmapStepFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapStepFieldsFragment, unknown>;
export const ProfessionalRoadmapPhaseFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalRoadmapFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalRoadmapsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalExploreRoadmapFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalExploreRoadmapsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCalendarEventFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedProfessionalCalendarEventsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const ManualCalendarEventFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const RoadmapWidgetFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
    `, {"fragmentName":"RoadmapWidgetFields"}) as unknown as TypedDocumentString<RoadmapWidgetFieldsFragment, unknown>;
export const RoadmapChatMessageFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}`, {"fragmentName":"RoadmapChatMessageFields"}) as unknown as TypedDocumentString<RoadmapChatMessageFieldsFragment, unknown>;
export const ProfessionalRoadmapDraftFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}`, {"fragmentName":"ProfessionalRoadmapDraftFields"}) as unknown as TypedDocumentString<ProfessionalRoadmapDraftFieldsFragment, unknown>;
export const ProfessionalSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalOverviewDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalDashboardProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalProfileTaxonomyDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCpdPlansDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalActiveSessionsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalMyCoursesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduReportDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduActivitiesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduActivityDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPduActivitySummaryDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalContentCompletionDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalPaymentsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCertificatesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCertificateDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCertificateSummaryDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCertificateIssuersDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProfessionalCertificateIssuers {
  professionalCertificateIssuers
}
    `) as unknown as TypedDocumentString<ProfessionalCertificateIssuersQuery, ProfessionalCertificateIssuersQueryVariables>;
export const CreateProfessionalCertificateDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalCertificateDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const SetProfessionalCertificateCpdPlanDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteProfessionalCertificateDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteProfessionalCertificate($id: ID!) {
  deleteProfessionalCertificate(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalCertificateMutation, DeleteProfessionalCertificateMutationVariables>;
export const UpdateProfessionalSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ResetProfessionalSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalBasicProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalDetailsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalSkillsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const StartProfessionalOnboardingDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CompleteProfessionalOnboardingDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalPreferencesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CreateProfessionalCredentialDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalCredentialDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteProfessionalCredentialDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteProfessionalCredential($credentialId: ID!) {
  deleteProfessionalCredential(credentialId: $credentialId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalCredentialMutation, DeleteProfessionalCredentialMutationVariables>;
export const CreateProfessionalPduActivityDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateProfessionalPduActivityDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteProfessionalPduActivityDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteProfessionalPduActivity($activityId: ID!) {
  deleteProfessionalPduActivity(activityId: $activityId) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteProfessionalPduActivityMutation, DeleteProfessionalPduActivityMutationVariables>;
export const UpsertProfessionalPduTargetDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalMyRoadmapsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalExploreRoadmapsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ProfessionalCalendarEventsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const MyCalendarEntriesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CreateCalendarEventDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteCalendarEventDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteCalendarEvent($id: ID!) {
  deleteCalendarEvent(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteCalendarEventMutation, DeleteCalendarEventMutationVariables>;
export const ProfessionalRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProfessionalRoadmapDraft($draftId: ID, $transcript: ProfessionalPaginationInput) {
  professionalRoadmapDraft(draftId: $draftId, transcript: $transcript) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<ProfessionalRoadmapDraftQuery, ProfessionalRoadmapDraftQueryVariables>;
export const StartRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation StartRoadmapDraft {
  startRoadmapDraft {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<StartRoadmapDraftMutation, StartRoadmapDraftMutationVariables>;
export const SendRoadmapChatTurnDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SendRoadmapChatTurn($input: RoadmapChatTurnInput!) {
  sendRoadmapChatTurn(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<SendRoadmapChatTurnMutation, SendRoadmapChatTurnMutationVariables>;
export const PatchRoadmapDraftDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PatchRoadmapDraft($input: PatchRoadmapDraftInput!) {
  patchRoadmapDraft(input: $input) {
    ...ProfessionalRoadmapDraftFields
  }
}
    fragment RoadmapWidgetFields on RoadmapWidget {
  type
  field
  maxSelections
  options {
    value
    label
  }
}
fragment RoadmapChatMessageFields on RoadmapChatMessage {
  id
  role
  content
  stepKey
  createdAt
  widget {
    ...RoadmapWidgetFields
  }
}
fragment ProfessionalRoadmapDraftFields on ProfessionalRoadmapDraft {
  id
  status
  currentStep
  isComplete
  needsClarification
  wasRefused
  updatedAt
  goal
  targetRole
  goalReason
  context
  targetDate
  skillLevel
  timeCommitment
  budgetPreference
  subjects
  preferredFormats
  preferredContentTypes
  cpdEnabled
  certificationId
  certificationName
  requiredCredits
  completedCredits
  subjectOptions {
    id
    label
  }
  widget {
    ...RoadmapWidgetFields
  }
  transcript {
    totalCount
    pageInfo {
      hasNextPage
      nextCursor
    }
    items {
      ...RoadmapChatMessageFields
    }
  }
}`) as unknown as TypedDocumentString<PatchRoadmapDraftMutation, PatchRoadmapDraftMutationVariables>;