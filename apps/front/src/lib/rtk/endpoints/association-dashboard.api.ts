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
      invalidatesTags: ["AssociationMembers", "AssociationGroups"],
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
      invalidatesTags: ["AssociationMembers", "AssociationMemberStats"],
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
  useUpdateAssociationProfileMutation,
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
