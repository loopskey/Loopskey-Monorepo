/**
 * Limits shared by every content kind's ingestion endpoint. Phase 03 fixed
 * these values for courses; phases 05 onward reuse them unchanged so one
 * crawler integration meets one set of limits regardless of kind.
 */
export const KIND_INGESTION_CONTRACT_VERSION = "1.0";
export const KIND_INGESTION_ITEM_LIMIT = 100;
export const KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES = 1_048_576;
export const KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT = 200;

/**
 * The same versioned event phase 03 appends for a course, now emitted for an
 * item of any kind. The payload carries the kind so a consumer can route
 * without a second lookup.
 */
export const KIND_INGESTION_EVENT_NAME = "ingestion.item.published";
export const KIND_INGESTION_EVENT_VERSION = 1;

/**
 * Fields the platform owns on every catalog model. A crawled payload that
 * carries any of them is rejected rather than having the value dropped, so a
 * misconfigured crawler is told rather than silently ignored. Kind-specific
 * protected fields are added to this list by each kind's constants.
 */
export const KIND_PROTECTED_INPUT_FIELDS = [
  "id",
  "sourceId",
  "status",
  "autoPublish",
  "providerId",
  "provider",
  "providerUser",
  "userId",
  "user",
  "isFeatured",
  "deletedAt",
] as const;

export const KIND_INGESTION_PERSIST_ATTEMPTS = 7;
