"use client";

import { useProfessionalTargetForm } from "@/hooks/useProfessionalTargetForm";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { TTargetForm } from "@/types/professional-dashboard.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as C from "@/utils/pdu.constant";
import * as L from "lucide-react";

const TRACKER = "professionalDashboard.cpdPduTracker";

export const TargetForm = ({
  year,
  isOpen,
  isLoading,
  onCancel,
  onSubmit,
}: TTargetForm) => {
  const { t } = useI18n();

  const { form, submitHandler, existingTarget, isLoadingTargets } =
    useProfessionalTargetForm({ year, isOpen, onSubmit });

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={submitHandler} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <FloatingInputField
            type="number"
            name="year"
            control={form.control}
            min={C.PDU_REPORTING_YEAR_MIN}
            max={C.PDU_REPORTING_YEAR_MAX}
            label={t(`${TRACKER}.targetsDialog.year`)}
            leftIcon={<L.CalendarRange className="h-4 w-4" />}
          />

          <FloatingSelectField
            name="category"
            control={form.control}
            label={t(`${TRACKER}.targetsDialog.category`)}
            options={C.PDU_CATEGORIES.map((category) => ({
              value: category,
              label: t(`${TRACKER}.categories.${category}`),
            }))}
          />

          <FloatingInputField
            min={0}
            step="0.5"
            type="number"
            name="target"
            control={form.control}
            className="md:col-span-2"
            leftIcon={<L.Target className="h-4 w-4" />}
            label={t(`${TRACKER}.targetsDialog.target`)}
            description={
              isLoadingTargets
                ? t(`${TRACKER}.targetsDialog.loadingExisting`)
                : existingTarget
                  ? t(`${TRACKER}.targetsDialog.existingHint`, {
                      target: Number(existingTarget.target).toFixed(1),
                    })
                  : t(`${TRACKER}.targetsDialog.newHint`)
            }
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {t(`${TRACKER}.targetsDialog.cancel`)}
          </Button>

          <Button
            radius="xl"
            type="submit"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={isLoading || isLoadingTargets}
          >
            {isLoading && <L.Loader2 className="h-4 w-4 animate-spin" />}
            {t(`${TRACKER}.targetsDialog.save`)}
          </Button>
        </div>
      </form>
    </Form>
  );
};
