"use client";

import { TAssociationRequirementDetailsStep } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { useMemo, useState } from "react";
import { CreditType } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";
import * as F from "@ui/form";

const CYCLE_LENGTH_YEAR_OPTIONS = [2, 3, 4, 5];

export const AssociationRequirementDetailsStep = ({
  hook,
}: TAssociationRequirementDetailsStep) => {
  const {
    t,
    detailsForm,
    groupOptions,
    memberSearch,
    memberOptions,
    submitDetails,
    setMemberSearch,
    isMemberPickerLoading,
  } = hook;

  const [groupSearch, setGroupSearch] = useState("");

  const cycle = detailsForm.watch("reportingCycle");
  const audienceKind = detailsForm.watch("audienceKind");
  const memberIds = detailsForm.watch("memberIds");
  const groupIds = detailsForm.watch("groupIds");
  const errors = detailsForm.formState.errors;

  const isMultiYear = cycle === AssociationReportingCycle.MultiYear;

  const creditTypeOptions = [CreditType.Cpd, CreditType.Pdu].map((value) => ({
    value,
    label: t(`associationDashboard.requirements.creditType.${value}`),
  }));

  const cycleLengthOptions = CYCLE_LENGTH_YEAR_OPTIONS.map((years) => ({
    value: String(years),
    label: t("associationDashboard.requirements.fields.cycleLengthOption", {
      count: years,
    }),
  }));

  const cycleOptions = Object.values(AssociationReportingCycle)
    .filter(
      (value) =>
        value !== AssociationReportingCycle.OneTime ||
        cycle === AssociationReportingCycle.OneTime,
    )
    .map((value) => ({
      value,
      label: t(`associationDashboard.requirements.cycle.${value}`),
    }));

  const filteredGroupOptions = useMemo(
    () =>
      groupOptions.filter((option) =>
        option.label.toLowerCase().includes(groupSearch.trim().toLowerCase()),
      ),
    [groupOptions, groupSearch],
  );

  const changeCycle = (value: string) => {
    detailsForm.setValue("reportingCycle", value as AssociationReportingCycle, {
      shouldValidate: true,
    });

    if (value !== AssociationReportingCycle.MultiYear)
      detailsForm.setValue("cycleLengthYears", "", { shouldValidate: true });
  };

  return (
    <GlassCard>
      <F.Form {...detailsForm}>
        <form
          noValidate
          onSubmit={submitDetails}
          className="relative z-10 space-y-6"
        >
          <div>
            <h2 className="text-xl font-medium">
              {t("associationDashboard.requirements.wizard.steps.details")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("associationDashboard.requirements.wizard.detailsBody")}
            </p>
          </div>

          <FloatingInputField
            name="name"
            control={detailsForm.control}
            label={t("associationDashboard.requirements.fields.name")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingSelectField
              name="creditType"
              options={creditTypeOptions}
              control={detailsForm.control}
              label={t("associationDashboard.requirements.fields.creditType")}
            />

            <FloatingInputField
              type="number"
              name="totalRequiredCredits"
              control={detailsForm.control}
              label={t(
                "associationDashboard.requirements.fields.totalRequiredCredits",
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingInputField
              type="date"
              name="deadline"
              control={detailsForm.control}
              label={t("associationDashboard.requirements.fields.deadline")}
              description={t(
                "associationDashboard.requirements.fields.deadlineHint",
              )}
            />

            <F.FormField
              name="reportingCycle"
              control={detailsForm.control}
              render={({ field }) => (
                <F.FormItem>
                  <F.FormLabel>
                    {t(
                      "associationDashboard.requirements.fields.reportingCycle",
                    )}
                  </F.FormLabel>

                  <RG.RadioGroup
                    value={field.value}
                    onValueChange={changeCycle}
                    className="gap-2 rounded-md border p-3"
                  >
                    {cycleOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-3"
                      >
                        <RG.RadioGroupItem
                          value={option.value}
                          id={`cycle-${option.value}`}
                        />

                        <Label
                          htmlFor={`cycle-${option.value}`}
                          className="font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RG.RadioGroup>

                  <F.FormMessage />
                </F.FormItem>
              )}
            />
          </div>

          {isMultiYear && (
            <FloatingSelectField
              name="cycleLengthYears"
              options={cycleLengthOptions}
              control={detailsForm.control}
              label={t(
                "associationDashboard.requirements.fields.cycleLengthYears",
              )}
              description={t(
                "associationDashboard.requirements.fields.cycleLengthHint",
              )}
            />
          )}

          <F.FormField
            name="audienceKind"
            control={detailsForm.control}
            render={({ field }) => (
              <F.FormItem>
                <F.FormLabel>
                  {t("associationDashboard.requirements.fields.audience")}
                </F.FormLabel>

                <RG.RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-2 rounded-md border p-3"
                >
                  {Object.values(AssociationAudienceKind).map((value) => (
                    <div key={value} className="flex items-center gap-3">
                      <RG.RadioGroupItem
                        value={value}
                        id={`audience-${value}`}
                      />

                      <Label
                        htmlFor={`audience-${value}`}
                        className="font-normal"
                      >
                        {t(
                          `associationDashboard.requirements.audience.${value}`,
                        )}
                      </Label>
                    </div>
                  ))}
                </RG.RadioGroup>

                <F.FormMessage />
              </F.FormItem>
            )}
          />

          {audienceKind === AssociationAudienceKind.Group && (
            <div>
              <AssociationRequirementMemberPicker
                search={groupSearch}
                options={filteredGroupOptions}
                selectedIds={groupIds}
                onSearch={setGroupSearch}
                isLoading={false}
                hasError={Boolean(errors.groupIds)}
                describedById="requirement-group-picker-error"
                label={t("associationDashboard.requirements.fields.group")}
                emptyText={t(
                  "associationDashboard.requirements.fields.groupsEmpty",
                )}
                countLabel={t(
                  "associationDashboard.requirements.fields.groupsResults",
                  { count: filteredGroupOptions.length },
                )}
                placeholder={t(
                  "associationDashboard.requirements.fields.groupPlaceholder",
                )}
                onChange={(ids) =>
                  detailsForm.setValue("groupIds", ids, {
                    shouldValidate: true,
                  })
                }
              />

              {errors.groupIds && (
                <p
                  role="alert"
                  id="requirement-group-picker-error"
                  className="mt-2 text-sm text-destructive"
                >
                  {t("associationDashboard.requirements.errors.groupsRequired")}
                </p>
              )}
            </div>
          )}

          {audienceKind === AssociationAudienceKind.SpecificMembers && (
            <div>
              <AssociationRequirementMemberPicker
                search={memberSearch}
                options={memberOptions}
                selectedIds={memberIds}
                onSearch={setMemberSearch}
                isLoading={isMemberPickerLoading}
                hasError={Boolean(errors.memberIds)}
                describedById="requirement-member-picker-error"
                label={t("associationDashboard.requirements.fields.members")}
                emptyText={t(
                  "associationDashboard.requirements.fields.membersEmpty",
                )}
                countLabel={t(
                  "associationDashboard.requirements.fields.membersResults",
                  { count: memberOptions.length },
                )}
                placeholder={t(
                  "associationDashboard.requirements.fields.membersPlaceholder",
                )}
                onChange={(ids) =>
                  detailsForm.setValue("memberIds", ids, {
                    shouldValidate: true,
                  })
                }
              />

              {errors.memberIds && (
                <p
                  role="alert"
                  id="requirement-member-picker-error"
                  className="mt-2 text-sm text-destructive"
                >
                  {t(
                    "associationDashboard.requirements.errors.membersRequired",
                  )}
                </p>
              )}
            </div>
          )}
        </form>
      </F.Form>
    </GlassCard>
  );
};
