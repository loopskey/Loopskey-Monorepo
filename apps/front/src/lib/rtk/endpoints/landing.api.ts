import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const landingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    popularCategories: builder.query<
      TAPI.PopularCategoriesQuery["popularCategories"],
      TAPI.PopularCategoriesQueryVariables["input"] | void
    >({
      query: (input) => ({
        document: API.PopularCategoriesDocument,
        variables: input ? { input } : {},
      }),
      transformResponse: (response: TAPI.PopularCategoriesQuery) =>
        response.popularCategories,
      providesTags: ["PopularCategories"],
    }),
  }),
});

export const { usePopularCategoriesQuery, useLazyPopularCategoriesQuery } =
  landingApi;
