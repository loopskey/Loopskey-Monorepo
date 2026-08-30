import { CourseEngagementProjection } from "@course/public/course-engagement-api";
import { CourseEngagementApi } from "@course/public/course-engagement-api";
import { CourseRatingWriter } from "@course/public/course-engagement-api";
import { CourseService } from "@course/services/course.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CourseEngagementApiService implements CourseEngagementApi {
  constructor(private readonly courseService: CourseService) {}

  resolveCourse(courseId: string): Promise<CourseEngagementProjection> {
    return this.courseService.resolveForEngagement(courseId);
  }

  /**
   * `writer` lets the caller recompute and publish the aggregate inside one
   * transaction, which is what keeps a slower recomputation from landing after
   * a newer one. It defaults to the ambient client for callers with no
   * transaction of their own.
   */
  async updateCourseRating(
    courseId: string,
    average: number,
    count: number,
    writer?: CourseRatingWriter,
  ): Promise<void> {
    await this.courseService.updateEngagementRating(
      courseId,
      average,
      count,
      writer,
    );
  }
}
