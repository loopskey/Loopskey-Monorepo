export enum TelemetryGqlObjectNames {
  ACK = "TelemetryAck",
  REPORT = "SearchHealthReport",
  VITAL_SEGMENT = "SearchHealthVitalSegment",
  CONVERSION_ROW = "SearchHealthConversionRow",
  INTAKE_ROW = "SearchHealthIntakeRow",
}

export enum TelemetryGqlInputNames {
  BATCH = "TelemetryBatchInput",
  VITAL = "TelemetryVitalInput",
  CONVERSION = "TelemetryConversionInput",
  REPORT = "SearchHealthReportInput",
}

export enum TelemetryGqlQueryNames {
  SEARCH_HEALTH_REPORT = "searchHealthReport",
}

export enum TelemetryGqlMutationNames {
  RECORD_TELEMETRY = "recordTelemetry",
}

export enum TelemetryGqlEnumNames {
  METRIC = "TelemetryMetric",
  DEVICE = "TelemetryDevice",
  ROUTE_TEMPLATE = "TelemetryRouteTemplate",
  LOCALE = "TelemetryLocale",
  CONVERSION_EVENT = "TelemetryConversionEvent",
  CONTENT_KIND = "TelemetryContentKind",
  REGISTRATION_ROLE = "TelemetryRegistrationRole",
  ATTRIBUTION = "TelemetryAttribution",
  INTAKE_KIND = "TelemetryIntakeKind",
  INTAKE_OUTCOME = "TelemetryIntakeOutcome",
  NAVIGATION_TYPE = "TelemetryNavigationType",
  RATING = "TelemetryRating",
  VITAL_STATUS = "SearchHealthVitalStatus",
}
