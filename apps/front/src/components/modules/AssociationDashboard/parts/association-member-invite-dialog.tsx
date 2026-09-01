"use client";

import { TAssociationMemberInviteDialog } from "@/types/association-dashboard.types";
import { AssociationInviteOutcome } from "@/lib/graphql/base";
import { FloatingInputField } from "@elements/floating-input";
import { FloatingSelectField } from "@elements/floating-select";
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
    closeInvite,
    openInvite,
    submitInvite,
    isInviteOpen,
    groupOptions,
    inviteOutcome,
  } = hook;

  const isLinked =
    inviteOutcome?.outcome === AssociationInviteOutcome.LinkedExistingUser;

  return (
    <D.Dialog
      open={isInviteOpen}
      onOpenChange={(open) => (open ? openInvite() : closeInvite())}
    >
      <D.DialogContent className="glass-dialog z-[9999] max-w-lg rounded-3xl border-glass-border">
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
              className="flex items-start gap-3 rounded-3xl border border-primary/25 bg-primary/5 p-4"
            >
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
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
                variant="glass"
                onClick={openInvite}
              >
                {t("associationDashboard.members.invite.inviteAnother")}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="brand"
                onClick={closeInvite}
              >
                {t("associationDashboard.members.invite.done")}
              </Button>
            </D.DialogFooter>
          </div>
        ) : (
          <F.Form {...inviteForm}>
            <form className="space-y-4" onSubmit={submitInvite} noValidate>
              <FloatingInputField
                name="email"
                type="email"
                control={inviteForm.control}
                label={t("associationDashboard.members.invite.email")}
              />

              <FloatingInputField
                name="fullName"
                control={inviteForm.control}
                label={t("associationDashboard.members.invite.fullName")}
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

              <D.DialogFooter>
                <Button
                  radius="xl"
                  type="button"
                  variant="cancel"
                  onClick={closeInvite}
                  disabled={isInviting}
                >
                  {t("associationDashboard.members.confirm.cancel")}
                </Button>

                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isInviting}
                >
                  {isInviting && <L.Loader2 className="h-4 w-4 animate-spin" />}
                  {t("associationDashboard.members.invite.submit")}
                </Button>
              </D.DialogFooter>
            </form>
          </F.Form>
        )}
      </D.DialogContent>
    </D.Dialog>
  );
};
