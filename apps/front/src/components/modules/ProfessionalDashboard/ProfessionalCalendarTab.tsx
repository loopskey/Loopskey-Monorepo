"use client";

import { CalendarEventDetailsDialog } from "@modules/ProfessionalDashboard/parts/CalendarEventDetailsDialog";
import { useProfessionalCalendar } from "@/hooks/useProfessionalCalendar";
import { EventRegistrationStatus } from "@/lib/graphql/base";
import { AddCalendarEventDialog } from "@modules/ProfessionalDashboard/parts/AddCalendarEventDialog";
import { TCalendarStatusFilter } from "@/hooks/useProfessionalCalendar";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { ContentPagination } from "@/components/elements/pagination";
import { useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { IconAction } from "@elements/icon-action";
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

import * as L from "lucide-react";
import * as S from "@ui/select";

const CALENDAR_STATUS_OPTIONS = Object.values(EventRegistrationStatus);

const MOBILE_CALENDAR_QUERY = "(max-width: 1023px)";

const ProfessionalCalendarTab = () => {
  const {
    t,
    data,
    page,
    search,
    status,
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
    calendarEvents,
    upcomingEvents,
    formatDateTime,
    formatDuration,
    handlePrevious,
    isDeletingManual,
    closeEventDetails,
    handleStatusChange,
    selectedManualEvent,
    handleAddOpenChange,
    filteredManualEvents,
    handleDeleteManualEvent,
    handleSearchInputChange,
    handleCalendarEventClick,
  } = useProfessionalCalendar();

  const eventStyle = getContentTypeStyle("EVENT");
  const EventCategoryIcon = eventStyle.icon;

  const isMobileCalendar = useMediaQuery(MOBILE_CALENDAR_QUERY);
  const calendarRef = useRef<FullCalendar>(null);
  const [mobileViewType, setMobileViewType] = useState<
    "listWeek" | "dayGridMonth"
  >("listWeek");
  const hasActiveFilters = Boolean(search.trim() || status !== "ALL");

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
                eventDisplay="block"
                events={calendarEvents}
                eventClick={handleCalendarEventClick}
                eventDidMount={(arg) => {
                  arg.el.setAttribute("title", arg.event.title);
                }}
                eventContent={
                  isMobileCalendar
                    ? (arg) =>
                        arg.view.type === "dayGridMonth" ? (
                          <span
                            className="fc-event-dot block rounded-full"
                            style={{
                              backgroundColor:
                                arg.event.backgroundColor || "var(--primary)",
                            }}
                          />
                        ) : undefined
                    : undefined
                }
                dayMaxEvents={isMobileCalendar ? 3 : undefined}
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

        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
          <div className="relative">
            <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              className="h-11 pl-9"
              onChange={handleSearchInputChange}
              placeholder={t("professionalDashboard.calendar.search")}
            />
          </div>

          <S.Select
            value={status}
            onValueChange={(value) =>
              handleStatusChange(value as TCalendarStatusFilter)
            }
          >
            <S.SelectTrigger className="h-11 rounded-md">
              <S.SelectValue
                placeholder={t(
                  "professionalDashboard.calendar.filters.trigger",
                )}
              />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value="ALL">
                {t("professionalDashboard.calendar.filters.allStatuses")}
              </S.SelectItem>
              {CALENDAR_STATUS_OPTIONS.map((option) => (
                <S.SelectItem key={option} value={option}>
                  {t(`professionalDashboard.calendar.statuses.${option}`)}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>
        </div>

        {hasActiveFilters && (
          <div className="mb-5 flex justify-end">
            <Button
              radius="xl"
              type="button"
              variant="outline"
              onClick={resetFilters}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("professionalDashboard.calendar.filters.reset")}
            </Button>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] border-b border-border bg-primary/5 px-4 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground lg:grid">
            <span>{t("professionalDashboard.calendar.table.event")}</span>
            <span>{t("professionalDashboard.calendar.table.date")}</span>
            <span>{t("professionalDashboard.calendar.table.mode")}</span>
            <span>{t("professionalDashboard.calendar.table.status")}</span>
            <span className="text-right">
              {t("professionalDashboard.calendar.table.action")}
            </span>
          </div>

          <div className="divide-y divide-border">
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
                      className="bg-muted p-5 text-sm transition-colors hover:bg-primary/5 lg:grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] lg:items-center lg:gap-4"
                    >
                      <div className="min-w-0">
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

                      <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("professionalDashboard.calendar.table.date")}
                          </p>
                          <p className="mt-1">
                            {formatDateTime(manual.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("professionalDashboard.calendar.table.mode")}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {t(
                              `professionalDashboard.calendar.types.${manual.type}`,
                            )}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("professionalDashboard.calendar.table.status")}
                          </p>
                          <Badge variant="default" className="mt-1">
                            {t(
                              "professionalDashboard.calendar.upcoming.manual",
                            )}
                          </Badge>
                        </div>
                      </div>

                      <p className="hidden text-muted-foreground lg:block">
                        {formatDateTime(manual.startDate)}
                      </p>

                      <div className="hidden lg:block">
                        <Badge variant="outline">
                          {t(
                            `professionalDashboard.calendar.types.${manual.type}`,
                          )}
                        </Badge>
                      </div>

                      <div className="hidden lg:block">
                        <Badge variant="default">
                          {t("professionalDashboard.calendar.upcoming.manual")}
                        </Badge>
                      </div>

                      <div className="mt-4 flex justify-center gap-2 lg:mt-0 lg:justify-end">
                        <IconAction
                          icon={L.Trash2}
                          variant="cancel"
                          disabled={isDeletingManual}
                          label={t("professionalDashboard.calendar.delete")}
                          onClick={() =>
                            void handleDeleteManualEvent(manual.id)
                          }
                        />
                      </div>
                    </div>
                  );
                })}

                {events.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-muted p-5 text-sm transition-colors hover:bg-primary/5 lg:grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr] lg:items-center lg:gap-4"
                  >
                    <div className="min-w-0">
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

                    <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("professionalDashboard.calendar.table.date")}
                        </p>
                        <p className="mt-1">
                          {formatDateTime(registration.event?.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("professionalDashboard.calendar.table.mode")}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {registration.event?.deliveryMode ?? "—"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("professionalDashboard.calendar.table.status")}
                        </p>
                        <Badge
                          className="mt-1"
                          variant={
                            registration.isLive ? "default" : "secondary"
                          }
                        >
                          {registration.isLive
                            ? t("professionalDashboard.calendar.liveNow")
                            : registration.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="hidden text-muted-foreground lg:block">
                      {formatDateTime(registration.event?.startDate)}
                    </p>

                    <div className="hidden lg:block">
                      <Badge variant="secondary">
                        {registration.event?.deliveryMode ?? "—"}
                      </Badge>
                    </div>

                    <div className="hidden lg:block">
                      <Badge
                        variant={registration.isLive ? "default" : "secondary"}
                      >
                        {registration.isLive
                          ? t("professionalDashboard.calendar.liveNow")
                          : registration.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex justify-center gap-2 lg:mt-0 lg:justify-end">
                      {registration.event?.onlineUrl ? (
                        <IconAction
                          icon={L.Video}
                          variant="outline"
                          href={registration.event.onlineUrl}
                          target="_blank"
                          rel="noreferrer"
                          label={t("professionalDashboard.calendar.join")}
                        />
                      ) : null}

                      <IconAction
                        icon={L.Eye}
                        variant="outline"
                        href={getEventHref(registration)}
                        label={t("professionalDashboard.common.details")}
                      />
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
