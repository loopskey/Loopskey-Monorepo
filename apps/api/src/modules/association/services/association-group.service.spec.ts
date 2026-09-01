import { Prisma, Role } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import type { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationGroupService } from "./association-group.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };
const association = { id: "assoc-1", name: "Example Association" };

const groupRow = (over: Record<string, unknown> = {}) => ({
  id: "group-1",
  title: "Northern Chapter",
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { members: 4 },
  ...over,
});

const titleClash = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.11.1",
    meta: { target: ["associationId", "title"] },
  });

const setup = (over: { create?: jest.Mock } = {}) => {
  const tx = {
    associationMember: {
      updateMany: jest.fn().mockResolvedValue({ count: 4 }),
    },
    associationGroup: {
      update: jest.fn().mockResolvedValue(groupRow({ isActive: false })),
    },
  };
  const prisma = {
    associationGroup: {
      findMany: jest.fn().mockResolvedValue([groupRow()]),
      findFirst: jest.fn().mockResolvedValue({ id: "group-1", isActive: true }),
      create: over.create ?? jest.fn().mockResolvedValue(groupRow()),
      update: jest.fn().mockResolvedValue(groupRow()),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const access = {
    requireOwned: jest.fn().mockResolvedValue(association),
    requireReadable: jest.fn().mockResolvedValue(association),
  };
  return {
    tx,
    prisma,
    service: new AssociationGroupService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
    ),
  };
};

describe("AssociationGroupService", () => {
  it("reports how many members each group holds", async () => {
    const { service } = setup();
    await expect(service.list(owner)).resolves.toEqual([
      expect.objectContaining({ id: "group-1", memberCount: 4 }),
    ]);
  });

  it("recovers a duplicate title into its domain code", async () => {
    const { service } = setup({
      create: jest.fn().mockRejectedValue(titleClash()),
    });
    await expect(
      service.create(owner, { title: "Northern Chapter" }),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.GROUP_TITLE_TAKEN },
    });
  });

  it("releases its members when a group is deactivated, leaving them active", async () => {
    // Deactivating a group must never be a way to lose people: the members stay
    // in the roster and simply have no group.
    const { service, tx } = setup();

    await service.setActive(owner, { groupId: "group-1", isActive: false });

    expect(tx.associationMember.updateMany).toHaveBeenCalledWith({
      where: { associationId: "assoc-1", groupId: "group-1" },
      data: { groupId: null },
    });
    expect(tx.associationGroup.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it("leaves members alone when a group is reactivated", async () => {
    const { service, tx } = setup();
    await service.setActive(owner, { groupId: "group-1", isActive: true });
    expect(tx.associationMember.updateMany).not.toHaveBeenCalled();
  });

  it("refuses a group that belongs to another association", async () => {
    const { service, prisma } = setup();
    prisma.associationGroup.findFirst.mockResolvedValue(null);
    await expect(
      service.requireGroup("assoc-1", "group-elsewhere"),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.GROUP_NOT_FOUND },
    });
  });
});
