import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/operations/association-dashboard";

export const associationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    associationProfile: builder.query<
      TAPI.AssociationProfileQuery["associationProfile"],
      void
    >({
      query: () => ({
        document: API.AssociationProfileDocument,
      }),
      transformResponse: (response: TAPI.AssociationProfileQuery) =>
        response.associationProfile,
      providesTags: ["AssociationProfile", "Association"],
    }),

    updateAssociationProfile: builder.mutation<
      TAPI.UpdateAssociationProfileMutation["updateAssociationProfile"],
      TAPI.UpdateAssociationProfileMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAssociationProfileMutation) =>
        response.updateAssociationProfile,
      invalidatesTags: ["AssociationProfile", "Association"],
    }),

    createAssociationAccount: builder.mutation<
      TAPI.CreateAssociationAccountMutation["createAssociationAccount"],
      TAPI.CreateAssociationAccountMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateAssociationAccountDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateAssociationAccountMutation) =>
        response.createAssociationAccount,
      invalidatesTags: ["Association"],
    }),

    associationAccounts: builder.query<
      TAPI.AssociationAccountsQuery["associationAccounts"],
      TAPI.AssociationAccountsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationAccountsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationAccountsQuery) =>
        response.associationAccounts,
      providesTags: ["Association"],
    }),

    resendAssociationActivation: builder.mutation<
      TAPI.ResendAssociationActivationMutation["resendAssociationActivation"],
      TAPI.ResendAssociationActivationMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ResendAssociationActivationDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ResendAssociationActivationMutation) =>
        response.resendAssociationActivation,
    }),

    associationMembers: builder.query<
      TAPI.AssociationMembersQuery["associationMembers"],
      TAPI.AssociationMembersQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMembersDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationMembersQuery) =>
        response.associationMembers,
      providesTags: ["AssociationMembers"],
    }),

    associationMemberStats: builder.query<
      TAPI.AssociationMemberStatsQuery["associationMemberStats"],
      void
    >({
      query: () => ({
        document: API.AssociationMemberStatsDocument,
      }),
      transformResponse: (response: TAPI.AssociationMemberStatsQuery) =>
        response.associationMemberStats,
      providesTags: ["AssociationMemberStats"],
    }),

    associationGroups: builder.query<
      TAPI.AssociationGroupsQuery["associationGroups"],
      void
    >({
      query: () => ({
        document: API.AssociationGroupsDocument,
      }),
      transformResponse: (response: TAPI.AssociationGroupsQuery) =>
        response.associationGroups,
      providesTags: ["AssociationGroups"],
    }),

    inviteAssociationMember: builder.mutation<
      TAPI.InviteAssociationMemberMutation["inviteAssociationMember"],
      TAPI.InviteAssociationMemberMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.InviteAssociationMemberDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.InviteAssociationMemberMutation) =>
        response.inviteAssociationMember,
      invalidatesTags: [
        "AssociationMembers",
        "AssociationMemberStats",
        "AssociationGroups",
      ],
    }),

    bulkInviteAssociationMembers: builder.mutation<
      TAPI.BulkInviteAssociationMembersMutation["bulkInviteAssociationMembers"],
      TAPI.BulkInviteAssociationMembersMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.BulkInviteAssociationMembersDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.BulkInviteAssociationMembersMutation,
      ) => response.bulkInviteAssociationMembers,
      invalidatesTags: [
        "AssociationMembers",
        "AssociationMemberStats",
        "AssociationGroups",
      ],
    }),

    updateAssociationMember: builder.mutation<
      TAPI.UpdateAssociationMemberMutation["updateAssociationMember"],
      TAPI.UpdateAssociationMemberMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationMemberDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAssociationMemberMutation) =>
        response.updateAssociationMember,
      invalidatesTags: [
        "AssociationMembers",
        "AssociationGroups",
        "AssociationMemberProfile",
      ],
    }),

    setAssociationMemberStatus: builder.mutation<
      TAPI.SetAssociationMemberStatusMutation["setAssociationMemberStatus"],
      TAPI.SetAssociationMemberStatusMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SetAssociationMemberStatusDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SetAssociationMemberStatusMutation) =>
        response.setAssociationMemberStatus,
      invalidatesTags: [
        "AssociationMembers",
        "AssociationMemberStats",
        "AssociationMemberProfile",
      ],
    }),

    resendAssociationMemberInvitation: builder.mutation<
      TAPI.ResendAssociationMemberInvitationMutation["resendAssociationMemberInvitation"],
      TAPI.ResendAssociationMemberInvitationMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ResendAssociationMemberInvitationDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.ResendAssociationMemberInvitationMutation,
      ) => response.resendAssociationMemberInvitation,
      invalidatesTags: ["AssociationMembers"],
    }),

    createAssociationGroup: builder.mutation<
      TAPI.CreateAssociationGroupMutation["createAssociationGroup"],
      TAPI.CreateAssociationGroupMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateAssociationGroupDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateAssociationGroupMutation) =>
        response.createAssociationGroup,
      invalidatesTags: ["AssociationGroups"],
    }),

    updateAssociationGroup: builder.mutation<
      TAPI.UpdateAssociationGroupMutation["updateAssociationGroup"],
      TAPI.UpdateAssociationGroupMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationGroupDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateAssociationGroupMutation) =>
        response.updateAssociationGroup,
      invalidatesTags: ["AssociationGroups", "AssociationMembers"],
    }),

    associationMemberProfile: builder.query<
      TAPI.AssociationMemberProfileQuery["associationMemberProfile"],
      TAPI.AssociationMemberProfileQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMemberProfileDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationMemberProfileQuery) =>
        response.associationMemberProfile,
      providesTags: ["AssociationMemberProfile"],
    }),

    associationMemberActivities: builder.query<
      TAPI.AssociationMemberActivitiesQuery["associationMemberActivities"],
      TAPI.AssociationMemberActivitiesQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMemberActivitiesDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationMemberActivitiesQuery) =>
        response.associationMemberActivities,
      providesTags: ["AssociationMemberActivities"],
    }),

    associationMemberRequirementOptions: builder.query<
      TAPI.AssociationMemberRequirementOptionsQuery["associationMemberRequirementOptions"],
      TAPI.AssociationMemberRequirementOptionsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMemberRequirementOptionsDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationMemberRequirementOptionsQuery,
      ) => response.associationMemberRequirementOptions,
      providesTags: ["AssociationMemberProfile"],
    }),

    reviewAssociationLearningActivity: builder.mutation<
      TAPI.ReviewAssociationLearningActivityMutation["reviewAssociationLearningActivity"],
      TAPI.ReviewAssociationLearningActivityMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ReviewAssociationLearningActivityDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.ReviewAssociationLearningActivityMutation,
      ) => response.reviewAssociationLearningActivity,
      invalidatesTags: [
        "AssociationMemberProfile",
        "AssociationMemberActivities",
        "AssociationMembers",
      ],
    }),

    setAssociationMemberRequirements: builder.mutation<
      TAPI.SetAssociationMemberRequirementsMutation["setAssociationMemberRequirements"],
      TAPI.SetAssociationMemberRequirementsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SetAssociationMemberRequirementsDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.SetAssociationMemberRequirementsMutation,
      ) => response.setAssociationMemberRequirements,
      invalidatesTags: [
        "AssociationMemberProfile",
        "AssociationMemberActivities",
      ],
    }),

    associationRequirementOptions: builder.query<
      TAPI.AssociationRequirementOptionsQuery["associationRequirements"],
      TAPI.AssociationRequirementOptionsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRequirementOptionsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationRequirementOptionsQuery) =>
        response.associationRequirements,
      providesTags: ["AssociationLearningContent"],
    }),

    associationLearningContents: builder.query<
      TAPI.AssociationLearningContentsQuery["associationLearningContents"],
      TAPI.AssociationLearningContentsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationLearningContentsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationLearningContentsQuery) =>
        response.associationLearningContents,
      providesTags: ["AssociationLearningContent"],
    }),

    associationLearningContent: builder.query<
      TAPI.AssociationLearningContentQuery["associationLearningContent"],
      TAPI.AssociationLearningContentQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationLearningContentDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationLearningContentQuery) =>
        response.associationLearningContent,
      providesTags: ["AssociationLearningContent"],
    }),

    associationCatalogSearch: builder.query<
      TAPI.AssociationCatalogSearchQuery["associationCatalogSearch"],
      TAPI.AssociationCatalogSearchQueryVariables["input"]
    >({
      query: (input) => ({
        document: API.AssociationCatalogSearchDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.AssociationCatalogSearchQuery) =>
        response.associationCatalogSearch,
    }),

    createAssociationLearningContent: builder.mutation<
      TAPI.CreateAssociationLearningContentMutation["createAssociationLearningContent"],
      TAPI.CreateAssociationLearningContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateAssociationLearningContentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateAssociationLearningContentMutation,
      ) => response.createAssociationLearningContent,
      invalidatesTags: ["AssociationLearningContent"],
    }),

    updateAssociationLearningContent: builder.mutation<
      TAPI.UpdateAssociationLearningContentMutation["updateAssociationLearningContent"],
      TAPI.UpdateAssociationLearningContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationLearningContentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationLearningContentMutation,
      ) => response.updateAssociationLearningContent,
      invalidatesTags: ["AssociationLearningContent"],
    }),

    publishAssociationLearningContent: builder.mutation<
      TAPI.PublishAssociationLearningContentMutation["publishAssociationLearningContent"],
      TAPI.PublishAssociationLearningContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.PublishAssociationLearningContentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.PublishAssociationLearningContentMutation,
      ) => response.publishAssociationLearningContent,
      invalidatesTags: ["AssociationLearningContent"],
    }),

    withdrawAssociationLearningContent: builder.mutation<
      TAPI.WithdrawAssociationLearningContentMutation["withdrawAssociationLearningContent"],
      TAPI.WithdrawAssociationLearningContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.WithdrawAssociationLearningContentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.WithdrawAssociationLearningContentMutation,
      ) => response.withdrawAssociationLearningContent,
      invalidatesTags: ["AssociationLearningContent"],
    }),

    deleteAssociationLearningContent: builder.mutation<
      TAPI.DeleteAssociationLearningContentMutation["deleteAssociationLearningContent"],
      TAPI.DeleteAssociationLearningContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.DeleteAssociationLearningContentDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.DeleteAssociationLearningContentMutation,
      ) => response.deleteAssociationLearningContent,
      invalidatesTags: ["AssociationLearningContent"],
    }),

    setAssociationGroupActive: builder.mutation<
      TAPI.SetAssociationGroupActiveMutation["setAssociationGroupActive"],
      TAPI.SetAssociationGroupActiveMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SetAssociationGroupActiveDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SetAssociationGroupActiveMutation) =>
        response.setAssociationGroupActive,
      invalidatesTags: ["AssociationGroups", "AssociationMembers"],
    }),

    associationReportsOverview: builder.query<
      TAPI.AssociationReportsOverviewQuery,
      TAPI.AssociationReportsOverviewQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationReportsOverviewDocument,
        variables,
      }),
      providesTags: ["AssociationReports"],
    }),

    associationProgressByCategory: builder.query<
      TAPI.AssociationProgressByCategoryQuery["associationProgressByCategory"],
      TAPI.AssociationProgressByCategoryQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationProgressByCategoryDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationProgressByCategoryQuery) =>
        response.associationProgressByCategory,
      providesTags: ["AssociationReports"],
    }),

    associationMemberProgressReport: builder.query<
      TAPI.AssociationMemberProgressReportQuery["associationMemberProgressReport"],
      TAPI.AssociationMemberProgressReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMemberProgressReportDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationMemberProgressReportQuery,
      ) => response.associationMemberProgressReport,
      providesTags: ["AssociationReports"],
    }),

    associationGroupProgressReport: builder.query<
      TAPI.AssociationGroupProgressReportQuery["associationGroupProgressReport"],
      TAPI.AssociationGroupProgressReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationGroupProgressReportDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationGroupProgressReportQuery) =>
        response.associationGroupProgressReport,
      providesTags: ["AssociationReports"],
    }),

    associationCategoryCompletionReport: builder.query<
      TAPI.AssociationCategoryCompletionReportQuery["associationCategoryCompletionReport"],
      TAPI.AssociationCategoryCompletionReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationCategoryCompletionReportDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationCategoryCompletionReportQuery,
      ) => response.associationCategoryCompletionReport,
      providesTags: ["AssociationReports"],
    }),

    associationMissingEvidenceReport: builder.query<
      TAPI.AssociationMissingEvidenceReportQuery["associationMissingEvidenceReport"],
      TAPI.AssociationMissingEvidenceReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMissingEvidenceReportDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationMissingEvidenceReportQuery,
      ) => response.associationMissingEvidenceReport,
      providesTags: ["AssociationReports"],
    }),

    associationRenewalReadinessReport: builder.query<
      TAPI.AssociationRenewalReadinessReportQuery["associationRenewalReadinessReport"],
      TAPI.AssociationRenewalReadinessReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRenewalReadinessReportDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationRenewalReadinessReportQuery,
      ) => response.associationRenewalReadinessReport,
      providesTags: ["AssociationReports"],
    }),

    associationGeneratedReports: builder.query<
      TAPI.AssociationGeneratedReportsQuery["associationGeneratedReports"],
      TAPI.AssociationGeneratedReportsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationGeneratedReportsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationGeneratedReportsQuery) =>
        response.associationGeneratedReports,
      providesTags: ["AssociationReportExports"],
    }),

    requestAssociationReportExport: builder.mutation<
      TAPI.RequestAssociationReportExportMutation["requestAssociationReportExport"],
      TAPI.RequestAssociationReportExportMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RequestAssociationReportExportDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.RequestAssociationReportExportMutation,
      ) => response.requestAssociationReportExport,
      invalidatesTags: ["AssociationReportExports"],
    }),

    retryAssociationReportExport: builder.mutation<
      TAPI.RetryAssociationReportExportMutation["retryAssociationReportExport"],
      TAPI.RetryAssociationReportExportMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RetryAssociationReportExportDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.RetryAssociationReportExportMutation,
      ) => response.retryAssociationReportExport,
      invalidatesTags: ["AssociationReportExports"],
    }),

    associationSettings: builder.query<
      TAPI.AssociationSettingsQuery["associationSettings"],
      void
    >({
      query: () => ({ document: API.AssociationSettingsDocument }),
      transformResponse: (response: TAPI.AssociationSettingsQuery) =>
        response.associationSettings,
      providesTags: ["AssociationSettings"],
    }),

    updateAssociationComplianceSettings: builder.mutation<
      TAPI.UpdateAssociationComplianceSettingsMutation["updateAssociationComplianceSettings"],
      TAPI.UpdateAssociationComplianceSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationComplianceSettingsDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationComplianceSettingsMutation,
      ) => response.updateAssociationComplianceSettings,
      invalidatesTags: (_result, _error, input) =>
        input.dryRun
          ? []
          : [
              "AssociationSettings",
              "AssociationProfile",
              "AssociationReports",
              "AssociationAttention",
              "AssociationMemberProfile",
            ],
    }),

    updateAssociationNotificationSettings: builder.mutation<
      TAPI.UpdateAssociationNotificationSettingsMutation["updateAssociationNotificationSettings"],
      TAPI.UpdateAssociationNotificationSettingsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationNotificationSettingsDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationNotificationSettingsMutation,
      ) => response.updateAssociationNotificationSettings,
      invalidatesTags: ["AssociationSettings", "AssociationProfile"],
    }),

    associationOverviewCounts: builder.query<
      TAPI.AssociationOverviewCountsQuery,
      void
    >({
      query: () => ({ document: API.AssociationOverviewCountsDocument }),
      providesTags: ["AssociationMemberStats", "AssociationLearningContent"],
    }),

    associationRequirementProgressReport: builder.query<
      TAPI.AssociationRequirementProgressReportQuery["associationRequirementProgressReport"],
      TAPI.AssociationRequirementProgressReportQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRequirementProgressReportDocument,
        variables,
      }),
      transformResponse: (
        response: TAPI.AssociationRequirementProgressReportQuery,
      ) => response.associationRequirementProgressReport,
      providesTags: ["AssociationReports"],
    }),

    associationRecentActivity: builder.query<
      TAPI.AssociationRecentActivityQuery["associationRecentActivity"],
      TAPI.AssociationRecentActivityQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRecentActivityDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationRecentActivityQuery) =>
        response.associationRecentActivity,
      providesTags: ["AssociationMemberActivities"],
    }),

    associationAttentionLists: builder.query<
      TAPI.AssociationAttentionListsQuery["associationAttentionLists"],
      void
    >({
      query: () => ({ document: API.AssociationAttentionListsDocument }),
      transformResponse: (response: TAPI.AssociationAttentionListsQuery) =>
        response.associationAttentionLists,
      providesTags: ["AssociationAttention"],
    }),

    associationAttentionMembers: builder.query<
      TAPI.AssociationAttentionMembersQuery["associationAttentionMembers"],
      TAPI.AssociationAttentionMembersQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationAttentionMembersDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationAttentionMembersQuery) =>
        response.associationAttentionMembers,
      providesTags: ["AssociationAttention"],
    }),

    associationMessagePreview: builder.query<
      TAPI.AssociationMessagePreviewQuery["associationMessagePreview"],
      TAPI.AssociationMessagePreviewQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMessagePreviewDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationMessagePreviewQuery) =>
        response.associationMessagePreview,
      providesTags: ["AssociationAttention"],
    }),

    associationMessageHistory: builder.query<
      TAPI.AssociationMessageHistoryQuery["associationMessageHistory"],
      TAPI.AssociationMessageHistoryQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationMessageHistoryDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationMessageHistoryQuery) =>
        response.associationMessageHistory,
      providesTags: ["AssociationMessageHistory"],
    }),

    sendAssociationMessage: builder.mutation<
      TAPI.SendAssociationMessageMutation["sendAssociationMessage"],
      TAPI.SendAssociationMessageMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SendAssociationMessageDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SendAssociationMessageMutation) =>
        response.sendAssociationMessage,
      invalidatesTags: ["AssociationAttention", "AssociationMessageHistory"],
    }),
    associationRequirements: builder.query<
      TAPI.AssociationRequirementsQuery["associationRequirements"],
      TAPI.AssociationRequirementsQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRequirementsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationRequirementsQuery) =>
        response.associationRequirements,
      providesTags: ["AssociationRequirements"],
    }),

    associationRequirement: builder.query<
      TAPI.AssociationRequirementQuery["associationRequirement"],
      TAPI.AssociationRequirementQueryVariables
    >({
      query: (variables) => ({
        document: API.AssociationRequirementDocument,
        variables,
      }),
      transformResponse: (response: TAPI.AssociationRequirementQuery) =>
        response.associationRequirement,
      providesTags: ["AssociationRequirements"],
    }),

    associationRequirementStats: builder.query<
      TAPI.AssociationRequirementStatsQuery["associationRequirementStats"],
      void
    >({
      query: () => ({
        document: API.AssociationRequirementStatsDocument,
      }),
      transformResponse: (response: TAPI.AssociationRequirementStatsQuery) =>
        response.associationRequirementStats,
      providesTags: ["AssociationRequirementStats"],
    }),

    createAssociationRequirementDraft: builder.mutation<
      TAPI.CreateAssociationRequirementDraftMutation["createAssociationRequirementDraft"],
      TAPI.CreateAssociationRequirementDraftMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateAssociationRequirementDraftDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.CreateAssociationRequirementDraftMutation,
      ) => response.createAssociationRequirementDraft,
      invalidatesTags: [
        "AssociationRequirements",
        "AssociationRequirementStats",
      ],
    }),

    updateAssociationRequirementDetails: builder.mutation<
      TAPI.UpdateAssociationRequirementDetailsMutation["updateAssociationRequirementDetails"],
      TAPI.UpdateAssociationRequirementDetailsMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationRequirementDetailsDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationRequirementDetailsMutation,
      ) => response.updateAssociationRequirementDetails,
      invalidatesTags: ["AssociationRequirements"],
    }),

    updateAssociationRequirementCategories: builder.mutation<
      TAPI.UpdateAssociationRequirementCategoriesMutation["updateAssociationRequirementCategories"],
      TAPI.UpdateAssociationRequirementCategoriesMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationRequirementCategoriesDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationRequirementCategoriesMutation,
      ) => response.updateAssociationRequirementCategories,
      invalidatesTags: ["AssociationRequirements"],
    }),

    updateAssociationRequirementEvidenceRules: builder.mutation<
      TAPI.UpdateAssociationRequirementEvidenceRulesMutation["updateAssociationRequirementEvidenceRules"],
      TAPI.UpdateAssociationRequirementEvidenceRulesMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationRequirementEvidenceRulesDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationRequirementEvidenceRulesMutation,
      ) => response.updateAssociationRequirementEvidenceRules,
      invalidatesTags: ["AssociationRequirements"],
    }),

    updateAssociationRequirementReportingRules: builder.mutation<
      TAPI.UpdateAssociationRequirementReportingRulesMutation["updateAssociationRequirementReportingRules"],
      TAPI.UpdateAssociationRequirementReportingRulesMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationRequirementReportingRulesDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationRequirementReportingRulesMutation,
      ) => response.updateAssociationRequirementReportingRules,
      invalidatesTags: ["AssociationRequirements"],
    }),

    updateAssociationRequirementAudience: builder.mutation<
      TAPI.UpdateAssociationRequirementAudienceMutation["updateAssociationRequirementAudience"],
      TAPI.UpdateAssociationRequirementAudienceMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateAssociationRequirementAudienceDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.UpdateAssociationRequirementAudienceMutation,
      ) => response.updateAssociationRequirementAudience,
      invalidatesTags: [
        "AssociationRequirements",
        "AssociationRequirementStats",
      ],
    }),

    publishAssociationRequirement: builder.mutation<
      TAPI.PublishAssociationRequirementMutation["publishAssociationRequirement"],
      TAPI.PublishAssociationRequirementMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.PublishAssociationRequirementDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.PublishAssociationRequirementMutation,
      ) => response.publishAssociationRequirement,
      invalidatesTags: [
        "AssociationRequirements",
        "AssociationRequirementStats",
      ],
    }),

    archiveAssociationRequirement: builder.mutation<
      TAPI.ArchiveAssociationRequirementMutation["archiveAssociationRequirement"],
      TAPI.ArchiveAssociationRequirementMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ArchiveAssociationRequirementDocument,
        variables: { input },
      }),
      transformResponse: (
        response: TAPI.ArchiveAssociationRequirementMutation,
      ) => response.archiveAssociationRequirement,
      invalidatesTags: [
        "AssociationRequirements",
        "AssociationRequirementStats",
      ],
    }),
  }),
});

