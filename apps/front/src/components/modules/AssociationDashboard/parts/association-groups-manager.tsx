"use client";

import { TAssociationGroupsManager } from "@/types/association-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingInputField } from "@elements/floating-input";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationGroupsManager = ({
  hook,
}: TAssociationGroupsManager) => {
  const {
    t,
    groups,
    locale,
    groupForm,
    isLoading,
    submitGroup,
    isGroupSaving,
    startGroupEdit,
    editingGroupId,
    cancelGroupEdit,
    toggleGroupActive,
  } = hook;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <GlassCard>
        <div className="relative z-10">
          <h2 className="text-xl font-medium">
            {t(
              editingGroupId
                ? "associationDashboard.members.groups.editTitle"
                : "associationDashboard.members.groups.createTitle",
            )}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("associationDashboard.members.groups.formDescription")}
          </p>

          <F.Form {...groupForm}>
            <form className="mt-5 space-y-4" onSubmit={submitGroup} noValidate>
              <FloatingInputField
                name="title"
                control={groupForm.control}
                label={t("associationDashboard.members.groups.title")}
              />

              <FloatingTextareaField
                name="description"
                control={groupForm.control}
                label={t("associationDashboard.members.groups.description")}
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isGroupSaving}
                >
                  {isGroupSaving && (
                    <L.Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t(
                    editingGroupId
                      ? "associationDashboard.members.groups.save"
                      : "associationDashboard.members.groups.create",
                  )}
                </Button>

                {editingGroupId && (
                  <Button
                    radius="xl"
                    type="button"
                    variant="glass"
                    onClick={cancelGroupEdit}
                    disabled={isGroupSaving}
                  >
                    {t("associationDashboard.members.confirm.cancel")}
                  </Button>
                )}
              </div>
            </form>
          </F.Form>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="relative z-10">
          <h2 className="text-xl font-medium">
            {t("associationDashboard.members.groups.listTitle")}
          </h2>

          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("associationDashboard.members.groups.empty")}
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex flex-col gap-3 rounded-3xl border border-glass-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{group.title}</p>

                      {!group.isActive && (
                        <Badge variant="secondary">
                          {t("associationDashboard.members.groups.inactive")}
                        </Badge>
                      )}
                    </div>

                    {group.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("associationDashboard.members.groups.memberCount", {
                        count: group.memberCount.toLocaleString(locale),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      radius="xl"
                      type="button"
                      variant="glass"
                      disabled={isGroupSaving}
                      onClick={() => startGroupEdit(group)}
                    >
                      <L.Pencil className="h-4 w-4" />
                      {t("associationDashboard.members.groups.rename")}
                    </Button>

                    <Button
                      size="sm"
                      radius="xl"
                      type="button"
                      variant="glass"
                      disabled={isGroupSaving}
                      onClick={() => void toggleGroupActive(group)}
                    >
                      {group.isActive ? (
                        <L.EyeOff className="h-4 w-4" />
                      ) : (
                        <L.Eye className="h-4 w-4" />
                      )}
                      {t(
                        group.isActive
                          ? "associationDashboard.members.groups.deactivate"
                          : "associationDashboard.members.groups.reactivate",
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-xs text-muted-foreground">
            {t("associationDashboard.members.groups.deactivateNote")}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
