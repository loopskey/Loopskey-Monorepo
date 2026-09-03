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
} = associationApi;
