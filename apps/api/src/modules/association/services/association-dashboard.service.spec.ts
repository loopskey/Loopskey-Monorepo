import { Role, UserStatus } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationDashboardService } from "./association-dashboard.service";

const record = {
  id: "assoc-1",
  name: "Example Association",
  logoUrl: null,
  description: null,
  country: "FR",
  website: null,
  contactEmail: "chair@example.org",
  createdAt: new Date(),
  updatedAt: new Date(),
  settings: { id: "settings-1" },
  owner: {
    email: "chair@example.org",
    fullName: "Ada Chair",
    status: UserStatus.ACTIVE,
  },
};

const setup = () => {
  const prisma = {
    association: {
      findFirst: jest.fn().mockResolvedValue(record),
      update: jest.fn().mockResolvedValue(record),
    },
  };
  return {
    prisma,
    service: new AssociationDashboardService(
      prisma as unknown as PrismaService,
    ),
  };
};

const owner = { id: "user-1", role: Role.ASSOCIATION };
const admin = { id: "admin-1", role: Role.ADMIN };

describe("AssociationDashboardService reads", () => {
  it("resolves an owner's association from their user id, not from an argument", async () => {
    const { service, prisma } = setup();
    await service.profile(owner);
    expect(prisma.association.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: "user-1", deletedAt: null },
      }),
    );
  });

  it("refuses an owner who names an association", async () => {
    const { service, prisma } = setup();
    await expect(service.profile(owner, "assoc-2")).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACCESS_DENIED },
    });
    expect(prisma.association.findFirst).not.toHaveBeenCalled();
  });

  it("reads the association an admin names", async () => {
    const { service, prisma } = setup();
    await service.profile(admin, "assoc-1");
    expect(prisma.association.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "assoc-1", deletedAt: null },
      }),
    );
  });

  it("makes an admin name one rather than answering with an arbitrary association", async () => {
    const { service, prisma } = setup();
    await expect(service.profile(admin)).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ASSOCIATION_ID_REQUIRED },
    });
    expect(prisma.association.findFirst).not.toHaveBeenCalled();
  });

  it("refuses every other role", async () => {
    const { service } = setup();
    await expect(
      service.profile({ id: "user-2", role: Role.PROFESSIONAL }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACCESS_DENIED },
    });
  });

  it("never returns the owner's row, only their three public fields", async () => {
    const { service } = setup();
    const profile = await service.profile(owner);
    expect(profile).toEqual(
      expect.objectContaining({
        ownerEmail: "chair@example.org",
        ownerFullName: "Ada Chair",
        ownerStatus: UserStatus.ACTIVE,
      }),
    );
    expect(profile).not.toHaveProperty("owner");
  });
});

describe("AssociationDashboardService writes", () => {
  it("updates only the fields the input names", async () => {
    const { service, prisma } = setup();
    await service.updateProfile(owner, { name: "  Renamed  ", website: "" });
    expect(prisma.association.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "assoc-1" },
        data: { name: "Renamed", website: null },
      }),
    );
  });

  it("refuses an admin acting as the owner", async () => {
    const { service, prisma } = setup();
    await expect(
      service.updateProfile(admin, { name: "Renamed" }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ACCESS_DENIED },
    });
    expect(prisma.association.update).not.toHaveBeenCalled();
  });
});
