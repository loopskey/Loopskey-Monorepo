import { SearchHealthReportDocument } from "@/lib/graphql/operations/telemetry";
import { baseApi } from "@/lib/rtk/baseApi";

import type { SearchHealthReportQuery } from "@/lib/graphql/operations/telemetry";

export type SearchHealthReport = SearchHealthReportQuery["searchHealthReport"];

export const telemetryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchHealthReport: builder.query<SearchHealthReport, number>({
      query: (days) => ({
        document: SearchHealthReportDocument,
        variables: { input: { days } },
      }),
      transformResponse: (response: SearchHealthReportQuery) =>
        response.searchHealthReport,
    }),
  }),
});

export const { useSearchHealthReportQuery } = telemetryApi;
