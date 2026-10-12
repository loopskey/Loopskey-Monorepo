import { SetProviderPublicProfileIndexExclusionDocument } from "@/lib/graphql/operations/provider-public-profile";
import { WithdrawProviderPublicProfileAsAdminDocument } from "@/lib/graphql/operations/provider-public-profile";
import { WithdrawProviderPublicProfileDocument } from "@/lib/graphql/operations/provider-public-profile";
import { AdminProviderPublicProfilesDocument } from "@/lib/graphql/operations/provider-public-profile";
import { SubmitProviderPublicProfileDocument } from "@/lib/graphql/operations/provider-public-profile";
import { ReviewProviderPublicProfileDocument } from "@/lib/graphql/operations/provider-public-profile";
import { SaveProviderPublicProfileDocument } from "@/lib/graphql/operations/provider-public-profile";
import { MyProviderPublicProfileDocument } from "@/lib/graphql/operations/provider-public-profile";
import { baseApi } from "@/lib/rtk/baseApi";

import type { SetProviderPublicProfileIndexExclusionInput } from "@/lib/graphql/base";
import type { AdminProviderPublicProfileFieldsFragment } from "@/lib/graphql/operations/provider-public-profile";
import type { ProviderPublicProfileDraftFieldsFragment } from "@/lib/graphql/operations/provider-public-profile";
import type { ModerateProviderPublicProfileInput } from "@/lib/graphql/base";
import type { ReviewProviderPublicProfileInput } from "@/lib/graphql/base";
import type { SubmitProviderPublicProfileInput } from "@/lib/graphql/base";
import type { SaveProviderPublicProfileInput } from "@/lib/graphql/base";
import type { ProviderProfileReviewState } from "@/lib/graphql/base";

type OwnProfile = ProviderPublicProfileDraftFieldsFragment;
type AdminProfile = AdminProviderPublicProfileFieldsFragment;

export const providerPublicProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myProviderPublicProfile: builder.query<OwnProfile | null, void>({
      query: () => ({ document: MyProviderPublicProfileDocument }),
      transformResponse: (response: {
        myProviderPublicProfile: OwnProfile | null;
      }) => response.myProviderPublicProfile,
      providesTags: ["ProviderPublicProfile"],
    }),

    saveProviderPublicProfile: builder.mutation<
      OwnProfile,
      SaveProviderPublicProfileInput
    >({
      query: (input) => ({
        document: SaveProviderPublicProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        saveProviderPublicProfile: OwnProfile;
      }) => response.saveProviderPublicProfile,
      invalidatesTags: ["ProviderPublicProfile"],
    }),

    submitProviderPublicProfile: builder.mutation<
      OwnProfile,
      SubmitProviderPublicProfileInput
    >({
      query: (input) => ({
        document: SubmitProviderPublicProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        submitProviderPublicProfile: OwnProfile;
      }) => response.submitProviderPublicProfile,
      invalidatesTags: ["ProviderPublicProfile"],
    }),

    withdrawProviderPublicProfile: builder.mutation<OwnProfile, void>({
      query: () => ({ document: WithdrawProviderPublicProfileDocument }),
      transformResponse: (response: {
        withdrawProviderPublicProfile: OwnProfile;
      }) => response.withdrawProviderPublicProfile,
      invalidatesTags: ["ProviderPublicProfile"],
    }),

    adminProviderPublicProfiles: builder.query<
      AdminProfile[],
      ProviderProfileReviewState | null
    >({
      query: (reviewState) => ({
        document: AdminProviderPublicProfilesDocument,
        variables: { reviewState },
      }),
      transformResponse: (response: {
        adminProviderPublicProfiles: AdminProfile[];
      }) => response.adminProviderPublicProfiles,
      providesTags: ["ProviderPublicProfile"],
    }),

    reviewProviderPublicProfile: builder.mutation<
      AdminProfile,
      ReviewProviderPublicProfileInput
    >({
      query: (input) => ({
        document: ReviewProviderPublicProfileDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        reviewProviderPublicProfile: AdminProfile;
      }) => response.reviewProviderPublicProfile,
      invalidatesTags: ["ProviderPublicProfile"],
    }),

    withdrawProviderPublicProfileAsAdmin: builder.mutation<
      AdminProfile,
      ModerateProviderPublicProfileInput
    >({
      query: (input) => ({
        document: WithdrawProviderPublicProfileAsAdminDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        withdrawProviderPublicProfileAsAdmin: AdminProfile;
      }) => response.withdrawProviderPublicProfileAsAdmin,
      invalidatesTags: ["ProviderPublicProfile"],
    }),

    setProviderPublicProfileIndexExclusion: builder.mutation<
      { id: string; excludeFromIndex: boolean },
      SetProviderPublicProfileIndexExclusionInput
    >({
      query: (input) => ({
        document: SetProviderPublicProfileIndexExclusionDocument,
        variables: { input },
      }),
      transformResponse: (response: {
        setProviderPublicProfileIndexExclusion: {
          id: string;
          excludeFromIndex: boolean;
        };
      }) => response.setProviderPublicProfileIndexExclusion,
      invalidatesTags: ["ProviderPublicProfile"],
    }),
  }),
});

export const {
  useMyProviderPublicProfileQuery,
  useAdminProviderPublicProfilesQuery,
  useSaveProviderPublicProfileMutation,
  useSubmitProviderPublicProfileMutation,
  useReviewProviderPublicProfileMutation,
  useWithdrawProviderPublicProfileMutation,
  useWithdrawProviderPublicProfileAsAdminMutation,
  useSetProviderPublicProfileIndexExclusionMutation,
} = providerPublicProfileApi;
