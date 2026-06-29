import { ExternalLearningResolver } from "@ext/resolvers/external-learning.resolver";
import { ExternalLearningService } from "@ext/services/external-learning.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@ext/enums/external-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [ExternalLearningResolver, ExternalLearningService],
  exports: [ExternalLearningService],
})
export class ExternalLearningModule {}
