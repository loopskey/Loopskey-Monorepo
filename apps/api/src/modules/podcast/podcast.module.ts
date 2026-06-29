import { PodcastResolver } from "@podcast/resolvers/podcast.resolver";
import { PodcastService } from "@podcast/services/podcast.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@podcast/enums/podcast-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [PodcastResolver, PodcastService],
  exports: [PodcastService],
})
export class PodcastModule {}
