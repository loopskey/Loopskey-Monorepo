import { Global, Module } from "@nestjs/common";
import { RateLimitGuard } from "./rate-limit.guard";
import { RateLimitService } from "./rate-limit.service";
import { PrismaModule } from "@prisma/prisma.module";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard],
})
export class RateLimitModule {}
