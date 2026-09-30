import { LandingCatalogSearchDocument } from "@/lib/graphql/operations/landing";
import { PopularCategoriesDocument } from "@/lib/graphql/operations/landing";
import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";

export const landingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    popularCategories: builder.query<
      TAPI.PopularCategoriesQuery["popularCategories"],
      TAPI.PopularCategoriesQueryVariables["input"] | void
    >({
      query: (input) => ({
        document: PopularCategoriesDocument,
        variables: input ? { input } : {},
      }),
      transformResponse: (response: TAPI.PopularCategoriesQuery) =>
        response.popularCategories,
      providesTags: ["PopularCategories"],
    }),

    landingCatalogSearch: builder.query<
      TAPI.LandingCatalogSearchQuery["landingCatalogSearch"],
      TAPI.LandingCatalogSearchQueryVariables["input"]
    >({
      query: (input) => ({
        document: LandingCatalogSearchDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.LandingCatalogSearchQuery) =>
        response.landingCatalogSearch,
      providesTags: ["LandingCatalogSearch"],
    }),
  }),
});

export const {
  usePopularCategoriesQuery,
  useLazyPopularCategoriesQuery,
  useLandingCatalogSearchQuery,
  useLazyLandingCatalogSearchQuery,
} = landingApi;
