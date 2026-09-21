"use client";

import { useMyAssociationRequirementsQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { PROFESSIONAL_OVERVIEW_LINKS } from "@/utils/professional-overview.helper";
import { useCpdPlanProgressQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { RequirementSourceBadge } from "@modules/ProfessionalDashboard/parts/requirement-source-badge";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { RequirementSwitcher } from "@modules/ProfessionalDashboard/parts/requirement-switcher";
import { CPD_COMPLIANCE_META } from "@/utils/cpd-plan.constant";
import { useMyCpdPlansQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { useMemo, useState } from "react";
import { useChartSemantics } from "@hooks/useChartPalette";
import { formatDeadline } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import Link from "next/link";

import * as PC from "@modules/ProfessionalDashboard/parts/overview-card";
import * as R from "@/utils/professional-requirement.helper";
import * as L from "lucide-react";

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
  const semantics = useChartSemantics();
  const { t } = useI18n();

  const plansQuery = useMyCpdPlansQuery();
  const associationsQuery = useMyAssociationRequirementsQuery();
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const associations = useMemo(
    () => associationsQuery.data ?? [],
    [associationsQuery.data],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const options = useMemo(
    () => R.buildRequirementOptions(associations, plans),
    [associations, plans],
  );
  const activeKey = R.resolveActiveKey(options, selectedKey);
  const active = R.parseRequirementKey(activeKey);

  const activePlan =
    active?.source === "PLAN"
      ? plans.find((plan) => plan.id === active.id)
      : undefined;
  const activeAssociation =
    active?.source === "ASSOCIATION"
      ? associations.find(
          (requirement) => requirement.requirementId === active.id,
        )
      : undefined;

  const progressQuery = useCpdPlanProgressQuery(
    { planId: activePlan?.id ?? "" },
    { skip: !activePlan },
  );

  const isListLoading = plansQuery.isLoading || associationsQuery.isLoading;
  const isProgressLoading =
    Boolean(activePlan) && !progressQuery.data && !progressQuery.isError;
  const isError =
    (options.length === 0 &&
      (plansQuery.isError || associationsQuery.isError)) ||
    progressQuery.isError;
  const state = getOverviewSectionState({
    isLoading: isListLoading || isProgressLoading,
    isError,
    isEmpty: options.length === 0,
  });

  const title = t("professionalDashboard.overview.cpdCard.title");
  const href = activeKey
    ? `${PROFESSIONAL_OVERVIEW_LINKS.cpdProgress}&${R.REQUIREMENT_PARAM}=${encodeURIComponent(activeKey)}`
    : PROFESSIONAL_OVERVIEW_LINKS.cpdProgress;
  const footer = (
    <PC.OverviewCardLink
      href={href}
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

  const hasBody =
    Boolean(activeAssociation) || Boolean(activePlan && progressQuery.data);

  if (state === "empty" || !active || !hasBody) {
    return (
      <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
        <PC.OverviewCardMessage
          icon={L.Target}
          title={t("professionalDashboard.overview.cpdCard.emptyTitle")}
          description={t(
            "professionalDashboard.overview.cpdCard.emptyDescription",
          )}
          action={
            <Button asChild radius="xl" size="sm">
              <Link href={PROFESSIONAL_OVERVIEW_LINKS.cpdProgress}>
                {t("professionalDashboard.overview.cpdCard.emptyAction")}
              </Link>
            </Button>
          }
        />
      </PC.OverviewCard>
    );
  }

  const chartColors = {
    progress: semantics.onTrack,
    remainder: semantics.track,
  };
  const labels = {
    earned: t("professionalDashboard.overview.cpdCard.earned"),
    remaining: t("professionalDashboard.overview.cpdCard.remaining"),
  };

  const model = activeAssociation
    ? {
        name: activeAssociation.name,
        creditType: activeAssociation.creditType,
        deadline: activeAssociation.dueDate,
        view: buildCpdProgressView(
          {
            earnedCredits: activeAssociation.completedCredits,
            remainingCredits: activeAssociation.remainingCredits,
            totalRequiredCredits: activeAssociation.requiredCredits,
            progressPercent: activeAssociation.percent,
          },
          labels,
          chartColors,
        ),
        meta: R.BAND_META[activeAssociation.band] ?? R.BAND_META.NOT_STARTED,
        statusLabel: t(
          `cpdProgress.requirements.band.${activeAssociation.band}`,
        ),
      }
    : activePlan && progressQuery.data
      ? {
          name: activePlan.certificationName,
          creditType: activePlan.creditType,
          deadline: activePlan.reportingEnd,
          view: buildCpdProgressView(progressQuery.data, labels, chartColors),
          meta: CPD_COMPLIANCE_META[progressQuery.data.complianceStatus] ?? {
            tone: "neutral" as const,
            icon: "Circle",
          },
          statusLabel: t(
            `cpdProgress.compliance.${progressQuery.data.complianceStatus}`,
          ),
        }
      : null;

  if (!model) return null;

  const creditLabel = t(`cpdProgress.creditTypes.${model.creditType}`);
  const { view } = model;
  const StatusIcon = STATUS_ICONS[model.meta.icon] ?? L.Circle;

  return (
    <PC.OverviewCard title={title} icon={L.GaugeCircle} footer={footer}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium" title={model.name}>
            {model.name}
          </p>
          <RequirementSourceBadge t={t} source={active.source} />
        </div>
        <RequirementSwitcher
          t={t}
          options={options}
          onSelect={setSelectedKey}
          selectedKey={activeKey}
        />
      </div>

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
        <div className="rounded-md bg-muted p-3">
          <dt className="text-xs text-muted-foreground">
            {t("professionalDashboard.overview.cpdCard.earned")}
          </dt>
          <dd className="mt-1 font-medium">
            {view.earned} {creditLabel}
          </dd>
        </div>
        <div className="rounded-md bg-muted p-3">
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
          "mt-4 flex items-center gap-3 rounded-md p-3",
          R.REQUIREMENT_TONE_CLASSES[model.meta.tone],
        )}
      >
        <StatusIcon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{model.statusLabel}</p>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <L.CalendarClock className="h-4 w-4" />
        {model.deadline
          ? t("professionalDashboard.overview.cpdCard.deadline", {
              date: formatDeadline(model.deadline),
            })
          : t("professionalDashboard.overview.cpdCard.deadlineNone")}
      </p>
    </PC.OverviewCard>
  );
};
