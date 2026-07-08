"use client";

import {
  TManualCalendarEvent,
  TProfessionalCalendarEvent,
} from "@/types/professional-dashboard.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { ExternalLink, Trash2, Video } from "lucide-react";
import { I18nContextValue } from "@/types/providers.types";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import Link from "next/link";

type TCalendarEventDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: TProfessionalCalendarEvent | null;
  manual: TManualCalendarEvent | null;
  isDeletingManual: boolean;
  t: I18nContextValue["t"];
  formatDateTime: (date?: string | null) => string;
  formatDuration: (minutes?: number | null) => string;
  getEventHref: (event: TProfessionalCalendarEvent) => string;
  onDeleteManual: (id: string) => void;
};

export const CalendarEventDetailsDialog = ({
  open,
  manual,
  onOpenChange,
  registration,
  isDeletingManual,
  t,
  formatDateTime,
  formatDuration,
  getEventHref,
  onDeleteManual,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{range}</DialogDescription>
        </DialogHeader>

        {registration ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
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
                    href={registration.event.onlineUrl}
                    target="_blank"
                    rel="noreferrer"
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
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventDetailsDialog;
