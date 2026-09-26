import { ConfigModule, ConfigService } from "@nestjs/config";
import { REALTIME_OUTBOX_PROCESSOR } from "@infrastructure/outbox/outbox-processor.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { BULK_OUTBOX_PROCESSOR } from "@infrastructure/outbox/outbox-processor.service";
import { AuditOutboxHandler } from "@infrastructure/outbox/handlers/audit-outbox.handler";
import { MailOutboxHandler } from "@infrastructure/outbox/handlers/mail-outbox.handler";
import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { PrismaModule } from "@prisma/prisma.module";
import { MailService } from "@mail/mail.service";
import { Module } from "@nestjs/common";

const outboxProcessorProviders = [
  {
    provide: REALTIME_OUTBOX_PROCESSOR,
    useFactory: (
      prisma: PrismaService,
      handlers: OutboxHandlerRegistry,
      config: ConfigService,
    ) =>
      new OutboxProcessor(prisma, handlers, config, {
        lane: "realtime",
        pollIntervalConfigKey: "OUTBOX_POLL_INTERVAL_MS",
        leaseConfigKey: "OUTBOX_LEASE_MS",
      }),
    inject: [PrismaService, OutboxHandlerRegistry, ConfigService],
  },
  {
    provide: BULK_OUTBOX_PROCESSOR,
    useFactory: (
      prisma: PrismaService,
      handlers: OutboxHandlerRegistry,
      config: ConfigService,
    ) =>
      new OutboxProcessor(prisma, handlers, config, {
        lane: "bulk",
        pollIntervalConfigKey: "OUTBOX_BULK_POLL_INTERVAL_MS",
        leaseConfigKey: "OUTBOX_BULK_LEASE_MS",
      }),
    inject: [PrismaService, OutboxHandlerRegistry, ConfigService],
  },
];

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    MailService,
    OutboxService,
    MailOutboxHandler,
    AuditOutboxHandler,
    OutboxHandlerRegistry,
    ...outboxProcessorProviders,
  ],
  exports: [MailService, OutboxService, OutboxHandlerRegistry],
})
export class MailModule {}
