import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationLearningContentRecipientService } from "./association-learning-content-recipient.service";

const content = (over: Record<string, unknown> = {}) => ({
  id: "lc-1",
  status: AssociationLearningContentStatus.PUBLISHED,
  associationId: "assoc-1",
  audienceKind: AssociationAudienceKind.ALL_MEMBERS,
  targets: [],
  ...over,
});

const setup = () => {
  const tx = {
    associationLearningContentRecipient: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  const prisma = {
    associationLearningContent: {
      findUnique: jest.fn().mockResolvedValue(content()),
      findMany: jest.fn().mockResolvedValue([]),
    },
    associationMember: {
      findMany: jest.fn().mockResolvedValue([{ id: "m-1" }, { id: "m-2" }]),
      findUnique: jest.fn().mockResolvedValue({
        id: "m-1",
        associationId: "assoc-1",
        groupId: "group-1",
        status: AssociationMemberStatus.ACTIVE,
      }),
    },
    associationLearningContentRecipient: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
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
    service: new AssociationLearningContentRecipientService(
      prisma as unknown as PrismaService,
      notifications as never,
    ),
  };
};

describe("AssociationLearningContentRecipientService syncContent", () => {
  it("targets the current audience and announces it in the same transaction", async () => {
    const { service, tx } = setup();

    await service.syncContent("lc-1");

    expect(
      tx.associationLearningContentRecipient.createMany,
    ).toHaveBeenCalledWith({
      data: [
        { learningContentId: "lc-1", memberId: "m-1" },
        { learningContentId: "lc-1", memberId: "m-2" },
      ],
      skipDuplicates: true,
    });
    expect(
      tx.associationLearningContentRecipient.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        learningContentId: "lc-1",
        memberId: { in: ["m-1", "m-2"] },
        isTargeted: false,
      },
      data: { isTargeted: true, announcedAt: null },
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("untargets members the audience no longer covers so a real re-add announces again", async () => {
    const { service, prisma } = setup();
    prisma.associationLearningContentRecipient.findMany.mockResolvedValue([
      { id: "r-1", memberId: "m-1" },
      { id: "r-9", memberId: "gone" },
    ]);

    const outcome = await service.syncContent("lc-1");

    expect(
      prisma.associationLearningContentRecipient.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: { in: ["r-9"] } },
      data: { isTargeted: false, announcedAt: null },
    });
    expect(outcome.targeted).toBe(2);
  });

  it("resolves a group audience to the members of those groups only", async () => {
    const { service, prisma } = setup();
    prisma.associationLearningContent.findUnique.mockResolvedValue(
      content({
        audienceKind: AssociationAudienceKind.GROUP,
        targets: [{ groupId: "group-1", memberId: null }],
      }),
    );

    await service.syncContent("lc-1");

    expect(prisma.associationMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          associationId: "assoc-1",
          status: { not: AssociationMemberStatus.INACTIVE },
          groupId: { in: ["group-1"] },
        },
      }),
    );
  });

  it("leaves an unpublished item alone", async () => {
    const { service, prisma, tx } = setup();
    prisma.associationLearningContent.findUnique.mockResolvedValue(
      content({ status: AssociationLearningContentStatus.WITHDRAWN }),
    );

    await expect(service.syncContent("lc-1")).resolves.toEqual({
      targeted: 0,
      untargeted: 0,
      announced: 0,
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.$queryRaw).not.toHaveBeenCalled();
  });

  it("renews the outbox lease after every batch", async () => {
    const { service } = setup();
    const renew = jest.fn().mockResolvedValue(undefined);

    await service.syncContent("lc-1", renew);

    expect(renew).toHaveBeenCalledTimes(1);
  });
});

describe("AssociationLearningContentRecipientService syncMember", () => {
  it("targets the member for every published item that covers them and untargets the rest", async () => {
    const { service, prisma, tx } = setup();
    prisma.associationLearningContent.findMany.mockResolvedValue([
      content({ id: "lc-all" }),
      content({
        id: "lc-other-group",
        audienceKind: AssociationAudienceKind.GROUP,
        targets: [{ groupId: "group-9", memberId: null }],
      }),
      content({
        id: "lc-direct",
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        targets: [{ groupId: null, memberId: "m-1" }],
      }),
    ]);

    await service.syncMember("m-1");

    const targeted =
      tx.associationLearningContentRecipient.createMany.mock.calls.map(
        ([argument]) =>
          (argument as { data: { learningContentId: string }[] }).data[0]
            .learningContentId,
      );
    expect(targeted).toEqual(["lc-all", "lc-direct"]);
    expect(
      tx.associationLearningContentRecipient.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        memberId: "m-1",
        isTargeted: true,
        learningContentId: { notIn: ["lc-all", "lc-direct"] },
      },
      data: { isTargeted: false, announcedAt: null },
    });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("untargets everything for a deactivated member", async () => {
    const { service, prisma, tx } = setup();
    prisma.associationMember.findUnique.mockResolvedValue({
      id: "m-1",
      associationId: "assoc-1",
      groupId: null,
      status: AssociationMemberStatus.INACTIVE,
    });
    prisma.associationLearningContent.findMany.mockResolvedValue([content()]);

    await service.syncMember("m-1");

    expect(
      tx.associationLearningContentRecipient.createMany,
    ).not.toHaveBeenCalled();
    expect(
      tx.associationLearningContentRecipient.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ learningContentId: { notIn: [] } }),
      }),
    );
  });
});

describe("AssociationLearningContentRecipientService announce", () => {
  it("claims only unannounced recipients with a row lock and records one occurrence each", async () => {
    const { service, tx, notifications } = setup();
    const now = new Date("2026-09-27T10:00:00.000Z");
    tx.$queryRaw.mockResolvedValue([
      {
        id: "r-1",
        learningContentId: "lc-1",
        memberId: "m-1",
        userId: "u-1",
        associationId: "assoc-1",
      },
    ]);

    await service.announce(tx as never, { learningContentId: "lc-1" }, now);

    const sql = (tx.$queryRaw.mock.calls[0][0] as TemplateStringsArray).join(
      "?",
    );
    expect(sql).toContain(`recipient."announcedAt" IS NULL`);
    expect(sql).toContain("FOR UPDATE OF recipient");
    expect(notifications.record).toHaveBeenCalledWith(
      tx,
      [
        {
          associationId: "assoc-1",
          memberId: "m-1",
          recipientUserId: "u-1",
          messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
          occurrenceKey: `learning-content-assigned:r-1:${now.getTime()}`,
          subject: { learningContentId: "lc-1", recipientId: "r-1" },
        },
      ],
      now,
    );
  });
});
