"use client";

import { TAssociationRequirementWizard } from "@/types/association-dashboard.types";
import { AssociationRequirementDetailsStep } from "@modules/AssociationDashboard/parts/association-requirement-details-step";
import { AssociationRequirementReviewStep } from "@modules/AssociationDashboard/parts/association-requirement-review-step";
import { AssociationRequirementRulesStep } from "@modules/AssociationDashboard/parts/association-requirement-rules-step";
import {
  REQUIREMENT_WIZARD_STEPS,
  problemStep,
} from "@utils/association-requirement";
import type { TRequirementWizardStep } from "@utils/association-requirement";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const AssociationRequirementWizard = ({
  hook,
}: TAssociationRequirementWizard) => {
  const { t, step, goTo, problems, isSaving, requirementId, submitDetails } =
    hook;

  const activeIndex = REQUIREMENT_WIZARD_STEPS.indexOf(step);

  const stepsWithProblems = new Set<TRequirementWizardStep>(
    problems.map((problem) => problemStep(problem.field)),
  );

  return (
    <div className="space-y-6">
      <nav
        aria-label={t("associationDashboard.requirements.wizard.stepsLabel")}
        className="sticky top-16 z-30 rounded-3xl border border-glass-border bg-background/80 p-2 backdrop-blur"
      >
        <ol className="flex flex-col gap-1 sm:flex-row sm:gap-2">
          {REQUIREMENT_WIZARD_STEPS.map((wizardStep, index) => {
            const isActive = wizardStep === step;
            const isReachable = index === 0 || Boolean(requirementId);
            const hasProblem = stepsWithProblems.has(wizardStep);

            return (
              <li key={wizardStep} className="flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!isReachable}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => goTo(requirementId, wizardStep)}
                  className={cn(
                    "h-auto w-full justify-start gap-3 rounded-2xl px-4 py-3 text-left",
                    isActive && "bg-primary/10 text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums",
                      index < activeIndex &&
                        "border-primary bg-primary text-primary-foreground",
                      hasProblem && "border-destructive text-destructive",
                    )}
                  >
                    {hasProblem ? (
                      <L.TriangleAlert className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {t(
                        `associationDashboard.requirements.wizard.steps.${wizardStep}`,
                      )}
                    </span>

                    <span className="block truncate text-xs text-muted-foreground">
                      {t(
                        `associationDashboard.requirements.wizard.hints.${wizardStep}`,
                      )}
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ol>
      </nav>

      {step === "details" && <AssociationRequirementDetailsStep hook={hook} />}
      {step === "rules" && <AssociationRequirementRulesStep hook={hook} />}
      {step === "review" && <AssociationRequirementReviewStep hook={hook} />}

      {step !== "review" && (
        <GlassCard
          glow={false}
          className="sticky bottom-4 z-30 backdrop-blur lg:static"
        >
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {step === "rules" && (
              <Button
                radius="xl"
                type="button"
                variant="glass"
                disabled={isSaving}
                onClick={() => goTo(requirementId, "details")}
              >
                <L.ArrowLeft className="h-4 w-4" />
                {t("associationDashboard.requirements.wizard.back")}
              </Button>
            )}

            <Button
              radius="xl"
              type="button"
              variant="brand"
              disabled={isSaving}
              onClick={() =>
                step === "details"
                  ? void submitDetails()
                  : goTo(requirementId, "review")
              }
            >
              {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
              {t(
                step === "details"
                  ? "associationDashboard.requirements.wizard.saveAndContinue"
                  : "associationDashboard.requirements.wizard.continue",
              )}
              <L.ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
