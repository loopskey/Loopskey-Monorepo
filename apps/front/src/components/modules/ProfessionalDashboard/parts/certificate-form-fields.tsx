"use client";

import { TCertificateFormFieldsProps } from "@/types/professional-dashboard.types";
import { ActivityEvidenceUpload } from "@modules/ProfessionalDashboard/parts/activity-evidence-upload";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";

import * as H from "@/utils/certificates.helper";
import * as F from "@ui/form";
import * as L from "lucide-react";

const CERTIFICATES = "professionalDashboard.certificates";

const EVIDENCE_LABEL_ID = "certificate-evidence-label";

export const CertificateFormFields = ({
  t,
  files,
  control,
  isRemoving,
  planOptions,
  existingFiles,
  isPlansLoading,
  onFilesChange,
  onRemoveExisting,
  onDownloadExisting,
}: TCertificateFormFieldsProps) => {
  const planSelectOptions = [
    {
      value: H.CERTIFICATE_PLAN_NONE,
      label: t(`${CERTIFICATES}.fields.noPlan`),
    },
    ...planOptions.map((plan) => ({ value: plan.id, label: plan.name })),
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <FloatingInputField
          name="title"
          control={control}
          className="md:col-span-2"
          leftIcon={<L.Award className="h-4 w-4" />}
          label={t(`${CERTIFICATES}.fields.title`)}
          placeholder={t(`${CERTIFICATES}.fields.titlePlaceholder`)}
        />

        <FloatingInputField
          name="issuer"
          control={control}
          label={t(`${CERTIFICATES}.fields.issuer`)}
          leftIcon={<L.Building2 className="h-4 w-4" />}
          placeholder={t(`${CERTIFICATES}.fields.issuerPlaceholder`)}
        />

        <FloatingInputField
          control={control}
          name="certificateNumber"
          leftIcon={<L.Hash className="h-4 w-4" />}
          label={t(`${CERTIFICATES}.fields.certificateNumber`)}
          placeholder={t(`${CERTIFICATES}.fields.certificateNumberPlaceholder`)}
        />

        <FloatingInputField
          type="date"
          name="issueDate"
          control={control}
          leftIcon={<L.CalendarDays className="h-4 w-4" />}
          label={t(`${CERTIFICATES}.fields.issueDate`)}
        />

        <FloatingInputField
          type="date"
          name="validUntil"
          control={control}
          leftIcon={<L.CalendarClock className="h-4 w-4" />}
          label={t(`${CERTIFICATES}.fields.validUntil`)}
        />

        <FloatingSelectField
          name="cpdPlanId"
          control={control}
          className="md:col-span-2"
          options={planSelectOptions}
          disabled={isPlansLoading}
          label={t(`${CERTIFICATES}.fields.cpdPlan`)}
          description={
            isPlansLoading
              ? t(`${CERTIFICATES}.fields.cpdPlanLoading`)
              : planOptions.length === 0
                ? t(`${CERTIFICATES}.fields.cpdPlanEmpty`)
                : t(`${CERTIFICATES}.fields.cpdPlanHint`)
          }
        />
      </div>

      <F.FormField
        name="files"
        control={control}
        render={() => (
          <F.FormItem className="space-y-3">
            <div
              role="group"
              aria-labelledby={EVIDENCE_LABEL_ID}
              className="space-y-3"
            >
              <p
                id={EVIDENCE_LABEL_ID}
                className="text-sm font-medium text-foreground/90"
              >
                {t(`${CERTIFICATES}.fields.evidence`)}
              </p>

              <ActivityEvidenceUpload
                t={t}
                files={files}
                isRemoving={isRemoving}
                onChange={onFilesChange}
                existingFiles={existingFiles}
                onRemoveExisting={onRemoveExisting}
                onDownloadExisting={onDownloadExisting}
              />
            </div>

            <F.FormMessage />
          </F.FormItem>
        )}
      />
    </div>
  );
};
