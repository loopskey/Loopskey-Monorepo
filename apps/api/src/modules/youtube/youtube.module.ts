import { YouTubePublicUrlApiService } from "@youtube/application/public-url-api.service";
import { YOUTUBE_PUBLIC_URL_API } from "@youtube/public/public-url-api";
import { YouTubeEngagementApiService } from "@youtube/application/youtube-engagement-api.service";
import { YOUTUBE_CATALOG_SEARCH_API } from "@youtube/public/catalog-search-api";
import { CatalogSearchApiService } from "@youtube/application/catalog-search-api.service";
import { YOUTUBE_ENGAGEMENT_API } from "@youtube/public/youtube-engagement-api";
import { YouTubeResolver } from "@youtube/resolvers/youtube.resolver";
import { YouTubeService } from "@youtube/services/youtbue.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@youtube/enums/youtube-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    YouTubePublicUrlApiService,
    {
      provide: YOUTUBE_PUBLIC_URL_API,
      useExisting: YouTubePublicUrlApiService,
    },
    YouTubeResolver,
    YouTubeService,
    YouTubeEngagementApiService,
    {
      provide: YOUTUBE_ENGAGEMENT_API,
      useExisting: YouTubeEngagementApiService,
    },
    CatalogSearchApiService,
    {
      provide: YOUTUBE_CATALOG_SEARCH_API,
      useExisting: CatalogSearchApiService,
    },
  ],
  exports: [
    YOUTUBE_ENGAGEMENT_API,
    YOUTUBE_CATALOG_SEARCH_API,
    YOUTUBE_PUBLIC_URL_API,
  ],
})
export class YouTubeModule {}
