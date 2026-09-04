import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationRequirementPublishedHandler } from "@association/application/association-requirement-published.handler";
import { AssociationMemberRequirementsService } from "@association/services/association-member-requirements.service";
import { AssociationLearningContentResolver } from "@association/resolvers/association-learning-content.resolver";
import { AssociationLearningActivityHandler } from "@association/application/association-learning-activity.handler";
import { AssociationLearningContentService } from "@association/services/association-learning-content.service";
import { AssociationMemberProfileResolver } from "@association/resolvers/association-member-profile.resolver";
import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationMemberProfileService } from "@association/services/association-member-profile.service";
import { AssociationMemberFileController } from "@association/controllers/association-member-file.controller";
import { AssociationRequirementResolver } from "@association/resolvers/association-requirement.resolver";
import { AssociationComplianceResolver } from "@association/resolvers/association-compliance.resolver";
import { AssociationRequirementService } from "@association/services/association-requirement.service";
import { AssociationRoleProfileHandler } from "@association/application/association-role-profile.handler";
import { AssociationMemberFileService } from "@association/services/association-member-file.service";
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
import { LandingModule } from "@landing/landing.module";
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
    LandingModule,
    ProfessionalModule,
  ],
  controllers: [AssociationMemberFileController],
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
    AssociationMemberFileService,
    AssociationDashboardResolver,
    AssociationComplianceResolver,
    AssociationRoleProfileHandler,
    AssociationRequirementService,
    AssociationRequirementResolver,
    AssociationMemberProfileService,
    AssociationComplianceReadService,
    AssociationMemberProfileResolver,
    AssociationLearningActivityHandler,
    AssociationMemberRequirementsService,
    AssociationLearningContentService,
    AssociationLearningContentResolver,
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
