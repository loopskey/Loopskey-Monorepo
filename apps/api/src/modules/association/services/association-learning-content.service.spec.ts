import { AssociationLearningContentService } from "@association/services/association-learning-content.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { type CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationGroupService } from "@association/services/association-group.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { ContentType, PDUCategory, Prisma, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const contentRow = (overrides: Record<string, unknown> = {}) => ({
  id: "item-1",
  contentType: ContentType.COURSE,
  contentId: "course-1",
  externalTitle: null,
  externalProvider: null,
  externalUrl: null,
  description: null,
  category: PDUCategory.TECHNICAL,
  indicativeCredits: 5,
  requirementId: null,
  status: AssociationLearningContentStatus.DRAFT,
  publishedAt: null,
  withdrawnAt: null,
  audienceKind: AssociationAudienceKind.ALL_MEMBERS,
  groupId: null,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  group: null,
  requirement: null,
  ...overrides,
});

const catalogItem = (overrides: Record<string, unknown> = {}) => ({
  contentType: ContentType.COURSE,
  contentId: "course-1",
  title: "Advanced Risk",
  provider: "A Provider",
  imageUrl: "https://example.test/cover.png",
  isAvailable: true,
  ...overrides,
});

const duplicate = () =>
  new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "6.11.1",
  });

