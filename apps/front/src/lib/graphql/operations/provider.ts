import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ProviderSettingsFieldsFragment = { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean };

export type ProviderStatusBreakdownFieldsFragment = { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number };

export type ProviderOverviewFieldsFragment = { __typename?: 'ProviderOverview', totalViews: number, totalEvents: number, providerName?: string | null, conversionRate: number, upcomingSessions: number, totalRegistrations: number, statusBreakdown: { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number } };

export type ProviderTimeSeriesPointFieldsFragment = { __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number };

export type ProviderBreakdownPointFieldsFragment = { __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null };

export type ProviderTopEventFieldsFragment = { __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number };

export type ProviderAnalyticsFieldsFragment = { __typename?: 'ProviderAnalytics', avgRating: number, totalRevenue: number, conversionRate: number, avgFeePerAttendee: number, registrationsOverTime: Array<{ __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number }>, pdusByCategory: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, eventTypeBreakdown: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, topPerformingEvents: Array<{ __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number }> };

export type CsvExportFieldsFragment = { __typename?: 'CsvExport', filename: string, mimeType: string, content: string };

export type ProviderPageInfoFieldsFragment = { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null };

export type ProviderEventTableRowFieldsFragment = { __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: Types.EventStatus, startDate: string, registrants: number };

export type PaginatedProviderEventsFieldsFragment = { __typename?: 'PaginatedProviderEvents', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: Types.EventStatus, startDate: string, registrants: number }> };

export type PromotionRequestFieldsFragment = { __typename?: 'PromotionRequest', id: string, note?: string | null, status: Types.PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: Types.PromotionType };

export type PaginatedPromotionRequestsFieldsFragment = { __typename?: 'PaginatedPromotionRequests', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'PromotionRequest', id: string, note?: string | null, status: Types.PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: Types.PromotionType }> };

export type ProviderSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ProviderSettingsQuery = { __typename?: 'Query', providerSettings: { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean } };

export type ProviderOverviewQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.ProviderDashboardRangeInput>;
}>;


export type ProviderOverviewQuery = { __typename?: 'Query', providerOverview: { __typename?: 'ProviderOverview', totalViews: number, totalEvents: number, providerName?: string | null, conversionRate: number, upcomingSessions: number, totalRegistrations: number, statusBreakdown: { __typename?: 'ProviderStatusBreakdown', draft: number, archived: number, published: number, cancelled: number } } };

export type ProviderAnalyticsQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.ProviderDashboardRangeInput>;
}>;


export type ProviderAnalyticsQuery = { __typename?: 'Query', providerAnalytics: { __typename?: 'ProviderAnalytics', avgRating: number, totalRevenue: number, conversionRate: number, avgFeePerAttendee: number, registrationsOverTime: Array<{ __typename?: 'ProviderTimeSeriesPoint', date: string, revenue: number, registrations: number }>, pdusByCategory: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, eventTypeBreakdown: Array<{ __typename?: 'ProviderBreakdownPoint', label: string, count: number, value?: number | null }>, topPerformingEvents: Array<{ __typename?: 'ProviderTopEvent', title: string, views: number, revenue: number, eventId: string, registrations: number, conversionRate: number }> } };

export type ProviderAnalyticsCsvQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.ProviderDashboardRangeInput>;
}>;


export type ProviderAnalyticsCsvQuery = { __typename?: 'Query', providerAnalyticsCsv: { __typename?: 'CsvExport', filename: string, mimeType: string, content: string } };

export type ProviderEventsTableQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProviderEventsFilterInput>;
  pagination?: Types.InputMaybe<Types.ProviderDashboardPaginationInput>;
}>;


export type ProviderEventsTableQuery = { __typename?: 'Query', providerEventsTable: { __typename?: 'PaginatedProviderEvents', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderEventTableRow', id: string, pdu: number, title: string, views: number, status: Types.EventStatus, startDate: string, registrants: number }> } };

export type ProviderPromotionRequestsQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProviderPromotionFilterInput>;
  pagination?: Types.InputMaybe<Types.ProviderDashboardPaginationInput>;
}>;


export type ProviderPromotionRequestsQuery = { __typename?: 'Query', providerPromotionRequests: { __typename?: 'PaginatedPromotionRequests', totalCount: number, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'PromotionRequest', id: string, note?: string | null, status: Types.PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: Types.PromotionType }> } };

