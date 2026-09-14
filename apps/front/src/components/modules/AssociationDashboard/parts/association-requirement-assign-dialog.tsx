"use client";

import { TAssociationRequirementAssignDialog } from "@/types/association-dashboard.types";
import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { useMemo, useState } from "react";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as RG from "@ui/radio-group";
import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationRequirementAssignDialog = ({
  hook,
}: TAssociationRequirementAssignDialog) => {
  const {
    t,
    isSaving,
    detailsForm,
    groupOptions,
    memberSearch,
    isAssignOpen,
    memberOptions,
    setAssignOpen,
    submitAudience,
    setMemberSearch,
    isMemberPickerLoading,
  } = hook;

  const [groupSearch, setGroupSearch] = useState("");

  const audienceKind = detailsForm.watch("audienceKind");
  const memberIds = detailsForm.watch("memberIds");
  const groupIds = detailsForm.watch("groupIds");

  const filteredGroupOptions = useMemo(
    () =>
      groupOptions.filter((option) =>
        option.label.toLowerCase().includes(groupSearch.trim().toLowerCase()),
      ),
    [groupOptions, groupSearch],
  );

  return (
    <D.Dialog open={isAssignOpen} onOpenChange={setAssignOpen}>
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.requirements.assign.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.requirements.assign.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        <F.Form {...detailsForm}>
          <form className="space-y-4" onSubmit={submitAudience} noValidate>
            <F.FormField
              name="audienceKind"
              control={detailsForm.control}
              render={({ field }) => (
                <RG.RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-2 rounded-md border p-3"
                >
                  {Object.values(AssociationAudienceKind).map((value) => (
                    <div key={value} className="flex items-center gap-3">
                      <RG.RadioGroupItem
                        value={value}
                        id={`assign-audience-${value}`}
                      />

                      <Label
                        htmlFor={`assign-audience-${value}`}
                        className="font-normal"
                      >
                        {t(
                          `associationDashboard.requirements.audience.${value}`,
                        )}
                      </Label>
                    </div>
                  ))}
                </RG.RadioGroup>
              )}
            />

            {audienceKind === AssociationAudienceKind.Group && (
              <AssociationRequirementMemberPicker
                search={groupSearch}
                options={filteredGroupOptions}
                selectedIds={groupIds}
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
                onChange={(ids) =>
                  detailsForm.setValue("groupIds", ids, {
                    shouldValidate: true,
                  })
                }
              />
            )}

            {audienceKind === AssociationAudienceKind.SpecificMembers && (
              <AssociationRequirementMemberPicker
                search={memberSearch}
                options={memberOptions}
                selectedIds={memberIds}
                onSearch={setMemberSearch}
                isLoading={isMemberPickerLoading}
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
            )}

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="cancel"
                disabled={isSaving}
                onClick={() => setAssignOpen(false)}
              >
                {t("associationDashboard.requirements.confirm.cancel")}
              </Button>

              <Button radius="xl" type="submit" disabled={isSaving}>
                {isSaving && <L.Loader2 className="h-4 w-4 animate-spin" />}
                {t("associationDashboard.requirements.assign.submit")}
              </Button>
            </D.DialogFooter>
          </form>
        </F.Form>
      </D.DialogContent>
    </D.Dialog>
  );
};
