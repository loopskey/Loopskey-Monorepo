"use client";

import { TAssociationSettingsProps } from "@/types/association-dashboard.types";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as L from "lucide-react";

export const AssociationThresholdDialog = ({
  hook,
}: TAssociationSettingsProps) => {
  const {
    label,
    impact,
    pending,
    settings,
    isSavingCompliance,
    confirmCompliance,
    closeConfirmation,
  } = hook;

  const isOpen = Boolean(pending && impact && settings);

  return (
    <D.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeConfirmation();
      }}
    >
      <D.DialogContent className="sm:max-w-lg">
        <D.DialogHeader>
          <D.DialogTitle>{label("confirm.title")}</D.DialogTitle>

          <D.DialogDescription>{label("confirm.body")}</D.DialogDescription>
        </D.DialogHeader>

        {pending && impact && settings && (
          <div className="space-y-4">
            <dl className="space-y-2 rounded-2xl border border-glass-border bg-background/50 p-4 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">
                  {label("compliance.onTrackThreshold")}
                </dt>
                <dd className="tabular-nums">
                  {label("confirm.change", {
                    from: settings.onTrackThreshold,
                    to: pending.onTrackThreshold,
                  })}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">
                  {label("compliance.atRiskThreshold")}
                </dt>
                <dd className="tabular-nums">
                  {label("confirm.change", {
                    from: settings.atRiskThreshold,
                    to: pending.atRiskThreshold,
                  })}
                </dd>
              </div>
            </dl>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <L.ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {label("confirm.movingBand", {
                  count: impact.membersChangingBand,
                  total: impact.totalMembers,
                })}
              </li>

              {impact.membersEnteringAtRisk > 0 && (
                <li className="flex items-start gap-2">
                  <L.TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  {label("confirm.enteringAtRisk", {
                    count: impact.membersEnteringAtRisk,
                  })}
                </li>
              )}

              {impact.membersLeavingAtRisk > 0 && (
                <li className="flex items-start gap-2">
                  <L.CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {label("confirm.leavingAtRisk", {
                    count: impact.membersLeavingAtRisk,
                  })}
                </li>
              )}

              <li className="flex items-start gap-2">
                <L.ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {label("confirm.creditsUnchanged")}
              </li>
            </ul>
          </div>
        )}

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeConfirmation}
          >
            {label("confirm.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            disabled={isSavingCompliance}
            onClick={() => void confirmCompliance()}
          >
            {isSavingCompliance ? (
              <L.LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <L.Check className="h-4 w-4" />
            )}
            {label("confirm.apply")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
