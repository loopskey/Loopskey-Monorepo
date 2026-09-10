"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { Textarea } from "@ui/textarea";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";

export const AdminIngestionRejectDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const {
    t,
    rejectTargetId,
    closeReject,
    rejectForm,
    submitReject,
    isRejecting,
  } = hook;

  return (
    <D.Dialog
      open={rejectTargetId !== null}
      onOpenChange={(open) => !open && closeReject()}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("adminDashboard.ingestion.review.rejectDialog.title")}
          </D.DialogTitle>
          <D.DialogDescription className="leading-6">
            {t("adminDashboard.ingestion.review.rejectDialog.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <F.Form {...rejectForm}>
          <form className="space-y-4" onSubmit={submitReject} noValidate>
            <F.FormField
              control={rejectForm.control}
              name="reason"
              render={({ field }) => (
                <F.FormItem>
                  <F.FormLabel>
                    {t(
                      "adminDashboard.ingestion.review.rejectDialog.reason",
                    )}
                  </F.FormLabel>
                  <F.FormControl>
                    <Textarea
                      {...field}
                      maxLength={1000}
                      className="min-h-32 rounded-md"
                    />
                  </F.FormControl>
                  <F.FormMessage />
                </F.FormItem>
              )}
            />

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="outline"
                disabled={isRejecting}
                onClick={closeReject}
              >
                {t("common.cancel")}
              </Button>
              <Button
                radius="xl"
                type="submit"
                variant="destructive"
                disabled={isRejecting}
              >
                {t("adminDashboard.ingestion.review.rejectDialog.confirm")}
              </Button>
            </D.DialogFooter>
          </form>
        </F.Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