export type UpdateProviderSettingsMutationVariables = Types.Exact<{
  input: Types.UpdateProviderSettingsInput;
}>;


export type UpdateProviderSettingsMutation = { __typename?: 'Mutation', updateProviderSettings: { __typename?: 'ProviderSettings', id: string, updatedAt: string, createdAt: string, providerId: string, contactEmail?: string | null, organizationName?: string | null, aboutOrganization?: string | null, organizationProfile?: string | null, eventReminderEnabled: boolean, reminderHoursBeforeEvent: number, newRegistrationAlertEnabled: boolean } };

export type SubmitPromotionRequestMutationVariables = Types.Exact<{
  input: Types.SubmitPromotionRequestInput;
}>;


export type SubmitPromotionRequestMutation = { __typename?: 'Mutation', submitPromotionRequest: { __typename?: 'PromotionRequest', id: string, note?: string | null, status: Types.PromotionRequestStatus, budget?: number | null, eventId: string, updatedAt: string, createdAt: string, eventTitle: string, providerId: string, rejectReason?: string | null, promotionType: Types.PromotionType } };

export type ProviderAttendeesStatsFieldsFragment = { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number };

export type PaginatedProviderAttendeesFieldsFragment = { __typename?: 'PaginatedProviderAttendees', totalCount: number, stats: { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number }, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: Types.EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string }> };

export type ProviderAttendeeFieldsFragment = { __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: Types.EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string };

export type ProviderAttendeesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.ProviderAttendeesFilterInput>;
  pagination?: Types.InputMaybe<Types.ProviderDashboardPaginationInput>;
}>;


export type ProviderAttendeesQuery = { __typename?: 'Query', providerAttendees: { __typename?: 'PaginatedProviderAttendees', totalCount: number, stats: { __typename?: 'ProviderAttendeesStats', totalRegistered: number, confirmed: number, attended: number, attendanceRate: number }, pageInfo: { __typename?: 'ProviderPageInfo', hasNextPage: boolean, nextCursor?: string | null }, items: Array<{ __typename?: 'ProviderAttendee', name?: string | null, email?: string | null, status: Types.EventRegistrationStatus, userId: string, eventId: string, attendedAt?: string | null, eventTitle: string, completedAt?: string | null, registrationId: string, registrationDate: string }> } };

export const ProviderSettingsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}
    `, {"fragmentName":"ProviderSettingsFields"}) as unknown as TypedDocumentString<ProviderSettingsFieldsFragment, unknown>;
export const ProviderStatusBreakdownFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}
    `, {"fragmentName":"ProviderStatusBreakdownFields"}) as unknown as TypedDocumentString<ProviderStatusBreakdownFieldsFragment, unknown>;
export const ProviderOverviewFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderOverviewFields on ProviderOverview {
  totalViews
  totalEvents
  providerName
  conversionRate
  upcomingSessions
  totalRegistrations
  statusBreakdown {
    ...ProviderStatusBreakdownFields
  }
}
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}`, {"fragmentName":"ProviderOverviewFields"}) as unknown as TypedDocumentString<ProviderOverviewFieldsFragment, unknown>;
export const ProviderTimeSeriesPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
    `, {"fragmentName":"ProviderTimeSeriesPointFields"}) as unknown as TypedDocumentString<ProviderTimeSeriesPointFieldsFragment, unknown>;
export const ProviderBreakdownPointFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
    `, {"fragmentName":"ProviderBreakdownPointFields"}) as unknown as TypedDocumentString<ProviderBreakdownPointFieldsFragment, unknown>;
export const ProviderTopEventFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}
    `, {"fragmentName":"ProviderTopEventFields"}) as unknown as TypedDocumentString<ProviderTopEventFieldsFragment, unknown>;
