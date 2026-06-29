import { ProviderResolver } from "@provider/resolvers/provider.resolver";
import { ProviderService } from "@provider/services/provider.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [ProviderResolver, ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
