import { registerEnumType } from "@nestjs/graphql";
import { TelemetryGqlEnumNames } from "@telemetry/enums/gql-names.enum";

import * as P from "@prisma/client";

export enum TelemetryNavigationType {
  NAVIGATE = "NAVIGATE",
  RELOAD = "RELOAD",
  BACK_FORWARD = "BACK_FORWARD",
  RESTORE = "RESTORE",
  PRERENDER = "PRERENDER",
}

export enum TelemetryRating {
  GOOD = "GOOD",
  NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
  POOR = "POOR",
}

export enum SearchHealthVitalStatus {
  GOOD = "GOOD",
  NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT",
  POOR = "POOR",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
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
