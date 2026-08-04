import { OutboxProcessor } from "@infrastructure/outbox/outbox-processor.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaModule } from "@prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [MailService, OutboxService, OutboxProcessor],
  exports: [MailService, OutboxService],
})
export class MailModule {}
