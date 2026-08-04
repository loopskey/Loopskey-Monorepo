import { PodcastEngagementApiService } from "@podcast/application/podcast-engagement-api.service";
import { PODCAST_ENGAGEMENT_API } from "@podcast/public/podcast-engagement-api";
import { PodcastResolver } from "@podcast/resolvers/podcast.resolver";
import { PodcastService } from "@podcast/services/podcast.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@podcast/enums/podcast-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    PodcastResolver,
    PodcastService,
    PodcastEngagementApiService,
    {
      provide: PODCAST_ENGAGEMENT_API,
      useExisting: PodcastEngagementApiService,
    },
  ],
  exports: [PODCAST_ENGAGEMENT_API],
})
export class PodcastModule {}
