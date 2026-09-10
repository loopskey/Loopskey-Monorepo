"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { FloatingInputField } from "@elements/floating-input";
import { notify } from "@hooks/notify";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AdminIngestionKeyIssueDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    isIssueOpen,
    closeIssue,
    issueForm,
    submitIssue,
    isIssuing,
    issuedCredential,
  } = hook;

  const copyCredential = async () => {
    if (!issuedCredential) return;
    try {
      await navigator.clipboard.writeText(issuedCredential);
      notify.success(t("adminDashboard.ingestion.keys.copied"));
    } catch {
      notify.error(t("adminDashboard.ingestion.keys.copyFailed"));
    }
  };

  return (
    <D.Dialog
      open={isIssueOpen}
      onOpenChange={(open) => !open && !issuedCredential && closeIssue()}
    >
      <D.DialogContent
        className="glass-dialog z-[9999] max-w-lg rounded-lg border-border"
        onInteractOutside={(event) => {
          if (issuedCredential) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (issuedCredential) event.preventDefault();
        }}
      >
        {issuedCredential ? (
          <span className="sr-only" role="status">
            {t("adminDashboard.ingestion.keys.issueDialog.mustConfirm")}
          </span>
        ) : null}
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("adminDashboard.ingestion.keys.issueDialog.title")}
          </D.DialogTitle>
          <D.DialogDescription className="leading-6">
            {t("adminDashboard.ingestion.keys.issueDialog.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {issuedCredential ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4"
            >
              <L.AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-soft-foreground" />
              <p className="text-sm text-warning-soft-foreground">
                {t("adminDashboard.ingestion.keys.issueDialog.warning")}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
              <code className="flex-1 overflow-x-auto text-xs">
                {issuedCredential}
              </code>
              <Button
                radius="xl"
                size="iconSm"
                type="button"
                variant="outline"
                onClick={copyCredential}
                aria-label={t("adminDashboard.ingestion.keys.copy")}
              >
                <L.Copy className="h-4 w-4" />
              </Button>
            </div>

            <D.DialogFooter>
              <Button radius="xl" type="button" onClick={closeIssue}>
                {t("adminDashboard.ingestion.keys.issueDialog.done")}
              </Button>
            </D.DialogFooter>
          </div>
        ) : (
          <F.Form {...issueForm}>
            <form className="space-y-4" onSubmit={submitIssue} noValidate>
              <FloatingInputField
                name="name"
                control={issueForm.control}
                label={t("adminDashboard.ingestion.keys.issueDialog.name")}
              />

              <FloatingInputField
                type="datetime-local"
                name="expiresAt"
                control={issueForm.control}
                label={t(
                  "adminDashboard.ingestion.keys.issueDialog.expiresAt",
                )}
              />

              <D.DialogFooter>
                <Button
                  radius="xl"
                  type="button"
                  variant="outline"
                  disabled={isIssuing}
                  onClick={closeIssue}
                >
                  {t("common.cancel")}
                </Button>
                <Button radius="xl" type="submit" disabled={isIssuing}>
                  {t("adminDashboard.ingestion.keys.issueDialog.submit")}
                </Button>
              </D.DialogFooter>
            </form>
          </F.Form>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
