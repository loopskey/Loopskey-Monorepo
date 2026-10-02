import { AssociationMemberStatus, UserStatus } from "@prisma/client";
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
    otpCode: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: "otp-new" }),
    },
    authSession: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    user: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  const prisma = {
    otpCode: { findFirst: jest.fn().mockResolvedValue(record) },
  };
  const config = {
    get: jest.fn((name: string, fallback?: string) =>
      name === "APPLICATION_BASE_URL" ? "https://app.example.com" : fallback,
    ),
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

const prepare = (
  service: AuthAccountActivationService,
  overrides: Partial<typeof input> = {},
) => service.prepareMemberInvitationAcceptance({ ...input, ...overrides });

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

  it("classifies a malformed token as invalid without querying", async () => {
    const { service, prisma } = setup();
    await expect(service.describeMemberInvitation("short")).resolves.toEqual(
      expect.objectContaining({ status: "INVALID" }),
    );
    expect(prisma.otpCode.findFirst).not.toHaveBeenCalled();
  });
});

describe("member invitation acceptance", () => {
  it("names the membership and person the token belongs to without writing anything", async () => {
    const { service, tx } = setup();

    const acceptance = await prepare(service);

    expect(acceptance).toEqual(
      expect.objectContaining({
        associationMemberId: "member-9",
        userId: "user-9",
      }),
    );
    expect(tx.otpCode.updateMany).not.toHaveBeenCalled();
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });

  it("consumes only an unused, unexpired token and sets the password it hashed beforehand", async () => {
    const { service, tx } = setup();

    await (await prepare(service)).consume(tx);

    expect(tx.otpCode.updateMany).toHaveBeenCalledWith({
      where: {
        id: "otp-9",
        consumedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { consumedAt: expect.any(Date) },
    });
    const [claim] = tx.user.updateMany.mock.calls[0] as [
      { where: unknown; data: { passwordHash: string } },
    ];
    expect(claim.where).toEqual({
      id: "user-9",
      deletedAt: null,
      status: { not: UserStatus.ACTIVE },
    });
    expect(claim.data.passwordHash).toMatch(/^\$argon2/);
    expect(tx.authSession.updateMany).toHaveBeenCalled();
  });

  it("does not require or touch a password when the account is already claimed", async () => {
    const { service, tx } = setup({
      ...validRecord,
      user: { ...pendingUser, status: UserStatus.ACTIVE },
    });

    const acceptance = await service.prepareMemberInvitationAcceptance({
      token: input.token,
    });
    await acceptance.consume(tx);

    expect(tx.otpCode.updateMany).toHaveBeenCalledTimes(1);
    expect(tx.user.updateMany).not.toHaveBeenCalled();
    expect(tx.authSession.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a missing password when the account still needs one", async () => {
    const { service } = setup();
    await expect(
      service.prepareMemberInvitationAcceptance({ token: input.token }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.INVALID_CREDENTIALS },
    });
  });

  it("rejects a password and confirmation that do not match", async () => {
    const { service } = setup();
    await expect(
      prepare(service, { confirmPassword: "SomethingElse123" }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.INVALID_CREDENTIALS },
    });
  });

  it("rejects a password that is just the email address", async () => {
    const { service } = setup();
    await expect(
      prepare(service, {
        password: "member@example.org",
        confirmPassword: "member@example.org",
      }),
    ).rejects.toMatchObject({
      response: { code: AuthMessageCode.PASSWORD_TOO_OBVIOUS },
    });
  });

  it("reports a used token rather than crashing when consuming loses a race", async () => {
    const { service, tx } = setup();
    tx.otpCode.updateMany.mockResolvedValue({ count: 0 });

    await expect((await prepare(service)).consume(tx)).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACTIVATION_TOKEN_USED },
    });
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a password set by a concurrent acceptance of another membership", async () => {
    const { service, tx } = setup();
    tx.user.updateMany.mockResolvedValue({ count: 0 });

    await expect((await prepare(service)).consume(tx)).rejects.toMatchObject({
      response: { code: AuthMessageCode.ACCOUNT_ALREADY_CLAIMED },
    });
    expect(tx.authSession.updateMany).not.toHaveBeenCalled();
  });

  it.each([
    [
      "an expired",
      { ...validRecord, expiresAt: new Date(Date.now() - 1000) },
      AuthMessageCode.ACTIVATION_TOKEN_EXPIRED,
    ],
    [
      "a consumed",
      { ...validRecord, consumedAt: new Date() },
      AuthMessageCode.ACTIVATION_TOKEN_USED,
    ],
    ["an unknown", null, AuthMessageCode.ACTIVATION_TOKEN_INVALID],
    [
      "a membership-less",
      { ...validRecord, associationMember: null },
      AuthMessageCode.ACTIVATION_TOKEN_INVALID,
    ],
    [
      "a deleted account's",
      { ...validRecord, user: { ...pendingUser, deletedAt: new Date() } },
      AuthMessageCode.ACTIVATION_TOKEN_INVALID,
    ],
  ])(
    "rejects %s token before anything is written",
    async (_label, record, code) => {
      const { service, tx } = setup(record);
      await expect(prepare(service)).rejects.toMatchObject({
        response: { code },
      });
      expect(tx.otpCode.updateMany).not.toHaveBeenCalled();
    },
  );
});

describe("member invitation issuance", () => {
  const command = (tx: object) => ({
    userId: "user-9",
    destination: "member@example.org",
    associationMemberId: "member-9",
    atomicContext: tx,
  });

  it("issues a token bound to the membership and retires only that membership's previous one", async () => {
    const { service, tx } = setup();

    const issue = await service.issueMemberInvitation(command(tx));

    expect(issue).toEqual({
      issued: true,
      invitation: expect.objectContaining({
        tokenId: expect.any(String),
        activationUrl: expect.stringContaining("/auth/association/join?token="),
      }),
    });
    expect(tx.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ associationMemberId: "member-9" }),
      }),
    );
    expect(tx.otpCode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ associationMemberId: "member-9" }),
    });
  });

  it("scopes the cooldown and daily-limit reads to the membership", async () => {
    const { service, tx } = setup();

    await service.issueMemberInvitation(command(tx));

    expect(tx.otpCode.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ associationMemberId: "member-9" }),
      }),
    );
    expect(tx.otpCode.count).toHaveBeenCalledWith({
      where: expect.objectContaining({ associationMemberId: "member-9" }),
    });
  });

  it("refuses during the cooldown and says so", async () => {
    const { service, tx } = setup();
    tx.otpCode.findFirst.mockResolvedValue({
      resendAfter: new Date(Date.now() + 60_000),
    });

    await expect(service.issueMemberInvitation(command(tx))).resolves.toEqual({
      issued: false,
      refusal: "COOLDOWN",
    });
    expect(tx.otpCode.create).not.toHaveBeenCalled();
  });

  it("refuses at the daily limit, distinctly from the cooldown", async () => {
    const { service, tx } = setup();
    tx.otpCode.count.mockResolvedValue(5);

    await expect(service.issueMemberInvitation(command(tx))).resolves.toEqual({
      issued: false,
      refusal: "DAILY_LIMIT",
    });
    expect(tx.otpCode.create).not.toHaveBeenCalled();
  });
});
