import { registerEnumType } from "@nestjs/graphql";

export enum MemberInvitationTokenStatus {
  VALID = "VALID",
  USED = "USED",
  EXPIRED = "EXPIRED",
  INVALID = "INVALID",
}

registerEnumType(MemberInvitationTokenStatus, {
  name: "MemberInvitationTokenStatus",
});
