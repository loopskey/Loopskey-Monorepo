"use client";

import { TAssociationMemberEditDialog } from "@/types/association-dashboard.types";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationMemberEditDialog = ({
  hook,
}: TAssociationMemberEditDialog) => {
  const {
    t,
    openEdit,
    isEditOpen,
    submitEdit,
    setEditOpen,
    isMutating,
    detailsForm,
    groupOptions,
    canRenameMember,
  } = hook;

  return (
    <D.Dialog
      open={isEditOpen}
      onOpenChange={(open) => (open ? openEdit() : setEditOpen(false))}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.memberDetail.edit.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.memberDetail.edit.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <F.Form {...detailsForm}>
          <form className="space-y-4" onSubmit={submitEdit} noValidate>
            <FloatingInputField
              name="fullName"
              disabled={!canRenameMember}
              control={detailsForm.control}
              label={t("associationDashboard.members.invite.fullName")}
              description={
                canRenameMember
                  ? undefined
                  : t("associationDashboard.memberDetail.edit.nameLocked")
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInputField
                name="memberNumber"
                control={detailsForm.control}
                label={t("associationDashboard.members.invite.memberNumber")}
              />

              <FloatingSelectField
                name="groupId"
                options={groupOptions}
                control={detailsForm.control}
                label={t("associationDashboard.members.invite.group")}
                placeholder={t(
                  "associationDashboard.members.invite.groupPlaceholder",
                )}
              />
            </div>

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="cancel"
                disabled={isMutating}
                onClick={() => setEditOpen(false)}
              >
                {t("associationDashboard.members.confirm.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isMutating}
              >
                {isMutating && <L.Loader2 className="h-4 w-4 animate-spin" />}
                {t("associationDashboard.memberDetail.edit.save")}
              </Button>
            </D.DialogFooter>
          </form>
        </F.Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
