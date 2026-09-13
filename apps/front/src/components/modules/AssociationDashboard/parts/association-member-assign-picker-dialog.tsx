"use client";

import { TAssociationMemberAssignPickerDialog } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";

export const AssociationMemberAssignPickerDialog = ({
  hook,
}: TAssociationMemberAssignPickerDialog) => {
  const {
    t,
    assignMemberId,
    setAssignMemberId,
    closeAssignPicker,
    assignPickerSearch,
    isAssignPickerOpen,
    assignPickerOptions,
    confirmAssignPicker,
    setAssignPickerSearch,
    isAssignPickerLoading,
  } = hook;

  const selectedIds = assignMemberId ? [assignMemberId] : [];

  return (
    <D.Dialog
      open={isAssignPickerOpen}
      onOpenChange={(open) => (open ? undefined : closeAssignPicker())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.members.assignPicker.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.members.assignPicker.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <AssociationRequirementMemberPicker
          selectedIds={selectedIds}
          search={assignPickerSearch}
          options={assignPickerOptions}
          onSearch={setAssignPickerSearch}
          isLoading={isAssignPickerLoading}
          label={t("associationDashboard.members.assignPicker.selectLabel")}
          emptyText={t("associationDashboard.members.assignPicker.empty")}
          countLabel={t("associationDashboard.members.assignPicker.results", {
            count: assignPickerOptions.length,
          })}
          placeholder={t(
            "associationDashboard.members.assignPicker.placeholder",
          )}
          onChange={(ids) => {
            const added = ids.find((id) => id !== assignMemberId);
            setAssignMemberId(added ?? null);
          }}
        />

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            onClick={closeAssignPicker}
          >
            {t("associationDashboard.members.assignPicker.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            disabled={!assignMemberId}
            onClick={confirmAssignPicker}
          >
            {t("associationDashboard.members.assignPicker.continue")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
