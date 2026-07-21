import { BadRequestException, Logger } from "@nestjs/common";
import { AuditAction, OtpPurpose, Role, UserStatus } from "@prisma/client";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "@mail/mail.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { OrganizationActivationTokenStatus } from "@auth/enums/organization-activation-token-status.enum";
import type { AuthCommonService } from "@auth/services/auth-common.service";

import { AuthOrganizationActivationService } from "./auth-organization-activation.service";

const input = {
  token: "a-secure-activation-token-value",
  password: "Password123",
  confirmPassword: "Password123",
};

const pendingUser = {
  id: "user-1",
  email: "admin@example.com",
  role: Role.ORGANIZATION,
  status: UserStatus.PENDING,
  deletedAt: null,
  emailVerifiedAt: null,
  organizationProfile: { organizationName: "Example Association" },
};

const activeToken = {
  id: "otp-1",
  userId: pendingUser.id,
  consumedAt: null,
  expiresAt: new Date(Date.now() + 60_000),
  user: pendingUser,
};

const setup = (activation: unknown = activeToken) => {
  const tx = {
    otpCode: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    authSession: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    auditLog: { create: jest.fn().mockResolvedValue({ id: "audit-1" }) },
    user: { update: jest.fn().mockResolvedValue(pendingUser) },
  };
  const prisma = {
    otpCode: {
      findFirst: jest.fn().mockResolvedValue(activation),
      updateMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    user: { findFirst: jest.fn().mockResolvedValue(pendingUser) },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn((argument) =>
      Array.isArray(argument) ? Promise.all(argument) : argument(tx),
    ),
  };
  const config = {
    get: jest.fn(
      (name: string, fallback?: string) =>
        ({
          APPLICATION_BASE_URL: "https://app.example.com",
          ORGANIZATION_LOGIN_URL: "https://app.example.com/auth/organization",
          SUPPORT_EMAIL: "support@example.com",
        })[name] ?? fallback,
    ),
  };
  const sendEmail = jest.fn().mockResolvedValue({ id: "email-1" });
  const authCommon = {
    normalizeEmail: (email: string) => email.trim().toLowerCase(),
    sendOrganizationPasswordChangedEmail: jest
      .fn()
      .mockResolvedValue(undefined),
  };
  return {
    tx,
    prisma,
    config,
    sendEmail,
    authCommon,
    service: new AuthOrganizationActivationService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      { sendEmail } as unknown as MailService,
      authCommon as unknown as AuthCommonService,
    ),
  };
};

describe("AuthOrganizationActivationService token issuing", () => {
  it("stores only a hash and invalidates any previous invitation", async () => {
    const { service, prisma } = setup();
    const { activationUrl } = await service.issueActivationLink({
      userId: pendingUser.id,
      destination: pendingUser.email,
    });
    const stored = prisma.otpCode.create.mock.calls[0][0].data;
    expect(stored.codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(activationUrl).toContain("activate?token=");
    expect(activationUrl).not.toContain(stored.codeHash);
    expect(stored.resendAfter.getTime()).toBeGreaterThan(Date.now());
    expect(prisma.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: pendingUser.id,
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
          consumedAt: null,
        }),
      }),
    );
  });
});

describe("AuthOrganizationActivationService token status", () => {
  it("reports a usable token with its organization", async () => {
    const { service } = setup();
    await expect(service.describeActivationToken(input.token)).resolves.toEqual(
      {
        status: OrganizationActivationTokenStatus.VALID,
        organizationName: "Example Association",
      },
    );
  });

  it("reports an unknown token as invalid without naming an organization", async () => {
    const { service } = setup(null);
    await expect(service.describeActivationToken(input.token)).resolves.toEqual(
      {
        status: OrganizationActivationTokenStatus.INVALID,
        organizationName: null,
      },
    );
  });

  // A token consumed while the owner is still pending was replaced by a newer
  // invitation. Reporting it as USED would tell the user their account is
  // already active and leave them with no way to request a working link.
  it("reports a superseded token as invalid, not used", async () => {
    const { service } = setup({ ...activeToken, consumedAt: new Date() });
    await expect(service.describeActivationToken(input.token)).resolves.toEqual(
      {
        status: OrganizationActivationTokenStatus.INVALID,
        organizationName: null,
      },
    );
  });

  it("rejects a token that is too short to have been issued", async () => {
    const { service, prisma } = setup();
    await expect(service.describeActivationToken("short")).resolves.toEqual({
      status: OrganizationActivationTokenStatus.INVALID,
      organizationName: null,
    });
    await expect(
      service.describeActivationToken("x".repeat(5000)),
    ).resolves.toEqual({
      status: OrganizationActivationTokenStatus.INVALID,
      organizationName: null,
    });
    expect(prisma.otpCode.findFirst).not.toHaveBeenCalled();
  });

  it("reports an already activated account as used", async () => {
    const { service } = setup({
      ...activeToken,
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });
    await expect(service.describeActivationToken(input.token)).resolves.toEqual(
      {
        status: OrganizationActivationTokenStatus.USED,
        organizationName: null,
      },
    );
  });

  it("reports an outdated token as expired", async () => {
    const { service } = setup({
      ...activeToken,
      expiresAt: new Date(Date.now() - 1),
    });
    await expect(service.describeActivationToken(input.token)).resolves.toEqual(
      {
        status: OrganizationActivationTokenStatus.EXPIRED,
        organizationName: null,
      },
    );
  });
});

