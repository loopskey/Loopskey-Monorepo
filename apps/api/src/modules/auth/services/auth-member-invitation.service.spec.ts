import { AssociationMemberStatus, UserStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "@mail/mail.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AuthMessageCode } from "@auth/enums/message-code.enum";
import type { AuthCommonService } from "@auth/services/auth-common.service";

import { AuthAccountActivationService } from "./auth-account-activation.service";

const pendingUser = {
  id: "user-9",
  email: "member@example.org",
  status: UserStatus.PENDING,
  deletedAt: null,
  emailVerifiedAt: null,
};

const pendingMember = {
  id: "member-9",
  status: AssociationMemberStatus.PENDING_ACTIVATION,
  association: { name: "Example Association" },
};

const validRecord = {
  id: "otp-9",
  consumedAt: null,
  expiresAt: new Date(Date.now() + 60_000),
  user: pendingUser,
  associationMember: pendingMember,
};

const input = {
  token: "a-member-invitation-token-value",
  password: "Password123",
  confirmPassword: "Password123",
};

const setup = (record: unknown = validRecord) => {
  const tx = {
    otpCode: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    authSession: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    user: { update: jest.fn().mockResolvedValue(pendingUser) },
  };
  const prisma = {
    otpCode: { findFirst: jest.fn().mockResolvedValue(record) },
  };
  const config = {
    get: jest.fn((_name: string, fallback?: string) => fallback),
  };
  const authCommon = {
    normalizeEmail: (email: string) => email.trim().toLowerCase(),
  };
  return {
    tx,
    prisma,
    service: new AuthAccountActivationService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      { sendEmail: jest.fn() } as unknown as MailService,
      authCommon as unknown as AuthCommonService,
      { project: jest.fn() } as never,
    ),
  };
};

const accept = (
  service: AuthAccountActivationService,
  tx: object,
  overrides: Partial<typeof input> = {},
) =>
  service.acceptMemberInvitationToken({
    ...input,
    ...overrides,
    atomicContext: tx,
  });

describe("member invitation status", () => {
  it("reports a usable token as valid, needing a password", async () => {
    const { service } = setup();
    await expect(
      service.describeMemberInvitation(input.token),
    ).resolves.toEqual({
      status: "VALID",
      associationName: "Example Association",
      requiresPassword: true,
    });
  });

  it("does not ask for a password when the account is already claimed", async () => {
    const { service } = setup({
      ...validRecord,
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });
    await expect(
      service.describeMemberInvitation(input.token),
    ).resolves.toEqual(expect.objectContaining({ requiresPassword: false }));
  });

  it("reports no name for an invalid token", async () => {
    const { service } = setup(null);
    await expect(
      service.describeMemberInvitation(input.token),
    ).resolves.toEqual({
      status: "INVALID",
      associationName: null,
      requiresPassword: false,
    });
  });

  it("treats a membership that already moved on as used, even if the token itself looks unconsumed", async () => {
    const { service } = setup({
      ...validRecord,
      associationMember: {
        ...pendingMember,
        status: AssociationMemberStatus.ACTIVE,
      },
    });
    await expect(
      service.describeMemberInvitation(input.token),
    ).resolves.toEqual(expect.objectContaining({ status: "USED" }));
  });

  it("reports an expired token distinctly from an invalid one", async () => {
    const { service } = setup({
      ...validRecord,
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(
      service.describeMemberInvitation(input.token),
    ).resolves.toEqual(expect.objectContaining({ status: "EXPIRED" }));
  });
});

/**
 * `acceptMemberInvitationToken` only consumes the token and, if needed, sets
 * the account's password — it never touches `AssociationMember` itself.
 * `association-management` owns that model (enforced by
 * apps/api/src/architecture/prisma-ownership.spec.ts) and activates the
 * membership in the same transaction it passes in as `atomicContext`; see
 * `AssociationMemberInvitationService.acceptInvitation`'s own spec for that
 * half.
 */
describe("member invitation token acceptance", () => {
  it("consumes the token and sets the password", async () => {
    const { service, tx } = setup();
    const result = await accept(service, tx);

    expect(result).toEqual({
      associationMemberId: "member-9",
      userId: "user-9",
    });
    expect(tx.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "otp-9", consumedAt: null } }),
    );
    expect(tx.user.update.mock.calls[0][0].data.passwordHash).toMatch(
      /^\$argon2/,
    );
    expect(tx.authSession.updateMany).toHaveBeenCalled();
  });

  it("does not require or touch a password when the account is already claimed", async () => {
    const { service, tx } = setup({
      ...validRecord,
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });

    const result = await service.acceptMemberInvitationToken({
      token: input.token,
      atomicContext: tx,
    });

    expect(result).toEqual({
      associationMemberId: "member-9",
      userId: "user-9",
    });
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.authSession.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a missing password when the account still needs one", async () => {
    const { service, tx } = setup();
    await expect(
      service.acceptMemberInvitationToken({
        token: input.token,
        atomicContext: tx,
      }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.INVALID_CREDENTIALS },
    });
    expect(tx.otpCode.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a password and confirmation that do not match", async () => {
    const { service, tx } = setup();
    await expect(
      accept(service, tx, { confirmPassword: "SomethingElse123" }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.INVALID_CREDENTIALS },
    });
  });

  it("reports a used token rather than crashing when consuming loses a race", async () => {
    const { service, tx } = setup();
    tx.otpCode.updateMany.mockResolvedValue({ count: 0 });

    await expect(accept(service, tx)).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("rejects an expired token before touching the database", async () => {
    const { service, tx } = setup({
      ...validRecord,
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(accept(service, tx)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.otpCode.updateMany).not.toHaveBeenCalled();
  });
});
