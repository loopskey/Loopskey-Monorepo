import { CourseEngagementApiService } from "@course/application/course-engagement-api.service";
import { CourseImportController } from "@course/controllers/course-import.controller";
import { COURSE_ENGAGEMENT_API } from "@course/public/course-engagement-api";
import { CourseImportService } from "@course/services/course-import.service";
import { CourseResolver } from "@course/resolvers/course.resolver";
import { CourseService } from "@course/services/course.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@course/enums/enum-register";

@Module({
  imports: [PrismaModule],
  controllers: [CourseImportController],
  providers: [
    CourseResolver,
    CourseService,
    CourseImportService,
    CourseEngagementApiService,
    { provide: COURSE_ENGAGEMENT_API, useExisting: CourseEngagementApiService },
  ],
  exports: [COURSE_ENGAGEMENT_API],
})
export class CourseModule {}
