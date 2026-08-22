import { RoadmapChatRole, RoadmapDraftStep } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalRoadmapDraftService } from "./professional-roadmap-draft.service";

const createPrismaMock = () => ({
  roadmapDraft: {
    create: jest.fn().mockResolvedValue({ id: "draft-1" }),
    findFirst: jest.fn().mockResolvedValue({ id: "draft-1" }),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
