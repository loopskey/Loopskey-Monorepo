import { ProviderProjectionApiService } from "@provider/application/provider-projection-api.service";
import { ProviderRoleProfileHandler } from "@provider/application/provider-role-profile.handler";
import { PROVIDER_PROJECTION_API } from "@provider/public/provider-projection-api";
import { ProviderResolver } from "@provider/resolvers/provider.resolver";
import { ProviderService } from "@provider/services/provider.service";
import { PrismaModule } from "@prisma/prisma.module";
import { EventModule } from "@events/events.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, EventModule, UserModule],
  providers: [
    ProviderResolver,
    ProviderService,
    ProviderRoleProfileHandler,
    ProviderProjectionApiService,
    {
      provide: PROVIDER_PROJECTION_API,
      useExisting: ProviderProjectionApiService,
    },
  ],
  exports: [ProviderService, PROVIDER_PROJECTION_API],
})
export class ProviderModule {}
