"use client";

import { TAssociationMemberRequirementsDialog } from "@/types/association-dashboard.types";
import { Checkbox } from "@ui/checkbox";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as D from "@ui/dialog";
import * as L from "lucide-react";

export const AssociationMemberRequirementsDialog = ({
  hook,
}: TAssociationMemberRequirementsDialog) => {
  const {
    t,
    locale,
    selection,
    isOptionsLoading,
    requirementOptions,
    toggleRequirement,
    isRequirementsOpen,
    setRequirementsOpen,
    submitRequirements,
    isSavingRequirements,
  } = hook;

  const date = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString(locale) : null;

  return (
    <D.Dialog open={isRequirementsOpen} onOpenChange={setRequirementsOpen}>
      <D.DialogContent className="glass-dialog z-[9999] max-w-xl rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.memberDetail.assign.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.memberDetail.assign.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {isOptionsLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : requirementOptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center">
            <L.ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.assign.emptyTitle")}
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.assign.emptyBody")}
            </p>
          </div>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {requirementOptions.map((option) => (
              <li
                key={option.id}
                className="rounded-2xl border border-glass-border p-3"
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    className="mt-1"
                    disabled={!option.isMemberManaged || isSavingRequirements}
                    checked={selection.includes(option.id)}
                    onCheckedChange={() => toggleRequirement(option.id)}
                  />

                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{option.name}</span>

                      {!option.isMemberManaged && (
                        <Badge variant="secondary">
                          {t(
                            "associationDashboard.memberDetail.assign.audienceManaged",
                          )}
                        </Badge>
                      )}
                    </span>

                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t("associationDashboard.memberDetail.assign.meta", {
                        credits: option.totalRequiredCredits,
                        creditType: option.creditType,
                        deadline:
                          date(option.deadline as string | null) ??
                          t(
                            "associationDashboard.memberDetail.cards.noDeadline",
                          ),
                      })}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            disabled={isSavingRequirements}
            onClick={() => setRequirementsOpen(false)}
          >
            {t("associationDashboard.members.confirm.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isSavingRequirements || requirementOptions.length === 0}
            onClick={() => void submitRequirements()}
          >
            {isSavingRequirements && (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t("associationDashboard.memberDetail.assign.save")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
