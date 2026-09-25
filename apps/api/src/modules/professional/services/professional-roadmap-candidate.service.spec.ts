import { LearningBudgetPreference, SkillLevel } from "@prisma/client";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";

import { ProfessionalRoadmapCandidateService } from "@professional/services/professional-roadmap-candidate.service";

const course = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Course ${id}`,
  description: "A course about Kubernetes.",
  level: "BEGINNER",
  isFree: true,
  durationMinutes: 120,
  category: "TECHNOLOGY",
  rating: 4,
  ratingCount: 50,
  professionals: 100,
  isFeatured: false,
  matchScore: 1,
  ...overrides,
});

const event = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Event ${id}`,
  description: "An event about Kubernetes.",
  isFree: true,
  pdu: 3,
  category: "CPD",
  topic: null,
  specificTopic: null,
  averageRating: 4,
  ratingCount: 10,
  attendees: 40,
  startDate: new Date("2027-01-01"),
  matchScore: 1,
  ...overrides,
});

const podcast = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Podcast ${id}`,
  description: "A podcast about Kubernetes.",
  category: "TECHNOLOGY",
  rating: 4,
  ratingCount: 10,
  listeners: 500,
  durationMinutes: 45,
  isFeatured: false,
  matchScore: 1,
  ...overrides,
});

const channel = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: `Channel ${id}`,
  description: "A channel about Kubernetes.",
  category: "TECHNOLOGY",
  rating: 4,
  ratingCount: 10,
  subscribers: 900,
  isFeatured: false,
  matchScore: 1,
  ...overrides,
});

const buildHarness = (rows: {
  courses?: unknown[];
  events?: unknown[];
  podcasts?: unknown[];
  channels?: unknown[];
}) => {
  const catalog = {
    roadmapCandidateCourses: jest.fn().mockResolvedValue(rows.courses ?? []),
  };
  const events = {
    roadmapCandidateEvents: jest.fn().mockResolvedValue(rows.events ?? []),
  };
  const podcasts = {
    roadmapCandidatePodcasts: jest.fn().mockResolvedValue(rows.podcasts ?? []),
  };
  const channels = {
    roadmapCandidateChannels: jest.fn().mockResolvedValue(rows.channels ?? []),
  };
  const service = new ProfessionalRoadmapCandidateService(
    catalog as never,
    events as never,
    podcasts as never,
    channels as never,
  );
  return { service, catalog, events, podcasts, channels };
};

const input = {
  cap: SERVICE_AI_LIMITS.candidatesMaxItems,
  subjects: ["kubernetes"],
  keywords: [] as string[],
  groupKeys: [] as string[],
  skillLevel: SkillLevel.BEGINNER,
  budgetPreference: LearningBudgetPreference.UNDER_100,
  preferredContentTypes: [] as never[],
  creditsNeeded: false,
};

describe("ProfessionalRoadmapCandidateService", () => {
  it("never returns more than the provider accepts", async () => {
    const { service } = buildHarness({
      courses: Array.from({ length: 100 }, (_, index) => course(`c-${index}`)),
      events: Array.from({ length: 100 }, (_, index) => event(`e-${index}`)),
    });

    const selected = await service.build(input);

    expect(selected.length).toBeLessThanOrEqual(
      SERVICE_AI_LIMITS.candidatesMaxItems,
    );
  });

  it("does not query a content type the draft excluded", async () => {
    const harness = buildHarness({ courses: [course("c-1")] });

    await harness.service.build({
      ...input,
      preferredContentTypes: ["COURSE"],
    });

    expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalled();
    // A type the professional ruled out should cost nothing, not be fetched
    // and then discarded, at any relaxation tier.
    expect(harness.events.roadmapCandidateEvents).not.toHaveBeenCalled();
    expect(harness.podcasts.roadmapCandidatePodcasts).not.toHaveBeenCalled();
    expect(harness.channels.roadmapCandidateChannels).not.toHaveBeenCalled();
  });

  it("passes a free-only budget down to the types that can charge", async () => {
    const harness = buildHarness({ courses: [course("c-1")] });

    await harness.service.build({
      ...input,
      budgetPreference: LearningBudgetPreference.FREE_ONLY,
    });

    expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalledWith(
      expect.objectContaining({ freeOnly: true }),
    );
    expect(harness.events.roadmapCandidateEvents).toHaveBeenCalledWith(
      expect.objectContaining({ freeOnly: true }),
    );
  });

  it("de-duplicates identifiers that repeat within a type", async () => {
    const { service } = buildHarness({
      courses: [course("same"), course("same")],
    });

    const selected = await service.build(input);

    expect(selected).toHaveLength(1);
  });

  it("keeps items that share an identifier across types", async () => {
    const { service } = buildHarness({
      courses: [course("shared")],
      podcasts: [podcast("shared")],
    });

    const selected = await service.build(input);

    expect(selected).toHaveLength(2);
  });

  it("truncates a long summary well below the contract ceiling", async () => {
    const { service } = buildHarness({
      courses: [course("c-1", { description: "x".repeat(5000) })],
    });

    const [selected] = await service.build(input);

    expect(selected.summary!.length).toBeLessThanOrEqual(300);
    expect(selected.summary!.length).toBeLessThan(
      SERVICE_AI_LIMITS.candidateSummaryMaxLength,
    );
  });

  it("sends no summary at all rather than an empty one", async () => {
    // The contract sets minLength 1 on summary, so blank text must become null.
    const { service } = buildHarness({
      courses: [course("c-1", { description: "   " })],
    });

    const [selected] = await service.build(input);

    expect(selected.summary).toBeNull();
  });

  it("keeps a title inside the contract ceiling", async () => {
    const { service } = buildHarness({
      courses: [course("c-1", { title: "y".repeat(900) })],
    });

    const [selected] = await service.build(input);

    expect(selected.title.length).toBeLessThanOrEqual(
      SERVICE_AI_LIMITS.candidateTitleMaxLength,
    );
  });

  it("carries the credit value only events have", async () => {
    const { service } = buildHarness({
      events: [event("e-1", { pdu: 7 })],
      courses: [course("c-1")],
    });

    const selected = await service.build(input);

    expect(selected.find((item) => item.contentId === "e-1")?.credits).toBe(7);
    expect(
      selected.find((item) => item.contentId === "c-1")?.credits,
    ).toBeNull();
  });

  it("treats an all-levels course as stating no level", async () => {
    const { service } = buildHarness({
      courses: [course("c-1", { level: "ALL_LEVELS" })],
    });

    const [selected] = await service.build(input);

    expect(selected.level).toBeNull();
  });

  it("marks podcasts and channels free without asking the catalogue", async () => {
    const { service } = buildHarness({
      podcasts: [podcast("p-1")],
      channels: [channel("y-1")],
    });

    const selected = await service.build({
      ...input,
      budgetPreference: LearningBudgetPreference.FREE_ONLY,
    });

    expect(selected).toHaveLength(2);
    expect(selected.every((item) => item.isFree)).toBe(true);
  });

  describe("relaxation tiers", () => {
    it("stops at EXACT when it alone reaches the minimum pool", async () => {
      const harness = buildHarness({});
      harness.catalog.roadmapCandidateCourses.mockImplementation(
        async ({ tier }: { tier: string }) =>
          tier === "EXACT"
            ? Array.from({ length: 6 }, (_, index) => course(`c-${index}`))
            : [],
      );

      const selected = await harness.service.build(input);

      expect(selected).toHaveLength(6);
      expect(selected.every((item) => item.matchTier === "EXACT")).toBe(true);
      expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalledTimes(1);
    });

    it("escalates to SIMILAR when EXACT alone is not enough", async () => {
      const harness = buildHarness({});
      harness.catalog.roadmapCandidateCourses.mockImplementation(
        async ({ tier }: { tier: string }) => {
          if (tier === "EXACT") return [course("exact-1")];
          if (tier === "SIMILAR")
            return Array.from({ length: 6 }, (_, index) =>
              course(`similar-${index}`),
            );
          return [];
        },
      );

      const selected = await harness.service.build(input);

      expect(selected).toHaveLength(6);
      expect(selected.every((item) => item.matchTier === "SIMILAR")).toBe(true);
      expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalledWith(
        expect.objectContaining({ tier: "EXACT" }),
      );
      expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalledWith(
        expect.objectContaining({ tier: "SIMILAR" }),
      );
    });

    it("uses BROAD's own pool even when it stays below the minimum", async () => {
      const harness = buildHarness({});
      harness.catalog.roadmapCandidateCourses.mockImplementation(
        async ({ tier }: { tier: string }) =>
          tier === "BROAD" ? [course("broad-1")] : [],
      );

      const selected = await harness.service.build(input);

      expect(selected).toHaveLength(1);
      expect(selected[0]?.matchTier).toBe("BROAD");
    });

    it("marks a non-exact match close, unless its own text still contains the subject", async () => {
      const harness = buildHarness({});
      harness.catalog.roadmapCandidateCourses.mockImplementation(
        async ({ tier }: { tier: string }) =>
          tier === "EXACT"
            ? []
            : [
                course("literal", { title: "Learning Kubernetes" }),
                course("fuzzy", {
                  title: "Container Orchestration 101",
                  description: "A deep dive into container schedulers.",
                }),
              ],
      );

      const selected = await harness.service.build(input);

      expect(
        selected.find((item) => item.contentId === "literal")?.isCloseMatch,
      ).toBe(false);
      expect(
        selected.find((item) => item.contentId === "fuzzy")?.isCloseMatch,
      ).toBe(true);
    });

    it("passes the draft's keywords and taxonomy group keys to the catalogue", async () => {
      const harness = buildHarness({
        courses: Array.from({ length: 6 }, (_, index) => course(`c-${index}`)),
      });

      await harness.service.build({
        ...input,
        keywords: ["become a platform engineer"],
        groupKeys: ["TECHNOLOGY"],
      });

      expect(harness.catalog.roadmapCandidateCourses).toHaveBeenCalledWith(
        expect.objectContaining({
          keywords: ["become a platform engineer"],
          groupKeys: ["TECHNOLOGY"],
        }),
      );
    });
  });
});
