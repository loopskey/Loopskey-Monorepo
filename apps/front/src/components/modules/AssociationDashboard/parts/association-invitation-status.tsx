"use client";

import { AssociationMessageDeliveryState } from "@/lib/graphql/base";
import { useI18n } from "@hooks/useI18n";
import { cn } from "@/lib/utils";

import type { AssociationMemberFieldsFragment } from "@/lib/graphql/operations/association-dashboard";

type AssociationInvitationStatusProps = {
  delivery: AssociationMemberFieldsFragment["invitationDelivery"];
};

export const AssociationInvitationStatus = ({
  delivery,
}: AssociationInvitationStatusProps) => {
  const { t } = useI18n();
  const state =
    delivery?.state === AssociationMessageDeliveryState.Queued &&
    delivery.failureReason
      ? "RETRYING"
      : (delivery?.state ?? "UNKNOWN");

  return (
    <p
      role="status"
      className={cn(
        "max-w-64 whitespace-normal text-xs",
        state === "FAILED" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {t(`associationDashboard.members.invite.delivery.${state}`)}
      {state === "SENT" && (
        <span className="mt-1 block">
          {t("associationDashboard.members.invite.delivery.sentHint")}
        </span>
      )}
    </p>
  );
};
