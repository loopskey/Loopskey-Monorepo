import { OrganizationAccessRequestPaginationInput } from "@org/dtos/org-access-request-pagination.input";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { SubmitOrganizationAccessRequestInput } from "@org/dtos/submit-org-access-request.input";
import { OrganizationAccessRequestMessageCode } from "@org/enums/org-access-request-message-code.enum";
import { OrganizationAccessRequestFilterInput } from "@org/dtos/org-access-request-filter";
import { ReviewOrganizationAccessRequestInput } from "@org/dtos/review-org-access-request.input";
import { BadRequestException, Injectable } from "@nestjs/common";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

@Injectable()
export class OrgAccessRequestService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly requestSelect = {
    id: true,
    goals: true,
    status: true,
    country: true,
    workEmail: true,
    createdAt: true,
    updatedAt: true,
    reviewedAt: true,
    reviewedById: true,
    rejectReason: true,
    approvedUserId: true,
    organizationName: true,
    organizationType: true,
    representativeJobRole: true,
    representativeFullName: true,
    expectedLicensedProfessionals: true,
  } satisfies Prisma.OrganizationAccessRequestSelect;

  async submitRequest(input: SubmitOrganizationAccessRequestInput) {
    const workEmail = this.normalizeEmail(input.workEmail);
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: workEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException({
        code: OrganizationAccessRequestMessageCode.USER_ALREADY_EXISTS,
        message: "A user with this work email already exists.",
      });
    }
    const existingPendingRequest =
      await this.prismaService.organizationAccessRequest.findFirst({
        where: {
          workEmail,
          status: OrganizationAccessRequestStatus.PENDING,
        },
        select: { id: true },
      });
    if (existingPendingRequest) {
      throw new ConflictException({
        code: OrganizationAccessRequestMessageCode.REQUEST_ALREADY_EXISTS,
        message:
          "A pending organization request already exists for this email.",
      });
    }

    const request = await this.prismaService.organizationAccessRequest.create({
      data: {
        representativeFullName: input.representativeFullName.trim(),
        organizationName: input.organizationName.trim(),
        workEmail,
        organizationType: input.organizationType,
        representativeJobRole: input.representativeJobRole.trim(),
        expectedLicensedProfessionals: input.expectedLicensedProfessionals,
        country: input.country.trim(),
        goals: input.goals.trim(),
        status: OrganizationAccessRequestStatus.PENDING,
      },
      select: this.requestSelect,
    });
    return request;
  }

  async findRequests(
    filter?: OrganizationAccessRequestFilterInput,
    pagination?: OrganizationAccessRequestPaginationInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.OrganizationAccessRequestWhereInput = {
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.organizationType
        ? { organizationType: filter.organizationType }
        : {}),
      ...(filter?.search
        ? {
            OR: [
              {
                representativeFullName: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                organizationName: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                workEmail: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                representativeJobRole: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                country: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.organizationAccessRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: this.requestSelect,
      }),
      this.prismaService.organizationAccessRequest.count({ where }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      items,
      pageInfo: {
        totalItems,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findRequestById(requestId: string) {
    const request =
      await this.prismaService.organizationAccessRequest.findUnique({
        where: { id: requestId },
        select: this.requestSelect,
      });
    if (!request) {
      throw new NotFoundException({
        code: OrganizationAccessRequestMessageCode.REQUEST_NOT_FOUND,
        message: "Organization access request not found.",
      });
    }
    return request;
  }

  async reviewRequest(
    input: ReviewOrganizationAccessRequestInput,
    adminId: string,
  ) {
    if (input.status === OrganizationAccessRequestStatus.PENDING) {
      throw new BadRequestException({
        code: OrganizationAccessRequestMessageCode.INVALID_REVIEW_STATUS,
        message: "Admin can only approve or reject a request.",
      });
    }
    const request =
      await this.prismaService.organizationAccessRequest.findUnique({
        where: { id: input.requestId },
      });
    if (!request) {
      throw new NotFoundException({
        code: OrganizationAccessRequestMessageCode.REQUEST_NOT_FOUND,
        message: "Organization access request not found.",
      });
    }
    if (request.status !== OrganizationAccessRequestStatus.PENDING) {
      throw new BadRequestException({
        code: OrganizationAccessRequestMessageCode.REQUEST_ALREADY_REVIEWED,
        message: "This request has already been reviewed.",
      });
    }
    if (input.status === OrganizationAccessRequestStatus.REJECTED)
      return this.rejectRequest(input, adminId);
    return this.approveRequest(input, adminId);
  }

  private async approveRequest(
    input: ReviewOrganizationAccessRequestInput,
    adminId: string,
  ) {
    const request =
      await this.prismaService.organizationAccessRequest.findUniqueOrThrow({
        where: { id: input.requestId },
      });
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: request.workEmail },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictException({
        code: OrganizationAccessRequestMessageCode.USER_ALREADY_EXISTS,
        message: "A user with this email already exists.",
      });
    }
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await argon2.hash(temporaryPassword);
    const updatedRequest = await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: request.workEmail,
          fullName: request.representativeFullName,
          passwordHash,
          role: Role.ORGANIZATION,
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
          forcePasswordChange: true,
          organizationProfile: {
            create: {
              organizationName: request.organizationName,
              contactEmail: request.workEmail,
              country: request.country,
              memberLimit: request.expectedLicensedProfessionals,
            },
          },
        },
        select: {
          id: true,
          email: true,
        },
      });
      return tx.organizationAccessRequest.update({
        where: { id: request.id },
        data: {
          status: OrganizationAccessRequestStatus.APPROVED,
          reviewedById: adminId,
          reviewedAt: new Date(),
          approvedUserId: user.id,
        },
        select: this.requestSelect,
      });
    });
    return updatedRequest;
  }

  private async rejectRequest(
    input: ReviewOrganizationAccessRequestInput,
    adminId: string,
  ) {
    const updatedRequest =
      await this.prismaService.organizationAccessRequest.update({
        where: { id: input.requestId },
        data: {
          status: OrganizationAccessRequestStatus.REJECTED,
          reviewedById: adminId,
          reviewedAt: new Date(),
          rejectReason: input.rejectReason ?? null,
        },
        select: this.requestSelect,
      });
    return updatedRequest;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private generateTemporaryPassword(length = 14) {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%";
    const all = upper + lower + numbers + symbols;
    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = password.length; i < length; i += 1) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}
