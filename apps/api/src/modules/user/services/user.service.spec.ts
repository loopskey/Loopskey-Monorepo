import { ForbiddenException } from "@nestjs/common";
import { Role, UserStatus } from "@prisma/client";
import { UserService } from "@user/services/user.service";
import { CurrentUserType } from "@user/types/current-user.types";

const actorWith = (role: Role): CurrentUserType => ({
  sub: "actor-1",
  role,
  status: UserStatus.ACTIVE,
});

const buildService = () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const roleProfiles = { provision: jest.fn(), project: jest.fn() };
  const service = new UserService(prisma as never, roleProfiles as never);
  return { service, prisma, roleProfiles };
};

const input = {
  email: "new@example.test",
  password: "Password-Strong-1",
  role: Role.ADMIN,
  status: UserStatus.ACTIVE,
};

describe("UserService administrator boundary", () => {
  it.each([
    Role.PROFESSIONAL,
    Role.PROVIDER,
    Role.ORGANIZATION,
    Role.ASSOCIATION,
  ])(
    "refuses createUser for a %s actor before touching the database",
    async (role) => {
      const { service, prisma } = buildService();
      await expect(
        service.createUser(actorWith(role), input),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it("refuses createUser without an actor", async () => {
    const { service, prisma } = buildService();
    await expect(
      service.createUser(undefined as never, input),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("refuses every other administrative operation to a non-administrator", async () => {
    const { service, prisma } = buildService();
    const actor = actorWith(Role.ORGANIZATION);
    await expect(service.findUsers(actor)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.findById(actor, "u")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.updateUser(actor, { userId: "u", role: Role.ADMIN }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.updateUserStatus(actor, {
        userId: "u",
        status: UserStatus.DISABLED,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.softDeleteUser(actor, "u")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.restoreUser(actor, "u")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("lets an administrator reach the database", async () => {
    const { service, prisma } = buildService();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockResolvedValue({
      id: "created",
      role: Role.ADMIN,
    });
    await service.createUser(actorWith(Role.ADMIN), input);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
