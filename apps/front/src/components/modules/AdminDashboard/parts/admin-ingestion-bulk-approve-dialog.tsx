"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";

import * as A from "@ui/alert-dialog";

export const AdminIngestionBulkApproveDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    bulkTarget,
    bulkProgress,
    bulkStopRequested,
    confirmBulkApprove,
    cancelBulkApprove,
  } = hook;

  const isRunning = bulkProgress !== null;
  const isSelection = bulkTarget?.kind === "selection";
  const count =
    bulkTarget?.kind === "selection"
      ? bulkTarget.itemIds.length
      : (bulkTarget?.total ?? 0);
  const percent =
    bulkProgress && bulkProgress.total > 0
      ? Math.min(
          100,
          Math.round((bulkProgress.approved / bulkProgress.total) * 100),
        )
      : 0;

  return (
    <A.AlertDialog
      open={bulkTarget !== null}
      onOpenChange={(open) => {
        if (!open && !isRunning) cancelBulkApprove();
      }}
    >
      <A.AlertDialogContent className="glass-dialog rounded-lg border-border">
        <A.AlertDialogHeader>
          <A.AlertDialogTitle>
            {t(
              isSelection
                ? "adminDashboard.ingestion.review.bulk.dialog.selectionTitle"
                : "adminDashboard.ingestion.review.bulk.dialog.queueTitle",
            )}
          </A.AlertDialogTitle>
          <A.AlertDialogDescription>
            {t(
              isSelection
                ? "adminDashboard.ingestion.review.bulk.dialog.selectionDescription"
                : "adminDashboard.ingestion.review.bulk.dialog.queueDescription",
              { count },
            )}
          </A.AlertDialogDescription>
        </A.AlertDialogHeader>

        {isRunning && (
          <div className="space-y-2" role="status" aria-live="polite">
            <Progress value={percent} />
            <p className="text-sm text-muted-foreground">
              {t("adminDashboard.ingestion.review.bulk.dialog.running", {
                approved: bulkProgress.approved,
                total: bulkProgress.total,
              })}
            </p>
          </div>
        )}

        <A.AlertDialogFooter>
          {isRunning ? (
            <Button
              radius="xl"
              type="button"
              variant="outline"
              disabled={bulkStopRequested}
              onClick={cancelBulkApprove}
            >
              {t(
                bulkStopRequested
                  ? "adminDashboard.ingestion.review.bulk.dialog.stopping"
                  : "adminDashboard.ingestion.review.bulk.dialog.stop",
              )}
            </Button>
          ) : (
            <>
              <Button
                radius="xl"
                type="button"
                variant="outline"
                onClick={cancelBulkApprove}
              >
                {t("common.cancel")}
              </Button>
              <Button radius="xl" type="button" onClick={confirmBulkApprove}>
                {t("adminDashboard.ingestion.review.bulk.dialog.confirm")}
              </Button>
            </>
          )}
        </A.AlertDialogFooter>
      </A.AlertDialogContent>
    </A.AlertDialog>
  );
};
