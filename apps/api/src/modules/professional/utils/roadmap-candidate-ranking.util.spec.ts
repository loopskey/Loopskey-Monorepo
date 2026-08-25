import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";

import {
  scoreCandidate,
  selectCandidates,
  type RankableCandidate,
} from "./roadmap-candidate-ranking.util";

const candidate = (
  overrides: Partial<RankableCandidate> & Pick<RankableCandidate, "contentId">,
): RankableCandidate => ({
  contentType: "COURSE",
  title: "Untitled",
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
  ...overrides,
});

const many = (
  count: number,
  build: (index: number) => Partial<RankableCandidate>,
): RankableCandidate[] =>
  Array.from({ length: count }, (_, index) =>
    candidate({ contentId: `id-${index}`, ...build(index) }),
  );

const base = {
  cap: 50,
  subjects: [] as string[],
  freeOnly: false,
  level: null,
  requestedTypes: [] as PlatformContentType[],
  creditsNeeded: false,
};

describe("selectCandidates", () => {
  it("caps the set at the maximum the provider accepts", () => {
    const selected = selectCandidates({ ...base, pool: many(120, () => ({})) });

    expect(selected).toHaveLength(50);
  });

  it("keeps the highest scoring items rather than an arbitrary slice", () => {
    // The strong item is last in the pool, so a naive slice would lose it.
    const pool = [
      ...many(60, () => ({ contentType: "COURSE" as const })),
      candidate({
        contentId: "strong",
        title: "Advanced Kubernetes",
        rating: 5,
        ratingCount: 500,
        audience: 10_000,
        isFeatured: true,
      }),
    ];

    const selected = selectCandidates({
      ...base,
      pool,
      subjects: ["kubernetes"],
    });

    expect(selected[0]?.contentId).toBe("strong");
  });

  it("removes duplicates on identifier and type together", () => {
    const selected = selectCandidates({
      ...base,
      pool: [
        candidate({ contentId: "shared", contentType: "COURSE" }),
        candidate({ contentId: "shared", contentType: "COURSE" }),
        candidate({ contentId: "shared", contentType: "EVENT" }),
      ],
    });

    expect(selected).toHaveLength(2);
    expect(selected.map((item) => item.contentType).sort()).toEqual([
      "COURSE",
      "EVENT",
    ]);
  });

  it("excludes content types the draft did not ask for", () => {
    const selected = selectCandidates({
      ...base,
      requestedTypes: ["PODCAST"],
      pool: [
        candidate({ contentId: "a", contentType: "COURSE" }),
        candidate({ contentId: "b", contentType: "PODCAST" }),
      ],
    });

    expect(selected).toEqual([
      expect.objectContaining({ contentId: "b", contentType: "PODCAST" }),
    ]);
  });

  it("drops paid content when the professional asked for free only", () => {
    const selected = selectCandidates({
      ...base,
      freeOnly: true,
      pool: [
        candidate({ contentId: "paid", isFree: false }),
        candidate({ contentId: "free", isFree: true }),
      ],
    });

    expect(selected.map((item) => item.contentId)).toEqual(["free"]);
  });

  it("reserves room for every requested type instead of filling with one", () => {
    // 60 strong courses would take the whole cap without a per-type quota.
    const selected = selectCandidates({
      ...base,
      requestedTypes: ["COURSE", "EVENT", "PODCAST"],
      pool: [
        ...many(60, (index) => ({
          contentType: "COURSE" as const,
          contentId: `course-${index}`,
          rating: 5,
          ratingCount: 100,
        })),
        ...many(20, (index) => ({
          contentType: "EVENT" as const,
          contentId: `event-${index}`,
        })),
        ...many(20, (index) => ({
          contentType: "PODCAST" as const,
          contentId: `podcast-${index}`,
        })),
      ],
    });

    const byType = (type: PlatformContentType) =>
      selected.filter((item) => item.contentType === type).length;

    expect(selected).toHaveLength(50);
    expect(byType("EVENT")).toBeGreaterThanOrEqual(16);
    expect(byType("PODCAST")).toBeGreaterThanOrEqual(16);
    expect(byType("COURSE")).toBeGreaterThanOrEqual(16);
  });

  it("gives an unused quota back to the best remaining items", () => {
    const selected = selectCandidates({
      ...base,
      requestedTypes: ["COURSE", "PODCAST"],
      pool: [
        ...many(60, (index) => ({
          contentType: "COURSE" as const,
          contentId: `course-${index}`,
        })),
        candidate({ contentId: "only-podcast", contentType: "PODCAST" }),
      ],
    });

    // A thin podcast catalogue must not cost the set its capacity.
    expect(selected).toHaveLength(50);
    expect(selected.map((item) => item.contentId)).toContain("only-podcast");
  });

  it("reserves credit-bearing events when the draft is chasing credits", () => {
    // Every course outranks every event here, so without the reserve the
    // credit-bearing events lose their slots and the credit gap stays open.
    const selected = selectCandidates({
      ...base,
      creditsNeeded: true,
      requestedTypes: ["COURSE", "EVENT"],
      pool: [
        ...many(60, (index) => ({
          contentType: "COURSE" as const,
          contentId: `course-${index}`,
          rating: 5,
          ratingCount: 1000,
          audience: 100_000,
          isFeatured: true,
        })),
        ...many(20, (index) => ({
          contentType: "EVENT" as const,
          contentId: `event-${index}`,
          credits: 3,
        })),
      ],
    });

    const creditBearing = selected.filter(
      (item) => item.contentType === "EVENT" && (item.credits ?? 0) > 0,
    );
    expect(creditBearing.length).toBeGreaterThanOrEqual(15);
  });

  it("prefers events worth more credits when the reserve applies", () => {
    const selected = selectCandidates({
      ...base,
      cap: 2,
      creditsNeeded: true,
      requestedTypes: ["EVENT"],
      pool: [
        candidate({ contentId: "small", contentType: "EVENT", credits: 1 }),
        candidate({ contentId: "large", contentType: "EVENT", credits: 40 }),
        candidate({ contentId: "none", contentType: "EVENT", credits: null }),
      ],
    });

    expect(selected.map((item) => item.contentId).sort()).toEqual([
      "large",
      "small",
    ]);
  });

  it("does not reserve credit slots when no certification is tracked", () => {
    const selected = selectCandidates({
      ...base,
      cap: 1,
      creditsNeeded: false,
      requestedTypes: ["COURSE", "EVENT"],
      pool: [
        candidate({
          contentId: "course",
          contentType: "COURSE",
          rating: 5,
          ratingCount: 1000,
        }),
        candidate({ contentId: "event", contentType: "EVENT", credits: 40 }),
      ],
    });

    expect(selected.map((item) => item.contentId)).toEqual(["course"]);
  });

  it("is deterministic regardless of the order the catalogue returned", () => {
    const pool = many(10, (index) => ({ contentId: `id-${index}` }));
    const first = selectCandidates({ ...base, cap: 5, pool });
    const second = selectCandidates({
      ...base,
      cap: 5,
      pool: [...pool].reverse(),
    });

    expect(first.map((item) => item.contentId)).toEqual(
      second.map((item) => item.contentId),
    );
  });
});

