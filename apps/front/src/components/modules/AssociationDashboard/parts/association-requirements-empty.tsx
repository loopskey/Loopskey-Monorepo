"use client";

import { TAssociationRequirementsEmpty } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationRequirementsEmpty = ({
  hook,
}: TAssociationRequirementsEmpty) => {
  const { t, isFiltered, hasNoRequirements, startWizard, resetFilters } = hook;

  if (isFiltered && !hasNoRequirements) {
    return (
      <div className="py-12 text-center">
        <L.SearchX className="mx-auto h-8 w-8 text-muted-foreground" />

        <p className="mt-4 font-medium">
          {t("associationDashboard.requirements.empty.noResultsTitle")}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.requirements.empty.noResultsBody")}
        </p>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="mt-5"
          onClick={resetFilters}
        >
          <L.X className="h-4 w-4" />
          {t("associationDashboard.requirements.filters.clear")}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <L.ListChecks className="mx-auto h-8 w-8 text-muted-foreground" />

      <p className="mt-4 font-medium">
        {t("associationDashboard.requirements.empty.firstRunTitle")}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {t("associationDashboard.requirements.empty.firstRunBody")}
      </p>

      <Button
        radius="xl"
        type="button"
        variant="brand"
        className="mt-5"
        onClick={startWizard}
      >
        <L.Plus className="h-4 w-4" />
        {t("associationDashboard.requirements.empty.createFirst")}
      </Button>
    </div>
  );
};
