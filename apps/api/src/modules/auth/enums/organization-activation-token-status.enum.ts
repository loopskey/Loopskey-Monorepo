import { registerEnumType } from "@nestjs/graphql";

export enum OrganizationActivationTokenStatus {
  VALID = "VALID",
  USED = "USED",
  EXPIRED = "EXPIRED",
  INVALID = "INVALID",
}

registerEnumType(OrganizationActivationTokenStatus, {
  name: "OrganizationActivationTokenStatus",
});
