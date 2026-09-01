import { AssociationMemberStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

export enum AssociationInviteOutcome {
  LINKED_EXISTING_USER = "LINKED_EXISTING_USER",
  INVITATION_SENT = "INVITATION_SENT",
}

registerEnumType(AssociationMemberStatus, {
  name: "AssociationMemberStatus",
  description: "Where a member stands between invitation and membership",
});

registerEnumType(AssociationInviteOutcome, {
  name: "AssociationInviteOutcome",
  description:
    "Whether an invitation linked an account that already existed or sent a new one",
});
