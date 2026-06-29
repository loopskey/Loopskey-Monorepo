"use client";

import { useConfirmExternalLearningMutation } from "@/lib/rtk/endpoints/external-learning.api";
import { TExternalLearningDialog } from "@/types/professional-dashboard.types";
import { ExternalLearningStatus } from "@/lib/graphql/generated";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { notify } from "@/hooks/notify";
import { Form } from "@ui/form";

import * as SC from "@/lib/validations/professional-dashboard";
import * as D from "@ui/dialog";

export const ExternalLearningConfirmDialog = ({
  open,
  activityId,
  onOpenChange,
}: TExternalLearningDialog) => {
  const { t } = useI18n();
  const [confirm, state] = useConfirmExternalLearningMutation();

  const form = useForm<SC.TFormInput, unknown, SC.TFormValues>({
    resolver: zodResolver(SC.externalLearningSchema),
    defaultValues: {
      status: ExternalLearningStatus.EnrolledConfirmed,
      pduHours: 0,
      evidenceNote: "",
      licenseNumber: "",
      certificateUrl: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await confirm({
        activityId,
        status: values.status,
        pduHours: values.pduHours,
        certificateUrl: values.certificateUrl || undefined,
        licenseNumber: values.licenseNumber?.trim() || undefined,
        evidenceNote: values.evidenceNote?.trim() || undefined,
      }).unwrap();
      notify.success(
        t("professionalDashboard.externalLearning.messages.confirmed"),
      );
      onOpenChange(false);
    } catch (error) {
      console.log("CONFIRM EXTERNAL LEARNING ERROR:", error);
      notify.error(t("authPages.common.genericError"));
    }
  });

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="glass-dialog max-w-2xl rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle>
            {t("professionalDashboard.externalLearning.confirm.title")}
          </D.DialogTitle>
          <D.DialogDescription>
            {t("professionalDashboard.externalLearning.confirm.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <FloatingSelectField
              name="status"
              control={form.control}
              label={t("professionalDashboard.externalLearning.fields.status")}
              options={[
                {
                  value: ExternalLearningStatus.EnrolledConfirmed,
                  label: t(
                    "professionalDashboard.externalLearning.status.enrolled",
                  ),
                },
                {
                  value: ExternalLearningStatus.Started,
                  label: t(
                    "professionalDashboard.externalLearning.status.started",
                  ),
                },
                {
                  value: ExternalLearningStatus.Completed,
                  label: t(
                    "professionalDashboard.externalLearning.status.completed",
                  ),
                },
                {
                  value: ExternalLearningStatus.EvidenceUploaded,
                  label: t(
                    "professionalDashboard.externalLearning.status.evidence",
                  ),
                },
              ]}
            />

            <FloatingInputField
              type="number"
              name="pduHours"
              control={form.control}
              label={t(
                "professionalDashboard.externalLearning.fields.pduHours",
              )}
            />

            <FloatingInputField
              name="certificateUrl"
              control={form.control}
              label={t(
                "professionalDashboard.externalLearning.fields.certificateUrl",
              )}
            />

            <FloatingInputField
              name="licenseNumber"
              control={form.control}
              label={t(
                "professionalDashboard.externalLearning.fields.licenseNumber",
              )}
            />

            <FloatingTextareaField
              name="evidenceNote"
              control={form.control}
              label={t(
                "professionalDashboard.externalLearning.fields.evidenceNote",
              )}
            />

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={state.isLoading}
              >
                {t("common.save")}
              </Button>
            </D.DialogFooter>
          </form>
        </Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
