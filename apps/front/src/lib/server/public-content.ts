import { cache } from "react";

import { CourseBySlugDocument } from "@/lib/graphql/operations/course";
import { EventBySlugDocument } from "@/lib/graphql/operations/event";
import { PodcastBySlugDocument } from "@/lib/graphql/operations/podcast";
import { PodcastEpisodesDocument } from "@/lib/graphql/operations/podcast";
import { YouTubeChannelBySlugDocument } from "@/lib/graphql/operations/youtube";
import { YouTubeVideosDocument } from "@/lib/graphql/operations/youtube";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { executeServerGraphql } from "@/lib/server/graphql-server";

import type { CourseBySlugQuery } from "@/lib/graphql/operations/course";
import type { EventBySlugQuery } from "@/lib/graphql/operations/event";
import type { PodcastBySlugQuery } from "@/lib/graphql/operations/podcast";
import type { PodcastEpisodesQuery } from "@/lib/graphql/operations/podcast";
import type { YouTubeChannelBySlugQuery } from "@/lib/graphql/operations/youtube";
import type { YouTubeVideosQuery } from "@/lib/graphql/operations/youtube";

export type PublicCourse = NonNullable<CourseBySlugQuery["courseBySlug"]>;
export type PublicEvent = NonNullable<EventBySlugQuery["eventBySlug"]>;
export type PublicPodcast = NonNullable<PodcastBySlugQuery["podcastBySlug"]>;
export type PublicPodcastEpisode =
  PodcastEpisodesQuery["podcastEpisodes"][number];
export type PublicYouTubeChannel = NonNullable<
  YouTubeChannelBySlugQuery["youtubeChannelBySlug"]
>;
export type PublicYouTubeVideo = YouTubeVideosQuery["youtubeVideos"][number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX_LENGTH = 200;
const PUBLISHED_STATUS = "PUBLISHED";

type Settled<T> =
  | { ok: true; value: T }
  | { ok: false; error: UpstreamFailureError };

const settle = async <T>(read: () => Promise<T>): Promise<Settled<T>> => {
  try {
    return { ok: true, value: await read() };
  } catch (error) {
    if (error instanceof UpstreamFailureError) return { ok: false, error };
    throw error;
  }
};

const unwrap = <T>(settled: Settled<T>): T => {
  if (!settled.ok) throw settled.error;
  return settled.value;
};

const isValidSlug = (slug: string) =>
  slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);

const isPublished = (value: Record<string, unknown>) =>
  !("status" in value) || value.status === PUBLISHED_STATUS;

type DetailRead = {
  operation: string;
  document: { toString(): string };
  field: string;
  slug: string;
};

const readBySlug = async <T>({
  operation,
  document,
  field,
  slug,
}: DetailRead): Promise<T | null> => {
  if (!isValidSlug(slug)) return null;
  const result = await executeServerGraphql({
    operation,
    document,
    field,
    variables: { slug },
  });
  if (result.kind === "not-found" || !isPublished(result.value)) return null;
  return result.value as T;
};

const readChildren = async <T>(
  operation: string,
  document: { toString(): string },
  field: string,
  variables: Record<string, string>,
): Promise<T[]> => {
  const result = await executeServerGraphql({
    operation,
    document,
    field,
    variables,
  });
  return result.kind === "found" ? (result.value as unknown as T[]) : [];
};

const memoize = <T>(read: (key: string) => Promise<T>) => {
  const settled = cache((key: string) => settle(() => read(key)));
  return async (key: string) => unwrap(await settled(key));
};

export const getPublicCourse = memoize((slug) =>
  readBySlug<PublicCourse>({
    slug,
    field: "courseBySlug",
    operation: "CourseBySlug",
    document: CourseBySlugDocument,
  }),
);

export const getPublicEvent = memoize((slug) =>
  readBySlug<PublicEvent>({
    slug,
    field: "eventBySlug",
    operation: "EventBySlug",
    document: EventBySlugDocument,
  }),
);

export const getPublicPodcast = memoize((slug) =>
  readBySlug<PublicPodcast>({
    slug,
    field: "podcastBySlug",
    operation: "PodcastBySlug",
    document: PodcastBySlugDocument,
  }),
);

export const getPublicYouTubeChannel = memoize((slug) =>
  readBySlug<PublicYouTubeChannel>({
    slug,
    field: "youtubeChannelBySlug",
    operation: "YouTubeChannelBySlug",
    document: YouTubeChannelBySlugDocument,
  }),
);

export const getPublicPodcastEpisodes = memoize((podcastId) =>
  readChildren<PublicPodcastEpisode>(
    "PodcastEpisodes",
    PodcastEpisodesDocument,
    "podcastEpisodes",
    { podcastId },
  ),
);

export const getPublicYouTubeVideos = memoize((channelId) =>
  readChildren<PublicYouTubeVideo>(
    "YouTubeVideos",
    YouTubeVideosDocument,
    "youtubeVideos",
    { channelId },
  ),
);
