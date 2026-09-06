"use client";

import { AssociationLearningPublishDialog } from "@modules/AssociationDashboard/parts/association-learning-publish-dialog";
import { useAssociationLearningContent } from "@hooks/useAssociationLearningContent";
import { AssociationLearningFilters } from "@modules/AssociationDashboard/parts/association-learning-filters";
import { AssociationLearningEditor } from "@modules/AssociationDashboard/parts/association-learning-editor";
import { AssociationLearningDetail } from "@modules/AssociationDashboard/parts/association-learning-detail";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { AssociationLearningList } from "@modules/AssociationDashboard/parts/association-learning-list";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const AssociationLearningContentTab = () => {
  const hook = useAssociationLearningContent();

  const { t, isError, isLoading, openCreate } = hook;

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-medium">
          {t("associationDashboard.learningContent.title")}
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("associationDashboard.learningContent.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          radius="xl"
          type="button"
          variant="brand"
          onClick={() => openCreate(false)}
        >
          <L.LibraryBig className="h-4 w-4" />
          {t("associationDashboard.learningContent.actions.addCatalogue")}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={() => openCreate(true)}
        >
          <L.Link className="h-4 w-4" />
          {t("associationDashboard.learningContent.actions.addExternal")}
        </Button>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="space-y-6">
        {header}
        <DashboardContentSkeleton />
      </div>
    );

  return (
    <div className="space-y-6">
      {header}

      {isError ? (
        <GlassCard glow={false}>
          <div className="relative z-10 py-8 text-center">
            <L.TriangleAlert className="mx-auto h-8 w-8 text-destructive" />

            <p className="mt-4 font-medium">
              {t("associationDashboard.learningContent.error.title")}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.learningContent.error.body")}
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
      ) : (
        <GlassCard>
          <div className="relative z-10">
            <AssociationLearningFilters hook={hook} />
            <AssociationLearningList hook={hook} />
          </div>
        </GlassCard>
      )}

      <AssociationLearningEditor hook={hook} />
      <AssociationLearningPublishDialog hook={hook} />
      <AssociationLearningDetail hook={hook} />
    </div>
  );
};

export default AssociationLearningContentTab;
