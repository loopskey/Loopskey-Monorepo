import { AssignmentStatus, AssignmentTargetKind } from "@prisma/client";
import { ComplianceCycle, AssignmentType } from "@prisma/client";
import { OrganizationMemberStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";
import { OrgRangeEnum } from "@org/enums/org-dashboard-message-code.enum";

registerEnumType(OrganizationMemberStatus, {
  name: "OrganizationMemberStatus",
  description: "Status of organization member",
});

registerEnumType(ComplianceCycle, {
  name: "ComplianceCycle",
  description: "Organization compliance cycle",
});

registerEnumType(AssignmentType, {
  name: "AssignmentType",
  description: "Assignment type (HARD / SOFT)",
});

registerEnumType(AssignmentStatus, {
  name: "AssignmentStatus",
  description: "Assignment status",
});

registerEnumType(AssignmentTargetKind, {
  name: "AssignmentTargetKind",
  description: "Target type of assignment",
});

registerEnumType(OrgRangeEnum, {
  name: "OrganizationReportRangeEnum",
});
