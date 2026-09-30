"use client";

import { HERO_SEARCH_MIN_LENGTH, HERO_SEARCH_TAKE } from "@utils/constant";
import { HERO_CATEGORY_TAKE, SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { TLandingHeroContentKind } from "@/types/landing-module.types";
import { TLandingHeroResultItem } from "@/types/landing-module.types";
import { TLandingHeroCategory } from "@/types/landing-module.types";
import { useMemo, useState } from "react";
import { getKindHrefPrefix } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { ContentType } from "@/lib/graphql/base";
import { useI18n } from "@hooks/useI18n";

import * as LandingApi from "@lib/rtk/endpoints/landing.api";
import * as PodcastApi from "@lib/rtk/endpoints/podcast.api";
import * as YouTubeApi from "@lib/rtk/endpoints/youtube.api";
import * as CourseApi from "@lib/rtk/endpoints/course.api";
import * as EventApi from "@lib/rtk/endpoints/event.api";

import {
  EventCategory,
  SortDirection,
  CourseCategory,
  EventSortField,
  YouTubeCategory,
  CourseSortField,
  PodcastCategory,
  PodcastSortField,
  EventSortDirection,
  PodcastSortDirection,
  YouTubeChannelSortField,
  YouTubeChannelSortDirection,
} from "@/lib/graphql/base";

const CONTENT_TYPE_BY_KIND: Record<TLandingHeroContentKind, ContentType> = {
  course: ContentType.Course,
  event: ContentType.Event,
  podcast: ContentType.Podcast,
  youtube: ContentType.Youtube,
};

const KIND_BY_CONTENT_TYPE: Record<ContentType, TLandingHeroContentKind> = {
  [ContentType.Course]: "course",
  [ContentType.Event]: "event",
  [ContentType.Podcast]: "podcast",
  [ContentType.Youtube]: "youtube",
};

export const useLandingHeroSearch = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TLandingHeroCategory | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const hasSearch = debouncedSearch.length >= HERO_SEARCH_MIN_LENGTH;
  const hasSelectedCategory = Boolean(selectedCategory);

  const categories = useMemo<TLandingHeroCategory[]>(
    () => [
      {
        id: "course-technology",
        kind: "course",
        value: CourseCategory.Technology,
        label: t("landing.hero.categories.technologyCourses"),
      },
      {
        id: "course-business",
        kind: "course",
        value: CourseCategory.Business,
        label: t("landing.hero.categories.businessCourses"),
      },
      {
        id: "course-leadership",
        kind: "course",
        value: CourseCategory.Leadership,
        label: t("landing.hero.categories.leadershipCourses"),
      },
      {
        id: "event-cpd",
        kind: "event",
        value: EventCategory.Cpd,
        label: t("landing.hero.categories.cpdEvents"),
      },
      {
        id: "event-compliance",
        kind: "event",
        value: EventCategory.Compliance,
        label: t("landing.hero.categories.complianceEvents"),
      },
      {
        id: "podcast-ai",
        kind: "podcast",
        value: PodcastCategory.Ai,
        label: t("landing.hero.categories.aiPodcasts"),
      },
      {
        id: "podcast-career",
        kind: "podcast",
        value: PodcastCategory.Career,
        label: t("landing.hero.categories.careerPodcasts"),
      },
      {
        id: "youtube-data",
        kind: "youtube",
        value: YouTubeCategory.Data,
        label: t("landing.hero.categories.dataYouTube"),
      },
      {
        id: "youtube-engineering",
        kind: "youtube",
        value: YouTubeCategory.Engineering,
        label: t("landing.hero.categories.engineeringYouTube"),
      },
    ],
    [t],
  );

  const unifiedSearchQuery = LandingApi.useLandingCatalogSearchQuery(
    {
      search: debouncedSearch,
      take: HERO_SEARCH_TAKE,
      contentType: selectedCategory
        ? CONTENT_TYPE_BY_KIND[selectedCategory.kind]
        : undefined,
      category: selectedCategory ? selectedCategory.value : undefined,
    },
    { skip: !hasSearch },
  );

  const courseFilter = {
    category:
      selectedCategory?.kind === "course"
        ? (selectedCategory.value as CourseCategory)
        : undefined,
  };

  const eventFilter = {
    category:
      selectedCategory?.kind === "event"
        ? (selectedCategory.value as EventCategory)
        : undefined,
  };

  const podcastFilter = {
    category:
      selectedCategory?.kind === "podcast"
        ? (selectedCategory.value as PodcastCategory)
        : undefined,
  };

  const youtubeFilter = {
    category:
      selectedCategory?.kind === "youtube"
        ? (selectedCategory.value as YouTubeCategory)
        : undefined,
  };

  const showCourseCategory =
    !hasSearch && hasSelectedCategory && selectedCategory?.kind === "course";
  const showEventCategory =
    !hasSearch && hasSelectedCategory && selectedCategory?.kind === "event";
  const showPodcastCategory =
    !hasSearch && hasSelectedCategory && selectedCategory?.kind === "podcast";
  const showYoutubeCategory =
    !hasSearch && hasSelectedCategory && selectedCategory?.kind === "youtube";

  const coursesQuery = CourseApi.useCoursesQuery(
    {
      filter: courseFilter,
      pagination: { take: HERO_CATEGORY_TAKE },
      sort: {
        field: CourseSortField.CreatedAt,
        direction: SortDirection.Desc,
      },
    },
    { skip: !showCourseCategory },
  );

  const eventsQuery = EventApi.useEventsQuery(
    {
      filter: eventFilter,
      pagination: { take: HERO_CATEGORY_TAKE },
      sort: {
        field: EventSortField.StartDate,
        direction: EventSortDirection.Asc,
      },
    },
    { skip: !showEventCategory },
  );

  const podcastsQuery = PodcastApi.usePodcastsQuery(
    {
      filter: podcastFilter,
      pagination: { take: HERO_CATEGORY_TAKE },
      sort: {
        field: PodcastSortField.CreatedAt,
        direction: PodcastSortDirection.Desc,
      },
    },
    { skip: !showPodcastCategory },
  );

  const youtubeQuery = YouTubeApi.useYoutubeChannelsQuery(
    {
      filter: youtubeFilter,
      pagination: { take: HERO_CATEGORY_TAKE },
      sort: {
        field: YouTubeChannelSortField.CreatedAt,
        direction: YouTubeChannelSortDirection.Desc,
      },
    },
    { skip: !showYoutubeCategory },
  );

  const searchResultItems = useMemo<TLandingHeroResultItem[]>(
    () =>
      unifiedSearchQuery.data?.map((item) => {
        const kind = KIND_BY_CONTENT_TYPE[item.contentType];
        const meta =
          kind === "course"
            ? item.durationMinutes
              ? t("landing.hero.resultMeta.minutes", {
                  count: item.durationMinutes,
                })
              : t("landing.hero.resultMeta.course")
            : kind === "event"
              ? item.startDate
                ? new Date(item.startDate).toLocaleDateString()
                : t("landing.hero.resultMeta.event")
              : kind === "podcast"
                ? t("landing.hero.resultMeta.episodes", {
                    count: item.episodeCount ?? 0,
                  })
                : t("landing.hero.resultMeta.videos", {
                    count: item.videoCount ?? 0,
                  });

        return {
          id: item.id,
          kind,
          slug: item.slug,
          title: item.title,
          rating: item.rating,
          imageUrl: item.imageUrl,
          category: item.category,
          meta,
          href: `${getKindHrefPrefix(kind)}/${item.slug}`,
        };
      }) ?? [],
    [unifiedSearchQuery.data, t],
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
    if (hasSearch) return searchResultItems;
    if (!selectedCategory) return [];
    if (selectedCategory.kind === "course") return courseItems;
    if (selectedCategory.kind === "event") return eventItems;
    if (selectedCategory.kind === "podcast") return podcastItems;
    return youtubeItems;
  }, [
    hasSearch,
    searchResultItems,
    selectedCategory,
    courseItems,
    eventItems,
    podcastItems,
    youtubeItems,
  ]);

  const isLoading = hasSearch
    ? unifiedSearchQuery.isFetching
    : coursesQuery.isFetching ||
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
