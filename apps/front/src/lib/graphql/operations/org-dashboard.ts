import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type OrganizationPageInfoFieldsFragment = { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type OrganizationOverviewSummaryFieldsFragment = { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number };

export type OrganizationComplianceDistributionFieldsFragment = { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number };

export type OrganizationAttentionMemberFieldsFragment = { __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null };

export type OrganizationTrendingTopicFieldsFragment = { __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number };

export type OrganizationOverviewFieldsFragment = { __typename?: 'OrganizationOverview', summary: { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number }, complianceDistribution: { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number }, attentionMembers: Array<{ __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null }>, trendingTopics: Array<{ __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number }> };

export type OrganizationOverviewQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationOverviewQuery = { __typename?: 'Query', organizationOverview: { __typename?: 'OrganizationOverview', summary: { __typename?: 'OrganizationOverviewSummary', totalPdus: number, totalMembers: number, activeMembers: number, engagementRate: number, averageCompliance: number, activeAssignments: number, nonCompliantMembers: number }, complianceDistribution: { __typename?: 'OrganizationComplianceDistribution', atRisk: number, compliant: number, nonCompliant: number }, attentionMembers: Array<{ __typename?: 'OrganizationAttentionMember', id: string, pdus: number, email?: string | null, userId: string, pduGoal: number, fullName?: string | null, avatarUrl?: string | null, compliance: number, remainingPdus: number, departmentTitle?: string | null }>, trendingTopics: Array<{ __typename?: 'OrganizationTrendingTopic', title: string, count: number, percentage: number }> } };

export type OrganizationSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type OrganizationDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string };

export type OrganizationCpdCategoryStatsFieldsFragment = { __typename?: 'OrganizationCpdCategoryStats', totalCategories: number, activeCategories: number, totalRequiredHours: number, mostPopularCategory?: string | null, mostPopularActiveMembers: number };

export type OrganizationCpdCategoryFieldsFragment = { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: Types.PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string };

