import { ConflictException } from "@nestjs/common";
import { UserStatus } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";

import { IdentityProfileApiService } from "./identity-profile-api.service";

const setup = (existing: unknown) => {
  const tx = {
    user: {
      findUnique: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue({ id: "new-user" }),
    },
  };
  return {
    tx,
    service: new IdentityProfileApiService({} as unknown as PrismaService),
  };
};

describe("resolveAssociationMemberUser", () => {
  const command = { email: "Member@Example.org", fullName: "Ada Member" };

  it("links an already-claimed (ACTIVE) account without touching it", async () => {
    const { service, tx } = setup({
      id: "user-1",
      status: UserStatus.ACTIVE,
      deletedAt: null,
    });

    const result = await service.resolveAssociationMemberUser({
      ...command,
      atomicContext: tx,
    });

    expect(result).toEqual({ id: "user-1", linkedExisting: true });
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  /**
   * Regression: a still-PENDING row (e.g. a different association invited
   * this same unclaimed email first) used to be reported as `linkedExisting:
   * true` purely because a User row existed — silently granting this
   * association an ACTIVE membership nobody had accepted, and skipping the
   * invitation email entirely. It must instead be treated as still
   * unclaimed: the association gets its own invitation to the same
   * underlying (reused) account.
   */
  it("does not treat an unclaimed PENDING row as linked", async () => {
    const { service, tx } = setup({
      id: "user-1",
      status: UserStatus.PENDING,
      deletedAt: null,
    });

    const result = await service.resolveAssociationMemberUser({
      ...command,
      atomicContext: tx,
    });

    expect(result).toEqual({ id: "user-1", linkedExisting: false });
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it("creates a brand-new PENDING user when no account exists yet", async () => {
    const { service, tx } = setup(null);

    const result = await service.resolveAssociationMemberUser({
      ...command,
      atomicContext: tx,
    });

    expect(result).toEqual({ id: "new-user", linkedExisting: false });
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "member@example.org",
          status: UserStatus.PENDING,
        }),
      }),
    );
  });

  it("refuses a deleted account instead of silently reviving it", async () => {
    const { service, tx } = setup({
      id: "user-1",
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    });

    await expect(
      service.resolveAssociationMemberUser({ ...command, atomicContext: tx }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
