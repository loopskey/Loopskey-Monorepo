"use client";

import { useCpdReportRecipientsQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { CPD_REMINDER_TIMINGS } from "@/utils/cpd-plan.constant";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { CPD_EVIDENCE_TYPES } from "@/utils/cpd-plan.constant";
import { TCpdStepProps } from "@/types/cpd-plan.types";
import { useEffect } from "react";
import { Checkbox } from "@ui/checkbox";
import { Switch } from "@ui/switch";
import { cn } from "@/lib/utils";

import * as GQL from "@/lib/graphql/generated";
import * as L from "lucide-react";

export const CpdStepEvidence = ({ t, form, control }: TCpdStepProps) => {
  const { data: recipients = [] } = useCpdReportRecipientsQuery();

  const evidenceTypes = form.watch("evidenceTypes");
  const remindersEnabled = form.watch("remindersEnabled");
  const recipientType = form.watch("reportRecipientType");
  const includesOther = evidenceTypes.includes(GQL.CpdEvidenceType.Other);
  const isOtherRecipient = recipientType === GQL.CpdReportRecipientType.Other;

  const evidenceError = form.formState.errors.evidenceTypes as
    | { message?: string }
    | undefined;

  const toggleEvidence = (value: GQL.CpdEvidenceType) => {
    const set = new Set(evidenceTypes);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    form.setValue("evidenceTypes", Array.from(set), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    if (isOtherRecipient) return;
    const match = recipients.find((option) => option.type === recipientType);
    form.setValue("reportRecipientLabel", match?.label ?? "", {
      shouldDirty: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientType, recipients.length]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {t("cpdProgress.setup.step4.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("cpdProgress.setup.step4.description")}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">
          {t("cpdProgress.setup.fields.evidenceRequired")}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {CPD_EVIDENCE_TYPES.map((value) => {
            const checked = evidenceTypes.includes(value);
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-glass-border bg-background/40 hover:border-primary/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleEvidence(value)}
                  aria-label={t(`cpdProgress.evidence.${value}`)}
                />
                <span className="text-sm font-medium">
                  {t(`cpdProgress.evidence.${value}`)}
                </span>
              </label>
            );
          })}
        </div>
        {evidenceError?.message && (
          <p className="text-sm font-medium text-destructive">
            {t(evidenceError.message)}
          </p>
        )}
      </fieldset>

      {includesOther && (
        <FloatingInputField
          control={control}
          name="evidenceOtherNote"
          leftIcon={<L.FileText className="h-4 w-4" />}
          label={t("cpdProgress.setup.fields.evidenceOtherNote")}
        />
      )}

      <FloatingSelectField
        control={control}
        name="reportRecipientType"
        label={t("cpdProgress.setup.fields.reportRecipient")}
        placeholder={t("cpdProgress.setup.fields.reportRecipientPlaceholder")}
        options={recipients.map((option) => ({
          value: option.type,
          label: option.label,
        }))}
      />

      {isOtherRecipient && (
        <FloatingInputField
          control={control}
          name="reportRecipientLabel"
          leftIcon={<L.AtSign className="h-4 w-4" />}
          label={t("cpdProgress.setup.fields.reportRecipientLabel")}
        />
      )}

      <div className="space-y-4 rounded-2xl border border-glass-border bg-background/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              {t("cpdProgress.setup.fields.deadlineReminders")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("cpdProgress.setup.fields.deadlineRemindersHint")}
            </p>
          </div>
          <Switch
            checked={remindersEnabled}
            aria-label={t("cpdProgress.setup.fields.deadlineReminders")}
            onCheckedChange={(checked) => {
              form.setValue("remindersEnabled", checked, { shouldDirty: true });
              if (!checked)
                form.setValue("reminderTiming", null, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
            }}
          />
        </div>

        {remindersEnabled && (
          <FloatingSelectField
            name="reminderTiming"
            control={control}
            label={t("cpdProgress.setup.fields.reminderTiming")}
            placeholder={t(
              "cpdProgress.setup.fields.reminderTimingPlaceholder",
            )}
            options={CPD_REMINDER_TIMINGS.map((value) => ({
              value,
              label: t(`cpdProgress.reminder.${value}`),
            }))}
          />
        )}
      </div>
    </div>
  );
};
