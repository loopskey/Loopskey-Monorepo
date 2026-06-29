"use client";

import { HERO_SEARCH_TAKE, SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { TLandingHeroResultItem } from "@/types/landing-module.types";
import { TLandingHeroCategory } from "@/types/landing-module.types";
import { HERO_CATEGORY_TAKE } from "@utils/constant";
import { useMemo, useState } from "react";
import { getKindHrefPrefix } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { useI18n } from "@hooks/useI18n";

import * as PodcastApi from "@lib/rtk/endpoints/podcast.api";
import * as YouTubeApi from "@lib/rtk/endpoints/youtube.api";
import * as CourseApi from "@lib/rtk/endpoints/course.api";
import * as EventApi from "@lib/rtk/endpoints/event.api";
import * as API from "@lib/graphql/generated";

export const useLandingHeroSearch = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TLandingHeroCategory | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const hasSearch = debouncedSearch.length >= 2;
  const hasSelectedCategory = Boolean(selectedCategory);

  const categories = useMemo<TLandingHeroCategory[]>(
    () => [
      {
        id: "course-technology",
        kind: "course",
        value: API.CourseCategory.Technology,
        label: t("landing.hero.categories.technologyCourses"),
      },
      {
        id: "course-business",
        kind: "course",
        value: API.CourseCategory.Business,
        label: t("landing.hero.categories.businessCourses"),
      },
      {
        id: "course-leadership",
        kind: "course",
        value: API.CourseCategory.Leadership,
        label: t("landing.hero.categories.leadershipCourses"),
      },
      {
        id: "event-cpd",
        kind: "event",
        value: API.EventCategory.Cpd,
        label: t("landing.hero.categories.cpdEvents"),
      },
      {
        id: "event-compliance",
        kind: "event",
        value: API.EventCategory.Compliance,
        label: t("landing.hero.categories.complianceEvents"),
      },
      {
        id: "podcast-ai",
        kind: "podcast",
        value: API.PodcastCategory.Ai,
        label: t("landing.hero.categories.aiPodcasts"),
      },
      {
        id: "podcast-career",
        kind: "podcast",
        value: API.PodcastCategory.Career,
        label: t("landing.hero.categories.careerPodcasts"),
      },
      {
        id: "youtube-data",
        kind: "youtube",
        value: API.YouTubeCategory.Data,
        label: t("landing.hero.categories.dataYouTube"),
      },
      {
        id: "youtube-engineering",
        kind: "youtube",
        value: API.YouTubeCategory.Engineering,
        label: t("landing.hero.categories.engineeringYouTube"),
      },
    ],
    [t],
  );

  const courseFilter = {
    search: hasSearch ? debouncedSearch : undefined,
    category:
      selectedCategory?.kind === "course"
        ? (selectedCategory.value as API.CourseCategory)
        : undefined,
  };

  const eventFilter = {
    search: hasSearch ? debouncedSearch : undefined,
    category:
      selectedCategory?.kind === "event"
        ? (selectedCategory.value as API.EventCategory)
        : undefined,
  };

  const podcastFilter = {
    search: hasSearch ? debouncedSearch : undefined,
    category:
      selectedCategory?.kind === "podcast"
        ? (selectedCategory.value as API.PodcastCategory)
        : undefined,
  };

  const youtubeFilter = {
    search: hasSearch ? debouncedSearch : undefined,
    category:
      selectedCategory?.kind === "youtube"
        ? (selectedCategory.value as API.YouTubeCategory)
        : undefined,
  };

  const take = hasSearch ? HERO_SEARCH_TAKE : HERO_CATEGORY_TAKE;

  const coursesQuery = CourseApi.useCoursesQuery(
    {
      filter: courseFilter,
      pagination: { take },
      sort: {
        field: API.CourseSortField.CreatedAt,
        direction: API.SortDirection.Desc,
      },
    },
    {
      skip:
        !hasSearch &&
        (!hasSelectedCategory || selectedCategory?.kind !== "course"),
    },
  );

  const eventsQuery = EventApi.useEventsQuery(
    {
      filter: eventFilter,
      pagination: { take },
      sort: {
        field: API.EventSortField.StartDate,
        direction: API.EventSortDirection.Asc,
      },
    },
    {
      skip:
        !hasSearch &&
        (!hasSelectedCategory || selectedCategory?.kind !== "event"),
    },
  );

  const podcastsQuery = PodcastApi.usePodcastsQuery(
    {
      filter: podcastFilter,
      pagination: { take },
      sort: {
        field: API.PodcastSortField.CreatedAt,
        direction: API.PodcastSortDirection.Desc,
      },
    },
    {
      skip:
        !hasSearch &&
        (!hasSelectedCategory || selectedCategory?.kind !== "podcast"),
    },
  );

  const youtubeQuery = YouTubeApi.useYoutubeChannelsQuery(
    {
      filter: youtubeFilter,
      pagination: { take },
      sort: {
        field: API.YouTubeChannelSortField.CreatedAt,
        direction: API.YouTubeChannelSortDirection.Desc,
      },
    },
    {
      skip:
        !hasSearch &&
        (!hasSelectedCategory || selectedCategory?.kind !== "youtube"),
    },
  );

  const courseItems = useMemo<TLandingHeroResultItem[]>(
    () =>
      coursesQuery.data?.items.map((course) => ({
        id: course.id,
        kind: "course",
        slug: course.slug,
        title: course.title,
        rating: course.rating,
        imageUrl: course.imageUrl,
        category: course.category,
        description: course.description,
        meta: course.durationMinutes
          ? t("landing.hero.resultMeta.minutes", {
              count: course.durationMinutes,
            })
          : t("landing.hero.resultMeta.course"),
        href: `${getKindHrefPrefix("course")}/${course.slug}`,
      })) ?? [],
    [coursesQuery.data, t],
  );

  const eventItems = useMemo<TLandingHeroResultItem[]>(
    () =>
      eventsQuery.data?.items.map((event) => ({
        id: event.id,
        kind: "event",
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        category: event.category,
        description: event.description,
        rating: event.averageRating ?? event.rating,
        meta: event.startDate
          ? new Date(event.startDate).toLocaleDateString()
          : t("landing.hero.resultMeta.event"),
        href: `${getKindHrefPrefix("event")}/${event.slug}`,
      })) ?? [],
    [eventsQuery.data, t],
  );

  const podcastItems = useMemo<TLandingHeroResultItem[]>(
    () =>
      podcastsQuery.data?.items.map((podcast) => ({
        id: podcast.id,
        kind: "podcast",
        slug: podcast.slug,
        title: podcast.title,
        rating: podcast.rating,
        imageUrl: podcast.imageUrl,
        category: podcast.category,
        description: podcast.description,
        meta: t("landing.hero.resultMeta.episodes", {
          count: podcast.episodeCount ?? 0,
        }),
        href: `${getKindHrefPrefix("podcast")}/${podcast.slug}`,
      })) ?? [],
    [podcastsQuery.data, t],
  );

  const youtubeItems = useMemo<TLandingHeroResultItem[]>(
    () =>
      youtubeQuery.data?.items.map((channel) => ({
        id: channel.id,
        kind: "youtube",
        slug: channel.slug,
        title: channel.title,
        rating: channel.rating,
        category: channel.category,
        imageUrl: channel.imageUrl,
        description: channel.description,
        meta: t("landing.hero.resultMeta.videos", {
          count: channel.videoCount ?? 0,
        }),
        href: `${getKindHrefPrefix("youtube")}/${channel.slug}`,
      })) ?? [],
    [youtubeQuery.data, t],
  );

  const results = useMemo(() => {
    if (hasSearch) {
      return [
        ...courseItems,
        ...eventItems,
        ...podcastItems,
        ...youtubeItems,
      ].slice(0, 12);
    }
    if (!selectedCategory) return [];
    if (selectedCategory.kind === "course") return courseItems;
    if (selectedCategory.kind === "event") return eventItems;
    if (selectedCategory.kind === "podcast") return podcastItems;
    return youtubeItems;
  }, [
    hasSearch,
    selectedCategory,
    courseItems,
    eventItems,
    podcastItems,
    youtubeItems,
  ]);

  const isLoading =
    coursesQuery.isFetching ||
    eventsQuery.isFetching ||
    podcastsQuery.isFetching ||
    youtubeQuery.isFetching;

  const clearSearch = () => setSearch("");
  const clearCategory = () => setSelectedCategory(null);

  const selectCategory = (category: TLandingHeroCategory) => {
    setSelectedCategory(category);
    setIsExplorerOpen(false);
  };

  return {
    t,
    search,
    results,
    isLoading,
    hasSearch,
    setSearch,
    categories,
    clearSearch,
    clearCategory,
    selectCategory,
    isExplorerOpen,
    selectedCategory,
    setIsExplorerOpen,
    hasSelectedCategory,
  };
};
