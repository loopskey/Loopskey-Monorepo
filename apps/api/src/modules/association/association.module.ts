import { AssociationRoleProfileHandler } from "@association/application/association-role-profile.handler";
import { AssociationDashboardResolver } from "@association/resolvers/association-dashboard.resolver";
import { AssociationDashboardService } from "@association/services/association-dashboard.service";
import { AssociationAdminResolver } from "@association/resolvers/association-admin.resolver";
import { AssociationAccountService } from "@association/services/association-account.service";
import { PrismaModule } from "@prisma/prisma.module";
import { AuthModule } from "@auth/auth.module";
import { MailModule } from "@mail/mail.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, MailModule, AuthModule, UserModule],
  providers: [
    AssociationAccountService,
    AssociationAdminResolver,
    AssociationDashboardService,
    AssociationDashboardResolver,
    AssociationRoleProfileHandler,
  ],
  exports: [AssociationAccountService, AssociationDashboardService],
})
export class AssociationModule {}
