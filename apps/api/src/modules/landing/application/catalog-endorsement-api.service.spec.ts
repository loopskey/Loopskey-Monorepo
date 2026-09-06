import { CatalogEndorsementApiService } from "@landing/application/catalog-endorsement-api.service";
import { CourseStatus, EventStatus } from "@prisma/client";
import { YouTubeVideoStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { ContentType } from "@prisma/client";

const setup = ({
  courses = [],
  events = [],
  podcasts = [],
  videos = [],
}: {
  courses?: Record<string, unknown>[];
  events?: Record<string, unknown>[];
  podcasts?: Record<string, unknown>[];
  videos?: Record<string, unknown>[];
} = {}) => {
  const courseFindMany = jest.fn().mockResolvedValue(courses);
  const eventFindMany = jest.fn().mockResolvedValue(events);
  const podcastFindMany = jest.fn().mockResolvedValue(podcasts);
  const videoFindMany = jest.fn().mockResolvedValue(videos);

  const prisma = {
    course: { findMany: courseFindMany },
    event: { findMany: eventFindMany },
    podcast: { findMany: podcastFindMany },
    youTubeVideo: { findMany: videoFindMany },
  };

  return {
    courseFindMany,
    eventFindMany,
    podcastFindMany,
    videoFindMany,
    service: new CatalogEndorsementApiService(
      prisma as unknown as PrismaService,
    ),
  };
};

describe("CatalogEndorsementApiService", () => {
  describe("search", () => {
    it("offers only published, undeleted courses", async () => {
      const { service, courseFindMany } = setup();

      await service.searchCatalog({
        contentType: ContentType.COURSE,
        search: "risk",
        take: 10,
      });

      expect(courseFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: CourseStatus.PUBLISHED,
            title: { contains: "risk", mode: "insensitive" },
          }),
        }),
      );
    });

    it("searches every content type when none is named", async () => {
      const { service, courseFindMany, eventFindMany } = setup();
      const { podcastFindMany, videoFindMany } = setup();

      await service.searchCatalog({ take: 10 });

      expect(courseFindMany).toHaveBeenCalled();
      expect(eventFindMany).toHaveBeenCalled();
      expect(podcastFindMany).not.toHaveBeenCalled();
      expect(videoFindMany).not.toHaveBeenCalled();
    });

    it("names the channel as a video's provider", async () => {
      const { service } = setup({
        videos: [
          {
            id: "video-1",
            title: "A talk",
            thumbnailUrl: "https://example.test/thumb.jpg",
            channel: { title: "A Channel" },
          },
        ],
      });

      await expect(
        service.searchCatalog({ contentType: ContentType.YOUTUBE, take: 10 }),
      ).resolves.toEqual([
        {
          contentType: ContentType.YOUTUBE,
          contentId: "video-1",
          title: "A talk",
          imageUrl: "https://example.test/thumb.jpg",
          provider: "A Channel",
          isAvailable: true,
        },
      ]);
    });
  });

  describe("resolving what was endorsed", () => {
    it("reads nothing when nothing was asked for", async () => {
      const { service, courseFindMany } = setup();

      await expect(service.resolveCatalogItems([])).resolves.toEqual([]);
      expect(courseFindMany).not.toHaveBeenCalled();
    });

    it("batches one read per content type rather than one per item", async () => {
      const { service, courseFindMany } = setup();

      await service.resolveCatalogItems([
        { contentType: ContentType.COURSE, contentId: "course-1" },
        { contentType: ContentType.COURSE, contentId: "course-2" },
        { contentType: ContentType.COURSE, contentId: "course-1" },
      ]);

      expect(courseFindMany).toHaveBeenCalledTimes(1);
      expect(courseFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ["course-1", "course-2"] } },
        }),
      );
    });

    it("reports a course that was unpublished after endorsement as unavailable", async () => {
      const { service } = setup({
        courses: [
          {
            id: "course-1",
            title: "Advanced Risk",
            status: CourseStatus.DRAFT,
            imageUrl: null,
            deletedAt: null,
            provider: { fullName: "A Provider" },
          },
        ],
      });

      await expect(
        service.resolveCatalogItems([
          { contentType: ContentType.COURSE, contentId: "course-1" },
        ]),
      ).resolves.toEqual([
        expect.objectContaining({ title: "Advanced Risk", isAvailable: false }),
      ]);
    });

    it("reports a soft-deleted course as unavailable while still naming it", async () => {
      const { service } = setup({
        courses: [
          {
            id: "course-1",
            title: "Advanced Risk",
            status: CourseStatus.PUBLISHED,
            imageUrl: null,
            deletedAt: new Date(),
            provider: null,
          },
        ],
      });

      const [item] = await service.resolveCatalogItems([
        { contentType: ContentType.COURSE, contentId: "course-1" },
      ]);

      expect(item.isAvailable).toBe(false);
      expect(item.title).toBe("Advanced Risk");
    });

    it("returns nothing for content the catalogue no longer has", async () => {
      const { service } = setup({ courses: [] });

      await expect(
        service.resolveCatalogItems([
          { contentType: ContentType.COURSE, contentId: "gone" },
        ]),
      ).resolves.toEqual([]);
    });

    it("prefers an event's organizer over its speaker", async () => {
      const { service } = setup({
        events: [
          {
            id: "event-1",
            title: "A conference",
            status: EventStatus.PUBLISHED,
            imageUrl: null,
            speaker: "A Speaker",
            organizer: "An Organizer",
            deletedAt: null,
          },
        ],
      });

      const [item] = await service.resolveCatalogItems([
        { contentType: ContentType.EVENT, contentId: "event-1" },
      ]);

      expect(item.provider).toBe("An Organizer");
      expect(item.isAvailable).toBe(true);
    });

    it("falls back to the speaker when an event has no organizer", async () => {
      const { service } = setup({
        events: [
          {
            id: "event-1",
            title: "A conference",
            status: EventStatus.PUBLISHED,
            imageUrl: null,
            speaker: "A Speaker",
            organizer: null,
            deletedAt: null,
          },
        ],
      });

      const [item] = await service.resolveCatalogItems([
        { contentType: ContentType.EVENT, contentId: "event-1" },
      ]);

      expect(item.provider).toBe("A Speaker");
    });

    it("treats an archived video as unavailable", async () => {
      const { service } = setup({
        videos: [
          {
            id: "video-1",
            title: "A talk",
            status: YouTubeVideoStatus.ARCHIVED,
            thumbnailUrl: null,
            channel: { title: "A Channel" },
          },
        ],
      });

      const [item] = await service.resolveCatalogItems([
        { contentType: ContentType.YOUTUBE, contentId: "video-1" },
      ]);

      expect(item.isAvailable).toBe(false);
    });
  });
});
