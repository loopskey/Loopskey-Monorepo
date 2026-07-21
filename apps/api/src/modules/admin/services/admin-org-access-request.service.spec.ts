import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import {
  OrganizationAccessRequestStatus,
  OrganizationType,
  Role,
} from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { AdminDashboardService } from "./admin.service";
import { OrganizationReviewNotificationService } from "./organization-review-notification.service";

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

type TExistingUser = {
  id: string;
  role: Role;
  deletedAt: Date | null;
  ownedOrganization: { id: string } | null;
};

const createApprovalTx = ({
  existingUser = null,
}: { existingUser?: TExistingUser | null } = {}) => ({
  organizationAccessRequest: {
    findUnique: jest.fn().mockResolvedValue(request),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockResolvedValue({ ...request, reviewedBy: null }),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(existingUser),
    create: jest.fn().mockResolvedValue({ id: "user-1" }),
  },
  organization: { create: jest.fn().mockResolvedValue({ id: "org-1" }) },
  organizationProfile: { upsert: jest.fn() },
  organizationSettings: { create: jest.fn() },
  organizationMember: { create: jest.fn() },
  auditLog: { create: jest.fn() },
});

const createService = (prisma: unknown) =>
  new AdminDashboardService(
    prisma as PrismaService,
    {
      deliver: jest.fn().mockResolvedValue("SENT"),
    } as unknown as OrganizationReviewNotificationService,
  );

describe("AdminDashboardService organization requests", () => {
  it("lists requests with bounded cursor pagination", async () => {
    const prisma = createPrismaMock();
    prisma.organizationAccessRequest.findMany.mockResolvedValue([
      request,
      { ...request, id: "request-2" },
      { ...request, id: "request-3" },
    ]);
    prisma.organizationAccessRequest.count.mockResolvedValue(3);
    const service = createService(prisma);

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
    const service = createService(prisma);

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
    const service = createService(prisma);

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
    const service = createService(prisma);

    await expect(
      service.orgAccessRequestDetail(admin, "missing"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects list and detail access for non-Admins", async () => {
    const prisma = createPrismaMock();
    const service = createService(prisma);
    const nonAdmin = { id: "professional-1", role: Role.PROFESSIONAL };

    await expect(service.orgAccessRequests(nonAdmin)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.orgAccessRequestDetail(nonAdmin, request.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("provisions a pending Organization account on approval", async () => {
    const tx = createApprovalTx();
    const service = createService({
      $transaction: (callback: Function) => callback(tx),
    });

    await service.approveOrgAccessRequest(admin, request.id);

    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: null,
          role: Role.ORGANIZATION,
          status: "PENDING",
        }),
      }),
    );
    expect(tx.organizationMember.create).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalled();
  });

  it("links an existing pending Organization account instead of creating one", async () => {
    const tx = createApprovalTx({
      existingUser: {
        id: "org-user-9",
        role: Role.ORGANIZATION,
        deletedAt: null,
        ownedOrganization: null,
      },
    });
    const service = createService({
      $transaction: (callback: Function) => callback(tx),
    });

    await service.approveOrgAccessRequest(admin, request.id);

    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.organization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ownerId: "org-user-9" }),
      }),
    );
    expect(tx.organizationProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "org-user-9" }, update: {} }),
    );
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({ linkedExistingUser: true }),
        }),
      }),
    );
  });

  it.each([
    [
      "belongs to another role",
      {
        id: "pro-1",
        role: Role.PROFESSIONAL,
        deletedAt: null,
        ownedOrganization: null,
      },
    ],
    [
      "already owns an organization",
      {
        id: "org-user-2",
        role: Role.ORGANIZATION,
        deletedAt: null,
        ownedOrganization: { id: "org-existing" },
      },
    ],
    [
      "was deleted",
      {
        id: "org-user-3",
        role: Role.ORGANIZATION,
        deletedAt: new Date("2026-07-01T00:00:00.000Z"),
        ownedOrganization: null,
      },
    ],
  ])("refuses approval when the work email %s", async (_case, existingUser) => {
    const tx = createApprovalTx({ existingUser });
    const service = createService({
      $transaction: (callback: Function) => callback(tx),
    });

    await expect(
      service.approveOrgAccessRequest(admin, request.id),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.organization.create).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });

  it("rolls back the approval when account creation fails", async () => {
    const tx = createApprovalTx();
    tx.user.create.mockRejectedValue(new Error("account creation failed"));
    const rollback = jest.fn();
    const service = createService({
      $transaction: async (callback: Function) => {
        try {
          return await callback(tx);
        } catch (error) {
          rollback();
          throw error;
        }
      },
    });

    await expect(
      service.approveOrgAccessRequest(admin, request.id),
    ).rejects.toThrow("account creation failed");

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(tx.organization.create).not.toHaveBeenCalled();
    expect(tx.organizationMember.create).not.toHaveBeenCalled();
    expect(tx.organizationAccessRequest.update).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });

  it("requires a rejection reason before starting a transaction", async () => {
    const prisma = { $transaction: jest.fn() };
    await expect(
      createService(prisma).rejectOrgAccessRequest(admin, request.id, " "),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("records rejection atomically with its audit intent", async () => {
    const tx = {
      organizationAccessRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ ...request, reviewedBy: null }),
      },
      auditLog: { create: jest.fn() },
    };
    await createService({
      $transaction: (callback: Function) => callback(tx),
    }).rejectOrgAccessRequest(admin, request.id, "Not eligible");

    expect(tx.organizationAccessRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ rejectReason: "Not eligible" }),
      }),
    );
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            notificationIntent: expect.objectContaining({
              deliveryStatus: "PENDING",
            }),
          }),
        }),
      }),
    );
  });

  it("rejects terminal and concurrently claimed reviews", async () => {
    const terminalTx = {
      organizationAccessRequest: {
        findUnique: jest.fn().mockResolvedValue({
          ...request,
          status: OrganizationAccessRequestStatus.APPROVED,
        }),
      },
    };
    const racedTx = {
      organizationAccessRequest: {
        findUnique: jest.fn().mockResolvedValue(request),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    await expect(
      createService({
        $transaction: (callback: Function) => callback(terminalTx),
      }).approveOrgAccessRequest(admin, request.id),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      createService({
        $transaction: (callback: Function) => callback(racedTx),
      }).rejectOrgAccessRequest(admin, request.id, "Not eligible"),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects non-Admin review attempts without a transaction", async () => {
    const prisma = { $transaction: jest.fn() };
    const nonAdmin = { id: "professional-1", role: Role.PROFESSIONAL };
    await expect(
      createService(prisma).approveOrgAccessRequest(nonAdmin, request.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      createService(prisma).rejectOrgAccessRequest(
        nonAdmin,
        request.id,
        "Not eligible",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
