"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const AssociationMembersHeader = ({
  hook,
}: TAssociationMembersStats) => {
  const {
    t,
    view,
    setView,
    openInvite,
    openUpload,
    openAssignPicker,
    isLoading,
  } = hook;

  const isGroupsView = view === "groups";

  const actions = [
    {
      id: "upload",
      icon: L.FileUp,
      onClick: openUpload,
      label: t("associationDashboard.members.actions.upload"),
      variant: "outline" as const,
    },
    {
      id: "assign",
      icon: L.ListChecks,
      onClick: openAssignPicker,
      label: t("associationDashboard.members.actions.assignRequirement"),
      variant: "outline" as const,
    },
    {
      id: "groups",
      icon: L.FolderTree,
      onClick: () => setView(isGroupsView ? "roster" : "groups"),
      label: t(
        isGroupsView
          ? "associationDashboard.members.actions.backToRoster"
          : "associationDashboard.members.actions.manageGroups",
      ),
      variant: "outline" as const,
    },
    {
      id: "invite",
      icon: L.UserPlus,
      onClick: openInvite,
      label: t("associationDashboard.members.actions.invite"),
      variant: "default" as const,
    },
  ];

  return (
    <section>
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

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        {actions.map((action) => (
          <Button
            radius="xl"
            type="button"
            key={action.id}
            variant={action.variant}
            disabled={isLoading}
            onClick={action.onClick}
            aria-pressed={action.id === "groups" ? isGroupsView : undefined}
            className="w-full justify-center md:w-auto"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </section>
  );
};