describe("AuthOrganizationActivationService activation", () => {
  it("activates the account, consumes the token, and revokes sessions", async () => {
    const { service, tx, authCommon } = setup();
    await expect(service.activateOrganizationAccount(input)).resolves.toEqual(
      expect.objectContaining({
        success: true,
        code: AuthMessageCode.ORGANIZATION_ACCOUNT_ACTIVATED,
      }),
    );
    expect(tx.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "otp-1", consumedAt: null } }),
    );
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: UserStatus.ACTIVE,
          forcePasswordChange: false,
          passwordChangedAt: expect.any(Date),
        }),
      }),
    );
    expect(tx.user.update.mock.calls[0][0].data.passwordHash).toMatch(
      /^\$argon2/,
    );
    expect(tx.authSession.updateMany).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: AuditAction.ORGANIZATION_ACCOUNT_ACTIVATED,
        }),
      }),
    );
    expect(authCommon.sendOrganizationPasswordChangedEmail).toHaveBeenCalled();
  });

  it("never stores the submitted password in readable form", async () => {
    const { service, tx } = setup();
    await service.activateOrganizationAccount(input);
    expect(JSON.stringify(tx.user.update.mock.calls)).not.toContain(
      input.password,
    );
  });

  it("rejects a confirmation mismatch before touching the token", async () => {
    const { service, prisma } = setup();
    await expect(
      service.activateOrganizationAccount({
        ...input,
        confirmPassword: "Different123",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.otpCode.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    const { service } = setup({
      ...activeToken,
      expiresAt: new Date(Date.now() - 1),
    });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_EXPIRED },
    });
  });

  it("rejects a token whose account is already active with a distinct code", async () => {
    const { service } = setup({
      ...activeToken,
      consumedAt: new Date(),
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
  });

  it("rejects a superseded token as invalid", async () => {
    const { service } = setup({ ...activeToken, consumedAt: new Date() });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_INVALID },
    });
  });

  it("rejects an unknown token", async () => {
    const { service } = setup(null);
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_INVALID },
    });
  });

  it("rejects a password that is the organization name", async () => {
    const { service, tx } = setup();
    await expect(
      service.activateOrganizationAccount({
        ...input,
        password: "example association",
        confirmPassword: "example association",
      }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.PASSWORD_TOO_OBVIOUS },
    });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("rejects a token lost to a concurrent single-use claim", async () => {
    const { service, tx } = setup();
    tx.otpCode.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("AuthOrganizationActivationService resend", () => {
  it("issues a fresh invitation and records the resend", async () => {
    const { service, prisma, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue(null);
    await expect(
      service.resendActivation({ email: "Admin@Example.com " }),
    ).resolves.toEqual(
      expect.objectContaining({ code: AuthMessageCode.ACTIVATION_EMAIL_SENT }),
    );
    expect(prisma.otpCode.updateMany).toHaveBeenCalled();
    expect(sendEmail.mock.calls[0][0].text).toContain("activate?token=");
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: AuditAction.ORGANIZATION_ACTIVATION_RESENT,
        }),
      }),
    );
  });

  // The resend event has to outlive a provider outage, so it is written before
  // the message is handed to the mail service.
  // A misconfigured deployment must not destroy the invitation the user still
  // holds on its way to failing.
  it("does not invalidate the existing invitation when config is missing", async () => {
    const log = jest.spyOn(Logger.prototype, "error").mockImplementation();
    const { service, prisma, config, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue(null);
    config.get.mockImplementation((name: string, fallback?: string) =>
      name === "SUPPORT_EMAIL" ? undefined : fallback,
    );
    await service.resendActivation({ email: pendingUser.email });
    expect(prisma.otpCode.updateMany).not.toHaveBeenCalled();
    expect(prisma.otpCode.create).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("records the resend even when delivery later fails", async () => {
    const log = jest.spyOn(Logger.prototype, "error").mockImplementation();
    const { service, prisma, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue(null);
    sendEmail.mockRejectedValue(new Error("provider unavailable"));
    await service.resendActivation({ email: pendingUser.email });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: AuditAction.ORGANIZATION_ACTIVATION_RESENT,
        }),
      }),
    );
    log.mockRestore();
  });

  it("answers identically for an unknown account and sends nothing", async () => {
    const { service, prisma, sendEmail } = setup();
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      service.resendActivation({ email: "nobody@example.com" }),
    ).resolves.toEqual(
      expect.objectContaining({ code: AuthMessageCode.ACTIVATION_EMAIL_SENT }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("silently throttles a resend inside the cooldown window", async () => {
    const { service, prisma, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue({
      resendAfter: new Date(Date.now() + 60_000),
    });
    await expect(
      service.resendActivation({ email: pendingUser.email }),
    ).resolves.toEqual(
      expect.objectContaining({ code: AuthMessageCode.ACTIVATION_EMAIL_SENT }),
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("stops once the daily invitation cap is reached", async () => {
    const { service, prisma, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue(null);
    prisma.otpCode.count.mockResolvedValue(5);
    await service.resendActivation({ email: pendingUser.email });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("keeps delivery failures out of the response and the log", async () => {
    const log = jest.spyOn(Logger.prototype, "error").mockImplementation();
    const { service, prisma, sendEmail } = setup();
    prisma.otpCode.findFirst.mockResolvedValue(null);
    sendEmail.mockRejectedValue(new Error("provider rejected secret-token"));
    await expect(
      service.resendActivation({ email: pendingUser.email }),
    ).resolves.toEqual(
      expect.objectContaining({ code: AuthMessageCode.ACTIVATION_EMAIL_SENT }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
    log.mockRestore();
  });
});
