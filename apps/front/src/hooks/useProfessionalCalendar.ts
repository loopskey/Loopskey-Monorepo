"use client";

import { EventClickArg, EventInput } from "@fullcalendar/core";
import { ProfessionalCalendarEventsQueryVariables } from "@/lib/graphql/operations/professional";
import { ChangeEvent, useMemo, useState } from "react";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/utils/constant";
import { TProfessionalCalendarEvent } from "@/types/professional-dashboard.types";
import { TUpcomingCalendarItem } from "@/types/professional-dashboard.types";
import { TManualCalendarEvent } from "@/types/professional-dashboard.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { EventRegistrationStatus } from "@/lib/graphql/base";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";

export type TCalendarStatusFilter = EventRegistrationStatus | "ALL";

export const useProfessionalCalendar = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<TCalendarStatusFilter>("ALL");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] =
    useState<TProfessionalCalendarEvent | null>(null);
  const [selectedManualEvent, setSelectedManualEvent] =
    useState<TManualCalendarEvent | null>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  const currentCursor = cursorStack.at(-1);

  const variables = useMemo<ProfessionalCalendarEventsQueryVariables>(
    () => ({
      filter: {
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentCursor,
      },
    }),
    [debouncedSearch, status, currentCursor],
  );

  const { data, isLoading, isFetching, refetch } =
    API.useProfessionalCalendarEventsQuery(variables);

  const { data: manualData, isFetching: isManualFetching } =
    API.useMyCalendarEntriesQuery();

  const [deleteCalendarEvent, deleteState] =
    API.useDeleteCalendarEventMutation();

  const events = useMemo<TProfessionalCalendarEvent[]>(() => {
    return data?.items ?? [];
  }, [data?.items]);

  const manualEvents = useMemo<TManualCalendarEvent[]>(() => {
    return manualData ?? [];
  }, [manualData]);

  const filteredManualEvents = useMemo<TManualCalendarEvent[]>(() => {
    const query = debouncedSearch.toLowerCase();
    if (!query) return manualEvents;

    return manualEvents.filter((item) => {
      const typeLabel = t(
        `professionalDashboard.calendar.types.${item.type}`,
      ).toLowerCase();
      const haystack = [item.title, item.type, typeLabel, item.notes ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [manualEvents, debouncedSearch, t]);

  const pageInfo = data?.pageInfo;

  const calendarEvents = useMemo<EventInput[]>(() => {
    const registrationEvents = events
      .filter((item) => item.event)
      .map((item) => {
        const event = item.event!;
        const style = getContentTypeStyle("EVENT");
        return {
          id: `registration:${item.id}`,
          title: event.title,
          start: event.startDate,
          end: event.endDate ?? event.startDate,
          backgroundColor: style.cssVar,
          borderColor: style.cssVar,
          textColor: style.cssVarForeground,
          extendedProps: {
            source: "registration" as const,
            pdu: event.pdu,
            slug: event.slug,
            status: item.status,
            eventId: item.eventId,
            contentType: "EVENT",
            registrationId: item.id,
            location: event.location,
            onlineUrl: event.onlineUrl,
            deliveryMode: event.deliveryMode,
          },
        };
      });

    const manualCalendarEvents = manualEvents.map((item) => {
      const style = getContentTypeStyle(item.contentType);
      return {
        id: `manual:${item.id}`,
        title: item.title,
        start: item.startDate,
        end: item.endDate ?? item.startDate,
        backgroundColor: style.cssVar,
        borderColor: style.cssVar,
        textColor: style.cssVarForeground,
        extendedProps: {
          source: "manual" as const,
          manualId: item.id,
          type: item.type,
          notes: item.notes,
          contentType: item.contentType,
        },
      };
    });

    return [...registrationEvents, ...manualCalendarEvents];
  }, [events, manualEvents]);

  const upcomingEvents = useMemo<TUpcomingCalendarItem[]>(() => {
    const fromRegistrations = events
      .filter((item) => item.isUpcoming && item.event)
      .map<TUpcomingCalendarItem>((item) => ({
        id: `registration:${item.id}`,
        title: item.event!.title,
        startDate: item.event!.startDate,
        source: "registration",
      }));

    const fromManual = manualEvents
      .filter((item) => item.isUpcoming)
      .map<TUpcomingCalendarItem>((item) => ({
        id: `manual:${item.id}`,
        title: item.title,
        startDate: item.startDate,
        source: "manual",
      }));

    return [...fromRegistrations, ...fromManual].sort(
      (a, b) =>
        new Date(a.startDate ?? 0).getTime() -
        new Date(b.startDate ?? 0).getTime(),
    );
  }, [events, manualEvents]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleStatusChange = (value: TCalendarStatusFilter) => {
    setStatus(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleCalendarEventClick = (clickInfo: EventClickArg) => {
    const source = clickInfo.event.extendedProps.source as
      | "registration"
      | "manual"
      | undefined;
    if (source === "manual") {
      const manualId = clickInfo.event.id.replace(/^manual:/, "");
      const foundManual = manualEvents.find((item) => item.id === manualId);
      setSelectedEvent(null);
      setSelectedManualEvent(foundManual ?? null);
      return;
    }
    const registrationId = clickInfo.event.id.replace(/^registration:/, "");
    const foundEvent = events.find((item) => item.id === registrationId);
    setSelectedManualEvent(null);
    setSelectedEvent(foundEvent ?? null);
  };

  const closeSelectedEvent = () => setSelectedEvent(null);

  const closeSelectedManualEvent = () => setSelectedManualEvent(null);

  const closeEventDetails = () => {
    setSelectedEvent(null);
    setSelectedManualEvent(null);
  };

  const openAddDialog = () => setIsAddOpen(true);

  const handleAddOpenChange = (open: boolean) => setIsAddOpen(open);

  const handleDeleteManualEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id).unwrap();
      setSelectedManualEvent((current) =>
        current?.id === id ? null : current,
      );
      notify.success(t("professionalDashboard.calendar.deleteSuccess"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
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
    search,
    status,
    events,
    refetch,
    pageInfo,
    isAddOpen,
    isLoading,
    formatDate,
    isFetching,
    handleNext,
    manualEvents,
    openAddDialog,
    getEventHref,
    resetFilters,
    selectedEvent,
    calendarEvents,
    upcomingEvents,
    formatDuration,
    formatDateTime,
    handlePrevious,
    isManualFetching,
    closeEventDetails,
    closeSelectedEvent,
    handleSearchChange,
    handleStatusChange,
    selectedManualEvent,
    handleAddOpenChange,
    filteredManualEvents,
    handleSearchInputChange,
    handleDeleteManualEvent,
    closeSelectedManualEvent,
    handleCalendarEventClick,
    isDeletingManual: deleteState.isLoading,
  };
};
