"use client";

import { TAssociationRequirementRulesStep } from "@/types/association-dashboard.types";
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

          <FloatingInputField
            type="date"
            name="submissionOpensAt"
            control={reportingForm.control}
            label={t(
              "associationDashboard.requirements.rules.reporting.submissionOpens",
            )}
          />

          <FloatingInputField
            type="date"
            name="submissionClosesAt"
            control={reportingForm.control}
            label={t(
              "associationDashboard.requirements.rules.reporting.submissionCloses",
            )}
          />

          <FloatingInputField
            type="number"
            name="gracePeriodDays"
            control={reportingForm.control}
            label={t(
              "associationDashboard.requirements.rules.reporting.gracePeriod",
            )}
          />
        </div>

        <F.FormField
          name="allowLateSubmission"
          control={reportingForm.control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-2xl border border-glass-border p-4">
              <Label htmlFor="allow-late-submission" className="font-normal">
                {t(
                  "associationDashboard.requirements.rules.reporting.allowLate",
                )}
              </Label>

              <Switch
                id="allow-late-submission"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />

        <div className="space-y-3 rounded-2xl border border-glass-border p-4">
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
                  className="h-11 rounded-2xl"
                >
                  <S.SelectValue />
                </S.SelectTrigger>

                <S.SelectContent className="z-[9999] rounded-2xl">
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
          <Button radius="xl" type="submit" variant="brand" disabled={isSaving}>
            {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
            {t("associationDashboard.requirements.rules.save")}
          </Button>
        </div>
      </form>
    </F.Form>
  );
};
