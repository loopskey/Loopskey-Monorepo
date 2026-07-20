import { ForbiddenException, NotFoundException } from "@nestjs/common";
import {
  OrganizationAccessRequestStatus,
  OrganizationType,
  Role,
} from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { AdminDashboardService } from "./admin.service";

const admin = { id: "admin-1", role: Role.ADMIN };
const request = {
  id: "request-1",
  goals: "Improve professional development.",
  country: "Canada",
  workEmail: "contact@example.org",
  organizationName: "Example Association",
  organizationType: OrganizationType.ASSOCIATION,
  representativeFullName: "Alex Morgan",
  representativeJobRole: "Program Director",
  expectedLicensedProfessionals: 12,
  status: OrganizationAccessRequestStatus.PENDING,
  reviewedAt: null,
  reviewedBy: null,
  reviewedById: null,
  rejectReason: null,
  approvedUserId: null,
  createdAt: new Date("2026-07-20T12:00:00.000Z"),
  updatedAt: new Date("2026-07-20T12:00:00.000Z"),
};

const createPrismaMock = () => ({
  organizationAccessRequest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
});

describe("AdminDashboardService organization requests", () => {
  it("lists requests with bounded cursor pagination", async () => {
    const prisma = createPrismaMock();
    prisma.organizationAccessRequest.findMany.mockResolvedValue([
      request,
      { ...request, id: "request-2" },
      { ...request, id: "request-3" },
    ]);
    prisma.organizationAccessRequest.count.mockResolvedValue(3);
    const service = new AdminDashboardService(
      prisma as unknown as PrismaService,
    );

    const result = await service.orgAccessRequests(admin, undefined, {
      take: 2,
    });

    expect(result.items).toHaveLength(2);
    expect(result.pageInfo).toEqual({
      hasNextPage: true,
      nextCursor: "request-2",
    });
    expect(prisma.organizationAccessRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3 }),
    );
  });

  it("applies backend search, status filtering, and sorting", async () => {
    const prisma = createPrismaMock();
    prisma.organizationAccessRequest.findMany.mockResolvedValue([]);
    prisma.organizationAccessRequest.count.mockResolvedValue(0);
    const service = new AdminDashboardService(
      prisma as unknown as PrismaService,
    );

    await service.orgAccessRequests(admin, {
      search: "  example  ",
      status: OrganizationAccessRequestStatus.REJECTED,
      sortDirection: "asc",
    });

    expect(prisma.organizationAccessRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        where: expect.objectContaining({
          status: OrganizationAccessRequestStatus.REJECTED,
          OR: expect.arrayContaining([
            {
              organizationName: {
                contains: "example",
                mode: "insensitive",
              },
            },
          ]),
        }),
      }),
    );
  });

  it("returns the requested application detail", async () => {
    const prisma = createPrismaMock();
    prisma.organizationAccessRequest.findUnique.mockResolvedValue(request);
    const service = new AdminDashboardService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.orgAccessRequestDetail(admin, request.id),
    ).resolves.toEqual(
      expect.objectContaining({
        id: request.id,
        reviewedByName: null,
      }),
    );
  });

  it("rejects a missing application detail", async () => {
    const prisma = createPrismaMock();
    prisma.organizationAccessRequest.findUnique.mockResolvedValue(null);
    const service = new AdminDashboardService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.orgAccessRequestDetail(admin, "missing"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects list and detail access for non-Admins", async () => {
    const prisma = createPrismaMock();
    const service = new AdminDashboardService(
      prisma as unknown as PrismaService,
    );
    const nonAdmin = { id: "professional-1", role: Role.PROFESSIONAL };

    await expect(service.orgAccessRequests(nonAdmin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.orgAccessRequestDetail(nonAdmin, request.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
