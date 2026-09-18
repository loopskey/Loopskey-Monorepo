import { ForbiddenException } from "@nestjs/common";
import { Role } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";
import type { RoleProfileRegistry } from "@prisma/role-profile-registry.service";

import { IdentityAdministrationApiService } from "./identity-administration-api.service";

const createPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
});

const createService = (prisma: unknown) =>
  new IdentityAdministrationApiService(
    prisma as PrismaService,
    {} as RoleProfileRegistry,
  );

describe("IdentityAdministrationApiService.deleteUser", () => {
  it("returns null when the user does not exist", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    const service = createService(prisma);

    const result = await service.deleteUser("missing-user");

    expect(result).toBeNull();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("refuses to delete an admin account", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "admin-1",
      role: Role.ADMIN,
      email: "admin@example.com",
    });
    const service = createService(prisma);

    await expect(service.deleteUser("admin-1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("hard-deletes the account and returns a snapshot for auditing", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      role: Role.PROFESSIONAL,
      email: "pro@example.com",
    });
    prisma.user.delete.mockResolvedValue({ id: "user-1" });
    const service = createService(prisma);

    const result = await service.deleteUser("user-1");

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(result).toEqual({
      id: "user-1",
      role: Role.PROFESSIONAL,
      email: "pro@example.com",
    });
  });
});
