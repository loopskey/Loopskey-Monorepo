import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma, UserStatus } from "@prisma/client";
import { buildAssociationActivationEmail } from "@mail/association-email.template";
import { CreateAssociationAccountInput } from "@association/dtos/create-association-account.input";
import { ConflictException, Inject } from "@nestjs/common";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { ACCOUNT_ACTIVATION_API } from "@auth/public/account-activation-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { ASSOCIATION_SELECT } from "@association/types/association-service.types";
import { projectAssociation } from "@association/application/association.projection";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import {
  type AccountActivationApi,
  type AccountActivationLink,
} from "@auth/public/account-activation-api";

const UNIQUE_VIOLATION = "P2002";

@Injectable()
export class AssociationAccountService {
  private readonly logger = new Logger(AssociationAccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly outbox: OutboxService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identity: IdentityProfileApi,
    @Inject(ACCOUNT_ACTIVATION_API)
    private readonly activation: AccountActivationApi,
  ) {}

  async createAccount(actorId: string, input: CreateAssociationAccountInput) {
    const workEmail = input.workEmail.trim().toLowerCase();
    const name = input.name.trim();
    const { association, ownerId } = await this.createRecords(actorId, {
      ...input,
      name,
      workEmail,
    }).catch((error: unknown) => {
      if (this.isEmailTaken(error))
        throw new ConflictException({
          code: AssociationMessageCode.EMAIL_ALREADY_IN_USE,
          message: "An account already uses this work email.",
        });
      throw error;
    });

    const sent = await this.inviteOwner(
      association.id,
      ownerId,
      workEmail,
      name,
    );

    return {
      success: true,
      code: sent
        ? AssociationMessageCode.ACCOUNT_CREATED
        : AssociationMessageCode.ACTIVATION_EMAIL_NOT_SENT,
      message: sent
        ? "Association account created and the activation email was queued."
        : "Association account created, but the activation email could not be queued. Resend it from the association record.",
      association,
    };
  }

  async resendActivation(actorId: string, associationId: string) {
    const association = await this.prisma.association.findFirst({
      where: { id: associationId, deletedAt: null },
      select: {
        id: true,
        name: true,
        owner: { select: { id: true, email: true, status: true } },
      },
    });
    if (!association)
      throw new NotFoundException({
        code: AssociationMessageCode.ASSOCIATION_NOT_FOUND,
        message: "Association not found.",
      });
    if (association.owner.status !== UserStatus.PENDING)
      throw new ConflictException({
        code: AssociationMessageCode.ALREADY_ACTIVATED,
        message: "This association account has already been activated.",
      });
    const destination = association.owner.email;
    if (!destination)
      throw new ConflictException({
        code: AssociationMessageCode.ASSOCIATION_NOT_FOUND,
        message: "This association owner has no email address.",
      });

    const link = await this.activation.resendActivationLink({
      userId: association.owner.id,
      destination,
      role: "ASSOCIATION",
    });
    if (!link)
      return {
        success: false,
        code: AssociationMessageCode.ACTIVATION_RESEND_TOO_SOON,
        message:
          "An activation email was sent recently. Try again after the cooldown.",
        association: null,
      };

    await this.sendActivationEmail(destination, association.name, link);
    this.logger.log("Association activation resent", {
      actorId,
      associationId: association.id,
    });
    return {
      success: true,
      code: AssociationMessageCode.ACTIVATION_EMAIL_SENT,
      message: "A new activation email was queued.",
      association: null,
    };
  }

  private createRecords(
    actorId: string,
    input: CreateAssociationAccountInput & { workEmail: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const owner = await this.identity.createPendingAssociationOwner({
        email: input.workEmail,
        fullName: input.representativeFullName,
        atomicContext: tx,
      });
      const association = await tx.association.create({
        data: {
          ownerId: owner.id,
          name: input.name,
          country: input.country?.trim() || null,
          website: input.website?.trim() || null,
          description: input.description?.trim() || null,
          logoUrl: input.logoUrl?.trim() || null,
          contactEmail: input.workEmail,
          settings: { create: {} },
        },
        select: ASSOCIATION_SELECT,
      });
      await this.outbox.append(
        {
          eventName: "audit.record.requested",
          eventVersion: 1,
          aggregateType: "Association",
          aggregateId: association.id,
          payload: {
            actorId,
            action: AuditAction.ASSOCIATION_ACCOUNT_CREATED,
            entityType: "Association",
            entityId: association.id,
            metadata: { associationName: input.name },
          },
        },
        tx,
      );
      return {
        association: projectAssociation(association),
        ownerId: owner.id,
      };
    });
  }

  private async inviteOwner(
    associationId: string,
    ownerId: string,
    destination: string,
    name: string,
  ) {
    try {
      const link = await this.activation.issueActivationLink({
        userId: ownerId,
        destination,
        role: "ASSOCIATION",
      });
      await this.sendActivationEmail(destination, name, link);
      return true;
    } catch (error) {
      this.logger.error("Association activation invitation failed", {
        associationId,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      return false;
    }
  }

  private sendActivationEmail(
    destination: string,
    associationName: string,
    link: AccountActivationLink,
  ) {
    const template = buildAssociationActivationEmail({
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
      associationName,
      supportEmail: this.config.get<string>(
        "SUPPORT_EMAIL",
        "support@loopskey.com",
      ),
      username: destination,
      activationUrl: link.activationUrl,
      loginUrl: this.loginUrl(),
      expiresInMinutes: link.expiresInMinutes,
    });
    return this.mail.sendEmail({ to: destination, ...template });
  }

  private loginUrl() {
    const configured = this.config.get<string>("ASSOCIATION_LOGIN_URL");
    if (configured) return configured;
    const base = this.config.get<string>("APPLICATION_BASE_URL");
    if (!base) throw new Error("APPLICATION_BASE_URL is not configured.");
    return `${base.replace(/\/$/, "")}/auth/professional`;
  }

  private isEmailTaken(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_VIOLATION
    );
  }
}
