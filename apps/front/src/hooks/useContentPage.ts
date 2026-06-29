"use client";

import { enumOptions, initialCursor, TAKE } from "@utils/constant";
import { useEffect, useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { useI18n } from "@hooks/useI18n";

import * as YouTubeApi from "@lib/rtk/endpoints/youtube.api";
import * as PodcastApi from "@lib/rtk/endpoints/podcast.api";
import * as CourseApi from "@lib/rtk/endpoints/course.api";
import * as EventApi from "@lib/rtk/endpoints/event.api";
import * as API from "@lib/graphql/generated";
import * as T from "@/types/content-module.types";

export const useContentPage = () => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<T.TContentTab>("courses");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const [courseFilters, setCourseFilters] = useState<T.TCourseFilters>({});
  const [eventFilters, setEventFilters] = useState<T.TEventFilters>({});
  const [podcastFilters, setPodcastFilters] = useState<T.TPodcastFilters>({});
  const [youtubeFilters, setYoutubeFilters] = useState<T.TYouTubeFilters>({});

  const [cursorByTab, setCursorByTab] = useState<
    Record<T.TContentTab, T.TCursorState>
  >({
    courses: initialCursor,
    events: initialCursor,
    podcasts: initialCursor,
    youtube: initialCursor,
  });

  useEffect(() => {
    setCursorByTab({
      courses: initialCursor,
      events: initialCursor,
      podcasts: initialCursor,
      youtube: initialCursor,
    });
  }, [
    debouncedSearch,
    courseFilters.category,
    courseFilters.level,
    courseFilters.minRating,
    eventFilters.category,
    eventFilters.type,
    podcastFilters.category,
    youtubeFilters.category,
  ]);

  const currentCursor = cursorByTab[activeTab];

  const courseCategoryOptions = useMemo(
    () => enumOptions(API.CourseCategory, "content.enums.courseCategory", t),
    [t],
  );

  const courseLevelOptions = useMemo(
    () => enumOptions(API.CourseLevel, "content.enums.courseLevel", t),
    [t],
  );

  const eventCategoryOptions = useMemo(
    () => enumOptions(API.EventCategory, "content.enums.eventCategory", t),
    [t],
  );

  const eventTypeOptions = useMemo(
    () => enumOptions(API.EventType, "content.enums.eventType", t),
    [t],
  );

  const podcastCategoryOptions = useMemo(
    () => enumOptions(API.PodcastCategory, "content.enums.podcastCategory", t),
    [t],
  );

  const youtubeCategoryOptions = useMemo(
    () => enumOptions(API.YouTubeCategory, "content.enums.youtubeCategory", t),
    [t],
  );

  const courseVariables = {
    filter: {
      search: debouncedSearch || undefined,
      category: courseFilters.category || undefined,
      level: courseFilters.level || undefined,
      minRating: courseFilters.minRating
        ? Number(courseFilters.minRating)
        : undefined,
    },
    pagination: {
      take: TAKE,
      cursor: currentCursor.cursor,
    },
    sort: {
      field: API.CourseSortField.CreatedAt,
      direction: API.SortDirection.Desc,
    },
  };

  const eventVariables = {
    filter: {
      search: debouncedSearch || undefined,
      category: eventFilters.category || undefined,
      type: eventFilters.type || undefined,
    },
    pagination: {
      take: TAKE,
      cursor: currentCursor.cursor,
    },
    sort: {
      field: API.EventSortField.StartDate,
      direction: API.EventSortDirection.Asc,
    },
  };

  const podcastVariables = {
    filter: {
      search: debouncedSearch || undefined,
      category: podcastFilters.category || undefined,
    },
    pagination: {
      take: TAKE,
      cursor: currentCursor.cursor,
    },
    sort: {
      field: API.PodcastSortField.CreatedAt,
      direction: API.PodcastSortDirection.Desc,
    },
  };

  const youtubeVariables = {
    filter: {
      search: debouncedSearch || undefined,
      category: youtubeFilters.category || undefined,
    },
    pagination: {
      take: TAKE,
      cursor: currentCursor.cursor,
    },
    sort: {
      field: API.YouTubeChannelSortField.CreatedAt,
      direction: API.YouTubeChannelSortDirection.Desc,
    },
  };

  const coursesQuery = CourseApi.useCoursesQuery(courseVariables, {
    skip: activeTab !== "courses",
  });

  const eventsQuery = EventApi.useEventsQuery(eventVariables, {
    skip: activeTab !== "events",
  });

  const podcastsQuery = PodcastApi.usePodcastsQuery(podcastVariables, {
    skip: activeTab !== "podcasts",
  });

  const youtubeQuery = YouTubeApi.useYoutubeChannelsQuery(youtubeVariables, {
    skip: activeTab !== "youtube",
  });

  const activeData = {
    courses: coursesQuery.data,
    events: eventsQuery.data,
    podcasts: podcastsQuery.data,
    youtube: youtubeQuery.data,
  }[activeTab];

  const isLoading = {
    courses: coursesQuery.isLoading || coursesQuery.isFetching,
    events: eventsQuery.isLoading || eventsQuery.isFetching,
    podcasts: podcastsQuery.isLoading || podcastsQuery.isFetching,
    youtube: youtubeQuery.isLoading || youtubeQuery.isFetching,
  }[activeTab];

  const items = useMemo<T.TContentCardItem[]>(() => {
    if (activeTab === "courses") {
      return (
        coursesQuery.data?.items.map((course) => ({
          id: course.id,
          slug: course.slug,
          kind: "course",
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          category: course.category,
          status: course.level,
          rating: course.rating,
          price: course.price ?? null,
          isFree: course.isFree,
          metaPrimary: t("content.card.professionals", {
            count: course.professionals ?? 0,
          }),
          metaSecondary: course.durationMinutes
            ? t("content.card.minutes", { count: course.durationMinutes })
            : null,
          href: `/courses/${course.slug}`,
        })) ?? []
      );
    }

    if (activeTab === "events") {
      return (
        eventsQuery.data?.items.map((event) => ({
          id: event.id,
          slug: event.slug,
          kind: "event",
          title: event.title,
          description: event.description,
          imageUrl: event.imageUrl,
          category: event.category,
          status: event.type,
          rating: event.averageRating,
          price: event.price ?? null,
          isFree: event.isFree,
          metaPrimary: t("content.card.attendees", {
            count: event.attendees ?? 0,
          }),
          metaSecondary: event.startDate
            ? new Date(event.startDate).toLocaleDateString()
            : null,
          href: `/events/${event.slug}`,
        })) ?? []
      );
    }

    if (activeTab === "podcasts") {
      return (
        podcastsQuery.data?.items.map((podcast) => ({
          id: podcast.id,
          slug: podcast.slug,
          kind: "podcast",
          title: podcast.title,
          description: podcast.description,
          imageUrl: podcast.imageUrl,
          category: podcast.category,
          status: podcast.status,
          rating: podcast.rating,
          metaPrimary: t("content.card.listeners", {
            count: podcast.listeners ?? 0,
          }),
          metaSecondary: t("content.card.episodes", {
            count: podcast.episodeCount ?? 0,
          }),
          href: `/podcasts/${podcast.slug}`,
        })) ?? []
      );
    }

    return (
      youtubeQuery.data?.items.map((channel) => ({
        id: channel.id,
        slug: channel.slug,
        kind: "youtube",
        title: channel.title,
        description: channel.description,
        imageUrl: channel.imageUrl,
        category: channel.category,
        status: channel.status,
        rating: channel.rating,
        metaPrimary: t("content.card.subscribers", {
          count: channel.subscribers ?? 0,
        }),
        metaSecondary: t("content.card.videos", {
          count: channel.videoCount ?? 0,
        }),
        href: `/youtube/${channel.slug}`,
      })) ?? []
    );
  }, [
    activeTab,
    coursesQuery.data,
    eventsQuery.data,
    podcastsQuery.data,
    youtubeQuery.data,
    t,
  ]);

  const tabs = useMemo(
    () => [
      { value: "courses" as const, label: t("content.tabs.course") },
      { value: "events" as const, label: t("content.tabs.event") },
      { value: "podcasts" as const, label: t("content.tabs.podcast") },
      { value: "youtube" as const, label: t("content.tabs.youtube") },
    ],
    [t],
  );

  const goNext = () => {
    const nextCursor = activeData?.pageInfo.nextCursor;
    if (!nextCursor) return;

    setCursorByTab((prev) => ({
      ...prev,
      [activeTab]: {
        page: prev[activeTab].page + 1,
        cursor: nextCursor,
        history: [...prev[activeTab].history, prev[activeTab].cursor ?? ""],
      },
    }));
  };

  const goPrevious = () => {
    setCursorByTab((prev) => {
      const history = prev[activeTab].history;
      const previousCursor = history[history.length - 1];

      return {
        ...prev,
        [activeTab]: {
          page: Math.max(prev[activeTab].page - 1, 1),
          cursor: previousCursor || undefined,
          history: history.slice(0, -1),
        },
      };
    });
  };

  const resetFilters = () => {
    if (activeTab === "courses") setCourseFilters({});
    if (activeTab === "events") setEventFilters({});
    if (activeTab === "podcasts") setPodcastFilters({});
    if (activeTab === "youtube") setYoutubeFilters({});
  };

  const getFilterPanelProps = () => {
    if (activeTab === "courses") {
      return {
        title: t("content.filters.courseTitle"),
        totalCount: activeData?.totalCount,
        onReset: resetFilters,
        filters: [
          {
            key: "category",
            label: t("content.filters.category"),
            value: courseFilters.category,
            placeholder: t("content.filters.category"),
            options: courseCategoryOptions,
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                category: value as API.CourseCategory | "",
              })),
          },
          {
            key: "level",
            label: t("content.filters.level"),
            value: courseFilters.level,
            placeholder: t("content.filters.level"),
            options: courseLevelOptions,
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                level: value as API.CourseLevel | "",
              })),
          },
          {
            key: "rating",
            label: t("content.filters.rating"),
            value: courseFilters.minRating,
            placeholder: t("content.filters.rating"),
            options: [
              { value: "4.5", label: "4.5+" },
              { value: "4", label: "4.0+" },
              { value: "3.5", label: "3.5+" },
              { value: "3", label: "3.0+" },
            ],
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                minRating: value,
              })),
          },
        ],
      };
    }

    if (activeTab === "events") {
      return {
        title: t("content.filters.eventTitle"),
        totalCount: activeData?.totalCount,
        onReset: resetFilters,
        filters: [
          {
            key: "category",
            label: t("content.filters.category"),
            value: eventFilters.category,
            placeholder: t("content.filters.category"),
            options: eventCategoryOptions,
            onChange: (value: string) =>
              setEventFilters((prev) => ({
                ...prev,
                category: value as API.EventCategory | "",
              })),
          },
          {
            key: "type",
            label: t("content.filters.eventType"),
            value: eventFilters.type,
            placeholder: t("content.filters.eventType"),
            options: eventTypeOptions,
            onChange: (value: string) =>
              setEventFilters((prev) => ({
                ...prev,
                type: value as API.EventType | "",
              })),
          },
        ],
      };
    }

    if (activeTab === "podcasts") {
      return {
        title: t("content.filters.podcastTitle"),
        totalCount: activeData?.totalCount,
        onReset: resetFilters,
        filters: [
          {
            key: "category",
            label: t("content.filters.category"),
            value: podcastFilters.category,
            placeholder: t("content.filters.category"),
            options: podcastCategoryOptions,
            onChange: (value: string) =>
              setPodcastFilters((prev) => ({
                ...prev,
                category: value as API.PodcastCategory | "",
              })),
          },
        ],
      };
    }

    return {
      title: t("content.filters.youtubeTitle"),
      totalCount: activeData?.totalCount,
      onReset: resetFilters,
      filters: [
        {
          key: "category",
          label: t("content.filters.category"),
          value: youtubeFilters.category,
          placeholder: t("content.filters.category"),
          options: youtubeCategoryOptions,
          onChange: (value: string) =>
            setYoutubeFilters((prev) => ({
              ...prev,
              category: value as API.YouTubeCategory | "",
            })),
        },
      ],
    };
  };

  return {
    t,
    TAKE,
    tabs,
    items,
    search,
    goNext,
    activeTab,
    isLoading,
    setSearch,
    goPrevious,
    activeData,
    setActiveTab,
    currentCursor,
    filterPanelProps: getFilterPanelProps(),
  };
};
