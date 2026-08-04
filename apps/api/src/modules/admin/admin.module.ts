import { OrganizationReviewNotificationService } from "@admin/services/organization-review-notification.service";
import { AdminDashboardResolver } from "@admin/resolvers/admin.resolver";
import { AdminDashboardService } from "@admin/services/admin.service";
import { OrganizationModule } from "@org/org.module";
import { AdminOrgResolver } from "@admin/resolvers/admin-org.resolver";
import { AdminOrgService } from "@admin/services/admin-org.service";
import { PrismaModule } from "@prisma/prisma.module";
import { AuthModule } from "@auth/auth.module";
import { UserModule } from "@user/user.module";
import { MailModule } from "@mail/mail.module";
import { Module } from "@nestjs/common";

import "@admin/enums/admin-register.enum";

@Module({
  imports: [
    MailModule,
    AuthModule,
    UserModule,
    PrismaModule,
    OrganizationModule,
  ],
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
