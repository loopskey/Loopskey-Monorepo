import { Role } from "@prisma/client";

import { PrismaService } from "@prisma/prisma.service";
import { CourseService } from "./course.service";

const PROVIDER = { id: "provider-1", role: Role.PROVIDER };
const EXISTING = { id: "course-1", providerId: PROVIDER.id };

const setup = () => {
  const prisma = {
    course: {
      findFirst: jest.fn().mockResolvedValue(EXISTING),
      findUnique: jest.fn().mockResolvedValue(EXISTING),
      update: jest.fn().mockResolvedValue(EXISTING),
    },
  };
  return {
    prisma,
    service: new CourseService(prisma as unknown as PrismaService),
  };
};

const stampedAt = (prisma: ReturnType<typeof setup>["prisma"]) => {
  const [call] = prisma.course.update.mock.calls;
  return (call[0] as { data: { publicContentUpdatedAt?: Date } }).data
    .publicContentUpdatedAt;
};

describe("CourseService public content change timestamp", () => {
  it.each([
    "publishCourse",
    "archiveCourse",
    "softDeleteCourse",
    "restoreCourse",
  ] as const)("moves the timestamp on %s", async (method) => {
    const { service, prisma } = setup();

    await service[method]("course-1", PROVIDER);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("moves the timestamp when public content is edited", async () => {
    const { service, prisma } = setup();

    await service.updateCourse(
      { courseId: "course-1", title: "Renamed" },
      PROVIDER,
    );

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("leaves the timestamp alone when only the rating is recomputed", async () => {
    const { service, prisma } = setup();

    await service.updateEngagementRating("course-1", 4.5, 10);

    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: "course-1" },
      data: { rating: 4.5, ratingCount: 10 },
    });
    expect(stampedAt(prisma)).toBeUndefined();
  });
});
