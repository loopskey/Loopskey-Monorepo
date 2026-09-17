"use client";

import { TAssociationMemberAssignPickerDialog } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { useMemo, useState } from "react";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as S from "@ui/select";
import * as RG from "@ui/radio-group";
import * as D from "@ui/dialog";
import * as L from "lucide-react";

export const AssociationMemberAssignPickerDialog = ({
  hook,
}: TAssociationMemberAssignPickerDialog) => {
  const {
    t,
    groupOptions,
    closeAssignPicker,
    assignPickerSearch,
    isAssignPickerOpen,
    assignPickerOptions,
    requirementOptions,
    setAssignPickerSearch,
    isAssignPickerLoading,
    assignRequirementId,
    setAssignRequirementId,
    assignAudienceKind,
    setAssignAudienceKind,
    assignGroupIds,
    setAssignGroupIds,
    assignMemberIds,
    setAssignMemberIds,
    submitAssignRequirement,
    isAssigningRequirement,
  } = hook;

  const [groupSearch, setGroupSearch] = useState("");

  const filteredGroupOptions = useMemo(
    () =>
      groupOptions.filter((option) =>
        option.label.toLowerCase().includes(groupSearch.trim().toLowerCase()),
      ),
    [groupOptions, groupSearch],
  );

  const canSubmit =
    Boolean(assignRequirementId) &&
    (assignAudienceKind === AssociationAudienceKind.AllMembers ||
      (assignAudienceKind === AssociationAudienceKind.Group &&
        assignGroupIds.length > 0) ||
      (assignAudienceKind === AssociationAudienceKind.SpecificMembers &&
        assignMemberIds.length > 0));

  return (
    <D.Dialog
      open={isAssignPickerOpen}
      onOpenChange={(open) => (open ? undefined : closeAssignPicker())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.members.assignPicker.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.members.assignPicker.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assign-requirement-select">
              {t("associationDashboard.members.assignPicker.requirementLabel")}
            </Label>

            <S.Select
              value={assignRequirementId ?? undefined}
              onValueChange={setAssignRequirementId}
            >
              <S.SelectTrigger
                id="assign-requirement-select"
                className="h-11 rounded-md"
              >
                <S.SelectValue
                  placeholder={t(
                    "associationDashboard.members.assignPicker.requirementPlaceholder",
                  )}
                />
              </S.SelectTrigger>

              <S.SelectContent className="z-[9999] rounded-md">
                {requirementOptions.map((option) => (
                  <S.SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </S.SelectItem>
                ))}
              </S.SelectContent>
            </S.Select>
          </div>

          <div className="space-y-2">
            <Label>
              {t("associationDashboard.members.assignPicker.audienceLabel")}
            </Label>

            <RG.RadioGroup
              value={assignAudienceKind}
              onValueChange={(value) =>
                setAssignAudienceKind(value as AssociationAudienceKind)
              }
              className="gap-2 rounded-md border p-3"
            >
              {Object.values(AssociationAudienceKind).map((value) => (
                <div key={value} className="flex items-center gap-3">
                  <RG.RadioGroupItem
                    value={value}
                    id={`member-assign-audience-${value}`}
                  />

                  <Label
                    htmlFor={`member-assign-audience-${value}`}
                    className="font-normal"
                  >
                    {t(`associationDashboard.requirements.audience.${value}`)}
                  </Label>
                </div>
              ))}
            </RG.RadioGroup>
          </div>

          {assignAudienceKind === AssociationAudienceKind.Group && (
            <AssociationRequirementMemberPicker
              search={groupSearch}
              options={filteredGroupOptions}
              selectedIds={assignGroupIds}
              onSearch={setGroupSearch}
              isLoading={false}
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
              onChange={setAssignGroupIds}
            />
          )}

          {assignAudienceKind === AssociationAudienceKind.SpecificMembers && (
            <AssociationRequirementMemberPicker
              search={assignPickerSearch}
              options={assignPickerOptions}
              selectedIds={assignMemberIds}
              onSearch={setAssignPickerSearch}
              isLoading={isAssignPickerLoading}
              label={t("associationDashboard.requirements.fields.members")}
              emptyText={t(
                "associationDashboard.requirements.fields.membersEmpty",
              )}
              countLabel={t(
                "associationDashboard.requirements.fields.membersResults",
                { count: assignPickerOptions.length },
              )}
              placeholder={t(
                "associationDashboard.requirements.fields.membersPlaceholder",
              )}
              onChange={setAssignMemberIds}
            />
          )}
        </div>

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            disabled={isAssigningRequirement}
            onClick={closeAssignPicker}
          >
            {t("associationDashboard.members.assignPicker.cancel")}
          </Button>

          <Button
            radius="xl"
            type="button"
            disabled={!canSubmit || isAssigningRequirement}
            onClick={() => void submitAssignRequirement()}
          >
            {isAssigningRequirement && (
              <L.Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t("associationDashboard.members.assignPicker.submit")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
