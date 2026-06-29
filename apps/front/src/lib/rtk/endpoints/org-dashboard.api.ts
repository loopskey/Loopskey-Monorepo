import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    organizationOverview: builder.query<
      TAPI.OrganizationOverviewQuery["organizationOverview"],
      void
    >({
      query: () => ({
        document: API.OrganizationOverviewDocument,
      }),
      transformResponse: (response: TAPI.OrganizationOverviewQuery) =>
        response.organizationOverview,
      providesTags: ["OrganizationOverview", "Organization"],
    }),

    organizationSettings: builder.query<
      TAPI.OrganizationSettingsQuery["organizationSettings"],
      void
    >({
      query: () => ({
        document: API.OrganizationSettingsDocument,
      }),
      transformResponse: (response: TAPI.OrganizationSettingsQuery) =>
        response.organizationSettings,
      providesTags: ["OrganizationSettings", "Organization"],
    }),

    updateOrganizationSettings: builder.mutation<
      TAPI.UpdateOrganizationSettingsMutation["updateOrganizationSettings"],
      TAPI.UpdateOrganizationSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationSettingsDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateOrganizationSettingsMutation) =>
        response.updateOrganizationSettings,
      invalidatesTags: [
        "OrganizationSettings",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),

    organizationDepartments: builder.query<
      TAPI.OrganizationDepartmentsQuery["organizationDepartments"],
      void
    >({
      query: () => ({
        document: API.OrganizationDepartmentsDocument,
      }),
      transformResponse: (response: TAPI.OrganizationDepartmentsQuery) =>
        response.organizationDepartments,
      providesTags: ["OrganizationDepartments", "Organization"],
    }),

    organizationMembers: builder.query<
      TAPI.OrganizationMembersQuery["organizationMembers"],
      TAPI.OrganizationMembersQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationMembersDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationMembersQuery) =>
        response.organizationMembers,
      providesTags: ["OrganizationMembers", "Organization"],
    }),

    organizationMembersStats: builder.query<
      TAPI.OrganizationMembersStatsQuery["organizationMembersStats"],
      void
    >({
      query: () => ({
        document: API.OrganizationMembersStatsDocument,
      }),
      transformResponse: (response: TAPI.OrganizationMembersStatsQuery) =>
        response.organizationMembersStats,
      providesTags: ["OrganizationMembers", "OrganizationOverview"],
    }),

    organizationMemberDetail: builder.query<
      TAPI.OrganizationMemberDetailQuery["organizationMemberDetail"],
      TAPI.OrganizationMemberDetailQueryVariables["memberId"]
    >({
      query: (memberId) => ({
        document: API.OrganizationMemberDetailDocument,
        variables: { memberId },
      }),
      transformResponse: (response: TAPI.OrganizationMemberDetailQuery) =>
        response.organizationMemberDetail,
      providesTags: (_result, _error, memberId) => [
        { type: "OrganizationMembers", id: memberId },
      ],
    }),

    bulkAddOrganizationMembers: builder.mutation<
      TAPI.BulkAddOrganizationMembersMutation["bulkAddOrganizationMembers"],
      TAPI.BulkAddOrganizationMembersMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.BulkAddOrganizationMembersDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.BulkAddOrganizationMembersMutation) =>
        response.bulkAddOrganizationMembers,
      invalidatesTags: [
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
      ],
    }),

    updateOrganizationMemberNotes: builder.mutation<
      TAPI.UpdateOrganizationMemberNotesMutation["updateOrganizationMemberNotes"],
      TAPI.UpdateOrganizationMemberNotesMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationMemberNotesDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateOrganizationMemberNotesMutation,
      ) => response.updateOrganizationMemberNotes,
      invalidatesTags: ["OrganizationMembers"],
    }),

    organizationAssignments: builder.query<
      TAPI.OrganizationAssignmentsQuery["organizationAssignments"],
      TAPI.OrganizationAssignmentsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationAssignmentsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationAssignmentsQuery) =>
        response.organizationAssignments,
      providesTags: ["OrganizationAssignments", "Organization"],
    }),

    organizationAssignmentStats: builder.query<
      TAPI.OrganizationAssignmentStatsQuery["organizationAssignmentStats"],
      void
    >({
      query: () => ({
        document: API.OrganizationAssignmentStatsDocument,
      }),
      transformResponse: (response: TAPI.OrganizationAssignmentStatsQuery) =>
        response.organizationAssignmentStats,
      providesTags: ["OrganizationAssignments", "OrganizationOverview"],
    }),

    createOrganizationDepartment: builder.mutation<
      TAPI.CreateOrganizationDepartmentMutation["createOrganizationDepartment"],
      TAPI.CreateOrganizationDepartmentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateOrganizationDepartmentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateOrganizationDepartmentMutation,
      ) => response.createOrganizationDepartment,
      invalidatesTags: [
        "OrganizationDepartments",
        "OrganizationMembers",
        "OrganizationReports",
        "Organization",
      ],
    }),

    updateOrganizationDepartment: builder.mutation<
      TAPI.UpdateOrganizationDepartmentMutation["updateOrganizationDepartment"],
      TAPI.UpdateOrganizationDepartmentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationDepartmentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateOrganizationDepartmentMutation,
      ) => response.updateOrganizationDepartment,
      invalidatesTags: [
        "OrganizationDepartments",
        "OrganizationMembers",
        "OrganizationReports",
        "Organization",
      ],
    }),

    deleteOrganizationDepartment: builder.mutation<
      TAPI.DeleteOrganizationDepartmentMutation["deleteOrganizationDepartment"],
      TAPI.DeleteOrganizationDepartmentMutationVariables["departmentId"]
    >({
      query: (departmentId) => ({
        document: API.DeleteOrganizationDepartmentDocument,
        variables: { departmentId },
      }),
      transformResponse: (
        response: TAPI.DeleteOrganizationDepartmentMutation,
      ) => response.deleteOrganizationDepartment,
      invalidatesTags: [
        "OrganizationDepartments",
        "OrganizationMembers",
        "OrganizationReports",
        "Organization",
      ],
    }),

    addOrganizationMember: builder.mutation<
      TAPI.AddOrganizationMemberMutation["addOrganizationMember"],
      TAPI.AddOrganizationMemberMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.AddOrganizationMemberDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.AddOrganizationMemberMutation) =>
        response.addOrganizationMember,
      invalidatesTags: [
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),

    updateOrganizationMember: builder.mutation<
      TAPI.UpdateOrganizationMemberMutation["updateOrganizationMember"],
      TAPI.UpdateOrganizationMemberMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationMemberDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateOrganizationMemberMutation) =>
        response.updateOrganizationMember,
      invalidatesTags: [
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),

    createOrganizationAssignment: builder.mutation<
      TAPI.CreateOrganizationAssignmentMutation["createOrganizationAssignment"],
      TAPI.CreateOrganizationAssignmentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateOrganizationAssignmentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateOrganizationAssignmentMutation,
      ) => response.createOrganizationAssignment,
      invalidatesTags: [
        "OrganizationAssignments",
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),
    submitOrganizationAccessRequest: builder.mutation<
      TAPI.SubmitOrganizationAccessRequestMutation["submitOrganizationAccessRequest"],
      TAPI.SubmitOrganizationAccessRequestMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SubmitOrganizationAccessRequestDocument,
        variables: { input },
      }),
      invalidatesTags: ["OrganizationAccessRequests"],
    }),

    updateOrganizationAssignment: builder.mutation<
      TAPI.UpdateOrganizationAssignmentMutation["updateOrganizationAssignment"],
      TAPI.UpdateOrganizationAssignmentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationAssignmentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateOrganizationAssignmentMutation,
      ) => response.updateOrganizationAssignment,
      invalidatesTags: [
        "OrganizationAssignments",
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),

    deleteOrganizationAssignment: builder.mutation<
      TAPI.DeleteOrganizationAssignmentMutation["deleteOrganizationAssignment"],
      TAPI.DeleteOrganizationAssignmentMutationVariables["assignmentId"]
    >({
      query: (assignmentId) => ({
        document: API.DeleteOrganizationAssignmentDocument,
        variables: { assignmentId },
      }),
      transformResponse: (
        response: TAPI.DeleteOrganizationAssignmentMutation,
      ) => response.deleteOrganizationAssignment,
      invalidatesTags: [
        "OrganizationAssignments",
        "OrganizationMembers",
        "OrganizationOverview",
        "OrganizationReports",
        "Organization",
      ],
    }),

    organizationEventCatalog: builder.query<
      TAPI.OrganizationEventCatalogQuery["organizationEventCatalog"],
      TAPI.OrganizationEventCatalogQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationEventCatalogDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationEventCatalogQuery) =>
        response.organizationEventCatalog,
      providesTags: ["OrganizationEventCatalog", "Organization"],
    }),

    organizationReports: builder.query<
      TAPI.OrganizationReportsQuery["organizationReports"],
      TAPI.OrganizationReportsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationReportsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationReportsQuery) =>
        response.organizationReports,
      providesTags: ["OrganizationReports", "Organization"],
    }),

    organizationReportTopMembers: builder.query<
      TAPI.OrganizationReportTopMembersQuery["organizationReportTopMembers"],
      TAPI.OrganizationReportTopMembersQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationReportTopMembersDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationReportTopMembersQuery) =>
        response.organizationReportTopMembers,
      providesTags: ["OrganizationReports", "OrganizationMembers"],
    }),

    organizationCpdCategoryStats: builder.query<
      TAPI.OrganizationCpdCategoryStatsQuery["organizationCpdCategoryStats"],
      TAPI.OrganizationCpdCategoryStatsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationCpdCategoryStatsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationCpdCategoryStatsQuery) =>
        response.organizationCpdCategoryStats,
      providesTags: ["OrganizationCpdCategories", "OrganizationReports"],
    }),

    organizationCpdCategories: builder.query<
      TAPI.OrganizationCpdCategoriesQuery["organizationCpdCategories"],
      TAPI.OrganizationCpdCategoriesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationCpdCategoriesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.OrganizationCpdCategoriesQuery) =>
        response.organizationCpdCategories,
      providesTags: ["OrganizationCpdCategories", "Organization"],
    }),

    createOrganizationCpdCategory: builder.mutation<
      TAPI.CreateOrganizationCpdCategoryMutation["createOrganizationCpdCategory"],
      TAPI.CreateOrganizationCpdCategoryMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateOrganizationCpdCategoryDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateOrganizationCpdCategoryMutation,
      ) => response.createOrganizationCpdCategory,
      invalidatesTags: [
        "OrganizationCpdCategories",
        "OrganizationReports",
        "Organization",
      ],
    }),

    updateOrganizationCpdCategory: builder.mutation<
      TAPI.UpdateOrganizationCpdCategoryMutation["updateOrganizationCpdCategory"],
      TAPI.UpdateOrganizationCpdCategoryMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateOrganizationCpdCategoryDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateOrganizationCpdCategoryMutation,
      ) => response.updateOrganizationCpdCategory,
      invalidatesTags: [
        "OrganizationCpdCategories",
        "OrganizationReports",
        "Organization",
      ],
    }),

    deleteOrganizationCpdCategory: builder.mutation<
      TAPI.DeleteOrganizationCpdCategoryMutation["deleteOrganizationCpdCategory"],
      TAPI.DeleteOrganizationCpdCategoryMutationVariables["categoryId"]
    >({
      query: (categoryId) => ({
        document: API.DeleteOrganizationCpdCategoryDocument,
        variables: { categoryId },
      }),
      transformResponse: (
        response: TAPI.DeleteOrganizationCpdCategoryMutation,
      ) => response.deleteOrganizationCpdCategory,
      invalidatesTags: [
        "OrganizationCpdCategories",
        "OrganizationReports",
        "Organization",
      ],
    }),
  }),
});

