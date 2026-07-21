import { BadRequestException } from "@nestjs/common";
import { OtpPurpose, Role, UserStatus } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";
import type { AuthCommonService } from "./auth-common.service";

import { AuthPasswordService } from "./auth-password.service";

const input = {
  token: "a-secure-activation-token-value",
  password: "Password123",
  confirmPassword: "Password123",
};

const user = {
  id: "user-1",
  email: "admin@example.com",
  role: Role.ORGANIZATION,
  status: UserStatus.PENDING,
  organizationProfile: { organizationName: "Example Association" },
};

const setup = (activation: unknown) => {
  const tx = {
    otpCode: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    user: { update: jest.fn().mockResolvedValue(user) },
  };
  const prisma = {
    otpCode: { findFirst: jest.fn().mockResolvedValue(activation) },
    $transaction: jest.fn((callback) => callback(tx)),
  };
  const authCommon = {
    sendOrganizationPasswordChangedEmail: jest
      .fn()
      .mockResolvedValue(undefined),
  };
  return {
    prisma,
    tx,
    authCommon,
    service: new AuthPasswordService(
      prisma as unknown as PrismaService,
      authCommon as unknown as AuthCommonService,
    ),
  };
};

describe("AuthPasswordService Organization activation", () => {
  it("consumes a valid token once and activates the pending user", async () => {
    const { service, prisma, tx, authCommon } = setup({
      id: "otp-1",
      userId: user.id,
      user,
      purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.activateOrganizationAccount(input)).resolves.toEqual(
      expect.objectContaining({ success: true }),
    );
    expect(prisma.otpCode.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          codeHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );
    expect(tx.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "otp-1", consumedAt: null } }),
    );
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: UserStatus.ACTIVE }),
      }),
    );
    expect(authCommon.sendOrganizationPasswordChangedEmail).toHaveBeenCalled();
  });

  it("rejects expired activation tokens", async () => {
    const { service } = setup({
      id: "otp-1",
      userId: user.id,
      user,
      expiresAt: new Date(Date.now() - 1),
    });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a token lost to a concurrent single-use claim", async () => {
    const { service, tx } = setup({
      id: "otp-1",
      userId: user.id,
      user,
      expiresAt: new Date(Date.now() + 60_000),
    });
    tx.otpCode.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.activateOrganizationAccount(input),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
