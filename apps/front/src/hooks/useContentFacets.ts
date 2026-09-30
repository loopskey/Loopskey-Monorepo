"use client";

import { useMemo } from "react";

import * as YouTubeApi from "@lib/rtk/endpoints/youtube.api";
import * as PodcastApi from "@lib/rtk/endpoints/podcast.api";
import * as CourseApi from "@lib/rtk/endpoints/course.api";
import * as EventApi from "@lib/rtk/endpoints/event.api";
import * as T from "@/types/content-module.types";

/**
 * A catalogue change made outside this session (a crawler run, another
 * admin) has no push channel, so the options are re-read when the tab is
 * focused again or the connection returns. An in-session publish/archive
 * already invalidates the shared content tag.
 */
const REFETCH_ON_LIFECYCLE = {
  refetchOnFocus: true,
  refetchOnReconnect: true,
} as const;

const facetState = (query: {
  isLoading: boolean;
  error?: unknown;
  refetch: () => unknown;
}): T.TFacetState => ({
  isLoading: query.isLoading,
  hasError: Boolean(query.error),
  onRetry: () => void query.refetch(),
});

/**
 * Filter options for the active tab, read from the published catalogue.
 *
 * Only the active tab is requested: switching tabs reuses whatever RTK Query
 * already holds and fetches the newly active one. A failed facet read never
 * falls back to the full enum, because an option nothing is published under
 * would return an empty list.
 */
export const useContentFacets = (activeTab: T.TContentTab) => {
  const courses = CourseApi.useCourseFilterFacetsQuery(undefined, {
    skip: activeTab !== "courses",
    ...REFETCH_ON_LIFECYCLE,
  });
  const events = EventApi.useEventFilterFacetsQuery(undefined, {
    skip: activeTab !== "events",
    ...REFETCH_ON_LIFECYCLE,
  });
  const podcasts = PodcastApi.usePodcastFilterFacetsQuery(undefined, {
    skip: activeTab !== "podcasts",
    ...REFETCH_ON_LIFECYCLE,
  });
  const youtube = YouTubeApi.useYoutubeChannelFilterFacetsQuery(undefined, {
    skip: activeTab !== "youtube",
    ...REFETCH_ON_LIFECYCLE,
  });

  return useMemo(
    () => ({
      courses: {
        state: facetState(courses),
        categories: courses.data?.categories ?? [],
        levels: courses.data?.levels ?? [],
        ratings: courses.data?.ratings ?? [],
      },
      events: {
        state: facetState(events),
        categories: events.data?.categories ?? [],
        types: events.data?.types ?? [],
      },
      podcasts: {
        state: facetState(podcasts),
        categories: podcasts.data?.categories ?? [],
      },
      youtube: {
        state: facetState(youtube),
        categories: youtube.data?.categories ?? [],
      },
    }),
    [courses, events, podcasts, youtube],
  );
};
