import { ProviderPublicProfileUrlKindRegistrar } from "@provider/application/provider-public-profile-url-kind.registrar";
import { ProviderPublicProfileUrlApiService } from "@provider/application/provider-public-profile-url-api.service";
import { ProviderPublicProfileReadService } from "@provider/services/provider-public-profile-read.service";
import { ProviderPublicProfileResolver } from "@provider/resolvers/provider-public-profile.resolver";
import { ProviderPublicProfileService } from "@provider/services/provider-public-profile.service";
import { ProviderProjectionApiService } from "@provider/application/provider-projection-api.service";
import { ProviderRoleProfileHandler } from "@provider/application/provider-role-profile.handler";
import { PROVIDER_PROJECTION_API } from "@provider/public/provider-projection-api";
import { ContentMediaModule } from "@contentMedia/content-media.module";
import { ContentUrlModule } from "@contentUrl/content-url.module";
import { ProviderResolver } from "@provider/resolvers/provider.resolver";
import { ProviderService } from "@provider/services/provider.service";
import { PrismaModule } from "@prisma/prisma.module";
import { EventModule } from "@events/events.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    UserModule,
    EventModule,
    PrismaModule,
    ContentUrlModule,
    ContentMediaModule,
  ],
  providers: [
    ProviderService,
    ProviderResolver,
    ProviderRoleProfileHandler,
    ProviderProjectionApiService,
    ProviderPublicProfileService,
    ProviderPublicProfileResolver,
    ProviderPublicProfileReadService,
    ProviderPublicProfileUrlApiService,
    ProviderPublicProfileUrlKindRegistrar,
    {
      provide: PROVIDER_PROJECTION_API,
      useExisting: ProviderProjectionApiService,
    },
  ],
  exports: [ProviderService, PROVIDER_PROJECTION_API],
})
export class ProviderModule {}
