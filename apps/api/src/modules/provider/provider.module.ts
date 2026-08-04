import { ProviderRoleProfileHandler } from "@provider/application/provider-role-profile.handler";
import { ProviderResolver } from "@provider/resolvers/provider.resolver";
import { ProviderService } from "@provider/services/provider.service";
import { PrismaModule } from "@prisma/prisma.module";
import { EventModule } from "@events/events.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule, EventModule, UserModule],
  providers: [ProviderResolver, ProviderService, ProviderRoleProfileHandler],
  exports: [ProviderService],
})
export class ProviderModule {}
