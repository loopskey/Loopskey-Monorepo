import {
  RoadmapDraftStatus,
  RoadmapEnrollmentStatus,
  RoadmapSource,
  RoadmapStepProgressStatus,
  Role,
} from "@prisma/client";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { ProfessionalRoadmapEditService } from "@professional/services/professional-roadmap-edit.service";
import { ProfessionalRoadmapChatService } from "@professional/services/professional-roadmap-chat.service";
import { INestApplication, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";
import { SERVICE_AI_PORT } from "@infrastructure/service-ai/service-ai.port";
import { bootApp, fulfilled, runTogether } from "../setup/concurrency";
import { suiteScope } from "../setup/concurrency";

import type { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";

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
      assistantMessage: "What would you like to learn?",
    },
  })),
};

const scope = suiteScope("roadmap-edit");

jest.setTimeout(120_000);

describe("Roadmap edit and regeneration (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let edit: ProfessionalRoadmapEditService;
  let chat: ProfessionalRoadmapChatService;
  let engagement: ProfessionalEngagementApi;
  let owner: TUser;
  let stranger: TUser;

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

  const stepsOf = (
    ...contentIds: (string | null)[]
  ): {
    order: number;
    title: string;
    contentId: string | null;
    contentType: "COURSE" | null;
  }[] =>
    contentIds.map((contentId, index) => ({
      order: index + 1,
      title: `Step ${index + 1}`,
      contentId,
      contentType: contentId ? "COURSE" : null,
    }));

  const seedRoadmap = async (
    user: TUser,
    contentIds: (string | null)[],
    overrides: { source?: RoadmapSource; ownerId?: string | null } = {},
  ) => {
    const draft = await prisma.roadmapDraft.create({
      data: {
        userId: user.id,
        status: RoadmapDraftStatus.COMPLETED,
        goal: "Become a platform engineer",
        subjects: [],
      },
    });
    const roadmap = await prisma.roadmap.create({
      data: {
        slug: scope.eventSlug("roadmap"),
        title: `${scope.eventTitle("Roadmap")} ${Math.random()}`,
        description: "A generated plan.",
        source: overrides.source ?? RoadmapSource.GENERATED,
        ownerId: overrides.ownerId === undefined ? user.id : overrides.ownerId,
        phases: {
          create: [
            {
              order: 1,
              title: "Foundations",
              steps: { create: stepsOf(...contentIds) },
            },
          ],
        },
      },
      include: {
        phases: { include: { steps: { orderBy: { order: "asc" } } } },
      },
    });
    const enrollment = await prisma.roadmapEnrollment.create({
      data: { userId: user.id, roadmapId: roadmap.id, draftId: draft.id },
    });
    return { draft, roadmap, enrollment, steps: roadmap.phases[0].steps };
  };

  const openEdits = (roadmapId: string) =>
    prisma.roadmapDraft.findMany({
      where: { replacesRoadmapId: roadmapId },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp((builder) =>
      builder.overrideProvider(SERVICE_AI_PORT).useValue(fakeAi),
    ));
    edit = app.get(ProfessionalRoadmapEditService);
    chat = app.get(ProfessionalRoadmapChatService);
    engagement = app.get(PROFESSIONAL_ENGAGEMENT_API);
    await scope.cleanup(prisma);
    owner = await professional("owner");
    stranger = await professional("stranger");
  });

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  });

  describe("starting an edit", () => {
    it("copies the saved brief into one ready draft that points at the roadmap", async () => {
      const { roadmap, draft } = await seedRoadmap(owner, ["course-a"]);
      await prisma.roadmapDraft.update({
        where: { id: draft.id },
        data: { goal: "Lead the data team", context: "Ten years in BI" },
      });

      const view = await edit.startEdit(owner, roadmap.id);

      expect(view?.replacesRoadmapId).toBe(roadmap.id);
      expect(view?.replacesRoadmapTitle).toBe(roadmap.title);
      expect(view?.goal).toBe("Lead the data team");
      expect(view?.context).toBe("Ten years in BI");
      expect(view?.status).toBe(RoadmapDraftStatus.READY);
      expect(view?.id).not.toBe(draft.id);

      const source = await prisma.roadmapDraft.findUniqueOrThrow({
        where: { id: draft.id },
      });
      expect(source.status).toBe(RoadmapDraftStatus.COMPLETED);
    });

    it("returns the same draft when the edit is started again", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);

      const first = await edit.startEdit(owner, roadmap.id);
      const second = await edit.startEdit(owner, roadmap.id);

      expect(second?.id).toBe(first?.id);
      expect(await openEdits(roadmap.id)).toHaveLength(1);
    });

    it("leaves exactly one open edit when many start at the same instant", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);

      const results = await runTogether(8, () =>
        edit.startEdit(owner, roadmap.id),
      );

      const ids = new Set(fulfilled(results).map((r) => r.value?.id));
      expect(fulfilled(results)).toHaveLength(8);
      expect(ids.size).toBe(1);
      expect(await openEdits(roadmap.id)).toHaveLength(1);
    });

    it("lets a discarded edit be started afresh", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);
      const first = await edit.startEdit(owner, roadmap.id);

      expect(await edit.discardEdit(owner, first!.id)).toBe(true);
      expect(await edit.discardEdit(owner, first!.id)).toBe(false);
      const second = await edit.startEdit(owner, roadmap.id);

      expect(second?.id).not.toBe(first?.id);
      expect(await openEdits(roadmap.id)).toHaveLength(1);
    });

    it("never turns an edit into the draft the new-roadmap coach resumes", async () => {
      const user = await professional("coach");
      const { roadmap } = await seedRoadmap(user, ["course-a"]);
      const editing = await edit.startEdit(user, roadmap.id);

      const fresh = await chat.startDraft(user);

      expect(fresh.id).not.toBe(editing?.id);
      expect(fresh.replacesRoadmapId ?? null).toBeNull();
      expect((await chat.draft(user))?.id).toBe(fresh.id);
    });

    it("will not edit a roadmap the professional is not enrolled in", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);

      await expect(edit.startEdit(stranger, roadmap.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(await openEdits(roadmap.id)).toHaveLength(0);
    });

    it("will not edit a catalog roadmap", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"], {
        source: RoadmapSource.CATALOG,
        ownerId: null,
      });

      await expect(edit.startEdit(owner, roadmap.id)).rejects.toThrow(
        "ROADMAP_NOT_EDITABLE",
      );
      expect(await openEdits(roadmap.id)).toHaveLength(0);
    });

    it("will not discard somebody else's edit", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);
      const draft = await edit.startEdit(owner, roadmap.id);

      expect(await edit.discardEdit(stranger, draft!.id)).toBe(false);
      expect(await openEdits(roadmap.id)).toHaveLength(1);
    });

    it("will not discard an edit that is already generating", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);
      const draft = await edit.startEdit(owner, roadmap.id);
      await prisma.roadmapDraft.update({
        where: { id: draft!.id },
        data: { status: RoadmapDraftStatus.GENERATING },
      });

      expect(await edit.discardEdit(owner, draft!.id)).toBe(false);
      expect(await openEdits(roadmap.id)).toHaveLength(1);
    });

    it("allows a new edit once the previous one has completed", async () => {
      const { roadmap } = await seedRoadmap(owner, ["course-a"]);
      const first = await edit.startEdit(owner, roadmap.id);
      await prisma.roadmapDraft.update({
        where: { id: first!.id },
        data: { status: RoadmapDraftStatus.COMPLETED },
      });

      const second = await edit.startEdit(owner, roadmap.id);

      expect(second?.id).not.toBe(first?.id);
    });
  });

  describe("replacing the enrollment", () => {
    const replace = async (
      user: TUser,
      from: { roadmapId: string; steps: { id: string }[] },
      steps: { id: string }[],
      carried: [number, number][],
    ) => {
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
                title: "Regenerated",
                steps: { create: stepsOf(...steps.map((_, i) => `next-${i}`)) },
              },
            ],
          },
        },
        include: {
          phases: { include: { steps: { orderBy: { order: "asc" } } } },
        },
      });
      const nextSteps = next.phases[0].steps;
      await prisma.$transaction((tx) =>
        engagement.createRoadmapEnrollment(
          {
            userId: user.id,
            draftId: draft.id,
            roadmapId: next.id,
            targetDate: null,
            replaces: {
              roadmapId: from.roadmapId,
              stepCount: nextSteps.length,
              carriedSteps: carried.map(([f, t]) => ({
                fromStepId: from.steps[f].id,
                toStepId: nextSteps[t].id,
              })),
            },
          },
          tx,
        ),
      );
      const enrollment = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { draftId: draft.id },
        include: { stepProgress: true },
      });
      return { enrollment, nextSteps };
    };

    it("unenrolls the old roadmap and carries progress for the content that remains", async () => {
      const user = await professional("carry");
      const old = await seedRoadmap(user, ["a", "b", "c"]);
      const completedAt = new Date("2026-09-01T10:00:00Z");
      await prisma.roadmapStepProgress.createMany({
        data: [
          {
            enrollmentId: old.enrollment.id,
            stepId: old.steps[0].id,
            status: RoadmapStepProgressStatus.COMPLETED,
            completedAt,
          },
          {
            enrollmentId: old.enrollment.id,
            stepId: old.steps[1].id,
            status: RoadmapStepProgressStatus.IN_PROGRESS,
          },
        ],
      });

      const { enrollment, nextSteps } = await replace(
        user,
        { roadmapId: old.roadmap.id, steps: old.steps },
        old.steps,
        [
          [0, 1],
          [1, 2],
        ],
      );

      const retired = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { id: old.enrollment.id },
      });
      expect(retired.status).toBe(RoadmapEnrollmentStatus.UNENROLLED);
      expect(enrollment.status).toBe(RoadmapEnrollmentStatus.ACTIVE);

      const byStep = new Map(
        enrollment.stepProgress.map((record) => [record.stepId, record]),
      );
      expect(byStep.size).toBe(2);
      expect(byStep.get(nextSteps[1].id)?.status).toBe(
        RoadmapStepProgressStatus.COMPLETED,
      );
      expect(byStep.get(nextSteps[1].id)?.completedAt).toEqual(completedAt);
      expect(byStep.get(nextSteps[2].id)?.status).toBe(
        RoadmapStepProgressStatus.IN_PROGRESS,
      );
      expect(byStep.has(nextSteps[0].id)).toBe(false);
    });

    it("marks the new enrollment complete when every step was carried as completed", async () => {
      const user = await professional("complete");
      const old = await seedRoadmap(user, ["a", "b"]);
      await prisma.roadmapStepProgress.createMany({
        data: old.steps.map((step) => ({
          enrollmentId: old.enrollment.id,
          stepId: step.id,
          status: RoadmapStepProgressStatus.COMPLETED,
          completedAt: new Date(),
        })),
      });

      const { enrollment } = await replace(
        user,
        { roadmapId: old.roadmap.id, steps: old.steps },
        old.steps,
        [
          [0, 0],
          [1, 1],
        ],
      );

      expect(enrollment.status).toBe(RoadmapEnrollmentStatus.COMPLETED);
      expect(enrollment.completedAt).not.toBeNull();
    });

    it("prefers a completed record when two old steps map to one new step", async () => {
      const user = await professional("duplicate");
      const old = await seedRoadmap(user, ["a", "a"]);
      await prisma.roadmapStepProgress.createMany({
        data: [
          {
            enrollmentId: old.enrollment.id,
            stepId: old.steps[0].id,
            status: RoadmapStepProgressStatus.IN_PROGRESS,
          },
          {
            enrollmentId: old.enrollment.id,
            stepId: old.steps[1].id,
            status: RoadmapStepProgressStatus.COMPLETED,
            completedAt: new Date(),
          },
        ],
      });

      const { enrollment, nextSteps } = await replace(
        user,
        { roadmapId: old.roadmap.id, steps: old.steps },
        old.steps,
        [
          [0, 0],
          [1, 0],
        ],
      );

      expect(enrollment.stepProgress).toHaveLength(1);
      expect(enrollment.stepProgress[0]).toMatchObject({
        stepId: nextSteps[0].id,
        status: RoadmapStepProgressStatus.COMPLETED,
      });
    });

    it("creates a plain enrollment and carries nothing when the old one was already unenrolled", async () => {
      const user = await professional("gone");
      const old = await seedRoadmap(user, ["a"]);
      await prisma.roadmapStepProgress.create({
        data: {
          enrollmentId: old.enrollment.id,
          stepId: old.steps[0].id,
          status: RoadmapStepProgressStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
      await engagement.unenrollRoadmap({
        userId: user.id,
        enrollmentId: old.enrollment.id,
      });

      const { enrollment } = await replace(
        user,
        { roadmapId: old.roadmap.id, steps: old.steps },
        old.steps,
        [[0, 0]],
      );

      expect(enrollment.status).toBe(RoadmapEnrollmentStatus.ACTIVE);
      expect(enrollment.stepProgress).toHaveLength(0);
    });

    it("leaves another professional's enrollment alone", async () => {
      const user = await professional("mine");
      const other = await professional("theirs");
      const old = await seedRoadmap(user, ["a"]);
      const theirs = await prisma.roadmapEnrollment.create({
        data: {
          userId: other.id,
          roadmapId: old.roadmap.id,
          draftId: (
            await prisma.roadmapDraft.create({
              data: { userId: other.id, status: RoadmapDraftStatus.COMPLETED },
            })
          ).id,
        },
      });

      await replace(
        user,
        { roadmapId: old.roadmap.id, steps: old.steps },
        old.steps,
        [[0, 0]],
      );

      const untouched = await prisma.roadmapEnrollment.findUniqueOrThrow({
        where: { id: theirs.id },
      });
      expect(untouched.status).toBe(RoadmapEnrollmentStatus.ACTIVE);
    });
  });
});
