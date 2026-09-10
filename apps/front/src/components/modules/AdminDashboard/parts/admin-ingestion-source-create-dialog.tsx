"use client";

import { TUseAdminIngestionTab } from "@hooks/useAdminIngestionTab";
import { FloatingInputField } from "@elements/floating-input";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";

export const AdminIngestionSourceCreateDialog = ({
  hook,
}: {
  hook: TUseAdminIngestionTab;
}) => {
  const { t, isCreateOpen, closeCreate, createForm, submitCreate, isCreating } =
    hook;

  return (
    <D.Dialog
      open={isCreateOpen}
      onOpenChange={(open) => !open && closeCreate()}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-h-[85vh] max-w-xl overflow-y-auto rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("adminDashboard.ingestion.sources.create.title")}
          </D.DialogTitle>
          <D.DialogDescription className="leading-6">
            {t("adminDashboard.ingestion.sources.create.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <F.Form {...createForm}>
          <form className="space-y-4" onSubmit={submitCreate} noValidate>
            <FloatingInputField
              name="slug"
              control={createForm.control}
              label={t("adminDashboard.ingestion.sources.create.slug")}
              description={t(
                "adminDashboard.ingestion.sources.create.slugHint",
              )}
            />

            <FloatingInputField
              name="name"
              control={createForm.control}
              label={t("adminDashboard.ingestion.sources.create.name")}
            />

            <F.FormField
              control={createForm.control}
              name="kind"
              render={({ field }) => (
                <F.FormItem>
                  <F.FormLabel>
                    {t("adminDashboard.ingestion.sources.create.kind")}
                  </F.FormLabel>
                  <F.FormControl>
                    <select
                      {...field}
                      className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm"
                    >
                      <option value="COURSE">COURSE</option>
                      <option value="EVENT">EVENT</option>
                      <option value="PODCAST">PODCAST</option>
                      <option value="YOUTUBE">YOUTUBE</option>
                    </select>
                  </F.FormControl>
                  <F.FormMessage />
                </F.FormItem>
              )}
            />

            <FloatingInputField
              type="number"
              name="stalenessWindowDays"
              control={createForm.control}
              label={t(
                "adminDashboard.ingestion.sources.create.stalenessWindowDays",
              )}
            />

            <F.FormField
              control={createForm.control}
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
              control={createForm.control}
              name="fieldMap"
              render={({ field }) => (
                <F.FormItem>
                  <F.FormLabel>
                    {t("adminDashboard.ingestion.sources.create.fieldMap")}
                  </F.FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "adminDashboard.ingestion.sources.create.fieldMapHint",
                    )}
                  </p>
                  <F.FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      className="rounded-md font-mono text-xs"
                      placeholder='{"source_title": "title"}'
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
                disabled={isCreating}
                onClick={closeCreate}
              >
                {t("common.cancel")}
              </Button>
              <Button radius="xl" type="submit" disabled={isCreating}>
                {t("adminDashboard.ingestion.sources.create.submit")}
              </Button>
            </D.DialogFooter>
          </form>
        </F.Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
