import { CourseImportController } from "@course/controllers/course-import.controller";
import { CourseImportService } from "@course/services/course-import.service";
import { CourseResolver } from "@course/resolvers/course.resolver";
import { CourseService } from "@course/services/course.service";
import { PrismaModule } from "@prisma/prisma.module";
import { Module } from "@nestjs/common";

import "@course/enums/enum-register";

@Module({
  imports: [PrismaModule],
  controllers: [CourseImportController],
  providers: [CourseResolver, CourseService, CourseImportService],
  exports: [CourseService, CourseImportService],
})
export class CourseModule {}
