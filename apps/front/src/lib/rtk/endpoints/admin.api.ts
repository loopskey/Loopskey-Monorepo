import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    users: builder.query<
      TAPI.UsersQuery["users"],
      TAPI.UsersQueryVariables | void
    >({
      query: (variables) => ({
        document: API.UsersDocument,
        variables: variables ?? {},
      }),
      providesTags: ["Users"],
    }),

    userById: builder.query<
      TAPI.UserByIdQuery["userById"],
      TAPI.UserByIdQueryVariables["userId"]
    >({
      query: (userId) => ({
        document: API.UserByIdDocument,
        variables: { userId },
      }),
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),

    updateUser: builder.mutation<
      TAPI.UpdateUserMutation["updateUser"],
      TAPI.UpdateUserMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateUserDocument,
        variables: { input },
      }),
      invalidatesTags: (_result, _error, input) => [
        "Users",
        { type: "User", id: input.userId },
      ],
    }),

    updateUserStatus: builder.mutation<
      TAPI.UpdateUserStatusMutation["updateUserStatus"],
      TAPI.UpdateUserStatusMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateUserStatusDocument,
        variables: { input },
      }),
      invalidatesTags: (_result, _error, input) => [
        "Users",
        { type: "User", id: input.userId },
      ],
    }),

    deleteUser: builder.mutation<
      TAPI.DeleteUserMutation["deleteUser"],
      TAPI.DeleteUserMutationVariables["userId"]
    >({
      query: (userId) => ({
        document: API.DeleteUserDocument,
        variables: { userId },
      }),
      invalidatesTags: (_result, _error, userId) => [
        "Users",
        { type: "User", id: userId },
      ],
    }),

    restoreUser: builder.mutation<
      TAPI.RestoreUserMutation["restoreUser"],
      TAPI.RestoreUserMutationVariables["userId"]
    >({
      query: (userId) => ({
        document: API.RestoreUserDocument,
        variables: { userId },
      }),
      invalidatesTags: (_result, _error, userId) => [
        "Users",
        { type: "User", id: userId },
      ],
    }),

    organizationAccessRequests: builder.query<
      TAPI.OrganizationAccessRequestsQuery["organizationAccessRequests"],
      TAPI.OrganizationAccessRequestsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.OrganizationAccessRequestsDocument,
        variables: variables ?? {},
      }),
      providesTags: ["OrganizationAccessRequests"],
    }),

    organizationAccessRequestById: builder.query<
      TAPI.OrganizationAccessRequestByIdQuery["organizationAccessRequestById"],
      TAPI.OrganizationAccessRequestByIdQueryVariables["requestId"]
    >({
      query: (requestId) => ({
        document: API.OrganizationAccessRequestByIdDocument,
        variables: { requestId },
      }),
      providesTags: (_result, _error, requestId) => [
        { type: "OrganizationAccessRequest", id: requestId },
      ],
    }),
  }),
});

export const {
  useUsersQuery,
  useUserByIdQuery,
  useLazyUsersQuery,
  useLazyUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useUpdateUserStatusMutation,
  useOrganizationAccessRequestsQuery,
  useOrganizationAccessRequestByIdQuery,
  useLazyOrganizationAccessRequestsQuery,
  useLazyOrganizationAccessRequestByIdQuery,
} = adminApi;
