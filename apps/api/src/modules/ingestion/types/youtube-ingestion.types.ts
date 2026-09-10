import type { CanonicalYouTubeInput } from "@ingestion/dtos/canonical-youtube.input";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";

export type YouTubeVideoCanonical = {
  externalId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  views: number | null;
  likes: number | null;
  publishedAt: string | null;
};

/**
 * `videos` is `null` when the crawl omitted the field (leave stored videos
 * alone) and an array when the crawl supplied one. A supplied array upserts
 * its videos; it does not delete videos it omits, because a channel crawl
 * routinely carries only a recent slice.
 */
export type YouTubeCanonical = {
  core: CanonicalYouTubeInput;
  videos: YouTubeVideoCanonical[] | null;
};

export type PreparedYouTubeItem = PreparedKindItem<YouTubeCanonical>;
