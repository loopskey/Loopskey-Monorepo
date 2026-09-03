"use client";

import { AssociationComplianceBand } from "@/lib/graphql/base";
import { TAssociationMemberHeader } from "@/types/association-dashboard.types";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { CHART_SEMANTIC_SLOTS } from "@hooks/useChartPalette";
import { semanticChartColor } from "@hooks/useChartPalette";
import { useChartPalette } from "@hooks/useChartPalette";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as L from "lucide-react";

const GAUGE_HEIGHT = "h-52";

const BAND_SEMANTICS = {
  [AssociationComplianceBand.RenewalReady]: "renewalReady",
  [AssociationComplianceBand.OnTrack]: "onTrack",
  [AssociationComplianceBand.AtRisk]: "atRisk",
  [AssociationComplianceBand.NotStarted]: "notStarted",
} as const;

const BAND_VARIANTS = {
  [AssociationComplianceBand.RenewalReady]: "default",
  [AssociationComplianceBand.OnTrack]: "default",
  [AssociationComplianceBand.AtRisk]: "orange",
  [AssociationComplianceBand.NotStarted]: "secondary",
} as const;

const CompletionGauge = dynamic(
  () =>
    import("@modules/AssociationDashboard/parts/association-completion-gauge"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={`${GAUGE_HEIGHT} w-full rounded-2xl`} />
    ),
  },
);

export const AssociationMemberDetailHeader = ({
  hook,
}: TAssociationMemberHeader) => {
  const palette = useChartPalette();

  const {
    t,
    member,
    summary,
    openEdit,
    isMutating,
    changeStatus,
    backToRoster,
    openRequirements,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.memberDetail.chart.${key}`);

  const isInactive = member?.status === AssociationMemberStatus.Inactive;

  return (
    <GlassCard>
      <div className="relative z-10">
        <Button
          size="sm"
          radius="xl"
          type="button"
          variant="glass"
          onClick={backToRoster}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("associationDashboard.memberDetail.backToRoster")}
        </Button>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium">
                {member?.fullName ?? member?.email ?? "-"}
              </h1>

              <Badge
                variant={
                  isInactive
                    ? "secondary"
                    : member?.status === AssociationMemberStatus.Active
                      ? "default"
                      : "orange"
                }
              >
                {t(
                  `associationDashboard.members.status.${member?.status ?? AssociationMemberStatus.Active}`,
                )}
              </Badge>

              {summary && (
                <Badge variant={BAND_VARIANTS[summary.band]}>
                  {t(`associationDashboard.memberDetail.band.${summary.band}`)}
                </Badge>
              )}
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t("associationDashboard.memberDetail.email")}
                </dt>
                <dd className="mt-1 break-all text-sm">
                  {member?.email ?? "-"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t("associationDashboard.members.table.memberNumber")}
                </dt>
                <dd className="mt-1 text-sm">{member?.memberNumber ?? "-"}</dd>
              </div>

              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  {t("associationDashboard.members.table.group")}
                </dt>
                <dd className="mt-1 text-sm">{member?.group?.title ?? "-"}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={openEdit}
                disabled={isMutating}
              >
                <L.PenLine className="h-4 w-4" />
                {t("associationDashboard.memberDetail.actions.edit")}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="glass"
                disabled={isMutating}
                onClick={openRequirements}
              >
                <L.ListChecks className="h-4 w-4" />
                {t("associationDashboard.memberDetail.actions.requirements")}
              </Button>

              {isInactive ? (
                <Button
                  radius="xl"
                  type="button"
                  variant="brand"
                  disabled={isMutating}
                  onClick={() =>
                    void changeStatus(AssociationMemberStatus.Active)
                  }
                >
                  <L.UserCheck className="h-4 w-4" />
                  {t("associationDashboard.members.actions.reactivate")}
                </Button>
              ) : (
                <ConfirmDialog
                  isLoading={isMutating}
                  confirmVariant="destructive"
                  title={t(
                    "associationDashboard.members.confirm.deactivateTitle",
                  )}
                  cancelText={t("associationDashboard.members.confirm.cancel")}
                  confirmText={t(
                    "associationDashboard.members.confirm.deactivateConfirm",
                  )}
                  description={t(
                    "associationDashboard.memberDetail.confirm.deactivateBody",
                    { name: member?.fullName ?? member?.email ?? "" },
                  )}
                  onConfirm={() =>
                    changeStatus(AssociationMemberStatus.Inactive)
                  }
                  trigger={
                    <Button
                      radius="xl"
                      type="button"
                      variant="glass"
                      disabled={isMutating}
                    >
                      <L.UserMinus className="h-4 w-4" />
                      {t("associationDashboard.members.actions.deactivate")}
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          {summary && (
            <CompletionGauge
              label={label}
              percent={summary.percent}
              pacePercent={summary.pacePercent ?? null}
              color={semanticChartColor(palette, BAND_SEMANTICS[summary.band])}
              paceColor={palette[CHART_SEMANTIC_SLOTS.notStarted]}
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
};
