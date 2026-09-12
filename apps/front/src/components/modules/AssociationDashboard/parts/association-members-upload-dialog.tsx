"use client";

import { TAssociationMembersUploadDialog } from "@/types/association-dashboard.types";
import { AssociationMembersBulkCard } from "@modules/AssociationDashboard/parts/association-members-bulk-card";

import * as D from "@ui/dialog";

export const AssociationMembersUploadDialog = ({
  hook,
}: TAssociationMembersUploadDialog) => {
  const { t, isUploadOpen, closeUpload } = hook;

  return (
    <D.Dialog
      open={isUploadOpen}
      onOpenChange={(open) => (open ? undefined : closeUpload())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg border-border">
        <D.DialogTitle className="sr-only">
          {t("associationDashboard.members.bulk.title")}
        </D.DialogTitle>

        <D.DialogDescription className="sr-only">
          {t("associationDashboard.members.bulk.description")}
        </D.DialogDescription>

        <AssociationMembersBulkCard hook={hook} />
      </D.DialogContent>
    </D.Dialog>
  );
};
