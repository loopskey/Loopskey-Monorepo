"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationMembersHeader = ({
  hook,
}: TAssociationMembersStats) => {
  const { t, view, setView, openInvite, isLoading } = hook;

  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("associationDashboard.eyebrow")}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("associationDashboard.members.title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("associationDashboard.members.description")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isLoading}
          aria-pressed={view === "groups"}
          onClick={() => setView(view === "groups" ? "roster" : "groups")}
        >
          <L.FolderTree className="h-4 w-4" />
          {t(
            view === "groups"
              ? "associationDashboard.members.actions.backToRoster"
              : "associationDashboard.members.actions.manageGroups",
          )}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="brand"
          onClick={openInvite}
          disabled={isLoading}
        >
          <L.UserPlus className="h-4 w-4" />
          {t("associationDashboard.members.actions.invite")}
        </Button>
      </div>
    </section>
  );
};
