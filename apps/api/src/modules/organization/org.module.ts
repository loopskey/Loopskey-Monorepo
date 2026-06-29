import { OrgDashboardDepartmentResolver } from "@org/resolvers/org-dashboard-department.resolver";
import { OrgDashboardAssignmentResolver } from "@org/resolvers/org-dashboard-assignment.resolver";
import { OrgDashboardDepartmentService } from "@org/services/org-dashboard-department.service";
import { OrgDashboardAssignmentService } from "@org/services/org-dashboard-assignment.service";
import { OrgDashboardMemberResolver } from "@org/resolvers/org-dashboard-member.resolver";
import { OrgDashboardMemberService } from "@org/services/org-dashboard-member.service";
import { OrgAccessRequestResolver } from "@org/resolvers/org-access-request.resolver";
import { OrgAccessRequestService } from "@org/services/org-access-request.service";
import { OrgDashboardCPDResolver } from "@org/resolvers/org-dashboard-cpd.resolver";
import { OrgDashboardCPDService } from "@org/services/org-dashboard-cpd.service";
import { OrgDashboardResolver } from "@org/resolvers/org-dashboard.resolver";
import { OrgDashboardService } from "@org/services/org-dashboard.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@org/enums/org-dashboard-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    OrgDashboardService,
    OrgDashboardResolver,
    OrgDashboardCPDService,
    OrgDashboardCPDResolver,
    OrgAccessRequestService,
    OrgAccessRequestResolver,
    OrgDashboardMemberService,
    OrgDashboardMemberResolver,
    OrgDashboardAssignmentService,
    OrgDashboardDepartmentService,
    OrgDashboardDepartmentResolver,
    OrgDashboardAssignmentResolver,
  ],
  exports: [
    OrgDashboardService,
    OrgDashboardCPDService,
    OrgAccessRequestService,
    OrgDashboardMemberService,
    OrgDashboardDepartmentService,
    OrgDashboardAssignmentService,
  ],
})
export class OrganizationModule {}
