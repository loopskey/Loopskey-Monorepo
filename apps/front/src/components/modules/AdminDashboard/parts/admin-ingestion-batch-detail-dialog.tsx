"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { DataTable } from "@elements/data-table/data-table";
import { Badge } from "@ui/badge";

import * as D from "@ui/dialog";
import * as L from "lucide-react";

const BATCHES = "adminDashboard.ingestion.batches";

export const AdminIngestionBatchDetailDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const { t, selectedBatchId, closeBatchDetail, batchDetailQuery } = hook;
  const batch = batchDetailQuery.data;

  return (
    <D.Dialog
      open={selectedBatchId !== null}
      onOpenChange={(open) => !open && closeBatchDetail()}
    >
      <D.DialogContent className="glass-dialog max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("adminDashboard.ingestion.batches.detailDialog.title")}
          </D.DialogTitle>
        </D.DialogHeader>

        {batchDetailQuery.isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <L.Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : batchDetailQuery.isError || !batch ? (
          <p className="text-destructive">
            {t("adminDashboard.ingestion.batches.error")}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label={t("adminDashboard.ingestion.batches.table.received")} value={batch.receivedCount} />
              <Stat label={t("adminDashboard.ingestion.batches.table.created")} value={batch.createdCount} />
              <Stat label={t("adminDashboard.ingestion.batches.table.updated")} value={batch.updatedCount} />
              <Stat label={t("adminDashboard.ingestion.batches.detailDialog.unchanged")} value={batch.unchangedCount} />
              <Stat label={t("adminDashboard.ingestion.batches.table.rejected")} value={batch.rejectedCount} />
            </div>

            <DataTable
              scrollClassName="max-h-96 overflow-y-auto"
              rowKey={(item) => item.key}
              caption={t(`${BATCHES}.detailDialog.title`)}
              empty={{ icon: L.PackageOpen, title: t(`${BATCHES}.empty`) }}
              rows={batch.items.map((item, index) => ({
                ...item,
                key: `${item.externalId ?? "unknown"}-${index}`,
              }))}
              columns={[
                {
                  id: "externalId",
                  mobile: "title",
                  header: t(`${BATCHES}.detailDialog.externalId`),
                  cell: (item) => (
                    <code className="text-xs">{item.externalId ?? "—"}</code>
                  ),
                },
                {
                  id: "status",
                  mobile: "badge",
                  header: t(`${BATCHES}.table.status`),
                  cell: (item) => (
                    <Badge variant="secondary">{item.state}</Badge>
                  ),
                },
                {
                  id: "reason",
                  mobile: "wide",
                  className: "whitespace-normal text-muted-foreground",
                  header: t(`${BATCHES}.detailDialog.reason`),
                  cell: (item) => item.reason ?? "—",
                },
              ]}
            />
          </div>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md bg-muted p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-medium">{value}</p>
  </div>
);
