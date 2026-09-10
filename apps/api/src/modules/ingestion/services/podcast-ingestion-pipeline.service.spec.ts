import { PodcastIngestionPipeline } from "@ingestion/services/podcast-ingestion-pipeline.service";

const FIELD_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  presenter: "host",
  topic_area: "category",
  items: "episodes",
};

const raw = (overrides: Record<string, unknown> = {}) => ({
  external_id: "pod-1",
  url: "https://example.com/podcasts/data",
  name: "The Data Platform Show",
  summary: "Weekly conversations about data platforms.",
  presenter: "Ada Lovelace",
  topic_area: "technology",
  ...overrides,
});

const episode = (number: unknown, title = "An episode") => ({
  episodeNumber: number,
  title,
});

describe("PodcastIngestionPipeline", () => {
  const pipeline = new PodcastIngestionPipeline();
  const prepare = (item: unknown) => pipeline.prepare(item, FIELD_MAP, false);

  it("normalises a well-formed podcast", () => {
    const result = prepare(raw());
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.canonical.core.host).toBe("Ada Lovelace");
    expect(result.canonical.core.category).toBe("TECHNOLOGY");
    expect(result.canonical.episodes).toBeNull();
  });

  it("rejects a payload carrying episodeCount or listeners", () => {
    for (const field of ["episodeCount", "listeners", "isFeatured"]) {
      const result = prepare(raw({ [field]: 12 }));
      expect(result.outcome).toBe("rejected");
      if (result.outcome === "rejected")
        expect(result.reason).toContain("owned by the platform");
    }
  });

  it("distinguishes omitted episodes from an empty set", () => {
    const omitted = prepare(raw());
    const empty = prepare(raw({ items: [] }));
    if (omitted.outcome === "accepted")
      expect(omitted.canonical.episodes).toBeNull();
    if (empty.outcome === "accepted")
      expect(empty.canonical.episodes).toEqual([]);
  });

  it("skips an episode with no number and keeps the rest", () => {
    const result = prepare(
      raw({
        items: [
          episode(1, "One"),
          episode(null, "No number"),
          episode(2, "Two"),
        ],
      }),
    );
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(
      result.canonical.episodes?.map((item) => item.episodeNumber),
    ).toEqual([1, 2]);
    expect(result.canonical.skippedEpisodeCount).toBe(1);
    expect(result.unmappedFields).toContain("episodes");
  });

  it("keeps the last episode when a number repeats", () => {
    const result = prepare(
      raw({ items: [episode(1, "First"), episode(1, "Second")] }),
    );
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.canonical.episodes).toHaveLength(1);
    expect(result.canonical.episodes?.[0].title).toBe("Second");
  });

  it("records an unmapped field name and never its value", () => {
    const result = prepare(raw({ crawler_score: "secret-value" }));
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.unmappedFields).toContain("crawler_score");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});
