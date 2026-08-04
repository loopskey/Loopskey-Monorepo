import { OrganizationAdministrationService } from "@org/application/organization-administration.service";
import { OrgDashboardDepartmentResolver } from "@org/resolvers/org-dashboard-department.resolver";
import { OrgDashboardAssignmentResolver } from "@org/resolvers/org-dashboard-assignment.resolver";
import { OrganizationRoleProfileHandler } from "@org/application/organization-role-profile.handler";
import { OrgDashboardDepartmentService } from "@org/services/org-dashboard-department.service";
import { OrgDashboardAssignmentService } from "@org/services/org-dashboard-assignment.service";
import { OrganizationReviewApiService } from "@org/application/organization-review-api.service";
import { OrgDashboardMemberResolver } from "@org/resolvers/org-dashboard-member.resolver";
import { OrgDashboardMemberService } from "@org/services/org-dashboard-member.service";
import { OrgAccessRequestResolver } from "@org/resolvers/org-access-request.resolver";
import { OrgAccessRequestService } from "@org/services/org-access-request.service";
import { OrgDashboardCPDResolver } from "@org/resolvers/org-dashboard-cpd.resolver";
import { ORGANIZATION_REVIEW_API } from "@org/public/organization-review-api";
import { OrgDashboardCPDService } from "@org/services/org-dashboard-cpd.service";
import { OrgDashboardResolver } from "@org/resolvers/org-dashboard.resolver";
import { OrgDashboardService } from "@org/services/org-dashboard.service";
import { ProfessionalModule } from "@professional/professional.module";
import { LandingModule } from "@landing/landing.module";
import { PrismaModule } from "@prisma/prisma.module";
import { UserModule } from "@user/user.module";
import { MailModule } from "@mail/mail.module";
import { Module } from "@nestjs/common";

import "@org/enums/org-dashboard-register.enum";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    LandingModule,
    UserModule,
    ProfessionalModule,
  ],
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
    OrganizationReviewApiService,
    OrganizationRoleProfileHandler,
    OrganizationAdministrationService,
    {
      provide: ORGANIZATION_REVIEW_API,
      useExisting: OrganizationReviewApiService,
    },
  ],
  exports: [
    OrgDashboardService,
    OrgDashboardCPDService,
    OrgAccessRequestService,
    OrgDashboardMemberService,
    OrgDashboardDepartmentService,
    OrgDashboardAssignmentService,
    ORGANIZATION_REVIEW_API,
    OrganizationAdministrationService,
  ],
})
export class OrganizationModule {}
