"use client";

import { TAssociationLearningStepAssignment } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";

export const AssociationLearningStepAssignment = ({
  hook,
}: TAssociationLearningStepAssignment) => {
  const {
    t,
    form,
    groupOptions,
    assignSearch,
    setAssignSearch,
    assignMemberOptions,
    isAssignPickerLoading,
  } = hook;

  const label = (key: string) =>
    t(`associationDashboard.learningContent.assignment.${key}`);

  const audienceKind = form.watch("audienceKind");
  const groupIds = form.watch("groupIds");
  const memberIds = form.watch("memberIds");
  const errors = form.formState.errors;

  const toggleGroup = (groupId: string) =>
    form.setValue(
      "groupIds",
      groupIds.includes(groupId)
        ? groupIds.filter((id) => id !== groupId)
        : [...groupIds, groupId],
      { shouldValidate: true },
    );

  return (
    <div className="space-y-4">
      <RG.RadioGroup
        value={audienceKind}
        onValueChange={(value) =>
          form.setValue("audienceKind", value as AssociationAudienceKind, {
            shouldValidate: true,
          })
        }
        className="gap-2 rounded-md border p-3"
      >
        {Object.values(AssociationAudienceKind).map((value) => (
          <div key={value} className="flex items-center gap-3">
            <RG.RadioGroupItem value={value} id={`learning-audience-${value}`} />

            <Label htmlFor={`learning-audience-${value}`} className="font-normal">
              {t(`associationDashboard.requirements.audience.${value}`)}
            </Label>
          </div>
        ))}
      </RG.RadioGroup>

      {audienceKind === AssociationAudienceKind.Group && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{label("groups")}</p>

          {groupOptions.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              {label("noGroups")}
            </p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-1">
              {groupOptions.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={groupIds.includes(option.value)}
                      onChange={() => toggleGroup(option.value)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {errors.groupIds && (
            <p className="text-sm text-destructive">{label("groupsRequired")}</p>
          )}
        </div>
      )}

      {audienceKind === AssociationAudienceKind.SpecificMembers && (
        <AssociationRequirementMemberPicker
          search={assignSearch}
          options={assignMemberOptions}
          selectedIds={memberIds}
          onSearch={setAssignSearch}
          isLoading={isAssignPickerLoading}
          label={label("members")}
          emptyText={label("membersEmpty")}
          countLabel={t("associationDashboard.learningContent.assignment.membersResults", {
            count: assignMemberOptions.length,
          })}
          placeholder={label("membersPlaceholder")}
          hasError={Boolean(errors.memberIds)}
          onChange={(ids) =>
            form.setValue("memberIds", ids, { shouldValidate: true })
          }
        />
      )}
    </div>
  );
};
