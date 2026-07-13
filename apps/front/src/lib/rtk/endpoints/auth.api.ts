import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      TAPI.RegisterMutation["register"],
      TAPI.RegisterMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RegisterDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RegisterMutation) => response.register,
    }),

    verifyEmailOtp: builder.mutation<
      TAPI.VerifyEmailOtpMutation["verifyEmailOtp"],
      TAPI.VerifyEmailOtpMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.VerifyEmailOtpDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.VerifyEmailOtpMutation) =>
        response.verifyEmailOtp,
      invalidatesTags: (result) => (result?.success ? ["CurrentUser"] : []),
    }),

    resendEmailOtp: builder.mutation<
      TAPI.ResendEmailOtpMutation["resendEmailOtp"],
      TAPI.ResendEmailOtpMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ResendEmailOtpDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ResendEmailOtpMutation) =>
        response.resendEmailOtp,
    }),

    login: builder.mutation<
      TAPI.LoginMutation["login"],
      TAPI.LoginMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.LoginDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.LoginMutation) => response.login,
      invalidatesTags: (result) => (result?.success ? ["CurrentUser"] : []),
    }),

    refreshToken: builder.mutation<
      TAPI.RefreshTokenMutation["refreshToken"],
      void
    >({
      query: () => ({
        document: API.RefreshTokenDocument,
      }),
      transformResponse: (response: TAPI.RefreshTokenMutation) =>
        response.refreshToken,
      invalidatesTags: ["CurrentUser"],
    }),

    logout: builder.mutation<TAPI.LogoutMutation["logout"], void>({
      query: () => ({
        document: API.LogoutDocument,
      }),
      transformResponse: (response: TAPI.LogoutMutation) => response.logout,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
        } catch {
          // no-op
        }
      },
    }),

    forgotPassword: builder.mutation<
      TAPI.ForgotPasswordMutation["forgotPassword"],
      TAPI.ForgotPasswordMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ForgotPasswordDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ForgotPasswordMutation) =>
        response.forgotPassword,
    }),

    resetPassword: builder.mutation<
      TAPI.ResetPasswordMutation["resetPassword"],
      TAPI.ResetPasswordMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ResetPasswordDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ResetPasswordMutation) =>
        response.resetPassword,
      invalidatesTags: (result) => (result?.success ? ["CurrentUser"] : []),
    }),

    changePassword: builder.mutation<
      TAPI.ChangePasswordMutation["changePassword"],
      TAPI.ChangePasswordMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ChangePasswordDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ChangePasswordMutation) =>
        response.changePassword,
      invalidatesTags: ["CurrentUser"],
    }),

    currentUser: builder.query<TAPI.CurrentUserQuery["currentUser"], void>({
      query: () => ({
        document: API.CurrentUserDocument,
      }),
      transformResponse: (response: TAPI.CurrentUserQuery) =>
        response.currentUser,
      providesTags: ["CurrentUser"],
    }),

    requestEmailChange: builder.mutation<
      TAPI.RequestEmailChangeMutation["requestEmailChange"],
      TAPI.RequestEmailChangeMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RequestEmailChangeDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RequestEmailChangeMutation) =>
        response.requestEmailChange,
    }),

    verifyEmailChange: builder.mutation<
      TAPI.VerifyEmailChangeMutation["verifyEmailChange"],
      TAPI.VerifyEmailChangeMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.VerifyEmailChangeDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.VerifyEmailChangeMutation) =>
        response.verifyEmailChange,
      invalidatesTags: ["CurrentUser", "User"],
    }),

    googleOAuthUrl: builder.query<
      TAPI.GoogleOAuthUrlQuery["googleOAuthUrl"],
      TAPI.GoogleOAuthUrlQueryVariables["role"]
    >({
      query: (role) => ({
        document: API.GoogleOAuthUrlDocument,
        variables: { role },
      }),
      transformResponse: (response: TAPI.GoogleOAuthUrlQuery) =>
        response.googleOAuthUrl,
    }),

    linkedinOAuthUrl: builder.query<
      TAPI.LinkedInOAuthUrlQuery["linkedinOAuthUrl"],
      TAPI.LinkedInOAuthUrlQueryVariables["role"]
    >({
      query: (role) => ({
        document: API.LinkedInOAuthUrlDocument,
        variables: { role },
      }),
      transformResponse: (response: TAPI.LinkedInOAuthUrlQuery) =>
        response.linkedinOAuthUrl,
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useCurrentUserQuery,
  useRegisterMutation,
  useLazyCurrentUserQuery,
  useRefreshTokenMutation,
  useResetPasswordMutation,
  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useLazyGoogleOAuthUrlQuery,
  useVerifyEmailChangeMutation,
  useLazyLinkedinOAuthUrlQuery,
  useRequestEmailChangeMutation,
} = authApi;
