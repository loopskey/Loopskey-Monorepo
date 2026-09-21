"use client";

import { TEventScheduleProps } from "@/types/content-module.types";
import { formatEventTime } from "@/utils/content-source.helper";
import { TScheduleItem } from "@/types/content-module.types";
import { Clock3, Mic2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

const EventSchedule = ({ items, timeZone }: TEventScheduleProps) => {
  const { t } = useI18n();

  if (!items?.length) return null;

  const grouped = items.reduce<Record<number, TScheduleItem[]>>((acc, item) => {
    acc[item.dayNumber] = acc[item.dayNumber] ?? [];
    acc[item.dayNumber].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayItems]) => (
        <div key={day}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("contentDetails.schedule.day")} {day}
          </h3>

          <ol className="divide-y rounded-md border">
            {dayItems.map((item) => (
              <li
                key={item.id}
                className="grid gap-1 p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
              >
                <p className="flex items-center gap-2 text-sm font-medium tabular-nums text-primary">
                  <Clock3 className="h-4 w-4 shrink-0" aria-hidden />
                  {formatEventTime(item.startTime, timeZone)} -{" "}
                  {formatEventTime(item.endTime, timeZone)}
                </p>

                <div className="min-w-0">
                  <h4 className="font-medium">{item.title}</h4>

                  {item.description && (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  {item.speaker && (
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Mic2 className="h-4 w-4 shrink-0" aria-hidden />
                      {item.speaker}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};

export default EventSchedule;
