import {
  Prisma,
  RoadmapChatRole,
  RoadmapDraftStatus,
  RoadmapDraftStep,
} from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalRoadmapDraftService } from "./professional-roadmap-draft.service";

const createPrismaMock = () => ({
  roadmapDraft: {
    create: jest.fn().mockResolvedValue({ id: "draft-1" }),
    findFirst: jest.fn().mockResolvedValue({ id: "draft-1" }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    findMany: jest.fn().mockResolvedValue([]),
  },
  roadmapChatMessage: {
    create: jest.fn().mockResolvedValue({ id: "message-1" }),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  $queryRaw: jest.fn().mockResolvedValue([{ id: "edit-1" }]),
  $transaction: jest.fn(),
});

const createService = (prisma = createPrismaMock()) => ({
  prisma: Object.assign(prisma, {
    $transaction: jest.fn(async (run: (tx: typeof prisma) => unknown) =>
      run(prisma),
    ),
  }),
  service: new ProfessionalRoadmapDraftService(
    prisma as unknown as PrismaService,
  ),
});

describe("ProfessionalRoadmapDraftService ownership", () => {
  it("filters every read on the owner as well as the draft", async () => {
    const { service, prisma } = createService();

    await service.findDraft("user-1", "draft-1");

    expect(prisma.roadmapDraft.findFirst.mock.calls[0][0].where).toEqual({
      id: "draft-1",
      userId: "user-1",
    });
  });

  it("returns null rather than another professional's draft", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    expect(await service.findDraft("user-2", "draft-1")).toBeNull();
  });

  it("writes nothing when the update does not match the owner", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.updateMany.mockResolvedValue({ count: 0 });

    expect(
      await service.updateDraft("user-2", "draft-1", { goal: "x" }),
    ).toBeNull();
    expect(prisma.roadmapDraft.findFirst).not.toHaveBeenCalled();
  });

  it("scopes the update itself, not just a check before it", async () => {
    const { service, prisma } = createService();

    await service.updateDraft("user-1", "draft-1", { goal: "senior PM" });

    expect(prisma.roadmapDraft.updateMany.mock.calls[0][0].where).toEqual({
      id: "draft-1",
      userId: "user-1",
    });
  });

  it("refuses to append a message to a draft the user does not own", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    const result = await service.appendMessage("user-2", "draft-1", {
      role: RoadmapChatRole.PROFESSIONAL,
      content: "hello",
      stepKey: RoadmapDraftStep.GOAL,
    });

    expect(result).toBeNull();
    expect(prisma.roadmapChatMessage.create).not.toHaveBeenCalled();
  });

  it("refuses to read a transcript the user does not own", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    expect(await service.transcript("user-2", "draft-1")).toBeNull();
    expect(prisma.roadmapChatMessage.findMany).not.toHaveBeenCalled();
  });

  it("connects a new draft to the owner passed in, ignoring any seeded user", async () => {
    const { service, prisma } = createService();

    await service.createDraft("user-1", {
      goal: "senior product manager",
      user: { connect: { id: "user-2" } },
    });

    expect(prisma.roadmapDraft.create.mock.calls[0][0].data.user).toEqual({
      connect: { id: "user-1" },
    });
  });

  it("returns the whole stored transcript in order, oldest first", async () => {
    const { service, prisma } = createService();

    await service.transcript("user-1", "draft-1");

    expect(prisma.roadmapChatMessage.findMany.mock.calls[0][0]).toEqual({
      where: { draftId: "draft-1" },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("ProfessionalRoadmapDraftService.deleteDraft", () => {
  it("only deletes the owner's draft while it is still editable", async () => {
    const { service, prisma } = createService();

    const deleted = await service.deleteDraft("user-1", "draft-1");

    expect(deleted).toBe(true);
    expect(prisma.roadmapDraft.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "draft-1",
        userId: "user-1",
        status: {
          in: [RoadmapDraftStatus.COLLECTING, RoadmapDraftStatus.READY],
        },
      },
    });
  });

  it("reports false rather than throwing when nothing matched", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.deleteMany.mockResolvedValue({ count: 0 });

    expect(await service.deleteDraft("user-2", "draft-1")).toBe(false);
  });
});

describe("ProfessionalRoadmapDraftService.findRequiredCreditsByIds", () => {
  it("returns an empty map without querying when there are no ids", async () => {
    const { service, prisma } = createService();

    const result = await service.findRequiredCreditsByIds([]);

    expect(result.size).toBe(0);
    expect(prisma.roadmapDraft.findMany).not.toHaveBeenCalled();
  });

  it("maps each draft id to its required-credits value", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findMany.mockResolvedValue([
      { id: "draft-1", requiredCredits: 20 },
      { id: "draft-2", requiredCredits: null },
    ]);

    const result = await service.findRequiredCreditsByIds([
      "draft-1",
      "draft-2",
    ]);

    expect(result.get("draft-1")).toBe(20);
    expect(result.get("draft-2")).toBeNull();
    expect(prisma.roadmapDraft.findMany.mock.calls[0][0]).toEqual({
      where: { id: { in: ["draft-1", "draft-2"] } },
      select: { id: true, requiredCredits: true },
    });
  });
});

