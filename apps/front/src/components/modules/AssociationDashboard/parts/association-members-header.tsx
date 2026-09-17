"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as D from "@ui/dropdown-menu";
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

  const secondaryActions = [
    {
      id: "upload",
      icon: L.FileUp,
      onClick: openUpload,
      label: t("associationDashboard.members.actions.upload"),
    },
    {
      id: "assign",
      icon: L.ListChecks,
      onClick: openAssignPicker,
      label: t("associationDashboard.members.actions.assignRequirement"),
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
    },
  ];

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
        <div className="hidden flex-wrap items-center gap-3 sm:flex">
          {secondaryActions.map((action) => (
            <Button
              radius="xl"
              type="button"
              key={action.id}
              variant="outline"
              disabled={isLoading}
              aria-pressed={action.id === "groups" ? isGroupsView : undefined}
              onClick={action.onClick}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>

        <D.DropdownMenu>
          <D.DropdownMenuTrigger asChild>
            <Button
              radius="xl"
              type="button"
              variant="outline"
              disabled={isLoading}
              className="sm:hidden"
              aria-label={t("associationDashboard.members.actions.more")}
            >
              <L.MoreHorizontal className="h-4 w-4" />
              {t("associationDashboard.members.actions.more")}
            </Button>
          </D.DropdownMenuTrigger>

          <D.DropdownMenuContent align="end" className="z-[9999] rounded-md">
            {secondaryActions.map((action) => (
              <D.DropdownMenuItem key={action.id} onSelect={action.onClick}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </D.DropdownMenuItem>
            ))}
          </D.DropdownMenuContent>
        </D.DropdownMenu>

        <Button
          radius="xl"
          type="button"
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
