export enum ProviderGqlQueryNames {
  PROVIDER_SETTINGS = "providerSettings",
  PROVIDER_OVERVIEW = "providerOverview",
  PROVIDER_ANALYTICS = "providerAnalytics",
  PROVIDER_ATTENDEES = "providerAttendees",
  PROVIDER_EVENTS_TABLE = "providerEventsTable",
  PROVIDER_ANALYTICS_CSV = "providerAnalyticsCsv",
  PROVIDER_PROMOTION_REQUESTS = "providerPromotionRequests",
}

export enum ProviderGqlQueryMutation {
  UPDATE_PROVIDER_SETTINGS = "updateProviderSettings",
  SUBMIT_PROMOTION_REQUEST = "submitPromotionRequest",
}

export enum ProviderGqlInputNames {
  PROVIDER_EVENTS_FILTER_INPUT = "ProviderEventsFilterInput",
  PROVIDER_DASHBOARD_RANGE_INPUT = "ProviderDashboardRangeInput",
  UPDATE_PROVIDER_SETTINGS_INPUT = "UpdateProviderSettingsInput",
  SUBMIT_PROMOTION_REQUEST_INPUT = "SubmitPromotionRequestInput",
  PROVIDER_ATTENDEES_FILTER_INPUT = "ProviderAttendeesFilterInput",
  PROVIDER_PROMOTION_FILTER_INPUT = "ProviderPromotionFilterInput",
  PROVIDER_DASHBOARD_PAGINATION_INPUT = "ProviderDashboardPaginationInput",
}

export enum ProviderGqlObjectNames {
  CSV_EXPORT = "CsvExport",
  PROVIDER_SETTINGS = "ProviderSettings",
  PROVIDER_OVERVIEW = "ProviderOverview",
  PROMOTION_REQUEST = "PromotionRequest",
  PROVIDER_ATTENDEE = "ProviderAttendee",
  PROVIDER_TOP_EVENT = "ProviderTopEvent",
  PROVIDER_PAGE_INFO = "ProviderPageInfo",
  PROVIDER_ANALYTICS = "ProviderAnalytics",
  PROVIDER_CHART_ITEM = "ProviderChartItem",
  PROVIDER_ATTENDEE_STATS = "ProviderAttendeeStats",
  PROVIDER_EVENT_TABLE_ROW = "ProviderEventTableRow",
  PROVIDER_BREAKDOWN_POINT = "ProviderBreakdownPoint",
  PROVIDER_ANALYTICS_POINT = "ProviderAnalyticsPoint",
  PROVIDER_STATUS_BREAKDOWN = "ProviderStatusBreakdown",
  PAGINATED_PROVIDER_EVENTS = "PaginatedProviderEvents",
  PROVIDER_TIME_SERIES_POINT = "ProviderTimeSeriesPoint",
  PAGINATED_PROVIDER_ATTENDEES = "PaginatedProviderAttendees",
  PAGINATED_PROMOTION_REQUESTS = "PaginatedPromotionRequests",
}
