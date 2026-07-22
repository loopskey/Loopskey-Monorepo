import { BadRequestException } from "@nestjs/common";
import type { PrismaService } from "@prisma/prisma.service";
import type { AuthCommonService } from "@auth/services/auth-common.service";
import { Role, UserStatus } from "@prisma/client";

import { AuthPasswordService } from "./auth-password.service";
import * as argon2 from "argon2";

describe("AuthPasswordService mandatory password change", () => {
  it("does not clear the requirement when the new password is unchanged", async () => {
    const currentPassword = "Temporary123";
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: "user-1",
          role: Role.ORGANIZATION,
          email: "admin@example.com",
          status: UserStatus.ACTIVE,
          fullName: "Organization Admin",
          passwordHash: await argon2.hash(currentPassword),
          emailVerifiedAt: new Date(),
          forcePasswordChange: true,
        }),
        update: jest.fn(),
      },
    };
    const service = new AuthPasswordService(
      prisma as unknown as PrismaService,
      {} as AuthCommonService,
    );

    await expect(
      service.changePassword("user-1", {
        currentPassword,
        newPassword: currentPassword,
        confirmPassword: currentPassword,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
