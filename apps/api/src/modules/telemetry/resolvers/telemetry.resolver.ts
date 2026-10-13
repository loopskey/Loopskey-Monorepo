import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { TelemetryGqlMutationNames } from "@telemetry/enums/gql-names.enum";
import { TelemetryIntakeService } from "@telemetry/services/telemetry-intake.service";
import { TelemetryBatchInput } from "@telemetry/dtos/telemetry-batch.input";
import { TelemetryAckEntity } from "@telemetry/entities/search-health-report.entity";
import { Public } from "@common/decorators/public.decorator";

type GqlContext = { req?: { ip?: string } };

@Resolver()
export class TelemetryResolver {
  constructor(private readonly intake: TelemetryIntakeService) {}

  @Public()
  @Mutation(() => TelemetryAckEntity, {
    name: TelemetryGqlMutationNames.RECORD_TELEMETRY,
  })
  recordTelemetry(
    @Args("input") input: TelemetryBatchInput,
    @Context() context: GqlContext,
  ) {
    return this.intake.record(input, context.req?.ip);
  }
}