export const {
  useAssociationProfileQuery,
  useAssociationGroupsQuery,
  useAssociationMembersQuery,
  useAssociationMemberStatsQuery,
  useAssociationMemberProfileQuery,
  useAssociationMemberActivitiesQuery,
  useAssociationMemberRequirementOptionsQuery,
  useReviewAssociationLearningActivityMutation,
  useSetAssociationMemberRequirementsMutation,
  useAssociationRequirementOptionsQuery,
  useAssociationLearningContentsQuery,
  useAssociationLearningContentQuery,
  useAssociationCatalogSearchQuery,
  useCreateAssociationLearningContentMutation,
  useUpdateAssociationLearningContentMutation,
  usePublishAssociationLearningContentMutation,
  useWithdrawAssociationLearningContentMutation,
  useDeleteAssociationLearningContentMutation,
  useUpdateAssociationProfileMutation,
  useAssociationAccountsQuery,
  useCreateAssociationAccountMutation,
  useResendAssociationActivationMutation,
  useInviteAssociationMemberMutation,
  useBulkInviteAssociationMembersMutation,
  useUpdateAssociationMemberMutation,
  useSetAssociationMemberStatusMutation,
  useResendAssociationMemberInvitationMutation,
  useCreateAssociationGroupMutation,
  useUpdateAssociationGroupMutation,
  useSetAssociationGroupActiveMutation,
  useAssociationReportsOverviewQuery,
  useAssociationProgressByCategoryQuery,
  useAssociationMemberProgressReportQuery,
  useAssociationGroupProgressReportQuery,
  useAssociationCategoryCompletionReportQuery,
  useAssociationMissingEvidenceReportQuery,
  useAssociationRenewalReadinessReportQuery,
  useAssociationGeneratedReportsQuery,
  useRequestAssociationReportExportMutation,
  useRetryAssociationReportExportMutation,
  useAssociationSettingsQuery,
  useUpdateAssociationComplianceSettingsMutation,
  useUpdateAssociationNotificationSettingsMutation,
  useAssociationOverviewCountsQuery,
  useAssociationRequirementProgressReportQuery,
  useAssociationRecentActivityQuery,
  useAssociationAttentionListsQuery,
  useAssociationAttentionMembersQuery,
  useAssociationMessagePreviewQuery,
  useAssociationMessageHistoryQuery,
  useSendAssociationMessageMutation,
  useAssociationRequirementsQuery,
  useAssociationRequirementQuery,
  useAssociationRequirementStatsQuery,
  useCreateAssociationRequirementDraftMutation,
  useUpdateAssociationRequirementDetailsMutation,
  useUpdateAssociationRequirementCategoriesMutation,
  useUpdateAssociationRequirementEvidenceRulesMutation,
  useUpdateAssociationRequirementReportingRulesMutation,
  useUpdateAssociationRequirementAudienceMutation,
  usePublishAssociationRequirementMutation,
  useArchiveAssociationRequirementMutation,
} = associationApi;
