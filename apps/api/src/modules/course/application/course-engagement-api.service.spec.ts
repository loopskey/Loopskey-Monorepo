import { CourseService } from "@course/services/course.service";
import { CourseEngagementApiService } from "./course-engagement-api.service";

describe("CourseEngagementApiService", () => {
  const courseService = {
    resolveForEngagement: jest.fn(),
    updateEngagementRating: jest.fn(),
  };
  const service = new CourseEngagementApiService(
    courseService as unknown as CourseService,
  );

  beforeEach(() => jest.clearAllMocks());

  it("passes a caller's transaction through to the rating write", async () => {
    const writer = { course: { update: jest.fn() } };
    await service.updateCourseRating("course-1", 4.5, 2, writer);
    expect(courseService.updateEngagementRating).toHaveBeenCalledWith(
      "course-1",
      4.5,
      2,
      writer,
    );
  });

  it("delegates engagement reads and rating writes to Course", async () => {
    courseService.resolveForEngagement.mockResolvedValue({ id: "course-1" });
    await service.resolveCourse("course-1");
    await service.updateCourseRating("course-1", 4.5, 2);
    expect(courseService.resolveForEngagement).toHaveBeenCalledWith("course-1");
    expect(courseService.updateEngagementRating).toHaveBeenCalledWith(
      "course-1",
      4.5,
      2,
      undefined,
    );
  });
});
