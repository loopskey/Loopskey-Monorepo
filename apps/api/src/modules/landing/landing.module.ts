import { CatalogOrganizationApiService } from "@landing/application/catalog-organization-api.service";
import { CatalogEndorsementApiService } from "@landing/application/catalog-endorsement-api.service";
import { LandingCatalogSearchService } from "@landing/services/landing-catalog-search.service";
import { CATALOG_ORGANIZATION_API } from "@landing/public/catalog-organization-api";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { LandingResolver } from "@landing/resolvers/landing.resolver";
import { LandingService } from "@landing/services/landing.service";
import { PodcastModule } from "@podcast/podcast.module";
import { YouTubeModule } from "@youtube/youtube.module";
import { PrismaModule } from "@prisma/prisma.module";
import { CourseModule } from "@course/course.module";
import { EventModule } from "@events/events.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    PrismaModule,
    CourseModule,
    EventModule,
    PodcastModule,
    YouTubeModule,
  ],
  providers: [
    LandingResolver,
    LandingService,
    LandingCatalogSearchService,
    CatalogOrganizationApiService,
    CatalogEndorsementApiService,
    {
      provide: CATALOG_ORGANIZATION_API,
      useExisting: CatalogOrganizationApiService,
    },
    {
      provide: CATALOG_ENDORSEMENT_API,
      useExisting: CatalogEndorsementApiService,
    },
  ],
  exports: [CATALOG_ORGANIZATION_API, CATALOG_ENDORSEMENT_API],
})
export class LandingModule {}
