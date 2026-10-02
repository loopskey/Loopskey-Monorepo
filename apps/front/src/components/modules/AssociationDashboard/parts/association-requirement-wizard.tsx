"use client";

import { AssociationRequirementDetailsStep } from "@modules/AssociationDashboard/parts/association-requirement-details-step";
import { AssociationRequirementReviewStep } from "@modules/AssociationDashboard/parts/association-requirement-review-step";
import { AssociationRequirementRulesStep } from "@modules/AssociationDashboard/parts/association-requirement-rules-step";
import { TAssociationRequirementWizard } from "@/types/association-dashboard.types";
import { REQUIREMENT_WIZARD_STEPS } from "@utils/association-requirement";
import { problemStep } from "@utils/association-requirement";
import { WizardStepper } from "@elements/wizard-stepper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import type { TRequirementWizardStep } from "@utils/association-requirement";
import * as L from "lucide-react";

export const AssociationRequirementWizard = ({
  hook,
}: TAssociationRequirementWizard) => {
  const {
    t,
    step,
    goTo,
    problems,
    isSaving,
    exitToList,
    submitRules,
    requirementId,
    submitDetails,
    saveDetailsAsDraft,
  } = hook;

  const activeIndex = REQUIREMENT_WIZARD_STEPS.indexOf(step);

  const stepsWithProblems = new Set<TRequirementWizardStep>(
    problems.map((problem) => problemStep(problem.field)),
  );

  return (
    <div className="space-y-6">
      <WizardStepper
        isSticky
        activeKey={step}
        label={t("associationDashboard.requirements.wizard.stepsLabel")}
        onSelect={(wizardStep) => goTo(requirementId, wizardStep)}
        steps={REQUIREMENT_WIZARD_STEPS.map((wizardStep, index) => ({
          key: wizardStep,
          title: t(
            `associationDashboard.requirements.wizard.steps.${wizardStep}`,
          ),
          description: t(
            `associationDashboard.requirements.wizard.hints.${wizardStep}`,
          ),
          isComplete: index < activeIndex,
          isReachable: index === 0 || Boolean(requirementId),
          hasProblem: stepsWithProblems.has(wizardStep),
        }))}
      />

      {step === "details" && <AssociationRequirementDetailsStep hook={hook} />}
      {step === "rules" && <AssociationRequirementRulesStep hook={hook} />}
      {step === "review" && <AssociationRequirementReviewStep hook={hook} />}

      {step !== "review" && (
        <GlassCard glow={false} className="sticky bottom-4 z-30 lg:static">
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {step === "rules" && (
              <Button
                radius="xl"
                type="button"
                variant="outline"
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
              variant="outline"
              disabled={isSaving}
              onClick={() =>
                step === "details" ? void saveDetailsAsDraft() : exitToList()
              }
            >
              {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
              {t("associationDashboard.requirements.wizard.saveAsDraft")}
            </Button>

            <Button
              radius="xl"
              type="button"
              disabled={isSaving}
              onClick={() =>
                step === "details" ? void submitDetails() : void submitRules()
              }
            >
              {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
              {t(
                step === "details"
                  ? "associationDashboard.requirements.wizard.continueToRules"
                  : "associationDashboard.requirements.wizard.reviewRequirement",
              )}
              <L.ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
