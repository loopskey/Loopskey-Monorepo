import {
  AssociationAudienceKind,
  AssociationMemberStatus,
} from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
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
      updateMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
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

  const requirementDirectory = {
    syncAssignedRequirements: jest.fn().mockResolvedValue(undefined),
    hasRecordedActivity: jest.fn().mockResolvedValue(false),
    removeRequirementLinks: jest.fn().mockResolvedValue(2),
  };

  const notifications = {
    record: jest.fn(
      async (_tx: unknown, notifications: unknown[]) => notifications.length,
    ),
  };

  return {
    tx,
    prisma,
    notifications,
    requirementDirectory,
    service: new AssociationRequirementAssignmentService(
      prisma as unknown as PrismaService,
      requirementDirectory,
      notifications as never,
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
      data: { isTargeted: false, announcedAt: null },
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
      announced: 0,
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

describe("AssociationRequirementAssignmentService announcements", () => {
  const sqlOf = (call: unknown[]) =>
    (call[0] as TemplateStringsArray).join("?") +
    call
      .slice(1)
      .map((value) =>
        typeof value === "object" && value !== null && "sql" in value
          ? (value as { sql: string }).sql
          : JSON.stringify(value),
      )
      .join(" ");

  it("announces a published requirement inside the same batch transaction", async () => {
    const { service, tx } = setup({ members: [{ id: "m-1" }, { id: "m-2" }] });

    await service.materialise("req-1");

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    const sql = sqlOf(tx.$queryRaw.mock.calls[0]);
    expect(sql).toContain(`"announcedAt" IS NULL`);
    expect(sql).toContain("FOR UPDATE OF assignment");
    expect(sql).toContain(`assignment."requirementId" =`);
    expect(sql).toContain(`assignment."memberId" IN`);
  });

  it("never announces a draft, which members cannot act on yet", async () => {
    const { service, tx } = setup({
      requirement: { status: AssociationRequirementStatus.DRAFT },
    });

    await service.materialise("req-1");

    expect(tx.associationRequirementAssignment.upsert).toHaveBeenCalled();
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it("records one occurrence per claimed assignment, keyed to the claim", async () => {
    const { service, tx, notifications } = setup();
    const now = new Date("2026-09-27T10:00:00.000Z");
    tx.$queryRaw.mockResolvedValue([
      {
        id: "a-1",
        requirementId: "req-1",
        memberId: "m-1",
        userId: "u-1",
        associationId: "assoc-1",
      },
    ]);

    await expect(
      service.announce(tx as never, { memberIds: ["m-1"] }, now),
    ).resolves.toBe(1);

    expect(notifications.record).toHaveBeenCalledWith(
      tx,
      [
        {
          associationId: "assoc-1",
          memberId: "m-1",
          recipientUserId: "u-1",
          messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          occurrenceKey: `requirement-assigned:a-1:${now.getTime()}`,
          subject: { requirementId: "req-1", assignmentId: "a-1" },
        },
      ],
      now,
    );
  });

  it("claims nothing for an empty member scope", async () => {
    const { service, tx, notifications } = setup();

    await expect(
      service.announce(tx as never, { memberIds: [] }),
    ).resolves.toBe(0);

    expect(tx.$queryRaw).not.toHaveBeenCalled();
    expect(notifications.record).not.toHaveBeenCalled();
  });

  it("announces a member's assignments after materialising them", async () => {
    const { service, prisma, tx } = setup();
    prisma.associationRequirement.findMany.mockResolvedValue([requirement()]);

    await service.materialiseForMember("m-1");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("clears the announcement when a member stops being targeted", async () => {
    const { service, prisma } = setup();
    prisma.associationRequirement.findMany.mockResolvedValue([
      requirement({
        audienceKind: AssociationAudienceKind.GROUP,
        targets: [{ groupId: "group-9", memberId: null }],
      }),
    ]);

    await service.materialiseForMember("m-1");

    expect(
      prisma.associationRequirementAssignment.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isTargeted: false, announcedAt: null },
      }),
    );
  });

  it("announces nothing for a deactivated member", async () => {
    const { service, prisma, tx } = setup();
    prisma.associationMember.findUnique.mockResolvedValue({
      id: "m-1",
      associationId: "assoc-1",
      groupId: null,
      status: AssociationMemberStatus.INACTIVE,
    });
    prisma.associationRequirement.findMany.mockResolvedValue([requirement()]);

    await service.materialiseForMember("m-1");

    expect(tx.$queryRaw).not.toHaveBeenCalled();
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

describe("AssociationRequirementAssignmentService retire", () => {
  it("deactivates targeting and removes the professional projection atomically", async () => {
    const { service, tx, requirementDirectory } = setup();

    await service.retire(tx as never, "req-1");

    expect(tx.associationRequirementAssignment.updateMany).toHaveBeenCalledWith(
      {
        where: { requirementId: "req-1", isTargeted: true },
        data: { isTargeted: false, announcedAt: null },
      },
    );
    expect(requirementDirectory.removeRequirementLinks).toHaveBeenCalledWith(
      "req-1",
      tx,
    );
  });
});
