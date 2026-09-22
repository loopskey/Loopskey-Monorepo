import { Prisma } from "@prisma/client";

import { COURSE_CANONICAL_FIELDS } from "@ingestion/enums/course-ingestion.constant";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";

type Landing = {
  model: string;
  canonicalFields: readonly string[];
  columns: Record<string, string>;
  childSets: readonly string[];
  withoutOwnColumn: readonly string[];
};

const columnsOf = (model: string) => {
  const found = Prisma.dmmf.datamodel.models.find(
    (candidate) => candidate.name === model,
  );
  if (!found) throw new Error(`${model} is not in the Prisma datamodel.`);
  return new Set(found.fields.map((field) => field.name));
};

const PROVENANCE_COLUMNS = {
  sourcePlatform: "sourcePlatform",
  language: "sourceLanguage",
  rawCategory: "rawCategory",
  crawledAt: "crawledAt",
  lastUpdatedAt: "lastUpdatedAt",
} as const;

const IDENTITY_COLUMNS = {
  externalId: "externalRef",
  canonicalUrl: "sourceUrl",
} as const;

const WITHOUT_OWN_COLUMN = ["imageCandidateUrl", "updatedAt"] as const;

const LANDINGS: Landing[] = [
  {
    model: "Course",
    canonicalFields: COURSE_CANONICAL_FIELDS,
    columns: {
      ...IDENTITY_COLUMNS,
      ...PROVENANCE_COLUMNS,
      title: "title",
      description: "description",
      instructor: "instructor",
      category: "category",
      level: "level",
      requirements: "requirements",
      learnings: "learnings",
      price: "price",
      currency: "currency",
      isFree: "isFree",
      durationMinutes: "durationMinutes",
      rawLevel: "rawLevel",
      rawDuration: "rawDuration",
      internalCategory: "internalCategory",
      offersCertificate: "offersCertificate",
      creditValue: "creditValue",
      creditSource: "creditSource",
      creditConfidence: "creditConfidence",
    },
    childSets: [],
    withoutOwnColumn: [...WITHOUT_OWN_COLUMN, "contentType"],
  },
  {
    model: "Event",
    canonicalFields: EVENT_CANONICAL_FIELDS,
    columns: {
      ...IDENTITY_COLUMNS,
      ...PROVENANCE_COLUMNS,
      title: "title",
      description: "description",
      speaker: "speaker",
      organizer: "organizer",
      type: "type",
      deliveryMode: "deliveryMode",
      category: "category",
      startDate: "startDate",
      endDate: "endDate",
      timezone: "timezone",
      location: "location",
      onlineUrl: "onlineUrl",
      price: "price",
      currency: "currency",
      isFree: "isFree",
      pdu: "pdu",
      topic: "topic",
      rawType: "rawType",
      rawDeliveryMode: "rawDeliveryMode",
    },
    childSets: ["scheduleItems"],
    withoutOwnColumn: WITHOUT_OWN_COLUMN,
  },
  {
    model: "Podcast",
    canonicalFields: PODCAST_CANONICAL_FIELDS,
    columns: {
      ...IDENTITY_COLUMNS,
      ...PROVENANCE_COLUMNS,
      title: "title",
      description: "description",
      host: "host",
      category: "category",
      durationMinutes: "durationMinutes",
    },
    childSets: ["episodes"],
    withoutOwnColumn: WITHOUT_OWN_COLUMN,
  },
  {
    model: "YouTubeChannel",
    canonicalFields: YOUTUBE_CANONICAL_FIELDS,
    columns: {
      ...IDENTITY_COLUMNS,
      ...PROVENANCE_COLUMNS,
      title: "title",
      description: "description",
      channelUrl: "channelUrl",
      category: "category",
      subscribers: "subscribers",
      views: "views",
      videoCount: "videoCount",
    },
    childSets: ["videos"],
    withoutOwnColumn: WITHOUT_OWN_COLUMN,
  },
];

describe("canonical ingestion fields land on the catalog row", () => {
  it.each(LANDINGS)(
    "$model accounts for every canonical field",
    ({ canonicalFields, columns, childSets, withoutOwnColumn }) => {
      const accounted = new Set([
        ...Object.keys(columns),
        ...childSets,
        ...withoutOwnColumn,
      ]);
      const unaccounted = canonicalFields.filter(
        (field) => !accounted.has(field),
      );

      expect(unaccounted).toEqual([]);
    },
  );

  it.each(LANDINGS)("$model has every mapped column", ({ model, columns }) => {
    const existing = columnsOf(model);
    const missing = Object.values(columns).filter(
      (column) => !existing.has(column),
    );

    expect(missing).toEqual([]);
  });

  it.each(LANDINGS)(
    "$model keeps crawl provenance out of the platform language enum",
    ({ model, columns }) => {
      expect(columns.language).toBe("sourceLanguage");
      expect(columnsOf(model).has("sourceLanguage")).toBe(true);
    },
  );
});
