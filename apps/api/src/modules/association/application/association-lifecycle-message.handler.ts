import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { AppLanguage } from "@prisma/client";
import { AssociationMessageDeliveryState } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { LIFECYCLE_MESSAGE_TYPES } from "@association/enums/association-notification.enum";
import { LIFECYCLE_EVENT_BY_TYPE } from "@association/enums/association-notification.enum";
import { messageTemplateInput } from "@association/utils/association-message-context.util";
import { readMessageContext } from "@association/utils/association-message-context.util";
import { type CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { buildAssociationLifecycleEmail } from "@mail/association-lifecycle.template";
import { buildAssociationMessageEmail } from "@mail/association-message.template";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { type TSendEmailInput } from "@mail/mail-service.type";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";

import { type OutboxEventContext } from "@infrastructure/outbox/outbox-handler.port";

type LifecyclePayload = { deliveryId: string; mail?: TSendEmailInput };

type RenderedEmail = { subject: string; text: string; html: string };

type Addressee = {
  memberName: string;
  language: AppLanguage;
};

const DELIVERY_SELECT = {
  id: true,
  state: true,
  createdAt: true,
  context: true,
  messageType: true,
  recipientUserId: true,
  association: { select: { name: true } },
  member: {
    select: { id: true, status: true, groupId: true, associationId: true },
  },
} satisfies Prisma.AssociationMessageDeliverySelect;

type LifecycleDelivery = Prisma.AssociationMessageDeliveryGetPayload<{
  select: typeof DELIVERY_SELECT;
}>;

const CONTENT_PATH_BY_TYPE: Record<string, string> = {
  COURSE: "courses",
  EVENT: "events",
  PODCAST: "podcasts",
  YOUTUBE: "youtube",
};

const REQUIREMENTS_TAB = "cpd-pdu-progress";

const readId = (context: Prisma.JsonValue, key: string) => {
  if (typeof context !== "object" || context === null || Array.isArray(context))
    return null;
  const value = context[key];
  return typeof value === "string" && value ? value : null;
};

@Injectable()
export class AssociationLifecycleMessageHandler implements OnModuleInit {
  private readonly logger = new Logger(AssociationLifecycleMessageHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly registry: OutboxHandlerRegistry,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identity: IdentityProfileApi,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly professional: ProfessionalComplianceApi,
    @Inject(CATALOG_ENDORSEMENT_API)
    private readonly catalog: CatalogEndorsementApi,
  ) {}

  onModuleInit() {
    for (const messageType of LIFECYCLE_MESSAGE_TYPES)
      this.registry.register({
        lane: "realtime",
        eventName: LIFECYCLE_EVENT_BY_TYPE[messageType],
        handlerName: `association-lifecycle-${messageType.toLowerCase()}-v1`,
        handle: (payload, event) => this.attempt(payload, event),
        abandon: (payload) => this.abandon(payload),
      });
  }

  async attempt(payload: unknown, event: OutboxEventContext) {
    try {
      await this.handle(payload, event);
    } catch (error) {
      await this.markRetrying(payload);
      throw error;
    }
  }

  private async markRetrying(payload: unknown) {
    const { deliveryId } = payload as LifecyclePayload;

    await this.prisma.associationMessageDelivery.updateMany({
      where: { id: deliveryId, state: AssociationMessageDeliveryState.QUEUED },
      data: { failureReason: AssociationMessageCode.MESSAGE_DELIVERY_RETRYING },
    });
  }

  async handle(payload: unknown, event: OutboxEventContext) {
    const { deliveryId, mail } = payload as LifecyclePayload;

    const delivery = await this.prisma.associationMessageDelivery.findUnique({
      where: { id: deliveryId },
      select: DELIVERY_SELECT,
    });

    if (!delivery) return;

    if (delivery.state !== AssociationMessageDeliveryState.QUEUED) {
      this.logger.log("Association lifecycle delivery already settled", {
        deliveryId,
        state: delivery.state,
      });
      return;
    }

    if (delivery.messageType === AssociationMessageType.INVITATION) {
      await this.deliverInvitation(delivery, mail, event);
      return;
    }

    if (delivery.member.status !== AssociationMemberStatus.ACTIVE) {
      await this.skip(
        delivery,
        AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
      );
      return;
    }

    const [recipient] = await this.identity.recipients([
      delivery.recipientUserId,
    ]);

    if (!recipient?.isActive) {
      await this.skip(delivery, AssociationMessageSkipReason.INACTIVE_ACCOUNT);
      return;
    }

    if (!recipient.email || !recipient.emailVerifiedAt) {
      await this.skip(delivery, AssociationMessageSkipReason.NO_VERIFIED_EMAIL);
      return;
    }

    const addressee = {
      memberName: recipient.fullName ?? recipient.email,
      language: await this.languageOf(delivery.recipientUserId),
    };

    const template = await this.render(delivery, addressee);

    if (!template) {
      await this.skip(
        delivery,
        AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
      );
      return;
    }

    await this.mail.deliver(
      { to: recipient.email, ...template },
      event.idempotencyKey,
    );

    await this.settle(delivery, addressee.language);
  }

  async abandon(payload: unknown) {
    const { deliveryId } = payload as LifecyclePayload;

    await this.prisma.associationMessageDelivery.updateMany({
      where: { id: deliveryId, state: AssociationMessageDeliveryState.QUEUED },
      data: {
        state: AssociationMessageDeliveryState.FAILED,
        failureReason: AssociationMessageCode.MESSAGE_DELIVERY_FAILED,
      },
    });
  }

  private async deliverInvitation(
    delivery: LifecycleDelivery,
    mail: TSendEmailInput | undefined,
    event: OutboxEventContext,
  ) {
    if (
      !mail ||
      delivery.member.status !== AssociationMemberStatus.PENDING_ACTIVATION ||
      (await this.isSupersededInvitation(delivery))
    ) {
      await this.skip(
        delivery,
        AssociationMessageSkipReason.NO_LONGER_APPLICABLE,
      );
      return;
    }

    await this.mail.deliver(mail, event.idempotencyKey);
    await this.settle(delivery);
  }

  private async isSupersededInvitation(delivery: LifecycleDelivery) {
    const newer = await this.prisma.associationMessageDelivery.findFirst({
      where: {
        memberId: delivery.member.id,
        messageType: AssociationMessageType.INVITATION,
        createdAt: { gt: delivery.createdAt },
      },
      select: { id: true },
    });
    return newer !== null;
  }

  private async render(
    delivery: LifecycleDelivery,
    addressee: Addressee,
  ): Promise<RenderedEmail | null> {
    if (delivery.messageType === AssociationMessageType.WELCOME)
      return buildAssociationMessageEmail(
        messageTemplateInput({
          ...addressee,
          ...this.brand(),
          messageType: AssociationMessageType.WELCOME,
          associationName: delivery.association.name,
          dashboardUrl: this.dashboardUrl(),
          context: readMessageContext(null),
        }),
      );

    if (delivery.messageType === AssociationMessageType.GROUP_ADDED)
      return this.renderGroupAdded(delivery, addressee);

    if (delivery.messageType === AssociationMessageType.REQUIREMENT_ASSIGNED)
      return this.renderRequirementAssigned(delivery, addressee);

    if (
      delivery.messageType === AssociationMessageType.LEARNING_CONTENT_ASSIGNED
    )
      return this.renderLearningContentAssigned(delivery, addressee);

    return null;
  }

  private async renderGroupAdded(
    delivery: LifecycleDelivery,
    addressee: Addressee,
  ) {
    const groupId = readId(delivery.context, "groupId");
    if (!groupId || delivery.member.groupId !== groupId) return null;

    const group = await this.prisma.associationGroup.findFirst({
      where: {
        id: groupId,
        associationId: delivery.member.associationId,
        isActive: true,
      },
      select: { title: true },
    });
    if (!group) return null;

    return buildAssociationLifecycleEmail({
      ...addressee,
      ...this.brand(),
      messageType: AssociationMessageType.GROUP_ADDED,
      associationName: delivery.association.name,
      actionUrl: this.requirementsUrl(),
      groupTitle: group.title,
    });
  }

  private async renderRequirementAssigned(
    delivery: LifecycleDelivery,
    addressee: Addressee,
  ) {
    const assignmentId = readId(delivery.context, "assignmentId");
    if (!assignmentId) return null;

    const assignment =
      await this.prisma.associationRequirementAssignment.findFirst({
        where: {
          id: assignmentId,
          memberId: delivery.member.id,
          isTargeted: true,
          requirement: {
            associationId: delivery.member.associationId,
            status: AssociationRequirementStatus.PUBLISHED,
          },
        },
        select: {
          dueDate: true,
          requirement: { select: { id: true, name: true } },
        },
      });
    if (!assignment) return null;

    return buildAssociationLifecycleEmail({
      ...addressee,
      ...this.brand(),
      messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
      associationName: delivery.association.name,
      actionUrl: this.requirementsUrl(assignment.requirement.id),
      requirementName: assignment.requirement.name,
      deadline: assignment.dueDate,
    });
  }

  private async renderLearningContentAssigned(
    delivery: LifecycleDelivery,
    addressee: Addressee,
  ) {
    const recipientId = readId(delivery.context, "recipientId");
    if (!recipientId) return null;

    const recipient =
      await this.prisma.associationLearningContentRecipient.findFirst({
        where: {
          id: recipientId,
          memberId: delivery.member.id,
          isTargeted: true,
          learningContent: {
            associationId: delivery.member.associationId,
            status: AssociationLearningContentStatus.PUBLISHED,
          },
        },
        select: {
          learningContent: {
            select: {
              id: true,
              contentType: true,
              contentId: true,
              externalTitle: true,
              requirement: { select: { id: true, name: true, status: true } },
            },
          },
        },
      });
    if (!recipient) return null;

    const content = recipient.learningContent;
    const requirement =
      content.requirement?.status === AssociationRequirementStatus.PUBLISHED
        ? content.requirement
        : null;

    const target = await this.contentTarget(content);
    if (!target) return null;

    return buildAssociationLifecycleEmail({
      ...addressee,
      ...this.brand(),
      messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
      associationName: delivery.association.name,
      contentTitle: target.title,
      requirementName: requirement?.name ?? null,
      actionUrl: target.slugPath
        ? this.contentUrl(target.slugPath, content.id, requirement?.id)
        : this.requirementsUrl(requirement?.id),
    });
  }

  private async contentTarget(content: {
    contentType: string | null;
    contentId: string | null;
    externalTitle: string | null;
  }) {
    if (!content.contentType || !content.contentId)
      return content.externalTitle
        ? { title: content.externalTitle, slugPath: null }
        : null;

    const [item] = await this.catalog.resolveCatalogItems([
      { contentType: content.contentType, contentId: content.contentId },
    ]);
    if (!item?.isAvailable) return null;

    const path = CONTENT_PATH_BY_TYPE[content.contentType];

    return {
      title: item.title,
      slugPath:
        path && item.slug ? `${path}/${encodeURIComponent(item.slug)}` : null,
    };
  }

  private async languageOf(userId: string) {
    const [spoken] = await this.professional.languagesForOwners([userId]);
    return spoken?.language === AppLanguage.FR
      ? AppLanguage.FR
      : AppLanguage.EN;
  }

  private async settle(delivery: LifecycleDelivery, language?: AppLanguage) {
    const { count } = await this.prisma.associationMessageDelivery.updateMany({
      where: {
        id: delivery.id,
        state: AssociationMessageDeliveryState.QUEUED,
      },
      data: {
        sentAt: new Date(),
        failureReason: null,
        state: AssociationMessageDeliveryState.SENT,
        ...(language ? { language } : {}),
      },
    });

    this.logger.log("Association lifecycle message delivered", {
      deliveryId: delivery.id,
      settled: count === 1,
      messageType: delivery.messageType,
    });
  }

  private async skip(delivery: LifecycleDelivery, reason: string) {
    await this.prisma.associationMessageDelivery.updateMany({
      where: {
        id: delivery.id,
        state: AssociationMessageDeliveryState.QUEUED,
      },
      data: {
        state: AssociationMessageDeliveryState.SKIPPED,
        skipReason: reason,
        failureReason: null,
      },
    });

    this.logger.warn("Association lifecycle delivery skipped at send time", {
      deliveryId: delivery.id,
      messageType: delivery.messageType,
      reason,
    });
  }

  private brand() {
    return {
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
      supportEmail: this.config.get<string>(
        "SUPPORT_EMAIL",
        "support@loopskey.com",
      ),
    };
  }

  private origin() {
    return this.config
      .get<string>("FRONTEND_URL", "http://localhost:3000")
      .replace(/\/+$/, "");
  }

  private dashboardUrl() {
    return `${this.origin()}/dashboard/professional`;
  }

  private requirementsUrl(requirementId?: string) {
    const params = new URLSearchParams({ tab: REQUIREMENTS_TAB });
    if (requirementId)
      params.set("requirement", `association:${requirementId}`);
    return `${this.dashboardUrl()}?${params.toString()}`;
  }

  private contentUrl(
    slugPath: string,
    learningContentId: string,
    requirementId?: string,
  ) {
    const params = new URLSearchParams();
    if (requirementId)
      params.set("requirement", `association:${requirementId}`);
    params.set("learningContent", learningContentId);
    return `${this.origin()}/${slugPath}?${params.toString()}`;
  }
}
