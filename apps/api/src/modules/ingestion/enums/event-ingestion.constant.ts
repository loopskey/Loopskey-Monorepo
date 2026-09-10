import { KIND_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/kind-ingestion.constant";

/**
 * The canonical shape of a crawled event, after the source's field map has
 * renamed the crawler's own field names onto these. `scheduleItems` is
 * structural rather than a scalar: it is read straight from the mapped payload
 * and, when present, replaces the event's schedule as a set.
 */
export const EVENT_CANONICAL_FIELDS = [
  "externalId",
  "canonicalUrl",
  "sourcePlatform",
  "title",
  "description",
  "speaker",
  "organizer",
  "imageCandidateUrl",
  "type",
  "deliveryMode",
  "category",
  "startDate",
  "endDate",
  "timezone",
  "location",
  "onlineUrl",
  "price",
  "currency",
  "isFree",
  "pdu",
  "language",
  "topic",
  "rawType",
  "rawDeliveryMode",
  "rawCategory",
  "scheduleItems",
  "lastUpdatedAt",
  "crawledAt",
  "updatedAt",
] as const;

export const EVENT_SCHEDULE_ITEM_FIELDS = [
  "dayNumber",
  "startTime",
  "endTime",
  "title",
  "description",
  "speaker",
] as const;

export const EVENT_SCHEDULE_ITEM_LIMIT = 200;

/**
 * `capacity`, `attendees`, `views` and `registrationEnabled` are platform
 * state; the early-bird and promotion fields are the platform's marketing
 * surface. A crawled event that carries any of them by name is rejected rather
 * than having the value dropped.
 *
 * `rating`, `ratingCount` and `averageRating` are deliberately absent: they are
 * the platform's own `ContentReview` aggregates, so a crawled rating is neither
 * canonical nor protected — it simply lands in `unmappedFields`, its value
 * dropped and its name recorded, and the platform's figure is left to win.
 */
export const EVENT_PROTECTED_INPUT_FIELDS = [
  ...KIND_PROTECTED_INPUT_FIELDS,
  "capacity",
  "attendees",
  "views",
  "registrationEnabled",
  "registrations",
  "earlyBirdDiscount",
  "earlyBirdDiscountPercent",
  "earlyBirdEndsAt",
  "promotionVideoUrl",
  "promotionalVideoUrl",
  "promotionRequests",
] as const;
