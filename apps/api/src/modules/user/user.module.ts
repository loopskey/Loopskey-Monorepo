import { IdentityAdministrationApiService } from "@user/application/identity-administration-api.service";
import { ProfessionalIdentityApiService } from "@user/application/professional-identity-api.service";
import { IDENTITY_ADMINISTRATION_API } from "@user/public/identity-administration-api";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { IdentityProfileApiService } from "@user/application/identity-profile-api.service";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { UserResolver } from "@user/resolvers/user.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { UserService } from "@user/services/user.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [
    UserResolver,
    UserService,
    IdentityProfileApiService,
    IdentityAdministrationApiService,
    ProfessionalIdentityApiService,
    { provide: IDENTITY_PROFILE_API, useExisting: IdentityProfileApiService },
    {
      provide: IDENTITY_ADMINISTRATION_API,
      useExisting: IdentityAdministrationApiService,
    },
    {
      provide: PROFESSIONAL_IDENTITY_API,
      useExisting: ProfessionalIdentityApiService,
    },
  ],
  exports: [
    UserService,
    IDENTITY_PROFILE_API,
    IDENTITY_ADMINISTRATION_API,
    PROFESSIONAL_IDENTITY_API,
  ],
})
export class UserModule {}
