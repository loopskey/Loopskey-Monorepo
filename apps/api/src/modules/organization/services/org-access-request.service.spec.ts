import { ConflictException } from "@nestjs/common";
import {
  OrganizationAccessRequestStatus,
  OrganizationType,
} from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { OrgAccessRequestService } from "./org-access-request.service";

const input = {
  representativeFullName: " Alex Morgan ",
  organizationName: " Example Association ",
  workEmail: " ALEX@EXAMPLE.ORG ",
  organizationType: OrganizationType.ASSOCIATION,
  representativeJobRole: " Program Director ",
  expectedLicensedProfessionals: 12,
  country: " Canada ",
  goals: " Support continuing professional development. ",
};

const submittedRequest = {
  id: "request-1",
  representativeFullName: "Alex Morgan",
  organizationName: "Example Association",
  workEmail: "alex@example.org",
  organizationType: OrganizationType.ASSOCIATION,
  representativeJobRole: "Program Director",
  expectedLicensedProfessionals: 12,
  country: "Canada",
  goals: "Support continuing professional development.",
  status: OrganizationAccessRequestStatus.PENDING,
  reviewedById: null,
  reviewedAt: null,
  rejectReason: null,
  approvedUserId: null,
  createdAt: new Date("2026-07-20T12:00:00.000Z"),
  updatedAt: new Date("2026-07-20T12:00:00.000Z"),
};

const createPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
  },
  organizationAccessRequest: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
});

describe("OrgAccessRequestService.submitRequest", () => {
  it("stores a normalized request with a server-assigned pending status", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.organizationAccessRequest.findFirst.mockResolvedValue(null);
    prisma.organizationAccessRequest.create.mockResolvedValue(submittedRequest);
    const service = new OrgAccessRequestService(
      prisma as unknown as PrismaService,
    );

    await expect(service.submitRequest(input)).resolves.toEqual(
      submittedRequest,
    );
    expect(prisma.organizationAccessRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          workEmail: "alex@example.org",
          organizationName: "Example Association",
          status: OrganizationAccessRequestStatus.PENDING,
        }),
      }),
    );
  });

  it("rejects a duplicate pending application before writing", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.organizationAccessRequest.findFirst.mockResolvedValue({
      id: "existing-request",
    });
    const service = new OrgAccessRequestService(
      prisma as unknown as PrismaService,
    );

    await expect(service.submitRequest(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.organizationAccessRequest.create).not.toHaveBeenCalled();
  });

  it("does not create an application for an existing user", async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({ id: "existing-user" });
    const service = new OrgAccessRequestService(
      prisma as unknown as PrismaService,
    );

    await expect(service.submitRequest(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.organizationAccessRequest.findFirst).not.toHaveBeenCalled();
    expect(prisma.organizationAccessRequest.create).not.toHaveBeenCalled();
  });
});
