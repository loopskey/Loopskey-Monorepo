"use client";

import { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { ChangeEvent, useMemo, useState } from "react";
import { PAGE_SIZE, toDateInputValue } from "@/utils/constant";
import { TProfessionalCalendarEvent } from "@/types/professional-dashboard.types";
import { TUpcomingCalendarItem } from "@/types/professional-dashboard.types";
import { TManualCalendarEvent } from "@/types/professional-dashboard.types";
import { TCalendarStats } from "@/types/professional-dashboard.types";
import { TSelectedRange } from "@/types/professional-dashboard.types";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";

const EMPTY_RANGE: TSelectedRange = { start: "", end: "" };

export const useProfessionalCalendar = () => {
  const { t } = useI18n();

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] =
    useState<TSelectedRange>(EMPTY_RANGE);
  const [selectedEvent, setSelectedEvent] =
    useState<TProfessionalCalendarEvent | null>(null);
  const [selectedManualEvent, setSelectedManualEvent] =
    useState<TManualCalendarEvent | null>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  const currentCursor = cursorStack.at(-1);

  const variables = useMemo<GQL.ProfessionalCalendarEventsQueryVariables>(
    () => ({
      filter: {
        search: search.trim() || undefined,
        from: selectedRange.start
          ? new Date(selectedRange.start).toISOString()
          : undefined,
        to: selectedRange.end
          ? (() => {
              const end = new Date(selectedRange.end);
              end.setHours(23, 59, 59, 999);
              return end.toISOString();
            })()
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
    const query = search.trim().toLowerCase();
    const fromTime = selectedRange.start
      ? new Date(selectedRange.start).setHours(0, 0, 0, 0)
      : null;
    const toTime = selectedRange.end
      ? new Date(selectedRange.end).setHours(23, 59, 59, 999)
      : null;

    return manualEvents.filter((item) => {
      if (query) {
        const typeLabel = t(
          `professionalDashboard.calendar.types.${item.type}`,
        ).toLowerCase();
        const haystack = [item.title, item.type, typeLabel, item.notes ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      const start = new Date(item.startDate).getTime();
      if (fromTime !== null && start < fromTime) return false;
      if (toTime !== null && start > toTime) return false;
      return true;
    });
  }, [manualEvents, search, selectedRange.start, selectedRange.end, t]);

  const pageInfo = data?.pageInfo;

  const stats = useMemo<TCalendarStats>(() => {
    const total = (data?.totalCount ?? 0) + manualEvents.length;
    const upcoming =
      events.filter((item) => item.isUpcoming).length +
      manualEvents.filter((item) => item.isUpcoming).length;
    const live =
      events.filter((item) => item.isLive).length +
      manualEvents.filter((item) => item.isLive).length;
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
  }, [data?.totalCount, events, manualEvents]);

  const calendarEvents = useMemo<EventInput[]>(() => {
    const registrationEvents = events
      .filter((item) => item.event)
      .map((item) => {
        const event = item.event!;
        return {
          id: `registration:${item.id}`,
          title: event.title,
          start: event.startDate,
          end: event.endDate ?? event.startDate,
          extendedProps: {
            source: "registration" as const,
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

    const manualCalendarEvents = manualEvents.map((item) => ({
      id: `manual:${item.id}`,
      title: item.title,
      start: item.startDate,
      end: item.endDate ?? item.startDate,
      extendedProps: {
        source: "manual" as const,
        manualId: item.id,
        type: item.type,
        notes: item.notes,
      },
    }));

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
    setSelectedRange(EMPTY_RANGE);
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
    isAddOpen,
    isLoading,
    formatDate,
    isFetching,
    handleNext,
    manualEvents,
    openAddDialog,
    getEventHref,
    closeEventDetails,
    filteredManualEvents,
    resetFilters,
    selectedEvent,
    selectedRange,
    calendarEvents,
    upcomingEvents,
    formatDuration,
    formatDateTime,
    handlePrevious,
    isManualFetching,
    selectedManualEvent,
    handleAddOpenChange,
    closeSelectedEvent,
    handleSearchChange,
    handleEndDateChange,
    handleStartDateChange,
    handleSearchInputChange,
    handleDeleteManualEvent,
    closeSelectedManualEvent,
    handleCalendarEventClick,
    handleCalendarRangeSelect,
    isDeletingManual: deleteState.isLoading,
  };
};
