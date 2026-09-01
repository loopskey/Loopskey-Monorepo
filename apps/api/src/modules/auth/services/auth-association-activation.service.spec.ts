import { AuditAction, OtpPurpose, Role, UserStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "@mail/mail.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationActivationTokenStatus } from "@auth/enums/association-activation-token-status.enum";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import type { AuthCommonService } from "@auth/services/auth-common.service";

import { AuthAccountActivationService } from "./auth-account-activation.service";

const input = {
  token: "an-association-activation-token",
  password: "Password123",
  confirmPassword: "Password123",
};

const pendingUser = {
  id: "user-9",
  email: "chair@example.org",
  role: Role.ASSOCIATION,
  status: UserStatus.PENDING,
  deletedAt: null,
  emailVerifiedAt: null,
};

const activeToken = {
  id: "otp-9",
  userId: pendingUser.id,
  consumedAt: null,
  expiresAt: new Date(Date.now() + 60_000),
  user: pendingUser,
};

const setup = (activation: unknown = activeToken) => {
  const tx = {
    otpCode: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    authSession: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    auditLog: { create: jest.fn().mockResolvedValue({ id: "audit-9" }) },
    user: { update: jest.fn().mockResolvedValue(pendingUser) },
    $executeRaw: jest.fn().mockResolvedValue(1),
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
    $transaction: jest.fn((argument: unknown) =>
      Array.isArray(argument)
        ? Promise.all(argument)
        : (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const config = {
    get: jest.fn(
      (name: string, fallback?: string) =>
        ({
          APPLICATION_BASE_URL: "https://app.example.com",
          ASSOCIATION_LOGIN_URL: "https://app.example.com/auth/professional",
          SUPPORT_EMAIL: "support@example.com",
        })[name] ?? fallback,
    ),
  };
  const sendEmail = jest.fn().mockResolvedValue({ id: "email-9" });
  const authCommon = {
    normalizeEmail: (email: string) => email.trim().toLowerCase(),
    sendAssociationPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
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
    service: new AuthAccountActivationService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      { sendEmail } as unknown as MailService,
      authCommon as unknown as AuthCommonService,
      {
        project: jest
          .fn()
          .mockResolvedValue({ associationName: "Example Association" }),
      } as never,
    ),
  };
};

describe("association activation token issuing", () => {
  it("issues against the association purpose, never the organization one", async () => {
    const { service, tx } = setup();
    const { activationUrl } = await service.issueActivationLink({
      userId: pendingUser.id,
      destination: pendingUser.email,
      role: "ASSOCIATION",
    });
    const stored = tx.otpCode.create.mock.calls[0][0].data;
    expect(stored.purpose).toBe(OtpPurpose.ASSOCIATION_ACTIVATION);
    expect(stored.codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(activationUrl).toContain("/auth/association/activate?token=");
    expect(activationUrl).not.toContain(stored.codeHash);
  });

  it("declines a resend inside the cooldown instead of issuing a second token", async () => {
    const { service, tx } = setup();
    tx.otpCode.findFirst.mockResolvedValue({
      resendAfter: new Date(Date.now() + 60_000),
    });
    await expect(
      service.resendActivationLink({
        userId: pendingUser.id,
        destination: pendingUser.email,
        role: "ASSOCIATION",
      }),
    ).resolves.toBeNull();
    expect(tx.otpCode.create).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });

  it("records the resend when the cooldown allows it", async () => {
    const { service, tx } = setup();
    await service.resendActivationLink({
      userId: pendingUser.id,
      destination: pendingUser.email,
      role: "ASSOCIATION",
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: AuditAction.ASSOCIATION_ACTIVATION_RESENT,
        }),
      }),
    );
  });
});

describe("association activation token status", () => {
  it("names the association behind a usable token", async () => {
    const { service } = setup();
    await expect(
      service.describeAssociationActivationToken(input.token),
    ).resolves.toEqual({
      status: AssociationActivationTokenStatus.VALID,
      associationName: "Example Association",
    });
  });

  it("refuses an organization token presented to the association flow", async () => {
    const { service } = setup({
      ...activeToken,
      user: { ...pendingUser, role: Role.ORGANIZATION },
    });
    await expect(
      service.describeAssociationActivationToken(input.token),
    ).resolves.toEqual({
      status: AssociationActivationTokenStatus.INVALID,
      associationName: null,
    });
  });
});

describe("association activation", () => {
  it("activates the account once and consumes its token", async () => {
    const { service, tx, authCommon } = setup();
    await expect(service.activateAssociationAccount(input)).resolves.toEqual(
      expect.objectContaining({
        success: true,
        code: AuthMessageCode.ASSOCIATION_ACCOUNT_ACTIVATED,
      }),
    );
    expect(tx.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "otp-9", consumedAt: null } }),
    );
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: UserStatus.ACTIVE,
          forcePasswordChange: false,
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
          action: AuditAction.ASSOCIATION_ACCOUNT_ACTIVATED,
        }),
      }),
    );
    expect(authCommon.sendAssociationPasswordChangedEmail).toHaveBeenCalled();
    expect(
      authCommon.sendOrganizationPasswordChangedEmail,
    ).not.toHaveBeenCalled();
  });

  it("activates once when the same link is used twice", async () => {
    // The second click loses the conditional consume: `updateMany` matches no
    // row because the first click already set `consumedAt`.
    const { service, tx } = setup();
    await service.activateAssociationAccount(input);
    tx.user.update.mockClear();
    tx.otpCode.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.activateAssociationAccount(input),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("reports an already active account as used rather than activating again", async () => {
    const { service, tx } = setup({
      ...activeToken,
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });
    await expect(
      service.activateAssociationAccount(input),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("never stores the submitted password in readable form", async () => {
    const { service, tx } = setup();
    await service.activateAssociationAccount(input);
    expect(JSON.stringify(tx.user.update.mock.calls)).not.toContain(
      input.password,
    );
  });
});
