"use client";

import { ASSOCIATION_GRACE_PERIOD_OPTIONS } from "@loopskey/api-contracts/validation";
import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
import { AssociationLateSubmissionPolicy } from "@/lib/graphql/base";
import { AssociationSubmissionWindow } from "@/lib/graphql/base";
import { AssociationRenewalCondition } from "@/lib/graphql/base";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { CpdReminderTiming } from "@/lib/graphql/base";
import { useState } from "react";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as S from "@ui/select";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationRequirementReportingCard = ({
  hook,
}: TAssociationRequirementRulesStep) => {
  const {
    t,
    isSaving,
    requirement,
    reportingForm,
    submitReporting,
    submitReminders,
  } = hook;

  const submissionWindowOptions = Object.values(AssociationSubmissionWindow).map(
    (value) => ({
      value,
      label: t(`associationDashboard.requirements.submissionWindow.${value}`),
    }),
  );

  const gracePeriodOptions = ASSOCIATION_GRACE_PERIOD_OPTIONS.map((days) => ({
    value: String(days),
    label: t(`associationDashboard.requirements.gracePeriod.${days}`),
  }));

  const lateSubmissionPolicyOptions = Object.values(
    AssociationLateSubmissionPolicy,
  ).map((value) => ({
    value,
    label: t(
      `associationDashboard.requirements.lateSubmissionPolicy.${value}`,
    ),
  }));

  const renewalConditionOptions = Object.values(
    AssociationRenewalCondition,
  ).map((value) => ({
    value,
    label: t(`associationDashboard.requirements.renewalCondition.${value}`),
  }));

  const [remindersEnabled, setRemindersEnabled] = useState(
    requirement?.remindersEnabled ?? false,
  );
  const [reminderTiming, setReminderTiming] = useState<CpdReminderTiming>(
    requirement?.reminderTiming ?? CpdReminderTiming.Days_30,
  );

  const save = async () => {
    await submitReporting();
    await submitReminders(remindersEnabled, reminderTiming);
  };

  return (
    <F.Form {...reportingForm}>
      <form
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FloatingInputField
            type="date"
            name="reportingStart"
            control={reportingForm.control}
            label={t(
              "associationDashboard.requirements.rules.reporting.periodStart",
            )}
          />

          <FloatingInputField
            type="date"
            name="reportingEnd"
            control={reportingForm.control}
            label={t(
              "associationDashboard.requirements.rules.reporting.periodEnd",
            )}
          />

          <FloatingSelectField
            name="submissionWindow"
            control={reportingForm.control}
            options={submissionWindowOptions}
            label={t(
              "associationDashboard.requirements.rules.reporting.submissionWindow",
            )}
          />

          <FloatingSelectField
            name="gracePeriodDays"
            control={reportingForm.control}
            options={gracePeriodOptions}
            label={t(
              "associationDashboard.requirements.rules.reporting.gracePeriod",
            )}
          />

          <FloatingSelectField
            name="lateSubmissionPolicy"
            control={reportingForm.control}
            options={lateSubmissionPolicyOptions}
            label={t(
              "associationDashboard.requirements.rules.reporting.lateSubmissionPolicy",
            )}
          />

          <FloatingSelectField
            name="renewalCondition"
            control={reportingForm.control}
            options={renewalConditionOptions}
            label={t(
              "associationDashboard.requirements.rules.reporting.renewalCondition",
            )}
          />
        </div>

        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminders-enabled" className="font-normal">
              {t("associationDashboard.requirements.rules.reporting.reminders")}
            </Label>

            <Switch
              id="reminders-enabled"
              checked={remindersEnabled}
              onCheckedChange={setRemindersEnabled}
            />
          </div>

          {remindersEnabled && (
            <div className="space-y-1.5">
              <Label htmlFor="reminder-timing">
                {t(
                  "associationDashboard.requirements.rules.reporting.reminderTiming",
                )}
              </Label>

              <S.Select
                value={reminderTiming}
                onValueChange={(value) =>
                  setReminderTiming(value as CpdReminderTiming)
                }
              >
                <S.SelectTrigger
                  id="reminder-timing"
                  className="h-11 rounded-md"
                >
                  <S.SelectValue />
                </S.SelectTrigger>

                <S.SelectContent className="z-[9999] rounded-md">
                  {Object.values(CpdReminderTiming).map((value) => (
                    <S.SelectItem key={value} value={value}>
                      {t(
                        `associationDashboard.requirements.reminderTiming.${value}`,
                      )}
                    </S.SelectItem>
                  ))}
                </S.SelectContent>
              </S.Select>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button radius="xl" type="submit" disabled={isSaving}>
            {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
            {t("associationDashboard.requirements.rules.save")}
          </Button>
        </div>
      </form>
    </F.Form>
  );
};