export type PaginatedOrganizationCpdCategoriesFieldsFragment = { __typename?: 'PaginatedOrganizationCpdCategories', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationCpdCategory', id: string, title: string, category: Types.PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string }> };

export type OrganizationCpdCategoryStatsQueryVariables = Types.Exact<{
  year?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type OrganizationCpdCategoryStatsQuery = { __typename?: 'Query', organizationCpdCategoryStats: { __typename?: 'OrganizationCpdCategoryStats', totalCategories: number, activeCategories: number, totalRequiredHours: number, mostPopularCategory?: string | null, mostPopularActiveMembers: number } };

export type OrganizationCpdCategoriesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationCpdCategoryFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type OrganizationCpdCategoriesQuery = { __typename?: 'Query', organizationCpdCategories: { __typename?: 'PaginatedOrganizationCpdCategories', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationCpdCategory', id: string, title: string, category: Types.PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string }> } };

export type CreateOrganizationCpdCategoryMutationVariables = Types.Exact<{
  input: Types.CreateOrganizationCpdCategoryInput;
}>;


export type CreateOrganizationCpdCategoryMutation = { __typename?: 'Mutation', createOrganizationCpdCategory: { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: Types.PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string } };

export type UpdateOrganizationCpdCategoryMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationCpdCategoryInput;
}>;


export type UpdateOrganizationCpdCategoryMutation = { __typename?: 'Mutation', updateOrganizationCpdCategory: { __typename?: 'OrganizationCpdCategory', id: string, title: string, category: Types.PduCategory, isActive: boolean, updatedAt: string, createdAt: string, description?: string | null, totalMembers?: number | null, requiredHours: number, activeMembers?: number | null, organizationId: string } };

export type DeleteOrganizationCpdCategoryMutationVariables = Types.Exact<{
  categoryId: Types.Scalars['String']['input'];
}>;


export type DeleteOrganizationCpdCategoryMutation = { __typename?: 'Mutation', deleteOrganizationCpdCategory: { __typename?: 'OrganizationActionResponse', code: string, message: string, success: boolean } };

export type OrganizationEventCatalogFieldsFragment = { __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: Types.EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: Types.EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: Types.EventDeliveryMode, averageRating: number };

export type PaginatedOrganizationEventCatalogFieldsFragment = { __typename?: 'PaginatedOrganizationEventCatalog', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: Types.EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: Types.EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: Types.EventDeliveryMode, averageRating: number }> };

export type OrganizationSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationSettingsQuery = { __typename?: 'Query', organizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type OrganizationDepartmentsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationDepartmentsQuery = { __typename?: 'Query', organizationDepartments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> };

export type OrganizationEventCatalogQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.EventCatalogFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type OrganizationEventCatalogQuery = { __typename?: 'Query', organizationEventCatalog: { __typename?: 'PaginatedOrganizationEventCatalog', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationEventCatalogItem', id: string, pdu: number, slug: string, type: Types.EventType, title: string, price?: number | null, isFree: boolean, rating: number, speaker?: string | null, category: Types.EventCategory, capacity?: number | null, location?: string | null, currency: string, imageUrl?: string | null, startDate: string, onlineUrl?: string | null, description: string, deliveryMode: Types.EventDeliveryMode, averageRating: number }> } };

export type UpdateOrganizationSettingsMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationSettingsInput;
}>;


export type UpdateOrganizationSettingsMutation = { __typename?: 'Mutation', updateOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type CreateOrganizationDepartmentMutationVariables = Types.Exact<{
  input: Types.CreateOrganizationDepartmentInput;
}>;


export type CreateOrganizationDepartmentMutation = { __typename?: 'Mutation', createOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type UpdateOrganizationDepartmentMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationDepartmentInput;
}>;


export type UpdateOrganizationDepartmentMutation = { __typename?: 'Mutation', updateOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type DeleteOrganizationDepartmentMutationVariables = Types.Exact<{
  departmentId: Types.Scalars['String']['input'];
}>;


export type DeleteOrganizationDepartmentMutation = { __typename?: 'Mutation', deleteOrganizationDepartment: { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string } };

export type AddOrganizationMemberMutationVariables = Types.Exact<{
  input: Types.AddOrganizationMemberInput;
}>;


export type AddOrganizationMemberMutation = { __typename?: 'Mutation', addOrganizationMember: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type UpdateOrganizationMemberMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationMemberInput;
}>;


export type UpdateOrganizationMemberMutation = { __typename?: 'Mutation', updateOrganizationMember: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type SubmitOrganizationAccessRequestMutationVariables = Types.Exact<{
  input: Types.SubmitOrganizationAccessRequestInput;
}>;


export type SubmitOrganizationAccessRequestMutation = { __typename?: 'Mutation', submitOrganizationAccessRequest: { __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, createdAt: string, workEmail: string, updatedAt: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number } };

export type OrganizationMembersStatsFieldsFragment = { __typename?: 'OrganizationMembersStats', totalPdus: number, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number };

export type OrganizationMemberDetailFieldsFragment = { __typename?: 'OrganizationMemberDetail', id: string, pdus: number, notes?: string | null, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, pduGoal: number, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, pduProgress: number, departmentId?: string | null, lastActivityAt?: string | null, organizationId: string, lastCourseTitle?: string | null, departmentTitle?: string | null, completedLearning: number };

export type BulkAddOrganizationMembersResultFieldsFragment = { __typename?: 'BulkAddOrganizationMembersResult', errors: Array<string>, failed: number, created: number, updated: number, totalRows: number };

export type OrganizationMemberFieldsFragment = { __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type PaginatedOrganizationMembersFieldsFragment = { __typename?: 'PaginatedOrganizationMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type OrganizationMembersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationMemberFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type OrganizationMembersQuery = { __typename?: 'Query', organizationMembers: { __typename?: 'PaginatedOrganizationMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type OrganizationMembersStatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationMembersStatsQuery = { __typename?: 'Query', organizationMembersStats: { __typename?: 'OrganizationMembersStats', totalPdus: number, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number } };

export type OrganizationMemberDetailQueryVariables = Types.Exact<{
  memberId: Types.Scalars['String']['input'];
}>;


export type OrganizationMemberDetailQuery = { __typename?: 'Query', organizationMemberDetail: { __typename?: 'OrganizationMemberDetail', id: string, pdus: number, notes?: string | null, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, pduGoal: number, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, pduProgress: number, departmentId?: string | null, lastActivityAt?: string | null, organizationId: string, lastCourseTitle?: string | null, departmentTitle?: string | null, completedLearning: number } };

export type BulkAddOrganizationMembersMutationVariables = Types.Exact<{
  input: Types.BulkAddOrganizationMembersInput;
}>;


export type BulkAddOrganizationMembersMutation = { __typename?: 'Mutation', bulkAddOrganizationMembers: { __typename?: 'BulkAddOrganizationMembersResult', errors: Array<string>, failed: number, created: number, updated: number, totalRows: number } };

export type UpdateOrganizationMemberNotesMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationMemberNotesInput;
}>;


export type UpdateOrganizationMemberNotesMutation = { __typename?: 'Mutation', updateOrganizationMemberNotes: { __typename?: 'OrganizationMember', id: string, pdus: number, role: Types.Role, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, fullName?: string | null, joinedAt: string, createdAt: string, avatarUrl?: string | null, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type OrganizationAssignmentStatsFieldsFragment = { __typename?: 'OrganizationAssignmentStats', totalAssignments: number, activeAssignments: number, totalParticipants: number, averageCompletionRate: number };

export type OrganizationAssignmentFieldsFragment = { __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null };

export type PaginatedOrganizationAssignmentsFieldsFragment = { __typename?: 'PaginatedOrganizationAssignments', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null }> };

export type OrganizationAssignmentsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationAssignmentFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type OrganizationAssignmentsQuery = { __typename?: 'Query', organizationAssignments: { __typename?: 'PaginatedOrganizationAssignments', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null }> } };

export type CreateOrganizationAssignmentMutationVariables = Types.Exact<{
  input: Types.CreateOrganizationAssignmentInput;
}>;


export type CreateOrganizationAssignmentMutation = { __typename?: 'Mutation', createOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type OrganizationAssignmentStatsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type OrganizationAssignmentStatsQuery = { __typename?: 'Query', organizationAssignmentStats: { __typename?: 'OrganizationAssignmentStats', totalAssignments: number, activeAssignments: number, totalParticipants: number, averageCompletionRate: number } };

export type UpdateOrganizationAssignmentMutationVariables = Types.Exact<{
  input: Types.UpdateOrganizationAssignmentInput;
}>;


export type UpdateOrganizationAssignmentMutation = { __typename?: 'Mutation', updateOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type DeleteOrganizationAssignmentMutationVariables = Types.Exact<{
  assignmentId: Types.Scalars['String']['input'];
}>;


export type DeleteOrganizationAssignmentMutation = { __typename?: 'Mutation', deleteOrganizationAssignment: { __typename?: 'OrganizationAssignment', id: string, type: Types.AssignmentType, title: string, status: Types.AssignmentStatus, dueDate?: string | null, members: number, eventId?: string | null, courseId?: string | null, progress: number, createdAt: string, updatedAt: string, eventTitle?: string | null, targetRole?: Types.Role | null, targetKind: Types.AssignmentTargetKind, createdById: string, description?: string | null, courseTitle?: string | null, departmentId?: string | null, organizationId: string, targetMemberId?: string | null } };

export type OrganizationReportSummaryFieldsFragment = { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number };

export type OrganizationReportTrendPointFieldsFragment = { __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number };

export type OrganizationReportDepartmentFieldsFragment = { __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string };

export type OrganizationReportFieldsFragment = { __typename?: 'OrganizationReport', summary: { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number }, complianceTrend: Array<{ __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number }>, departmentCompliance: Array<{ __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string }> };

export type OrganizationReportTopMemberFieldsFragment = { __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number };

export type PaginatedOrganizationReportTopMembersFieldsFragment = { __typename?: 'PaginatedOrganizationReportTopMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number }> };

export type OrganizationReportsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationReportFilterInput>;
}>;


export type OrganizationReportsQuery = { __typename?: 'Query', organizationReports: { __typename?: 'OrganizationReport', summary: { __typename?: 'OrganizationReportSummary', totalPdus: number, averagePdus: number, totalMembers: number, requiredHours: number, averageCompliance: number }, complianceTrend: Array<{ __typename?: 'OrganizationReportTrendPoint', date: string, pdus: number, label: string, compliance: number }>, departmentCompliance: Array<{ __typename?: 'OrganizationReportDepartment', teamSize: number, totalPdus: number, compliance: number, averagePdus: number, departmentId?: string | null, departmentTitle: string }> } };

export type OrganizationReportTopMembersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationReportTopMembersFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationPaginationInput>;
}>;


export type OrganizationReportTopMembersQuery = { __typename?: 'Query', organizationReportTopMembers: { __typename?: 'PaginatedOrganizationReportTopMembers', totalCount: number, pageInfo: { __typename?: 'OrganizationPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'OrganizationReportTopMember', id: string, pdus: number, email?: string | null, userId: string, fullName?: string | null, compliance: number, departmentTitle?: string | null, completedLearning: number }> } };

export const OrganizationOverviewSummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationComplianceDistributionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationComplianceDistributionFields on OrganizationComplianceDistribution {
  atRisk
  compliant
  nonCompliant
}
    `, {"fragmentName":"OrganizationComplianceDistributionFields"}) as unknown as TypedDocumentString<OrganizationComplianceDistributionFieldsFragment, unknown>;
export const OrganizationAttentionMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationTrendingTopicFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationTrendingTopicFields on OrganizationTrendingTopic {
  title
  count
  percentage
}
    `, {"fragmentName":"OrganizationTrendingTopicFields"}) as unknown as TypedDocumentString<OrganizationTrendingTopicFieldsFragment, unknown>;
export const OrganizationOverviewFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationDepartmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationCpdCategoryStatsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationCpdCategoryStatsFields on OrganizationCpdCategoryStats {
  totalCategories
  activeCategories
  totalRequiredHours
  mostPopularCategory
  mostPopularActiveMembers
}
    `, {"fragmentName":"OrganizationCpdCategoryStatsFields"}) as unknown as TypedDocumentString<OrganizationCpdCategoryStatsFieldsFragment, unknown>;
export const OrganizationPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationPageInfoFields on OrganizationPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"OrganizationPageInfoFields"}) as unknown as TypedDocumentString<OrganizationPageInfoFieldsFragment, unknown>;
export const OrganizationCpdCategoryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedOrganizationCpdCategoriesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationEventCatalogFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedOrganizationEventCatalogFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationMembersStatsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationMembersStatsFields on OrganizationMembersStats {
  totalPdus
  totalMembers
  activeMembers
  inactiveMembers
  averageCompliance
}
    `, {"fragmentName":"OrganizationMembersStatsFields"}) as unknown as TypedDocumentString<OrganizationMembersStatsFieldsFragment, unknown>;
export const OrganizationMemberDetailFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const BulkAddOrganizationMembersResultFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment BulkAddOrganizationMembersResultFields on BulkAddOrganizationMembersResult {
  errors
  failed
  created
  updated
  totalRows
}
    `, {"fragmentName":"BulkAddOrganizationMembersResultFields"}) as unknown as TypedDocumentString<BulkAddOrganizationMembersResultFieldsFragment, unknown>;
export const OrganizationMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedOrganizationMembersFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationAssignmentStatsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationAssignmentStatsFields on OrganizationAssignmentStats {
  totalAssignments
  activeAssignments
  totalParticipants
  averageCompletionRate
}
    `, {"fragmentName":"OrganizationAssignmentStatsFields"}) as unknown as TypedDocumentString<OrganizationAssignmentStatsFieldsFragment, unknown>;
export const OrganizationAssignmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedOrganizationAssignmentsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationReportSummaryFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationReportSummaryFields on OrganizationReportSummary {
  totalPdus
  averagePdus
  totalMembers
  requiredHours
  averageCompliance
}
    `, {"fragmentName":"OrganizationReportSummaryFields"}) as unknown as TypedDocumentString<OrganizationReportSummaryFieldsFragment, unknown>;
export const OrganizationReportTrendPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationReportTrendPointFields on OrganizationReportTrendPoint {
  date
  pdus
  label
  compliance
}
    `, {"fragmentName":"OrganizationReportTrendPointFields"}) as unknown as TypedDocumentString<OrganizationReportTrendPointFieldsFragment, unknown>;
export const OrganizationReportDepartmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment OrganizationReportDepartmentFields on OrganizationReportDepartment {
  teamSize
  totalPdus
  compliance
  averagePdus
  departmentId
  departmentTitle
}
    `, {"fragmentName":"OrganizationReportDepartmentFields"}) as unknown as TypedDocumentString<OrganizationReportDepartmentFieldsFragment, unknown>;
export const OrganizationReportFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationReportTopMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const PaginatedOrganizationReportTopMembersFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationOverviewDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationCpdCategoryStatsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationCpdCategoriesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CreateOrganizationCpdCategoryDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationCpdCategoryDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteOrganizationCpdCategoryDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteOrganizationCpdCategory($categoryId: String!) {
  deleteOrganizationCpdCategory(categoryId: $categoryId) {
    code
    message
    success
  }
}
    `) as unknown as TypedDocumentString<DeleteOrganizationCpdCategoryMutation, DeleteOrganizationCpdCategoryMutationVariables>;
export const OrganizationSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationDepartmentsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationEventCatalogDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CreateOrganizationDepartmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationDepartmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteOrganizationDepartmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AddOrganizationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const SubmitOrganizationAccessRequestDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationMembersStatsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationMemberDetailDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const BulkAddOrganizationMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationMemberNotesDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationAssignmentsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const CreateOrganizationAssignmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationAssignmentStatsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateOrganizationAssignmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteOrganizationAssignmentDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationReportsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationReportTopMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
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