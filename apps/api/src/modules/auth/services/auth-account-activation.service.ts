import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ResendOrganizationActivationInput } from "@auth/dtos/resend-organization-activation.input";
import { OrganizationActivationTokenStatus } from "@auth/enums/organization-activation-token-status.enum";
import { AssociationActivationTokenStatus } from "@auth/enums/association-activation-token-status.enum";
import { ActivateOrganizationAccountInput } from "@auth/dtos/activate-organization-account.input";
import { ActivateAssociationAccountInput } from "@auth/dtos/activate-association-account.input";
import { buildAssociationActivationEmail } from "@mail/association-email.template";
import { buildOrganizationApprovalEmail } from "@mail/organization-email.template";
import { AuditAction, OtpPurpose, Role } from "@prisma/client";
import { SessionStatus, UserStatus } from "@prisma/client";
import { ACTIVATION_RECORD_SELECT } from "@auth/types/auth-service.types";
import { createHash, randomBytes } from "crypto";
import { ActivationTokenStatus } from "@auth/enums/activation-token-status.enum";
import { RoleProfileRegistry } from "@prisma/role-profile-registry.service";
import { AuthCommonService } from "@auth/services/auth-common.service";
import { AUTH_USER_SELECT } from "@auth/types/auth-user-select.constant";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { MailService } from "@mail/mail.service";
import { Prisma } from "@prisma/client";

import * as T from "@auth/types/auth-service.types";
import * as argon2 from "argon2";

const ACTIVATION_TOKEN_BYTES = 32;
const MIN_ACTIVATION_TOKEN_LENGTH = 20;
const MAX_ACTIVATION_TOKEN_LENGTH = 128;

type ActivationProfile = {
  readonly role: Role;
  readonly purpose: OtpPurpose;
  readonly lockKeyPrefix: string;
  readonly urlConfigKey: string;
  readonly urlFallbackPath: string;
  readonly loginUrlConfigKey: string;
  readonly nameKey: string;
  readonly fallbackName: string;
  readonly activatedCode: AuthMessageCode;
  readonly activatedMessage: string;
  readonly auditActivated: AuditAction;
  readonly auditResent: AuditAction;
};

const ORGANIZATION_PROFILE: ActivationProfile = {
  role: Role.ORGANIZATION,
  purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
  lockKeyPrefix: "organization-activation",
  urlConfigKey: "ORGANIZATION_ACTIVATION_URL",
  urlFallbackPath: "/auth/organization/activate",
  loginUrlConfigKey: "ORGANIZATION_LOGIN_URL",
  nameKey: "organizationName",
  fallbackName: "your Organization",
  activatedCode: AuthMessageCode.ORGANIZATION_ACCOUNT_ACTIVATED,
  activatedMessage: "Organization account activated successfully.",
  auditActivated: AuditAction.ORGANIZATION_ACCOUNT_ACTIVATED,
  auditResent: AuditAction.ORGANIZATION_ACTIVATION_RESENT,
};

const ASSOCIATION_PROFILE: ActivationProfile = {
  role: Role.ASSOCIATION,
  purpose: OtpPurpose.ASSOCIATION_ACTIVATION,
  lockKeyPrefix: "association-activation",
  urlConfigKey: "ASSOCIATION_ACTIVATION_URL",
  urlFallbackPath: "/auth/association/activate",
  loginUrlConfigKey: "ASSOCIATION_LOGIN_URL",
  nameKey: "associationName",
  fallbackName: "your Association",
  activatedCode: AuthMessageCode.ASSOCIATION_ACCOUNT_ACTIVATED,
  activatedMessage: "Association account activated successfully.",
  auditActivated: AuditAction.ASSOCIATION_ACCOUNT_ACTIVATED,
  auditResent: AuditAction.ASSOCIATION_ACTIVATION_RESENT,
};

const PROFILE_BY_ROLE: Record<string, ActivationProfile> = {
  ORGANIZATION: ORGANIZATION_PROFILE,
  ASSOCIATION: ASSOCIATION_PROFILE,
};

