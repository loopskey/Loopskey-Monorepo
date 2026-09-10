import type { CanonicalPodcastInput } from "@ingestion/dtos/canonical-podcast.input";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";

export type PodcastEpisodeCanonical = {
  episodeNumber: number;
  title: string;
  description: string | null;
  audioUrl: string | null;
  durationMinutes: number | null;
  publishedAt: string | null;
};

/**
 * `episodes` is `null` when the crawl omitted the field (leave stored episodes
 * alone) and an array — possibly empty — when the crawl supplied one (that
 * array is the authoritative set). `skippedEpisodeCount` records episodes the
 * crawl sent without a number: they are dropped, the podcast and its numbered
 * episodes still land.
 */
export type PodcastCanonical = {
  core: CanonicalPodcastInput;
  episodes: PodcastEpisodeCanonical[] | null;
  skippedEpisodeCount: number;
};

export type PreparedPodcastItem = PreparedKindItem<PodcastCanonical>;
