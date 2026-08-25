import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { AuditOutboxHandler } from "@infrastructure/outbox/handlers/audit-outbox.handler";
import { MailOutboxHandler } from "@infrastructure/outbox/handlers/mail-outbox.handler";
import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaModule } from "@prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    MailService,
    OutboxService,
    OutboxProcessor,
    MailOutboxHandler,
    AuditOutboxHandler,
    OutboxHandlerRegistry,
  ],
  exports: [MailService, OutboxService, OutboxHandlerRegistry],
})
export class MailModule {}
