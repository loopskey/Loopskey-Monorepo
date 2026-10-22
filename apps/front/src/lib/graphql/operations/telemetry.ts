import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type RecordTelemetryMutationVariables = Types.Exact<{
  input: Types.TelemetryBatchInput;
}>;


export type RecordTelemetryMutation = { __typename?: 'Mutation', recordTelemetry: { __typename?: 'TelemetryAck', accepted: number, dropped: number } };

export type SearchHealthReportQueryVariables = Types.Exact<{
  input: Types.SearchHealthReportInput;
}>;


export type SearchHealthReportQuery = { __typename?: 'Query', searchHealthReport: { __typename?: 'SearchHealthReport', from: string, to: string, days: number, daysWithData: number, minimumSamples: number, isCollecting: boolean, collection: { __typename?: 'SearchHealthCollection', apiEnabled: boolean, vitalsSampleRate: number, retentionDays: number, dedupWindowHours: number, notices: Array<Types.SearchHealthNotice> }, vitals: Array<{ __typename?: 'SearchHealthVitalSegment', metric: Types.TelemetryMetric, device: Types.TelemetryDevice, template: Types.TelemetryRouteTemplate, locale: Types.TelemetryLocale, samples: number, p75: number, status: Types.SearchHealthVitalStatus }>, conversions: Array<{ __typename?: 'SearchHealthConversionRow', event: Types.TelemetryConversionEvent, contentKind: Types.TelemetryContentKind, role: Types.TelemetryRegistrationRole, attribution: Types.TelemetryAttribution, locale: Types.TelemetryLocale, count: number }>, intake: Array<{ __typename?: 'SearchHealthIntakeRow', kind: Types.TelemetryIntakeKind, outcome: Types.TelemetryIntakeOutcome, count: number }> } };


export const RecordTelemetryDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RecordTelemetry($input: TelemetryBatchInput!) {
  recordTelemetry(input: $input) {
    accepted
    dropped
  }
}
    `) as unknown as TypedDocumentString<RecordTelemetryMutation, RecordTelemetryMutationVariables>;
export const SearchHealthReportDocument = /*#__PURE__*/ new TypedDocumentString(`
    query SearchHealthReport($input: SearchHealthReportInput!) {
  searchHealthReport(input: $input) {
    from
    to
    days
    daysWithData
    minimumSamples
    isCollecting
    collection {
      apiEnabled
      vitalsSampleRate
      retentionDays
      dedupWindowHours
      notices
    }
    vitals {
      metric
      device
      template
      locale
      samples
      p75
      status
    }
    conversions {
      event
      contentKind
      role
      attribution
      locale
      count
    }
    intake {
      kind
      outcome
      count
    }
  }
}
    `) as unknown as TypedDocumentString<SearchHealthReportQuery, SearchHealthReportQueryVariables>;