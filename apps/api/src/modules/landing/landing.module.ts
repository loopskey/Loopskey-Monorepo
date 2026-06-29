import { LandingResolver } from "@landing/resolvers/landing.resolver";
import { LandingService } from "@landing/services/landing.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [LandingResolver, LandingService],
  exports: [LandingService],
})
export class LandingModule {}
