"use client";

import { TActivityStepOutcomeProps } from "@/types/professional-dashboard.types";
import { ActivityReviewSummary } from "@modules/ProfessionalDashboard/parts/activity-review-summary";
import { FloatingTextareaField } from "@elements/floating-textarea";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivityStepOutcome = ({
  t,
  files,
  values,
  control,
  onEditStep,
  existingFiles,
}: TActivityStepOutcomeProps) => (
  <div className="space-y-8">
    <div className="space-y-2">
      <FloatingTextareaField
        rows={5}
        name="learningOutcome"
        control={control}
        label={t(`${TRACKER}.fields.learningOutcome`)}
        placeholder={t(`${TRACKER}.fields.learningOutcomePlaceholder`)}
      />

      <p className="text-xs text-muted-foreground">
        {t(`${TRACKER}.fields.learningOutcomeHint`)}
      </p>
    </div>

    <div>
      <div className="mb-4">
        <h2 className="text-xl font-medium">{t(`${TRACKER}.review.title`)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${TRACKER}.review.subtitle`)}
        </p>
      </div>

      <ActivityReviewSummary
        t={t}
        files={files}
        values={values}
        onEditStep={onEditStep}
        existingFiles={existingFiles}
      />
    </div>
  </div>
);
