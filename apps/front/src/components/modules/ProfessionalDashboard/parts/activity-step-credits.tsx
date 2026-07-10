"use client";

import { TActivityStepCreditsProps } from "@/types/professional-dashboard.types";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";

import * as C from "@/utils/pdu.constant";
import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const ActivityStepCredits = ({
  t,
  control,
  subCategoryOptions,
  onReportingYearTouched,
}: TActivityStepCreditsProps) => (
  <div className="grid gap-5 md:grid-cols-2">
    <FloatingSelectField
      name="creditType"
      control={control}
      label={t(`${TRACKER}.fields.creditType`)}
      options={C.CREDIT_TYPES.map((type) => ({
        value: type,
        label: t(`${TRACKER}.creditTypes.${type}`),
      }))}
    />

    <FloatingInputField
      min={0}
      step="0.5"
      type="number"
      name="creditValue"
      control={control}
      leftIcon={<L.Hash className="h-4 w-4" />}
      label={t(`${TRACKER}.fields.creditValue`)}
      description={t(`${TRACKER}.fields.creditValueHint`)}
    />

    <FloatingSelectField
      name="category"
      control={control}
      label={t(`${TRACKER}.fields.category`)}
      options={C.PDU_CATEGORIES.map((category) => ({
        value: category,
        label: t(`${TRACKER}.categories.${category}`),
      }))}
    />

    <FloatingSelectField
      name="subCategory"
      control={control}
      disabled={subCategoryOptions.length === 0}
      label={t(`${TRACKER}.fields.subCategory`)}
      placeholder={t(`${TRACKER}.fields.subCategoryPlaceholder`)}
      options={subCategoryOptions.map((option) => ({
        value: option,
        label: option,
      }))}
    />

    <div onChangeCapture={onReportingYearTouched}>
      <FloatingInputField
        type="number"
        control={control}
        name="reportingYear"
        min={C.PDU_REPORTING_YEAR_MIN}
        max={C.PDU_REPORTING_YEAR_MAX}
        label={t(`${TRACKER}.fields.reportingYear`)}
        leftIcon={<L.CalendarRange className="h-4 w-4" />}
        description={t(`${TRACKER}.fields.reportingYearHint`)}
      />
    </div>

    <FloatingInputField
      control={control}
      name="issuingOrganization"
      leftIcon={<L.Landmark className="h-4 w-4" />}
      label={t(`${TRACKER}.fields.issuingOrganization`)}
    />

    <FloatingInputField
      control={control}
      className="md:col-span-2"
      name="relatedCertification"
      leftIcon={<L.BadgeCheck className="h-4 w-4" />}
      label={t(`${TRACKER}.fields.relatedCertification`)}
    />

    <FloatingTextareaField
      rows={4}
      name="description"
      control={control}
      className="md:col-span-2"
      label={t(`${TRACKER}.fields.description`)}
    />
  </div>
);
