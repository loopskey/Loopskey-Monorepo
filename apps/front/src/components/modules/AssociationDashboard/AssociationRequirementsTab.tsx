"use client";

import { AssociationRequirementAssignDialog } from "@modules/AssociationDashboard/parts/association-requirement-assign-dialog";
import { AssociationRequirementsFilters } from "@modules/AssociationDashboard/parts/association-requirements-filters";
import { AssociationRequirementsHeader } from "@modules/AssociationDashboard/parts/association-requirements-header";
import { AssociationRequirementsEmpty } from "@modules/AssociationDashboard/parts/association-requirements-empty";
import { AssociationRequirementsStats } from "@modules/AssociationDashboard/parts/association-requirements-stats";
import { AssociationRequirementsTable } from "@modules/AssociationDashboard/parts/association-requirements-table";
import { AssociationRequirementWizard } from "@modules/AssociationDashboard/parts/association-requirement-wizard";
import { AssociationRequirementDetail } from "@modules/AssociationDashboard/parts/association-requirement-detail";
import { useAssociationRequirementsTab } from "@hooks/useAssociationRequirementsTab";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AssociationRequirementsTab = () => {
  const hook = useAssociationRequirementsTab();

  const {
    t,
    isError,
    isWizard,
    isDetail,
    isLoading,
    requirements,
    hasNoRequirements,
  } = hook;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AssociationRequirementsHeader hook={hook} />
        <DashboardContentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssociationRequirementsHeader hook={hook} />

      {isError ? (
        <GlassCard glow={false}>
          <div className="relative z-10 py-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-medium">
              {t("associationDashboard.requirements.error.title")}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.requirements.error.body")}
            </p>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              className="mt-5"
              onClick={hook.retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("associationDashboard.requirements.error.retry")}
            </Button>
          </div>
        </GlassCard>
      ) : isWizard ? (
        <AssociationRequirementWizard hook={hook} />
      ) : isDetail ? (
        <AssociationRequirementDetail hook={hook} />
      ) : (
        <>
          <AssociationRequirementsStats hook={hook} />

          <GlassCard>
            <div className="relative z-10">
              <AssociationRequirementsFilters hook={hook} />

              {requirements.length === 0 || hasNoRequirements ? (
                <AssociationRequirementsEmpty hook={hook} />
              ) : (
                <>
                  <AssociationRequirementsTable hook={hook} />

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
        </>
      )}

      <AssociationRequirementAssignDialog hook={hook} />
    </div>
  );
};

export default AssociationRequirementsTab;
