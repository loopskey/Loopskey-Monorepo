"use client";

import { AssociationLearningStepAssignment } from "@modules/AssociationDashboard/parts/association-learning-step-assignment";
import { AssociationLearningStepContent } from "@modules/AssociationDashboard/parts/association-learning-step-content";
import { AssociationLearningStepReview } from "@modules/AssociationDashboard/parts/association-learning-step-review";
import { AssociationLearningStepCpd } from "@modules/AssociationDashboard/parts/association-learning-step-cpd";
import { TAssociationLearningEditor } from "@/types/association-dashboard.types";
import { useMemo, useState } from "react";
import { ActivityStepper } from "@modules/ProfessionalDashboard/parts/activity-stepper";
import { Button } from "@ui/button";

import * as A from "@ui/alert-dialog";
import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationLearningEditor = ({
  hook,
}: TAssociationLearningEditor) => {
  const {
    t,
    form,
    step,
    next,
    goToStep,
    isEditing,
    isExternal,
    closeEditor,
    isEditorOpen,
  } = hook;

  const [confirmClose, setConfirmClose] = useState(false);

  const label = (key: string) =>
    t(`associationDashboard.learningContent.editor.${key}`);

  const steps = useMemo(
    () =>
      [1, 2, 3, 4].map((value) => ({
        value,
        title: t(
          `associationDashboard.learningContent.wizard.step${value}.title`,
        ),
        description: t(
          `associationDashboard.learningContent.wizard.step${value}.description`,
        ),
      })),
    [t],
  );

  const requestClose = () => {
    if (form.formState.isDirty) setConfirmClose(true);
    else closeEditor();
  };

  return (
    <>
      <D.Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
      >
        <D.DialogContent className="glass-dialog z-[9999] max-h-[90vh] max-w-2xl overflow-y-auto rounded-lg border-border">
          <D.DialogHeader>
            <D.DialogTitle className="text-xl">
              {label(
                isEditing
                  ? "editTitle"
                  : isExternal
                    ? "addExternalTitle"
                    : "addCatalogueTitle",
              )}
            </D.DialogTitle>

            <D.DialogDescription className="leading-6">
              {label(
                isExternal ? "externalDescription" : "catalogueDescription",
              )}
            </D.DialogDescription>
          </D.DialogHeader>

          <ActivityStepper
            steps={steps}
            activeStep={step}
            onChange={goToStep}
          />

          <F.Form {...form}>
            <form
              className="space-y-4"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (step < 4) void next();
              }}
            >
              {step === 1 && <AssociationLearningStepContent hook={hook} />}
              {step === 2 && <AssociationLearningStepCpd hook={hook} />}
              {step === 3 && <AssociationLearningStepAssignment hook={hook} />}
              {step === 4 && <AssociationLearningStepReview hook={hook} />}

              {step < 4 && (
                <D.DialogFooter>
                  <Button
                    radius="xl"
                    type="button"
                    variant="cancel"
                    onClick={requestClose}
                  >
                    {t("associationDashboard.requirements.confirm.cancel")}
                  </Button>

                  <Button radius="xl" type="submit">
                    {t("associationDashboard.requirements.wizard.next")}
                    <L.ArrowRight className="h-4 w-4" />
                  </Button>
                </D.DialogFooter>
              )}
            </form>
          </F.Form>
        </D.DialogContent>
      </D.Dialog>

      <A.AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <A.AlertDialogContent className="glass-dialog z-[9999] rounded-lg border-border">
          <A.AlertDialogHeader>
            <A.AlertDialogTitle>{label("unsavedTitle")}</A.AlertDialogTitle>
            <A.AlertDialogDescription>
              {label("unsavedBody")}
            </A.AlertDialogDescription>
          </A.AlertDialogHeader>
          <A.AlertDialogFooter>
            <A.AlertDialogCancel>{label("unsavedKeep")}</A.AlertDialogCancel>
            <A.AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmClose(false);
                closeEditor();
              }}
            >
              {label("unsavedDiscard")}
            </A.AlertDialogAction>
          </A.AlertDialogFooter>
        </A.AlertDialogContent>
      </A.AlertDialog>
    </>
  );
};