describe("ProfessionalRoadmapDraftService edit drafts", () => {
  const source = {
    id: "draft-1",
    goal: "Become a platform engineer",
    subjects: ["kubernetes"],
    targetDate: new Date("2027-01-01"),
    cpdPlanId: "plan-1",
    preferredFormats: [],
    preferredContentTypes: [],
    preferredDeliveryFormats: [],
  } as never;

  const uniqueViolation = () =>
    new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "test",
    });

  it("never offers an edit draft to the new-roadmap coach", async () => {
    const { service, prisma } = createService();

    await service.findEditableDraft("user-1");

    expect(prisma.roadmapDraft.findFirst.mock.calls[0][0].where).toMatchObject({
      userId: "user-1",
      replacesRoadmapId: null,
    });
  });

  it("looks an open edit up by owner, roadmap and an open status", async () => {
    const { service, prisma } = createService();

    await service.findOpenEditDraft("user-1", "roadmap-1");

    const where = prisma.roadmapDraft.findFirst.mock.calls[0][0].where;
    expect(where).toMatchObject({
      userId: "user-1",
      replacesRoadmapId: "roadmap-1",
    });
    expect(where.status.in).toEqual([
      RoadmapDraftStatus.COLLECTING,
      RoadmapDraftStatus.READY,
      RoadmapDraftStatus.GENERATING,
      RoadmapDraftStatus.FAILED,
    ]);
  });

  it("creates a ready draft at the review step holding a copy of the brief", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.create.mockResolvedValue({ id: "edit-1" });

    const result = await service.openEditDraft("user-1", "roadmap-1", source);

    expect(result).toEqual({ draft: { id: "edit-1" }, created: true });
    expect(prisma.roadmapDraft.create.mock.calls[0][0].data).toMatchObject({
      userId: "user-1",
      goal: "Become a platform engineer",
      subjects: ["kubernetes"],
      cpdPlanId: "plan-1",
      replacesRoadmapId: "roadmap-1",
      status: RoadmapDraftStatus.READY,
      currentStep: RoadmapDraftStep.REVIEW,
    });
  });

  it("answers with the winning draft when two edits start at the same moment", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.create.mockRejectedValue(uniqueViolation());
    prisma.roadmapDraft.findFirst.mockResolvedValue({ id: "edit-winner" });

    const result = await service.openEditDraft("user-1", "roadmap-1", source);

    expect(result).toEqual({ draft: { id: "edit-winner" }, created: false });
  });

  it("does not hide a failure that is not the one-open-edit violation", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.create.mockRejectedValue(new Error("connection lost"));

    await expect(
      service.openEditDraft("user-1", "roadmap-1", source),
    ).rejects.toThrow("connection lost");
  });

  it("discards only an unfinished edit the professional owns", async () => {
    const { service, prisma } = createService();

    await expect(service.discardEditDraft("user-1", "edit-1")).resolves.toBe(
      "discarded",
    );

    const where = prisma.roadmapDraft.deleteMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      id: "edit-1",
      userId: "user-1",
      replacesRoadmapId: { not: null },
    });
    expect(where.status.in).not.toContain(RoadmapDraftStatus.GENERATING);
    expect(where.status.in).not.toContain(RoadmapDraftStatus.COMPLETED);
  });

  it("reports nothing discarded when no such edit exists", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.deleteMany.mockResolvedValue({ count: 0 });
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    await expect(service.discardEditDraft("user-1", "missing")).resolves.toBe(
      "not_found",
    );
  });

  it.each([
    [RoadmapDraftStatus.COMPLETED, "closed"],
    [RoadmapDraftStatus.GENERATING, "locked"],
  ])(
    "keeps a %s edit and says why it was not discarded",
    async (status, outcome) => {
      const { service, prisma } = createService();
      prisma.roadmapDraft.deleteMany.mockResolvedValue({ count: 0 });
      prisma.roadmapDraft.findFirst.mockResolvedValue({ status });

      await expect(service.discardEditDraft("user-1", "edit-1")).resolves.toBe(
        outcome,
      );
    },
  );
});

