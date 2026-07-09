"use client";

import { TCalendarEventDetailsDialogProps } from "@/types/professional-dashboard.types";
import { ExternalLink, Trash2, Video } from "lucide-react";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as D from "@ui/dialog";

export const CalendarEventDetailsDialog = ({
  t,
  open,
  manual,
  onOpenChange,
  getEventHref,
  registration,
  formatDateTime,
  formatDuration,
  onDeleteManual,
  isDeletingManual,
}: TCalendarEventDetailsDialogProps) => {
  const title = registration
    ? (registration.event?.title ??
      t("professionalDashboard.calendar.eventFallback"))
    : (manual?.title ?? t("professionalDashboard.calendar.eventFallback"));

  const range = registration
    ? `${formatDateTime(registration.event?.startDate)} — ${formatDateTime(
        registration.event?.endDate,
      )}`
    : manual
      ? manual.endDate
        ? `${formatDateTime(manual.startDate)} — ${formatDateTime(manual.endDate)}`
        : formatDateTime(manual.startDate)
      : "";

  const registrationStyle = getContentTypeStyle("EVENT");
  const manualStyle = getContentTypeStyle(manual?.contentType);
  const RegIcon = registrationStyle.icon;
  const ManualIcon = manualStyle.icon;

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="max-h-[85vh] overflow-y-auto">
        <D.DialogHeader>
          <D.DialogTitle>{title}</D.DialogTitle>
          <D.DialogDescription>{range}</D.DialogDescription>
        </D.DialogHeader>

        {registration ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(registrationStyle.badgeClass, "gap-1")}
              >
                <RegIcon className="h-3.5 w-3.5" />
                {t(registrationStyle.labelKey)}
              </Badge>
              <Badge variant="secondary">{registration.status}</Badge>
              {registration.event?.deliveryMode ? (
                <Badge variant="outline">
                  {registration.event.deliveryMode}
                </Badge>
              ) : null}
              {registration.event?.type ? (
                <Badge variant="outline">{registration.event.type}</Badge>
              ) : null}
              <Badge variant="outline">
                {registration.event?.pdu ?? 0} PDU
              </Badge>
              <Badge variant="outline">
                {formatDuration(registration.durationMinutes)}
              </Badge>
            </div>

            {registration.event?.location ? (
              <p className="text-sm text-muted-foreground">
                {registration.event.location}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              {registration.event?.onlineUrl ? (
                <Button radius="xl" variant="brand" asChild>
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    href={registration.event.onlineUrl}
                  >
                    <Video className="h-4 w-4" />
                    {t("professionalDashboard.calendar.joinOnline")}
                  </Link>
                </Button>
              ) : null}

              <Button radius="xl" variant="glass" asChild>
                <Link href={getEventHref(registration)}>
                  <ExternalLink className="h-4 w-4" />
                  {t("professionalDashboard.common.details")}
                </Link>
              </Button>

              <Button
                radius="xl"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t("professionalDashboard.calendar.close")}
              </Button>
            </div>
          </div>
        ) : manual ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(manualStyle.badgeClass, "gap-1")}
              >
                <ManualIcon className="h-3.5 w-3.5" />
                {t(manualStyle.labelKey)}
              </Badge>
              <Badge variant="default">
                {t("professionalDashboard.calendar.upcoming.manual")}
              </Badge>
              <Badge variant="outline">
                {t(`professionalDashboard.calendar.types.${manual.type}`)}
              </Badge>
              {manual.durationMinutes ? (
                <Badge variant="outline">
                  {formatDuration(manual.durationMinutes)}
                </Badge>
              ) : null}
            </div>

            {manual.notes ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {manual.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                radius="xl"
                variant="destructive"
                disabled={isDeletingManual}
                onClick={() => onDeleteManual(manual.id)}
              >
                <Trash2 className="h-4 w-4" />
                {t("professionalDashboard.calendar.delete")}
              </Button>

              <Button
                radius="xl"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                {t("professionalDashboard.calendar.close")}
              </Button>
            </div>
          </div>
        ) : null}
      </D.DialogContent>
    </D.Dialog>
  );
};

export default CalendarEventDetailsDialog;
