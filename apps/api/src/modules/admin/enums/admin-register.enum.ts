import {
  AuditAction,
  NotificationDeliveryStatus,
  OrganizationAccessRequestStatus,
} from "@prisma/client";
import { OrganizationMemberStatus, Role, UserStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(AuditAction, {
  name: "AuditAction",
});

registerEnumType(UserStatus, {
  name: "UserStatus",
});

registerEnumType(Role, {
  name: "Role",
});

registerEnumType(OrganizationAccessRequestStatus, {
  name: "OrganizationAccessRequestStatus",
});

registerEnumType(OrganizationMemberStatus, {
  name: "OrganizationMemberStatus",
});

registerEnumType(NotificationDeliveryStatus, {
  name: "NotificationDeliveryStatus",
});
