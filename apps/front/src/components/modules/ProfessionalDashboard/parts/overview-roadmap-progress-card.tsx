"use client";

import { useProfessionalMyRoadmapsQuery } from "@/lib/rtk/endpoints/professional.api";
import { PROFESSIONAL_OVERVIEW_LINKS } from "@/utils/professional-overview.helper";
import { buildRoadmapProgressView } from "@/utils/professional-overview.helper";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import Link from "next/link";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as L from "lucide-react";

export const OverviewRoadmapProgressCard = () => {
  const { t } = useI18n();

  const roadmapsQuery = useProfessionalMyRoadmapsQuery({
    pagination: { take: 4 },
  });
  const roadmaps = roadmapsQuery.data?.items ?? [];
  const featured = roadmaps[0];

  const state = getOverviewSectionState({
    isLoading: roadmapsQuery.isLoading,
    isError: roadmapsQuery.isError,
    isEmpty: !featured,
  });

  const title = t("professionalDashboard.overview.roadmapCard.title");
  const footer = (
    <PC.OverviewCardLink
      href={PROFESSIONAL_OVERVIEW_LINKS.roadmap}
      label={t("professionalDashboard.overview.roadmapCard.link")}
    />
  );

  if (state === "loading") {
    return (
      <PC.OverviewCard title={title} icon={L.Map} footer={footer}>
        <PC.OverviewCardLoading />
      </PC.OverviewCard>
    );
  }

  if (state === "error") {
    return (
      <PC.OverviewCard title={title} icon={L.Map} footer={footer}>
        <PC.OverviewCardError />
      </PC.OverviewCard>
    );
  }

  if (state === "empty" || !featured) {
    return (
      <PC.OverviewCard title={title} icon={L.Map} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.Route}
          title={t("professionalDashboard.overview.roadmapCard.emptyTitle")}
          description={t(
            "professionalDashboard.overview.roadmapCard.emptyDescription",
          )}
          action={
            <Button asChild variant="brand" radius="xl" size="sm">
              <Link href={PROFESSIONAL_OVERVIEW_LINKS.roadmap}>
                {t("professionalDashboard.overview.roadmapCard.emptyAction")}
              </Link>
            </Button>
          }
        />
      </PC.OverviewCard>
    );
  }

  const view = buildRoadmapProgressView(featured, {
    completed: t("professionalDashboard.overview.roadmapCard.completed"),
    remaining: t("professionalDashboard.overview.roadmapCard.remaining"),
  });
  const stepsSuffix = t(
    "professionalDashboard.overview.roadmapCard.stepsSuffix",
  );

  return (
    <PC.OverviewCard title={title} icon={L.Map} footer={footer}>
      <p className="truncate text-sm font-medium" title={featured.title}>
        {featured.title}
      </p>

      <ProgressDonutChart
        data={view.chartData}
        valueSuffix={stepsSuffix}
        ariaLabel={t("professionalDashboard.overview.roadmapCard.chartAria", {
          completed: view.completed,
          total: view.total,
          percent: view.percent,
        })}
        centerLabel={
          <>
            <p className="text-3xl font-medium text-primary">
              {view.chartPercent}%
            </p>
            <p className="text-xs text-muted-foreground">
              {t("professionalDashboard.overview.roadmapCard.complete")}
            </p>
          </>
        }
      />

      <p className="text-center text-sm text-muted-foreground">
        {t("professionalDashboard.overview.roadmapCard.summary", {
          completed: view.completed,
          total: view.total,
        })}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.roadmapCard.phases")}
          </dt>
          <dd className="mt-1 font-medium">
            {view.completedPhases}/{view.phasesCount}
          </dd>
        </div>
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.roadmapCard.remainingSteps")}
          </dt>
          <dd className="mt-1 font-medium">{view.remaining}</dd>
        </div>
      </dl>

      {featured.nextPhaseTitle ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/5 p-3 text-xs text-muted-foreground">
          <L.Flag className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            {t("professionalDashboard.overview.roadmapCard.nextPhase", {
              phase: featured.nextPhaseTitle,
            })}
          </span>
        </p>
      ) : null}
    </PC.OverviewCard>
  );
};
