"use client";

import { CalendarDays, Clock3, Mic2 } from "lucide-react";
import { TEventScheduleProps } from "@/types/content-module.types";
import { TScheduleItem } from "@/types/content-module.types";
import { formatTime } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

const EventSchedule = ({ items }: TEventScheduleProps) => {
  const { t } = useI18n();

  if (!items?.length) {
    return (
      <GlassCard className="p-8 text-center" glow={false}>
        <div className="relative z-10">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-medium">{t("contentDetails.schedule.empty")}</h3>
        </div>
      </GlassCard>
    );
  }

  const grouped = items.reduce<Record<number, TScheduleItem[]>>((acc, item) => {
    acc[item.dayNumber] = acc[item.dayNumber] ?? [];
    acc[item.dayNumber].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([day, dayItems]) => (
        <GlassCard key={day} className="p-5" glow={false}>
          <div className="relative z-10">
            <h3 className="mb-4 text-xl font-medium">
              {t("contentDetails.schedule.day")} {day}
            </h3>

            <div className="space-y-3">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-extrabold">{item.title}</h4>

                      {item.description && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      {item.speaker && (
                        <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          <Mic2 className="h-4 w-4" />
                          {item.speaker}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
                      <Clock3 className="h-4 w-4" />
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default EventSchedule;
