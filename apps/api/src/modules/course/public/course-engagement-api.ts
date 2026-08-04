export const COURSE_ENGAGEMENT_API = Symbol("COURSE_ENGAGEMENT_API");

export type CourseEngagementProjection = {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly currency: string;
  readonly isFree: boolean;
};

export interface CourseEngagementApi {
  resolveCourse(courseId: string): Promise<CourseEngagementProjection>;
  updateCourseRating(
    courseId: string,
    average: number,
    count: number,
  ): Promise<void>;
}
