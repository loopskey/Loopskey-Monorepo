"use client";

import { TAssociationMemberInviteDialog } from "@/types/association-dashboard.types";
import { AssociationInviteOutcome } from "@/lib/graphql/base";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { Checkbox } from "@ui/checkbox";
import { Button } from "@ui/button";

import * as D from "@ui/dialog";
import * as F from "@ui/form";
import * as L from "lucide-react";

export const AssociationMemberInviteDialog = ({
  hook,
}: TAssociationMemberInviteDialog) => {
  const {
    t,
    inviteForm,
    isInviting,
    openInvite,
    inviteStep,
    closeInvite,
    inviteLookup,
    isInviteOpen,
    groupOptions,
    inviteOutcome,
    confirmInvite,
    continueInvite,
    isCheckingEmail,
    backToInviteForm,
    inviteRequirementOptions,
    autoAppliedRequirementCount,
  } = hook;

  const isLinked =
    inviteOutcome?.outcome === AssociationInviteOutcome.LinkedExistingUser;
  const isExistingAccount = inviteLookup?.exists === true;
  const selectedRequirementIds = inviteForm.watch("requirementIds") ?? [];

  const toggleRequirement = (requirementId: string) => {
    const next = selectedRequirementIds.includes(requirementId)
      ? selectedRequirementIds.filter((id) => id !== requirementId)
      : [...selectedRequirementIds, requirementId];
    inviteForm.setValue("requirementIds", next, { shouldDirty: true });
  };

  return (
    <D.Dialog
      open={isInviteOpen}
      onOpenChange={(open) => (open ? openInvite() : closeInvite())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-lg border-border">
        <D.DialogHeader>
          <D.DialogTitle className="text-xl">
            {t("associationDashboard.members.invite.title")}
          </D.DialogTitle>

          <D.DialogDescription className="leading-6">
            {t("associationDashboard.members.invite.description")}
          </D.DialogDescription>
        </D.DialogHeader>

        {inviteOutcome ? (
          <div className="space-y-4">
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4"
            >
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                {isLinked ? (
                  <L.UserCheck className="h-5 w-5" />
                ) : (
                  <L.MailCheck className="h-5 w-5" />
                )}
              </div>

              <div>
                <p className="font-medium">
                  {t(
                    isLinked
                      ? "associationDashboard.members.invite.linkedTitle"
                      : "associationDashboard.members.invite.sentTitle",
                  )}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    isLinked
                      ? "associationDashboard.members.invite.linkedBody"
                      : "associationDashboard.members.invite.sentBody",
                    {
                      name: inviteOutcome.memberName,
                      email: inviteOutcome.memberEmail,
                    },
                  )}
                </p>
              </div>
            </div>

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="outline"
                onClick={openInvite}
              >
                {t("associationDashboard.members.invite.inviteAnother")}
              </Button>

              <Button radius="xl" type="button" onClick={closeInvite}>
                {t("associationDashboard.members.invite.done")}
              </Button>
            </D.DialogFooter>
          </div>
        ) : inviteStep === "preview" ? (
          <div className="space-y-4">
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4"
            >
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                {isExistingAccount ? (
                  <L.UserCheck className="h-5 w-5" />
                ) : (
                  <L.MailCheck className="h-5 w-5" />
                )}
              </div>

              <div>
                <p className="font-medium">
                  {t(
                    isExistingAccount
                      ? "associationDashboard.members.invite.existingAccountTitle"
                      : "associationDashboard.members.invite.noAccountTitle",
                  )}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    isExistingAccount
                      ? "associationDashboard.members.invite.existingAccountBody"
                      : "associationDashboard.members.invite.noAccountBody",
                  )}
                </p>
              </div>
            </div>

            <D.DialogFooter>
              <Button
                radius="xl"
                type="button"
                variant="cancel"
                disabled={isInviting}
                onClick={backToInviteForm}
              >
                {t("associationDashboard.members.invite.back")}
              </Button>

              <Button
                radius="xl"
                type="button"
                disabled={isInviting}
                onClick={() => void confirmInvite()}
              >
                {isInviting && <L.Loader2 className="h-4 w-4 animate-spin" />}
                {t(
                  isExistingAccount
                    ? "associationDashboard.members.invite.linkMember"
                    : "associationDashboard.members.invite.submit",
                )}
              </Button>
            </D.DialogFooter>
          </div>
        ) : (
          <F.Form {...inviteForm}>
            <form className="space-y-4" onSubmit={continueInvite} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingInputField
                  name="firstName"
                  control={inviteForm.control}
                  label={t("associationDashboard.members.invite.firstName")}
                />

                <FloatingInputField
                  name="lastName"
                  control={inviteForm.control}
                  label={t("associationDashboard.members.invite.lastName")}
                />
              </div>

              <FloatingInputField
                name="email"
                type="email"
                control={inviteForm.control}
                label={t("associationDashboard.members.invite.email")}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FloatingSelectField
                  name="groupId"
                  options={groupOptions}
                  control={inviteForm.control}
                  label={t("associationDashboard.members.invite.group")}
                  placeholder={t(
                    "associationDashboard.members.invite.groupPlaceholder",
                  )}
                />

                <FloatingInputField
                  name="memberNumber"
                  control={inviteForm.control}
                  label={t("associationDashboard.members.invite.memberNumber")}
                />
              </div>

              {inviteRequirementOptions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("associationDashboard.members.invite.requirements")}
                  </p>

                  <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {inviteRequirementOptions.map((option) => (
                      <li key={option.id} className="rounded-md border p-3">
                        <label className="flex cursor-pointer items-center gap-3">
                          <Checkbox
                            checked={selectedRequirementIds.includes(option.id)}
                            onCheckedChange={() => toggleRequirement(option.id)}
                          />

                          <span className="font-medium">{option.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {autoAppliedRequirementCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("associationDashboard.members.invite.autoAppliedNote", {
                    count: autoAppliedRequirementCount,
                  })}
                </p>
              )}

              <D.DialogFooter>
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  onClick={closeInvite}
                  disabled={isCheckingEmail}
                >
                  {t("associationDashboard.members.confirm.cancel")}
                </Button>

                <Button radius="xl" type="submit" disabled={isCheckingEmail}>
                  {isCheckingEmail && (
                    <L.Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("associationDashboard.members.invite.continue")}
                </Button>
              </D.DialogFooter>
            </form>
          </F.Form>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