describe("scoreCandidate", () => {
  it("rewards a subject match", () => {
    const input = { subjects: ["docker"], level: null };
    const hit = scoreCandidate(
      candidate({ contentId: "a", title: "Learning Docker" }),
      input,
    );
    const miss = scoreCandidate(
      candidate({ contentId: "b", title: "Learning Excel" }),
      input,
    );

    expect(hit).toBeGreaterThan(miss);
  });

  it("matches subjects against tags and summary, not only the title", () => {
    const input = { subjects: ["kubernetes"], level: null };
    const tagged = scoreCandidate(
      candidate({ contentId: "a", title: "Ops", tags: ["Kubernetes"] }),
      input,
    );
    const summarised = scoreCandidate(
      candidate({
        contentId: "b",
        title: "Ops",
        summary: "Covers Kubernetes.",
      }),
      input,
    );
    const neither = scoreCandidate(
      candidate({ contentId: "c", title: "Ops" }),
      input,
    );

    expect(tagged).toBeGreaterThan(neither);
    expect(summarised).toBeGreaterThan(neither);
  });

  it("prefers the level the draft stated over a distant one", () => {
    const input = { subjects: [], level: "BEGINNER" as const };
    const exact = scoreCandidate(
      candidate({ contentId: "a", level: "BEGINNER" }),
      input,
    );
    const adjacent = scoreCandidate(
      candidate({ contentId: "b", level: "INTERMEDIATE" }),
      input,
    );
    const distant = scoreCandidate(
      candidate({ contentId: "c", level: "EXPERT" }),
      input,
    );

    expect(exact).toBeGreaterThan(adjacent);
    expect(adjacent).toBeGreaterThan(distant);
  });

  it("discounts a perfect rating that almost nobody voted on", () => {
    const input = { subjects: [], level: null };
    const trusted = scoreCandidate(
      candidate({ contentId: "a", rating: 4.5, ratingCount: 200 }),
      input,
    );
    const thin = scoreCandidate(
      candidate({ contentId: "b", rating: 5, ratingCount: 1 }),
      input,
    );

    expect(trusted).toBeGreaterThan(thin);
  });
});
