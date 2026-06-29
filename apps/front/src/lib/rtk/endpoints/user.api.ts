import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<TAPI.MeQuery["me"], void>({
      query: () => ({
        document: API.MeDocument,
      }),
      providesTags: ["User", "CurrentUser"],
    }),

    updateMe: builder.mutation<
      TAPI.UpdateMeMutation["updateMe"],
      TAPI.UpdateMeMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateMeDocument,
        variables: { input },
      }),
      invalidatesTags: ["User", "CurrentUser"],
    }),

    createUser: builder.mutation<
      TAPI.CreateUserMutation["createUser"],
      TAPI.CreateUserMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateUserDocument,
        variables: { input },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useUpdateMeMutation,
  useCreateUserMutation,
} = userApi;
