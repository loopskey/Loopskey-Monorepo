"use client";

import { CpdStepCertification } from "@modules/ProfessionalDashboard/parts/cpd-step-certification";
import { useMemo, useState } from "react";
import { CpdStepCategories } from "@modules/ProfessionalDashboard/parts/cpd-step-categories";
import { CpdSetupFlowProps } from "@/types/cpd-plan.types";
import { CpdStepReporting } from "@modules/ProfessionalDashboard/parts/cpd-step-reporting";
import { useCpdPlanSetup } from "@/hooks/useCpdPlanSetup";
import { ActivityStepper } from "@modules/ProfessionalDashboard/parts/activity-stepper";
import { CpdStepEvidence } from "@modules/ProfessionalDashboard/parts/cpd-step-evidence";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";
import * as A from "@ui/alert-dialog";
import * as F from "@ui/form";

export const CpdSetupFlow = ({
  t,
  setup,
  onCancel,
  onSubmit,
  isSubmitting,
}: CpdSetupFlowProps) => {
  const [confirmCancel, setConfirmCancel] = useState(false);

  const setupForm = useCpdPlanSetup({
    initialValues: setup.initial,
    isSubmitting,
    onSubmit,
  });

  const {
    form,
    step,
    goToStep,
    next,
    back,
    submit,
    categories,
    addCategory,
    removeCategory,
    targetTotal,
    creditType,
    isDirty,
    isLastStep,
  } = setupForm;

  const steps = useMemo(
    () =>
      [1, 2, 3, 4].map((value) => ({
        value,
        title: t(`cpdProgress.setup.step${value}.title`),
        description: t(`cpdProgress.setup.step${value}.description`),
      })),
    [t],
  );

  const handleCancel = () => {
    if (isDirty) setConfirmCancel(true);
    else onCancel();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          {t("cpdProgress.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t(
            setup.mode === "manual"
              ? "cpdProgress.setup.titleManual"
              : "cpdProgress.setup.titleSuggestion",
          )}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("cpdProgress.setup.subtitle")}
        </p>
      </div>

      <ActivityStepper steps={steps} activeStep={step} onChange={goToStep} />

      <GlassCard>
        <F.Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (isLastStep) submit();
              else next();
            }}
          >
            {step === 1 && (
              <CpdStepCertification t={t} form={form} control={form.control} />
            )}
            {step === 2 && (
              <CpdStepReporting t={t} form={form} control={form.control} />
            )}
            {step === 3 && (
              <CpdStepCategories
                t={t}
                form={form}
                control={form.control}
                categories={categories}
                creditType={creditType}
                addCategory={addCategory}
                targetTotal={targetTotal}
                removeCategory={removeCategory}
              />
            )}
            {step === 4 && (
              <CpdStepEvidence t={t} form={form} control={form.control} />
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {step === 1 ? (
                <Button
                  radius="xl"
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  {t("cpdProgress.common.cancel")}
                </Button>
              ) : (
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={back}
                  disabled={isSubmitting}
                >
                  <L.ArrowLeft className="h-4 w-4" />
                  {t("cpdProgress.common.back")}
                </Button>
              )}

              {isLastStep ? (
                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <L.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <L.Check className="h-4 w-4" />
                  )}
                  {t("cpdProgress.setup.actions.create")}
                </Button>
              ) : (
                <Button radius="xl" type="submit" variant="brand">
                  {t("cpdProgress.common.next")}
                  <L.ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </F.Form>
      </GlassCard>

      <A.AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <A.AlertDialogContent className="glass-dialog rounded-3xl border-glass-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>
              {t("cpdProgress.setup.unsaved.title")}
            </A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {t("cpdProgress.setup.unsaved.description")}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>
              {t("cpdProgress.setup.unsaved.keep")}
            </A.AlertDialogCancel>
            <A.AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmCancel(false);
                onCancel();
              }}
            >
              {t("cpdProgress.setup.unsaved.discard")}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </div>
  );
};
