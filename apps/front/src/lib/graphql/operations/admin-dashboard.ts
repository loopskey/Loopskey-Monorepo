import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type AdminDashboardPageInfoFieldsFragment = { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type AdminDashboardProfileFieldsFragment = { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string };

export type AdminProfileQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AdminProfileQuery = { __typename?: 'Query', adminProfile: { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string } };

export type UpdateAdminProfileMutationVariables = Types.Exact<{
  input: Types.UpdateAdminProfile;
}>;


export type UpdateAdminProfileMutation = { __typename?: 'Mutation', updateAdminProfile: { __typename?: 'AdminProfile', id: string, bio?: string | null, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string } };

export type AdminDashboardRequestTrendPointFieldsFragment = { __typename?: 'AdminRequestTrendPoint', date: string, count: number };

export type AdminDashboardOverviewFieldsFragment = { __typename?: 'AdminDashboardOverview', totalRequests: number, pendingRequests: number, approvedRequests: number, rejectedRequests: number, requestTrend: Array<{ __typename?: 'AdminRequestTrendPoint', date: string, count: number }> };

export type AdminDashboardOverviewQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AdminDashboardOverviewQuery = { __typename?: 'Query', adminDashboardOverview: { __typename?: 'AdminDashboardOverview', totalRequests: number, pendingRequests: number, approvedRequests: number, rejectedRequests: number, requestTrend: Array<{ __typename?: 'AdminRequestTrendPoint', date: string, count: number }> } };

export type AdminDashboardOrgFieldsFragment = { __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number };

export type AdminDashboardPaginatedOrganizationsFieldsFragment = { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> };

export type AdminDashboardOrgMemberFieldsFragment = { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, status: Types.OrganizationMemberStatus, userId: string, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type AdminDashboardOrgDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string };

export type AdminDashboardOrgDetailFieldsFragment = { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, totalPdus: number, ownerName?: string | null, updatedAt: string, createdAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> };

export type AdminDashboardOrganizationSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type AdminOrganizationsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AdminOrgFilter>;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminOrganizationsQuery = { __typename?: 'Query', adminOrganizations: { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, updatedAt: string, createdAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> } };

export type AdminOrganizationMembersQueryVariables = Types.Exact<{
  filter: Types.AdminOrgMemberFilter;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminOrganizationMembersQuery = { __typename?: 'Query', adminOrganizationMembers: { __typename?: 'PaginatedAdminOrgMembers', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, status: Types.OrganizationMemberStatus, userId: string, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type AdminOrganizationDetailQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['String']['input'];
}>;


export type AdminOrganizationDetailQuery = { __typename?: 'Query', adminOrganizationDetail: { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, totalPdus: number, ownerName?: string | null, updatedAt: string, createdAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, isActive: boolean, createdAt: string, updatedAt: string, description?: string | null, organizationId: string }> } };

export type UpdateAdminOrganizationSettingsMutationVariables = Types.Exact<{
  input: Types.UpdateAdminOrgSettings;
}>;


export type UpdateAdminOrganizationSettingsMutation = { __typename?: 'Mutation', updateAdminOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type AdminDashboardOrgAccessRequestFieldsFragment = { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null };

export type AdminDashboardPaginatedOrgAccessRequestsFieldsFragment = { __typename?: 'PaginatedAdminOrgAccessRequests', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null }> };

export type AdminOrgAccessRequestsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AdminOrgAccessRequestFilter>;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminOrgAccessRequestsQuery = { __typename?: 'Query', adminOrgAccessRequests: { __typename?: 'PaginatedAdminOrgAccessRequests', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null }> } };

export type AdminOrgAccessRequestDetailQueryVariables = Types.Exact<{
  requestId: Types.Scalars['String']['input'];
}>;


export type AdminOrgAccessRequestDetailQuery = { __typename?: 'Query', adminOrgAccessRequestDetail: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type ApproveAdminOrgAccessRequestMutationVariables = Types.Exact<{
  requestId: Types.Scalars['String']['input'];
}>;


export type ApproveAdminOrgAccessRequestMutation = { __typename?: 'Mutation', approveAdminOrgAccessRequest: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type RejectAdminOrgAccessRequestMutationVariables = Types.Exact<{
  input: Types.RejectAdminOrgAccessRequestInput;
}>;


export type RejectAdminOrgAccessRequestMutation = { __typename?: 'Mutation', rejectAdminOrgAccessRequest: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type ResendAdminOrgAccessRequestNotificationMutationVariables = Types.Exact<{
  requestId: Types.Scalars['String']['input'];
}>;


export type ResendAdminOrgAccessRequestNotificationMutation = { __typename?: 'Mutation', resendAdminOrgAccessRequestNotification: { __typename?: 'AdminOrgAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, rejectReason?: string | null, reviewedByName?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number, notificationStatus: Types.NotificationDeliveryStatus, notificationSentAt?: string | null, notificationLastAttemptAt?: string | null, notificationFailureCode?: string | null } };

export type AdminDashboardUserFieldsFragment = { __typename?: 'AdminUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null };

export type AdminDashboardPaginatedUsersFieldsFragment = { __typename?: 'PaginatedAdminUser', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null }> };

export type AdminDashboardUserGrowthPointFieldsFragment = { __typename?: 'AdminChartPoint', date?: string | null, label: string, total: number, providers: number, professionals: number };

export type AdminUsersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AdminUserFilter>;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminUsersQuery = { __typename?: 'Query', adminUsers: { __typename?: 'PaginatedAdminUser', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null }> } };

export type AdminUserGrowthQueryVariables = Types.Exact<{
  mode?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type AdminUserGrowthQuery = { __typename?: 'Query', adminUserGrowth: Array<{ __typename?: 'AdminChartPoint', date?: string | null, label: string, total: number, providers: number, professionals: number }> };

export type UpdateAdminUserStatusMutationVariables = Types.Exact<{
  input: Types.UpdateAdminUserStatus;
}>;


export type UpdateAdminUserStatusMutation = { __typename?: 'Mutation', updateAdminUserStatus: { __typename?: 'AdminUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, location?: string | null, avatarUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, lastLoginAt?: string | null } };

export type AdminDashboardAuditLogFieldsFragment = { __typename?: 'AdminAuditLog', id: string, action: Types.AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null };

export type AdminDashboardPaginatedAuditLogsFieldsFragment = { __typename?: 'PaginatedAdminAuditLogs', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminAuditLog', id: string, action: Types.AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null }> };

export type AdminAuditLogsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AdminAuditLogFilter>;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminAuditLogsQuery = { __typename?: 'Query', adminAuditLogs: { __typename?: 'PaginatedAdminAuditLogs', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminAuditLog', id: string, action: Types.AuditAction, actorId?: string | null, entityId?: string | null, metadata?: any | null, createdAt: string, actorEmail?: string | null, entityType?: string | null }> } };

export type AdminOrgUsersPageInfoFieldsFragment = { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type AdminOrgUsersOrgFieldsFragment = { __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number };

export type AdminOrgUsersPaginatedOrgsFieldsFragment = { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> };

export type AdminOrgUsersMemberFieldsFragment = { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number };

export type AdminOrgUsersPaginatedMembersFieldsFragment = { __typename?: 'PaginatedAdminOrgMembers', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type AdminOrgUsersSettingsFieldsFragment = { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean };

export type AdminOrgUsersDepartmentFieldsFragment = { __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string };

export type AdminOrgUsersDetailFieldsFragment = { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string }>, members: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> };

export type AdminOrganizationUsersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.AdminOrgFilter>;
  pagination?: Types.InputMaybe<Types.AdminPagination>;
}>;


export type AdminOrganizationUsersQuery = { __typename?: 'Query', adminOrganizations: { __typename?: 'PaginatedAdminOrg', totalCount: number, pageInfo: { __typename?: 'AdminPageInfo', nextCursor?: string | null, hasNextPage: boolean }, items: Array<{ __typename?: 'AdminOrg', id: string, name: string, logoUrl?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, totalMembers: number, activeMembers: number, averageCompliance: number }> } };

export type AdminOrganizationUserDetailQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['String']['input'];
}>;


export type AdminOrganizationUserDetailQuery = { __typename?: 'Query', adminOrganizationDetail: { __typename?: 'AdminOrgDetail', id: string, name: string, ownerId: string, logoUrl?: string | null, country?: string | null, website?: string | null, industry?: string | null, ownerName?: string | null, totalPdus: number, createdAt: string, updatedAt: string, ownerEmail?: string | null, description?: string | null, totalMembers: number, activeMembers: number, inactiveMembers: number, averageCompliance: number, settings?: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } | null, departments: Array<{ __typename?: 'OrganizationDepartment', id: string, title: string, organizationId: string }>, members: Array<{ __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number }> } };

export type UpdateAdminOrganizationMemberMutationVariables = Types.Exact<{
  input: Types.UpdateAdminOrgMember;
}>;


export type UpdateAdminOrganizationMemberMutation = { __typename?: 'Mutation', updateAdminOrganizationMember: { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type RemoveAdminOrganizationMemberMutationVariables = Types.Exact<{
  memberId: Types.Scalars['String']['input'];
}>;


export type RemoveAdminOrganizationMemberMutation = { __typename?: 'Mutation', removeAdminOrganizationMember: { __typename?: 'AdminOrgMember', id: string, pdus: number, email?: string | null, userId: string, status: Types.OrganizationMemberStatus, jobRole?: string | null, joinedAt: string, fullName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, compliance: number, departmentId?: string | null, organizationId: string, departmentTitle?: string | null, completedLearning: number } };

export type UpdateAdminOrganizationSettingsForUsersMutationVariables = Types.Exact<{
  input: Types.UpdateAdminOrgSettings;
}>;


export type UpdateAdminOrganizationSettingsForUsersMutation = { __typename?: 'Mutation', updateAdminOrganizationSettings: { __typename?: 'OrganizationSettings', id: string, createdAt: string, updatedAt: string, minimumPdu: number, organizationId: string, complianceCycle: Types.ComplianceCycle, strictCompliance: boolean, complianceAlerts: boolean, weeklySummaryReport: boolean, assignmentNotifications: boolean } };

export type OrganizationAccessRequestsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.OrganizationAccessRequestFilterInput>;
  pagination?: Types.InputMaybe<Types.OrganizationAccessRequestPaginationInput>;
}>;


export type OrganizationAccessRequestsQuery = { __typename?: 'Query', organizationAccessRequests: { __typename?: 'PaginatedOrganizationAccessRequests', items: Array<{ __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, createdAt: string, updatedAt: string, workEmail: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationType: Types.OrganizationType, organizationName: string, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number }>, pageInfo: { __typename?: 'OrganizationAccessRequestPageInfo', page: number, limit: number, totalPages: number, totalItems: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type OrganizationAccessRequestByIdQueryVariables = Types.Exact<{
  requestId: Types.Scalars['String']['input'];
}>;


export type OrganizationAccessRequestByIdQuery = { __typename?: 'Query', organizationAccessRequestById: { __typename?: 'OrganizationAccessRequest', id: string, goals: string, status: Types.OrganizationAccessRequestStatus, country: string, workEmail: string, createdAt: string, updatedAt: string, reviewedAt?: string | null, reviewedById?: string | null, rejectReason?: string | null, approvedUserId?: string | null, organizationName: string, organizationType: Types.OrganizationType, representativeJobRole: string, representativeFullName: string, expectedLicensedProfessionals: number } };

export type UsersQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.UserFilterInput>;
  pagination?: Types.InputMaybe<Types.UserPaginationInput>;
}>;


export type UsersQuery = { __typename?: 'Query', users: { __typename?: 'PaginatedUsers', items: Array<{ __typename?: 'User', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null }>, pageInfo: { __typename?: 'UserPageInfo', page: number, limit: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean } } };

export type UserByIdQueryVariables = Types.Exact<{
  userId: Types.Scalars['String']['input'];
}>;


export type UserByIdQuery = { __typename?: 'Query', userById: { __typename?: 'User', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null, professionalProfile?: { __typename?: 'ProfessionalProfile', id: string, skills: Array<string>, userId: string, industry?: Types.ProfessionalIndustry | null, interests: Array<string>, createdAt: string, updatedAt: string, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null } | null, providerProfile?: { __typename?: 'ProviderProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, updatedAt: string, createdAt: string, isPremium: boolean, contactEmail?: string | null, contactPhone?: string | null, organizationName?: string | null } | null, organizationProfile?: { __typename?: 'OrganizationProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, country?: string | null, industry?: string | null, timezone?: string | null, createdAt: string, updatedAt: string, memberLimit?: number | null, contactEmail?: string | null, contactPhone?: string | null, organizationName: string } | null } };

export type UpdateUserMutationVariables = Types.Exact<{
  input: Types.UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, lastName?: string | null, avatarUrl?: string | null, firstName?: string | null, updatedAt: string } };

export type UpdateUserStatusMutationVariables = Types.Exact<{
  input: Types.UpdateUserStatusInput;
}>;


export type UpdateUserStatusMutation = { __typename?: 'Mutation', updateUserStatus: { __typename?: 'User', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, updatedAt: string } };

export type DeleteUserMutationVariables = Types.Exact<{
  userId: Types.Scalars['String']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'User', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, deletedAt?: string | null } };

export type RestoreUserMutationVariables = Types.Exact<{
  userId: Types.Scalars['String']['input'];
}>;


export type RestoreUserMutation = { __typename?: 'Mutation', restoreUser: { __typename?: 'User', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, deletedAt?: string | null } };

export const AdminDashboardProfileFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardRequestTrendPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminDashboardRequestTrendPointFields on AdminRequestTrendPoint {
  date
  count
}
    `, {"fragmentName":"AdminDashboardRequestTrendPointFields"}) as unknown as TypedDocumentString<AdminDashboardRequestTrendPointFieldsFragment, unknown>;
export const AdminDashboardOverviewFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminDashboardPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"AdminDashboardPageInfoFields"}) as unknown as TypedDocumentString<AdminDashboardPageInfoFieldsFragment, unknown>;
export const AdminDashboardOrgFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardPaginatedOrganizationsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOrgMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOrganizationSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOrgDepartmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOrgDetailFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOrgAccessRequestFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardPaginatedOrgAccessRequestsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardUserFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardPaginatedUsersFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardUserGrowthPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminDashboardUserGrowthPointFields on AdminChartPoint {
  date
  label
  total
  providers
  professionals
}
    `, {"fragmentName":"AdminDashboardUserGrowthPointFields"}) as unknown as TypedDocumentString<AdminDashboardUserGrowthPointFieldsFragment, unknown>;
export const AdminDashboardAuditLogFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardPaginatedAuditLogsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminOrgUsersPageInfoFields on AdminPageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"AdminOrgUsersPageInfoFields"}) as unknown as TypedDocumentString<AdminOrgUsersPageInfoFieldsFragment, unknown>;
export const AdminOrgUsersOrgFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersPaginatedOrgsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersMemberFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersPaginatedMembersFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgUsersDepartmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment AdminOrgUsersDepartmentFields on OrganizationDepartment {
  id
  title
  organizationId
}
    `, {"fragmentName":"AdminOrgUsersDepartmentFields"}) as unknown as TypedDocumentString<AdminOrgUsersDepartmentFieldsFragment, unknown>;
export const AdminOrgUsersDetailFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateAdminProfileDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminDashboardOverviewDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrganizationsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrganizationMembersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrganizationDetailDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateAdminOrganizationSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgAccessRequestsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrgAccessRequestDetailDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ApproveAdminOrgAccessRequestDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const RejectAdminOrgAccessRequestDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const ResendAdminOrgAccessRequestNotificationDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminUsersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminUserGrowthDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateAdminUserStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminAuditLogsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrganizationUsersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const AdminOrganizationUserDetailDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateAdminOrganizationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const RemoveAdminOrganizationMemberDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateAdminOrganizationSettingsForUsersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationAccessRequestsDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const OrganizationAccessRequestByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UsersDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UserByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateUserDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const UpdateUserStatusDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const DeleteUserDocument = /*#__PURE__*/ new TypedDocumentString(`
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
export const RestoreUserDocument = /*#__PURE__*/ new TypedDocumentString(`
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