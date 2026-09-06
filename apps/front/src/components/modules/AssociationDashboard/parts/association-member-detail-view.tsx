"use client";

import { AssociationMemberCertificatesSection } from "@modules/AssociationDashboard/parts/association-member-certificates-section";
import { AssociationMemberRequirementsSection } from "@modules/AssociationDashboard/parts/association-member-requirements-section";
import { AssociationMemberRequirementsDialog } from "@modules/AssociationDashboard/parts/association-member-requirements-dialog";
import { AssociationMemberActivitiesSection } from "@modules/AssociationDashboard/parts/association-member-activities-section";
import { AssociationMemberProgressCard } from "@modules/AssociationDashboard/parts/association-member-progress-card";
import { AssociationMemberDetailHeader } from "@modules/AssociationDashboard/parts/association-member-detail-header";
import { AssociationMemberDetailCards } from "@modules/AssociationDashboard/parts/association-member-detail-cards";
import { AssociationMemberEditDialog } from "@modules/AssociationDashboard/parts/association-member-edit-dialog";
import { useAssociationMemberDetail } from "@hooks/useAssociationMemberDetail";
import { AssociationDecisionDialog } from "@modules/AssociationDashboard/parts/association-decision-dialog";
import { AssociationEvidenceViewer } from "@modules/AssociationDashboard/parts/association-evidence-viewer";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as L from "lucide-react";

type TAssociationMemberDetailViewProps = { memberId: string };

export const AssociationMemberDetailView = ({
  memberId,
}: TAssociationMemberDetailViewProps) => {
  const hook = useAssociationMemberDetail(memberId);

  const { t, isError, isLoading } = hook;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
        <DashboardContentSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <GlassCard glow={false}>
        <div className="relative z-10 py-8 text-center">
          <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

          <p className="mt-4 font-medium">
            {t("associationDashboard.memberDetail.error.title")}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("associationDashboard.memberDetail.error.body")}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={hook.retry}
            >
              <L.RotateCcw className="h-4 w-4" />
              {t("associationDashboard.members.error.retry")}
            </Button>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={hook.backToRoster}
            >
              <L.ArrowLeft className="h-4 w-4" />
              {t("associationDashboard.memberDetail.backToRoster")}
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <AssociationMemberDetailHeader hook={hook} />
      <AssociationMemberDetailCards hook={hook} />
      <AssociationMemberProgressCard hook={hook} />
      <AssociationMemberRequirementsSection hook={hook} />
      <AssociationMemberActivitiesSection hook={hook} />
      <AssociationMemberCertificatesSection hook={hook} />

      <AssociationEvidenceViewer hook={hook} />
      <AssociationDecisionDialog hook={hook} />
      <AssociationMemberEditDialog hook={hook} />
      <AssociationMemberRequirementsDialog hook={hook} />
    </div>
  );
};

export default AssociationMemberDetailView;
