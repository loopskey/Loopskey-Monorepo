import { CoursePublicUrlApiService } from "@course/application/public-url-api.service";
import { COURSE_PUBLIC_URL_API } from "@course/public/public-url-api";
import { ProfessionalCatalogApiService } from "@course/application/professional-catalog-api.service";
import { CourseEngagementApiService } from "@course/application/course-engagement-api.service";
import { COURSE_CATALOG_SEARCH_API } from "@course/public/catalog-search-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { CatalogSearchApiService } from "@course/application/catalog-search-api.service";
import { CourseImportController } from "@course/controllers/course-import.controller";
import { COURSE_ENGAGEMENT_API } from "@course/public/course-engagement-api";
import { CourseImportService } from "@course/services/course-import.service";
import { CourseResolver } from "@course/resolvers/course.resolver";
import { CourseService } from "@course/services/course.service";
import { CourseTranslationService } from "@course/services/course-translation.service";
import { CourseTranslationResolver } from "@course/resolvers/course-translation.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@course/enums/enum-register";

@Module({
  imports: [PrismaModule],
  controllers: [CourseImportController],
  providers: [
    CoursePublicUrlApiService,
    { provide: COURSE_PUBLIC_URL_API, useExisting: CoursePublicUrlApiService },
    CourseResolver,
    CourseTranslationResolver,
    CourseTranslationService,
    CourseService,
    CourseImportService,
    CourseEngagementApiService,
    { provide: COURSE_ENGAGEMENT_API, useExisting: CourseEngagementApiService },
    ProfessionalCatalogApiService,
    {
      provide: PROFESSIONAL_CATALOG_API,
      useExisting: ProfessionalCatalogApiService,
    },
    CatalogSearchApiService,
    {
      provide: COURSE_CATALOG_SEARCH_API,
      useExisting: CatalogSearchApiService,
    },
  ],
  exports: [
    COURSE_PUBLIC_URL_API,
    COURSE_ENGAGEMENT_API,
    PROFESSIONAL_CATALOG_API,
    COURSE_CATALOG_SEARCH_API,
  ],
})
export class CourseModule {}
