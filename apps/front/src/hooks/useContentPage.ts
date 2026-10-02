"use client";

import {
  CourseCategory,
  CourseLevel,
  CourseSortField,
  EventCategory,
  EventSortDirection,
  EventSortField,
  EventType,
  PodcastCategory,
  PodcastSortDirection,
  PodcastSortField,
  SortDirection,
  YouTubeCategory,
  YouTubeChannelSortDirection,
  YouTubeChannelSortField,
} from "@/lib/graphql/base";
import { useCallback, useEffect, useMemo, useState } from "react";
import { initialCursor, TAKE } from "@utils/constant";
import {
  humanizeEnumValue,
  translateWithFallback,
} from "@utils/function-helper";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useContentFacets } from "@hooks/useContentFacets";
import { useDebouncedValue } from "@hooks/useDebounced";
import { useI18n } from "@hooks/useI18n";

import * as YouTubeApi from "@lib/rtk/endpoints/youtube.api";
import * as PodcastApi from "@lib/rtk/endpoints/podcast.api";
import * as CourseApi from "@lib/rtk/endpoints/course.api";
import * as EventApi from "@lib/rtk/endpoints/event.api";
import * as T from "@/types/content-module.types";

export const useContentPage = () => {
  const { t, language } = useI18n();

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

  /**
   * A value can disappear when its last public record is archived or deleted.
   * Dropping it here rather than leaving it on the Select keeps the control
   * from holding a value its list would never return, and the cursor reset
   * below turns the follow-up into a single page-one list request.
   */
  const keepSelected = useCallback(
    (
      selected: string | undefined,
      options: readonly { value: string }[],
      isResolved: boolean,
    ) =>
      !selected || !isResolved
        ? selected
        : options.some((option) => option.value === selected)
          ? selected
          : undefined,
    [],
  );

  const facets = useContentFacets(activeTab);

  const enumLabelOf = useCallback(
    (prefix: string, value: string) =>
      translateWithFallback(
        t,
        `content.enums.${prefix}.${value}`,
        humanizeEnumValue(value),
      ),
    [t],
  );

  /**
   * Categorical options are sorted by their translated label in the active
   * locale, so the order follows what a reader sees rather than the order the
   * enum happens to declare.
   */
  const enumFacetOptions = useCallback(
    (prefix: string, rows: readonly T.TEnumFacet[]) =>
      rows
        .map((row) => ({
          value: row.value,
          label: enumLabelOf(prefix, row.value),
        }))
        .sort((left, right) => left.label.localeCompare(right.label, language)),
    [enumLabelOf, language],
  );

  const courseCategoryOptions = useMemo(
    () => enumFacetOptions("courseCategory", facets.courses.categories),
    [enumFacetOptions, facets.courses.categories],
  );

  const courseLevelOptions = useMemo(
    () => enumFacetOptions("courseLevel", facets.courses.levels),
    [enumFacetOptions, facets.courses.levels],
  );

  const courseRatingOptions = useMemo(
    () =>
      facets.courses.ratings.map((row) => ({
        value: String(row.minimum),
        label: `${row.minimum.toFixed(1)}+`,
      })),
    [facets.courses.ratings],
  );

  const eventCategoryOptions = useMemo(
    () => enumFacetOptions("eventCategory", facets.events.categories),
    [enumFacetOptions, facets.events.categories],
  );

  const eventTypeOptions = useMemo(
    () => enumFacetOptions("eventType", facets.events.types),
    [enumFacetOptions, facets.events.types],
  );

  const podcastCategoryOptions = useMemo(
    () => enumFacetOptions("podcastCategory", facets.podcasts.categories),
    [enumFacetOptions, facets.podcasts.categories],
  );

  const youtubeCategoryOptions = useMemo(
    () => enumFacetOptions("youtubeCategory", facets.youtube.categories),
    [enumFacetOptions, facets.youtube.categories],
  );

  const isCourseFacetsResolved =
    !facets.courses.state.isLoading && !facets.courses.state.hasError;
  const isEventFacetsResolved =
    !facets.events.state.isLoading && !facets.events.state.hasError;
  const isPodcastFacetsResolved =
    !facets.podcasts.state.isLoading && !facets.podcasts.state.hasError;
  const isYoutubeFacetsResolved =
    !facets.youtube.state.isLoading && !facets.youtube.state.hasError;

  useEffect(() => {
    if (activeTab !== "courses" || !isCourseFacetsResolved) return;
    setCourseFilters((prev) => {
      const next = {
        category: keepSelected(
          prev.category,
          courseCategoryOptions,
          true,
        ) as T.TCourseFilters["category"],
        level: keepSelected(
          prev.level,
          courseLevelOptions,
          true,
        ) as T.TCourseFilters["level"],
        minRating: keepSelected(prev.minRating, courseRatingOptions, true),
      };
      const isUnchanged =
        next.category === prev.category &&
        next.level === prev.level &&
        next.minRating === prev.minRating;
      return isUnchanged ? prev : next;
    });
  }, [
    activeTab,
    keepSelected,
    courseLevelOptions,
    courseRatingOptions,
    courseCategoryOptions,
    isCourseFacetsResolved,
  ]);

  useEffect(() => {
    if (activeTab !== "events" || !isEventFacetsResolved) return;
    setEventFilters((prev) => {
      const next = {
        category: keepSelected(
          prev.category,
          eventCategoryOptions,
          true,
        ) as T.TEventFilters["category"],
        type: keepSelected(
          prev.type,
          eventTypeOptions,
          true,
        ) as T.TEventFilters["type"],
      };
      return next.category === prev.category && next.type === prev.type
        ? prev
        : next;
    });
  }, [
    activeTab,
    keepSelected,
    eventTypeOptions,
    eventCategoryOptions,
    isEventFacetsResolved,
  ]);

  useEffect(() => {
    if (activeTab !== "podcasts" || !isPodcastFacetsResolved) return;
    setPodcastFilters((prev) => {
      const category = keepSelected(
        prev.category,
        podcastCategoryOptions,
        true,
      ) as T.TPodcastFilters["category"];
      return category === prev.category ? prev : { category };
    });
  }, [
    activeTab,
    keepSelected,
    podcastCategoryOptions,
    isPodcastFacetsResolved,
  ]);

  useEffect(() => {
    if (activeTab !== "youtube" || !isYoutubeFacetsResolved) return;
    setYoutubeFilters((prev) => {
      const category = keepSelected(
        prev.category,
        youtubeCategoryOptions,
        true,
      ) as T.TYouTubeFilters["category"];
      return category === prev.category ? prev : { category };
    });
  }, [
    activeTab,
    keepSelected,
    youtubeCategoryOptions,
    isYoutubeFacetsResolved,
  ]);

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
      field: CourseSortField.CreatedAt,
      direction: SortDirection.Desc,
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
      field: EventSortField.StartDate,
      direction: EventSortDirection.Asc,
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
      field: PodcastSortField.CreatedAt,
      direction: PodcastSortDirection.Desc,
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
      field: YouTubeChannelSortField.CreatedAt,
      direction: YouTubeChannelSortDirection.Desc,
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
    const enumLabel = (prefix: string, value?: string | null) =>
      value
        ? translateWithFallback(
            t,
            `content.enums.${prefix}.${value}`,
            humanizeEnumValue(value),
          )
        : null;

    const countLabel = (key: string, count?: number | null) =>
      count ? t(key, { count }) : null;

    if (activeTab === "courses") {
      return (
        coursesQuery.data?.items.map((course) => ({
          id: course.id,
          slug: course.slug,
          kind: "course",
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          category: enumLabel("courseCategory", course.category),
          categoryCode: course.category,
          status: enumLabel("courseLevel", course.level),
          rating: course.rating,
          price: course.price ?? null,
          isFree: course.isFree,
          metaPrimary: countLabel(
            "content.card.professionals",
            course.professionals,
          ),
          metaSecondary: countLabel(
            "content.card.minutes",
            course.durationMinutes,
          ),
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
          category: enumLabel("eventCategory", event.category),
          categoryCode: event.category,
          status: enumLabel("eventType", event.type),
          rating: event.averageRating,
          price: event.price ?? null,
          isFree: event.isFree,
          metaPrimary: countLabel("content.card.attendees", event.attendees),
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
          category: enumLabel("podcastCategory", podcast.category),
          categoryCode: podcast.category,
          rating: podcast.rating,
          metaPrimary: countLabel("content.card.listeners", podcast.listeners),
          metaSecondary: countLabel(
            "content.card.episodes",
            podcast.episodeCount,
          ),
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
        category: enumLabel("youtubeCategory", channel.category),
        categoryCode: channel.category,
        rating: channel.rating,
        metaPrimary: countLabel(
          "content.card.subscribers",
          channel.subscribers,
        ),
        metaSecondary: countLabel("content.card.videos", channel.videoCount),
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
    setSearch("");
    if (activeTab === "courses") setCourseFilters({});
    if (activeTab === "events") setEventFilters({});
    if (activeTab === "podcasts") setPodcastFilters({});
    if (activeTab === "youtube") setYoutubeFilters({});
  };

  /**
   * A selector with nothing behind it is dropped rather than shown empty. It
   * stays while the facets are loading or failed, because those states carry
   * the disabled/retry affordance the reader needs.
   */
  const withBackedOptions = <
    TFilter extends {
      options: unknown[];
      isLoading: boolean;
      hasError: boolean;
    },
  >(
    filters: TFilter[],
  ) =>
    filters.filter(
      (filter) =>
        filter.options.length > 0 || filter.isLoading || filter.hasError,
    );

  const getFilterPanelProps = () => {
    if (activeTab === "courses") {
      return {
        title: t("content.filters.courseTitle"),
        search,
        onReset: resetFilters,
        onSearchChange: setSearch,
        filters: withBackedOptions([
          {
            key: "category",
            label: t("content.filters.category"),
            value: courseFilters.category,
            placeholder: t("content.filters.category"),
            options: courseCategoryOptions,
            ...facets.courses.state,
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                category: value as CourseCategory | "",
              })),
          },
          {
            key: "level",
            label: t("content.filters.level"),
            value: courseFilters.level,
            placeholder: t("content.filters.level"),
            options: courseLevelOptions,
            ...facets.courses.state,
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                level: value as CourseLevel | "",
              })),
          },
          {
            key: "rating",
            label: t("content.filters.rating"),
            value: courseFilters.minRating,
            placeholder: t("content.filters.rating"),
            options: courseRatingOptions,
            ...facets.courses.state,
            onChange: (value: string) =>
              setCourseFilters((prev) => ({
                ...prev,
                minRating: value,
              })),
          },
        ]),
      };
    }

    if (activeTab === "events") {
      return {
        title: t("content.filters.eventTitle"),
        search,
        onReset: resetFilters,
        onSearchChange: setSearch,
        filters: withBackedOptions([
          {
            key: "category",
            label: t("content.filters.category"),
            value: eventFilters.category,
            placeholder: t("content.filters.category"),
            options: eventCategoryOptions,
            ...facets.events.state,
            onChange: (value: string) =>
              setEventFilters((prev) => ({
                ...prev,
                category: value as EventCategory | "",
              })),
          },
          {
            key: "type",
            label: t("content.filters.eventType"),
            value: eventFilters.type,
            placeholder: t("content.filters.eventType"),
            options: eventTypeOptions,
            ...facets.events.state,
            onChange: (value: string) =>
              setEventFilters((prev) => ({
                ...prev,
                type: value as EventType | "",
              })),
          },
        ]),
      };
    }

    if (activeTab === "podcasts") {
      return {
        title: t("content.filters.podcastTitle"),
        search,
        onReset: resetFilters,
        onSearchChange: setSearch,
        filters: withBackedOptions([
          {
            key: "category",
            label: t("content.filters.category"),
            value: podcastFilters.category,
            placeholder: t("content.filters.category"),
            options: podcastCategoryOptions,
            ...facets.podcasts.state,
            onChange: (value: string) =>
              setPodcastFilters((prev) => ({
                ...prev,
                category: value as PodcastCategory | "",
              })),
          },
        ]),
      };
    }

    return {
      title: t("content.filters.youtubeTitle"),
      search,
      onReset: resetFilters,
      onSearchChange: setSearch,
      filters: withBackedOptions([
        {
          key: "category",
          label: t("content.filters.category"),
          value: youtubeFilters.category,
          placeholder: t("content.filters.category"),
          options: youtubeCategoryOptions,
          ...facets.youtube.state,
          onChange: (value: string) =>
            setYoutubeFilters((prev) => ({
              ...prev,
              category: value as YouTubeCategory | "",
            })),
        },
      ]),
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
