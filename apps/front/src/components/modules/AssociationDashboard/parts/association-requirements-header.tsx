"use client";

import { TAssociationRequirementsHeader } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationRequirementsHeader = ({
  hook,
}: TAssociationRequirementsHeader) => {
  const { t, isWizard, isDetail, goTo, startWizard, isLoading } = hook;

  const titleKey = isWizard
    ? "associationDashboard.requirements.wizard.title"
    : isDetail
      ? "associationDashboard.requirements.detail.title"
      : "associationDashboard.requirements.title";

  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("associationDashboard.eyebrow")}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t(titleKey)}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("associationDashboard.requirements.description")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(isWizard || isDetail) && (
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={() => goTo(null)}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("associationDashboard.requirements.actions.backToList")}
          </Button>
        )}

        {!isWizard && (
          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isLoading}
            onClick={startWizard}
          >
            <L.Plus className="h-4 w-4" />
            {t("associationDashboard.requirements.actions.create")}
          </Button>
        )}
      </div>
    </section>
  );
};
