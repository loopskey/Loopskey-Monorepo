export const COURSE_INGESTION_CONTRACT_VERSION = "1.0";
export const COURSE_INGESTION_ITEM_LIMIT = 100;
export const COURSE_INGESTION_COMPRESSED_BODY_LIMIT_BYTES = 1_048_576;
export const COURSE_INGESTION_IDEMPOTENCY_KEY_LIMIT = 200;
export const COURSE_INGESTION_EVENT_NAME = "ingestion.item.published";
export const COURSE_INGESTION_EVENT_VERSION = 1;

export const COURSE_CANONICAL_FIELDS = [
  "externalId",
  "canonicalUrl",
  "sourcePlatform",
  "title",
  "description",
  "instructor",
  "imageCandidateUrl",
  "category",
  "level",
  "requirements",
  "learnings",
  "price",
  "currency",
  "isFree",
  "durationMinutes",
  "lastUpdatedAt",
  "rawCategory",
  "rawLevel",
  "rawDuration",
  "language",
  "contentType",
  "internalCategory",
  "offersCertificate",
  "creditValue",
  "creditSource",
  "creditConfidence",
  "crawledAt",
  "updatedAt",
] as const;

export const COURSE_PROTECTED_INPUT_FIELDS = [
  "sourceId",
  "status",
  "autoPublish",
  "providerId",
  "isFeatured",
] as const;
