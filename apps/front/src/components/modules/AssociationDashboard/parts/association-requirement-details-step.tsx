"use client";

import { TAssociationRequirementDetailsStep } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { RequiredMark } from "@elements/required-mark";
import { useMemo, useState } from "react";
import { CreditType } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";
import * as F from "@ui/form";

const CYCLE_LENGTH_YEAR_OPTIONS = [2, 3, 4, 5];

/**
 * One labelled container whose choices share a row and wrap on narrow screens.
 *
 * `flex-wrap` rather than a fixed column count: the cycle list has five entries
 * and the audience list three, and a wrapped choice stays a full hit target
 * instead of being squeezed into an unreadable column.
 */
const CHOICE_ROW = "flex flex-wrap gap-2 rounded-md border p-3";

const CHOICE_BOX =
  "flex min-h-11 flex-1 basis-40 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 font-normal transition-colors hover:border-primary/40 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary";

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
    hasMoreMembers,
    setMemberSearch,
    loadMoreMembers,
    memberTotalCount,
    retryMemberPicker,
    isMemberPickerError,
    isMemberPickerLoading,
  } = hook;

  const [groupSearch, setGroupSearch] = useState("");

  const required = t("common.required");

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
            requiredText={required}
            control={detailsForm.control}
            label={t("associationDashboard.requirements.fields.name")}
          />

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <FloatingSelectField
              name="creditType"
              requiredText={required}
              options={creditTypeOptions}
              control={detailsForm.control}
              label={t("associationDashboard.requirements.fields.creditType")}
            />

            <FloatingInputField
              min={1}
              type="number"
              name="totalRequiredCredits"
              requiredText={required}
              control={detailsForm.control}
              label={t(
                "associationDashboard.requirements.fields.totalRequiredCredits",
              )}
              description={t(
                "associationDashboard.requirements.fields.totalRequiredCreditsHint",
              )}
            />
          </div>

          <div className="grid items-start gap-4 sm:grid-cols-2">
            <FloatingInputField
              type="date"
              name="deadline"
              requiredText={required}
              control={detailsForm.control}
              label={t("associationDashboard.requirements.fields.deadline")}
              description={t(
                "associationDashboard.requirements.fields.deadlineHint",
              )}
            />

            {isMultiYear && (
              <FloatingSelectField
                name="cycleLengthYears"
                requiredText={required}
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
          </div>

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
                  className={CHOICE_ROW}
                >
                  {cycleOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`cycle-${option.value}`}
                      className={CHOICE_BOX}
                    >
                      <RG.RadioGroupItem
                        value={option.value}
                        id={`cycle-${option.value}`}
                      />

                      {option.label}
                    </Label>
                  ))}
                </RG.RadioGroup>

                <F.FormMessage />
              </F.FormItem>
            )}
          />

          <F.FormField
            name="audienceKind"
            control={detailsForm.control}
            render={({ field }) => (
              <F.FormItem>
                <F.FormLabel>
                  {t("associationDashboard.requirements.fields.audience")}
                  <RequiredMark srText={required} />
                </F.FormLabel>

                <RG.RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className={CHOICE_ROW}
                >
                  {Object.values(AssociationAudienceKind).map((value) => (
                    <Label
                      key={value}
                      htmlFor={`audience-${value}`}
                      className={CHOICE_BOX}
                    >
                      <RG.RadioGroupItem
                        value={value}
                        id={`audience-${value}`}
                      />

                      {t(`associationDashboard.requirements.audience.${value}`)}
                    </Label>
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
                requiredText={required}
                hasError={Boolean(errors.groupIds)}
                describedById="requirement-group-picker-error"
                label={t("associationDashboard.requirements.fields.group")}
                selectedText={t(
                  "associationDashboard.requirements.fields.groupsSelected",
                  { count: groupIds.length },
                )}
                removeLabel={(name) =>
                  t("associationDashboard.requirements.fields.removeGroup", {
                    name,
                  })
                }
                noResultText={t(
                  "associationDashboard.requirements.fields.groupsEmpty",
                )}
                emptyText={t(
                  "associationDashboard.requirements.fields.groupsNoRoster",
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
                requiredText={required}
                hasError={Boolean(errors.memberIds)}
                hasQueryError={isMemberPickerError}
                onRetry={retryMemberPicker}
                hasMore={hasMoreMembers}
                onLoadMore={loadMoreMembers}
                describedById="requirement-member-picker-error"
                label={t("associationDashboard.requirements.fields.members")}
                loadingText={t(
                  "associationDashboard.requirements.fields.membersLoading",
                )}
                errorText={t(
                  "associationDashboard.requirements.fields.membersError",
                )}
                retryText={t("common.refresh")}
                noResultText={t(
                  "associationDashboard.requirements.fields.membersEmpty",
                )}
                loadMoreText={t(
                  "associationDashboard.requirements.fields.membersLoadMore",
                )}
                selectedText={t(
                  "associationDashboard.requirements.fields.membersSelected",
                  { count: memberIds.length },
                )}
                removeLabel={(name) =>
                  t("associationDashboard.requirements.fields.removeMember", {
                    name,
                  })
                }
                emptyText={t(
                  "associationDashboard.requirements.fields.membersNoRoster",
                )}
                countLabel={t(
                  "associationDashboard.requirements.fields.membersResults",
                  { count: memberTotalCount },
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
