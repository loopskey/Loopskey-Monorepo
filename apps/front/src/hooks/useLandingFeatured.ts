"use client";

import {
  CourseSortField,
  EventSortDirection,
  EventSortField,
  PodcastSortDirection,
  PodcastSortField,
  SortDirection,
  YouTubeChannelSortDirection,
  YouTubeChannelSortField,
} from "@/lib/graphql/base";
import { TLandingContentKind, TLandingTab } from "@/types/landing-module.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TLandingContentItem } from "@/types/landing-module.types";
import {
  humanizeEnumValue,
  translateWithFallback,
} from "@/utils/function-helper";
import { LANDING_HUB_TAKE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import type { I18nContextValue } from "@/types/providers.types";

import {
  LANDING_SHELF_KINDS,
  LANDING_SHELF_SIZE,
  getNextLandingKind,
} from "@/utils/landing-shelf.constant";

import * as PodcastApi from "@/lib/rtk/endpoints/podcast.api";
import * as YouTubeApi from "@/lib/rtk/endpoints/youtube.api";
import * as CourseApi from "@/lib/rtk/endpoints/course.api";
import * as EventApi from "@/lib/rtk/endpoints/event.api";

const pickShelfItems = <T>(items: T[]) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex], cloned[index]];
  }
  return cloned.slice(0, LANDING_SHELF_SIZE);
};

const categoryLabel = (
  t: I18nContextValue["t"],
  prefix: string,
  value: string,
) =>
  translateWithFallback(
    t,
    `content.enums.${prefix}.${value}`,
    humanizeEnumValue(value),
  );

export const getLandingViewAllHref = (tab: TLandingContentKind) => {
  if (tab === "course") return "/content";
  if (tab === "event") return "/content?tab=events";
  if (tab === "podcast") return "/content?tab=podcasts";
  return "/content?tab=youtube";
};

export const useLandingFeatured = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TLandingContentKind>("course");
  const autoAdvancedRef = useRef(false);
  const skippedTabsRef = useRef(0);

  const tabs = useMemo<TLandingTab[]>(
    () => [
      {
        value: "course",
        label: t("landing.learningHub.tabs.courses"),
      },
      {
        value: "event",
        label: t("landing.learningHub.tabs.events"),
      },
      {
        value: "podcast",
        label: t("landing.learningHub.tabs.podcasts"),
      },
      {
        value: "youtube",
        label: t("landing.learningHub.tabs.youtube"),
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
        field: CourseSortField.CreatedAt,
        direction: SortDirection.Desc,
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
        field: EventSortField.StartDate,
        direction: EventSortDirection.Asc,
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
        field: PodcastSortField.CreatedAt,
        direction: PodcastSortDirection.Desc,
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
        field: YouTubeChannelSortField.CreatedAt,
        direction: YouTubeChannelSortDirection.Desc,
      },
    },
    {
      skip: activeTab !== "youtube",
    },
  );

  const courseItems = useMemo<TLandingContentItem[]>(() => {
    return pickShelfItems(
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
        category: categoryLabel(t, "courseCategory", course.category),
        categoryKey: course.category,
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
    return pickShelfItems(
      eventsQuery.data?.items.map((event) => ({
        id: event.id,
        kind: "event",
        slug: event.slug,
        status: event.type,
        title: event.title,
        isFree: event.isFree,
        imageUrl: event.imageUrl,
        currency: event.currency,
        category: categoryLabel(t, "eventCategory", event.category),
        categoryKey: event.category,
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
    return pickShelfItems(
      podcastsQuery.data?.items.map((podcast) => ({
        id: podcast.id,
        kind: "podcast",
        slug: podcast.slug,
        title: podcast.title,
        rating: podcast.rating,
        status: podcast.status,
        category: categoryLabel(t, "podcastCategory", podcast.category),
        categoryKey: podcast.category,
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
    return pickShelfItems(
      youtubeQuery.data?.items.map((channel) => ({
        id: channel.id,
        kind: "youtube",
        slug: channel.slug,
        title: channel.title,
        status: channel.status,
        rating: channel.rating,
        category: categoryLabel(t, "youtubeCategory", channel.category),
        categoryKey: channel.category,
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

  const activeQuery = {
    course: coursesQuery,
    event: eventsQuery,
    podcast: podcastsQuery,
    youtube: youtubeQuery,
  }[activeTab];

  const isLoading = activeQuery.isLoading || activeQuery.isFetching;
  const isError = activeQuery.isError;
  const totalCount = activeQuery.data?.totalCount;
  const refetch = activeQuery.refetch;

  const selectTab = useCallback((tab: TLandingContentKind) => {
    autoAdvancedRef.current = false;
    skippedTabsRef.current = 0;
    setActiveTab(tab);
  }, []);

  const goToNextTab = useCallback(() => {
    autoAdvancedRef.current = true;
    setActiveTab((current) => getNextLandingKind(current));
  }, []);

  useEffect(() => {
    if (!autoAdvancedRef.current || isLoading) return;
    if (items.length) {
      skippedTabsRef.current = 0;
      return;
    }
    skippedTabsRef.current += 1;
    if (skippedTabsRef.current >= LANDING_SHELF_KINDS.length) {
      autoAdvancedRef.current = false;
      return;
    }
    setActiveTab((current) => getNextLandingKind(current));
  }, [items, isLoading]);

  return {
    t,
    tabs,
    items,
    isError,
    refetch,
    activeTab,
    totalCount,
    isLoading,
    selectTab,
    goToNextTab,
    viewAllHref: getLandingViewAllHref(activeTab),
  };
};
