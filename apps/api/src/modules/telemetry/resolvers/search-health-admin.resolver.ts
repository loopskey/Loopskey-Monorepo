import { SearchHealthReportEntity } from "@telemetry/entities/search-health-report.entity";
import { SearchHealthReportInput } from "@telemetry/dtos/search-health-report.input";
import { TelemetryReportService } from "@telemetry/services/telemetry-report.service";
import { TelemetryGqlQueryNames } from "@telemetry/enums/gql-names.enum";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import "@telemetry/enums/telemetry-register.enum";

@Resolver()
@Roles(Role.ADMIN)
export class SearchHealthAdminResolver {
  constructor(private readonly reports: TelemetryReportService) {}

  @Query(() => SearchHealthReportEntity, {
    name: TelemetryGqlQueryNames.SEARCH_HEALTH_REPORT,
  })
  searchHealthReport(@Args("input") input: SearchHealthReportInput) {
    return this.reports.report(input.days);
  }
}