export const ProviderAnalyticsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderAnalyticsFields on ProviderAnalytics {
  avgRating
  totalRevenue
  conversionRate
  avgFeePerAttendee
  registrationsOverTime {
    ...ProviderTimeSeriesPointFields
  }
  pdusByCategory {
    ...ProviderBreakdownPointFields
  }
  eventTypeBreakdown {
    ...ProviderBreakdownPointFields
  }
  topPerformingEvents {
    ...ProviderTopEventFields
  }
}
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}`, {"fragmentName":"ProviderAnalyticsFields"}) as unknown as TypedDocumentString<ProviderAnalyticsFieldsFragment, unknown>;
export const CsvExportFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CsvExportFields on CsvExport {
  filename
  mimeType
  content
}
    `, {"fragmentName":"CsvExportFields"}) as unknown as TypedDocumentString<CsvExportFieldsFragment, unknown>;
export const ProviderPageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
    `, {"fragmentName":"ProviderPageInfoFields"}) as unknown as TypedDocumentString<ProviderPageInfoFieldsFragment, unknown>;
export const ProviderEventTableRowFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}
    `, {"fragmentName":"ProviderEventTableRowFields"}) as unknown as TypedDocumentString<ProviderEventTableRowFieldsFragment, unknown>;
export const PaginatedProviderEventsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedProviderEventsFields on PaginatedProviderEvents {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderEventTableRowFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}`, {"fragmentName":"PaginatedProviderEventsFields"}) as unknown as TypedDocumentString<PaginatedProviderEventsFieldsFragment, unknown>;
export const PromotionRequestFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}
    `, {"fragmentName":"PromotionRequestFields"}) as unknown as TypedDocumentString<PromotionRequestFieldsFragment, unknown>;
export const PaginatedPromotionRequestsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedPromotionRequestsFields on PaginatedPromotionRequests {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...PromotionRequestFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}`, {"fragmentName":"PaginatedPromotionRequestsFields"}) as unknown as TypedDocumentString<PaginatedPromotionRequestsFieldsFragment, unknown>;
export const ProviderAttendeesStatsFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
    `, {"fragmentName":"ProviderAttendeesStatsFields"}) as unknown as TypedDocumentString<ProviderAttendeesStatsFieldsFragment, unknown>;
