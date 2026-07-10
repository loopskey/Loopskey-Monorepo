"use client";

import { TActivityReviewSummaryProps } from "@/types/professional-dashboard.types";
import { formatFileSize } from "@/utils/pdu.constant";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

const EMPTY = "—";

const ReviewSection = ({
  title,
  step,
  rows,
  onEditStep,
  editLabel,
}: {
  step: number;
  title: string;
  editLabel: string;
  onEditStep: (step: number) => void;
  rows: { label: string; value: string }[];
}) => (
  <div className="rounded-[1.5rem] border border-glass-border bg-background/40 p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-medium">{title}</h3>
      <Button
        size="sm"
        radius="xl"
        type="button"
        variant="glass"
        onClick={() => onEditStep(step)}
      >
        <L.Pencil className="h-3.5 w-3.5" />
        {editLabel}
      </Button>
    </div>

    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-xs text-muted-foreground">{row.label}</dt>
          <dd className="mt-0.5 break-words text-sm">{row.value || EMPTY}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export const ActivityReviewSummary = ({
  t,
  files,
  values,
  onEditStep,
  existingFiles,
}: TActivityReviewSummaryProps) => {
  const editLabel = t("common.edit");
  const fileSummary = [
    ...existingFiles.map(
      (file) => `${file.fileName} (${formatFileSize(file.sizeBytes)})`,
    ),
    ...files.map((file) => `${file.name} (${formatFileSize(file.size)})`),
  ];

  return (
    <div className="space-y-4">
      <ReviewSection
        step={1}
        editLabel={editLabel}
        onEditStep={onEditStep}
        title={t(`${TRACKER}.addActivity.steps.1.title`)}
        rows={[
          { label: t(`${TRACKER}.fields.title`), value: values.title },
          {
            label: t(`${TRACKER}.fields.activityType`),
            value: t(`${TRACKER}.activityTypes.${values.activityType}`),
          },
          {
            label: t(`${TRACKER}.fields.dateCompleted`),
            value: values.dateCompleted
              ? new Date(values.dateCompleted).toLocaleDateString()
              : "",
          },
          {
            label: t(`${TRACKER}.fields.providerOrganizer`),
            value: values.providerOrganizer,
          },
        ]}
      />

      <ReviewSection
        step={2}
        onEditStep={onEditStep}
        editLabel={editLabel}
        title={t(`${TRACKER}.addActivity.steps.2.title`)}
        rows={[
          {
            label: t(`${TRACKER}.fields.creditType`),
            value: t(`${TRACKER}.creditTypes.${values.creditType}`),
          },
          {
            label: t(`${TRACKER}.fields.creditValue`),
            value: String(values.creditValue ?? ""),
          },
          {
            label: t(`${TRACKER}.fields.category`),
            value: t(`${TRACKER}.categories.${values.category}`),
          },
          {
            label: t(`${TRACKER}.fields.subCategory`),
            value: values.subCategory ?? "",
          },
          {
            label: t(`${TRACKER}.fields.reportingYear`),
            value: String(values.reportingYear ?? ""),
          },
          {
            label: t(`${TRACKER}.fields.issuingOrganization`),
            value: values.issuingOrganization ?? "",
          },
          {
            label: t(`${TRACKER}.fields.relatedCertification`),
            value: values.relatedCertification ?? "",
          },
          {
            label: t(`${TRACKER}.fields.description`),
            value: values.description ?? "",
          },
        ]}
      />

      <ReviewSection
        step={3}
        onEditStep={onEditStep}
        editLabel={editLabel}
        title={t(`${TRACKER}.addActivity.steps.3.title`)}
        rows={[
          {
            label: t(`${TRACKER}.review.files`),
            value: fileSummary.length
              ? fileSummary.join(", ")
              : t(`${TRACKER}.table.noFile`),
          },
          {
            label: t(`${TRACKER}.fields.evidenceNote`),
            value: values.evidenceNote ?? "",
          },
        ]}
      />
    </div>
  );
};
