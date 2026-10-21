import { TelemetryGqlEnumNames } from "@telemetry/enums/gql-names.enum";
import { registerEnumType } from "@nestjs/graphql";

import * as P from "@prisma/client";

export enum TelemetryNavigationType {
  RELOAD = "RELOAD",
  RESTORE = "RESTORE",
  NAVIGATE = "NAVIGATE",
  PRERENDER = "PRERENDER",
  BACK_FORWARD = "BACK_FORWARD",
}

export enum TelemetryRating {
  POOR = "POOR",
  GOOD = "GOOD",
  NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
}

export enum SearchHealthVitalStatus {
  GOOD = "GOOD",
  POOR = "POOR",
  NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
}

export enum SearchHealthNotice {
  NO_DATA = "NO_DATA",
  SAMPLED = "SAMPLED",
  RATE_LIMITED = "RATE_LIMITED",
  PARTIAL_COVERAGE = "PARTIAL_COVERAGE",
  DELIVERY_FAILURES = "DELIVERY_FAILURES",
  COLLECTION_DISABLED = "COLLECTION_DISABLED",
  INSUFFICIENT_SAMPLES = "INSUFFICIENT_SAMPLES",
  AGGREGATES_AVAILABLE = "AGGREGATES_AVAILABLE",
}

registerEnumType(P.TelemetryMetric, { name: TelemetryGqlEnumNames.METRIC });
registerEnumType(P.TelemetryDevice, { name: TelemetryGqlEnumNames.DEVICE });
registerEnumType(P.TelemetryRouteTemplate, {
  name: TelemetryGqlEnumNames.ROUTE_TEMPLATE,
});
registerEnumType(P.TelemetryLocale, { name: TelemetryGqlEnumNames.LOCALE });
registerEnumType(P.TelemetryConversionEvent, {
  name: TelemetryGqlEnumNames.CONVERSION_EVENT,
});
registerEnumType(P.TelemetryContentKind, {
  name: TelemetryGqlEnumNames.CONTENT_KIND,
});
registerEnumType(P.TelemetryRegistrationRole, {
  name: TelemetryGqlEnumNames.REGISTRATION_ROLE,
});
registerEnumType(P.TelemetryAttribution, {
  name: TelemetryGqlEnumNames.ATTRIBUTION,
});
registerEnumType(P.TelemetryIntakeKind, {
  name: TelemetryGqlEnumNames.INTAKE_KIND,
});
registerEnumType(P.TelemetryIntakeOutcome, {
  name: TelemetryGqlEnumNames.INTAKE_OUTCOME,
});
registerEnumType(TelemetryNavigationType, {
  name: TelemetryGqlEnumNames.NAVIGATION_TYPE,
});
registerEnumType(TelemetryRating, { name: TelemetryGqlEnumNames.RATING });
registerEnumType(SearchHealthVitalStatus, {
  name: TelemetryGqlEnumNames.VITAL_STATUS,
});
registerEnumType(SearchHealthNotice, { name: TelemetryGqlEnumNames.NOTICE });
