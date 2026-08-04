import { NotFoundException } from "@nestjs/common";
import { CatalogOrganizationApiService } from "./catalog-organization-api.service";

describe("CatalogOrganizationApiService", () => {
  const prisma = {
    course: { findFirst: jest.fn() },
    event: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const service = new CatalogOrganizationApiService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it("rejects an assignment when its catalog target does not exist", async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(
      service.assertAssignmentTarget({ eventId: "event-1" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns a cursor page of published assignable events", async () => {
    const rows = [{ id: "event-1" }, { id: "event-2" }];
    prisma.event.findMany.mockReturnValue("rows-query");
    prisma.event.count.mockReturnValue("count-query");
    prisma.$transaction.mockResolvedValue([rows, 2]);

    await expect(service.eventCatalog({ take: 1 })).resolves.toEqual({
      items: [{ id: "event-1" }],
      totalCount: 2,
      pageInfo: { hasNextPage: true, nextCursor: "event-1" },
    });
  });
});