describe("ProfessionalRoadmapDraftService transcript windows", () => {
  const message = (id: string) => ({ id, draftId: "draft-1" });

  it("shows the latest messages, oldest first, when no cursor is given", async () => {
    const { service, prisma } = createService();
    prisma.roadmapChatMessage.count.mockResolvedValue(40);
    prisma.roadmapChatMessage.findMany.mockResolvedValue([
      message("m-40"),
      message("m-39"),
      message("m-38"),
    ]);

    const page = await service.transcriptPage("user-1", "draft-1", { take: 3 });

    expect(prisma.roadmapChatMessage.findMany.mock.calls[0][0]).toMatchObject({
      where: { draftId: "draft-1" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3,
    });
    expect(page?.items.map((item) => item.id)).toEqual([
      "m-38",
      "m-39",
      "m-40",
    ]);
    expect(page?.totalCount).toBe(40);
    expect(page?.pageInfo).toEqual({ hasNextPage: false, nextCursor: null });
  });

  it("defaults to a window of thirty messages", async () => {
    const { service, prisma } = createService();

    await service.transcriptPage("user-1", "draft-1");

    expect(prisma.roadmapChatMessage.findMany.mock.calls[0][0].take).toBe(30);
  });

  it("pages forward from a cursor", async () => {
    const { service, prisma } = createService();
    prisma.roadmapChatMessage.findMany.mockResolvedValue([
      message("m-2"),
      message("m-3"),
      message("m-4"),
    ]);

    const page = await service.transcriptPage("user-1", "draft-1", {
      take: 2,
      cursor: "m-1",
    });

    expect(prisma.roadmapChatMessage.findMany.mock.calls[0][0]).toMatchObject({
      cursor: { id: "m-1" },
      skip: 1,
      take: 3,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    expect(page?.items.map((item) => item.id)).toEqual(["m-2", "m-3"]);
    expect(page?.pageInfo).toEqual({ hasNextPage: true, nextCursor: "m-3" });
  });

  it("returns nothing for a draft the professional does not own", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    expect(await service.transcriptPage("user-2", "draft-1")).toBeNull();
    expect(prisma.roadmapChatMessage.findMany).not.toHaveBeenCalled();
  });
});

describe("ProfessionalRoadmapDraftService edit history", () => {
  it("follows the edits back to the first draft, oldest first", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst
      .mockResolvedValueOnce({ id: "edit-1", replacesRoadmapId: "roadmap-0" })
      .mockResolvedValueOnce({ id: "first", replacesRoadmapId: null });

    const ids = await service.editSourceChain("user-1", {
      replacesRoadmapId: "roadmap-1",
    });

    expect(ids).toEqual(["first", "edit-1"]);
    const wheres = prisma.roadmapDraft.findFirst.mock.calls.map(
      (call) => call[0].where,
    );
    expect(wheres[0]).toEqual({
      userId: "user-1",
      enrollment: { is: { userId: "user-1", roadmapId: "roadmap-1" } },
    });
    expect(wheres[1]).toEqual({
      userId: "user-1",
      enrollment: { is: { userId: "user-1", roadmapId: "roadmap-0" } },
    });
  });

  it("has no history for a draft that edits nothing", async () => {
    const { service, prisma } = createService();

    expect(
      await service.editSourceChain("user-1", { replacesRoadmapId: null }),
    ).toEqual([]);
    expect(prisma.roadmapDraft.findFirst).not.toHaveBeenCalled();
  });

  it("stops when the saved brief behind a roadmap is gone", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    expect(
      await service.editSourceChain("user-1", {
        replacesRoadmapId: "roadmap-1",
      }),
    ).toEqual([]);
  });

  it("stops rather than loop when the chain points back at itself", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue({
      id: "loop",
      replacesRoadmapId: "roadmap-1",
    });

    expect(
      await service.editSourceChain("user-1", {
        replacesRoadmapId: "roadmap-1",
      }),
    ).toEqual(["loop"]);
  });

  it("reads only the messages of the drafts the edit grew out of", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst
      .mockResolvedValueOnce({
        id: "edit-draft",
        replacesRoadmapId: "roadmap-1",
      })
      .mockResolvedValueOnce({ id: "source-1", replacesRoadmapId: null });

    await service.historyPage("user-1", "edit-draft");

    expect(prisma.roadmapChatMessage.count.mock.calls[0][0]).toEqual({
      where: { draftId: { in: ["source-1"] } },
    });
    expect(prisma.roadmapChatMessage.findMany.mock.calls[0][0].where).toEqual({
      draftId: { in: ["source-1"] },
    });
  });

  it("returns no history for a draft the professional does not own", async () => {
    const { service, prisma } = createService();
    prisma.roadmapDraft.findFirst.mockResolvedValue(null);

    expect(await service.historyPage("user-2", "edit-draft")).toBeNull();
    expect(prisma.roadmapChatMessage.findMany).not.toHaveBeenCalled();
  });
});

