"use client";

import { getDefaultRange, PAGE_SIZE, toDateInputValue } from "@/utils/constant";
import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { ChangeEvent, useMemo, useState } from "react";
import { TProfessionalCalendarEvent } from "@/types/professional-dashboard.types";
import { TCalendarStats } from "@/types/professional-dashboard.types";
import { TSelectedRange } from "@/types/professional-dashboard.types";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";

export const useProfessionalCalendar = () => {
  const { t } = useI18n();

  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] =
    useState<TSelectedRange>(defaultRange);
  const [selectedEvent, setSelectedEvent] =
    useState<TProfessionalCalendarEvent | null>(null);

  const currentCursor = cursorStack.at(-1);

  const variables = useMemo<GQL.ProfessionalCalendarEventsQueryVariables>(
    () => ({
      filter: {
        search: search.trim() || undefined,
        from: selectedRange.start
          ? new Date(selectedRange.start).toISOString()
          : undefined,
        to: selectedRange.end
          ? new Date(selectedRange.end).toISOString()
          : undefined,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentCursor,
      },
    }),
    [search, selectedRange.start, selectedRange.end, currentCursor],
  );

  const { data, isLoading, isFetching, refetch } =
    API.useProfessionalCalendarEventsQuery(variables);

  const events = useMemo<TProfessionalCalendarEvent[]>(() => {
    return data?.items ?? [];
  }, [data?.items]);

  const pageInfo = data?.pageInfo;

  const stats = useMemo<TCalendarStats>(() => {
    const total = data?.totalCount ?? 0;
    const upcoming = events.filter((item) => item.isUpcoming).length;
    const live = events.filter((item) => item.isLive).length;
    const completed = events.filter((item) => {
      return item.status === GQL.EventRegistrationStatus.Completed;
    }).length;
    const totalPdus = events.reduce((sum, item) => {
      return sum + Number(item.event?.pdu ?? 0);
    }, 0);
    return {
      live,
      total,
      upcoming,
      completed,
      totalPdus,
    };
  }, [data?.totalCount, events]);

  const calendarEvents = useMemo<EventInput[]>(() => {
    return events
      .filter((item) => item.event)
      .map((item) => {
        const event = item.event!;
        return {
          id: item.id,
          title: event.title,
          start: event.startDate,
          end: event.endDate ?? event.startDate,
          extendedProps: {
            pdu: event.pdu,
            slug: event.slug,
            status: item.status,
            eventId: item.eventId,
            registrationId: item.id,
            location: event.location,
            onlineUrl: event.onlineUrl,
            deliveryMode: event.deliveryMode,
          },
        };
      });
  }, [events]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedRange((previousRange) => ({
      ...previousRange,
      start: event.target.value,
    }));
    setPage(1);
    setCursorStack([]);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedRange((previousRange) => ({
      ...previousRange,
      end: event.target.value,
    }));
    setPage(1);
    setCursorStack([]);
  };

  const handleCalendarRangeSelect = (selection: DateSelectArg) => {
    setSelectedRange({
      start: toDateInputValue(selection.start),
      end: toDateInputValue(selection.end),
    });
    setPage(1);
    setCursorStack([]);
  };

  const handleCalendarEventClick = (clickInfo: EventClickArg) => {
    const foundEvent = events.find((item) => item.id === clickInfo.event.id);
    setSelectedEvent(foundEvent ?? null);
  };

  const closeSelectedEvent = () => setSelectedEvent(null);

  const resetFilters = () => {
    setSearch("");
    setSelectedRange(defaultRange);
    setPage(1);
    setCursorStack([]);
  };

  const handleNext = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
    setCursorStack((previousStack) => [...previousStack, pageInfo.nextCursor!]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => Math.max(1, previousPage - 1));
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const formatDuration = (minutes?: number | null) => {
    const value = Number(minutes ?? 0);
    if (!value) return "—";
    if (value < 60)
      return `${value} ${t("professionalDashboard.calendar.minutes")}`;
    const hours = Math.floor(value / 60);
    const remainingMinutes = value % 60;
    if (!remainingMinutes)
      return `${hours} ${t("professionalDashboard.calendar.hours")}`;
    return `${hours} ${t("professionalDashboard.calendar.hours")} ${remainingMinutes} ${t(
      "professionalDashboard.calendar.minutes",
    )}`;
  };

  const getEventHref = (event: TProfessionalCalendarEvent) => {
    if (event.event?.slug) return `/events/${event.event.slug}`;
    return `/events/${event.eventId}`;
  };
  return {
    t,
    data,
    page,
    stats,
    search,
    events,
    refetch,
    pageInfo,
    isLoading,
    formatDate,
    isFetching,
    handleNext,
    getEventHref,
    resetFilters,
    selectedEvent,
    selectedRange,
    calendarEvents,
    formatDuration,
    formatDateTime,
    handlePrevious,
    closeSelectedEvent,
    handleSearchChange,
    handleEndDateChange,
    handleStartDateChange,
    handleSearchInputChange,
    handleCalendarEventClick,
    handleCalendarRangeSelect,
  };
};
