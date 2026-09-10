"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { Badge } from "@ui/badge";

import * as D from "@ui/dialog";
import * as L from "lucide-react";

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
      <D.DialogContent className="glass-dialog z-[9999] max-h-[85vh] max-w-3xl overflow-y-auto rounded-lg border-border">
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

            <div className="max-h-96 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left">
                  <tr>
                    <th className="p-3">
                      {t("adminDashboard.ingestion.batches.detailDialog.externalId")}
                    </th>
                    <th className="p-3">
                      {t("adminDashboard.ingestion.batches.table.status")}
                    </th>
                    <th className="p-3">
                      {t("adminDashboard.ingestion.batches.detailDialog.reason")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batch.items.map((item, index) => (
                    <tr
                      key={`${item.externalId ?? "unknown"}-${index}`}
                      className="border-b border-border/70"
                    >
                      <td className="p-3">
                        <code className="text-xs">
                          {item.externalId ?? "—"}
                        </code>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="rounded-full">
                          {item.state}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {item.reason ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
