"use client";

import { AssociationMemberAssignPickerDialog } from "@modules/AssociationDashboard/parts/association-member-assign-picker-dialog";
import { AssociationMembersUploadDialog } from "@modules/AssociationDashboard/parts/association-members-upload-dialog";
import { AssociationMemberInviteDialog } from "@modules/AssociationDashboard/parts/association-member-invite-dialog";
import { AssociationGroupsManager } from "@modules/AssociationDashboard/parts/association-groups-manager";
import { AssociationMembersHeader } from "@modules/AssociationDashboard/parts/association-members-header";
import { useAssociationMembersTab } from "@hooks/useAssociationMembersTab";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { AssociationMembersStats } from "@modules/AssociationDashboard/parts/association-members-stats";
import { AssociationMembersTable } from "@modules/AssociationDashboard/parts/association-members-table";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AssociationMembersTab = () => {
  const hook = useAssociationMembersTab();

  const { t, view, isError, isLoading } = hook;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AssociationMembersHeader hook={hook} />
        <DashboardContentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssociationMembersHeader hook={hook} />

      {isError ? (
        <GlassCard glow={false}>
          <div className="relative z-10 py-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-medium">
              {t("associationDashboard.members.error.title")}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.members.error.body")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="outline"
              className="mt-5"
              onClick={hook.retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("associationDashboard.members.error.retry")}
            </Button>
          </div>
        </GlassCard>
      ) : view === "groups" ? (
        <AssociationGroupsManager hook={hook} />
      ) : (
        <>
          <AssociationMembersStats hook={hook} />
          <GlassCard>
            <div className="relative z-10">
              <AssociationMembersTable hook={hook} />
            </div>
          </GlassCard>
        </>
      )}
      <AssociationMemberInviteDialog hook={hook} />
      <AssociationMembersUploadDialog hook={hook} />
      <AssociationMemberAssignPickerDialog hook={hook} />
    </div>
  );
};

export default AssociationMembersTab;
