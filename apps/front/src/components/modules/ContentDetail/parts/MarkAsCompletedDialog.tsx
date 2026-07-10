"use client";

import { CREDIT_TYPES, PDU_CATEGORIES } from "@/utils/pdu.constant";
import { TMarkAsCompletedDialogProps } from "@/types/content-module.types";
import { ActivityEvidenceUpload } from "@modules/ProfessionalDashboard/parts/activity-evidence-upload";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { useMarkAsCompleted } from "@/hooks/useMarkAsCompleted";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as D from "@ui/dialog";

const MODAL = "contentDetails.markCompleted";
const TRACKER = "professionalDashboard.cpdPduTracker";

export const MarkAsCompletedDialog = ({
  open,
  prefill,
  existing,
  onOpenChange,
}: TMarkAsCompletedDialogProps) => {
  const {
    t,
    form,
    files,
    onSubmit,
    isSaving,
    handleFilesChange,
    activityTypeOptions,
    isAlreadyCompleted,
  } = useMarkAsCompleted(prefill, existing, () => onOpenChange(false));

  const durationLabel = prefill.durationMinutes
    ? t("contentDetails.common.minutes", { count: prefill.durationMinutes })
    : "—";

  const readOnlyRows: { label: string; value: string }[] = [
    { label: t(`${MODAL}.fields.duration`), value: durationLabel },
    { label: t(`${MODAL}.fields.level`), value: prefill.level || "—" },
    {
      label: t(`${MODAL}.fields.roadmapArea`),
      value: prefill.roadmapArea || "—",
    },
  ];

  const creditTypeOptions = CREDIT_TYPES.map((type) => ({
    value: type,
    label: t(`${TRACKER}.creditTypes.${type}`),
  }));

  const categoryOptions = PDU_CATEGORIES.map((category) => ({
    value: category,
    label: t(`${TRACKER}.categories.${category}`),
  }));

  return (
    <D.Dialog open={open} onOpenChange={onOpenChange}>
      <D.DialogContent className="glass-dialog max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-glass-border">
        <D.DialogHeader>
          <D.DialogTitle>{t(`${MODAL}.title`)}</D.DialogTitle>
          <D.DialogDescription>{t(`${MODAL}.description`)}</D.DialogDescription>
        </D.DialogHeader>

        {isAlreadyCompleted && (
          <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {t(`${MODAL}.alreadyCompleted`)}
          </div>
        )}

        <Form {...form}>
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInputField
                name="title"
                control={form.control}
                className="sm:col-span-2"
                label={t(`${MODAL}.fields.title`)}
              />

              <FloatingSelectField
                name="activityType"
                control={form.control}
                options={activityTypeOptions}
                label={t(`${MODAL}.fields.activityType`)}
              />

              <FloatingInputField
                control={form.control}
                name="providerOrganizer"
                label={t(`${MODAL}.fields.providerOrganizer`)}
              />

              <FloatingInputField
                type="date"
                name="dateCompleted"
                control={form.control}
                label={t(`${MODAL}.fields.dateCompleted`)}
              />

              <FloatingSelectField
                name="creditType"
                control={form.control}
                options={creditTypeOptions}
                label={t(`${MODAL}.fields.creditType`)}
              />

              <FloatingInputField
                step="0.1"
                type="number"
                name="creditValue"
                control={form.control}
                label={t(`${MODAL}.fields.creditValue`)}
              />

              <FloatingSelectField
                name="category"
                control={form.control}
                options={categoryOptions}
                label={t(`${MODAL}.fields.category`)}
              />

              <FloatingInputField
                name="subCategory"
                control={form.control}
                label={t(`${MODAL}.fields.subCategory`)}
              />

              <FloatingInputField
                control={form.control}
                className="sm:col-span-2"
                name="issuingOrganization"
                label={t(`${MODAL}.fields.issuingOrganization`)}
              />
            </div>

            <div className="grid gap-3 rounded-2xl border border-glass-border bg-background/40 p-4 sm:grid-cols-3">
              {readOnlyRows.map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t(`${MODAL}.fields.certificate`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`${MODAL}.fields.certificateHelp`)}
              </p>
              <ActivityEvidenceUpload
                t={t}
                files={files}
                existingFiles={[]}
                onChange={handleFilesChange}
              />
            </div>

            <FloatingInputField
              type="url"
              name="certificateLink"
              control={form.control}
              label={t(`${MODAL}.fields.certificateLink`)}
              placeholder={t(`${MODAL}.fields.certificateLinkPlaceholder`)}
            />

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="glass"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t(`${MODAL}.save`)}
              </Button>
            </D.DialogFooter>
          </form>
        </Form>
      </D.DialogContent>
    </D.Dialog>
  );
};

export default MarkAsCompletedDialog;
