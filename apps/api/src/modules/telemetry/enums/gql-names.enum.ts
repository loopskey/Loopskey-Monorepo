export enum TelemetryGqlObjectNames {
  ACK = "TelemetryAck",
  REPORT = "SearchHealthReport",
  INTAKE_ROW = "SearchHealthIntakeRow",
  COLLECTION = "SearchHealthCollection",
  VITAL_SEGMENT = "SearchHealthVitalSegment",
  CONVERSION_ROW = "SearchHealthConversionRow",
}

export enum TelemetryGqlInputNames {
  BATCH = "TelemetryBatchInput",
  VITAL = "TelemetryVitalInput",
  REPORT = "SearchHealthReportInput",
  CONVERSION = "TelemetryConversionInput",
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
  LOCALE = "TelemetryLocale",
  RATING = "TelemetryRating",
  NOTICE = "SearchHealthNotice",
  INTAKE_KIND = "TelemetryIntakeKind",
  ATTRIBUTION = "TelemetryAttribution",
  CONTENT_KIND = "TelemetryContentKind",
  VITAL_STATUS = "SearchHealthVitalStatus",
  ROUTE_TEMPLATE = "TelemetryRouteTemplate",
  INTAKE_OUTCOME = "TelemetryIntakeOutcome",
  NAVIGATION_TYPE = "TelemetryNavigationType",
  CONVERSION_EVENT = "TelemetryConversionEvent",
  REGISTRATION_ROLE = "TelemetryRegistrationRole",
}
