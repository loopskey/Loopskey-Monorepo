"use client";

import { useProfessionalPduActivitiesQuery } from "@/lib/rtk/endpoints/professional.api";
import { formatDate, humanizeEnumValue } from "@/utils/function-helper";
import { PROFESSIONAL_OVERVIEW_LINKS } from "@/utils/professional-overview.helper";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { useI18n } from "@/hooks/useI18n";
import { Badge } from "@ui/badge";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as L from "lucide-react";

export const OverviewRecentActivitiesCard = () => {
  const { t } = useI18n();

  const activitiesQuery = useProfessionalPduActivitiesQuery({
    pagination: { take: 4 },
  });
  const activities = activitiesQuery.data?.items ?? [];

  const state = getOverviewSectionState({
    isLoading: activitiesQuery.isLoading,
    isError: activitiesQuery.isError,
    isEmpty: activities.length === 0,
  });

  const title = t("professionalDashboard.overview.activitiesCard.title");
  const footer = (
    <PC.OverviewCardLink
      href={PROFESSIONAL_OVERVIEW_LINKS.activities}
      label={t("professionalDashboard.overview.activitiesCard.link")}
    />
  );

  if (state === "loading") {
    return (
      <PC.OverviewCard title={title} icon={L.NotebookPen} footer={footer}>
        <PC.OverviewCardLoading />
      </PC.OverviewCard>
    );
  }

  if (state === "error") {
    return (
      <PC.OverviewCard title={title} icon={L.NotebookPen} footer={footer}>
        <PC.OverviewCardError />
      </PC.OverviewCard>
    );
  }

  if (state === "empty") {
    return (
      <PC.OverviewCard title={title} icon={L.NotebookPen} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.NotebookPen}
          title={t("professionalDashboard.overview.activitiesCard.emptyTitle")}
          description={t(
            "professionalDashboard.overview.activitiesCard.emptyDescription",
          )}
        />
      </PC.OverviewCard>
    );
  }

  return (
    <PC.OverviewCard title={title} icon={L.NotebookPen} footer={footer}>
      <ul className="space-y-3">
        {activities.map((activity) => {
          const hasEvidence = activity.evidenceFiles.length > 0;
          const creditLabel = t(
            `cpdProgress.creditTypes.${activity.creditType}`,
          );
          return (
            <li
              key={activity.id}
              className="rounded-2xl border border-glass-border bg-background/45 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="min-w-0 truncate font-medium"
                  title={activity.title}
                >
                  {activity.title}
                </p>
                <Badge
                  variant={
                    activity.completionStatus === "COMPLETED"
                      ? "default"
                      : "secondary"
                  }
                  className="shrink-0 rounded-full"
                >
                  {t(
                    `professionalDashboard.cpdPduTracker.completionStatuses.${activity.completionStatus}`,
                  )}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <L.Tag className="h-3.5 w-3.5" />
                  {humanizeEnumValue(activity.category)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <L.CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(activity.date) ?? "—"}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <L.Target className="h-3.5 w-3.5" />
                  {activity.pdus} {creditLabel}
                </span>
                {hasEvidence ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <L.Paperclip className="h-3.5 w-3.5" />
                    {t(
                      "professionalDashboard.overview.activitiesCard.evidence",
                    )}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </PC.OverviewCard>
  );
};
