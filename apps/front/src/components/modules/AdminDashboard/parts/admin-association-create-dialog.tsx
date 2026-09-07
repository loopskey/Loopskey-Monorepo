"use client";

import { TAdminAssociationCreateDialog } from "@/types/admin-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AdminAssociationCreateDialog = ({
  hook,
}: TAdminAssociationCreateDialog) => {
  const {
    t,
    createForm,
    isCreating,
    openCreate,
    createdName,
    closeCreate,
    emailQueued,
    isCreateOpen,
    submitCreate,
  } = hook;

  return (
    <D.Dialog
      open={isCreateOpen}
      onOpenChange={(open) => (open ? openCreate() : closeCreate())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("adminDashboard.associations.create.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("adminDashboard.associations.create.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {createdName ? (
          <div className="space-y-4">
            <div
              role="status"
              className="flex items-start gap-3 rounded-3xl border border-primary/25 bg-primary/5 p-4"
            >
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                {emailQueued ? (
                  <L.MailCheck className="h-5 w-5" />
                ) : (
                  <L.MailWarning className="h-5 w-5" />
                )}
              </div>

              <div>
                <p className="font-medium">
                  {t(
                    emailQueued
                      ? "adminDashboard.associations.create.sentTitle"
                      : "adminDashboard.associations.create.notSentTitle",
                  )}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    emailQueued
                      ? "adminDashboard.associations.create.sentBody"
                      : "adminDashboard.associations.create.notSentBody",
                    { name: createdName },
                  )}
                </p>
              </div>
            </div>

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={openCreate}
              >
                {t("adminDashboard.associations.create.createAnother")}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="brand"
                onClick={closeCreate}
              >
                {t("adminDashboard.associations.create.done")}
              </Button>
            </D.DialogFooter>
          </div>
        ) : (
          <F.Form {...createForm}>
            <form className="space-y-4" onSubmit={submitCreate} noValidate>
              <FloatingInputField
                name="name"
                control={createForm.control}
                label={t("adminDashboard.associations.create.name")}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingInputField
                  name="representativeFullName"
                  control={createForm.control}
                  label={t(
                    "adminDashboard.associations.create.representativeFullName",
                  )}
                />

                <FloatingInputField
                  name="workEmail"
                  type="email"
                  control={createForm.control}
                  label={t("adminDashboard.associations.create.workEmail")}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingInputField
                  name="country"
                  control={createForm.control}
                  label={t("adminDashboard.associations.create.country")}
                />

                <FloatingInputField
                  name="website"
                  control={createForm.control}
                  label={t("adminDashboard.associations.create.website")}
                />
              </div>

              <FloatingInputField
                name="logoUrl"
                control={createForm.control}
                label={t("adminDashboard.associations.create.logoUrl")}
              />

              <FloatingTextareaField
                name="description"
                control={createForm.control}
                label={t("adminDashboard.associations.create.descriptionField")}
              />

              <p className="text-xs text-muted-foreground">
                {t("adminDashboard.associations.create.activationNote")}
              </p>

              <D.DialogFooter>
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  onClick={closeCreate}
                  disabled={isCreating}
                >
                  {t("common.cancel")}
                </Button>

                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isCreating}
                >
                  {isCreating && <L.Loader2 className="h-4 w-4 animate-spin" />}
                  {t("adminDashboard.associations.create.submit")}
                </Button>
              </D.DialogFooter>
            </form>
          </F.Form>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
