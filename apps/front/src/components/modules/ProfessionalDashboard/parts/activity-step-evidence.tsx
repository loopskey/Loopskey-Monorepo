"use client";

import { TActivityStepEvidenceProps } from "@/types/professional-dashboard.types";
import { ActivityEvidenceUpload } from "@modules/ProfessionalDashboard/parts/activity-evidence-upload";
import { FloatingTextareaField } from "@elements/floating-textarea";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivityStepEvidence = ({
  t,
  files,
  control,
  isRemoving,
  existingFiles,
  onFilesChange,
  onRemoveExisting,
  onDownloadExisting,
}: TActivityStepEvidenceProps) => (
  <div className="space-y-6">
    <ActivityEvidenceUpload
      t={t}
      files={files}
      isRemoving={isRemoving}
      onChange={onFilesChange}
      existingFiles={existingFiles}
      onRemoveExisting={onRemoveExisting}
      onDownloadExisting={onDownloadExisting}
    />

    <FloatingTextareaField
      rows={4}
      control={control}
      name="evidenceNote"
      label={t(`${TRACKER}.fields.evidenceNote`)}
    />
  </div>
);
