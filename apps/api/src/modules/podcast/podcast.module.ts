import { PodcastPublicUrlApiService } from "@podcast/application/public-url-api.service";
import { PODCAST_PUBLIC_URL_API } from "@podcast/public/public-url-api";
import { PodcastEngagementApiService } from "@podcast/application/podcast-engagement-api.service";
import { PODCAST_CATALOG_SEARCH_API } from "@podcast/public/catalog-search-api";
import { CatalogSearchApiService } from "@podcast/application/catalog-search-api.service";
import { PODCAST_ENGAGEMENT_API } from "@podcast/public/podcast-engagement-api";
import { PodcastResolver } from "@podcast/resolvers/podcast.resolver";
import { PodcastService } from "@podcast/services/podcast.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@podcast/enums/podcast-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    PodcastPublicUrlApiService,
    {
      provide: PODCAST_PUBLIC_URL_API,
      useExisting: PodcastPublicUrlApiService,
    },
    PodcastResolver,
    PodcastService,
    PodcastEngagementApiService,
    {
      provide: PODCAST_ENGAGEMENT_API,
      useExisting: PodcastEngagementApiService,
    },
    CatalogSearchApiService,
    {
      provide: PODCAST_CATALOG_SEARCH_API,
      useExisting: CatalogSearchApiService,
    },
  ],
  exports: [
    PODCAST_ENGAGEMENT_API,
    PODCAST_CATALOG_SEARCH_API,
    PODCAST_PUBLIC_URL_API,
  ],
})
export class PodcastModule {}
