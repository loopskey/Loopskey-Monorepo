import { EventIngestionPipeline } from "@ingestion/services/event-ingestion-pipeline.service";

const FIELD_MAP: Record<string, string> = {
  external_id: "externalId",
  url: "canonicalUrl",
  name: "title",
  summary: "description",
  kind: "type",
  mode: "deliveryMode",
  topic_area: "category",
  starts_at: "startDate",
  ends_at: "endDate",
  tz: "timezone",
  agenda: "scheduleItems",
};

const raw = (overrides: Record<string, unknown> = {}) => ({
  external_id: "evt-1",
  url: "https://example.com/events/summit",
  name: "Data Summit 2026",
  summary: "A one-day summit about data platforms.",
  kind: "conference",
  mode: "in person",
  topic_area: "technology",
  starts_at: "2026-05-01T09:00:00.000Z",
  ends_at: "2026-05-01T17:00:00.000Z",
  tz: "Europe/Paris",
  ...overrides,
});

describe("EventIngestionPipeline", () => {
  const pipeline = new EventIngestionPipeline();
  const prepare = (item: unknown) => pipeline.prepare(item, FIELD_MAP, false);

  it("normalises a well-formed event", () => {
    const result = prepare(raw());
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.canonical.core.type).toBe("CONFERENCE");
    expect(result.canonical.core.deliveryMode).toBe("IN_PERSON");
    expect(result.canonical.core.category).toBe("TECHNOLOGY");
    expect(result.canonical.core.timezone).toBe("Europe/Paris");
    expect(result.canonical.scheduleItems).toBeNull();
  });

  it("requires a start date and a timezone", () => {
    expect(prepare(raw({ starts_at: undefined })).outcome).toBe("rejected");
    expect(prepare(raw({ tz: undefined })).outcome).toBe("rejected");
  });

  it("rejects an event whose end date precedes its start", () => {
    const result = prepare(raw({ ends_at: "2026-04-30T09:00:00.000Z" }));
    expect(result.outcome).toBe("rejected");
    if (result.outcome !== "rejected") return;
    expect(result.reason).toContain("INGESTION_EVENT_DATE_RANGE_INVALID");
  });

  it("rejects a payload that carries a platform-owned field", () => {
    for (const field of [
      "capacity",
      "attendees",
      "views",
      "registrationEnabled",
      "isFeatured",
    ]) {
      const result = prepare(raw({ [field]: 1 }));
      expect(result.outcome).toBe("rejected");
      if (result.outcome === "rejected")
        expect(result.reason).toContain("owned by the platform");
    }
  });

  it("distinguishes an omitted schedule from an empty one", () => {
    const omitted = prepare(raw());
    const empty = prepare(raw({ agenda: [] }));
    expect(omitted.outcome).toBe("accepted");
    expect(empty.outcome).toBe("accepted");
    if (omitted.outcome === "accepted")
      expect(omitted.canonical.scheduleItems).toBeNull();
    if (empty.outcome === "accepted")
      expect(empty.canonical.scheduleItems).toEqual([]);
  });

  it("replaces the schedule with a supplied set, sorted by day and start", () => {
    const result = prepare(
      raw({
        agenda: [
          {
            dayNumber: 2,
            startTime: "2026-05-02T09:00:00.000Z",
            endTime: "2026-05-02T10:00:00.000Z",
            title: "Keynote two",
          },
          {
            dayNumber: 1,
            startTime: "2026-05-01T09:00:00.000Z",
            endTime: "2026-05-01T10:00:00.000Z",
            title: "Keynote one",
          },
        ],
      }),
    );
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.canonical.scheduleItems?.map((item) => item.title)).toEqual([
      "Keynote one",
      "Keynote two",
    ]);
  });

  it("rejects a schedule item whose end precedes its start", () => {
    const result = prepare(
      raw({
        agenda: [
          {
            dayNumber: 1,
            startTime: "2026-05-01T11:00:00.000Z",
            endTime: "2026-05-01T10:00:00.000Z",
            title: "Backwards",
          },
        ],
      }),
    );
    expect(result.outcome).toBe("rejected");
  });

  it("records an unmapped field name and never its value", () => {
    const result = prepare(raw({ internal_notes: "secret-value" }));
    expect(result.outcome).toBe("accepted");
    if (result.outcome !== "accepted") return;
    expect(result.unmappedFields).toContain("internal_notes");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});
