"use client";

import { AdminIngestionBatchDetailDialog } from "@modules/AdminDashboard/parts/admin-ingestion-batch-detail-dialog";
import { AdminIngestionKeyRevokeDialog } from "@modules/AdminDashboard/parts/admin-ingestion-key-revoke-dialog";
import { AdminIngestionKeyIssueDialog } from "@modules/AdminDashboard/parts/admin-ingestion-key-issue-dialog";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { formatDate } from "@/utils/function-helper";
import { DataTable } from "@elements/data-table/data-table";
import { GlassCard } from "@elements/glass-card";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";
import * as L from "lucide-react";

const KEYS = "adminDashboard.ingestion.keys";
const BATCHES = "adminDashboard.ingestion.batches";

export const AdminIngestionSourceDetail = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const { t, selectedSourceQuery, closeSourceDetail } = hook;

  if (selectedSourceQuery.isLoading)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="outline"
          onClick={closeSourceDetail}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <DashboardContentSkeleton />
      </div>
    );

  if (selectedSourceQuery.isError || !selectedSourceQuery.data) {
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="outline"
          onClick={closeSourceDetail}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <GlassCard>
          <div className="flex min-h-40 items-center justify-center text-destructive">
            {t("adminDashboard.ingestion.sources.error")}
          </div>
        </GlassCard>
      </div>
    );
  }

  const source = selectedSourceQuery.data;

  return (
    <div className="space-y-6">
      <Button
        radius="xl"
        type="button"
        variant="outline"
        onClick={closeSourceDetail}
      >
        <L.ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Button>

      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{source.slug}</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {source.name}
          </h1>
          <div className="mt-3 flex gap-2">
            <Badge variant="secondary" className="rounded-full">
              {source.kind}
            </Badge>
            <Badge
              variant={source.isActive ? "default" : "secondary"}
              className="rounded-full"
            >
              {source.isActive
                ? t("adminDashboard.ingestion.sources.filters.active")
                : t("adminDashboard.ingestion.sources.filters.inactive")}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ToggleActiveButton hook={hook} />
        </div>
      </section>

      <EditSourceForm hook={hook} />
      <KeysSection hook={hook} />
      <BatchesSection hook={hook} />

      <AdminIngestionKeyIssueDialog hook={hook} />
      <AdminIngestionKeyRevokeDialog hook={hook} />
      <AdminIngestionBatchDetailDialog hook={hook} />
    </div>
  );
};

const ToggleActiveButton = ({ hook }: { hook: TUseAdminIngestionTab }) => {
  const { t, selectedSourceQuery, toggleSourceActive } = hook;
  const source = selectedSourceQuery.data;
  if (!source) return null;

  return (
    <Button
      radius="xl"
      type="button"
      variant={source.isActive ? "destructive" : "default"}
      onClick={() => toggleSourceActive(source.id, source.isActive)}
    >
      {source.isActive ? (
        <L.PowerOff className="h-4 w-4" />
      ) : (
        <L.Power className="h-4 w-4" />
      )}
      {t(
        source.isActive
          ? "adminDashboard.ingestion.sources.actions.deactivate"
          : "adminDashboard.ingestion.sources.actions.activate",
      )}
    </Button>
  );
};

const EditSourceForm = ({ hook }: { hook: TUseAdminIngestionTab }) => {
  const { t, editForm, submitEdit, isSavingEdit } = hook;

  return (
    <GlassCard>
      <h2 className="mb-4 text-lg font-medium">
        {t("adminDashboard.ingestion.sources.detail.settingsTitle")}
      </h2>

      <F.Form {...editForm}>
        <form className="space-y-4" onSubmit={submitEdit} noValidate>
          <F.FormField
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <F.FormItem>
                <F.FormLabel>
                  {t("adminDashboard.ingestion.sources.create.name")}
                </F.FormLabel>
                <F.FormControl>
                  <input
                    {...field}
                    className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm"
                  />
                </F.FormControl>
                <F.FormMessage />
              </F.FormItem>
            )}
          />

          <F.FormField
            control={editForm.control}
            name="stalenessWindowDays"
            render={({ field }) => (
              <F.FormItem>
                <F.FormLabel>
                  {t(
                    "adminDashboard.ingestion.sources.create.stalenessWindowDays",
                  )}
                </F.FormLabel>
                <F.FormControl>
                  <input
                    {...field}
                    type="number"
                    className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm"
                  />
                </F.FormControl>
                <F.FormMessage />
              </F.FormItem>
            )}
          />

          <F.FormField
            control={editForm.control}
            name="autoPublish"
            render={({ field }) => (
              <F.FormItem className="flex items-start justify-between gap-4 rounded-md border p-4">
                <div>
                  <F.FormLabel className="font-medium">
                    {t("adminDashboard.ingestion.sources.create.autoPublish")}
                  </F.FormLabel>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(
                      "adminDashboard.ingestion.sources.create.autoPublishHint",
                    )}
                  </p>
                </div>
                <F.FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t(
                      "adminDashboard.ingestion.sources.create.autoPublish",
                    )}
                  />
                </F.FormControl>
              </F.FormItem>
            )}
          />

          <F.FormField
            control={editForm.control}
            name="fieldMap"
            render={({ field }) => (
              <F.FormItem>
                <F.FormLabel>
                  {t("adminDashboard.ingestion.sources.create.fieldMap")}
                </F.FormLabel>
                <F.FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    className="rounded-md font-mono text-xs"
                  />
                </F.FormControl>
                <F.FormMessage />
              </F.FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button radius="xl" type="submit" disabled={isSavingEdit}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </F.Form>
    </GlassCard>
  );
};

