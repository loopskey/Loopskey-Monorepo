import {
  CourseStatus,
  LearningBudgetPreference,
  LearningTimeCommitment,
  ProfileTaxonomyKind,
  RoadmapChatRole,
  RoadmapDraftStatus,
  RoadmapDraftStep,
  RoadmapEnrollmentStatus,
  RoadmapSource,
  RoadmapStepProgressStatus,
  Role,
  SkillLevel,
} from "@prisma/client";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { RoadmapProgressNotPreservedError } from "@contentAction/public/professional-engagement-api";
import { ProfessionalRoadmapGenerationService } from "@professional/services/professional-roadmap-generation.service";
import { ProfessionalRoadmapProgressService } from "@professional/services/professional-roadmap-progress.service";
import { ProfessionalRoadmapEditService } from "@professional/services/professional-roadmap-edit.service";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import { INestApplication, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { SERVICE_AI_PORT } from "@infrastructure/service-ai/service-ai.port";
import { bootApp, fulfilled, runTogether } from "../setup/concurrency";
import { suiteScope } from "../setup/concurrency";

import type {
  EditTurnData,
  EditTurnInput,
  GenerateData,
  GenerateInput,
  RegenerateInput,
  RoadmapChangeOperation,
} from "@infrastructure/service-ai/service-ai.port";
import type { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";

const PRACTICE_TITLE = "Mini Python practice project";

const editReply = (
  changeOperations: RoadmapChangeOperation[],
  overrides: Partial<EditTurnData> = {},
): { ok: true; data: EditTurnData } => ({
  ok: true,
  data: {
    assistantMessage: "I will make the first phase project based.",
    needsClarification: false,
    isReadyToRegenerate: true,
    widget: null,
    extracted: {},
    clearedFields: [],
    changeOperations,
    ...overrides,
  },
});

const keepEverything = (input: RegenerateInput): GenerateData => {
  const phases = input.currentRoadmap.phases.map((phase, index) => {
    const kept = phase.steps
      .filter((step) => step.contentId && step.contentType)
      .map((step, position) => ({
        order: position + 1,
        title: step.title,
        description: "Kept from the earlier roadmap.",
        contentId: step.contentId,
        contentType: step.contentType,
        estimatedMinutes: 60,
      }));
    const steps =
      index === 0
        ? [
            ...kept,
            {
              order: kept.length + 1,
              title: PRACTICE_TITLE,
              description: "Build something small with what you learned.",
              contentId: null,
              contentType: null,
              estimatedMinutes: 120,
            },
          ]
        : kept;
    return {
      order: index + 1,
      title: index === 0 ? "Learn by building" : phase.title,
      description: "Regenerated.",
      estimatedWeeks: phase.estimatedWeeks,
      steps,
    };
  });
  return {
    title: "Python, project first",
    description: "A regenerated plan.",
    level: "BEGINNER",
    coverageNote: null,
    estimatedWeeks: phases.reduce(
      (sum, phase) => sum + phase.estimatedWeeks,
      0,
    ),
    phases,
  };
};

const dropContent = (contentId: string) => (input: RegenerateInput) => {
  const roadmap = keepEverything(input);
  const phases = roadmap.phases.map((phase) => ({
    ...phase,
    steps: phase.steps
      .filter((step) => step.contentId !== contentId)
      .map((step, position) => ({ ...step, order: position + 1 })),
  }));
  return { ...roadmap, phases };
};

const fakeAi = {
  chatTurn: jest.fn(async () => ({
    ok: true,
    data: {
      widget: null,
      extracted: {},
      isComplete: false,
      clearedFields: [],
      needsClarification: false,
      suggestedNextSection: null,
      assistantMessage: "What would you like to learn?",
    },
  })),
  editTurn: jest.fn(async (_input: EditTurnInput) => editReply([])),
  regenerate: jest.fn(async (input: RegenerateInput) => ({
    ok: true,
    data: keepEverything(input),
  })),
  generate: jest.fn(async (input: GenerateInput) => ({
    ok: true,
    data: {
      title: "Python from scratch",
      description: "A new plan.",
      level: "BEGINNER",
      coverageNote: null,
      estimatedWeeks: 2,
      phases: [
        {
          order: 1,
          title: "Start",
          description: "Begin.",
          estimatedWeeks: 2,
          steps: [
            {
              order: 1,
              title: input.candidates[0].title,
              description: "Work through it.",
              contentId: input.candidates[0].contentId,
              contentType: input.candidates[0].contentType,
              estimatedMinutes: 60,
            },
          ],
        },
      ],
    } satisfies GenerateData,
  })),
};

const scope = suiteScope("roadmap-regenerate");

jest.setTimeout(180_000);

describe("Roadmap conversational edit and regeneration (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let edit: ProfessionalRoadmapEditService;
  let chat: ProfessionalRoadmapChatService;
  let generation: ProfessionalRoadmapGenerationService;
  let progress: ProfessionalRoadmapProgressService;
  let engagement: ProfessionalEngagementApi;
  let subjectId: string;
  let subjectLabel: string;
  let groupId: string;

  const professional = async (label: string) => {
    const created = await prisma.user.create({
      data: {
        email: scope.email(label),
        role: Role.PROFESSIONAL,
        status: "ACTIVE",
      },
    });
    return { id: created.id, role: Role.PROFESSIONAL } as TUser;
  };

  const brief = () => ({
    goal: "Become a Python developer",
    skillLevel: SkillLevel.BEGINNER,
    timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
    budgetPreference: LearningBudgetPreference.UNDER_100,
    subjects: [subjectId],
    cpdEnabled: false,
    cpdAnswered: true,
  });

  const seedRoadmap = async (user: TUser) => {
    const source = await prisma.roadmapDraft.create({
      data: {
        userId: user.id,
        status: RoadmapDraftStatus.COMPLETED,
        ...brief(),
      },
    });
    await prisma.roadmapChatMessage.createMany({
      data: [
        {
          draftId: source.id,
          role: RoadmapChatRole.PROFESSIONAL,
          content: "I want to learn Python",
          stepKey: RoadmapDraftStep.GOAL,
          createdAt: new Date("2026-09-01T10:00:00.000Z"),
        },
        {
          draftId: source.id,
          role: RoadmapChatRole.ASSISTANT,
          content: "Great, how much time do you have?",
          stepKey: RoadmapDraftStep.PREFERENCES,
          createdAt: new Date("2026-09-01T10:00:01.000Z"),
        },
      ],
    });
    const roadmap = await prisma.roadmap.create({
      data: {
        slug: scope.eventSlug("roadmap"),
        title: scope.eventTitle("Python basics"),
        description: "The first plan.",
        source: RoadmapSource.GENERATED,
        ownerId: user.id,
        phases: {
          create: [
            {
              order: 1,
              title: "Basics",
              estimatedWeeks: 3,
              steps: {
                create: [
                  {
                    order: 1,
                    title: "Intro",
                    contentId: "course-a",
                    contentType: "COURSE",
                  },
                  {
                    order: 2,
                    title: "Control flow",
                    contentId: "course-b",
                    contentType: "COURSE",
                  },
                  {
                    order: 3,
                    title: "Drills",
                    contentId: "course-c",
                    contentType: "COURSE",
                  },
                ],
              },
            },
            {
              order: 2,
              title: "Data",
              estimatedWeeks: 4,
              steps: {
                create: [
                  {
                    order: 1,
                    title: "Pandas",
                    contentId: "yt-a",
                    contentType: "YOUTUBE",
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        phases: {
          orderBy: { order: "asc" },
          include: { steps: { orderBy: { order: "asc" } } },
        },
      },
    });
    const enrollment = await prisma.roadmapEnrollment.create({
      data: { userId: user.id, roadmapId: roadmap.id, draftId: source.id },
    });
    const [intro, flow] = roadmap.phases[0].steps;
    await prisma.roadmapStepProgress.createMany({
      data: [
        {
          enrollmentId: enrollment.id,
          stepId: intro.id,
          status: RoadmapStepProgressStatus.COMPLETED,
          completedAt: new Date("2026-09-10T10:00:00.000Z"),
        },
        {
          enrollmentId: enrollment.id,
          stepId: flow.id,
          status: RoadmapStepProgressStatus.IN_PROGRESS,
        },
      ],
    });
    return { source, roadmap, enrollment, phases: roadmap.phases };
  };

  const openEdit = async (user: TUser, roadmapId: string) => {
    const view = await edit.startEdit(user, roadmapId);
    if (!view) throw new Error("The edit did not open.");
    return view;
  };

  const settled = async (draftId: string) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const draft = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: draftId },
      });
      if (draft.status !== RoadmapDraftStatus.GENERATING) return draft;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Draft ${draftId} never left GENERATING.`);
  };

  const confirmedEdit = async (
    user: TUser,
    roadmapId: string,
    phaseId: string,
  ) => {
    const opened = await openEdit(user, roadmapId);
    fakeAi.editTurn.mockResolvedValueOnce(
      editReply([
        {
          operation: "MODIFY_PHASE",
          targetId: phaseId,
          instruction: "Make the first phase project based.",
        },
      ]),
    );
    await chat.chatTurn(user, {
      draftId: opened.id,
      message: "Make the first phase more project-based.",
    });
    return opened.id;
  };

  beforeAll(async () => {
    ({ app, prisma } = await bootApp((builder) =>
      builder.overrideProvider(SERVICE_AI_PORT).useValue(fakeAi),
    ));
    edit = app.get(ProfessionalRoadmapEditService);
    chat = app.get(ProfessionalRoadmapChatService);
    generation = app.get(ProfessionalRoadmapGenerationService);
    progress = app.get(ProfessionalRoadmapProgressService);
    engagement = app.get(PROFESSIONAL_ENGAGEMENT_API);
    await scope.cleanup(prisma);

    const token = scope.eventSlug("subject");
    subjectLabel = `Pythonish ${token}`;
    const group = await prisma.profileTaxonomyGroup.create({
      data: {
        kind: ProfileTaxonomyKind.SUBJECT,
        key: `g-${token}`,
        label: "E2E subjects",
      },
    });
    groupId = group.id;
    const term = await prisma.profileTaxonomyTerm.create({
      data: {
        kind: ProfileTaxonomyKind.SUBJECT,
        key: `t-${token}`,
        label: subjectLabel,
        groupId,
      },
    });
    subjectId = term.id;
  });

  beforeEach(() => {
    fakeAi.editTurn.mockClear();
    fakeAi.regenerate.mockClear();
    fakeAi.generate.mockClear();
    fakeAi.regenerate.mockImplementation(async (input: RegenerateInput) => ({
      ok: true,
      data: keepEverything(input),
    }));
  });

  afterAll(async () => {
    if (prisma) {
      await scope.cleanup(prisma);
      await prisma.course.deleteMany({
        where: { slug: { startsWith: "roadmap-regenerate-" } },
      });
      await prisma.profileTaxonomyTerm.deleteMany({ where: { groupId } });
      await prisma.profileTaxonomyGroup.deleteMany({ where: { id: groupId } });
    }
    await app?.close();
  });

  describe("opening an edit", () => {
    it("greets once, however many times the edit is opened at the same instant", async () => {
      const user = await professional("greet");
      const { roadmap } = await seedRoadmap(user);

      const results = await runTogether(4, () => openEdit(user, roadmap.id));

      const ids = new Set(fulfilled(results).map((result) => result.value.id));
      expect(ids.size).toBe(1);
      const [draftId] = [...ids];
      const greetings = await prisma.roadmapChatMessage.findMany({
        where: { draftId, content: "ROADMAP_COACH_EDIT_GREETING" },
      });
      expect(greetings).toHaveLength(1);

      await openEdit(user, roadmap.id);
      expect(
        await prisma.roadmapChatMessage.count({
          where: { draftId, content: "ROADMAP_COACH_EDIT_GREETING" },
        }),
      ).toBe(1);
    });

    it("shows the original conversation without copying it into the edit", async () => {
      const user = await professional("history");
      const stranger = await professional("history-stranger");
      const { roadmap, source } = await seedRoadmap(user);
      const opened = await openEdit(user, roadmap.id);

      const page = await chat.history(user, opened.id);

      expect(page.items.map((message) => message.content)).toEqual([
        "I want to learn Python",
        "Great, how much time do you have?",
      ]);
      expect(page.items.every((message) => message.draftId === source.id)).toBe(
        true,
      );
      expect(
        await prisma.roadmapChatMessage.count({
          where: { draftId: opened.id },
        }),
      ).toBe(1);
      await expect(chat.history(stranger, opened.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("talking about the change", () => {
    it("sends the real roadmap and progress, and replaces the remembered changes on every turn", async () => {
      const user = await professional("turns");
      const { roadmap, phases } = await seedRoadmap(user);
      const opened = await openEdit(user, roadmap.id);
      const [first, second] = phases;

      fakeAi.editTurn.mockResolvedValueOnce(
        editReply([
          {
            operation: "MODIFY_PHASE",
            targetId: first.id,
            instruction: "Project based.",
          },
          {
            operation: "REMOVE_STEP",
            targetId: second.steps[0].id,
            instruction: "Drop pandas.",
          },
        ]),
      );
      await chat.chatTurn(user, {
        draftId: opened.id,
        message: "Project based, and drop pandas.",
      });

      const sent = fakeAi.editTurn.mock.calls[0][0];
      expect(sent.currentRoadmap.phases.map((phase) => phase.phaseId)).toEqual([
        first.id,
        second.id,
      ]);
      expect(
        sent.currentRoadmap.phases[0].steps.map((step) => step.progress),
      ).toEqual(["COMPLETED", "IN_PROGRESS", null]);

      fakeAi.editTurn.mockResolvedValueOnce(
        editReply([
          {
            operation: "MODIFY_PHASE",
            targetId: first.id,
            instruction: "Project based.",
          },
        ]),
      );
      await chat.chatTurn(user, {
        draftId: opened.id,
        message: "Actually keep pandas.",
      });

      expect(fakeAi.editTurn.mock.calls[1][0].pendingChanges).toHaveLength(2);
      const stored = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: opened.id },
      });
      expect(stored.pendingChanges).toEqual([
        {
          operation: "MODIFY_PHASE",
          targetId: first.id,
          instruction: "Project based.",
        },
      ]);
      expect(stored.readyToRegenerate).toBe(true);
      expect(fakeAi.regenerate).not.toHaveBeenCalled();
    });

    it("drops a change aimed at another professional's roadmap", async () => {
      const user = await professional("foreign");
      const other = await professional("foreign-other");
      const { roadmap } = await seedRoadmap(user);
      const { phases: foreign } = await seedRoadmap(other);
      const opened = await openEdit(user, roadmap.id);

      fakeAi.editTurn.mockResolvedValueOnce(
        editReply([
          {
            operation: "MODIFY_PHASE",
            targetId: foreign[0].id,
            instruction: "Rewrite it.",
          },
        ]),
      );
      await chat.chatTurn(user, { draftId: opened.id, message: "Change it." });

      const stored = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: opened.id },
      });
      expect(stored.pendingChanges).toEqual([]);
      const notices = await prisma.roadmapChatMessage.findMany({
        where: { draftId: opened.id, role: RoadmapChatRole.SYSTEM },
        select: { content: true },
      });
      expect(notices.map((notice) => notice.content)).toEqual([
        "ROADMAP_EDIT_CHANGE_REJECTED:UNMATCHED",
      ]);
    });
  });

  describe("regenerating", () => {
    it("goes through the outbox to the regenerate endpoint and carries completed and in-progress progress", async () => {
      const user = await professional("regenerate");
      const { roadmap, enrollment, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);

      const results = await runTogether(3, () =>
        generation.requestGeneration(user, draftId),
      );
      expect(fulfilled(results).length).toBeGreaterThanOrEqual(1);
      expect(
        await prisma.outboxEvent.count({
          where: { aggregateType: "RoadmapDraft", aggregateId: draftId },
        }),
      ).toBe(1);

      const done = await settled(draftId);
      expect(done.status).toBe(RoadmapDraftStatus.COMPLETED);
      expect(fakeAi.regenerate).toHaveBeenCalledTimes(1);
      expect(fakeAi.generate).not.toHaveBeenCalled();
      expect(fakeAi.regenerate.mock.calls[0][0]).toMatchObject({
        preservation: {
          completedSteps: true,
          inProgressSteps: true,
          unaffectedPhases: true,
        },
        changeOperations: [
          { operation: "MODIFY_PHASE", targetId: phases[0].id },
        ],
      });

      const retired = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
      });
      expect(retired.status).toBe(RoadmapEnrollmentStatus.UNENROLLED);
      expect(
        await prisma.roadmapStepProgress.count({
          where: { enrollmentId: enrollment.id },
        }),
      ).toBe(2);
      expect(await prisma.roadmap.count({ where: { id: roadmap.id } })).toBe(1);

      const replacement = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { draftId },
        include: {
          stepProgress: { include: { step: true } },
          roadmap: {
            include: {
              phases: {
                orderBy: { order: "asc" },
                include: { steps: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      });
      expect(replacement.status).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(
        replacement.stepProgress
          .map((record) => [record.step.contentId, record.status])
          .sort(),
      ).toEqual([
        ["course-a", RoadmapStepProgressStatus.COMPLETED],
        ["course-b", RoadmapStepProgressStatus.IN_PROGRESS],
      ]);
      expect(replacement.roadmap.phases[0].title).toBe("Learn by building");
      expect(
        replacement.roadmap.phases[0].steps.find(
          (step) => step.title === PRACTICE_TITLE,
        ),
      ).toMatchObject({ contentId: null, contentType: null });
      expect(await prisma.roadmapEnrollment.count({ where: { draftId } })).toBe(
        1,
      );
    });

    it("lets the learner track and complete an activity that has no catalog content", async () => {
      const user = await professional("practice");
      const { roadmap, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);
      await generation.requestGeneration(user, draftId);
      await settled(draftId);
      const replacement = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { draftId },
        include: {
          roadmap: { include: { phases: { include: { steps: true } } } },
        },
      });
      const practice = replacement.roadmap.phases
        .flatMap((phase) => phase.steps)
        .find((step) => step.title === PRACTICE_TITLE)!;

      await progress.startStep(user, replacement.id, practice.id);
      await progress.completeStep(user, replacement.id, practice.id);

      const record = await prisma.roadmapStepProgress.findUniqueOrThrow({
        where: {
          enrollmentId_stepId: {
            enrollmentId: replacement.id,
            stepId: practice.id,
          },
        },
      });
      expect(record.status).toBe(RoadmapStepProgressStatus.COMPLETED);
    });

    it("refuses to regenerate again while that activity holds progress, because it cannot be matched safely", async () => {
      const user = await professional("practice-again");
      const { roadmap, phases } = await seedRoadmap(user);
      const firstEdit = await confirmedEdit(user, roadmap.id, phases[0].id);
      await generation.requestGeneration(user, firstEdit);
      await settled(firstEdit);
      const replacement = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { draftId: firstEdit },
        include: {
          roadmap: {
            include: {
              phases: { orderBy: { order: "asc" }, include: { steps: true } },
            },
          },
        },
      });
      const practice = replacement.roadmap.phases[0].steps.find(
        (step) => step.title === PRACTICE_TITLE,
      )!;
      await progress.startStep(user, replacement.id, practice.id);

      const secondEdit = await confirmedEdit(
        user,
        replacement.roadmapId,
        replacement.roadmap.phases[1].id,
      );
      const view = await chat.draft(user, secondEdit);

      expect(view?.editBlockReason).toBe("PRESERVATION_UNSUPPORTED");
      expect(view?.blockedStepTitles).toEqual([PRACTICE_TITLE]);
      await expect(
        generation.requestGeneration(user, secondEdit),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(
        await prisma.outboxEvent.count({ where: { aggregateId: secondEdit } }),
      ).toBe(0);

      const history = await chat.history(user, secondEdit);
      expect(history.items.map((message) => message.content)).toContain(
        "I want to learn Python",
      );
      expect(history.items.map((message) => message.content)).toContain(
        "Make the first phase more project-based.",
      );
    });

    it("fails safely when the regenerated roadmap drops completed content, then succeeds on retry", async () => {
      const user = await professional("drop");
      const { roadmap, enrollment, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);
      fakeAi.regenerate.mockImplementationOnce(
        async (input: RegenerateInput) => ({
          ok: true,
          data: dropContent("course-a")(input),
        }),
      );

      await generation.requestGeneration(user, draftId);
      const failed = await settled(draftId);

      expect(failed.status).toBe(RoadmapDraftStatus.FAILED);
      expect(failed.failureReason).toBe(
        RoadmapGenerationViolation.PROTECTED_CONTENT_DROPPED,
      );
      expect(failed.pendingChanges).toHaveLength(1);
      const untouched = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { id: enrollment.id },
      });
      expect(untouched.status).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(
        await prisma.roadmapStepProgress.count({
          where: { enrollmentId: enrollment.id },
        }),
      ).toBe(2);
      expect(await prisma.roadmapEnrollment.count({ where: { draftId } })).toBe(
        0,
      );
      expect(await prisma.roadmap.count({ where: { ownerId: user.id } })).toBe(
        1,
      );

      await generation.requestGeneration(user, draftId);
      const retried = await settled(draftId);

      expect(retried.status).toBe(RoadmapDraftStatus.COMPLETED);
      expect(await prisma.roadmap.count({ where: { ownerId: user.id } })).toBe(
        2,
      );
      expect(await prisma.roadmapEnrollment.count({ where: { draftId } })).toBe(
        1,
      );
    });

    it("fails safely when an untouched phase loses its content", async () => {
      const user = await professional("untouched");
      const { roadmap, enrollment, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);
      fakeAi.regenerate.mockImplementationOnce(
        async (input: RegenerateInput) => ({
          ok: true,
          data: dropContent("yt-a")(input),
        }),
      );

      await generation.requestGeneration(user, draftId);
      const failed = await settled(draftId);

      expect(failed.failureReason).toBe(
        RoadmapGenerationViolation.UNAFFECTED_PHASE_CHANGED,
      );
      expect(
        (
          await prisma.roadmapEnrollment.findUniqueOrThrow({
            where: { id: enrollment.id },
          })
        ).status,
      ).toBe(RoadmapEnrollmentStatus.ACTIVE);
    });

    it("keeps the original roadmap and its progress when the provider fails for good", async () => {
      const user = await professional("provider-fails");
      const { roadmap, enrollment, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);
      fakeAi.regenerate.mockResolvedValueOnce({
        ok: false,
        kind: "failed",
        retryable: false,
        messageCode: "ROADMAP_AI_FAILED",
      } as never);

      await generation.requestGeneration(user, draftId);
      const failed = await settled(draftId);

      expect(failed.status).toBe(RoadmapDraftStatus.FAILED);
      expect(
        (
          await prisma.roadmapEnrollment.findUniqueOrThrow({
            where: { id: enrollment.id },
          })
        ).status,
      ).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(await prisma.roadmap.count({ where: { ownerId: user.id } })).toBe(
        1,
      );
    });
  });

  describe("committing the replacement", () => {
    it("rolls the whole replacement back when progress would be lost at commit time", async () => {
      const user = await professional("commit-guard");
      const { roadmap, enrollment, phases } = await seedRoadmap(user);
      const draft = await prisma.roadmapDraft.create({
        data: { userId: user.id, status: RoadmapDraftStatus.COMPLETED },
      });
      const next = await prisma.roadmap.create({
        data: {
          slug: scope.eventSlug("next"),
          title: scope.eventTitle("Next"),
          description: "Regenerated.",
          source: RoadmapSource.GENERATED,
          ownerId: user.id,
          phases: {
            create: [
              {
                order: 1,
                title: "Only",
                steps: {
                  create: [
                    {
                      order: 1,
                      title: "Intro",
                      contentId: "course-a",
                      contentType: "COURSE",
                    },
                  ],
                },
              },
            ],
          },
        },
        include: { phases: { include: { steps: true } } },
      });

      await expect(
        prisma.$transaction((tx) =>
          engagement.createRoadmapEnrollment(
            {
              userId: user.id,
              draftId: draft.id,
              roadmapId: next.id,
              targetDate: null,
              replaces: {
                roadmapId: roadmap.id,
                stepCount: 1,
                carriedSteps: [
                  {
                    fromStepId: phases[0].steps[0].id,
                    toStepId: next.phases[0].steps[0].id,
                  },
                ],
              },
            },
            tx,
          ),
        ),
      ).rejects.toBeInstanceOf(RoadmapProgressNotPreservedError);

      expect(
        (
          await prisma.roadmapEnrollment.findUniqueOrThrow({
            where: { id: enrollment.id },
          })
        ).status,
      ).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(
        await prisma.roadmapEnrollment.count({ where: { draftId: draft.id } }),
      ).toBe(0);
    });
  });

  describe("after the edit was applied", () => {
    const closed = {
      status: 409,
      response: { code: "ROADMAP_DRAFT_CLOSED" },
    };

    const applied = async (label: string) => {
      const user = await professional(label);
      const { roadmap, phases } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);
      await generation.requestGeneration(user, draftId);
      const done = await settled(draftId);
      expect(done.status).toBe(RoadmapDraftStatus.COMPLETED);
      const replacement = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { draftId },
      });
      return { user, oldRoadmapId: roadmap.id, draftId, replacement };
    };

    it("refuses every write to the used edit and leaves it as it was", async () => {
      const { user, draftId } = await applied("closed-writes");
      const before = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: draftId },
      });
      const messagesBefore = await prisma.roadmapChatMessage.count({
        where: { draftId },
      });
      fakeAi.editTurn.mockClear();

      await expect(
        chat.chatTurn(user, { draftId, message: "One more change." }),
      ).rejects.toMatchObject(closed);
      await expect(
        chat.patchDraft(user, { draftId, goal: "Something else" }),
      ).rejects.toMatchObject(closed);
      await expect(
        chat.patchCpdSetup(user, { draftId, organization: "Acme" }),
      ).rejects.toMatchObject(closed);
      await expect(edit.discardEdit(user, draftId)).rejects.toMatchObject(
        closed,
      );
      await expect(
        generation.requestGeneration(user, draftId),
      ).rejects.toMatchObject(closed);

      expect(fakeAi.editTurn).not.toHaveBeenCalled();
      const after = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: draftId },
      });
      expect(after).toMatchObject({
        status: RoadmapDraftStatus.COMPLETED,
        goal: before.goal,
        updatedAt: before.updatedAt,
      });
      expect(
        await prisma.roadmapChatMessage.count({ where: { draftId } }),
      ).toBe(messagesBefore);
      expect(
        await prisma.outboxEvent.count({
          where: { aggregateType: "RoadmapDraft", aggregateId: draftId },
        }),
      ).toBe(1);
    });

    it("keeps the used edit and its conversation readable", async () => {
      const { user, draftId } = await applied("closed-read");

      const view = await chat.draft(user, draftId);

      expect(view).toMatchObject({
        status: RoadmapDraftStatus.COMPLETED,
        canGenerate: false,
        editBlockReason: "NOT_EDITABLE",
      });
      expect(
        view?.transcript.items.map((message) => message.content),
      ).toContain("Make the first phase more project-based.");
    });

    it("no longer treats the replaced roadmap as editable, while the new one opens a fresh edit", async () => {
      const { user, oldRoadmapId, draftId, replacement } =
        await applied("closed-next");

      await expect(edit.startEdit(user, oldRoadmapId)).rejects.toThrow(
        NotFoundException,
      );
      const next = await openEdit(user, replacement.roadmapId);

      expect(next.id).not.toBe(draftId);
      expect(next.status).toBe(RoadmapDraftStatus.READY);
      expect(
        await prisma.roadmapChatMessage.count({
          where: { draftId: next.id, content: "ROADMAP_COACH_EDIT_GREETING" },
        }),
      ).toBe(1);
    });

    it("does not let an answer that arrives after the roadmap was regenerated reopen the edit", async () => {
      const user = await professional("closed-late");
      const { roadmap, phases } = await seedRoadmap(user);
      const opened = await openEdit(user, roadmap.id);
      fakeAi.editTurn.mockImplementationOnce(async () => {
        await prisma.roadmapDraft.update({
          where: { id: opened.id },
          data: { status: RoadmapDraftStatus.COMPLETED },
        });
        return editReply([
          {
            operation: "MODIFY_PHASE",
            targetId: phases[0].id,
            instruction: "Too late.",
          },
        ]);
      });

      await expect(
        chat.chatTurn(user, { draftId: opened.id, message: "Change it." }),
      ).rejects.toMatchObject(closed);

      const stored = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: opened.id },
      });
      expect(stored.status).toBe(RoadmapDraftStatus.COMPLETED);
      expect(stored.pendingChanges).toEqual([]);
    });
  });

  describe("discarding", () => {
    it("removes only the edit, never the roadmap, its progress or its conversation", async () => {
      const user = await professional("discard");
      const { roadmap, enrollment, phases, source } = await seedRoadmap(user);
      const draftId = await confirmedEdit(user, roadmap.id, phases[0].id);

      expect(await edit.discardEdit(user, draftId)).toBe(true);

      expect(await prisma.roadmapDraft.count({ where: { id: draftId } })).toBe(
        0,
      );
      expect(
        (
          await prisma.roadmapEnrollment.findUniqueOrThrow({
            where: { id: enrollment.id },
          })
        ).status,
      ).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(
        await prisma.roadmapStepProgress.count({
          where: { enrollmentId: enrollment.id },
        }),
      ).toBe(2);
      expect(
        await prisma.roadmapChatMessage.count({
          where: { draftId: source.id },
        }),
      ).toBe(2);
    });
  });

  describe("creating a new roadmap", () => {
    it("still goes through the generate endpoint, never regenerate", async () => {
      const user = await professional("create");
      await prisma.course.create({
        data: {
          slug: scope.eventSlug("course"),
          title: `${subjectLabel} for beginners`,
          instructor: "Fixture Instructor",
          description: "An introduction.",
          category: "TECHNOLOGY",
          status: CourseStatus.PUBLISHED,
          isFree: true,
        },
      });
      const draft = await prisma.roadmapDraft.create({
        data: {
          userId: user.id,
          status: RoadmapDraftStatus.READY,
          currentStep: RoadmapDraftStep.REVIEW,
          ...brief(),
          preferredContentTypes: ["COURSE"],
        },
      });

      await generation.requestGeneration(user, draft.id);
      const done = await settled(draft.id);

      expect(done.status).toBe(RoadmapDraftStatus.COMPLETED);
      expect(fakeAi.generate).toHaveBeenCalledTimes(1);
      expect(fakeAi.regenerate).not.toHaveBeenCalled();
      expect(
        await prisma.roadmapEnrollment.count({ where: { draftId: draft.id } }),
      ).toBe(1);
    });
  });
});
