"use client";

import { AssociationRequirementMemberPicker } from "@modules/AssociationDashboard/parts/association-requirement-member-picker";
import { TAssociationLearningMembersDialog } from "@/types/association-dashboard.types";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as L from "lucide-react";

export const AssociationLearningMembersDialog = ({
  hook,
}: TAssociationLearningMembersDialog) => {
  const {
    t,
    members,
    isMutating,
    addMember,
    membersItem,
    removeMember,
    closeMembers,
    memberAddSearch,
    memberAddOptions,
    isMembersLoading,
    setMemberAddSearch,
    isMemberAddLoading,
  } = hook;

  const isOpen = Boolean(membersItem);
  const isSpecificMembers =
    membersItem?.audienceKind === AssociationAudienceKind.SpecificMembers;

  return (
    <D.Dialog open={isOpen} onOpenChange={(open) => !open && closeMembers()}>
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.learningContent.members.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.learningContent.members.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {membersItem?.audienceKind === AssociationAudienceKind.Group && (
          <p className="rounded-md border p-4 text-sm text-muted-foreground">
            <L.Info className="mr-2 inline h-4 w-4 text-primary" />
            {t("associationDashboard.learningContent.members.readOnlyGroup")}
          </p>
        )}

        {membersItem?.audienceKind === AssociationAudienceKind.AllMembers && (
          <p className="rounded-md border p-4 text-sm text-muted-foreground">
            <L.Info className="mr-2 inline h-4 w-4 text-primary" />
            {t("associationDashboard.learningContent.members.readOnlyAll")}
          </p>
        )}

        {isSpecificMembers && (
          <AssociationRequirementMemberPicker
            search={memberAddSearch}
            options={memberAddOptions}
            selectedIds={[]}
            isLoading={isMemberAddLoading}
            onSearch={setMemberAddSearch}
            label={t("associationDashboard.learningContent.members.add")}
            emptyText={t("associationDashboard.learningContent.members.empty")}
            countLabel={t(
              "associationDashboard.learningContent.members.count",
              {
                count: memberAddOptions.length,
              },
            )}
            placeholder={t(
              "associationDashboard.learningContent.members.addPlaceholder",
            )}
            onChange={(ids) => {
              const added = ids.find((id) => !members.some((m) => m.id === id));
              if (added) void addMember(added);
            }}
          />
        )}

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {isMembersLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}

          {!isMembersLoading && members.length === 0 && (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("associationDashboard.learningContent.members.empty")}
            </p>
          )}

          {!isMembersLoading &&
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.fullName ?? member.email ?? member.id}
                  </p>
                  {member.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  )}
                </div>

                {isSpecificMembers && (
                  <Button
                    size="sm"
                    radius="xl"
                    type="button"
                    variant="outline"
                    disabled={isMutating}
                    onClick={() => void removeMember(member.id)}
                    aria-label={t(
                      "associationDashboard.learningContent.members.remove",
                      { name: member.fullName ?? member.email ?? member.id },
                    )}
                  >
                    <L.X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
        </div>

        <D.DialogFooter>
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={closeMembers}
          >
            {t("associationDashboard.learningContent.members.close")}
          </Button>
        </D.DialogFooter>
      </D.DialogContent>
    </D.Dialog>
  );
};
