"use client";

import { TLandingContentKind, TLandingTab } from "@/types/landing-module.types";
import { useEffect, useMemo, useState } from "react";
import { TLandingContentItem } from "@/types/landing-module.types";
import { LANDING_HUB_TAKE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as PodcastApi from "@/lib/rtk/endpoints/podcast.api";
import * as YouTubeApi from "@/lib/rtk/endpoints/youtube.api";
import * as CourseApi from "@/lib/rtk/endpoints/course.api";
import * as EventApi from "@/lib/rtk/endpoints/event.api";
import * as API from "@/lib/graphql/generated";

const shuffleItems = <T>(items: T[]) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }
  return cloned;
};

export const getLandingViewAllHref = (tab: TLandingContentKind) => {
  if (tab === "course") return "/content";
  if (tab === "event") return "/content?tab=events";
  if (tab === "podcast") return "/content?tab=podcasts";
  return "/content?tab=youtube";
};

export const useLandingFeatured = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TLandingContentKind>("course");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const tabs = useMemo<TLandingTab[]>(
    () => [
      {
        value: "course",
        label: t("landing.learningHub.tabs.courses"),
        description: t("landing.learningHub.tabs.coursesDescription"),
      },
      {
        value: "event",
        label: t("landing.learningHub.tabs.events"),
        description: t("landing.learningHub.tabs.eventsDescription"),
      },
      {
        value: "podcast",
        label: t("landing.learningHub.tabs.podcasts"),
        description: t("landing.learningHub.tabs.podcastsDescription"),
      },
      {
        value: "youtube",
        label: t("landing.learningHub.tabs.youtube"),
        description: t("landing.learningHub.tabs.youtubeDescription"),
      },
    ],
    [t],
  );

  const coursesQuery = CourseApi.useCoursesQuery(
    {
      pagination: {
        take: LANDING_HUB_TAKE,
      },
      sort: {
        field: API.CourseSortField.CreatedAt,
        direction: API.SortDirection.Desc,
      },
    },
    {
      skip: activeTab !== "course",
    },
  );

  const eventsQuery = EventApi.useEventsQuery(
    {
      pagination: {
        take: LANDING_HUB_TAKE,
      },
      sort: {
        field: API.EventSortField.StartDate,
        direction: API.EventSortDirection.Asc,
      },
    },
    {
      skip: activeTab !== "event",
    },
  );

  const podcastsQuery = PodcastApi.usePodcastsQuery(
    {
      pagination: {
        take: LANDING_HUB_TAKE,
      },
      sort: {
        field: API.PodcastSortField.CreatedAt,
        direction: API.PodcastSortDirection.Desc,
      },
    },
    {
      skip: activeTab !== "podcast",
    },
  );

  const youtubeQuery = YouTubeApi.useYoutubeChannelsQuery(
    {
      pagination: {
        take: LANDING_HUB_TAKE,
      },
      sort: {
        field: API.YouTubeChannelSortField.CreatedAt,
        direction: API.YouTubeChannelSortDirection.Desc,
      },
    },
    {
      skip: activeTab !== "youtube",
    },
  );

  const courseItems = useMemo<TLandingContentItem[]>(() => {
    return shuffleItems(
      coursesQuery.data?.items.map((course) => ({
        id: course.id,
        kind: "course",
        slug: course.slug,
        title: course.title,
        status: course.level,
        rating: course.rating,
        isFree: course.isFree,
        currency: course.currency,
        imageUrl: course.imageUrl,
        category: course.category,
        price: course.price ?? null,
        ratingCount: course.ratingCount,
        description: course.description,
        metaPrimary: t("landing.learningHub.meta.professionals", {
          count: course.professionals ?? 0,
        }),
        metaSecondary: course.durationMinutes
          ? t("landing.learningHub.meta.minutes", {
              count: course.durationMinutes,
            })
          : null,
        href: `/courses/${course.slug}`,
      })) ?? [],
    );
  }, [coursesQuery.data, t]);

  const eventItems = useMemo<TLandingContentItem[]>(() => {
    return shuffleItems(
      eventsQuery.data?.items.map((event) => ({
        id: event.id,
        kind: "event",
        slug: event.slug,
        status: event.type,
        title: event.title,
        isFree: event.isFree,
        imageUrl: event.imageUrl,
        currency: event.currency,
        category: event.category,
        price: event.price ?? null,
        ratingCount: event.ratingCount,
        description: event.description,
        rating: event.averageRating ?? event.rating,
        metaPrimary: event.startDate
          ? new Date(event.startDate).toLocaleDateString()
          : t("landing.learningHub.meta.upcoming"),
        metaSecondary: t("landing.learningHub.meta.attendees", {
          count: event.attendees ?? 0,
        }),
        href: `/events/${event.slug}`,
      })) ?? [],
    );
  }, [eventsQuery.data, t]);

  const podcastItems = useMemo<TLandingContentItem[]>(() => {
    return shuffleItems(
      podcastsQuery.data?.items.map((podcast) => ({
        id: podcast.id,
        kind: "podcast",
        slug: podcast.slug,
        title: podcast.title,
        rating: podcast.rating,
        status: podcast.status,
        category: podcast.category,
        imageUrl: podcast.imageUrl,
        description: podcast.description,
        ratingCount: podcast.ratingCount,
        metaPrimary: t("landing.learningHub.meta.listeners", {
          count: podcast.listeners ?? 0,
        }),
        metaSecondary: t("landing.learningHub.meta.episodes", {
          count: podcast.episodeCount ?? 0,
        }),
        href: `/podcasts/${podcast.slug}`,
      })) ?? [],
    );
  }, [podcastsQuery.data, t]);

  const youtubeItems = useMemo<TLandingContentItem[]>(() => {
    return shuffleItems(
      youtubeQuery.data?.items.map((channel) => ({
        id: channel.id,
        kind: "youtube",
        slug: channel.slug,
        title: channel.title,
        status: channel.status,
        rating: channel.rating,
        category: channel.category,
        imageUrl: channel.imageUrl,
        description: channel.description,
        ratingCount: channel.ratingCount,
        metaPrimary: t("landing.learningHub.meta.subscribers", {
          count: channel.subscribers ?? 0,
        }),
        metaSecondary: t("landing.learningHub.meta.videos", {
          count: channel.videoCount ?? 0,
        }),
        href: `/youtube/${channel.slug}`,
      })) ?? [],
    );
  }, [youtubeQuery.data, t]);

  const items = useMemo(() => {
    if (activeTab === "course") return courseItems;
    if (activeTab === "event") return eventItems;
    if (activeTab === "podcast") return podcastItems;
    return youtubeItems;
  }, [activeTab, courseItems, eventItems, podcastItems, youtubeItems]);

  const isLoading =
    activeTab === "course"
      ? coursesQuery.isLoading || coursesQuery.isFetching
      : activeTab === "event"
        ? eventsQuery.isLoading || eventsQuery.isFetching
        : activeTab === "podcast"
          ? podcastsQuery.isLoading || podcastsQuery.isFetching
          : youtubeQuery.isLoading || youtubeQuery.isFetching;

  const totalCount =
    activeTab === "course"
      ? coursesQuery.data?.totalCount
      : activeTab === "event"
        ? eventsQuery.data?.totalCount
        : activeTab === "podcast"
          ? podcastsQuery.data?.totalCount
          : youtubeQuery.data?.totalCount;

  useEffect(() => {
    setHoveredItemId(null);
  }, [activeTab]);

  const spotlight = useMemo(() => {
    if (!items.length) return null;
    if (hoveredItemId) {
      const hovered = items.find((item) => item.id === hoveredItemId);
      if (hovered) return hovered;
    }
    return items[0];
  }, [items, hoveredItemId]);

  return {
    t,
    tabs,
    items,
    spotlight,
    activeTab,
    totalCount,
    isLoading,
    setActiveTab,
    setHoveredItemId,
    viewAllHref: getLandingViewAllHref(activeTab),
  };
};
