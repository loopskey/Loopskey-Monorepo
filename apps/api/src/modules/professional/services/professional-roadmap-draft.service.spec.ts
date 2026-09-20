import {
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
  },
});

const createService = (prisma = createPrismaMock()) => ({
  prisma,
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
