import { LandingCatalogSearchDocument } from "@/lib/graphql/operations/landing";
import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";

export const landingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useLandingCatalogSearchQuery,
  useLazyLandingCatalogSearchQuery,
} = landingApi;
