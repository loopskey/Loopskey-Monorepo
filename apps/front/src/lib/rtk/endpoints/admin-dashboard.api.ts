import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminProfile: builder.query<TAPI.AdminProfileQuery["adminProfile"], void>({
      query: () => ({
        document: API.AdminProfileDocument,
      }),
      transformResponse: (response: TAPI.AdminProfileQuery) =>
        response.adminProfile,
      providesTags: ["AdminProfile", "Admin"],
    }),

    adminDashboardOverview: builder.query<
      TAPI.AdminDashboardOverviewQuery["adminDashboardOverview"],
      void
    >({
      query: () => ({
        document: API.AdminDashboardOverviewDocument,
      }),
      transformResponse: (response: TAPI.AdminDashboardOverviewQuery) =>
        response.adminDashboardOverview,
      providesTags: ["AdminOverview", "Admin"],
    }),

    adminUsers: builder.query<
      TAPI.AdminUsersQuery["adminUsers"],
      TAPI.AdminUsersQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminUsersDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminUsersQuery) =>
        response.adminUsers,
      providesTags: ["Users"],
    }),

    adminUserGrowth: builder.query<
      TAPI.AdminUserGrowthQuery["adminUserGrowth"],
      TAPI.AdminUserGrowthQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminUserGrowthDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminUserGrowthQuery) =>
        response.adminUserGrowth,
      providesTags: ["Users"],
    }),

    adminAuditLogs: builder.query<
      TAPI.AdminAuditLogsQuery["adminAuditLogs"],
      TAPI.AdminAuditLogsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminAuditLogsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminAuditLogsQuery) =>
        response.adminAuditLogs,
      providesTags: ["AdminAuditLogs"],
    }),

    updateAdminUserStatus: builder.mutation<
      TAPI.UpdateAdminUserStatusMutation["updateAdminUserStatus"],
      TAPI.UpdateAdminUserStatusMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAdminUserStatusDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAdminUserStatusMutation) =>
        response.updateAdminUserStatus,
      invalidatesTags: ["Users", "AdminAuditLogs"],
    }),

    adminOrganizations: builder.query<
      TAPI.AdminOrganizationsQuery["adminOrganizations"],
      TAPI.AdminOrganizationsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminOrganizationsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminOrganizationsQuery) =>
        response.adminOrganizations,
      providesTags: ["AdminOrganizations", "Admin"],
    }),

    adminOrganizationDetail: builder.query<
      TAPI.AdminOrganizationDetailQuery["adminOrganizationDetail"],
      TAPI.AdminOrganizationDetailQueryVariables["organizationId"]
    >({
      query: (organizationId) => ({
        document: API.AdminOrganizationDetailDocument,
        variables: { organizationId },
      }),
      transformResponse: (response: TAPI.AdminOrganizationDetailQuery) =>
        response.adminOrganizationDetail,
      providesTags: ["AdminOrganizationDetail", "Admin"],
    }),

    adminOrganizationMembers: builder.query<
      TAPI.AdminOrganizationMembersQuery["adminOrganizationMembers"],
      TAPI.AdminOrganizationMembersQueryVariables
    >({
      query: (variables) => ({
        document: API.AdminOrganizationMembersDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AdminOrganizationMembersQuery) =>
        response.adminOrganizationMembers,
      providesTags: (_result, _error, arg) => [
        "AdminOrganizationMembers",
        "AdminOrganizations",
        "AdminOrganizationDetail",
        {
          type: "AdminOrganizationDetail",
          id: arg.filter.organizationId,
        },
        "Admin",
      ],
    }),

    updateAdminProfile: builder.mutation<
      TAPI.UpdateAdminProfileMutation["updateAdminProfile"],
      TAPI.UpdateAdminProfileMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAdminProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAdminProfileMutation) =>
        response.updateAdminProfile,
      invalidatesTags: ["AdminProfile", "Admin"],
    }),

    updateAdminOrganizationSettings: builder.mutation<
      TAPI.UpdateAdminOrganizationSettingsMutation["updateAdminOrganizationSettings"],
      TAPI.UpdateAdminOrganizationSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAdminOrganizationSettingsDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAdminOrganizationSettingsMutation,
      ) => response.updateAdminOrganizationSettings,
      invalidatesTags: [
        "AdminOrganizations",
        "AdminOrganizationDetail",
        "AdminAuditLogs",
        "Admin",
      ],
    }),

    adminOrgAccessRequests: builder.query<
      TAPI.AdminOrgAccessRequestsQuery["adminOrgAccessRequests"],
      TAPI.AdminOrgAccessRequestsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminOrgAccessRequestsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminOrgAccessRequestsQuery) =>
        response.adminOrgAccessRequests,
      providesTags: ["OrganizationAccessRequests"],
    }),

    adminOrgAccessRequestDetail: builder.query<
      TAPI.AdminOrgAccessRequestDetailQuery["adminOrgAccessRequestDetail"],
      TAPI.AdminOrgAccessRequestDetailQueryVariables["requestId"]
    >({
      query: (requestId) => ({
        document: API.AdminOrgAccessRequestDetailDocument,
        variables: { requestId },
      }),
      transformResponse: (response: TAPI.AdminOrgAccessRequestDetailQuery) =>
        response.adminOrgAccessRequestDetail,
      providesTags: (_result, _error, requestId) => [
        { type: "OrganizationAccessRequest", id: requestId },
      ],
    }),

    approveAdminOrgAccessRequest: builder.mutation<
      TAPI.ApproveAdminOrgAccessRequestMutation["approveAdminOrgAccessRequest"],
      TAPI.ApproveAdminOrgAccessRequestMutationVariables["requestId"]
    >({
      query: (requestId) => ({
        document: API.ApproveAdminOrgAccessRequestDocument,
        variables: { requestId },
      }),
      transformResponse: (
        response: TAPI.ApproveAdminOrgAccessRequestMutation,
      ) => response.approveAdminOrgAccessRequest,
      invalidatesTags: (_result, _error, requestId) => [
        "OrganizationAccessRequests",
        "Users",
        { type: "OrganizationAccessRequest", id: requestId },
      ],
    }),

    rejectAdminOrgAccessRequest: builder.mutation<
      TAPI.RejectAdminOrgAccessRequestMutation["rejectAdminOrgAccessRequest"],
      TAPI.RejectAdminOrgAccessRequestMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RejectAdminOrgAccessRequestDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RejectAdminOrgAccessRequestMutation) =>
        response.rejectAdminOrgAccessRequest,
      invalidatesTags: (_result, _error, input) => [
        "OrganizationAccessRequests",
        { type: "OrganizationAccessRequest", id: input.requestId },
      ],
    }),

    resendAdminOrgAccessRequestNotification: builder.mutation<
      TAPI.ResendAdminOrgAccessRequestNotificationMutation["resendAdminOrgAccessRequestNotification"],
      TAPI.ResendAdminOrgAccessRequestNotificationMutationVariables["requestId"]
    >({
      query: (requestId) => ({
        document: API.ResendAdminOrgAccessRequestNotificationDocument,
        variables: { requestId },
      }),
      transformResponse: (
        response: TAPI.ResendAdminOrgAccessRequestNotificationMutation,
      ) => response.resendAdminOrgAccessRequestNotification,
      invalidatesTags: (_result, _error, requestId) => [
        "OrganizationAccessRequests",
        { type: "OrganizationAccessRequest", id: requestId },
      ],
    }),

    adminOrganizationUsers: builder.query<
      TAPI.AdminOrganizationUsersQuery["adminOrganizations"],
      TAPI.AdminOrganizationUsersQueryVariables | void
    >({
      query: (variables) => ({
        document: API.AdminOrganizationUsersDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.AdminOrganizationUsersQuery) =>
        response.adminOrganizations,
      providesTags: ["AdminOrganizations", "AdminOrganizationUsers"],
    }),

    adminOrganizationUserDetail: builder.query<
      TAPI.AdminOrganizationUserDetailQuery["adminOrganizationDetail"],
      TAPI.AdminOrganizationUserDetailQueryVariables["organizationId"]
    >({
      query: (organizationId) => ({
        document: API.AdminOrganizationUserDetailDocument,
        variables: { organizationId },
      }),
      transformResponse: (response: TAPI.AdminOrganizationUserDetailQuery) =>
        response.adminOrganizationDetail,
      providesTags: ["AdminOrganizationDetail", "AdminOrganizationUsers"],
    }),

    updateAdminOrganizationMember: builder.mutation<
      TAPI.UpdateAdminOrganizationMemberMutation["updateAdminOrganizationMember"],
      TAPI.UpdateAdminOrganizationMemberMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAdminOrganizationMemberDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAdminOrganizationMemberMutation,
      ) => response.updateAdminOrganizationMember,
      invalidatesTags: [
        "AdminOrganizationMembers",
        "AdminOrganizationDetail",
        "AdminOrganizations",
        "AdminAuditLogs",
      ],
    }),

    removeAdminOrganizationMember: builder.mutation<
      TAPI.RemoveAdminOrganizationMemberMutation["removeAdminOrganizationMember"],
      TAPI.RemoveAdminOrganizationMemberMutationVariables["memberId"]
    >({
      query: (memberId) => ({
        document: API.RemoveAdminOrganizationMemberDocument,
        variables: { memberId },
      }),
      transformResponse: (
        response: TAPI.RemoveAdminOrganizationMemberMutation,
      ) => response.removeAdminOrganizationMember,
      invalidatesTags: [
        "AdminOrganizationMembers",
        "AdminOrganizationDetail",
        "AdminOrganizations",
        "AdminAuditLogs",
      ],
    }),

    updateAdminOrganizationSettingsForUsers: builder.mutation<
      TAPI.UpdateAdminOrganizationSettingsForUsersMutation["updateAdminOrganizationSettings"],
      TAPI.UpdateAdminOrganizationSettingsForUsersMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAdminOrganizationSettingsForUsersDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAdminOrganizationSettingsForUsersMutation,
      ) => response.updateAdminOrganizationSettings,
      invalidatesTags: [
        "AdminOrganizationDetail",
        "AdminOrganizations",
        "AdminAuditLogs",
      ],
    }),
  }),
});

export const {
  useAdminUsersQuery,
  useAdminProfileQuery,
  useAdminAuditLogsQuery,
  useLazyAdminUsersQuery,
  useAdminUserGrowthQuery,
  useLazyAdminProfileQuery,
  useLazyAdminAuditLogsQuery,
  useAdminOrganizationsQuery,
  useLazyAdminUserGrowthQuery,
  useUpdateAdminProfileMutation,
  useAdminDashboardOverviewQuery,
  useAdminOrgAccessRequestsQuery,
  useAdminOrgAccessRequestDetailQuery,
  useLazyAdminOrganizationsQuery,
  useAdminOrganizationDetailQuery,
  useUpdateAdminUserStatusMutation,
  useAdminOrganizationMembersQuery,
  useLazyAdminDashboardOverviewQuery,
  useLazyAdminOrgAccessRequestsQuery,
  useLazyAdminOrganizationDetailQuery,
  useRejectAdminOrgAccessRequestMutation,
  useApproveAdminOrgAccessRequestMutation,
  useResendAdminOrgAccessRequestNotificationMutation,
  useUpdateAdminOrganizationMemberMutation,
  useRemoveAdminOrganizationMemberMutation,
  useUpdateAdminOrganizationSettingsMutation,
} = adminApi;
