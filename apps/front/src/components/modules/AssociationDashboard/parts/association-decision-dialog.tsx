"use client";

import { TAssociationDecisionDialog } from "@/types/association-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationDecisionDialog = ({
  hook,
}: TAssociationDecisionDialog) => {
  const {
    t,
    decision,
    isDeciding,
    closeDecision,
    rejectionForm,
    submitRejection,
    confirmApproval,
  } = hook;

  const isApproval = decision?.approve === true;

  return (
    <D.Dialog
      open={Boolean(decision)}
      onOpenChange={(open) => {
        if (!open) closeDecision();
      }}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t(
              isApproval
                ? "associationDashboard.memberDetail.decision.approveTitle"
                : "associationDashboard.memberDetail.decision.rejectTitle",
            )}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t(
              isApproval
                ? "associationDashboard.memberDetail.decision.approveBody"
                : "associationDashboard.memberDetail.decision.rejectBody",
            )}
          </D.DialogDescription>
        </D.DialogHeader>

        {isApproval ? (
          <D.DialogFooter>
            <Button
              radius="xl"
              type="button"
              variant="cancel"
              disabled={isDeciding}
              onClick={closeDecision}
            >
              {t("associationDashboard.members.confirm.cancel")}
            </Button>

            <Button
              radius="xl"
              type="button"
              variant="brand"
              disabled={isDeciding}
              onClick={() => void confirmApproval()}
            >
              {isDeciding && <L.Loader2 className="h-4 w-4 animate-spin" />}
              {t("associationDashboard.memberDetail.activities.approve")}
            </Button>
          </D.DialogFooter>
        ) : (
          <F.Form {...rejectionForm}>
            <form className="space-y-4" onSubmit={submitRejection} noValidate>
              <FloatingTextareaField
                name="reason"
                control={rejectionForm.control}
                label={t(
                  "associationDashboard.memberDetail.decision.reasonLabel",
                )}
              />

              <D.DialogFooter>
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  disabled={isDeciding}
                  onClick={closeDecision}
                >
                  {t("associationDashboard.members.confirm.cancel")}
                </Button>

                <Button
                  radius="xl"
                  type="submit"
                  variant="destructive"
                  disabled={isDeciding}
                >
                  {isDeciding && <L.Loader2 className="h-4 w-4 animate-spin" />}
                  {t("associationDashboard.memberDetail.activities.reject")}
                </Button>
              </D.DialogFooter>
            </form>
          </F.Form>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