const KeysSection = ({ hook }: { hook: TUseAdminIngestionTab }) => {
  const { t, keysQuery, openIssue, openRevokeConfirm } = hook;

  return (
    <GlassCard>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{t(`${KEYS}.title`)}</h2>
        <Button radius="xl" type="button" onClick={openIssue}>
          <L.KeyRound className="h-4 w-4" />
          {t(`${KEYS}.issue`)}
        </Button>
      </div>

      <DataTable
        rows={keysQuery.data ?? []}
        rowKey={(key) => key.id}
        rowLabel={(key) => key.name}
        caption={t(`${KEYS}.title`)}
        isError={keysQuery.isError}
        isLoading={keysQuery.isLoading}
        isFetching={keysQuery.isFetching}
        onRetry={() => void keysQuery.refetch()}
        empty={{ icon: L.KeyRound, title: t(`${KEYS}.empty`) }}
        columns={[
          {
            id: "name",
            mobile: "title",
            header: t(`${KEYS}.table.name`),
            cell: (key) => <span className="font-medium">{key.name}</span>,
          },
          {
            id: "status",
            mobile: "badge",
            header: t(`${KEYS}.table.status`),
            cell: (key) => (
              <Badge variant={key.revokedAt ? "destructive" : "default"}>
                {t(
                  key.revokedAt ? `${KEYS}.revokedBadge` : `${KEYS}.liveBadge`,
                )}
              </Badge>
            ),
          },
          {
            id: "prefix",
            header: t(`${KEYS}.table.prefix`),
            cell: (key) => <code className="text-xs">{key.prefix}</code>,
          },
          {
            id: "lastUsed",
            header: t(`${KEYS}.table.lastUsed`),
            cell: (key) =>
              key.lastUsedAt
                ? formatDate(key.lastUsedAt)
                : t(`${KEYS}.neverUsed`),
          },
        ]}
        rowActions={(key) =>
          key.revokedAt
            ? []
            : [
                {
                  id: "revoke",
                  tone: "danger",
                  icon: L.KeyRound,
                  label: t(`${KEYS}.revoke`),
                  onSelect: () => openRevokeConfirm(key.id, key.prefix),
                },
              ]
        }
      />
    </GlassCard>
  );
};

const BatchesSection = ({ hook }: { hook: TUseAdminIngestionTab }) => {
  const {
    t,
    batchPage,
    batchesQuery,
    batchNextPage,
    openBatchDetail,
    batchPreviousPage,
  } = hook;

  return (
    <GlassCard>
      <h2 className="mb-5 text-lg font-medium">{t(`${BATCHES}.title`)}</h2>

      <DataTable
        rows={batchesQuery.data?.items ?? []}
        rowKey={(batch) => batch.id}
        caption={t(`${BATCHES}.title`)}
        isError={batchesQuery.isError}
        isLoading={batchesQuery.isLoading}
        isFetching={batchesQuery.isFetching}
        onRowClick={(batch) => openBatchDetail(batch.id)}
        onRetry={() => void batchesQuery.refetch()}
        empty={{ icon: L.PackageOpen, title: t(`${BATCHES}.empty`) }}
        pagination={{
          kind: "cursor",
          page: batchPage,
          onNext: batchNextPage,
          onPrevious: batchPreviousPage,
          total: batchesQuery.data?.totalCount ?? 0,
          hasNextPage: batchesQuery.data?.pageInfo?.hasNextPage ?? false,
        }}
        columns={[
          {
            id: "submitted",
            mobile: "title",
            header: t(`${BATCHES}.table.submitted`),
            cell: (batch) => (
              <span className="font-medium">{formatDate(batch.createdAt)}</span>
            ),
          },
          {
            id: "status",
            mobile: "badge",
            header: t(`${BATCHES}.table.status`),
            cell: (batch) => <Badge variant="secondary">{batch.status}</Badge>,
          },
          {
            id: "mode",
            header: t(`${BATCHES}.table.mode`),
            cell: (batch) => batch.mode,
          },
          {
            id: "received",
            align: "end",
            header: t(`${BATCHES}.table.received`),
            cell: (batch) => batch.receivedCount,
          },
          {
            id: "created",
            align: "end",
            header: t(`${BATCHES}.table.created`),
            cell: (batch) => batch.createdCount,
          },
          {
            id: "updated",
            align: "end",
            header: t(`${BATCHES}.table.updated`),
            cell: (batch) => batch.updatedCount,
          },
          {
            id: "rejected",
            align: "end",
            header: t(`${BATCHES}.table.rejected`),
            cell: (batch) => batch.rejectedCount,
          },
        ]}
        rowActions={(batch) => [
          {
            id: "report",
            icon: L.FileText,
            label: t(`${BATCHES}.viewReport`),
            onSelect: () => openBatchDetail(batch.id),
          },
        ]}
      />
    </GlassCard>
  );
};
