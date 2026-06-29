import { UploadedFile, UseInterceptors } from "@nestjs/common";
import { Body, Controller, Post } from "@nestjs/common";
import { TCurrentUserPayload } from "@course/types/course-service.type";
import { CourseImportService } from "@course/services/course-import.service";
import { CourseStatus, Role } from "@prisma/client";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Express } from "express";
import { Roles } from "@auth/decorators/roles.decorator";

import "multer";

@Controller("course-import")
@Roles(Role.ADMIN)
export class CourseImportController {
  constructor(private readonly courseImportService: CourseImportService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  importCourses(
    @CurrentUser() user: TCurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body("status") status?: CourseStatus,
    @Body("sourcePlatform") sourcePlatform?: string,
  ) {
    return this.courseImportService.importCoursesFromExcel(
      file,
      {
        id: user.id ?? user.sub!,
        role: user.role,
      },
      {
        defaultStatus: status ?? CourseStatus.PUBLISHED,
        defaultSourcePlatform: sourcePlatform ?? "COURSERA",
      },
    );
  }
}
