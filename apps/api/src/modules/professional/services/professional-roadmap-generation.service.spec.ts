import {
  DeliveryFormat,
  LearningBudgetPreference,
  LearningFormat,
  RoadmapDraftStatus,
  Role,
  SkillLevel,
} from "@prisma/client";
import { OutboxDeferral } from "@infrastructure/outbox/outbox-handler.port";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { RoadmapAiMessageCode } from "@infrastructure/service-ai/service-ai.port";
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
  certificationId: null,
  certificationName: null,
  certification: null,
  cpdPlan: null,
  cpdPlanId: null,
  requiredCredits: null,
  completedCredits: null,
  ...overrides,
});

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
  enrollment?: { id: string } | null;
  candidates?: RankableCandidate[];
  generate?: jest.Mock;
  activitySum?: number | null;
  subjectTerms?: { id: string; label: string; groupKey?: string }[];
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
      findFirst: jest.fn().mockResolvedValue(options.draft ?? null),
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
      findMany: jest.fn().mockResolvedValue(options.subjectTerms ?? []),
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

    it("refuses a draft that is missing a field the provider requires", async () => {
      const harness = buildHarness({
        draft: draftRow({ enrollment: null, goal: null }),
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
      const harness = buildHarness({ draft: draftRow() });

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
      expect(harness.tx.roadmapDraft.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: RoadmapDraftStatus.COMPLETED,
          }),
        }),
      );
    });

    it("archives any previously-active generated roadmap for the same user", async () => {
      const harness = buildHarness({ draft: draftRow() });

      await harness.service.runGeneration("draft-1");

      expect(
        harness.engagement.archiveGeneratedRoadmapEnrollments,
      ).toHaveBeenCalledWith({ userId: "user-1" }, expect.anything());
    });

    it("owns the roadmap and marks it generated so explore never shows it", async () => {
      const harness = buildHarness({ draft: draftRow() });

      await harness.service.runGeneration("draft-1");

      expect(harness.catalog.createGeneratedRoadmap).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: "user-1" }),
        expect.anything(),
      );
    });

    it("writes nothing when a redelivered event finds an enrollment", async () => {
      const harness = buildHarness({
        draft: draftRow(),
        enrollment: { id: "enrollment-1" },
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(harness.catalog.createGeneratedRoadmap).not.toHaveBeenCalled();
    });

    it("stores a step without content when the identifier is unknown", async () => {
      const harness = buildHarness({
        draft: draftRow(),
        candidates: [candidate("course-1")],
        generate: jest.fn().mockResolvedValue({
          ok: true,
          data: generated({
            phases: [
              {
                order: 1,
                title: "Foundations",
                description: "Start here.",
                estimatedWeeks: 4,
                steps: [
                  {
                    order: 1,
                    title: "Read up",
                    description: "Background reading.",
                    contentId: "hallucinated",
                    contentType: "COURSE",
                    estimatedMinutes: null,
                  },
                ],
              },
            ],
          }),
        }),
      });

      await harness.service.runGeneration("draft-1");

      const created = harness.catalog.createGeneratedRoadmap.mock.calls[0][0];
      const step = created.phases[0].steps[0];
      expect(step).toMatchObject({ title: "Read up", contentId: null });
      expect(created.coverageNote).toContain("not in this catalogue");
    });

    it("fails without writing when an identifier repeats", async () => {
      const harness = buildHarness({
        draft: draftRow(),
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
        draft: draftRow({
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
        draft: draftRow(),
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
        draft: draftRow(),
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
        draft: draftRow(),
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
        draft: draftRow(),
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
      const harness = buildHarness({ draft: draftRow(), candidates: [] });

      await harness.service.runGeneration("draft-1");

      expect(harness.ai.generate).not.toHaveBeenCalled();
      expect(failureReasonOf(harness)).toBe("NO_CANDIDATES");
    });

    it("resolves the draft's subject ids to their labels before searching and generating", async () => {
      const harness = buildHarness({
        draft: draftRow({ subjects: ["term-kubernetes"] }),
        subjectTerms: [
          {
            id: "term-kubernetes",
            label: "Kubernetes",
            groupKey: "TECHNOLOGY",
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
        draft: draftRow({ subjects: ["term-kubernetes"] }),
        subjectTerms: [
          {
            id: "term-kubernetes",
            label: "Kubernetes",
            groupKey: "TECHNOLOGY",
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
        draft: draftRow({
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

    it("falls back to the stored id for a subject whose term no longer resolves", async () => {
      const harness = buildHarness({
        draft: draftRow({ subjects: ["term-deleted"] }),
        subjectTerms: [],
      });

      await harness.service.runGeneration("draft-1");

      expect(harness.candidates.build).toHaveBeenCalledWith(
        expect.objectContaining({ subjects: ["term-deleted"] }),
      );
    });

    it("derives credits from recorded activity and floors the remainder", async () => {
      const harness = buildHarness({
        draft: draftRow({
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
        draft: draftRow({
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
        draft: draftRow(),
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
        draft: draftRow(),
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
      const harness = buildHarness({ draft: draftRow() });
      harness.engagement.createRoadmapEnrollment.mockRejectedValue(
        new Error("enrollment write failed"),
      );

      await expect(harness.service.runGeneration("draft-1")).rejects.toThrow(
        "enrollment write failed",
      );
      // The draft is not moved to completed, so the retry still sees work to do.
      expect(harness.tx.roadmapDraft.update).not.toHaveBeenCalled();
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
