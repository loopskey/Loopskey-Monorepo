import { Injectable, OnModuleInit } from "@nestjs/common";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";
import { TSendEmailInput } from "@mail/mail-service.type";
import { MailService } from "@mail/mail.service";

@Injectable()
export class MailOutboxHandler implements OutboxHandler, OnModuleInit {
  readonly eventName = "mail.delivery.requested";
  readonly handlerName = "mail-v1";

  constructor(
    private readonly mail: MailService,
    private readonly registry: OutboxHandlerRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown) {
    await this.mail.deliver(payload as TSendEmailInput);
  }
}