export const {
  useOrganizationMembersQuery,
  useOrganizationReportsQuery,
  useOrganizationOverviewQuery,
  useOrganizationSettingsQuery,
  useOrganizationDepartmentsQuery,
  useOrganizationAssignmentsQuery,
  useLazyOrganizationMembersQuery,
  useLazyOrganizationReportsQuery,
  useOrganizationEventCatalogQuery,
  useLazyOrganizationOverviewQuery,
  useLazyOrganizationSettingsQuery,
  useOrganizationMembersStatsQuery,
  useOrganizationMemberDetailQuery,
  useAddOrganizationMemberMutation,
  useOrganizationCpdCategoriesQuery,
  useOrganizationAssignmentStatsQuery,
  useLazyOrganizationAssignmentsQuery,
  useLazyOrganizationDepartmentsQuery,
  useUpdateOrganizationMemberMutation,
  useLazyOrganizationEventCatalogQuery,
  useOrganizationCpdCategoryStatsQuery,
  useOrganizationReportTopMembersQuery,
  useLazyOrganizationMemberDetailQuery,
  useBulkAddOrganizationMembersMutation,
  useLazyOrganizationCpdCategoriesQuery,
  useUpdateOrganizationSettingsMutation,
  useUpdateOrganizationAssignmentMutation,
  useDeleteOrganizationCpdCategoryMutation,
  useLazyOrganizationReportTopMembersQuery,
  useDeleteOrganizationAssignmentMutation,
  useLazyOrganizationAssignmentStatsQuery,
  useCreateOrganizationDepartmentMutation,
  useUpdateOrganizationMemberNotesMutation,
  useUpdateOrganizationDepartmentMutation,
  useCreateOrganizationAssignmentMutation,
  useDeleteOrganizationDepartmentMutation,
  useCreateOrganizationCpdCategoryMutation,
  useUpdateOrganizationCpdCategoryMutation,
  useSubmitOrganizationAccessRequestMutation,
} = organizationApi;
