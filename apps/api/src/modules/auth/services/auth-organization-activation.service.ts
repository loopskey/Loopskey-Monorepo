import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ResendOrganizationActivationInput } from "@auth/dtos/resend-organization-activation.input";
import { OrganizationActivationTokenStatus } from "@auth/enums/organization-activation-token-status.enum";
import { ActivateOrganizationAccountInput } from "@auth/dtos/activate-organization-account.input";
import { buildOrganizationApprovalEmail } from "@mail/organization-email.template";
import { AuditAction, OtpPurpose, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { SessionStatus, UserStatus } from "@prisma/client";
import { ACTIVATION_RECORD_SELECT } from "@auth/types/auth-service.types";
import { createHash, randomBytes } from "crypto";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { MailService } from "@mail/mail.service";

import * as T from "@auth/types/auth-service.types";
import * as argon2 from "argon2";

const ACTIVATION_TOKEN_BYTES = 32;
const MIN_ACTIVATION_TOKEN_LENGTH = 20;
const MAX_ACTIVATION_TOKEN_LENGTH = 128;

@Injectable()
export class AuthOrganizationActivationService {
  private readonly logger = new Logger(AuthOrganizationActivationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly authCommon: AuthCommonService,
  ) {}

  async issueActivationLink({
    userId,
    destination,
  }: T.IssueActivationLinkArgs) {
    return this.prisma.$transaction((tx) =>
      this.createActivationLink(tx, { userId, destination }),
    );
  }

  private async createActivationLink(
    tx: Prisma.TransactionClient,
    { userId, destination }: T.IssueActivationLinkArgs,
  ) {
    const rawToken = randomBytes(ACTIVATION_TOKEN_BYTES).toString("base64url");
    const expiresInMinutes = this.activationExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);
    await tx.otpCode.updateMany({
      where: {
        userId,
        purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });
    await tx.otpCode.create({
      data: {
        userId,
        destination,
        codeHash: this.hashToken(rawToken),
        purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
        expiresAt,
        maxAttempts: 1,
        resendAfter: new Date(Date.now() + this.resendCooldownSeconds() * 1000),
      },
    });
    return {
      activationUrl: this.buildActivationUrl(rawToken),
      expiresInMinutes,
    };
  }

  async describeActivationToken(token: string) {
    const check = this.classifyActivation(await this.findActivation(token));
    return {
      status: check.status,
      organizationName:
        check.subject?.organizationProfile?.organizationName ?? null,
    };
  }

  async activateOrganizationAccount(input: ActivateOrganizationAccountInput) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });

    const check = this.classifyActivation(
      await this.findActivation(input.token),
    );
    if (check.status !== OrganizationActivationTokenStatus.VALID)
      throw this.activationTokenError(check.status);

    const pendingUser = check.subject;
    const organizationName =
      pendingUser.organizationProfile?.organizationName ?? "your Organization";
    this.assertPasswordIsNotObvious({
      password: input.password,
      email: pendingUser.email,
      organizationName,
    });

    const passwordHash = await argon2.hash(input.password);
    const activatedAt = new Date();
    const user = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.otpCode.updateMany({
        where: { id: check.otpCodeId, consumedAt: null },
        data: { consumedAt: activatedAt },
      });
      if (consumed.count !== 1)
        throw new BadRequestException({
          code: AuthMessageCode.ACTIVATION_TOKEN_USED,
          message: "This activation link has already been used.",
        });
      await tx.otpCode.updateMany({
        where: {
          userId: pendingUser.id,
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
          consumedAt: null,
        },
        data: { consumedAt: activatedAt },
      });
      await tx.authSession.updateMany({
        where: { userId: pendingUser.id, status: SessionStatus.ACTIVE },
        data: { status: SessionStatus.REVOKED, revokedAt: activatedAt },
      });
      await tx.auditLog.create({
        data: {
          actorId: pendingUser.id,
          action: AuditAction.ORGANIZATION_ACCOUNT_ACTIVATED,
          entityType: "User",
          entityId: pendingUser.id,
          metadata: { organizationName },
        },
      });
      return tx.user.update({
        where: { id: pendingUser.id },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: pendingUser.emailVerifiedAt ?? activatedAt,
          forcePasswordChange: false,
          passwordChangedAt: activatedAt,
        },
        select: AUTH_USER_SELECT,
      });
    });

    if (pendingUser.email) {
      try {
        await this.authCommon.sendOrganizationPasswordChangedEmail(
          pendingUser.email,
          organizationName,
        );
      } catch (error) {
        this.logger.error("Organization password confirmation email failed", {
          userId: pendingUser.id,
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }

    return {
      success: true,
      code: AuthMessageCode.ORGANIZATION_ACCOUNT_ACTIVATED,
      message: "Organization account activated successfully.",
      user,
    };
  }

  async resendActivation(input: ResendOrganizationActivationInput) {
    const email = this.authCommon.normalizeEmail(input.email);
    const genericResult = {
      success: true,
      code: AuthMessageCode.ACTIVATION_EMAIL_SENT,
      message:
        "If this account is awaiting activation, a new activation email has been sent.",
      user: null,
    };
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: Role.ORGANIZATION,
        status: UserStatus.PENDING,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        organizationProfile: { select: { organizationName: true } },
      },
    });
    if (!user?.email || !user.organizationProfile) return genericResult;
    const destination = user.email;
    try {
      const supportEmail = this.requiredConfig("SUPPORT_EMAIL");
      const loginUrl = this.requiredConfig("ORGANIZATION_LOGIN_URL");
      const invitation = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`organization-activation:${user.id}`}))`;
        if (!(await this.canResend(user.id, tx))) return null;
        const activationLink = await this.createActivationLink(tx, {
          userId: user.id,
          destination,
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: AuditAction.ORGANIZATION_ACTIVATION_RESENT,
            entityType: "User",
            entityId: user.id,
          },
        });
        return activationLink;
      });
      if (!invitation) return genericResult;
      const { activationUrl, expiresInMinutes } = invitation;
      const template = buildOrganizationApprovalEmail({
        appName: this.config.get<string>("APP_NAME", "LoopsKey"),
        organizationName: user.organizationProfile.organizationName,
        supportEmail,
        username: destination,
        activationUrl,
        loginUrl,
        expiresInMinutes,
      });
      void this.mail
        .sendEmail({ to: destination, ...template })
        .catch((error: unknown) => {
          this.logger.error("Organization activation email delivery failed", {
            userId: user.id,
            errorName: error instanceof Error ? error.name : "UnknownError",
          });
        });
    } catch (error) {
      this.logger.error("Organization activation resend failed", {
        userId: user.id,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
    return genericResult;
  }

  private async findActivation(token: string) {
    if (token.length < MIN_ACTIVATION_TOKEN_LENGTH) return null;
    if (token.length > MAX_ACTIVATION_TOKEN_LENGTH) return null;
    return this.prisma.otpCode.findFirst({
      where: {
        codeHash: this.hashToken(token),
        purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
      },
      orderBy: { createdAt: "desc" },
      select: ACTIVATION_RECORD_SELECT,
    });
  }

  private classifyActivation(
    activation: T.OrganizationActivationRecord | null,
  ): T.OrganizationActivationCheck {
    const rejected = (
      status: Exclude<
        OrganizationActivationTokenStatus,
        OrganizationActivationTokenStatus.VALID
      >,
    ) => ({ status, otpCodeId: null, subject: null }) as const;
    const subject = activation?.user;
    if (!activation || !subject)
      return rejected(OrganizationActivationTokenStatus.INVALID);
    if (
      subject.role !== Role.ORGANIZATION ||
      !subject.organizationProfile ||
      subject.deletedAt
    )
      return rejected(OrganizationActivationTokenStatus.INVALID);
    if (subject.status === UserStatus.ACTIVE)
      return rejected(OrganizationActivationTokenStatus.USED);
    if (activation.consumedAt)
      return rejected(OrganizationActivationTokenStatus.INVALID);
    if (subject.status !== UserStatus.PENDING)
      return rejected(OrganizationActivationTokenStatus.INVALID);
    if (activation.expiresAt <= new Date())
      return rejected(OrganizationActivationTokenStatus.EXPIRED);
    return {
      status: OrganizationActivationTokenStatus.VALID,
      otpCodeId: activation.id,
      subject,
    };
  }

  private activationTokenError(status: OrganizationActivationTokenStatus) {
    if (status === OrganizationActivationTokenStatus.EXPIRED)
      return new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
        message: "This activation link has expired.",
      });
    if (status === OrganizationActivationTokenStatus.USED)
      return new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_USED,
        message: "This activation link has already been used.",
      });
    return new BadRequestException({
      code: AuthMessageCode.ACTIVATION_TOKEN_INVALID,
      message: "This activation link is invalid.",
    });
  }

  private assertPasswordIsNotObvious({
    password,
    email,
    organizationName,
  }: {
    password: string;
    email: string | null;
    organizationName: string;
  }) {
    const candidate = password.trim().toLowerCase();
    const forbidden = new Set<string>();
    if (email) {
      forbidden.add(email.toLowerCase());
      forbidden.add(email.split("@")[0].toLowerCase());
    }
    forbidden.add(organizationName.toLowerCase());
    forbidden.add(organizationName.toLowerCase().replaceAll(" ", ""));
    if (!forbidden.has(candidate)) return;
    throw new BadRequestException({
      code: AuthMessageCode.PASSWORD_TOO_OBVIOUS,
      message:
        "Choose a password that is not your email address or organization name.",
    });
  }

  private async canResend(userId: string, tx: Prisma.TransactionClient) {
    const [latest, issuedToday] = await Promise.all([
      tx.otpCode.findFirst({
        where: { userId, purpose: OtpPurpose.ORGANIZATION_ACTIVATION },
        orderBy: { createdAt: "desc" },
        select: { resendAfter: true },
      }),
      tx.otpCode.count({
        where: {
          userId,
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) },
        },
      }),
    ]);
    if (latest?.resendAfter && latest.resendAfter > new Date()) return false;
    return issuedToday < this.maxResendsPerDay();
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private buildActivationUrl(rawToken: string) {
    const configured = this.config.get<string>("ORGANIZATION_ACTIVATION_URL");
    const base = configured
      ? configured
      : `${this.requiredConfig("APPLICATION_BASE_URL").replace(/\/$/, "")}/auth/organization/activate`;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}token=${encodeURIComponent(rawToken)}`;
  }

  private activationExpiryMinutes() {
    const minutes = Number(
      this.config.get<string>("ACTIVATION_TOKEN_EXPIRY_MINUTES", "60"),
    );
    if (!Number.isFinite(minutes) || minutes <= 0)
      throw new Error("ACTIVATION_TOKEN_EXPIRY_MINUTES is not configured.");
    return minutes;
  }

  private resendCooldownSeconds() {
    const seconds = Number(
      this.config.get<string>("ACTIVATION_RESEND_COOLDOWN_SECONDS", "120"),
    );
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 120;
  }

  private maxResendsPerDay() {
    const max = Number(
      this.config.get<string>("ACTIVATION_MAX_RESENDS_PER_DAY", "5"),
    );
    return Number.isFinite(max) && max > 0 ? max : 5;
  }

  private requiredConfig(name: string) {
    const value = this.config.get<string>(name);
    if (!value) throw new Error(`${name} is not configured.`);
    return value;
  }
}
