import { CourseEngagementProjection } from "@course/public/course-engagement-api";
import { CourseEngagementApi } from "@course/public/course-engagement-api";
import { CourseService } from "@course/services/course.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CourseEngagementApiService implements CourseEngagementApi {
  constructor(private readonly courseService: CourseService) {}

  resolveCourse(courseId: string): Promise<CourseEngagementProjection> {
    return this.courseService.resolveForEngagement(courseId);
  }

  async updateCourseRating(
    courseId: string,
    average: number,
    count: number,
  ): Promise<void> {
    await this.courseService.updateEngagementRating(courseId, average, count);
  }
}
