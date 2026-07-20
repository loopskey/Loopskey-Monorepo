"use client";

import { OrganizationAccessRequestStatus } from "@/lib/graphql/generated";
import { useAdminAccessRequestsTab } from "@/hooks/useAdminAccessRequestsTab";
import { StatusBadge } from "@modules/AdminDashboard/parts/admin-status-badge";
import { InfoRow } from "@modules/AdminDashboard/parts/admin-request-info-row";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

type Props = {
  hook: ReturnType<typeof useAdminAccessRequestsTab>;
};

export const AdminAccessRequestReviewView = ({ hook }: Props) => {
  const { t, detailQuery, selectedRequest, closeRequestReview } = hook;

  if (!selectedRequest) {
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeRequestReview}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>

        <GlassCard>
          <div
            className={`flex min-h-72 items-center justify-center text-sm ${
              detailQuery.isError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {detailQuery.isError
              ? t("adminDashboard.accessRequests.detailError")
              : t("common.loading")}
          </div>
        </GlassCard>
      </div>
    );
  }

  const isPending =
    selectedRequest.status === OrganizationAccessRequestStatus.Pending;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeRequestReview}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("adminDashboard.accessRequests.dialog.title")}
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {selectedRequest.organizationName}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={selectedRequest.status} />

              <Badge variant="secondary" className="rounded-full">
                {selectedRequest.organizationType}
              </Badge>

              <span className="text-sm text-muted-foreground">
                {formatDate(selectedRequest.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.accessRequests.dialog.organization")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.accessRequests.dialog.description")}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-3xl bg-background/45 p-4 text-sm">
              <InfoRow
                value={selectedRequest.organizationName}
                label={t("adminDashboard.accessRequests.dialog.organization")}
              />

              <InfoRow
                value={selectedRequest.organizationType}
                label={t("adminDashboard.accessRequests.table.type")}
              />

              <InfoRow
                value={selectedRequest.country}
                label={t("adminDashboard.accessRequests.dialog.country")}
              />

              <InfoRow
                value={selectedRequest.expectedLicensedProfessionals}
                label={t("adminDashboard.accessRequests.dialog.expectedUsers")}
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.accessRequests.dialog.representative")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedRequest.workEmail}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-3xl bg-background/45 p-4 text-sm">
              <InfoRow
                value={selectedRequest.representativeFullName}
                label={t("adminDashboard.accessRequests.dialog.representative")}
              />

              <InfoRow
                value={selectedRequest.workEmail}
                label={t("adminDashboard.accessRequests.dialog.email")}
              />

              <InfoRow
                value={selectedRequest.representativeJobRole}
                label={t("adminDashboard.accessRequests.dialog.role")}
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.Target className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.accessRequests.dialog.goals")}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.accessRequests.dialog.description")}
                </p>
              </div>
            </div>

            <p className="mt-6 rounded-3xl bg-background/45 p-4 text-sm leading-7 text-muted-foreground">
              {selectedRequest.goals}
            </p>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="h-fit">
            <h2 className="text-lg font-medium">
              {t("adminDashboard.accessRequests.actions.review")}
            </h2>

            <div className="mt-5 grid gap-3 text-sm">
              <InfoRow
                value={selectedRequest.status}
                label={t("adminDashboard.accessRequests.table.status")}
              />

              <InfoRow
                value={formatDate(selectedRequest.createdAt)}
                label={t("adminDashboard.accessRequests.table.createdAt")}
              />

              {selectedRequest.reviewedAt && (
                <InfoRow
                  value={formatDate(selectedRequest.reviewedAt)}
                  label={t("adminDashboard.accessRequests.review.reviewedAt")}
                />
              )}

              {selectedRequest.reviewedByName && (
                <InfoRow
                  value={selectedRequest.reviewedByName}
                  label={t("adminDashboard.accessRequests.table.reviewer")}
                />
              )}

              {selectedRequest.rejectReason && (
                <InfoRow
                  value={selectedRequest.rejectReason}
                  label={t("adminDashboard.accessRequests.dialog.rejectReason")}
                />
              )}
            </div>
          </GlassCard>

          {isPending && (
            <GlassCard className="h-fit">
              <h2 className="text-lg font-medium">
                {t("adminDashboard.accessRequests.review.actionsTitle")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {t("adminDashboard.accessRequests.review.actionsDeferred")}
              </p>

              <div className="mt-5 grid gap-2">
                <Button radius="xl" type="button" variant="brand" disabled>
                  <L.CheckCircle2 className="h-4 w-4" />
                  {t("adminDashboard.accessRequests.actions.approve")}
                </Button>

                <Button radius="xl" type="button" variant="cancel" disabled>
                  <L.XCircle className="h-4 w-4" />
                  {t("adminDashboard.accessRequests.actions.reject")}
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
};
