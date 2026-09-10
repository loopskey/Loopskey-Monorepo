import { KIND_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/kind-ingestion.constant";

/**
 * The canonical shape of a crawled YouTube channel. Unlike events and
 * podcasts, `subscribers`, `views` and `videoCount` are canonical: for a
 * channel these are the source's own public figures, not platform state.
 * `videos` is structural — an omitted `videos` field leaves stored videos
 * untouched; a supplied array upserts those videos and removes none.
 */
export const YOUTUBE_CANONICAL_FIELDS = [
  "externalId",
  "canonicalUrl",
  "sourcePlatform",
  "title",
  "description",
  "imageCandidateUrl",
  "channelUrl",
  "category",
  "subscribers",
  "views",
  "videoCount",
  "language",
  "rawCategory",
  "videos",
  "lastUpdatedAt",
  "crawledAt",
  "updatedAt",
] as const;

export const YOUTUBE_VIDEO_FIELDS = [
  "externalId",
  "title",
  "description",
  "videoUrl",
  "durationMinutes",
  "views",
  "likes",
  "publishedAt",
] as const;

export const YOUTUBE_VIDEO_LIMIT = 2_000;

/**
 * `rating` and `ratingCount` are the platform's `ContentReview` aggregates and
 * are neither canonical nor protected — a crawled rating lands in
 * `unmappedFields`, dropped and recorded.
 */
export const YOUTUBE_PROTECTED_INPUT_FIELDS = [
  ...KIND_PROTECTED_INPUT_FIELDS,
] as const;
