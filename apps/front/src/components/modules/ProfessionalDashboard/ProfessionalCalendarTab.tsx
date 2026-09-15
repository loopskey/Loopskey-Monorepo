"use client";

import { CalendarEventDetailsDialog } from "@modules/ProfessionalDashboard/parts/CalendarEventDetailsDialog";
import { useProfessionalCalendar } from "@/hooks/useProfessionalCalendar";
import { AddCalendarEventDialog } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { ContentPagination } from "@/components/elements/pagination";
import { useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import Link from "next/link";

import * as L from "lucide-react";
import * as P from "@ui/popover";

const MOBILE_CALENDAR_QUERY = "(max-width: 1023px)";

const ProfessionalCalendarTab = () => {
  const {
    t,
    data,
    page,
    search,
    events,
    pageInfo,
    isAddOpen,
    isLoading,
    isFetching,
    handleNext,
    getEventHref,
    resetFilters,
    selectedEvent,
    openAddDialog,
    selectedRange,
    calendarEvents,
    upcomingEvents,
    formatDateTime,
    formatDuration,
    handlePrevious,
    isDeletingManual,
    closeEventDetails,
    selectedManualEvent,
    handleAddOpenChange,
    handleEndDateChange,
    filteredManualEvents,
    handleStartDateChange,
    handleDeleteManualEvent,
    handleSearchInputChange,
    handleCalendarEventClick,
    handleCalendarRangeSelect,
  } = useProfessionalCalendar();

  const eventStyle = getContentTypeStyle("EVENT");
  const EventCategoryIcon = eventStyle.icon;

  const isMobileCalendar = useMediaQuery(MOBILE_CALENDAR_QUERY);
  const calendarRef = useRef<FullCalendar>(null);
  const [mobileViewType, setMobileViewType] = useState<
    "listWeek" | "dayGridMonth"
  >("listWeek");
  const hasActiveFilters = Boolean(
    search.trim() || selectedRange.start || selectedRange.end,
  );

  const setCalendarView = (view: "listWeek" | "dayGridMonth") => {
    calendarRef.current?.getApi().changeView(view);
    setMobileViewType(view);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.calendar.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.calendar.title")}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.calendar.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            radius="xl"
            onClick={openAddDialog}
            className="w-full justify-center sm:w-auto"
          >
            <L.CalendarPlus className="h-4 w-4" />
            {t("professionalDashboard.calendar.addEvent")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="min-w-0 xl:col-span-2">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl font-black">
                {t("professionalDashboard.calendar.calendarChart.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("professionalDashboard.calendar.calendarChart.description")}
              </p>
            </div>

            <P.Popover>
              <P.PopoverTrigger asChild>
                <Button
                  radius="xl"
                  type="button"
                  variant="outline"
                  className="w-full lg:w-auto"
                >
                  <L.SlidersHorizontal className="h-4 w-4" />
                  {t("professionalDashboard.calendar.filters.trigger")}
                  {hasActiveFilters && (
                    <span
                      aria-label={t(
                        "professionalDashboard.calendar.filters.active",
                      )}
                      className="ml-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                    />
                  )}
                </Button>
              </P.PopoverTrigger>
              <P.PopoverContent align="end" className="w-80 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {t("professionalDashboard.calendar.filters.title")}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("professionalDashboard.calendar.filters.description")}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("professionalDashboard.calendar.filters.searchLabel")}
                  </p>
                  <div className="relative">
                    <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      className="h-11 pl-9"
                      onChange={handleSearchInputChange}
                      placeholder={t("professionalDashboard.calendar.search")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("professionalDashboard.calendar.filters.from")}
                    </p>
                    <Input
                      type="date"
                      className="h-11"
                      value={selectedRange.start}
                      onChange={handleStartDateChange}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("professionalDashboard.calendar.filters.to")}
                    </p>
                    <Input
                      type="date"
                      className="h-11"
                      value={selectedRange.end}
                      onChange={handleEndDateChange}
                    />
                  </div>
                </div>

                <Button
                  radius="xl"
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                >
                  <L.RotateCcw className="h-4 w-4" />
                  {t("professionalDashboard.calendar.filters.reset")}
                </Button>
              </P.PopoverContent>
            </P.Popover>
          </div>

          {isMobileCalendar && (
            <div
              role="group"
              aria-label={t(
                "professionalDashboard.calendar.calendarChart.title",
              )}
              className="mb-4 grid grid-cols-2 gap-2"
            >
              <Button
                radius="xl"
                type="button"
                onClick={() => setCalendarView("listWeek")}
                aria-pressed={mobileViewType === "listWeek"}
                variant={mobileViewType === "listWeek" ? "default" : "outline"}
              >
                {t("professionalDashboard.calendar.calendarChart.view.agenda")}
              </Button>
              <Button
                radius="xl"
                type="button"
                variant={
                  mobileViewType === "dayGridMonth" ? "default" : "outline"
                }
                aria-pressed={mobileViewType === "dayGridMonth"}
                onClick={() => setCalendarView("dayGridMonth")}
              >
                {t("professionalDashboard.calendar.calendarChart.view.month")}
              </Button>
            </div>
          )}

          <div className="calendar-shell overflow-x-auto rounded-lg border p-3">
            {isLoading || isMobileCalendar === null ? (
              <div className="flex min-h-96 items-center justify-center">
                <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : (
              <FullCalendar
                key={isMobileCalendar ? "mobile" : "desktop"}
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView={isMobileCalendar ? "listWeek" : "dayGridMonth"}
                headerToolbar={
                  isMobileCalendar
                    ? { left: "prev,next", center: "title", right: "today" }
                    : {
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                      }
                }
                datesSet={(arg) => {
                  if (
                    arg.view.type === "listWeek" ||
                    arg.view.type === "dayGridMonth"
                  )
                    setMobileViewType(arg.view.type);
                }}
                selectable
                selectMirror
                eventDisplay="block"
                events={calendarEvents}
                select={handleCalendarRangeSelect}
                eventClick={handleCalendarEventClick}
                eventDidMount={(arg) => {
                  arg.el.setAttribute("title", arg.event.title);
                }}
                height="auto"
              />
            )}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {t("professionalDashboard.calendar.upcoming.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("professionalDashboard.calendar.upcoming.description")}
              </p>
            </div>
            <div className="rounded-md bg-primary/10 p-2.5 text-primary">
              <L.CalendarClock className="h-5 w-5" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <L.Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : upcomingEvents.length ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-md border px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.source === "manual" ? "default" : "secondary"
                        }
                      >
                        {item.source === "manual"
                          ? t("professionalDashboard.calendar.upcoming.manual")
                          : t(
                              "professionalDashboard.calendar.upcoming.registered",
                            )}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(item.startDate)}
                    </p>
                  </div>

                  {item.source === "manual" ? (
                    <Button
                      radius="xl"
                      size="icon"
                      variant="ghost"
                      disabled={isDeletingManual}
                      aria-label={t("professionalDashboard.calendar.delete")}
                      onClick={() =>
                        void handleDeleteManualEvent(
                          item.id.replace(/^manual:/, ""),
                        )
                      }
                    >
                      <L.Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("professionalDashboard.calendar.upcoming.empty")}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">
                {t("professionalDashboard.calendar.allEvents.title")}
              </h2>
              {hasActiveFilters && (
                <Badge variant="outline">
                  {t("professionalDashboard.calendar.filters.active")}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.calendar.allEvents.description")}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] bg-primary/5 px-5 py-4 text-sm font-medium text-muted-foreground lg:grid">
            <span>{t("professionalDashboard.calendar.table.event")}</span>
            <span>{t("professionalDashboard.calendar.table.date")}</span>
            <span>{t("professionalDashboard.calendar.table.mode")}</span>
            <span>{t("professionalDashboard.calendar.table.status")}</span>
            <span className="text-right">
              {t("professionalDashboard.calendar.table.action")}
            </span>
          </div>

          <div className="divide-y divide-border/70">
            {isLoading ? (
              <div className="flex min-h-72 items-center justify-center">
                <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : events.length || filteredManualEvents.length ? (
              <>
                {filteredManualEvents.map((manual) => {
                  const style = getContentTypeStyle(manual.contentType);
                  const CategoryIcon = style.icon;
                  return (
                    <div
                      key={`manual-row:${manual.id}`}
                      className="grid gap-4 px-5 py-5 text-sm transition-colors hover:bg-primary/5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] lg:items-center"
                    >
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(style.badgeClass, "mb-2 gap-1")}
                        >
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {t(style.labelKey)}
                        </Badge>
                        <p className="font-medium">{manual.title}</p>
                        {manual.notes ? (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {manual.notes}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-xs font-medium lg:hidden">
                          {t("professionalDashboard.calendar.table.date")}
                        </p>
                        <p className="text-muted-foreground">
                          {formatDateTime(manual.startDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium lg:hidden">
                          {t("professionalDashboard.calendar.table.mode")}
                        </p>
                        <Badge variant="outline">
                          {t(
                            `professionalDashboard.calendar.types.${manual.type}`,
                          )}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-xs font-medium lg:hidden">
                          {t("professionalDashboard.calendar.table.status")}
                        </p>
                        <Badge variant="default">
                          {t("professionalDashboard.calendar.upcoming.manual")}
                        </Badge>
                      </div>

                      <div className="flex justify-start gap-2 lg:justify-end">
                        <Button
                          radius="xl"
                          size="sm"
                          variant="outline"
                          disabled={isDeletingManual}
                          onClick={() =>
                            void handleDeleteManualEvent(manual.id)
                          }
                        >
                          <L.Trash2 className="h-4 w-4" />
                          {t("professionalDashboard.calendar.delete")}
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {events.map((registration) => (
                  <div
                    key={registration.id}
                    className="grid gap-4 px-5 py-5 text-sm transition-colors hover:bg-primary/5 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] lg:items-center"
                  >
                    <div>
                      <Badge
                        variant="outline"
                        className={cn(eventStyle.badgeClass, "mb-2 gap-1")}
                      >
                        <EventCategoryIcon className="h-3.5 w-3.5" />
                        {t(eventStyle.labelKey)}
                      </Badge>
                      <p className="font-medium">
                        {registration.event?.title ??
                          t("professionalDashboard.calendar.eventFallback")}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>ID: {registration.eventId}</span>
                        {registration.event?.location ? (
                          <span className="inline-flex items-center gap-1">
                            <L.MapPin className="h-3.5 w-3.5" />
                            {registration.event.location}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium lg:hidden">
                        {t("professionalDashboard.calendar.table.date")}
                      </p>
                      <p className="text-muted-foreground">
                        {formatDateTime(registration.event?.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium lg:hidden">
                        {t("professionalDashboard.calendar.table.mode")}
                      </p>
                      <Badge variant="secondary">
                        {registration.event?.deliveryMode ?? "—"}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium lg:hidden">
                        {t("professionalDashboard.calendar.table.status")}
                      </p>
                      <Badge
                        variant={registration.isLive ? "default" : "secondary"}
                      >
                        {registration.isLive
                          ? t("professionalDashboard.calendar.liveNow")
                          : registration.status}
                      </Badge>
                    </div>

                    <div className="flex justify-start gap-2 lg:justify-end">
                      {registration.event?.onlineUrl ? (
                        <Button radius="xl" size="sm" asChild>
                          <Link
                            href={registration.event.onlineUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <L.Video className="h-4 w-4" />
                            {t("professionalDashboard.calendar.join")}
                          </Link>
                        </Button>
                      ) : null}

                      <Button radius="xl" variant="outline" size="sm" asChild>
                        <Link href={getEventHref(registration)}>
                          {t("professionalDashboard.common.details")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("professionalDashboard.calendar.empty")}
              </div>
            )}
          </div>
        </div>

        <ContentPagination
          page={page}
          className="mt-6"
          onNext={handleNext}
          isLoading={isFetching}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          totalCount={data?.totalCount}
          hasNextPage={Boolean(pageInfo?.hasNextPage)}
        />
      </GlassCard>

      <AddCalendarEventDialog
        open={isAddOpen}
        onOpenChange={handleAddOpenChange}
      />

      <CalendarEventDetailsDialog
        t={t}
        manual={selectedManualEvent}
        registration={selectedEvent}
        getEventHref={getEventHref}
        formatDuration={formatDuration}
        formatDateTime={formatDateTime}
        isDeletingManual={isDeletingManual}
        onDeleteManual={handleDeleteManualEvent}
        open={Boolean(selectedEvent || selectedManualEvent)}
        onOpenChange={(open) => {
          if (!open) closeEventDetails();
        }}
      />
    </section>
  );
};

export default ProfessionalCalendarTab;
