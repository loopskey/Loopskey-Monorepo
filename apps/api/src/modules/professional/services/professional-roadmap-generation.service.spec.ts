import {
  DeliveryFormat,
  LearningBudgetPreference,
  LearningFormat,
  RoadmapDraftStatus,
  RoadmapDraftStep,
  Role,
  SkillLevel,
} from "@prisma/client";
import { Logger } from "@nestjs/common";
import { OutboxDeferral } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import {
  RoadmapAiMessageCode,
  SERVICE_AI_LIMITS,
} from "@infrastructure/service-ai/service-ai.port";
import type {
  GenerateData,
  ServiceAiPort,
} from "@infrastructure/service-ai/service-ai.port";
import { TUser } from "@common/types/user.types";

import { ProfessionalRoadmapCandidateService } from "@professional/services/professional-roadmap-candidate.service";
import { ProfessionalRoadmapGenerationService } from "@professional/services/professional-roadmap-generation.service";
import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import type { RankableCandidate } from "@professional/utils/roadmap-candidate-ranking.util";

const USER: TUser = { id: "user-1", role: Role.PROFESSIONAL } as TUser;

const candidate = (
  contentId: string,
  overrides: Partial<RankableCandidate> = {},
): RankableCandidate => ({
  contentId,
  contentType: "COURSE",
  title: contentId,
  summary: null,
  tags: [],
  isFree: true,
  credits: null,
  level: null,
  durationMinutes: null,
  rating: 0,
  ratingCount: 0,
  audience: 0,
  isFeatured: false,
  matchScore: 1,
  matchTier: "EXACT",
  isCloseMatch: false,
  ...overrides,
});

const draftRow = (overrides: Record<string, unknown> = {}) => ({
  id: "draft-1",
  userId: "user-1",
  status: RoadmapDraftStatus.READY,
  currentStep: RoadmapDraftStep.REVIEW,
  goal: "Become a platform engineer",
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: new Date("2027-01-01"),
  skillLevel: SkillLevel.BEGINNER,
  timeCommitment: "TWO_TO_THREE_HOURS",
  budgetPreference: LearningBudgetPreference.UNDER_100,
  subjects: ["kubernetes"],
  preferredFormats: [LearningFormat.COURSE],
  preferredContentTypes: [],
  preferredDeliveryFormats: [DeliveryFormat.ONLINE],
  cpdEnabled: false,
  cpdAnswered: true,
  certificationId: null,
  certificationName: null,
  certification: null,
  cpdPlan: null,
  cpdPlanId: null,
  requiredCredits: null,
  completedCredits: null,
  ...overrides,
});

const generatingDraft = (overrides: Record<string, unknown> = {}) =>
  draftRow({ status: RoadmapDraftStatus.GENERATING, ...overrides });

const generated = (overrides: Partial<GenerateData> = {}): GenerateData => ({
  title: "Platform engineering",
  description: "A generated plan.",
  estimatedWeeks: 4,
  level: "BEGINNER",
  coverageNote: null,
  phases: [
    {
      order: 1,
      title: "Foundations",
      description: "Start here.",
      estimatedWeeks: 4,
      steps: [
        {
          order: 1,
          title: "Learn the basics",
          description: "Work through it.",
          contentId: "course-1",
          contentType: "COURSE",
          estimatedMinutes: 60,
        },
      ],
    },
  ],
  ...overrides,
});

type Harness = ReturnType<typeof buildHarness>;

