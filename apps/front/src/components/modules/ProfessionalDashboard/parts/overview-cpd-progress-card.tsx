"use client";

import { PROFESSIONAL_OVERVIEW_LINKS } from "@/utils/professional-overview.helper";
import { useCpdPlanProgressQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { CPD_COMPLIANCE_META } from "@/utils/cpd-plan.constant";
import { useMyCpdPlansQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { formatDeadline } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as L from "lucide-react";

const TONE_CLASSES: Record<string, string> = {
  success: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  info: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  warning: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  danger: "text-red-600 bg-red-500/10 dark:text-red-400",
  neutral: "text-muted-foreground bg-muted",
};

const STATUS_ICONS: Record<string, L.LucideIcon> = {
  Circle: L.Circle,
  Loader: L.Loader,
  CalendarX: L.CalendarX,
  TrendingUp: L.TrendingUp,
  FileWarning: L.FileWarning,
  CheckCircle2: L.CheckCircle2,
  AlertTriangle: L.AlertTriangle,
};

export const OverviewCpdProgressCard = () => {
  const { t } = useI18n();

  const plansQuery = useMyCpdPlansQuery();
  const plans = plansQuery.data ?? [];
  const primaryPlan = plans[0];

  const progressQuery = useCpdPlanProgressQuery(
    { planId: primaryPlan?.id ?? "" },
    { skip: !primaryPlan },
  );

  const isLoading =
    plansQuery.isLoading ||
    (Boolean(primaryPlan) && progressQuery.isLoading) ||
    (Boolean(primaryPlan) && !progressQuery.data && !progressQuery.isError);
  const isError = plansQuery.isError || progressQuery.isError;
  const state = getOverviewSectionState({
    isLoading,
    isError,
    isEmpty: !primaryPlan,
  });

  const title = t("professionalDashboard.overview.cpdCard.title");
  const footer = (
    <PC.OverviewCardLink
      href={PROFESSIONAL_OVERVIEW_LINKS.cpdProgress}
      label={t("professionalDashboard.overview.cpdCard.link")}
    />
  );

  if (state === "loading") {
    return (
      <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
        <PC.OverviewCardLoading />
      </PC.OverviewCard>
    );
  }

  if (state === "error") {
    return (
      <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
        <PC.OverviewCardError />
      </PC.OverviewCard>
    );
  }

  if (state === "empty" || !primaryPlan || !progressQuery.data) {
    return (
      <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.Target}
          title={t("professionalDashboard.overview.cpdCard.emptyTitle")}
          description={t(
            "professionalDashboard.overview.cpdCard.emptyDescription",
          )}
          action={
            <Button asChild variant="brand" radius="xl" size="sm">
              <Link href={PROFESSIONAL_OVERVIEW_LINKS.cpdProgress}>
                {t("professionalDashboard.overview.cpdCard.emptyAction")}
              </Link>
            </Button>
          }
        />
      </PC.OverviewCard>
    );
  }

  const progress = progressQuery.data;
  const creditLabel = t(`cpdProgress.creditTypes.${primaryPlan.creditType}`);
  const view = buildCpdProgressView(progress, {
    earned: t("professionalDashboard.overview.cpdCard.earned"),
    remaining: t("professionalDashboard.overview.cpdCard.remaining"),
  });

  const meta = CPD_COMPLIANCE_META[progress.complianceStatus] ?? {
    tone: "neutral",
    icon: "Circle",
  };
  const StatusIcon = STATUS_ICONS[meta.icon] ?? L.Circle;
  const deadline = formatDeadline(primaryPlan.reportingEnd);

  return (
    <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
      <p
        className="truncate text-sm font-medium"
        title={primaryPlan.certificationName}
      >
        {primaryPlan.certificationName}
      </p>

      <ProgressDonutChart
        data={view.chartData}
        valueSuffix={creditLabel}
        ariaLabel={t("professionalDashboard.overview.cpdCard.chartAria", {
          earned: view.earned,
          total: view.total,
          credit: creditLabel,
          percent: view.percent,
        })}
        centerLabel={
          <>
            <p className="text-3xl font-medium text-primary">
              {view.chartPercent}%
            </p>
            <p className="text-xs text-muted-foreground">
              {t("professionalDashboard.overview.cpdCard.complete")}
            </p>
          </>
        }
      />

      <p className="text-center text-sm text-muted-foreground">
        {t("professionalDashboard.overview.cpdCard.summary", {
          earned: view.earned,
          total: view.hasTarget ? view.total : "—",
          credit: creditLabel,
        })}
      </p>

      {view.exceeded ? (
        <p className="mt-1 text-center text-xs font-medium text-primary">
          {t("professionalDashboard.overview.cpdCard.exceeded", {
            amount: view.overAmount,
            credit: creditLabel,
          })}
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.cpdCard.earned")}
          </dt>
          <dd className="mt-1 font-medium">
            {view.earned} {creditLabel}
          </dd>
        </div>
        <div className="rounded-2xl bg-background/45 p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.cpdCard.remaining")}
          </dt>
          <dd className="mt-1 font-medium">
            {view.remaining} {creditLabel}
          </dd>
        </div>
      </dl>

      <div
        className={cn(
          "mt-4 flex items-center gap-3 rounded-2xl p-3",
          TONE_CLASSES[meta.tone],
        )}
      >
        <StatusIcon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          {t(`cpdProgress.compliance.${progress.complianceStatus}`)}
        </p>
      </div>

      {primaryPlan.reportingEnd ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <L.CalendarClock className="h-4 w-4" />
          {t("professionalDashboard.overview.cpdCard.deadline", {
            date: deadline,
          })}
        </p>
      ) : null}
    </PC.OverviewCard>
  );
};
