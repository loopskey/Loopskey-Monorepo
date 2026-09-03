import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementPublishedHandler } from "@association/application/association-requirement-published.handler";
import { AssociationLearningActivityHandler } from "@association/application/association-learning-activity.handler";
import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationRequirementResolver } from "@association/resolvers/association-requirement.resolver";
import { AssociationComplianceResolver } from "@association/resolvers/association-compliance.resolver";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationRoleProfileHandler } from "@association/application/association-role-profile.handler";
import { AssociationDashboardResolver } from "@association/resolvers/association-dashboard.resolver";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationDashboardService } from "@association/services/association-dashboard.service";
import { AssociationMemberResolver } from "@association/resolvers/association-member.resolver";
import { AssociationAccountService } from "@association/services/association-account.service";
import { AssociationGroupResolver } from "@association/resolvers/association-group.resolver";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberService } from "@association/services/association-member.service";
import { AssociationReviewService } from "@association/services/association-review.service";
import { AssociationAdminResolver } from "@association/resolvers/association-admin.resolver";
import { AssociationGroupService } from "@association/services/association-group.service";
import { AssociationCycleService } from "@association/services/association-cycle.service";
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
    AssociationCycleService,
    AssociationAccessService,
    AssociationGroupResolver,
    AssociationMemberService,
    AssociationReviewService,
    AssociationMemberResolver,
    AssociationAccountService,
    AssociationDashboardService,
    AssociationComplianceService,
    AssociationDashboardResolver,
    AssociationComplianceResolver,
    AssociationRoleProfileHandler,
    AssociationRequirementService,
    AssociationRequirementResolver,
    AssociationComplianceReadService,
    AssociationLearningActivityHandler,
    AssociationRequirementPublishedHandler,
    AssociationRequirementAssignmentService,
  ],
  exports: [
    AssociationGroupService,
    AssociationCycleService,
    AssociationMemberService,
    AssociationAccountService,
    AssociationDashboardService,
    AssociationComplianceService,
    AssociationRequirementService,
    AssociationRequirementAssignmentService,
  ],
})
export class AssociationModule {}
