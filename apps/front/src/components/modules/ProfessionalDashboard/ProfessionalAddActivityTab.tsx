"use client";

import { useProfessionalAddActivity } from "@/hooks/useProfessionalAddActivity";
import { ActivitySuccessPanel } from "@modules/ProfessionalDashboard/parts/activity-success-panel";
import { ActivityStepEvidence } from "@modules/ProfessionalDashboard/parts/activity-step-evidence";
import { PDU_WIZARD_LAST_STEP } from "@/utils/pdu.constant";
import { ActivityStepOutcome } from "@modules/ProfessionalDashboard/parts/activity-step-outcome";
import { ActivityStepCredits } from "@modules/ProfessionalDashboard/parts/activity-step-credits";
import { ActivityStepBasic } from "@modules/ProfessionalDashboard/parts/activity-step-basic";
import { ActivityStepper } from "@modules/ProfessionalDashboard/parts/activity-stepper";
import { ConfirmDialog } from "@elements/confirm-dialog";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const ProfessionalAddActivityTab = () => {
  const {
    t,
    form,
    step,
    steps,
    files,
    goNext,
    goBack,
    goToStep,
    onSubmit,
    isSaving,
    isEditing,
    isRemoving,
    isSubmitted,
    goToTracker,
    existingFiles,
    handleAddAnother,
    handleFilesChange,
    activityTypeOptions,
    subCategoryOptions,
    isLoadingActivity,
    markReportingYearTouched,
    handleRemoveExistingFile,
    handleDownloadExistingFile,
  } = useProfessionalAddActivity();

  if (isSubmitted)
    return (
      <ActivitySuccessPanel
        t={t}
        isEditing={isEditing}
        onAddAnother={handleAddAnother}
        onViewActivities={goToTracker}
      />
    );

  if (isLoadingActivity)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  const isLastStep = step === PDU_WIZARD_LAST_STEP;

  const cancelButton = (
    <Button radius="xl" type="button" variant="cancel" disabled={isSaving}>
      {t("common.cancel")}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          {t(`${TRACKER}.title`)}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {isEditing
            ? t(`${TRACKER}.addActivity.editTitle`)
            : t(`${TRACKER}.addActivity.title`)}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t(`${TRACKER}.addActivity.subtitle`)}
        </p>
      </div>

      <ActivityStepper steps={steps} activeStep={step} onChange={goToStep} />

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate>
          <GlassCard>
            {step === 1 && (
              <ActivityStepBasic
                t={t}
                control={form.control}
                activityTypeOptions={activityTypeOptions}
              />
            )}

            {step === 2 && (
              <ActivityStepCredits
                t={t}
                control={form.control}
                subCategoryOptions={subCategoryOptions}
                onReportingYearTouched={markReportingYearTouched}
              />
            )}

            {step === 3 && (
              <ActivityStepEvidence
                t={t}
                files={files}
                control={form.control}
                isRemoving={isRemoving}
                existingFiles={existingFiles}
                onFilesChange={handleFilesChange}
                onRemoveExisting={
                  isEditing ? handleRemoveExistingFile : undefined
                }
                onDownloadExisting={
                  isEditing ? handleDownloadExistingFile : undefined
                }
              />
            )}

            {step === 4 && (
              <ActivityStepOutcome
                t={t}
                files={files}
                control={form.control}
                onEditStep={goToStep}
                values={form.getValues()}
                existingFiles={existingFiles}
              />
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-glass-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              {form.formState.isDirty || files.length > 0 ? (
                <ConfirmDialog
                  trigger={cancelButton}
                  onConfirm={goToTracker}
                  confirmVariant="destructive"
                  title={t(`${TRACKER}.addActivity.cancelTitle`)}
                  cancelText={t(`${TRACKER}.addActivity.keepEditing`)}
                  confirmText={t(`${TRACKER}.addActivity.discardChanges`)}
                  description={t(`${TRACKER}.addActivity.cancelDescription`)}
                />
              ) : (
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  onClick={goToTracker}
                >
                  {t("common.cancel")}
                </Button>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {step > 1 && (
                  <Button
                    radius="xl"
                    type="button"
                    variant="glass"
                    onClick={goBack}
                    disabled={isSaving}
                  >
                    <L.ArrowLeft className="h-4 w-4" />
                    {t(`${TRACKER}.addActivity.back`)}
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    radius="xl"
                    type="submit"
                    variant="brand"
                    disabled={isSaving}
                  >
                    {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing
                      ? t(`${TRACKER}.addActivity.updateActivity`)
                      : t(`${TRACKER}.addActivity.addActivity`)}
                  </Button>
                ) : (
                  <Button
                    radius="xl"
                    type="button"
                    variant="brand"
                    onClick={goNext}
                  >
                    {t(`${TRACKER}.addActivity.next`)}
                    <L.ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </form>
      </Form>
    </div>
  );
};

export default ProfessionalAddActivityTab;
