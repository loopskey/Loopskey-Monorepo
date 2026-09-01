"use client";

import { AssociationRosterCompositionCard } from "@modules/AssociationDashboard/parts/association-roster-composition-card";
import { AssociationMemberInviteDialog } from "@modules/AssociationDashboard/parts/association-member-invite-dialog";
import { AssociationMembersBulkCard } from "@modules/AssociationDashboard/parts/association-members-bulk-card";
import { AssociationMembersFilters } from "@modules/AssociationDashboard/parts/association-members-filters";
import { AssociationGroupsManager } from "@modules/AssociationDashboard/parts/association-groups-manager";
import { AssociationMembersHeader } from "@modules/AssociationDashboard/parts/association-members-header";
import { useAssociationMembersTab } from "@hooks/useAssociationMembersTab";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { AssociationMembersEmpty } from "@modules/AssociationDashboard/parts/association-members-empty";
import { AssociationMembersStats } from "@modules/AssociationDashboard/parts/association-members-stats";
import { AssociationMembersTable } from "@modules/AssociationDashboard/parts/association-members-table";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AssociationMembersTab = () => {
  const hook = useAssociationMembersTab();

  const { t, view, members, isError, isLoading, hasNoMembers } = hook;

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
              variant="glass"
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
          <AssociationRosterCompositionCard hook={hook} />
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <AssociationMembersBulkCard hook={hook} />
            <GlassCard>
              <div className="relative z-10">
                <AssociationMembersFilters hook={hook} />
                {members.length === 0 || hasNoMembers ? (
                  <AssociationMembersEmpty hook={hook} />
                ) : (
                  <>
                    <AssociationMembersTable hook={hook} />
                    <ContentPagination
                      className="mt-6"
                      page={hook.page}
                      onNext={hook.nextPage}
                      totalCount={hook.totalCount}
                      isLoading={hook.isRefetching}
                      onPrevious={hook.previousPage}
                      canPrevious={hook.canPrevious}
                      hasNextPage={hook.hasNextPage}
                    />
                  </>
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}
      <AssociationMemberInviteDialog hook={hook} />
    </div>
  );
};

export default AssociationMembersTab;
