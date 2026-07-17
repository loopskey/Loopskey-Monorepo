"use client";

import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { MultiSelectField } from "@elements/multi-select-field";
import { TCpdStepProps } from "@/types/cpd-plan.types";

import * as C from "@/utils/cpd-plan.constant";
import * as L from "lucide-react";
import { CPD_TIME_COMMITMENTS } from "@/utils/cpd-plan.constant";

export const CpdStepReporting = ({ t, control }: TCpdStepProps) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-lg font-medium">
        {t("cpdProgress.setup.step2.title")}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t("cpdProgress.setup.step2.description")}
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <FloatingInputField
        type="date"
        control={control}
        name="reportingStart"
        leftIcon={<L.CalendarDays className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.reportingStart")}
      />

      <FloatingInputField
        type="date"
        control={control}
        name="reportingEnd"
        leftIcon={<L.CalendarCheck className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.reportingEnd")}
      />

      <FloatingSelectField
        name="creditType"
        control={control}
        label={t("cpdProgress.setup.fields.creditType")}
        options={C.CPD_CREDIT_TYPES.map((type) => ({
          value: type,
          label: t(`cpdProgress.creditTypes.${type}`),
        }))}
      />

      <FloatingInputField
        min={0}
        step="0.5"
        type="number"
        control={control}
        name="totalRequiredCredits"
        leftIcon={<L.Target className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.totalRequired")}
      />

      <FloatingInputField
        min={0}
        step="0.5"
        type="number"
        control={control}
        name="initialCompletedCredits"
        leftIcon={<L.History className="h-4 w-4" />}
        label={t("cpdProgress.setup.fields.initialCompleted")}
        description={t("cpdProgress.setup.fields.initialCompletedHint")}
      />

      <FloatingSelectField
        name="timeAvailable"
        control={control}
        label={t("cpdProgress.setup.fields.timeAvailable")}
        placeholder={t("cpdProgress.setup.fields.timeAvailablePlaceholder")}
        options={CPD_TIME_COMMITMENTS.map((value) => ({
          value,
          label: t(`cpdProgress.time.${value}`),
        }))}
      />

      <MultiSelectField
        name="preferredFormats"
        control={control}
        className="md:col-span-2"
        removeLabel={t("cpdProgress.common.remove")}
        loadingText={t("cpdProgress.common.loading")}
        emptyText={t("cpdProgress.setup.fields.noFormats")}
        label={t("cpdProgress.setup.fields.preferredFormats")}
        searchPlaceholder={t("cpdProgress.setup.fields.searchFormats")}
        placeholder={t("cpdProgress.setup.fields.preferredFormatsPlaceholder")}
        items={C.CPD_LEARNING_FORMATS.map((value) => ({
          value,
          label: t(`cpdProgress.formats.${value}`),
        }))}
      />
    </div>
  </div>
);
