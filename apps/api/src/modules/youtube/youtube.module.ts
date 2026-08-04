import { YouTubeEngagementApiService } from "@youtube/application/youtube-engagement-api.service";
import { YOUTUBE_ENGAGEMENT_API } from "@youtube/public/youtube-engagement-api";
import { YouTubeResolver } from "@youtube/resolvers/youtube.resolver";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@youtube/enums/youtube-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    YouTubeResolver,
    YouTubeService,
    YouTubeEngagementApiService,
    {
      provide: YOUTUBE_ENGAGEMENT_API,
      useExisting: YouTubeEngagementApiService,
    },
  ],
  exports: [YOUTUBE_ENGAGEMENT_API],
})
export class YouTubeModule {}