describe("ProfessionalRoadmapDraftService edit greeting", () => {
  const greeting = {
    content: "ROADMAP_COACH_EDIT_GREETING",
    stepKey: RoadmapDraftStep.REVIEW,
  };

  it("writes the greeting once, as the first message of an edit", async () => {
    const { service, prisma } = createService();

    await expect(
      service.ensureEditGreeting("user-1", "edit-1", greeting),
    ).resolves.toBe(true);

    expect(prisma.roadmapChatMessage.create.mock.calls[0][0].data).toEqual({
      ...greeting,
      draftId: "edit-1",
      role: RoadmapChatRole.ASSISTANT,
    });
  });

  it("writes nothing when the edit already has messages", async () => {
    const { service, prisma } = createService();
    prisma.roadmapChatMessage.count.mockResolvedValue(3);

    await expect(
      service.ensureEditGreeting("user-1", "edit-1", greeting),
    ).resolves.toBe(false);
    expect(prisma.roadmapChatMessage.create).not.toHaveBeenCalled();
  });

  it("writes nothing for a draft that is not the caller's edit", async () => {
    const { service, prisma } = createService();
    prisma.$queryRaw.mockResolvedValue([]);

    await expect(
      service.ensureEditGreeting("user-2", "edit-1", greeting),
    ).resolves.toBe(false);
    expect(prisma.roadmapChatMessage.create).not.toHaveBeenCalled();
  });

  it("locks the draft row while it checks, so two reopenings cannot both write", async () => {
    const { service, prisma } = createService();

    await service.ensureEditGreeting("user-1", "edit-1", greeting);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    const sql = (prisma.$queryRaw.mock.calls[0][0] as string[]).join("");
    expect(sql).toContain("FOR UPDATE");
    expect(sql).toContain('"replacesRoadmapId" IS NOT NULL');
  });
});

describe("ProfessionalRoadmapDraftService reset of an edit", () => {
  it("refuses to reset a draft that edits a roadmap", async () => {
    const { service, prisma } = createService();
    prisma.$queryRaw.mockResolvedValue([
      { id: "edit-1", status: "READY", replacesRoadmapId: "roadmap-1" },
    ]);

    await expect(service.resetInPlace("user-1", "edit-1")).resolves.toEqual({
      outcome: "edit",
    });
    expect(prisma.roadmapDraft.updateMany).not.toHaveBeenCalled();
    expect(prisma.roadmapChatMessage.deleteMany).not.toHaveBeenCalled();
  });
});
