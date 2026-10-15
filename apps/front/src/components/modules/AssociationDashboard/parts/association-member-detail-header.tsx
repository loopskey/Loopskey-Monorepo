"use client";

import { TAssociationMemberHeader } from "@/types/association-dashboard.types";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { ASSOCIATION_BAND_COLORS, isLightBand } from "@utils/association-compliance-bands";
import { ProgressMeter } from "@elements/charts/progress-meter";
import { CHART_COLOR } from "@/utils/chart.util";
import { AssociationInvitationStatus } from "./association-invitation-status";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const AssociationMemberDetailHeader = ({
  hook,
}: TAssociationMemberHeader) => {
  const {
    t,
    member,
    summary,
    openEdit,
    isMutating,
    changeStatus,
    backToRoster,
    openRequirements,
    resendMemberInvitation,
    isResendingInvitation,
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
          variant="outline"
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
                <Badge variant={ASSOCIATION_BAND_VARIANTS[summary.band]}>
                  {t(`associationDashboard.memberDetail.band.${summary.band}`)}
                </Badge>
              )}
            </div>

            {member?.status === AssociationMemberStatus.PendingActivation && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AssociationInvitationStatus
                  delivery={member.invitationDelivery}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resendMemberInvitation}
                  disabled={isResendingInvitation}
                >
                  <L.Mail className="size-4" aria-hidden />
                  {t("associationDashboard.members.invite.resend")}
                </Button>
              </div>
            )}
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                radius="xl"
                type="button"
                variant="outline"
                onClick={openEdit}
                disabled={isMutating}
                className="w-full justify-center sm:w-auto"
              >
                <L.PenLine className="h-4 w-4" />
                {t("associationDashboard.memberDetail.actions.edit")}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="outline"
                disabled={isMutating}
                onClick={openRequirements}
                className="w-full justify-center sm:w-auto"
              >
                <L.ListChecks className="h-4 w-4" />
                {t("associationDashboard.memberDetail.actions.requirements")}
              </Button>

              {isInactive ? (
                <Button
                  radius="xl"
                  type="button"
                  disabled={isMutating}
                  className="w-full justify-center sm:w-auto"
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
                      variant="outline"
                      disabled={isMutating}
                      className="w-full justify-center sm:w-auto"
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
            <div className="grid content-center gap-3 rounded-lg border p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label("gaugeCaption")}
              </p>
              <p className="text-4xl font-semibold text-foreground">
                {Math.round(summary.percent)}%
              </p>
              <ProgressMeter
                max={100}
                value={summary.percent}
                label={label("gaugeLabel")}
                formatValue={(value) => `${Math.round(value)}%`}
                color={
                  isLightBand(summary.band)
                    ? CHART_COLOR.neutral
                    : ASSOCIATION_BAND_COLORS[summary.band]
                }
                marker={
                  summary.pacePercent === null ||
                  summary.pacePercent === undefined
                    ? undefined
                    : { value: summary.pacePercent, label: label("gaugePace") }
                }
              />
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
