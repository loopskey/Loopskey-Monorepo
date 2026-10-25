"use client";

import { TAssociationRequirementCycleField } from "@/types/association-dashboard.types";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { RequiredMark } from "@elements/required-mark";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";
import * as L from "lucide-react";
import * as F from "@ui/form";

const CYCLE_LENGTH_YEAR_OPTIONS = [2, 3, 4, 5];

const CYCLE_ICON: Record<AssociationReportingCycle, L.LucideIcon> = {
  [AssociationReportingCycle.OneTime]: L.CalendarCheck,
  [AssociationReportingCycle.Annual]: L.CalendarDays,
  [AssociationReportingCycle.MultiYear]: L.CalendarRange,
};

const CYCLE_CARD =
  "group flex min-h-11 cursor-pointer items-center gap-3.5 rounded-lg border bg-background p-4 font-normal leading-snug transition-colors hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary";

const CYCLE_ICON_TILE =
  "flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary transition-colors group-has-[[data-state=checked]]:bg-primary group-has-[[data-state=checked]]:text-primary-foreground";

const LENGTH_SEGMENT =
  "flex h-10 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-md px-1 text-sm font-medium tabular-nums transition-colors hover:bg-muted has-[[data-state=checked]]:bg-primary has-[[data-state=checked]]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2";

const HIDDEN_RADIO =
  "pointer-events-none absolute size-px aspect-auto border-0 opacity-0 shadow-none";

export const AssociationRequirementCycleField = ({
  hook,
}: TAssociationRequirementCycleField) => {
  const { t, detailsForm } = hook;

  const required = t("common.required");

  const cycle = detailsForm.watch("reportingCycle");
  const years = detailsForm.watch("cycleLengthYears");
  const isMultiYear = cycle === AssociationReportingCycle.MultiYear;

  const cycleOptions = Object.values(AssociationReportingCycle).filter(
    (value) =>
      value !== AssociationReportingCycle.OneTime ||
      cycle === AssociationReportingCycle.OneTime,
  );

  const changeCycle = (value: string) => {
    detailsForm.setValue("reportingCycle", value as AssociationReportingCycle, {
      shouldValidate: true,
    });

    if (value !== AssociationReportingCycle.MultiYear)
      detailsForm.setValue("cycleLengthYears", "", { shouldValidate: true });
  };

  const summaryKey =
    isMultiYear && !years ? "MULTI_YEAR_PENDING" : (cycle ?? "ANNUAL");

  return (
    <div className="space-y-3">
      <F.FormField
        name="reportingCycle"
        control={detailsForm.control}
        render={({ field }) => (
          <F.FormItem>
            <F.FormLabel>
              {t("associationDashboard.requirements.fields.reportingCycle")}
              <RequiredMark srText={required} />
            </F.FormLabel>

            <RG.RadioGroup
              value={field.value}
              onValueChange={changeCycle}
              className="grid gap-3 sm:grid-cols-2"
              aria-label={t(
                "associationDashboard.requirements.fields.reportingCycle",
              )}
            >
              {cycleOptions.map((value) => {
                const Icon = CYCLE_ICON[value];

                return (
                  <Label
                    key={value}
                    htmlFor={`cycle-${value}`}
                    className={CYCLE_CARD}
                  >
                    <span aria-hidden className={CYCLE_ICON_TILE}>
                      <Icon className="size-5" />
                    </span>

                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="block font-semibold text-foreground">
                        {t(`associationDashboard.requirements.cycle.${value}`)}
                      </span>

                      <span className="block text-sm text-muted-foreground">
                        {t(
                          `associationDashboard.requirements.cycleHint.${value}`,
                          {
                            min: Math.min(...CYCLE_LENGTH_YEAR_OPTIONS),
                            max: Math.max(...CYCLE_LENGTH_YEAR_OPTIONS),
                          },
                        )}
                      </span>
                    </span>

                    <RG.RadioGroupItem value={value} id={`cycle-${value}`} />
                  </Label>
                );
              })}
            </RG.RadioGroup>

            <F.FormMessage />
          </F.FormItem>
        )}
      />

      {isMultiYear && (
        <F.FormField
          name="cycleLengthYears"
          control={detailsForm.control}
          render={({ field }) => (
            <F.FormItem className="space-y-2.5 rounded-lg bg-muted p-4 duration-200 animate-in fade-in slide-in-from-top-1 motion-reduce:animate-none">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <F.FormLabel>
                  {t(
                    "associationDashboard.requirements.fields.cycleLengthYears",
                  )}
                  <RequiredMark srText={required} />
                </F.FormLabel>

                <span className="text-xs text-muted-foreground">
                  {t(
                    "associationDashboard.requirements.fields.cycleLengthHint",
                  )}
                </span>
              </div>

              <RG.RadioGroup
                value={String(field.value ?? "")}
                onValueChange={field.onChange}
                className="flex gap-1 rounded-lg border bg-background p-1"
                aria-label={t(
                  "associationDashboard.requirements.fields.cycleLengthYears",
                )}
              >
                {CYCLE_LENGTH_YEAR_OPTIONS.map((option, index) => (
                  <Label
                    key={option}
                    htmlFor={`cycle-length-${option}`}
                    className={LENGTH_SEGMENT}
                  >
                    <RG.RadioGroupItem
                      value={String(option)}
                      id={`cycle-length-${option}`}
                      className={HIDDEN_RADIO}
                      ref={index === 0 ? field.ref : undefined}
                    />

                    {t(
                      "associationDashboard.requirements.fields.cycleLengthOption",
                      { count: option },
                    )}
                  </Label>
                ))}
              </RG.RadioGroup>

              <F.FormMessage />
            </F.FormItem>
          )}
        />
      )}

      <p
        aria-live="polite"
        className="flex items-start gap-2 text-sm text-muted-foreground"
      >
        <L.RefreshCw aria-hidden className="mt-0.5 size-4 shrink-0" />

        {t(`associationDashboard.requirements.cycleSummary.${summaryKey}`, {
          count: Number(years),
        })}
      </p>
    </div>
  );
};
