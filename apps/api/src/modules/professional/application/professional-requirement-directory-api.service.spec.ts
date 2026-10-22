import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalRequirementDirectoryApiService } from "./professional-requirement-directory-api.service";

const setup = () => {
  const prisma = {
    professionalAssociationRequirementLink: {
      deleteMany: jest.fn().mockReturnValue("delete"),
      createMany: jest.fn().mockReturnValue("create"),
    },
    pDUActivity: {
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };

  return {
    prisma,
    service: new ProfessionalRequirementDirectoryApiService(
      prisma as unknown as PrismaService,
    ),
  };
};

describe("ProfessionalRequirementDirectoryApiService", () => {
  it("adds links with a conflict-tolerant insert, so concurrent syncs converge", async () => {
    const { service, prisma } = setup();

    await service.syncAssignedRequirements("user-1", [
      "req-1",
      "req-2",
      "req-1",
    ]);

    expect(
      prisma.professionalAssociationRequirementLink.createMany,
    ).toHaveBeenCalledWith({
      data: [
        { userId: "user-1", associationRequirementId: "req-1" },
        { userId: "user-1", associationRequirementId: "req-2" },
      ],
      skipDuplicates: true,
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(["delete", "create"]);
  });

  it("drops the links the member no longer holds in the same transaction", async () => {
    const { service, prisma } = setup();

    await service.syncAssignedRequirements("user-1", ["req-2"]);

    expect(
      prisma.professionalAssociationRequirementLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        associationRequirementId: { notIn: ["req-2"] },
      },
    });
  });

  it("detects professional activity through the caller's transaction", async () => {
    const { service } = setup();
    const tx = { pDUActivity: { count: jest.fn().mockResolvedValue(1) } };

    await expect(service.hasRecordedActivity("req-1", tx)).resolves.toBe(true);
    expect(tx.pDUActivity.count).toHaveBeenCalledWith({
      where: { associationRequirementId: "req-1" },
    });
  });

  it("removes projections through the caller's transaction", async () => {
    const { service } = setup();
    const tx = {
      professionalAssociationRequirementLink: {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    await expect(service.removeRequirementLinks("req-1", tx)).resolves.toBe(2);
    expect(
      tx.professionalAssociationRequirementLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: { associationRequirementId: "req-1" },
    });
  });
});

const contentTx = () => ({
  professionalAssociationContentLink: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  pDUActivity: { count: jest.fn().mockResolvedValue(0) },
  $executeRaw: jest.fn().mockResolvedValue(0),
  $queryRaw: jest.fn().mockResolvedValue([]),
});

describe("ProfessionalRequirementDirectoryApiService content links", () => {
  it("drops the recipients an item no longer has and upserts the current ones once each", async () => {
    const { service } = setup();
    const tx = contentTx();

    await service.replaceContentRecipients(
      {
        learningContentId: "lc-1",
        requirementId: "req-1",
        userIds: ["u-1", "u-2", "u-1"],
      },
      tx,
    );

    expect(
      tx.professionalAssociationContentLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: { learningContentId: "lc-1", userId: { notIn: ["u-1", "u-2"] } },
    });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    const sql = (tx.$executeRaw.mock.calls[0][0] as TemplateStringsArray).join(
      "?",
    );
    expect(sql).toContain('ON CONFLICT ("userId", "learningContentId")');
    expect(sql).toContain(
      'DO UPDATE SET "requirementId" = EXCLUDED."requirementId"',
    );
  });

  it("removes every link of an item whose audience became empty", async () => {
    const { service } = setup();
    const tx = contentTx();

    await service.replaceContentRecipients(
      { learningContentId: "lc-1", requirementId: null, userIds: [] },
      tx,
    );

    expect(
      tx.professionalAssociationContentLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: { learningContentId: "lc-1", userId: { notIn: [] } },
    });
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });

  it("writes large audiences in bounded batches", async () => {
    const { service } = setup();
    const tx = contentTx();
    const userIds = Array.from({ length: 1201 }, (_, index) => `u-${index}`);

    await service.replaceContentRecipients(
      { learningContentId: "lc-1", requirementId: null, userIds },
      tx,
    );

    expect(tx.$executeRaw).toHaveBeenCalledTimes(3);
  });

  it("replaces one member's links only inside the scope it was given", async () => {
    const { service } = setup();
    const tx = contentTx();

    await service.replaceMemberContent(
      {
        userId: "u-1",
        scopeContentIds: ["lc-1", "lc-2", "lc-3"],
        items: [
          { learningContentId: "lc-1", requirementId: "req-1" },
          { learningContentId: "lc-2", requirementId: null },
        ],
      },
      tx,
    );

    expect(
      tx.professionalAssociationContentLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: {
        userId: "u-1",
        learningContentId: {
          in: ["lc-1", "lc-2", "lc-3"],
          notIn: ["lc-1", "lc-2"],
        },
      },
    });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it("removes the links of a withdrawn item through the caller's transaction", async () => {
    const { service } = setup();
    const tx = contentTx();
    tx.professionalAssociationContentLink.deleteMany.mockResolvedValue({
      count: 4,
    });

    await expect(service.removeContentLinks("lc-1", tx)).resolves.toBe(4);
    expect(
      tx.professionalAssociationContentLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: { learningContentId: "lc-1" },
    });
  });

  it("locks the item's links before it looks for recorded activity", async () => {
    const { service } = setup();
    const tx = contentTx();

    await service.reassignContentRequirement("lc-1", "req-2", tx);

    const sql = (tx.$queryRaw.mock.calls[0][0] as TemplateStringsArray).join(
      "?",
    );
    expect(sql).toContain("FOR UPDATE");
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.pDUActivity.count.mock.invocationCallOrder[0],
    );
  });

  it("moves the links to the new requirement when nobody has completed the item", async () => {
    const { service } = setup();
    const tx = contentTx();

    await expect(
      service.reassignContentRequirement("lc-1", "req-2", tx),
    ).resolves.toBe(true);
    expect(tx.pDUActivity.count).toHaveBeenCalledWith({
      where: { associationLearningContentId: "lc-1" },
    });
    expect(
      tx.professionalAssociationContentLink.updateMany,
    ).toHaveBeenCalledWith({
      where: { learningContentId: "lc-1" },
      data: { requirementId: "req-2" },
    });
  });

  it("refuses the move and leaves the links alone once someone has completed the item", async () => {
    const { service } = setup();
    const tx = contentTx();
    tx.pDUActivity.count.mockResolvedValue(1);

    await expect(
      service.reassignContentRequirement("lc-1", null, tx),
    ).resolves.toBe(false);
    expect(
      tx.professionalAssociationContentLink.updateMany,
    ).not.toHaveBeenCalled();
  });

  it("reads one member's link with a shared row lock", async () => {
    const { service } = setup();
    const tx = contentTx();
    tx.$queryRaw.mockResolvedValue([{ requirementId: "req-1" }]);

    await expect(
      service.lockContentLink(tx as never, "u-1", "lc-1"),
    ).resolves.toEqual({ requirementId: "req-1" });
    const sql = (tx.$queryRaw.mock.calls[0][0] as TemplateStringsArray).join(
      "?",
    );
    expect(sql).toContain("FOR SHARE");
  });

  it("reports no link when the member was never offered the item", async () => {
    const { service } = setup();
    const tx = contentTx();

    await expect(
      service.lockContentLink(tx as never, "u-1", "lc-1"),
    ).resolves.toBeNull();
  });
});
