import { TELEMETRY_METRIC_BUCKETS } from "@loopskey/api-contracts/validation";
import { TelemetryNavigationType } from "@telemetry/enums/telemetry-register.enum";
import { Field, Float, InputType } from "@nestjs/graphql";
import { TelemetryGqlInputNames } from "@telemetry/enums/gql-names.enum";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";
import { TelemetryRating } from "@telemetry/enums/telemetry-register.enum";
import { Type } from "class-transformer";

import * as P from "@prisma/client";
import * as V from "class-validator";

import "@telemetry/enums/telemetry-register.enum";

const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const MAX_METRIC_VALUE = Math.max(
  ...Object.values(TELEMETRY_METRIC_BUCKETS).map((metric) => metric.max),
);

const CLIENT_CONVERSION_EVENTS = [
  P.TelemetryConversionEvent.CATALOG_DETAIL_OPEN,
  P.TelemetryConversionEvent.EXTERNAL_CONTENT_ACTION,
  P.TelemetryConversionEvent.REGISTRATION_START,
];

const CLIENT_LOCALES = [P.TelemetryLocale.EN, P.TelemetryLocale.FR];

const CLIENT_ATTRIBUTIONS = [
  P.TelemetryAttribution.DIRECT,
  P.TelemetryAttribution.ORGANIC_SEARCH,
  P.TelemetryAttribution.SOCIAL,
  P.TelemetryAttribution.REFERRAL,
  P.TelemetryAttribution.INTERNAL,
];

@InputType(TelemetryGqlInputNames.VITAL)
export class TelemetryVitalInput {
  @Field()
  @V.IsString()
  @V.MinLength(TELEMETRY_LIMITS.eventIdMin)
  @V.MaxLength(TELEMETRY_LIMITS.eventIdMax)
  @V.Matches(EVENT_ID_PATTERN)
  id: string;

  @Field(() => P.TelemetryMetric)
  @V.IsEnum(P.TelemetryMetric)
  name: P.TelemetryMetric;

  @Field(() => Float)
  @V.IsNumber({ allowNaN: false, allowInfinity: false })
  @V.Min(0)
  @V.Max(MAX_METRIC_VALUE)
  value: number;

  @Field(() => TelemetryRating)
  @V.IsEnum(TelemetryRating)
  rating: TelemetryRating;

  @Field(() => TelemetryNavigationType)
  @V.IsEnum(TelemetryNavigationType)
  navigationType: TelemetryNavigationType;

  @Field(() => P.TelemetryRouteTemplate)
  @V.IsEnum(P.TelemetryRouteTemplate)
  template: P.TelemetryRouteTemplate;

  @Field(() => P.TelemetryDevice)
  @V.IsEnum(P.TelemetryDevice)
  device: P.TelemetryDevice;

  @Field(() => P.TelemetryLocale)
  @V.IsIn(CLIENT_LOCALES)
  locale: P.TelemetryLocale;
}

@InputType(TelemetryGqlInputNames.CONVERSION)
export class TelemetryConversionInput {
  @Field()
  @V.IsString()
  @V.MinLength(TELEMETRY_LIMITS.eventIdMin)
  @V.MaxLength(TELEMETRY_LIMITS.eventIdMax)
  @V.Matches(EVENT_ID_PATTERN)
  id: string;

  @Field(() => P.TelemetryConversionEvent)
  @V.IsIn(CLIENT_CONVERSION_EVENTS)
  event: P.TelemetryConversionEvent;

  @Field(() => P.TelemetryContentKind, { defaultValue: "NONE" })
  @V.IsEnum(P.TelemetryContentKind)
  contentKind: P.TelemetryContentKind;

  @Field(() => P.TelemetryRegistrationRole, { defaultValue: "NONE" })
  @V.IsEnum(P.TelemetryRegistrationRole)
  role: P.TelemetryRegistrationRole;

  @Field(() => P.TelemetryAttribution)
  @V.IsIn(CLIENT_ATTRIBUTIONS)
  attribution: P.TelemetryAttribution;

  @Field(() => P.TelemetryLocale)
  @V.IsIn(CLIENT_LOCALES)
  locale: P.TelemetryLocale;
}

@InputType(TelemetryGqlInputNames.BATCH)
export class TelemetryBatchInput {
  @Field(() => [TelemetryVitalInput], { defaultValue: [] })
  @V.IsArray()
  @V.ArrayMaxSize(TELEMETRY_LIMITS.vitalsPerBatchMax)
  @V.ValidateNested({ each: true })
  @Type(() => TelemetryVitalInput)
  vitals: TelemetryVitalInput[];

  @Field(() => [TelemetryConversionInput], { defaultValue: [] })
  @V.IsArray()
  @V.ArrayMaxSize(TELEMETRY_LIMITS.conversionsPerBatchMax)
  @V.ValidateNested({ each: true })
  @Type(() => TelemetryConversionInput)
  conversions: TelemetryConversionInput[];
}
