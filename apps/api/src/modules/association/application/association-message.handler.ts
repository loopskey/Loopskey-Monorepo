import { AssociationMessageDeliveryState } from "@prisma/client";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ASSOCIATION_MESSAGE_EVENT } from "@association/services/association-message.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { buildAssociationMessageEmail } from "@mail/association-message.template";
import { messageTemplateInput } from "@association/utils/association-message-context.util";
import { readMessageContext } from "@association/utils/association-message-context.util";
import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { PrismaService } from "@prisma/prisma.service";

type MessageDeliveryPayload = { deliveryId: string };

@Injectable()
export class AssociationMessageHandler implements OutboxHandler, OnModuleInit {
  readonly eventName = ASSOCIATION_MESSAGE_EVENT;
  readonly handlerName = "association-message-v1";

  private readonly logger = new Logger(AssociationMessageHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly registry: OutboxHandlerRegistry,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle(payload: unknown, event: OutboxEventContext) {
    const { deliveryId } = payload as MessageDeliveryPayload;

    const delivery = await this.prisma.associationMessageDelivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        state: true,
        context: true,
        language: true,
        messageType: true,
        association: { select: { name: true } },
        member: {
          select: { user: { select: { email: true, fullName: true } } },
        },
      },
    });

    if (!delivery) return;

    if (delivery.state !== AssociationMessageDeliveryState.QUEUED) {
      this.logger.log("Association message delivery already settled", {
        deliveryId,
        state: delivery.state,
      });
      return;
    }

    const email = delivery.member.user.email;

    if (!email) {
      await this.skip(deliveryId, AssociationMessageCode.MESSAGE_NO_RECIPIENTS);
      return;
    }

    const template = buildAssociationMessageEmail(
      messageTemplateInput({
        language: delivery.language,
        messageType: delivery.messageType,
        associationName: delivery.association.name,
        context: readMessageContext(delivery.context),
        dashboardUrl: this.dashboardUrl(),
        memberName: delivery.member.user.fullName ?? email,
        appName: this.config.get<string>("APP_NAME", "LoopsKey"),
        supportEmail: this.config.get<string>(
          "SUPPORT_EMAIL",
          "support@loopskey.com",
        ),
      }),
    );

    await this.mail.deliver({ to: email, ...template }, event.idempotencyKey);

    const { count } = await this.prisma.associationMessageDelivery.updateMany({
      where: { id: deliveryId, state: AssociationMessageDeliveryState.QUEUED },
      data: {
        sentAt: new Date(),
        state: AssociationMessageDeliveryState.SENT,
      },
    });

    this.logger.log("Association message delivered", {
      deliveryId,
      settled: count === 1,
      messageType: delivery.messageType,
    });
  }

  async abandon(payload: unknown) {
    const { deliveryId } = payload as MessageDeliveryPayload;

    await this.prisma.associationMessageDelivery.updateMany({
      where: { id: deliveryId, state: AssociationMessageDeliveryState.QUEUED },
      data: {
        state: AssociationMessageDeliveryState.FAILED,
        failureReason: AssociationMessageCode.MESSAGE_DELIVERY_FAILED,
      },
    });
  }

  private async skip(deliveryId: string, reason: string) {
    await this.prisma.associationMessageDelivery.updateMany({
      where: { id: deliveryId, state: AssociationMessageDeliveryState.QUEUED },
      data: {
        state: AssociationMessageDeliveryState.SKIPPED,
        skipReason: reason,
      },
    });

    this.logger.warn("Association message delivery skipped at send time", {
      deliveryId,
      reason,
    });
  }

  private dashboardUrl() {
    const origin = this.config
      .get<string>("FRONTEND_URL", "http://localhost:3000")
      .replace(/\/+$/, "");

    return `${origin}/dashboard/professional`;
  }
}
