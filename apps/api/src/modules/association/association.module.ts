import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementPublishedHandler } from "@association/application/association-requirement-published.handler";
import { AssociationRequirementResolver } from "@association/resolvers/association-requirement.resolver";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationRoleProfileHandler } from "@association/application/association-role-profile.handler";
import { AssociationDashboardResolver } from "@association/resolvers/association-dashboard.resolver";
import { AssociationDashboardService } from "@association/services/association-dashboard.service";
import { AssociationMemberResolver } from "@association/resolvers/association-member.resolver";
import { AssociationAccountService } from "@association/services/association-account.service";
import { AssociationGroupResolver } from "@association/resolvers/association-group.resolver";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberService } from "@association/services/association-member.service";
import { AssociationAdminResolver } from "@association/resolvers/association-admin.resolver";
import { AssociationGroupService } from "@association/services/association-group.service";
import { ProfessionalModule } from "@professional/professional.module";
import { PrismaModule } from "@prisma/prisma.module";
import { AuthModule } from "@auth/auth.module";
import { MailModule } from "@mail/mail.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

import "@association/enums/association-register.enum";

@Module({
  imports: [
    MailModule,
    AuthModule,
    UserModule,
    PrismaModule,
    ProfessionalModule,
  ],
  providers: [
    AssociationGroupService,
    AssociationAdminResolver,
    AssociationAccessService,
    AssociationGroupResolver,
    AssociationMemberService,
    AssociationMemberResolver,
    AssociationAccountService,
    AssociationDashboardService,
    AssociationDashboardResolver,
    AssociationRoleProfileHandler,
    AssociationRequirementService,
    AssociationRequirementResolver,
    AssociationRequirementPublishedHandler,
    AssociationRequirementAssignmentService,
  ],
  exports: [
    AssociationGroupService,
    AssociationMemberService,
    AssociationAccountService,
    AssociationDashboardService,
    AssociationRequirementService,
    AssociationRequirementAssignmentService,
  ],
})
export class AssociationModule {}