export const ProviderAttendeeFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}
    `, {"fragmentName":"ProviderAttendeeFields"}) as unknown as TypedDocumentString<ProviderAttendeeFieldsFragment, unknown>;
export const PaginatedProviderAttendeesFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment PaginatedProviderAttendeesFields on PaginatedProviderAttendees {
  totalCount
  stats {
    ...ProviderAttendeesStatsFields
  }
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderAttendeeFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}`, {"fragmentName":"PaginatedProviderAttendeesFields"}) as unknown as TypedDocumentString<PaginatedProviderAttendeesFieldsFragment, unknown>;
export const ProviderSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderSettings {
  providerSettings {
    ...ProviderSettingsFields
  }
}
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}`) as unknown as TypedDocumentString<ProviderSettingsQuery, ProviderSettingsQueryVariables>;
export const ProviderOverviewDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderOverview($input: ProviderDashboardRangeInput) {
  providerOverview(input: $input) {
    ...ProviderOverviewFields
  }
}
    fragment ProviderStatusBreakdownFields on ProviderStatusBreakdown {
  draft
  archived
  published
  cancelled
}
fragment ProviderOverviewFields on ProviderOverview {
  totalViews
  totalEvents
  providerName
  conversionRate
  upcomingSessions
  totalRegistrations
  statusBreakdown {
    ...ProviderStatusBreakdownFields
  }
}`) as unknown as TypedDocumentString<ProviderOverviewQuery, ProviderOverviewQueryVariables>;
export const ProviderAnalyticsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderAnalytics($input: ProviderDashboardRangeInput) {
  providerAnalytics(input: $input) {
    ...ProviderAnalyticsFields
  }
}
    fragment ProviderTimeSeriesPointFields on ProviderTimeSeriesPoint {
  date
  revenue
  registrations
}
fragment ProviderBreakdownPointFields on ProviderBreakdownPoint {
  label
  count
  value
}
fragment ProviderTopEventFields on ProviderTopEvent {
  title
  views
  revenue
  eventId
  registrations
  conversionRate
}
fragment ProviderAnalyticsFields on ProviderAnalytics {
  avgRating
  totalRevenue
  conversionRate
  avgFeePerAttendee
  registrationsOverTime {
    ...ProviderTimeSeriesPointFields
  }
  pdusByCategory {
    ...ProviderBreakdownPointFields
  }
  eventTypeBreakdown {
    ...ProviderBreakdownPointFields
  }
  topPerformingEvents {
    ...ProviderTopEventFields
  }
}`) as unknown as TypedDocumentString<ProviderAnalyticsQuery, ProviderAnalyticsQueryVariables>;
export const ProviderAnalyticsCsvDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderAnalyticsCsv($input: ProviderDashboardRangeInput) {
  providerAnalyticsCsv(input: $input) {
    ...CsvExportFields
  }
}
    fragment CsvExportFields on CsvExport {
  filename
  mimeType
  content
}`) as unknown as TypedDocumentString<ProviderAnalyticsCsvQuery, ProviderAnalyticsCsvQueryVariables>;
export const ProviderEventsTableDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderEventsTable($filter: ProviderEventsFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerEventsTable(filter: $filter, pagination: $pagination) {
    ...PaginatedProviderEventsFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderEventTableRowFields on ProviderEventTableRow {
  id
  pdu
  title
  views
  status
  startDate
  registrants
}
fragment PaginatedProviderEventsFields on PaginatedProviderEvents {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderEventTableRowFields
  }
}`) as unknown as TypedDocumentString<ProviderEventsTableQuery, ProviderEventsTableQueryVariables>;
export const ProviderPromotionRequestsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderPromotionRequests($filter: ProviderPromotionFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerPromotionRequests(filter: $filter, pagination: $pagination) {
    ...PaginatedPromotionRequestsFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}
fragment PaginatedPromotionRequestsFields on PaginatedPromotionRequests {
  totalCount
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...PromotionRequestFields
  }
}`) as unknown as TypedDocumentString<ProviderPromotionRequestsQuery, ProviderPromotionRequestsQueryVariables>;
export const UpdateProviderSettingsDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateProviderSettings($input: UpdateProviderSettingsInput!) {
  updateProviderSettings(input: $input) {
    ...ProviderSettingsFields
  }
}
    fragment ProviderSettingsFields on ProviderSettings {
  id
  updatedAt
  createdAt
  providerId
  contactEmail
  organizationName
  aboutOrganization
  organizationProfile
  eventReminderEnabled
  reminderHoursBeforeEvent
  newRegistrationAlertEnabled
}`) as unknown as TypedDocumentString<UpdateProviderSettingsMutation, UpdateProviderSettingsMutationVariables>;
export const SubmitPromotionRequestDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SubmitPromotionRequest($input: SubmitPromotionRequestInput!) {
  submitPromotionRequest(input: $input) {
    ...PromotionRequestFields
  }
}
    fragment PromotionRequestFields on PromotionRequest {
  id
  note
  status
  budget
  eventId
  updatedAt
  createdAt
  eventTitle
  providerId
  rejectReason
  promotionType
}`) as unknown as TypedDocumentString<SubmitPromotionRequestMutation, SubmitPromotionRequestMutationVariables>;
export const ProviderAttendeesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ProviderAttendees($filter: ProviderAttendeesFilterInput, $pagination: ProviderDashboardPaginationInput) {
  providerAttendees(filter: $filter, pagination: $pagination) {
    ...PaginatedProviderAttendeesFields
  }
}
    fragment ProviderPageInfoFields on ProviderPageInfo {
  hasNextPage
  nextCursor
}
fragment ProviderAttendeesStatsFields on ProviderAttendeesStats {
  totalRegistered
  confirmed
  attended
  attendanceRate
}
fragment PaginatedProviderAttendeesFields on PaginatedProviderAttendees {
  totalCount
  stats {
    ...ProviderAttendeesStatsFields
  }
  pageInfo {
    ...ProviderPageInfoFields
  }
  items {
    ...ProviderAttendeeFields
  }
}
fragment ProviderAttendeeFields on ProviderAttendee {
  name
  email
  status
  userId
  eventId
  attendedAt
  eventTitle
  completedAt
  registrationId
  registrationDate
}`) as unknown as TypedDocumentString<ProviderAttendeesQuery, ProviderAttendeesQueryVariables>;