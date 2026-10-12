import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { SearchHealthVitalStatus } from "@telemetry/enums/telemetry-register.enum";
import { TelemetryGqlObjectNames } from "@telemetry/enums/gql-names.enum";

import * as P from "@prisma/client";

import "@telemetry/enums/telemetry-register.enum";

@ObjectType(TelemetryGqlObjectNames.ACK)
export class TelemetryAckEntity {
  @Field(() => Int)
  accepted: number;

  @Field(() => Int)
  dropped: number;
}

@ObjectType(TelemetryGqlObjectNames.VITAL_SEGMENT)
export class SearchHealthVitalSegmentEntity {
  @Field(() => P.TelemetryMetric)
  metric: P.TelemetryMetric;

  @Field(() => P.TelemetryDevice)
  device: P.TelemetryDevice;

  @Field(() => P.TelemetryRouteTemplate)
  template: P.TelemetryRouteTemplate;

  @Field(() => P.TelemetryLocale)
  locale: P.TelemetryLocale;

  @Field(() => Int)
  samples: number;

  @Field(() => Float)
  p75: number;

  @Field(() => SearchHealthVitalStatus)
  status: SearchHealthVitalStatus;
}

@ObjectType(TelemetryGqlObjectNames.CONVERSION_ROW)
export class SearchHealthConversionRowEntity {
  @Field(() => P.TelemetryConversionEvent)
  event: P.TelemetryConversionEvent;

  @Field(() => P.TelemetryContentKind)
  contentKind: P.TelemetryContentKind;

  @Field(() => P.TelemetryRegistrationRole)
  role: P.TelemetryRegistrationRole;

  @Field(() => P.TelemetryAttribution)
  attribution: P.TelemetryAttribution;

  @Field(() => Int)
  count: number;
}

@ObjectType(TelemetryGqlObjectNames.INTAKE_ROW)
export class SearchHealthIntakeRowEntity {
  @Field(() => P.TelemetryIntakeKind)
  kind: P.TelemetryIntakeKind;

  @Field(() => P.TelemetryIntakeOutcome)
  outcome: P.TelemetryIntakeOutcome;

  @Field(() => Int)
  count: number;
}

@ObjectType(TelemetryGqlObjectNames.REPORT)
export class SearchHealthReportEntity {
  @Field()
  from: Date;

  @Field()
  to: Date;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  daysWithData: number;

  @Field(() => Int)
  minimumSamples: number;

  @Field()
  isCollecting: boolean;

  @Field(() => [SearchHealthVitalSegmentEntity])
  vitals: SearchHealthVitalSegmentEntity[];

  @Field(() => [SearchHealthConversionRowEntity])
  conversions: SearchHealthConversionRowEntity[];

  @Field(() => [SearchHealthIntakeRowEntity])
  intake: SearchHealthIntakeRowEntity[];
}
