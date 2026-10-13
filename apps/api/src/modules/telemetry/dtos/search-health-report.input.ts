import { TelemetryGqlInputNames } from "@telemetry/enums/gql-names.enum";
import { Field, InputType, Int } from "@nestjs/graphql";
import { TELEMETRY_LIMITS } from "@loopskey/api-contracts/validation";

import * as V from "class-validator";

@InputType(TelemetryGqlInputNames.REPORT)
export class SearchHealthReportInput {
  @Field(() => Int)
  @V.IsInt()
  @V.Min(1)
  @V.Max(TELEMETRY_LIMITS.reportWindowDaysMax)
  days: number;
}
