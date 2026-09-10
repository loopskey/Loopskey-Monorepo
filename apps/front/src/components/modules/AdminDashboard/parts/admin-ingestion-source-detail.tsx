"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { AdminIngestionKeyIssueDialog } from "@modules/AdminDashboard/parts/admin-ingestion-key-issue-dialog";
import { AdminIngestionKeyRevokeDialog } from "@modules/AdminDashboard/parts/admin-ingestion-key-revoke-dialog";
import { AdminIngestionBatchDetailDialog } from "@modules/AdminDashboard/parts/admin-ingestion-batch-detail-dialog";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { Td, Th } from "@modules/AdminDashboard/parts/td-and-th-table";
import { formatDate } from "@/utils/function-helper";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";
import * as L from "lucide-react";

const KEY_COLUMN_COUNT = 5;
const BATCH_COLUMN_COUNT = 8;

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
  const keys = keysQuery.data ?? [];

  return (
    <GlassCard className="p-0">
      <div className="flex items-center justify-between p-6 pb-0">
        <h2 className="text-lg font-medium">
          {t("adminDashboard.ingestion.keys.title")}
        </h2>
        <Button radius="xl" type="button" onClick={openIssue}>
          <L.KeyRound className="h-4 w-4" />
          {t("adminDashboard.ingestion.keys.issue")}
        </Button>
      </div>

      {keysQuery.isLoading ? (
        <div className="p-6">
          <DashboardContentSkeleton />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>{t("adminDashboard.ingestion.keys.table.prefix")}</Th>
                <Th>{t("adminDashboard.ingestion.keys.table.name")}</Th>
                <Th>{t("adminDashboard.ingestion.keys.table.lastUsed")}</Th>
                <Th>{t("adminDashboard.ingestion.keys.table.status")}</Th>
                <Th>{t("adminDashboard.ingestion.keys.table.actions")}</Th>
              </tr>
            </thead>
            <tbody>
              {keys.length ? (
                keys.map((key) => {
                  const isRevoked = Boolean(key.revokedAt);
                  return (
                    <tr key={key.id} className="border-b border-border/70">
                      <Td>
                        <code className="text-xs">{key.prefix}</code>
                      </Td>
                      <Td>{key.name}</Td>
                      <Td>
                        {key.lastUsedAt
                          ? formatDate(key.lastUsedAt)
                          : t("adminDashboard.ingestion.keys.neverUsed")}
                      </Td>
                      <Td>
                        <Badge
                          variant={isRevoked ? "destructive" : "default"}
                          className="rounded-full"
                        >
                          {t(
                            isRevoked
                              ? "adminDashboard.ingestion.keys.revokedBadge"
                              : "adminDashboard.ingestion.keys.liveBadge",
                          )}
                        </Badge>
                      </Td>
                      <Td>
                        {!isRevoked && (
                          <Button
                            radius="xl"
                            size="sm"
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              openRevokeConfirm(key.id, key.prefix)
                            }
                          >
                            {t("adminDashboard.ingestion.keys.revoke")}
                          </Button>
                        )}
                      </Td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={KEY_COLUMN_COUNT}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {t("adminDashboard.ingestion.keys.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
};

const BatchesSection = ({ hook }: { hook: TUseAdminIngestionTab }) => {
  const {
    t,
    batchesQuery,
    batchPage,
    batchNextPage,
    batchPreviousPage,
    batchCanPrevious,
    openBatchDetail,
  } = hook;
  const batches = batchesQuery.data?.items ?? [];

  return (
    <GlassCard className="p-0">
      <h2 className="p-6 pb-0 text-lg font-medium">
        {t("adminDashboard.ingestion.batches.title")}
      </h2>

      {batchesQuery.isLoading ? (
        <div className="p-6">
          <DashboardContentSkeleton />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <Th>{t("adminDashboard.ingestion.batches.table.submitted")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.mode")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.status")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.received")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.created")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.updated")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.rejected")}</Th>
                <Th>{t("adminDashboard.ingestion.batches.table.actions")}</Th>
              </tr>
            </thead>
            <tbody>
              {batches.length ? (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-border/70">
                    <Td>{formatDate(batch.createdAt)}</Td>
                    <Td>{batch.mode}</Td>
                    <Td>
                      <Badge variant="secondary" className="rounded-full">
                        {batch.status}
                      </Badge>
                    </Td>
                    <Td>{batch.receivedCount}</Td>
                    <Td>{batch.createdCount}</Td>
                    <Td>{batch.updatedCount}</Td>
                    <Td>{batch.rejectedCount}</Td>
                    <Td>
                      <Button
                        radius="xl"
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => openBatchDetail(batch.id)}
                      >
                        {t("adminDashboard.ingestion.batches.viewReport")}
                      </Button>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={BATCH_COLUMN_COUNT}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {t("adminDashboard.ingestion.batches.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!batchesQuery.isError && !batchesQuery.isLoading && batches.length > 0 && (
        <div className="p-6 pt-0">
          <ContentPagination
            page={batchPage}
            onNext={batchNextPage}
            isLoading={batchesQuery.isFetching}
            totalCount={batchesQuery.data?.totalCount ?? 0}
            onPrevious={batchPreviousPage}
            canPrevious={batchCanPrevious}
            hasNextPage={batchesQuery.data?.pageInfo?.hasNextPage ?? false}
          />
        </div>
      )}
    </GlassCard>
  );
};
