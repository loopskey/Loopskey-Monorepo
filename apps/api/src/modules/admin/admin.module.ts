import { OrganizationReviewNotificationService } from "@admin/services/organization-review-notification.service";
import { AdminDashboardResolver } from "@admin/resolvers/admin.resolver";
import { AdminDashboardService } from "@admin/services/admin.service";
import { AdminOrgResolver } from "@admin/resolvers/admin-org.resolver";
import { AdminOrgService } from "@admin/services/admin-org.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@admin/enums/admin-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    AdminOrgService,
    AdminOrgResolver,
    AdminDashboardService,
    AdminDashboardResolver,
    OrganizationReviewNotificationService,
  ],
  exports: [AdminDashboardService, AdminOrgService],
})
export class AdminDashboardModule {}
