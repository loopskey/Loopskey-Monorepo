/**
 * Just enough of an open transaction for this module to write its own row.
 *
 * Declared structurally rather than as a Prisma type: a public contract that
 * named the ORM would leak persistence across a module boundary. The caller
 * hands over the transaction it is already inside, the owning module writes its
 * table within it, and neither side learns anything about the other's schema.
 *
 * Passing one is what lets a rating be recomputed and published atomically, so
 * a slower recomputation cannot commit after a newer one.
 */
export type CourseRatingWriter = {
  readonly course: {
    update(args: {
      where: { id: string };
      data: { rating: number; ratingCount: number };
    }): PromiseLike<unknown>;
  };
};

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
    writer?: CourseRatingWriter,
  ): Promise<void>;
}
