"use client";

import { formatCalendarDate } from "@/utils/completion-date.util";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

import type { TRequirementExcludedActivitiesProps } from "@/types/professional-requirement.types";

import * as L from "lucide-react";

const KEY = "cpdProgress.requirements.excluded";

export const RequirementExcludedActivities = ({
  t,
  activities,
}: TRequirementExcludedActivitiesProps) => {
  const { language } = useI18n();

  if (!activities.length) return null;

  return (
    <GlassCard>
      <h2 className="text-sm font-medium">{t(`${KEY}.title`)}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {t(`${KEY}.description`)}
      </p>

      <ul className="mt-3 space-y-2">
        {activities.map((activity) => (
          <li
            key={activity.activityId}
            className="rounded-md border border-warning/30 bg-warning-soft p-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="min-w-0 truncate text-sm font-medium">
                {activity.title}
              </p>
              <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatCalendarDate(activity.date, language)}
                {" · "}
                {t(`${KEY}.credits`, { credits: activity.credits })}
              </p>
            </div>

            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-warning-soft-foreground">
              <L.TriangleAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              {t(`${KEY}.reason.${activity.reason}`)}
            </p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
};
