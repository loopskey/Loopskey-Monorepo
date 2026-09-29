import { RoadmapChatRole, RoadmapDraftStatus, Role } from "@prisma/client";
import { RoadmapDraftStep, Prisma } from "@prisma/client";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp, runTogether, suiteScope } from "../setup/concurrency";

const scope = suiteScope("roadmap-chat-message");

/**
 * The roadmap chat service only serializes turns for the same draft within
 * one API instance; across instances, two near-simultaneous turns can each
 * read the same "last assistant message" and both decide it needs to be
 * appended, producing a visible duplicate question in the transcript.
 * `appendAssistantMessageIfNew` closes that gap with a row lock on the draft,
 * so this drives concurrent callers directly — bypassing the in-process
 * serializer entirely — to prove the row lock, not the serializer, is what
 * holds.
 */
describe("Roadmap chat message append (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let draftService: ProfessionalRoadmapDraftService;
  let userId: string;

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    draftService = app.get(ProfessionalRoadmapDraftService);
    await scope.cleanup(prisma);

    const user = await prisma.user.create({
      data: {
        email: scope.email("owner"),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    userId = user.id;
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  const seedDraft = async () =>
    prisma.roadmapDraft.create({
      data: {
        userId,
        status: RoadmapDraftStatus.COLLECTING,
        goal: "Become a data platform lead",
      },
    });

  it("converges on one assistant message when the same question races itself", async () => {
    const draft = await seedDraft();

    const results = await runTogether(8, () =>
      draftService.appendAssistantMessageIfNew(userId, draft.id, {
        content: "ROADMAP_COACH_QUESTION",
        stepKey: RoadmapDraftStep.GOAL_REASON,
        widget: Prisma.JsonNull,
      }),
    );

    expect(results.every((result) => result.status === "fulfilled")).toBe(
      true,
    );

    const messages = await prisma.roadmapChatMessage.findMany({
      where: { draftId: draft.id, role: RoadmapChatRole.ASSISTANT },
    });
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("ROADMAP_COACH_QUESTION");
  }, 60_000);

  it("still appends a genuinely different question after the first is recorded", async () => {
    const draft = await seedDraft();

    await draftService.appendAssistantMessageIfNew(userId, draft.id, {
      content: "ROADMAP_COACH_QUESTION",
      stepKey: RoadmapDraftStep.GOAL_REASON,
      widget: Prisma.JsonNull,
    });
    await draftService.appendAssistantMessageIfNew(userId, draft.id, {
      content: "ROADMAP_COACH_QUESTION",
      stepKey: RoadmapDraftStep.CONTEXT,
      widget: Prisma.JsonNull,
    });

    const messages = await prisma.roadmapChatMessage.findMany({
      where: { draftId: draft.id, role: RoadmapChatRole.ASSISTANT },
      orderBy: { createdAt: "asc" },
    });
    expect(messages).toHaveLength(2);
    expect(messages[0].stepKey).toBe(RoadmapDraftStep.GOAL_REASON);
    expect(messages[1].stepKey).toBe(RoadmapDraftStep.CONTEXT);
  }, 60_000);
});
