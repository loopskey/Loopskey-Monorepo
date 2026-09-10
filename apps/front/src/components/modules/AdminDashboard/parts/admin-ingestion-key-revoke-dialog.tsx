"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { Button } from "@ui/button";

import * as A from "@ui/alert-dialog";

export const AdminIngestionKeyRevokeDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const { t, revokeTarget, closeRevokeConfirm, confirmRevoke, isRevoking } =
    hook;

  return (
    <A.AlertDialog
      open={revokeTarget !== null}
      onOpenChange={(open) => {
        if (!open) closeRevokeConfirm();
      }}
    >
      <A.AlertDialogContent className="glass-dialog rounded-lg border-border">
        <A.AlertDialogHeader>
          <A.AlertDialogTitle>
            {t("adminDashboard.ingestion.keys.revokeDialog.title")}
          </A.AlertDialogTitle>
          <A.AlertDialogDescription>
            {t("adminDashboard.ingestion.keys.revokeDialog.description", {
              prefix: revokeTarget?.prefix ?? "",
            })}
          </A.AlertDialogDescription>
        </A.AlertDialogHeader>

        <A.AlertDialogFooter>
          <A.AlertDialogCancel asChild>
            <Button
              radius="xl"
              variant="outline"
              disabled={isRevoking}
              onClick={closeRevokeConfirm}
            >
              {t("common.cancel")}
            </Button>
          </A.AlertDialogCancel>
          <A.AlertDialogAction asChild>
            <Button
              radius="xl"
              variant="destructive"
              disabled={isRevoking}
              onClick={confirmRevoke}
            >
              {t("adminDashboard.ingestion.keys.revokeDialog.confirm")}
            </Button>
          </A.AlertDialogAction>
        </A.AlertDialogFooter>
      </A.AlertDialogContent>
    </A.AlertDialog>
  );
};
