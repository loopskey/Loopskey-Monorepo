import { registerEnumType } from "@nestjs/graphql";

export enum AssociationActivationTokenStatus {
  VALID = "VALID",
  USED = "USED",
  EXPIRED = "EXPIRED",
  INVALID = "INVALID",
}

registerEnumType(AssociationActivationTokenStatus, {
  name: "AssociationActivationTokenStatus",
});