const buildHarness = (options: {
  draft?: Record<string, unknown> | null;
  completedDraft?: Record<string, unknown> | null;
  enrollment?: { id: string } | null;
  candidates?: RankableCandidate[];
  generate?: jest.Mock;
  activitySum?: number | null;
  subjectTerms?: { id: string; label: string; group?: { key: string } }[];
}) => {
  const tx = {
    roadmapDraft: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
    outboxEvent: { create: jest.fn().mockResolvedValue({}) },
  };

  // The roadmap and the enrollment are written through the owning modules'
  // contracts, so the assertions target those rather than Prisma delegates.
  const catalog = {
    createGeneratedRoadmap: jest.fn().mockResolvedValue({ id: "roadmap-1" }),
  };
  const engagement = {
    createRoadmapEnrollment: jest.fn().mockResolvedValue(undefined),
    archiveGeneratedRoadmapEnrollments: jest.fn().mockResolvedValue(undefined),
    hasRoadmapEnrollmentForDraft: jest
      .fn()
      .mockResolvedValue(Boolean(options.enrollment)),
  };

  const prisma = {
    $transaction: jest.fn((callback: (client: unknown) => unknown) =>
      Promise.resolve(callback(tx)),
    ),
    roadmapDraft: {
      // `generationStatus` with no id issues two distinct `findFirst` calls
      // (the latest completed draft, then the latest active one); the two
      // queries are told apart by their `status` filter shape so each test's
      // `draft`/`completedDraft` option reaches the right one.
      findFirst: jest.fn((args: { where?: { status?: unknown } } = {}) =>
        Promise.resolve(
          args.where?.status === RoadmapDraftStatus.COMPLETED
            ? (options.completedDraft ?? null)
            : (options.draft ?? null),
        ),
      ),
      findUnique: jest.fn().mockResolvedValue(options.draft ?? null),
      findUniqueOrThrow: jest.fn().mockResolvedValue(options.draft ?? {}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
    roadmapEnrollment: {
      findUnique: jest.fn().mockResolvedValue(options.enrollment ?? null),
    },
    pDUActivity: {
      aggregate: jest
        .fn()
        .mockResolvedValue({ _sum: { pdus: options.activitySum ?? null } }),
    },
    profileTaxonomyTerm: {
      findMany: jest.fn(
        async (args: { where: { id: { in: string[] } } }) =>
          options.subjectTerms ??
          args.where.id.in.map((id) => ({
            id,
            label: id,
            group: { key: "g" },
          })),
      ),
    },
  };

  const outbox = { append: jest.fn().mockResolvedValue({}) };
  const candidates = {
    build: jest
      .fn()
      .mockResolvedValue(options.candidates ?? [candidate("course-1")]),
  };
  const ai = {
    generate:
      options.generate ??
      jest.fn().mockResolvedValue({ ok: true, data: generated() }),
    chatTurn: jest.fn(),
  };

  const service = new ProfessionalRoadmapGenerationService(
    prisma as unknown as PrismaService,
    outbox as unknown as OutboxService,
    candidates as unknown as ProfessionalRoadmapCandidateService,
    ai as unknown as ServiceAiPort,
    catalog as never,
    engagement as never,
  );

  return { service, prisma, outbox, candidates, ai, tx, catalog, engagement };
};

const failureReasonOf = (harness: Harness) => {
  const call = harness.prisma.roadmapDraft.updateMany.mock.calls.find(
    (args) => args[0]?.data?.status === RoadmapDraftStatus.FAILED,
  );
  return call?.[0]?.data?.failureReason as string | undefined;
};

describe("ProfessionalRoadmapGenerationService", () => {
  describe("requestGeneration", () => {
    it("claims a ready draft and enqueues exactly one event", async () => {
      const harness = buildHarness({ draft: draftRow({ enrollment: null }) });

      await harness.service.requestGeneration(USER, "draft-1");

      expect(harness.outbox.append).toHaveBeenCalledTimes(1);
      expect(harness.tx.roadmapDraft.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: RoadmapDraftStatus.GENERATING,
          }),
        }),
      );
    });

    it("carries nothing but the identifier in the outbox payload", async () => {
      const harness = buildHarness({ draft: draftRow({ enrollment: null }) });

      await harness.service.requestGeneration(USER, "draft-1");

      const payload = harness.outbox.append.mock.calls[0][0].payload;
      expect(payload).toEqual({ draftId: "draft-1" });
      // The draft holds free text about the professional. None of it may sit in
      // an outbox row that operators and retries can read.
      expect(JSON.stringify(payload)).not.toContain("platform engineer");
    });

    it("does not enqueue a second event when the claim is lost", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          status: RoadmapDraftStatus.GENERATING,
        }),
      });
      harness.tx.roadmapDraft.updateMany.mockResolvedValue({ count: 0 });

      await harness.service.requestGeneration(USER, "draft-1");

      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("answers with the winning generation when the status read was stale", async () => {
      const harness = buildHarness({ draft: draftRow({ enrollment: null }) });
      harness.tx.roadmapDraft.updateMany.mockResolvedValue({ count: 0 });
      harness.prisma.roadmapDraft.findUniqueOrThrow.mockResolvedValue(
        generatingDraft(),
      );

      const result = await harness.service.requestGeneration(USER, "draft-1");

      expect(result.status).toBe(RoadmapDraftStatus.GENERATING);
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a lost claim when the draft is not generating", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          status: RoadmapDraftStatus.COLLECTING,
        }),
      });
      harness.tx.roadmapDraft.updateMany.mockResolvedValue({ count: 0 });
      harness.prisma.roadmapDraft.findUniqueOrThrow.mockResolvedValue(
        draftRow({ status: RoadmapDraftStatus.COLLECTING }),
      );

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a draft that is missing a field the provider requires", async () => {
      const harness = buildHarness({
        draft: draftRow({ enrollment: null, goal: null }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("lets a failed draft whose fields are still valid be requested again", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          status: RoadmapDraftStatus.FAILED,
          failureReason: "NO_CANDIDATES",
        }),
      });

      await harness.service.requestGeneration(USER, "draft-1");

      expect(harness.tx.roadmapDraft.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: {
              in: [RoadmapDraftStatus.READY, RoadmapDraftStatus.FAILED],
            },
          }),
          data: expect.objectContaining({
            status: RoadmapDraftStatus.GENERATING,
            failureReason: null,
          }),
        }),
      );
      expect(harness.outbox.append).toHaveBeenCalledTimes(1);
    });

    it("refuses a failed draft that has lost a required field", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          goal: null,
          status: RoadmapDraftStatus.FAILED,
          failureReason: "NO_CANDIDATES",
        }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("accepts an AI-ready draft even when its legacy sub-step is not review", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          status: RoadmapDraftStatus.READY,
          currentStep: RoadmapDraftStep.CPD_TRACKING,
        }),
      });

      await harness.service.requestGeneration(USER, "draft-1");

      expect(harness.outbox.append).toHaveBeenCalledTimes(1);
    });

    it("does not require optional interview fields from an AI-ready draft", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          targetRole: null,
          goalReason: null,
          context: null,
          targetDate: null,
          preferredFormats: [],
          preferredContentTypes: [],
          preferredDeliveryFormats: [],
        }),
      });

      await harness.service.requestGeneration(USER, "draft-1");

      expect(harness.outbox.append).toHaveBeenCalledTimes(1);
    });

    it("refuses a draft without a budget preference", async () => {
      const harness = buildHarness({
        draft: draftRow({ enrollment: null, budgetPreference: null }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a draft whose CPD question was never answered", async () => {
      const harness = buildHarness({
        draft: draftRow({ enrollment: null, cpdAnswered: false }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a draft that tracks CPD without a certification", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          cpdEnabled: true,
          certificationName: null,
        }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
    });

    it("refuses a legacy draft whose stored subjects are not in the taxonomy", async () => {
      const harness = buildHarness({
        draft: draftRow({
          enrollment: null,
          subjects: ["raw text from an old draft"],
        }),
        subjectTerms: [],
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a draft that already produced a roadmap", async () => {
      const harness = buildHarness({
        draft: draftRow({ enrollment: { id: "enrollment-1" } }),
      });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_READY");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });

    it("refuses a draft that belongs to somebody else", async () => {
      const harness = buildHarness({ draft: null });

      await expect(
        harness.service.requestGeneration(USER, "draft-1"),
      ).rejects.toThrow("ROADMAP_DRAFT_NOT_FOUND");
    });

    it("refuses an actor who is not a professional", async () => {
      const harness = buildHarness({ draft: draftRow() });

      await expect(
        harness.service.requestGeneration(
          { id: "user-1", role: Role.ADMIN } as TUser,
          "draft-1",
        ),
      ).rejects.toThrow("Only professional users");
      expect(harness.outbox.append).not.toHaveBeenCalled();
    });
  });

  describe("runGeneration", () => {
    it("writes the roadmap, its enrollment and the draft transition together", async () => {
      const harness = buildHarness({ draft: generatingDraft() });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledTimes(1);
      expect(harness.engagement.createRoadmapEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({
          draftId: "draft-1",
          roadmapId: "roadmap-1",
          targetDate: new Date("2027-01-01"),
        }),
        expect.anything(),
      );
      expect(harness.tx.roadmapDraft.updateMany).toHaveBeenCalledWith({
        where: { id: "draft-1", status: RoadmapDraftStatus.GENERATING },
        data: { status: RoadmapDraftStatus.COMPLETED, failureReason: null },
      });
    });

    it("archives any previously-active generated roadmap for the same user", async () => {
      const harness = buildHarness({ draft: generatingDraft() });

      await harness.service.runGeneration("draft-1");

      expect(
        harness.engagement.archiveGeneratedRoadmapEnrollments,
      ).toHaveBeenCalledWith({ userId: "user-1" }, expect.anything());
    });

    it("owns the roadmap and marks it generated so explore never shows it", async () => {
      const harness = buildHarness({ draft: generatingDraft() });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: "user-1" }),
        expect.anything(),
      );
    });

    it("writes nothing when a redelivered event finds an enrollment", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        enrollment: { id: "enrollment-1" },
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(harness.candidates.build).not.toHaveBeenCalled();
      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
      expect(harness.prisma.roadmapDraft.updateMany).toHaveBeenCalledWith({
        where: { id: "draft-1", status: RoadmapDraftStatus.GENERATING },
        data: { status: RoadmapDraftStatus.COMPLETED },
      });
    });

    it("does not call AI when a completed draft is redelivered", async () => {
      const harness = buildHarness({
        draft: generatingDraft({ status: RoadmapDraftStatus.COMPLETED }),
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(harness.candidates.build).not.toHaveBeenCalled();
      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
    });

    it("does not call AI for a draft that is no longer generating", async () => {
      for (const status of [
        RoadmapDraftStatus.FAILED,
        RoadmapDraftStatus.READY,
        RoadmapDraftStatus.COLLECTING,
      ]) {
        const harness = buildHarness({ draft: draftRow({ status }) });

        await harness.service.runGeneration("draft-1");

        expect(harness.ai.generate).not.toHaveBeenCalled();
        expect(harness.candidates.build).not.toHaveBeenCalled();
      }
    });

    it("checks lease ownership before every AI call", async () => {
      const order: string[] = [];
      const assertLeaseHeld = jest.fn(async () => {
        order.push("lease");
      });
      const generate = jest.fn(async () => {
        order.push("ai");
        return { ok: true, data: generated() };
      });
      const harness = buildHarness({ draft: generatingDraft(), generate });

      await harness.service.runGeneration("draft-1", assertLeaseHeld);

      expect(order).toEqual(["lease", "ai"]);
    });

    it("does not call AI when the lease was taken over", async () => {
      const harness = buildHarness({ draft: generatingDraft() });
      const assertLeaseHeld = jest
        .fn()
        .mockRejectedValue(new Error("Outbox lease is no longer held"));

      await expect(
        harness.service.runGeneration("draft-1", assertLeaseHeld),
      ).rejects.toThrow("Outbox lease is no longer held");

      expect(harness.ai.generate).not.toHaveBeenCalled();
    });

    it("discards a finished roadmap when another worker already completed the draft", async () => {
      const harness = buildHarness({ draft: generatingDraft() });
      harness.tx.roadmapDraft.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        harness.service.runGeneration("draft-1"),
      ).resolves.toBeUndefined();

      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
      expect(harness.engagement.createRoadmapEnrollment).not.toHaveBeenCalled();
    });

    it("allows a retry after a retryable failure when no enrollment exists", async () => {
      const generate = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          kind: "unavailable",
          retryable: true,
          messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
        })
        .mockResolvedValueOnce({ ok: true, data: generated() });
      const harness = buildHarness({ draft: generatingDraft(), generate });

      await expect(harness.service.runGeneration("draft-1")).rejects.toThrow(
        "ROADMAP_AI_UNAVAILABLE",
      );
      await harness.service.runGeneration("draft-1");

      expect(generate).toHaveBeenCalledTimes(2);
      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledTimes(1);
    });

    it("does not run the same draft twice in one process", async () => {
      let release: (() => void) | undefined;
      const generate = jest.fn(
        () =>
          new Promise((resolve) => {
            release = () => resolve({ ok: true, data: generated() });
          }),
      );
      const harness = buildHarness({ draft: generatingDraft(), generate });

      const first = harness.service.runGeneration("draft-1");
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      const duplicate = harness.service.runGeneration("draft-1");

      await duplicate;
      expect(generate).toHaveBeenCalledTimes(1);

      release?.();
      await first;
    });

    describe("the plan the AI returns", () => {
      const aStep = (
        order: number,
        overrides: Record<string, unknown> = {},
      ) => ({
        order,
        title: `Step ${order}`,
        description: "Work through it.",
        contentId: null,
        contentType: null,
        estimatedMinutes: null,
        ...overrides,
      });

      const planOf = (
        steps: ReturnType<typeof aStep>[],
        overrides: Partial<GenerateData> = {},
      ) =>
        generated({
          phases: [
            {
              order: 1,
              title: "Foundations",
              description: "Start here.",
              estimatedWeeks: 4,
              steps,
            },
          ],
          ...overrides,
        });

      const runWith = async (
        data: GenerateData,
        options: Partial<Parameters<typeof buildHarness>[0]> = {},
      ) => {
        const harness = buildHarness({
          draft: generatingDraft(),
          candidates: [candidate("course-1")],
          generate: jest.fn().mockResolvedValue({ ok: true, data }),
          ...options,
        });
        await harness.service.runGeneration("draft-1");
        return harness;
      };

      const expectRejected = (
        harness: Harness,
        violation: RoadmapGenerationViolation,
      ) => {
        expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
        expect(
          harness.engagement.createRoadmapEnrollment,
        ).not.toHaveBeenCalled();
        expect(harness.prisma.$transaction).not.toHaveBeenCalled();
        expect(harness.tx.roadmapDraft.updateMany).not.toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: RoadmapDraftStatus.COMPLETED,
            }),
          }),
        );
        expect(failureReasonOf(harness)).toBe(violation);
      };

      it("persists a step that points at a candidate it was offered", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: "course-1", contentType: "COURSE" })]),
        );

        const created = harness.catalog.createGeneratedRoadmap.mock.calls[0][0];
        expect(created.phases[0].steps[0]).toMatchObject({
          contentId: "course-1",
          contentType: "COURSE",
        });
      });

      it("persists a deliberate no-content step without touching the coverage note", async () => {
        const harness = await runWith(
          planOf([aStep(1, { title: "Build a small project" })], {
            coverageNote: "Limited catalogue for this topic.",
          }),
        );

        const created = harness.catalog.createGeneratedRoadmap.mock.calls[0][0];
        expect(created.phases[0].steps[0]).toMatchObject({
          title: "Build a small project",
          contentId: null,
          contentType: null,
        });
        expect(created.coverageNote).toBe("Limited catalogue for this topic.");
      });

      it("rejects a whitespace-only roadmap title before anything is written", async () => {
        const harness = await runWith(planOf([aStep(1)], { title: "   " }));

        expectRejected(harness, RoadmapGenerationViolation.BLANK_TEXT);
      });

      it("rejects a whitespace-only phase title", async () => {
        const harness = await runWith(
          generated({
            phases: [
              {
                order: 1,
                title: "  ",
                description: "Start here.",
                estimatedWeeks: 4,
                steps: [aStep(1)],
              },
            ],
          }),
        );

        expectRejected(harness, RoadmapGenerationViolation.BLANK_TEXT);
      });

      it("rejects a whitespace-only step title", async () => {
        const harness = await runWith(planOf([aStep(1, { title: "\t " })]));

        expectRejected(harness, RoadmapGenerationViolation.BLANK_TEXT);
      });

      it("keeps a missing coverage note missing", async () => {
        const harness = await runWith(planOf([aStep(1)]));

        expect(
          harness.catalog.createGeneratedRoadmap.mock.calls[0][0].coverageNote,
        ).toBeNull();
      });

      it("fails without writing when an identifier is not among the candidates", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: "fake-99", contentType: "COURSE" })]),
        );

        expectRejected(harness, RoadmapGenerationViolation.UNKNOWN_CONTENT);
      });

      it("fails without writing when only the identifier is given", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: "course-1", contentType: null })]),
        );

        expectRejected(
          harness,
          RoadmapGenerationViolation.PARTIAL_CONTENT_REFERENCE,
        );
      });

      it("fails without writing when only the content type is given", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: null, contentType: "COURSE" })]),
        );

        expectRejected(
          harness,
          RoadmapGenerationViolation.PARTIAL_CONTENT_REFERENCE,
        );
      });

      it("fails without writing when a candidate comes back under another content type", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: "course-1", contentType: "EVENT" })]),
        );

        expectRejected(harness, RoadmapGenerationViolation.UNKNOWN_CONTENT);
      });

      it("fails without writing when a candidate is used twice in one phase", async () => {
        const harness = await runWith(
          planOf([
            aStep(1, { contentId: "course-1", contentType: "COURSE" }),
            aStep(2, { contentId: "course-1", contentType: "COURSE" }),
          ]),
        );

        expectRejected(harness, RoadmapGenerationViolation.DUPLICATE_CONTENT);
      });

      it("fails without writing when two steps share an order", async () => {
        const harness = await runWith(planOf([aStep(1), aStep(1)]));

        expectRejected(
          harness,
          RoadmapGenerationViolation.DUPLICATE_STEP_ORDER,
        );
      });

      it("fails without writing when two phases share an order", async () => {
        const phase = (title: string) => ({
          order: 1,
          title,
          description: "Same slot.",
          estimatedWeeks: 2,
          steps: [aStep(1)],
        });
        const harness = await runWith(
          generated({
            estimatedWeeks: 4,
            phases: [phase("One"), phase("Two")],
          }),
        );

        expectRejected(
          harness,
          RoadmapGenerationViolation.DUPLICATE_PHASE_ORDER,
        );
      });

      it("fails without writing when more phases than requested come back", async () => {
        const phases = Array.from({ length: 5 }, (_value, index) => ({
          order: index + 1,
          title: `Phase ${index + 1}`,
          description: "One of too many.",
          estimatedWeeks: 1,
          steps: [aStep(1)],
        }));
        const harness = await runWith(generated({ estimatedWeeks: 5, phases }));

        expectRejected(harness, RoadmapGenerationViolation.TOO_MANY_PHASES);
      });

      it("allows a paid candidate when the budget is not free only", async () => {
        const harness = await runWith(
          planOf([aStep(1, { contentId: "course-1", contentType: "COURSE" })]),
          { candidates: [candidate("course-1", { isFree: false })] },
        );

        expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledTimes(1);
      });

      it.each([
        ["BEGINNER", "BEGINNER"],
        ["INTERMEDIATE", "INTERMEDIATE"],
        ["ADVANCED", "ADVANCED"],
        ["EXPERT", "ADVANCED"],
      ] as const)(
        "stores the AI's %s level on the roadmap as %s",
        async (level, stored) => {
          const harness = await runWith(planOf([aStep(1)], { level }));

          expect(
            harness.catalog.createGeneratedRoadmap.mock.calls[0][0].level,
          ).toBe(stored);
        },
      );

      it("never offers the AI more candidates than it accepts", async () => {
        const harness = await runWith(planOf([aStep(1)]));

        expect(
          harness.candidates.build.mock.calls[0][0].cap,
        ).toBeLessThanOrEqual(SERVICE_AI_LIMITS.candidatesMaxItems);
      });

      it("does not call the AI at all when no candidate was found", async () => {
        const harness = await runWith(planOf([aStep(1)]), { candidates: [] });

        expect(harness.ai.generate).not.toHaveBeenCalled();
        expect(failureReasonOf(harness)).toBe("NO_CANDIDATES");
      });

      it("logs the category and the offending reference but not the plan", async () => {
        const entries: unknown[] = [];
        const spy = jest
          .spyOn(Logger.prototype, "error")
          .mockImplementation((...args: unknown[]) => {
            entries.push(...args);
          });

        await runWith(
          planOf([aStep(1, { contentId: "fake-99", contentType: "COURSE" })]),
        );

        expect(entries).toContainEqual(
          expect.objectContaining({
            draftId: "draft-1",
            violation: RoadmapGenerationViolation.UNKNOWN_CONTENT,
            offending: "COURSE:fake-99",
          }),
        );
        expect(JSON.stringify(entries)).not.toContain("Work through it.");
        spy.mockRestore();
      });
    });

    it("fails without writing when an identifier repeats", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        generate: jest.fn().mockResolvedValue({
          ok: true,
          data: generated({
            estimatedWeeks: 8,
            phases: [1, 2].map((order) => ({
              order,
              title: `Phase ${order}`,
              description: "Repeated.",
              estimatedWeeks: 4,
              steps: [
                {
                  order: 1,
                  title: "Same course twice",
                  description: "Duplicated.",
                  contentId: "course-1",
                  contentType: "COURSE" as const,
                  estimatedMinutes: null,
                },
              ],
            })),
          }),
        }),
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe(
        RoadmapGenerationViolation.DUPLICATE_CONTENT,
      );
    });

    it("fails without writing when a paid item comes back under free only", async () => {
      const harness = buildHarness({
        draft: generatingDraft({
          budgetPreference: LearningBudgetPreference.FREE_ONLY,
        }),
        candidates: [candidate("course-1", { isFree: false })],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe(
        RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY,
      );
    });

    it("fails without writing when phase durations do not sum", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        generate: jest.fn().mockResolvedValue({
          ok: true,
          data: generated({ estimatedWeeks: 9 }),
        }),
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe(
        RoadmapGenerationViolation.PHASE_DURATION_MISMATCH,
      );
    });

    describe("deciding whether to try again", () => {
      const failure = (overrides: Record<string, unknown>) => ({
        ok: false,
        kind: "unavailable",
        retryable: true,
        messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
        ...overrides,
      });

      const run = (result: Record<string, unknown>) => {
        const harness = buildHarness({
          draft: generatingDraft(),
          generate: jest.fn().mockResolvedValue(result),
        });
        return { harness, outcome: harness.service.runGeneration("draft-1") };
      };

      it("fails the draft for good when the provider says it is not retryable", async () => {
        const { harness, outcome } = run(
          failure({
            kind: "failed",
            retryable: false,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
          }),
        );

        await expect(outcome).resolves.toBeUndefined();
        expect(failureReasonOf(harness)).toBe(
          RoadmapAiMessageCode.ROADMAP_AI_FAILED,
        );
      });

      it("does not defer a capacity outcome the provider marked not retryable", async () => {
        const { harness, outcome } = run(
          failure({
            kind: "busy",
            retryable: false,
            retryAfterSeconds: 30,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
          }),
        );

        await expect(outcome).resolves.toBeUndefined();
        expect(failureReasonOf(harness)).toBe(
          RoadmapAiMessageCode.ROADMAP_AI_BUSY,
        );
      });

      it("does not shrink the candidate set for a truncation marked not retryable", async () => {
        const { harness, outcome } = run(
          failure({
            kind: "truncated",
            retryable: false,
            recovery: "REDUCE_CANDIDATES",
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
          }),
        );

        await expect(outcome).resolves.toBeUndefined();
        expect(harness.ai.generate).toHaveBeenCalledTimes(1);
        expect(harness.candidates.build).toHaveBeenCalledTimes(1);
      });

      it("fails permanently when the service is not configured", async () => {
        const { harness, outcome } = run(failure({ retryable: false }));

        await expect(outcome).resolves.toBeUndefined();
        expect(failureReasonOf(harness)).toBe(
          RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
        );
      });

      it("waits exactly as long as a retryable capacity outcome asked", async () => {
        const { outcome } = run(
          failure({
            kind: "busy",
            retryAfterSeconds: 120,
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
          }),
        );

        await expect(outcome).rejects.toMatchObject({ seconds: 120 });
      });

      it("waits for the advertised time on any other retryable outcome", async () => {
        const { outcome } = run(failure({ retryAfterSeconds: 45 }));

        await expect(outcome).rejects.toMatchObject({
          name: "OutboxDeferral",
          seconds: 45,
        });
      });

      it("falls back to the outbox backoff when no wait was advertised", async () => {
        const { outcome } = run(failure({ retryAfterSeconds: null }));

        await expect(outcome).rejects.not.toBeInstanceOf(OutboxDeferral);
        await expect(
          run(failure({ retryAfterSeconds: null })).outcome,
        ).rejects.toThrow("ROADMAP_AI_UNAVAILABLE");
      });

      it("logs the provider code and correlation identifier of a failed call", async () => {
        const entries: unknown[] = [];
        const spy = jest
          .spyOn(Logger.prototype, "warn")
          .mockImplementation((...args: unknown[]) => {
            entries.push(...args);
          });

        await run(
          failure({
            kind: "failed",
            retryable: false,
            providerCode: "UPSTREAM_REJECTED",
            providerCorrelationId: "provider-turn-77",
            messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
          }),
        ).outcome;

        expect(entries).toContainEqual(
          expect.objectContaining({
            draftId: "draft-1",
            retryable: false,
            providerCode: "UPSTREAM_REJECTED",
            providerCorrelationId: "provider-turn-77",
          }),
        );
        spy.mockRestore();
      });
    });

    it("retries a truncated response with strictly fewer candidates", async () => {
      const generate = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          kind: "truncated",
          retryable: true,
          recovery: "REDUCE_CANDIDATES",
          messageCode: RoadmapAiMessageCode.ROADMAP_AI_FAILED,
        })
        .mockResolvedValueOnce({ ok: true, data: generated() });
      const harness = buildHarness({
        draft: generatingDraft(),
        candidates: Array.from({ length: 50 }, (_, index) =>
          candidate(`course-${index}`),
        ),
        generate,
      });
      harness.candidates.build.mockImplementation(({ cap }: { cap: number }) =>
        Promise.resolve(
          Array.from({ length: Math.min(cap, 50) }, (_, index) =>
            candidate(`course-${index}`),
          ),
        ),
      );

      await harness.service.runGeneration("draft-1");

      const [first, second] = harness.candidates.build.mock.calls.map(
        (args) => args[0].cap as number,
      );
      expect(second).toBeLessThan(first);
      expect(generate).toHaveBeenCalledTimes(2);
    });

    it("defers by the wait the provider advertised when it is at capacity", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        generate: jest.fn().mockResolvedValue({
          ok: false,
          kind: "busy",
          retryable: true,
          retryAfterSeconds: 300,
          messageCode: RoadmapAiMessageCode.ROADMAP_AI_BUSY,
        }),
      });

      await expect(harness.service.runGeneration("draft-1")).rejects.toThrow(
        OutboxDeferral,
      );
      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
    });

    it("rethrows a retryable provider failure so the outbox tries again", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        generate: jest.fn().mockResolvedValue({
          ok: false,
          kind: "unavailable",
          retryable: true,
          messageCode: RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
        }),
      });

      await expect(harness.service.runGeneration("draft-1")).rejects.toThrow(
        "ROADMAP_AI_UNAVAILABLE",
      );
    });

    it("fails the draft when the catalogue offered nothing", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        candidates: [],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe("NO_CANDIDATES");
    });

    it("resolves the draft's subject ids to their labels before searching and generating", async () => {
      const harness = buildHarness({
        draft: generatingDraft({ subjects: ["term-kubernetes"] }),
        subjectTerms: [
          {
            id: "term-kubernetes",
            label: "Kubernetes",
            group: { key: "TECHNOLOGY" },
          },
        ],
      });

      await harness.service.runGeneration("draft-1");

      // The catalogue search and the AI planner both match against subject
      // text, so the taxonomy id the draft stores must not reach either of
      // them verbatim.
      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({ subjects: ["Kubernetes"] }),
      );
      expect(harness.ai.generate.mock.calls[0][0].draft).toMatchObject({
        subjects: ["Kubernetes"],
      });
    });

    it("resolves the chosen subjects' taxonomy groups for the RELATED tier", async () => {
      const harness = buildHarness({
        draft: generatingDraft({ subjects: ["term-kubernetes"] }),
        subjectTerms: [
          {
            id: "term-kubernetes",
            label: "Kubernetes",
            group: { key: "TECHNOLOGY" },
          },
        ],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({ groupKeys: ["TECHNOLOGY"] }),
      );
    });

    it("sends the goal and target role as SIMILAR-tier keywords", async () => {
      const harness = buildHarness({
        draft: generatingDraft({
          goal: "Become a platform engineer",
          targetRole: "Platform Engineer",
        }),
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ["Become a platform engineer", "Platform Engineer"],
        }),
      );
    });

    it("drops a stored subject whose term no longer resolves", async () => {
      const harness = buildHarness({
        draft: generatingDraft({ subjects: ["term-1", "term-deleted"] }),
        subjectTerms: [
          { id: "term-1", label: "Kubernetes", group: { key: "g" } },
        ],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({ subjects: ["Kubernetes"] }),
      );
    });

    it("fails a legacy draft none of whose stored subjects exist, without searching", async () => {
      const harness = buildHarness({
        draft: generatingDraft({ subjects: ["raw text from an old draft"] }),
        subjectTerms: [],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).not.toHaveBeenCalled();
      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe("NO_CANDIDATES");
    });

    it("derives credits from recorded activity and floors the remainder", async () => {
      const harness = buildHarness({
        draft: generatingDraft({
          cpdEnabled: true,
          certificationName: "PMP",
          cpdPlan: {
            id: "plan-1",
            creditType: "PDU",
            organization: "PMI",
            reportingStart: new Date("2026-01-01"),
            reportingEnd: new Date("2026-12-31"),
            totalRequiredCredits: 60,
            initialCompletedCredits: 10,
          },
        }),
        activitySum: 75,
      });

      await harness.service.runGeneration("draft-1");

      const cpd = harness.ai.generate.mock.calls[0][0].cpd;
      expect(cpd).toMatchObject({
        organization: "PMI",
        totalRequiredCredits: 60,
        completedCredits: 85,
        // 60 required minus 85 completed is negative; the provider requires a
        // floor of zero.
        remainingCredits: 0,
      });
    });

    it("asks for credit-bearing content only when credits are outstanding", async () => {
      const harness = buildHarness({
        draft: generatingDraft({
          cpdEnabled: true,
          certificationName: "PMP",
          cpdPlan: {
            id: "plan-1",
            creditType: "PDU",
            organization: "PMI",
            reportingStart: new Date("2026-01-01"),
            reportingEnd: new Date("2026-12-31"),
            totalRequiredCredits: 60,
            initialCompletedCredits: 0,
          },
        }),
        activitySum: 10,
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({ creditsNeeded: true }),
      );
    });

    it("records the roadmap-level match tier and per-step close-match flag", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        candidates: [
          candidate("course-1", { matchTier: "SIMILAR", isCloseMatch: true }),
        ],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledWith(
        expect.objectContaining({
          matchTier: "SIMILAR",
          phases: [
            expect.objectContaining({
              steps: [expect.objectContaining({ isCloseMatch: true })],
            }),
          ],
        }),
        expect.anything(),
      );
    });

    it("records an EXACT match tier and no close-match tags when nothing was relaxed", async () => {
      const harness = buildHarness({
        draft: generatingDraft(),
        candidates: [candidate("course-1")],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledWith(
        expect.objectContaining({
          matchTier: "EXACT",
          phases: [
            expect.objectContaining({
              steps: [expect.objectContaining({ isCloseMatch: false })],
            }),
          ],
        }),
        expect.anything(),
      );
    });

    it("leaves no partial roadmap when the write fails mid-transaction", async () => {
      const harness = buildHarness({ draft: generatingDraft() });
      harness.engagement.createRoadmapEnrollment.mockRejectedValue(
        new Error("enrollment write failed"),
      );

      await expect(harness.service.runGeneration("draft-1")).rejects.toThrow(
        "enrollment write failed",
      );
      expect(harness.prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(harness.prisma.roadmapDraft.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("fail", () => {
    it("only moves a draft that is still generating", async () => {
      const harness = buildHarness({ draft: draftRow() });

      await harness.service.fail("draft-1", "ROADMAP_GENERATION_FAILED");

      expect(harness.prisma.roadmapDraft.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: RoadmapDraftStatus.GENERATING,
          }),
        }),
      );
    });
  });

  describe("generationStatus", () => {
    it("returns the owned draft by id in any status", async () => {
      const harness = buildHarness({
        draft: draftRow({ status: RoadmapDraftStatus.COMPLETED }),
      });

      const result = await harness.service.generationStatus(USER, "draft-1");

      expect(harness.prisma.roadmapDraft.findFirst).toHaveBeenCalledWith({
        where: { id: "draft-1", userId: USER.id },
      });
      expect(result?.status).toBe(RoadmapDraftStatus.COMPLETED);
    });

    it("resolves the latest active generation when no id is given", async () => {
      const harness = buildHarness({
        draft: draftRow({ status: RoadmapDraftStatus.FAILED }),
      });

      await harness.service.generationStatus(USER);

      expect(harness.prisma.roadmapDraft.findFirst).toHaveBeenCalledWith({
        where: {
          userId: USER.id,
          status: {
            in: [RoadmapDraftStatus.GENERATING, RoadmapDraftStatus.FAILED],
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    });

    it("only looks for an active generation newer than the latest completed draft", async () => {
      // The mock resolver returns `options.draft` for any non-COMPLETED-shaped
      // query regardless of an `updatedAt` filter, so a real Postgres query
      // engine's filtering can't be exercised here — this asserts the query
      // itself carries the cutoff, which is what makes an abandoned FAILED
      // draft stop being findable once a later generation completes.
      const completedAt = new Date("2026-06-01");
      const harness = buildHarness({
        draft: draftRow({ status: RoadmapDraftStatus.FAILED }),
        completedDraft: draftRow({
          status: RoadmapDraftStatus.COMPLETED,
          updatedAt: completedAt,
        }),
      });

      await harness.service.generationStatus(USER);

      expect(harness.prisma.roadmapDraft.findFirst).toHaveBeenCalledWith({
        where: {
          userId: USER.id,
          status: {
            in: [RoadmapDraftStatus.GENERATING, RoadmapDraftStatus.FAILED],
          },
          updatedAt: { gt: completedAt },
        },
        orderBy: { updatedAt: "desc" },
      });
    });

    it("returns null rather than another professional's draft", async () => {
      const harness = buildHarness({ draft: null });

      expect(
        await harness.service.generationStatus(USER, "draft-1"),
      ).toBeNull();
    });

    it("maps a no-candidates failure to the public no-content category", async () => {
      const harness = buildHarness({
        draft: draftRow({
          status: RoadmapDraftStatus.FAILED,
          failureReason: "NO_CANDIDATES",
        }),
      });

      const result = await harness.service.generationStatus(USER, "draft-1");

      expect(result?.failure).toEqual({
        code: "NO_MATCHING_CONTENT",
        recoveryActions: ["REVIEW_SUBJECTS", "REVIEW_FORMATS", "REVIEW_BUDGET"],
      });
    });

    it("never exposes the raw failure reason", async () => {
      const harness = buildHarness({
        draft: draftRow({
          status: RoadmapDraftStatus.FAILED,
          failureReason: "some-internal-provider-detail",
        }),
      });

      const result = await harness.service.generationStatus(USER, "draft-1");

      expect(result?.failure?.code).toBe("UNKNOWN");
      expect(JSON.stringify(result)).not.toContain(
        "some-internal-provider-detail",
      );
    });
  });
});
