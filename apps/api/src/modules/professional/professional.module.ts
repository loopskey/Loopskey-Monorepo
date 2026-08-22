import { ProfessionalCertificateFileController } from "@professional/controllers/professional-certificate-file.controller";
import { ProfessionalProfileCompletionService } from "@professional/services/professional-profile-completion.service";
import { ProfessionalCertificateFileService } from "@professional/services/professional-certificate-file.service";
import { ProfessionalProvisioningApiService } from "@professional/application/professional-provisioning-api.service";
import { ProfessionalCertificatesResolver } from "@professional/resolvers/professional-certificate.resolver";
import { ProfessionalCertificatesService } from "@professional/services/professional-certificate.service";
import { ProfessionalRoadmapDraftService } from "@professional/services/professional-roadmap-draft.service";
import { ProfessionalRoleProfileHandler } from "@professional/application/professional-role-profile.handler";
import { ProfessionalOnboardingResolver } from "@professional/resolvers/professional-onboarding.resolver";
import { ProfessionalCredentialService } from "@professional/services/professional-credential.service";
import { ProfessionalPduFileController } from "@professional/controllers/professional-pdu-file.controller";
import { PROFESSIONAL_PROVISIONING_API } from "@professional/public/professional-provisioning-api";
import { ProfessionalOnboardingService } from "@professional/services/professional-onboarding.service";
import { ProfessionalCalendarResolver } from "@professional/resolvers/professional-calendar.resolver";
import { ProfessionalOverviewResolver } from "@professional/resolvers/professional-overview.resolver";
import { ProfessionalPaymentsResolver } from "@professional/resolvers/professional-payments.resolver";
import { ProfessionalSettingsResolver } from "@professional/resolvers/professional-settings.resolver";
import { ProfessionalAvatarController } from "@professional/controllers/professional-avatar.controller";
import { ProfessionalCalendarService } from "@professional/services/professional-calendar.service";
import { ProfessionalCoursesResolver } from "@professional/resolvers/professional-courses.resolver";
import { ProfessionalPaymentsService } from "@professional/services/professional-payments.service";
import { ProfessionalOverviewService } from "@professional/services/professional-overview.service";
import { ProfessionalCpdPlanResolver } from "@professional/resolvers/professional-cpd-plan.resolver";
import { ProfessionalProfileResolver } from "@professional/resolvers/professional-profile.resolver";
import { ProfessionalSettingsService } from "@professional/services/professional-settings.service";
import { ProfessionalRoadmapResolver } from "@professional/resolvers/professional-roadmap.resolver";
import { LocalEvidenceStorageAdapter } from "@professional/storage/local-evidence-storage.adapter";
import { ProfessionalRoadmapService } from "@professional/services/professional-roadmap.service";
import { ProfessionalCoursesService } from "@professional/services/professional-courses.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalPduFileService } from "@professional/services/professional-pdu-file.service";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { ProfessionalAvatarService } from "@professional/services/professional-avatar.service";
import { ContentInteractionModule } from "@contentAction/content-interaction.module";
import { ProfessionalPduResolver } from "@professional/resolvers/professional-pdu.resolver";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { EVIDENCE_STORAGE } from "@professional/storage/evidence-storage.port";
import { ProviderModule } from "@provider/provider.module";
import { PrismaModule } from "@prisma/prisma.module";
import { CourseModule } from "@course/course.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

import "@professional/enums/professional-register.enum";
@Module({
  imports: [
    UserModule,
    PrismaModule,
    CourseModule,
    ProviderModule,
    ContentInteractionModule,
  ],
  controllers: [
    ProfessionalAvatarController,
    ProfessionalPduFileController,
    ProfessionalCertificateFileController,
  ],
  providers: [
    ProfessionalPduService,
    ProfessionalPduResolver,
    ProfessionalAvatarService,
    ProfessionalPduFileService,
    ProfessionalRoadmapService,
    ProfessionalCoursesService,
    ProfessionalProfileService,
    CertificationSearchService,
    ProfessionalCpdPlanService,
    ProfessionalCoursesResolver,
    ProfessionalCalendarService,
    ProfessionalOverviewService,
    ProfessionalPaymentsService,
    ProfessionalProfileResolver,
    ProfessionalRoadmapResolver,
    ProfessionalSettingsService,
    ProfessionalCpdPlanResolver,
    ProfessionalOverviewResolver,
    ProfessionalCalendarResolver,
    ProfessionalSettingsResolver,
    ProfessionalPaymentsResolver,
    ProfessionalCredentialService,
    ProfessionalOnboardingService,
    ProfessionalOnboardingResolver,
    ProfessionalRoleProfileHandler,
    ProfessionalRoadmapDraftService,
    ProfessionalCertificatesService,
    ProfessionalCertificatesResolver,
    ProfessionalCertificateFileService,
    ProfessionalProvisioningApiService,
    ProfessionalProfileCompletionService,
    LocalEvidenceStorageAdapter,
    { provide: EVIDENCE_STORAGE, useExisting: LocalEvidenceStorageAdapter },
    {
      provide: PROFESSIONAL_PROVISIONING_API,
      useExisting: ProfessionalProvisioningApiService,
    },
  ],
  exports: [
    ProfessionalPduService,
    CertificationSearchService,
    ProfessionalCpdPlanService,
    ProfessionalPduFileService,
    ProfessionalAvatarService,
    ProfessionalProfileService,
    ProfessionalCoursesService,
    ProfessionalRoadmapService,
    ProfessionalRoadmapDraftService,
    ProfessionalSettingsService,
    ProfessionalCalendarService,
    ProfessionalOverviewService,
    ProfessionalPaymentsService,
    ProfessionalCredentialService,
    PROFESSIONAL_PROVISIONING_API,
    ProfessionalCertificatesService,
    ProfessionalProfileCompletionService,
  ],
})
export class ProfessionalModule {}
