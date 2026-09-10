import { KIND_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/kind-ingestion.constant";

/**
 * The canonical shape of a crawled podcast. `episodes` is structural: when the
 * crawl supplies it, it is the authoritative set — episodes it omits are
 * removed — and when the crawl omits it, the stored episodes are left alone.
 */
export const PODCAST_CANONICAL_FIELDS = [
  "externalId",
  "canonicalUrl",
  "sourcePlatform",
  "title",
  "description",
  "host",
  "imageCandidateUrl",
  "category",
  "durationMinutes",
  "language",
  "rawCategory",
  "episodes",
  "lastUpdatedAt",
  "crawledAt",
  "updatedAt",
] as const;

export const PODCAST_EPISODE_FIELDS = [
  "title",
  "description",
  "audioUrl",
  "durationMinutes",
  "episodeNumber",
  "publishedAt",
] as const;

export const PODCAST_EPISODE_LIMIT = 2_000;

/**
 * `episodeCount` is derived from the episode rows actually stored, never taken
 * from the crawler; `listeners` is platform state. `rating` and `ratingCount`
 * are the platform's `ContentReview` aggregates and are neither canonical nor
 * protected — a crawled rating lands in `unmappedFields`, dropped and recorded.
 */
export const PODCAST_PROTECTED_INPUT_FIELDS = [
  ...KIND_PROTECTED_INPUT_FIELDS,
  "episodeCount",
  "listeners",
] as const;
