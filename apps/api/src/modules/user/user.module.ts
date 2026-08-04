import { IdentityAdministrationApiService } from "@user/application/identity-administration-api.service";
import { IDENTITY_ADMINISTRATION_API } from "@user/public/identity-administration-api";
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
    { provide: IDENTITY_PROFILE_API, useExisting: IdentityProfileApiService },
    {
      provide: IDENTITY_ADMINISTRATION_API,
      useExisting: IdentityAdministrationApiService,
    },
  ],
  exports: [UserService, IDENTITY_PROFILE_API, IDENTITY_ADMINISTRATION_API],
})
export class UserModule {}
