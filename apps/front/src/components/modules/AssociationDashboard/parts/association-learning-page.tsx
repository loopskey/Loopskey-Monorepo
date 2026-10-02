"use client";

import { AssociationLearningStepAssignment } from "@modules/AssociationDashboard/parts/association-learning-step-assignment";
import { AssociationLearningDetailsSheet } from "@modules/AssociationDashboard/parts/association-learning-details-sheet";
import { AssociationLearningStepContent } from "@modules/AssociationDashboard/parts/association-learning-step-content";
import { AssociationLearningStepReview } from "@modules/AssociationDashboard/parts/association-learning-step-review";
import { AssociationLearningStepCpd } from "@modules/AssociationDashboard/parts/association-learning-step-cpd";
import { TAssociationLearningEditor } from "@/types/association-dashboard.types";
import { LEARNING_CONTENT_STEPS } from "@hooks/useAssociationLearningContent";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

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

      <nav
        aria-label={t("associationDashboard.requirements.wizard.stepsLabel")}
      >
        <div className="grid gap-3 md:grid-cols-4">
          {LEARNING_CONTENT_STEPS.map((wizardStep, index) => {
            const isActive = wizardStep === step;
            const isDone = index < activeIndex;
            const isReachable = isDone || isActive;

            return (
              <button
                type="button"
                key={wizardStep}
                disabled={!isReachable}
                aria-current={isActive ? "step" : undefined}
                onClick={() => goToStep(wizardStep as TLearningContentStep)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-border bg-muted",
                  isDone && "hover:border-primary/40",
                  !isReachable && "cursor-not-allowed opacity-60",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-medium",
                    isReachable
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <L.Check className="h-4 w-4" /> : index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium leading-snug">
                    {t(`${KEY}.wizard.step${index + 1}.title`)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {t(`${KEY}.wizard.step${index + 1}.description`)}
                  </p>
                </div>

                {index < LEARNING_CONTENT_STEPS.length - 1 && (
                  <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-border bg-background md:block" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

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
