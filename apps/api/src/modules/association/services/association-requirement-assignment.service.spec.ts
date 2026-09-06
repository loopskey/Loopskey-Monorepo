import {
  AssociationAudienceKind,
  AssociationMemberStatus,
} from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationRequirementAssignmentService } from "./association-requirement-assignment.service";

const requirement = (over: Record<string, unknown> = {}) => ({
  id: "req-1",
  associationId: "assoc-1",
  audienceKind: AssociationAudienceKind.ALL_MEMBERS,
  deadline: new Date("2026-12-31"),
  reportingStart: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  status: AssociationRequirementStatus.PUBLISHED,
  targets: [],
  ...over,
});

const setup = (
  over: {
    requirement?: Record<string, unknown>;
    members?: { id: string }[];
    existing?: {
      id: string;
      memberId: string;
      recordedCredits: number;
    }[];
  } = {},
) => {
  const tx = {
    associationRequirementAssignment: {
      upsert: jest.fn().mockResolvedValue({}),
    },
  };

  const prisma = {
    associationRequirement: {
      findUnique: jest.fn().mockResolvedValue(requirement(over.requirement)),
      findMany: jest.fn().mockResolvedValue([]),
    },
    associationMember: {
      findMany: jest.fn().mockResolvedValue(over.members ?? [{ id: "m-1" }]),
      findUnique: jest.fn().mockResolvedValue({
        id: "m-1",
        associationId: "assoc-1",
        groupId: null,
        status: AssociationMemberStatus.ACTIVE,
      }),
    },
    associationRequirementAssignment: {
      findMany: jest.fn().mockResolvedValue(over.existing ?? []),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      upsert: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };

  return {
    tx,
    prisma,
    service: new AssociationRequirementAssignmentService(
      prisma as unknown as PrismaService,
    ),
  };
};

describe("AssociationRequirementAssignmentService materialise", () => {
  it("upserts on the cycle key, so a second run creates nothing new", async () => {
    const { service, tx } = setup({ members: [{ id: "m-1" }, { id: "m-2" }] });

    await service.materialise("req-1");

    expect(tx.associationRequirementAssignment.upsert).toHaveBeenCalledTimes(2);
    for (const call of tx.associationRequirementAssignment.upsert.mock.calls)
      expect(call[0].where).toHaveProperty("requirementId_memberId_cycleStart");
  });

  it("drops an assignment the audience no longer covers when nothing was recorded", async () => {
    const { service, prisma } = setup({
      members: [{ id: "m-1" }],
      existing: [
        { id: "a-1", memberId: "m-1", recordedCredits: 0 },
        { id: "a-2", memberId: "gone", recordedCredits: 0 },
      ],
    });

    await service.materialise("req-1");

    expect(
      prisma.associationRequirementAssignment.deleteMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ["a-2"] } }),
      }),
    );
    expect(
      prisma.associationRequirementAssignment.updateMany,
    ).not.toHaveBeenCalled();
  });

  it("keeps an assignment carrying recorded credits and flags it as no longer targeted", async () => {
    const { service, prisma } = setup({
      members: [{ id: "m-1" }],
      existing: [{ id: "a-2", memberId: "gone", recordedCredits: 12 }],
    });

    await service.materialise("req-1");

    expect(
      prisma.associationRequirementAssignment.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: { in: ["a-2"] } },
      data: { isTargeted: false },
    });
    expect(
      prisma.associationRequirementAssignment.deleteMany,
    ).not.toHaveBeenCalled();
  });

  it("never deletes history even when the delete would otherwise match", async () => {
    const { service, prisma } = setup({
      members: [],
      existing: [{ id: "a-2", memberId: "gone", recordedCredits: 12 }],
    });

    await service.materialise("req-1");

    const deleteCalls =
      prisma.associationRequirementAssignment.deleteMany.mock.calls;
    for (const call of deleteCalls)
      expect(call[0].where.recordedCredits).toEqual({ lte: 0 });
  });

  it("does nothing for an archived requirement", async () => {
    const { service, tx } = setup({
      requirement: { status: AssociationRequirementStatus.ARCHIVED },
    });

    await expect(service.materialise("req-1")).resolves.toEqual({
      created: 0,
      retained: 0,
      removed: 0,
      retargeted: 0,
    });
    expect(tx.associationRequirementAssignment.upsert).not.toHaveBeenCalled();
  });

  it("excludes deactivated members from the audience", async () => {
    const { service, prisma } = setup();

    await service.materialise("req-1");

    expect(prisma.associationMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { not: AssociationMemberStatus.INACTIVE },
        }),
      }),
    );
  });
});

describe("AssociationRequirementAssignmentService materialiseForMember", () => {
  it("gives a new member an assignment to every all-members requirement", async () => {
    const { service, prisma } = setup();
    prisma.associationRequirement.findMany.mockResolvedValue([
      requirement(),
      requirement({ id: "req-2" }),
    ]);

    await service.materialiseForMember("m-1");

    expect(
      prisma.associationRequirementAssignment.upsert,
    ).toHaveBeenCalledTimes(2);
  });

  it("leaves a member out of a group requirement they do not belong to", async () => {
    const { service, prisma } = setup();
    prisma.associationRequirement.findMany.mockResolvedValue([
      requirement({
        audienceKind: AssociationAudienceKind.GROUP,
        targets: [{ groupId: "group-9", memberId: null }],
      }),
    ]);

    await service.materialiseForMember("m-1");

    expect(
      prisma.associationRequirementAssignment.upsert,
    ).not.toHaveBeenCalled();
    expect(
      prisma.associationRequirementAssignment.deleteMany,
    ).toHaveBeenCalled();
  });

  it("drops a deactivated member from the audience", async () => {
    const { service, prisma } = setup();
    prisma.associationMember.findUnique.mockResolvedValue({
      id: "m-1",
      associationId: "assoc-1",
      groupId: null,
      status: AssociationMemberStatus.INACTIVE,
    });
    prisma.associationRequirement.findMany.mockResolvedValue([requirement()]);

    await service.materialiseForMember("m-1");

    expect(
      prisma.associationRequirementAssignment.upsert,
    ).not.toHaveBeenCalled();
  });
});

describe("AssociationRequirementAssignmentService membersCovered", () => {
  it("counts a member once however many assignments they hold", async () => {
    const { service, prisma } = setup();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      { memberId: "m-1" },
      { memberId: "m-2" },
    ]);

    await expect(service.membersCovered("assoc-1")).resolves.toBe(2);
    expect(
      prisma.associationRequirementAssignment.findMany,
    ).toHaveBeenCalledWith(expect.objectContaining({ distinct: ["memberId"] }));
  });
});
