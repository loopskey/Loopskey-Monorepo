import { RoadmapChatRole, RoadmapDraftStatus, Role } from "@prisma/client";
import { RoadmapDraftStep } from "@prisma/client";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { INestApplication, NotFoundException } from "@nestjs/common";
import { HttpException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { SERVICE_AI_PORT } from "@infrastructure/service-ai/service-ai.port";
import { bootApp, runTogether, suiteScope } from "../setup/concurrency";

const FIRST_QUESTION = "What would you like to learn?";

const fakeAi = {
  generate: jest.fn(),
  chatTurn: jest.fn(async () => ({
    ok: true,
    data: {
      widget: null,
      extracted: {},
      isComplete: false,
      clearedFields: [],
      needsClarification: false,
      suggestedNextSection: null,
      assistantMessage: FIRST_QUESTION,
    },
  })),
};

const scope = suiteScope("roadmap-reset");

/**
 * Reset targets the exact draft on screen and rewrites it in place — same id,
 * status forced back to `COLLECTING`, transcript replaced by the AI's first
 * question. The row lock in `resetInPlace` is what has to hold under
 * concurrency: two callers racing the same draft must not leave a duplicated
 * transcript or more than one resolved state behind.
 */
describe("Roadmap draft reset (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let chatService: ProfessionalRoadmapChatService;
  let user: TUser;
  let stranger: TUser;

  beforeAll(async () => {
    ({ app, prisma } = await bootApp((builder) =>
      builder.overrideProvider(SERVICE_AI_PORT).useValue(fakeAi),
    ));
    chatService = app.get(ProfessionalRoadmapChatService);
    await scope.cleanup(prisma);

    const createdUser = await prisma.user.create({
      data: {
        email: scope.email("owner"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    user = { id: createdUser.id, role: Role.PROFESSIONAL } as TUser;

    const createdStranger = await prisma.user.create({
      data: {
        email: scope.email("stranger"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    stranger = { id: createdStranger.id, role: Role.PROFESSIONAL } as TUser;
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  const seedDraft = async (overrides: Record<string, unknown> = {}) => {
    const draft = await prisma.roadmapDraft.create({
      data: {
        userId: user.id,
        status: RoadmapDraftStatus.FAILED,
        failureReason: "NO_CANDIDATES",
        goal: "Become a data lead",
        ...overrides,
      },
    });
    await prisma.roadmapChatMessage.create({
      data: {
        draftId: draft.id,
        role: RoadmapChatRole.PROFESSIONAL,
        stepKey: RoadmapDraftStep.GOAL,
        content: "the old answer that should disappear",
      },
    });
    return draft;
  };

  it("resets a failed draft in place: same id, fresh status, the AI's first question", async () => {
    const draft = await seedDraft();

    const view = await chatService.resetDraft(user, draft.id);

    expect(view.id).toBe(draft.id);
    expect(view.goal).toBeNull();
    expect(view.status).toBe(RoadmapDraftStatus.COLLECTING);
    expect(view.failure).toBeNull();

    const messages = await prisma.roadmapChatMessage.findMany({
      where: { draftId: draft.id },
      orderBy: { createdAt: "asc" },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      role: RoadmapChatRole.ASSISTANT,
      content: FIRST_QUESTION,
    });
  }, 60_000);

  it("converges on one canonical transcript under concurrent resets", async () => {
    const draft = await seedDraft();

    const results = await runTogether(8, () =>
      chatService.resetDraft(user, draft.id),
    );

    expect(results.every((result) => result.status === "fulfilled")).toBe(true);

    const final = await prisma.roadmapDraft.findUniqueOrThrow({
      where: { id: draft.id },
    });
    expect(final.status).toBe(RoadmapDraftStatus.COLLECTING);

    const messages = await prisma.roadmapChatMessage.findMany({
      where: { draftId: draft.id },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe(FIRST_QUESTION);
  }, 60_000);

  it("rejects resetting another professional's draft as not found", async () => {
    const draft = await seedDraft();

    await expect(
      chatService.resetDraft(stranger, draft.id),
    ).rejects.toBeInstanceOf(NotFoundException);

    const messages = await prisma.roadmapChatMessage.findMany({
      where: { draftId: draft.id },
    });
    expect(messages).toHaveLength(1);
  }, 60_000);

  it("rejects resetting a draft that is generating", async () => {
    const draft = await seedDraft({
      status: RoadmapDraftStatus.GENERATING,
      failureReason: null,
    });

    await expect(chatService.resetDraft(user, draft.id)).rejects.toBeInstanceOf(
      HttpException,
    );

    const unchanged = await prisma.roadmapDraft.findUniqueOrThrow({
      where: { id: draft.id },
    });
    expect(unchanged.status).toBe(RoadmapDraftStatus.GENERATING);
  }, 60_000);

  it("rejects resetting a completed draft", async () => {
    const draft = await seedDraft({
      status: RoadmapDraftStatus.COMPLETED,
      failureReason: null,
    });

    await expect(chatService.resetDraft(user, draft.id)).rejects.toBeInstanceOf(
      HttpException,
    );
  }, 60_000);
});