@Injectable()
export class AuthAccountActivationService {
  private readonly logger = new Logger(AuthAccountActivationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly authCommon: AuthCommonService,
    private readonly roleProfiles: RoleProfileRegistry,
  ) {}

  async issueActivationLink({
    userId,
    destination,
    role,
  }: T.IssueActivationLinkArgs) {
    const profile = this.profileFor(role);
    return this.prisma.$transaction((tx) =>
      this.createActivationLink(tx, profile, { userId, destination }),
    );
  }

  async resendActivationLink({
    userId,
    destination,
    role,
  }: T.IssueActivationLinkArgs) {
    const profile = this.profileFor(role);
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${profile.lockKeyPrefix}:${userId}`}))`;
      if (!(await this.canResend(userId, profile, tx))) return null;
      const link = await this.createActivationLink(tx, profile, {
        userId,
        destination,
      });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: profile.auditResent,
          entityType: "User",
          entityId: userId,
        },
      });
      return link;
    });
  }

  private async createActivationLink(
    tx: Prisma.TransactionClient,
    profile: ActivationProfile,
    { userId, destination }: { userId: string; destination: string },
  ) {
    const rawToken = randomBytes(ACTIVATION_TOKEN_BYTES).toString("base64url");
    const expiresInMinutes = this.activationExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);
    await tx.otpCode.updateMany({
      where: {
        userId,
        purpose: profile.purpose,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });
    await tx.otpCode.create({
      data: {
        userId,
        destination,
        codeHash: this.hashToken(rawToken),
        purpose: profile.purpose,
        expiresAt,
        maxAttempts: 1,
        resendAfter: new Date(Date.now() + this.resendCooldownSeconds() * 1000),
      },
    });
    return {
      activationUrl: this.buildActivationUrl(profile, rawToken),
      expiresInMinutes,
    };
  }

  async describeActivationToken(token: string) {
    const { status, name } = await this.describe(ORGANIZATION_PROFILE, token);
    return {
      status: ORGANIZATION_STATUS[status],
      organizationName: name,
    };
  }

  async describeAssociationActivationToken(token: string) {
    const { status, name } = await this.describe(ASSOCIATION_PROFILE, token);
    return {
      status: ASSOCIATION_STATUS[status],
      associationName: name,
    };
  }

  private async describe(profile: ActivationProfile, token: string) {
    const check = this.classifyActivation(
      profile,
      await this.findActivation(profile, token),
    );
    return {
      status: check.status,
      name: check.subject
        ? await this.accountName(profile, check.subject.id)
        : null,
    };
  }

  activateOrganizationAccount(input: ActivateOrganizationAccountInput) {
    return this.activate(ORGANIZATION_PROFILE, input);
  }

  activateAssociationAccount(input: ActivateAssociationAccountInput) {
    return this.activate(ASSOCIATION_PROFILE, input);
  }

  private async activate(
    profile: ActivationProfile,
    input: { token: string; password: string; confirmPassword: string },
  ) {
    if (input.password !== input.confirmPassword)
      throw new BadRequestException({
        code: AuthMessageCode.INVALID_CREDENTIALS,
        message: "Password and confirm password do not match.",
      });

    const check = this.classifyActivation(
      profile,
      await this.findActivation(profile, input.token),
    );
    if (check.status !== ActivationTokenStatus.VALID)
      throw this.activationTokenError(check.status);

    const pendingUser = check.subject;
    const accountName =
      (await this.accountName(profile, pendingUser.id)) ?? profile.fallbackName;
    this.assertPasswordIsNotObvious({
      password: input.password,
      email: pendingUser.email,
      accountName,
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
          purpose: profile.purpose,
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
          action: profile.auditActivated,
          entityType: "User",
          entityId: pendingUser.id,
          metadata: { [profile.nameKey]: accountName },
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
        await this.sendPasswordChangedEmail(
          profile,
          pendingUser.email,
          accountName,
        );
      } catch (error) {
        this.logger.error("Account password confirmation email failed", {
          userId: pendingUser.id,
          role: profile.role,
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
      }
    }

    return {
      success: true,
      code: profile.activatedCode,
      message: profile.activatedMessage,
      user,
    };
  }

  async resendActivation(input: ResendOrganizationActivationInput) {
    const profile = ORGANIZATION_PROFILE;
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
        role: profile.role,
        status: UserStatus.PENDING,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user?.email) return genericResult;
    const accountName = await this.accountName(profile, user.id);
    if (!accountName) return genericResult;
    const destination = user.email;
    try {
      const supportEmail = this.requiredConfig("SUPPORT_EMAIL");
      const loginUrl = this.requiredConfig(profile.loginUrlConfigKey);
      const invitation = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${profile.lockKeyPrefix}:${user.id}`}))`;
        if (!(await this.canResend(user.id, profile, tx))) return null;
        const activationLink = await this.createActivationLink(tx, profile, {
          userId: user.id,
          destination,
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: profile.auditResent,
            entityType: "User",
            entityId: user.id,
          },
        });
        return activationLink;
      });
      if (!invitation) return genericResult;
      const { activationUrl, expiresInMinutes } = invitation;
      const template = this.buildActivationEmail(profile, {
        accountName,
        supportEmail,
        username: destination,
        activationUrl,
        loginUrl,
        expiresInMinutes,
      });
      void this.mail
        .sendEmail({ to: destination, ...template })
        .catch((error: unknown) => {
          this.logger.error("Account activation email delivery failed", {
            userId: user.id,
            role: profile.role,
            errorName: error instanceof Error ? error.name : "UnknownError",
          });
        });
    } catch (error) {
      this.logger.error("Account activation resend failed", {
        userId: user.id,
        role: profile.role,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
    return genericResult;
  }

  private profileFor(role: string = Role.ORGANIZATION) {
    const profile = PROFILE_BY_ROLE[role];
    if (!profile) throw new Error(`No activation profile for role ${role}.`);
    return profile;
  }

  private buildActivationEmail(
    profile: ActivationProfile,
    input: {
      accountName: string;
      supportEmail: string;
      username: string;
      activationUrl: string;
      loginUrl: string;
      expiresInMinutes: number;
    },
  ) {
    const appName = this.config.get<string>("APP_NAME", "LoopsKey");
    if (profile.role === Role.ASSOCIATION)
      return buildAssociationActivationEmail({
        appName,
        associationName: input.accountName,
        supportEmail: input.supportEmail,
        username: input.username,
        activationUrl: input.activationUrl,
        loginUrl: input.loginUrl,
        expiresInMinutes: input.expiresInMinutes,
      });
    return buildOrganizationApprovalEmail({
      appName,
      organizationName: input.accountName,
      supportEmail: input.supportEmail,
      username: input.username,
      activationUrl: input.activationUrl,
      loginUrl: input.loginUrl,
      expiresInMinutes: input.expiresInMinutes,
    });
  }

  private sendPasswordChangedEmail(
    profile: ActivationProfile,
    email: string,
    accountName: string,
  ) {
    if (profile.role === Role.ASSOCIATION)
      return this.authCommon.sendAssociationPasswordChangedEmail(
        email,
        accountName,
      );
    return this.authCommon.sendOrganizationPasswordChangedEmail(
      email,
      accountName,
    );
  }

  private async findActivation(profile: ActivationProfile, token: string) {
    if (token.length < MIN_ACTIVATION_TOKEN_LENGTH) return null;
    if (token.length > MAX_ACTIVATION_TOKEN_LENGTH) return null;
    return this.prisma.otpCode.findFirst({
      where: {
        codeHash: this.hashToken(token),
        purpose: profile.purpose,
      },
      orderBy: { createdAt: "desc" },
      select: ACTIVATION_RECORD_SELECT,
    });
  }

  private classifyActivation(
    profile: ActivationProfile,
    activation: T.AccountActivationRecord | null,
  ): T.AccountActivationCheck {
    const rejected = (
      status: Exclude<ActivationTokenStatus, ActivationTokenStatus.VALID>,
    ) => ({ status, otpCodeId: null, subject: null }) as const;
    const subject = activation?.user;
    if (!activation || !subject) return rejected(ActivationTokenStatus.INVALID);
    if (subject.role !== profile.role || subject.deletedAt)
      return rejected(ActivationTokenStatus.INVALID);
    if (subject.status === UserStatus.ACTIVE)
      return rejected(ActivationTokenStatus.USED);
    if (activation.consumedAt) return rejected(ActivationTokenStatus.INVALID);
    if (subject.status !== UserStatus.PENDING)
      return rejected(ActivationTokenStatus.INVALID);
    if (activation.expiresAt <= new Date())
      return rejected(ActivationTokenStatus.EXPIRED);
    return {
      status: ActivationTokenStatus.VALID,
      otpCodeId: activation.id,
      subject,
    };
  }

  private activationTokenError(status: ActivationTokenStatus) {
    if (status === ActivationTokenStatus.EXPIRED)
      return new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
        message: "This activation link has expired.",
      });
    if (status === ActivationTokenStatus.USED)
      return new BadRequestException({
        code: AuthMessageCode.ACTIVATION_TOKEN_USED,
        message: "This activation link has already been used.",
      });
    return new BadRequestException({
      code: AuthMessageCode.ACTIVATION_TOKEN_INVALID,
      message: "This activation link is invalid.",
    });
  }

  private async accountName(profile: ActivationProfile, userId: string) {
    const roleProfile = await this.roleProfiles.project(profile.role, userId);
    const value = roleProfile?.[profile.nameKey];
    return typeof value === "string" && value.trim() ? value : null;
  }

  private assertPasswordIsNotObvious({
    password,
    email,
    accountName,
  }: {
    password: string;
    email: string | null;
    accountName: string;
  }) {
    const candidate = password.trim().toLowerCase();
    const forbidden = new Set<string>();
    if (email) {
      forbidden.add(email.toLowerCase());
      forbidden.add(email.split("@")[0].toLowerCase());
    }
    forbidden.add(accountName.toLowerCase());
    forbidden.add(accountName.toLowerCase().replaceAll(" ", ""));
    if (!forbidden.has(candidate)) return;
    throw new BadRequestException({
      code: AuthMessageCode.PASSWORD_TOO_OBVIOUS,
      message:
        "Choose a password that is not your email address or organization name.",
    });
  }

  private async canResend(
    userId: string,
    profile: ActivationProfile,
    tx: Prisma.TransactionClient,
  ) {
    const [latest, issuedToday] = await Promise.all([
      tx.otpCode.findFirst({
        where: { userId, purpose: profile.purpose },
        orderBy: { createdAt: "desc" },
        select: { resendAfter: true },
      }),
      tx.otpCode.count({
        where: {
          userId,
          purpose: profile.purpose,
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

  private buildActivationUrl(profile: ActivationProfile, rawToken: string) {
    const configured = this.config.get<string>(profile.urlConfigKey);
    const base = configured
      ? configured
      : `${this.requiredConfig("APPLICATION_BASE_URL").replace(/\/$/, "")}${profile.urlFallbackPath}`;
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

const ORGANIZATION_STATUS: Record<
  ActivationTokenStatus,
  OrganizationActivationTokenStatus
> = {
  [ActivationTokenStatus.VALID]: OrganizationActivationTokenStatus.VALID,
  [ActivationTokenStatus.USED]: OrganizationActivationTokenStatus.USED,
  [ActivationTokenStatus.EXPIRED]: OrganizationActivationTokenStatus.EXPIRED,
  [ActivationTokenStatus.INVALID]: OrganizationActivationTokenStatus.INVALID,
};

const ASSOCIATION_STATUS: Record<
  ActivationTokenStatus,
  AssociationActivationTokenStatus
> = {
  [ActivationTokenStatus.VALID]: AssociationActivationTokenStatus.VALID,
  [ActivationTokenStatus.USED]: AssociationActivationTokenStatus.USED,
  [ActivationTokenStatus.EXPIRED]: AssociationActivationTokenStatus.EXPIRED,
  [ActivationTokenStatus.INVALID]: AssociationActivationTokenStatus.INVALID,
};