const setup = ({
  rows = [contentRow()],
  resolved = [catalogItem()],
  createResult = contentRow(),
  createError = null,
  winner = { id: "item-1" },
  requirement = { id: "req-1" },
  engagement = [
    {
      contentType: ContentType.COURSE,
      contentId: "course-1",
      memberCount: 3,
      credits: 12,
    },
  ],
  resolveThrows = false,
  updateManyCount = 1,
  deleteManyCount = 1,
}: {
  rows?: ReturnType<typeof contentRow>[];
  resolved?: ReturnType<typeof catalogItem>[];
  createResult?: ReturnType<typeof contentRow>;
  createError?: unknown;
  winner?: { id: string } | null;
  requirement?: { id: string } | null;
  engagement?: Record<string, unknown>[];
  resolveThrows?: boolean;
  updateManyCount?: number;
  deleteManyCount?: number;
} = {}) => {
  const create = createError
    ? jest.fn().mockRejectedValue(createError)
    : jest.fn().mockResolvedValue(createResult);
  const update = jest.fn().mockResolvedValue(rows[0] ?? contentRow());
  const updateMany = jest.fn().mockResolvedValue({ count: updateManyCount });
  const deleteMany = jest.fn().mockResolvedValue({ count: deleteManyCount });
  const findMany = jest.fn().mockResolvedValue(rows);
  const findFirst = jest
    .fn()
    .mockImplementation(({ where }) =>
      where?.contentType && where?.contentId && !where.id
        ? winner
        : (rows[0] ?? null),
    );
  const count = jest.fn().mockResolvedValue(rows.length);

  const resolveCatalogItems = resolveThrows
    ? jest.fn().mockRejectedValue(new Error("catalogue unreachable"))
    : jest.fn().mockResolvedValue(resolved);

  const prisma = {
    associationLearningContent: {
      create,
      update,
      updateMany,
      deleteMany,
      findMany,
      findFirst,
      count,
    },
    associationRequirement: {
      findFirst: jest.fn().mockResolvedValue(requirement),
    },
    associationMember: {
      findMany: jest.fn().mockResolvedValue([{ userId: "user-1" }]),
    },
  };

  const access = {
    requireOwned: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
    requireReadable: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const groups = { requireGroup: jest.fn().mockResolvedValue({ id: "g-1" }) };

  const catalog = {
    resolveCatalogItems,
    searchCatalog: jest.fn().mockResolvedValue(resolved),
  };

  const activities = {
    contentEngagement: jest.fn().mockResolvedValue(engagement),
  };

  return {
    create,
    update,
    groups,
    catalog,
    updateMany,
    deleteMany,
    activities,
    resolveCatalogItems,
    service: new AssociationLearningContentService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      groups as unknown as AssociationGroupService,
      catalog as unknown as CatalogEndorsementApi,
      activities as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationLearningContentService", () => {
  describe("endorsing catalogue content", () => {
    it("stores only the type and the id, never a copied title", async () => {
      const { service, create } = setup();

      await service.create(owner, {
        category: PDUCategory.TECHNICAL,
        contentType: ContentType.COURSE,
        contentId: "course-1",
      });

      const written = create.mock.calls[0][0].data;
      expect(written).toEqual(
        expect.objectContaining({
          contentType: ContentType.COURSE,
          contentId: "course-1",
          externalTitle: null,
          externalProvider: null,
          externalUrl: null,
        }),
      );
      expect(JSON.stringify(written)).not.toContain("Advanced Risk");
    });

    it("shows the catalogue's current title at read time", async () => {
      const { service } = setup({
        resolved: [catalogItem({ title: "Renamed In The Catalogue" })],
      });

      const page = await service.list(owner);

      expect(page.items[0].title).toBe("Renamed In The Catalogue");
    });

    it("refuses content the catalogue does not have", async () => {
      const { service } = setup({ resolved: [] });

      await expect(
        service.create(owner, {
          category: PDUCategory.TECHNICAL,
          contentType: ContentType.COURSE,
          contentId: "course-9",
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.CATALOG_CONTENT_NOT_FOUND },
      });
    });

    it("refuses content that is no longer published", async () => {
      const { service } = setup({
        resolved: [catalogItem({ isAvailable: false })],
      });

      await expect(
        service.create(owner, {
          category: PDUCategory.TECHNICAL,
          contentType: ContentType.COURSE,
          contentId: "course-1",
        }),
      ).rejects.toMatchObject({
        response: {
          code: AssociationMessageCode.CATALOG_CONTENT_NOT_PUBLISHED,
        },
      });
    });

    it("recovers a duplicate endorsement into an update of the winning row", async () => {
      const { service, update } = setup({ createError: duplicate() });

      const item = await service.create(owner, {
        category: PDUCategory.TECHNICAL,
        contentType: ContentType.COURSE,
        contentId: "course-1",
      });

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "item-1" } }),
      );
      expect(item.id).toBe("item-1");
    });

    it("rethrows a unique violation it cannot attribute to a catalogue item", async () => {
      const { service } = setup({ createError: duplicate(), winner: null });

      await expect(
        service.create(owner, {
          category: PDUCategory.TECHNICAL,
          contentType: ContentType.COURSE,
          contentId: "course-1",
        }),
      ).rejects.toMatchObject({ code: "P2002" });
    });
  });

  describe("external resources", () => {
    it("refuses one with no link", async () => {
      const { service } = setup();

      await expect(
        service.create(owner, {
          category: PDUCategory.TECHNICAL,
          externalTitle: "A useful webinar",
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.LEARNING_CONTENT_INVALID },
      });
    });

    it("refuses one with no title", async () => {
      const { service } = setup();

      await expect(
        service.create(owner, {
          category: PDUCategory.TECHNICAL,
          externalUrl: "https://example.test/webinar",
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.LEARNING_CONTENT_INVALID },
      });
    });

    it("never asks the catalogue about one", async () => {
      const { service, resolveCatalogItems } = setup({
        createResult: contentRow({
          contentType: null,
          contentId: null,
          externalTitle: "A useful webinar",
          externalUrl: "https://example.test/webinar",
        }),
      });

      const item = await service.create(owner, {
        category: PDUCategory.TECHNICAL,
        externalTitle: "A useful webinar",
        externalUrl: "https://example.test/webinar",
      });

      expect(resolveCatalogItems).not.toHaveBeenCalled();
      expect(item.isExternal).toBe(true);
      expect(item.isAvailable).toBe(true);
      expect(item.title).toBe("A useful webinar");
    });
  });

  describe("availability", () => {
    it("shows an unpublished endorsement as unavailable rather than dropping it", async () => {
      const { service } = setup({
        resolved: [catalogItem({ isAvailable: false })],
      });

      const page = await service.list(owner);

      expect(page.items).toHaveLength(1);
      expect(page.items[0].isAvailable).toBe(false);
    });

    it("shows content the catalogue has lost as unavailable", async () => {
      const { service } = setup({ resolved: [] });

      const page = await service.list(owner);

      expect(page.items[0].isAvailable).toBe(false);
      expect(page.items[0].title).toBe("");
    });

    it("still renders the list when the catalogue port fails", async () => {
      const { service } = setup({ resolveThrows: true });

      const page = await service.list(owner);

      expect(page.items).toHaveLength(1);
      expect(page.items[0].isAvailable).toBe(true);
    });
  });

  describe("publication", () => {
    it("moves a draft to published with a conditional write", async () => {
      const { service, updateMany } = setup();

      await service.publish(owner, {
        learningContentId: "item-1",
        audienceKind: AssociationAudienceKind.ALL_MEMBERS,
      });

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: "item-1",
            status: { not: AssociationLearningContentStatus.PUBLISHED },
          }),
        }),
      );
    });

    it("tells the loser of a publish race that it was already published", async () => {
      const { service } = setup({ updateManyCount: 0 });

      await expect(
        service.publish(owner, {
          learningContentId: "item-1",
          audienceKind: AssociationAudienceKind.ALL_MEMBERS,
        }),
      ).rejects.toMatchObject({
        response: {
          code: AssociationMessageCode.LEARNING_CONTENT_STATUS_CONFLICT,
        },
      });
    });

    it("refuses a group audience with no group", async () => {
      const { service } = setup();

      await expect(
        service.publish(owner, {
          learningContentId: "item-1",
          audienceKind: AssociationAudienceKind.GROUP,
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.AUDIENCE_EMPTY },
      });
    });

    it("refuses a specific-members audience, which a library does not have", async () => {
      const { service } = setup();

      await expect(
        service.publish(owner, {
          learningContentId: "item-1",
          audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.AUDIENCE_EMPTY },
      });
    });

    it("withdraws only a published item", async () => {
      const { service, updateMany } = setup();

      await service.withdraw(owner, "item-1");

      expect(updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AssociationLearningContentStatus.PUBLISHED,
          }),
        }),
      );
    });
  });

  describe("deletion", () => {
    it("deletes a draft", async () => {
      const { service, deleteMany } = setup();

      await expect(service.remove(owner, "item-1")).resolves.toEqual({
        id: "item-1",
        deleted: true,
      });
      expect(deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AssociationLearningContentStatus.DRAFT,
          }),
        }),
      );
    });

    it("refuses a published item and points at withdrawal instead", async () => {
      const { service } = setup({ deleteManyCount: 0 });

      await expect(service.remove(owner, "item-1")).rejects.toMatchObject({
        response: {
          code: AssociationMessageCode.LEARNING_CONTENT_NOT_DELETABLE,
        },
      });
    });
  });

  describe("engagement", () => {
    it("counts the members who recorded activities against the item", async () => {
      const { service, activities } = setup();

      const item = await service.one(owner, "item-1");

      expect(item.engagement).toEqual({ memberCount: 3, credits: 12 });
      expect(activities.contentEngagement).toHaveBeenCalledWith({
        userIds: ["user-1"],
        references: [
          { contentType: ContentType.COURSE, contentId: "course-1" },
        ],
      });
    });

    it("has no engagement for an external resource", async () => {
      const { service, activities } = setup({
        rows: [
          contentRow({
            contentType: null,
            contentId: null,
            externalTitle: "A useful webinar",
            externalUrl: "https://example.test/webinar",
          }),
        ],
      });

      const item = await service.one(owner, "item-1");

      expect(item.engagement).toBe(null);
      expect(activities.contentEngagement).not.toHaveBeenCalled();
    });
  });
});
