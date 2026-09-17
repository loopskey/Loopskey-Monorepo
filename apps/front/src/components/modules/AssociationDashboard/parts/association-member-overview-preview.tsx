"use client";

import { TAssociationMemberOverviewPreview } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

export const AssociationMemberOverviewPreview = ({
  hook,
}: TAssociationMemberOverviewPreview) => {
  const { t, activities, certificates, isMissingEvidence, setActiveTab } =
    hook;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <GlassCard>
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <L.NotebookPen className="h-4 w-4" />
            <p className="text-sm font-medium">
              {t("associationDashboard.memberDetail.overview.activitiesTitle")}
            </p>
          </div>

          <p className="mt-3 text-2xl font-medium">{activities.length}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {activities.length > 0
              ? t("associationDashboard.memberDetail.overview.activitiesCount", {
                  count: activities.length,
                })
              : t("associationDashboard.memberDetail.overview.activitiesEmpty")}
          </p>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="outline"
            className="mt-4 self-start"
            onClick={() => setActiveTab("activities")}
          >
            {t("associationDashboard.memberDetail.overview.viewAll")}
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <L.Award className="h-4 w-4" />
            <p className="text-sm font-medium">
              {t(
                "associationDashboard.memberDetail.overview.certificatesTitle",
              )}
            </p>
          </div>

          <p className="mt-3 text-2xl font-medium">{certificates.length}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {certificates.length > 0
              ? t(
                  "associationDashboard.memberDetail.overview.certificatesCount",
                  { count: certificates.length },
                )
              : t(
                  "associationDashboard.memberDetail.overview.certificatesEmpty",
                )}
          </p>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="outline"
            className="mt-4 self-start"
            onClick={() => setActiveTab("certificates")}
          >
            {t("associationDashboard.memberDetail.overview.viewAll")}
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <L.ShieldAlert className="h-4 w-4" />
            <p className="text-sm font-medium">
              {t(
                "associationDashboard.memberDetail.overview.missingEvidenceTitle",
              )}
            </p>
          </div>

          <div className="mt-3">
            <Badge variant={isMissingEvidence ? "orange" : "default"}>
              {t(
                isMissingEvidence
                  ? "associationDashboard.memberDetail.overview.missingEvidenceBad"
                  : "associationDashboard.memberDetail.overview.missingEvidenceOk",
              )}
            </Badge>
          </div>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="outline"
            className="mt-4 self-start"
            onClick={() => setActiveTab("activities")}
          >
            {t("associationDashboard.memberDetail.overview.viewAll")}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};
