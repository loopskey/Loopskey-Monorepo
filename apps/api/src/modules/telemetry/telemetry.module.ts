import { RegistrationCompletedHandler } from "@telemetry/handlers/registration-completed.handler";
import { TelemetryAggregateRepository } from "@telemetry/services/telemetry-aggregate.repository";
import { SearchHealthAdminResolver } from "@telemetry/resolvers/search-health-admin.resolver";
import { TelemetryRetentionService } from "@telemetry/services/telemetry-retention.service";
import { TelemetryReportService } from "@telemetry/services/telemetry-report.service";
import { TelemetryIntakeService } from "@telemetry/services/telemetry-intake.service";
import { TelemetryResolver } from "@telemetry/resolvers/telemetry.resolver";
import { RateLimitModule } from "@infrastructure/rate-limit/rate-limit.module";
import { PrismaModule } from "@prisma/prisma.module";
import { MailModule } from "@mail/mail.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, MailModule, RateLimitModule],
  providers: [
    TelemetryResolver,
    TelemetryIntakeService,
    TelemetryReportService,
    TelemetryRetentionService,
    SearchHealthAdminResolver,
    TelemetryAggregateRepository,
    RegistrationCompletedHandler,
  ],
})
export class TelemetryModule {}
