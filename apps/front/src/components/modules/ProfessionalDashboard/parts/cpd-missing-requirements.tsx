"use client";

import { CpdMissingRequirementsProps } from "@/types/cpd-plan.types";
import { CPD_MISSING_ACTION } from "@/utils/cpd-plan.constant";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

export const CpdMissingRequirements = ({
  t,
  progress,
  onAddActivity,
  onEditPlan,
}: CpdMissingRequirementsProps) => (
  <GlassCard>
    <div className="mb-5">
      <h2 className="text-xl font-medium">
        {t("cpdProgress.progress.missingTitle")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("cpdProgress.progress.missingSubtitle")}
      </p>
    </div>

    {progress.missingRequirements.length === 0 ? (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
        <L.CheckCircle2 className="h-5 w-5" />
        {t("cpdProgress.progress.missingNone")}
      </div>
    ) : (
      <ul className="space-y-3">
        {progress.missingRequirements.map((item, index) => {
          const action = CPD_MISSING_ACTION[item.code];
          return (
            <li
              key={`${item.code}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-glass-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <L.AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <p className="text-sm">
                  {t(`cpdProgress.missing.${item.code}`, {
                    detail: item.detail ?? "",
                  })}
                </p>
              </div>

              {action === "add-activity" && (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={onAddActivity}
                >
                  <L.Plus className="h-4 w-4" />
                  {t("cpdProgress.progress.addActivity")}
                </Button>
              )}
              {action === "cpd-pdu-tracker" && (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={onEditPlan}
                >
                  <L.Upload className="h-4 w-4" />
                  {t("cpdProgress.progress.uploadEvidence")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </GlassCard>
);
