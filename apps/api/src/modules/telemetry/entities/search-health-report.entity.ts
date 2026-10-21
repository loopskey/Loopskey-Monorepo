import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { SearchHealthVitalStatus } from "@telemetry/enums/telemetry-register.enum";
import { TelemetryGqlObjectNames } from "@telemetry/enums/gql-names.enum";
import { SearchHealthNotice } from "@telemetry/enums/telemetry-register.enum";

import * as P from "@prisma/client";

import "@telemetry/enums/telemetry-register.enum";

@ObjectType(TelemetryGqlObjectNames.ACK)
export class TelemetryAckEntity {
  @Field(() => Int) dropped: number;
  @Field(() => Int) accepted: number;
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

  @Field(() => P.TelemetryLocale)
  locale: P.TelemetryLocale;

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

@ObjectType(TelemetryGqlObjectNames.COLLECTION)
export class SearchHealthCollectionEntity {
  @Field() apiEnabled: boolean;
  @Field(() => Int) retentionDays: number;
  @Field(() => Int) dedupWindowHours: number;
  @Field(() => Float) vitalsSampleRate: number;
  @Field(() => [SearchHealthNotice])
  notices: SearchHealthNotice[];
}

@ObjectType(TelemetryGqlObjectNames.REPORT)
export class SearchHealthReportEntity {
  @Field() to: Date;
  @Field() from: Date;
  @Field(() => Int) days: number;
  @Field() isCollecting: boolean;
  @Field(() => Int) daysWithData: number;
  @Field(() => Int) minimumSamples: number;
  @Field(() => SearchHealthCollectionEntity)
  collection: SearchHealthCollectionEntity;
  @Field(() => [SearchHealthVitalSegmentEntity])
  vitals: SearchHealthVitalSegmentEntity[];
  @Field(() => [SearchHealthConversionRowEntity])
  conversions: SearchHealthConversionRowEntity[];
  @Field(() => [SearchHealthIntakeRowEntity])
  intake: SearchHealthIntakeRowEntity[];
}
