"use client";

import { useProfessionalCalendarEventsQuery } from "@/lib/rtk/endpoints/professional.api";
import { formatDateTime, humanizeEnumValue } from "@/utils/function-helper";
import { useMyCalendarEntriesQuery } from "@/lib/rtk/endpoints/professional.api";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@ui/badge";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as H from "@/utils/professional-overview.helper";
import * as L from "lucide-react";

const DaysRemainingLabel = ({
  days,
  t,
}: {
  days: number | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}) => {
  if (days === null) return null;
  let label: string;
  if (days <= 0) label = t("professionalDashboard.overview.calendarCard.today");
  else if (days === 1)
    label = t("professionalDashboard.overview.calendarCard.tomorrow");
  else
    label = t("professionalDashboard.overview.calendarCard.inDays", { days });
  return (
    <Badge variant="secondary" className="shrink-0 rounded-full">
      {label}
    </Badge>
  );
};

export const OverviewUpcomingCalendarCard = () => {
  const { t } = useI18n();

  const registrationsQuery = useProfessionalCalendarEventsQuery({
    pagination: { take: 6 },
  });
  const manualQuery = useMyCalendarEntriesQuery();

  const items = H.buildUpcomingCalendarItems({
    registrations: registrationsQuery.data?.items ?? [],
    manual: manualQuery.data ?? [],
    limit: 4,
  });

  const state = H.getOverviewSectionState({
    isLoading: registrationsQuery.isLoading || manualQuery.isLoading,
    isError: registrationsQuery.isError || manualQuery.isError,
    isEmpty: items.length === 0,
  });

  const title = t("professionalDashboard.overview.calendarCard.title");
  const footer = (
    <PC.OverviewCardLink
      href={H.PROFESSIONAL_OVERVIEW_LINKS.calendar}
      label={t("professionalDashboard.overview.calendarCard.link")}
    />
  );

  if (state === "loading") {
    return (
      <PC.OverviewCard title={title} icon={L.CalendarDays} footer={footer}>
        <PC.OverviewCardLoading />
      </PC.OverviewCard>
    );
  }

  if (state === "error") {
    return (
      <PC.OverviewCard title={title} icon={L.CalendarDays} footer={footer}>
        <PC.OverviewCardError />
      </PC.OverviewCard>
    );
  }

  if (state === "empty") {
    return (
      <PC.OverviewCard title={title} icon={L.CalendarDays} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.CalendarX}
          title={t("professionalDashboard.overview.calendarCard.emptyTitle")}
          description={t(
            "professionalDashboard.overview.calendarCard.emptyDescription",
          )}
        />
      </PC.OverviewCard>
    );
  }

  return (
    <PC.OverviewCard title={title} icon={L.CalendarDays} footer={footer}>
      <ul className="space-y-3">
        {items.map((item: H.UpcomingCalendarItem) => (
          <li
            key={item.id}
            className="rounded-2xl border border-glass-border bg-background/45 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate font-medium" title={item.title}>
                {item.title ||
                  t("professionalDashboard.calendar.eventFallback")}
              </p>
              <DaysRemainingLabel days={item.daysRemaining} t={t} />
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <L.Clock className="h-3.5 w-3.5" />
              {formatDateTime(item.startDate)}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.type ? (
                <Badge variant="outline" className="rounded-full">
                  {humanizeEnumValue(item.type)}
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full"
              >
                {item.isOnline ? (
                  <L.Globe className="h-3 w-3" />
                ) : (
                  <L.MapPin className="h-3 w-3" />
                )}
                {item.isOnline
                  ? t("professionalDashboard.overview.calendarCard.online")
                  : item.location ||
                    t("professionalDashboard.overview.calendarCard.inPerson")}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </PC.OverviewCard>
  );
};
