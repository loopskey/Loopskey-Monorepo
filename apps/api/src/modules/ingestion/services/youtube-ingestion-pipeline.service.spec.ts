import { YouTubeIngestionPipeline } from "@ingestion/services/youtube-ingestion-pipeline.service";

const FIELD_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  about: "description",
  channel_url: "channelUrl",
  topic_area: "category",
  subs: "subscribers",
  total_views: "views",
  total_videos: "videoCount",
  clips: "videos",
};

const raw = (overrides: Record<string, unknown> = {}) => ({
  external_id: "chan-1",
  url: "https://example.com/channels/data",
  name: "Data Platform Weekly",
  about: "Tutorials about data platforms.",
  channel_url: "https://youtube.com/@dataplatformweekly",
  topic_area: "technology",
  subs: "125000",
  total_views: "9000000",
  total_videos: "412",
  ...overrides,
});

describe("YouTubeIngestionPipeline", () => {
  const pipeline = new YouTubeIngestionPipeline();
  const prepare = (item: unknown) => pipeline.prepare(item, FIELD_MAP, false);

  it("accepts the channel's own public counts", () => {
    const result = prepare(raw());
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.canonical.core.subscribers).toBe(125000);
    expect(result.canonical.core.views).toBe(9000000);
    expect(result.canonical.core.videoCount).toBe(412);
    expect(result.canonical.core.category).toBe("TECHNOLOGY");
    expect(result.canonical.videos).toBeNull();
  });

  it("requires a channel url and a title", () => {
    expect(prepare(raw({ channel_url: undefined })).outcome).toBe("rejected");
    expect(prepare(raw({ name: undefined })).outcome).toBe("rejected");
  });

  it("rejects a payload carrying a platform-owned field", () => {
    for (const field of ["isFeatured", "providerId", "status"]) {
      const result = prepare(raw({ [field]: "x" }));
      expect(result.outcome).toBe("rejected");
      if (result.outcome === "rejected")
        expect(result.reason).toContain("owned by the platform");
    }
  });

  it("distinguishes omitted videos from a supplied set", () => {
    const omitted = prepare(raw());
    const supplied = prepare(
      raw({ clips: [{ externalId: "vid-1", title: "Intro to warehouses" }] }),
    );
    if (omitted.outcome === "accepted")
      expect(omitted.canonical.videos).toBeNull();
    if (supplied.outcome === "accepted") {
      expect(supplied.canonical.videos).toHaveLength(1);
      expect(supplied.canonical.videos?.[0].externalId).toBe("vid-1");
    }
  });

  it("rejects a video with no id", () => {
    const result = prepare(raw({ clips: [{ title: "Nameless" }] }));
    expect(result.outcome).toBe("rejected");
  });

  it("records an unmapped field name and never its value", () => {
    const result = prepare(raw({ crawler_notes: "secret-value" }));
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.unmappedFields).toContain("crawler_notes");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});
