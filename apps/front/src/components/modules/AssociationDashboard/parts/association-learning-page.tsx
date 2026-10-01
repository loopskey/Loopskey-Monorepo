"use client";

import { AssociationLearningStepAssignment } from "@modules/AssociationDashboard/parts/association-learning-step-assignment";
import { AssociationLearningDetailsSheet } from "@modules/AssociationDashboard/parts/association-learning-details-sheet";
import { AssociationLearningStepContent } from "@modules/AssociationDashboard/parts/association-learning-step-content";
import { AssociationLearningStepReview } from "@modules/AssociationDashboard/parts/association-learning-step-review";
import { AssociationLearningStepCpd } from "@modules/AssociationDashboard/parts/association-learning-step-cpd";
import { TAssociationLearningEditor } from "@/types/association-dashboard.types";
import { LEARNING_CONTENT_STEPS } from "@hooks/useAssociationLearningContent";
import { WizardStepper } from "@elements/wizard-stepper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import type { TLearningContentStep } from "@hooks/useAssociationLearningContent";

import * as A from "@ui/alert-dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

const KEY = "associationDashboard.learningContent";

export const AssociationLearningPage = ({
  hook,
}: TAssociationLearningEditor) => {
  const {
    t,
    form,
    step,
    next,
    back,
    goToStep,
    isSaving,
    isEditing,
    saveDraft,
    isEditorLoading,
    requestExitWizard,
    confirmExit,
    confirmExitWizard,
    cancelExitWizard,
  } = hook;

  const activeIndex = LEARNING_CONTENT_STEPS.indexOf(step);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={requestExitWizard}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <L.ArrowLeft className="h-4 w-4" />
        {t(`${KEY}.title`)}
      </button>

      <h1 className="text-2xl font-medium">
        {t(isEditing ? `${KEY}.editor.editTitle` : `${KEY}.editor.addTitle`)}
      </h1>

      <WizardStepper
        isSticky
        activeKey={step}
        label={t(`${KEY}.wizard.stepsLabel`)}
        onSelect={(wizardStep) => goToStep(wizardStep)}
        steps={LEARNING_CONTENT_STEPS.map((wizardStep, index) => ({
          key: wizardStep as TLearningContentStep,
          title: t(`${KEY}.wizard.step${index + 1}.title`),
          description: t(`${KEY}.wizard.step${index + 1}.description`),
          isComplete: index < activeIndex,
          isReachable: index <= activeIndex,
        }))}
      />

      {isEditorLoading ? (
        <GlassCard>
          <div className="relative z-10 space-y-3" aria-busy="true">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </GlassCard>
      ) : (
        <F.Form {...form}>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (step !== "review") void next();
            }}
          >
            {step === "content" && (
              <AssociationLearningStepContent hook={hook} />
            )}
            {step === "cpd" && <AssociationLearningStepCpd hook={hook} />}
            {step === "assignment" && (
              <AssociationLearningStepAssignment hook={hook} />
            )}
            {step === "review" && <AssociationLearningStepReview hook={hook} />}

            {step !== "review" && (
              <GlassCard
                glow={false}
                className="sticky bottom-4 z-30 lg:static"
              >
                <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  {step === "content" ? (
                    <span />
                  ) : (
                    <Button
                      radius="xl"
                      type="button"
                      variant="outline"
                      disabled={isSaving}
                      onClick={back}
                    >
                      <L.ArrowLeft className="h-4 w-4" />
                      {t("associationDashboard.requirements.wizard.back")}
                    </Button>
                  )}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                      radius="xl"
                      type="button"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => void saveDraft()}
                    >
                      {isSaving && (
                        <L.Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t(`${KEY}.review.saveDraft`)}
                    </Button>

                    <Button radius="xl" type="submit" disabled={isSaving}>
                      {t("associationDashboard.requirements.wizard.next")}
                      <L.ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}
          </form>
        </F.Form>
      )}

      <AssociationLearningDetailsSheet hook={hook} />

      <A.AlertDialog
        open={confirmExit}
        onOpenChange={(open) => !open && cancelExitWizard()}
      >
        <A.AlertDialogContent className="glass-dialog rounded-lg border-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t(`${KEY}.editor.unsavedTitle`)}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t(`${KEY}.editor.unsavedBody`)}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>
              {t(`${KEY}.editor.unsavedKeep`)}
            </A.AlertDialogCancel>
            <A.AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmExitWizard}
            >
              {t(`${KEY}.editor.unsavedDiscard`)}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </div>
  );
};

export default AssociationLearningPage;
