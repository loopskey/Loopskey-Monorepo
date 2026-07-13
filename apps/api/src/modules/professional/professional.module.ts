import { ProfessionalProfileCompletionService } from "@professional/services/professional-profile-completion.service";
import { ProfessionalCertificatesResolver } from "@professional/resolvers/professional-certificate.resolver";
import { ProfessionalCertificatesService } from "@professional/services/professional-certificate.service";
import { ProfessionalCredentialService } from "@professional/services/professional-credential.service";
import { ProfessionalPduFileController } from "@professional/controllers/professional-pdu-file.controller";
import { ProfessionalCalendarResolver } from "@professional/resolvers/professional-calendar.resolver";
import { ProfessionalOverviewResolver } from "@professional/resolvers/professional-overview.resolver";
import { ProfessionalPaymentsResolver } from "@professional/resolvers/professional-payments.resolver";
import { ProfessionalSettingsResolver } from "@professional/resolvers/professional-settings.resolver";
import { ProfessionalAvatarController } from "@professional/controllers/professional-avatar.controller";
import { ProfessionalCalendarService } from "@professional/services/professional-calendar.service";
import { ProfessionalCoursesResolver } from "@professional/resolvers/professional-courses.resolver";
import { ProfessionalPaymentsService } from "@professional/services/professional-payments.service";
import { ProfessionalOverviewService } from "@professional/services/professional-overview.service";
import { ProfessionalProfileResolver } from "@professional/resolvers/professional-profile.resolver";
import { ProfessionalSettingsService } from "@professional/services/professional-settings.service";
import { ProfessionalRoadmapResolver } from "@professional/resolvers/professional-roadmap.resolver";
import { ProfessionalRoadmapService } from "@professional/services/professional-roadmap.service";
import { ProfessionalCoursesService } from "@professional/services/professional-courses.service";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalPduFileService } from "@professional/services/professional-pdu-file.service";
import { ProfessionalAvatarService } from "@professional/services/professional-avatar.service";
import { ProfessionalPduResolver } from "@professional/resolvers/professional-pdu.resolver";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@professional/enums/professional-register.enum";
@Module({
  imports: [PrismaModule],
  controllers: [ProfessionalPduFileController, ProfessionalAvatarController],
  providers: [
    ProfessionalPduService,
    ProfessionalAvatarService,
    ProfessionalCredentialService,
    ProfessionalProfileCompletionService,
    ProfessionalPduFileService,
    ProfessionalPduResolver,
    ProfessionalRoadmapService,
    ProfessionalCoursesService,
    ProfessionalProfileService,
    ProfessionalCoursesResolver,
    ProfessionalCalendarService,
    ProfessionalOverviewService,
    ProfessionalPaymentsService,
    ProfessionalProfileResolver,
    ProfessionalRoadmapResolver,
    ProfessionalSettingsService,
    ProfessionalOverviewResolver,
    ProfessionalCalendarResolver,
    ProfessionalSettingsResolver,
    ProfessionalPaymentsResolver,
    ProfessionalCertificatesService,
    ProfessionalCertificatesResolver,
  ],
  exports: [
    ProfessionalPduService,
    ProfessionalPduFileService,
    ProfessionalAvatarService,
    ProfessionalCredentialService,
    ProfessionalProfileCompletionService,
    ProfessionalProfileService,
    ProfessionalCoursesService,
    ProfessionalRoadmapService,
    ProfessionalSettingsService,
    ProfessionalCalendarService,
    ProfessionalOverviewService,
    ProfessionalPaymentsService,
    ProfessionalCertificatesService,
  ],
})
export class ProfessionalModule {}
