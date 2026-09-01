"use client";

import { TAssociationMembersEmpty } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationMembersEmpty = ({ hook }: TAssociationMembersEmpty) => {
  const { t, isFiltered, hasNoMembers, openInvite, resetFilters } = hook;

  const focusImport = () =>
    document.getElementById("association-import-file")?.focus();

  if (isFiltered && !hasNoMembers) {
    return (
      <div className="py-12 text-center">
        <L.SearchX className="mx-auto h-8 w-8 text-muted-foreground" />

        <p className="mt-4 font-medium">
          {t("associationDashboard.members.empty.noResultsTitle")}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.members.empty.noResultsBody")}
        </p>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          className="mt-5"
          onClick={resetFilters}
        >
          <L.X className="h-4 w-4" />
          {t("associationDashboard.members.filters.clear")}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12 text-center">
      <L.Users className="mx-auto h-8 w-8 text-muted-foreground" />

      <p className="mt-4 font-medium">
        {t("associationDashboard.members.empty.firstRunTitle")}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {t("associationDashboard.members.empty.firstRunBody")}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button radius="xl" type="button" variant="brand" onClick={openInvite}>
          <L.UserPlus className="h-4 w-4" />
          {t("associationDashboard.members.empty.inviteOne")}
        </Button>

        <Button radius="xl" type="button" variant="glass" onClick={focusImport}>
          <L.FileSpreadsheet className="h-4 w-4" />
          {t("associationDashboard.members.empty.importMany")}
        </Button>
      </div>
    </div>
  );
};
