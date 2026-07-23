import { AuditAction, Prisma, Role, UserStatus } from "@prisma/client";
import { OrganizationReviewNotificationService } from "@admin/services/organization-review-notification.service";
import { AdminOrgAccessRequestFilterInput } from "@admin/dtos/admin-org-access-request-filter.input";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateAdminUserStatusInput } from "@admin/dtos/update-admin-user-status.input";
import { AdminDashboardMessageCode } from "@admin/enums/message-code.enum";
import { OrganizationMemberStatus } from "@prisma/client";
import { AdminAuditLogFilterInput } from "@admin/dtos/admin-audit-log-filter.input";
import { UpdateAdminProfileInput } from "@admin/dtos/update-admin-profile.input";
import { AdminUserFilterInput } from "@admin/dtos/admin-user-filter.input";
import { AdminPaginationInput } from "@admin/dtos/admin-pagination.input";
import { BadRequestException } from "@nestjs/common";
import { TAdminDashboardUser } from "@admin/types/admin-service.types";
import { ForbiddenException } from "@nestjs/common";
import { ConflictException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewNotification: OrganizationReviewNotificationService,
  ) {}

  private assertAdmin(user: TAdminDashboardUser) {
    if (user.role !== Role.ADMIN)
      throw new ForbiddenException(AdminDashboardMessageCode.ADMIN_ONLY);
  }

  async profile(user: TAdminDashboardUser) {
    this.assertAdmin(user);
    const admin = await this.prismaService.user.findFirst({
      where: { id: user.id, role: Role.ADMIN, deletedAt: null },
    });
    if (!admin)
      throw new NotFoundException(AdminDashboardMessageCode.USER_NOT_FOUND);
    return admin;
  }

  async updateProfile(
    user: TAdminDashboardUser,
    input: UpdateAdminProfileInput,
  ) {
    this.assertAdmin(user);
    const updated = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        fullName: input.fullName,
        email: input.email?.trim().toLowerCase(),
        avatarUrl: input.avatarUrl,
        bio: input.bio,
      },
    });
    await this.createAudit(
      user.id,
      AuditAction.ADMIN_PROFILE_UPDATED,
      "User",
      user.id,
    );
    return updated;
  }

  async overview(user: TAdminDashboardUser) {
    this.assertAdmin(user);
    const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] =
      await Promise.all([
        this.prismaService.organizationAccessRequest.count(),
        this.prismaService.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.PENDING },
        }),
        this.prismaService.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.APPROVED },
        }),
        this.prismaService.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.REJECTED },
        }),
      ]);
    const from = new Date();
    from.setDate(from.getDate() - 13);
    from.setHours(0, 0, 0, 0);
    const requests =
      await this.prismaService.organizationAccessRequest.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true },
      });
    const trendMap = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const date = new Date(from);
      date.setDate(from.getDate() + i);
      trendMap.set(date.toISOString().slice(0, 10), 0);
    }
    for (const request of requests) {
      const key = request.createdAt.toISOString().slice(0, 10);
      trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
    }
    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      requestTrend: Array.from(trendMap.entries()).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  async users(
    user: TAdminDashboardUser,
    filter?: AdminUserFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    const take = pagination?.take ?? 20;
    const search = filter?.search?.trim();
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: filter?.role
        ? filter.role
        : { in: [Role.PROVIDER, Role.PROFESSIONAL, Role.ORGANIZATION] },
      ...(filter?.status ? { status: filter.status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              {
                providerProfile: {
                  organizationName: { contains: search, mode: "insensitive" },
                },
              },
              {
                organizationProfile: {
                  organizationName: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
      ...(filter?.premiumOnly ? { providerProfile: { isPremium: true } } : {}),
    };
    const rows = await this.prismaService.user.findMany({
      where,
      include: {
        providerProfile: true,
        professionalProfile: true,
      },
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
    });

    const items = rows.slice(0, take).map((item) => ({
      id: item.id,
      role: item.role,
      email: item.email,
      status: item.status,
      fullName: item.fullName,
      createdAt: item.createdAt,
      avatarUrl: item.avatarUrl,
      updatedAt: item.updatedAt,
      lastLoginAt: item.lastLoginAt,
      isPremium: Boolean(item.providerProfile?.isPremium),
      location:
        item.professionalProfile?.workLocation ??
        item.providerProfile?.organizationName ??
        null,
    }));
    return {
      items,
      totalCount: await this.prismaService.user.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async updateUserStatus(
    user: TAdminDashboardUser,
    input: UpdateAdminUserStatusInput,
  ) {
    this.assertAdmin(user);
    const target = await this.prismaService.user.findFirst({
      where: { id: input.userId, deletedAt: null },
    });
    if (!target)
      throw new NotFoundException(AdminDashboardMessageCode.USER_NOT_FOUND);
    const updated = await this.prismaService.user.update({
      where: { id: input.userId },
      data: {
        status: input.status,
        deletedAt: input.status === UserStatus.DELETED ? new Date() : null,
      },
    });
    await this.createAudit(
      user.id,
      AuditAction.USER_STATUS_UPDATED,
      "User",
      input.userId,
      {
        status: input.status,
      },
    );
    return updated;
  }

  async userGrowth(
    user: TAdminDashboardUser,
    mode: "DAILY" | "MONTHLY" = "DAILY",
  ) {
    this.assertAdmin(user);
    const from = new Date();
    if (mode === "MONTHLY") from.setMonth(from.getMonth() - 11);
    else from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    const users = await this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: from },
        role: { in: [Role.PROVIDER, Role.PROFESSIONAL] },
      },
      select: {
        role: true,
        createdAt: true,
      },
    });
    const map = new Map<
      string,
      {
        providers: number;
        professionals: number;
      }
    >();
    for (const item of users) {
      const key =
        mode === "MONTHLY"
          ? item.createdAt.toISOString().slice(0, 7)
          : item.createdAt.toISOString().slice(0, 10);
      const current = map.get(key) ?? {
        providers: 0,
        professionals: 0,
      };
      if (item.role === Role.PROVIDER) current.providers += 1;
      if (item.role === Role.PROFESSIONAL) current.professionals += 1;
      map.set(key, current);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        label: date,
        providers: value.providers,
        professionals: value.professionals,
        total: value.providers + value.professionals,
      }));
  }

  async orgAccessRequests(
    user: TAdminDashboardUser,
    filter?: AdminOrgAccessRequestFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    const take = pagination?.take ?? 20;
    const search = filter?.search?.trim();
    const where: Prisma.OrganizationAccessRequestWhereInput = {
      ...(filter?.status ? { status: filter.status } : {}),
      ...(search
        ? {
            OR: [
              { organizationName: { contains: search, mode: "insensitive" } },
              { workEmail: { contains: search, mode: "insensitive" } },
              {
                representativeFullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };
    const rows = await this.prismaService.organizationAccessRequest.findMany({
      where,
      include: {
        reviewedBy: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: [
        { createdAt: filter?.sortDirection ?? "desc" },
        { id: filter?.sortDirection ?? "desc" },
      ],
    });
    const items = rows.slice(0, take).map(({ reviewedBy, ...request }) => ({
      ...request,
      reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
    }));
    return {
      items,
      totalCount: await this.prismaService.organizationAccessRequest.count({
        where,
      }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async orgAccessRequestDetail(user: TAdminDashboardUser, requestId: string) {
    this.assertAdmin(user);
    const request =
      await this.prismaService.organizationAccessRequest.findUnique({
        where: { id: requestId },
        include: {
          reviewedBy: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });
    if (!request)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORG_ACCESS_REQUEST_NOT_FOUND,
      );
    const { reviewedBy, ...detail } = request;
    return {
      ...detail,
      reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
    };
  }

  async approveOrgAccessRequest(user: TAdminDashboardUser, requestId: string) {
    this.assertAdmin(user);
    const result = await this.prismaService.$transaction(async (tx) => {
      const request = await tx.organizationAccessRequest.findUnique({
        where: { id: requestId },
      });
      if (!request)
        throw new NotFoundException(
          AdminDashboardMessageCode.ORG_ACCESS_REQUEST_NOT_FOUND,
        );
      if (request.status !== OrganizationAccessRequestStatus.PENDING)
        throw new ConflictException({
          code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_ALREADY_REVIEWED,
          message:
            "This organization access request has already been reviewed.",
        });
      this.assertValidOrganizationRequest(request);

      const reviewClaim = await tx.organizationAccessRequest.updateMany({
        where: {
          id: requestId,
          status: OrganizationAccessRequestStatus.PENDING,
        },
        data: {
          status: OrganizationAccessRequestStatus.APPROVED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          rejectReason: null,
        },
      });
      if (reviewClaim.count !== 1)
        throw new ConflictException({
          code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_ALREADY_REVIEWED,
          message:
            "This organization access request was reviewed by another admin.",
        });

      const email = request.workEmail.trim().toLowerCase();
      const linkedUser = await this.resolveApprovalOwner(tx, email);
      const ownerId =
        linkedUser?.id ??
        (
          await tx.user.create({
            data: {
              email,
              passwordHash: null,
              role: Role.ORGANIZATION,
              status: UserStatus.PENDING,
              forcePasswordChange: false,
              emailVerifiedAt: null,
              fullName: request.representativeFullName.trim(),
            },
            select: {
              id: true,
            },
          })
        ).id;
      if (!linkedUser)
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: AuditAction.ORGANIZATION_ACCOUNT_CREATED,
            entityType: "User",
            entityId: ownerId,
            metadata: { email, requestId },
          },
        });

      const organization = await tx.organization.create({
        data: {
          ownerId,
          country: request.country.trim(),
          name: request.organizationName.trim(),
        },
        select: { id: true },
      });
      await tx.organizationProfile.upsert({
        where: { userId: ownerId },
        create: {
          userId: ownerId,
          country: request.country.trim(),
          contactEmail: email,
          organizationName: request.organizationName.trim(),
          memberLimit: request.expectedLicensedProfessionals,
        },
        update: {},
      });
      await tx.organizationSettings.create({
        data: { organizationId: organization.id },
      });
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: ownerId,
          jobRole: request.representativeJobRole.trim(),
          status: OrganizationMemberStatus.ACTIVE,
        },
      });
      const approvedRequest = await tx.organizationAccessRequest.update({
        where: { id: requestId },
        data: {
          approvedUserId: ownerId,
        },
        include: {
          reviewedBy: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: AuditAction.ORG_ACCESS_REQUEST_APPROVED,
          entityType: "OrganizationAccessRequest",
          entityId: requestId,
          metadata: {
            workEmail: email,
            organizationId: organization.id,
            approvedUserId: ownerId,
            linkedExistingUser: Boolean(linkedUser),
            notificationIntent: {
              type: "ORGANIZATION_REQUEST_APPROVED",
              deliveryStatus: "PENDING",
            },
          },
        },
      });
      const { reviewedBy, ...result } = approvedRequest;
      return {
        ...result,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      };
    });
    const notificationStatus = await this.reviewNotification.deliver(requestId);
    return { ...result, notificationStatus };
  }

  async rejectOrgAccessRequest(
    user: TAdminDashboardUser,
    requestId: string,
    reason: string,
  ) {
    this.assertAdmin(user);
    const rejectReason = reason.trim();
    if (rejectReason.length < 3 || rejectReason.length > 1000)
      throw new BadRequestException({
        code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_INVALID,
        message:
          "A rejection reason between 3 and 1000 characters is required.",
      });

    const result = await this.prismaService.$transaction(async (tx) => {
      const request = await tx.organizationAccessRequest.findUnique({
        where: { id: requestId },
      });
      if (!request)
        throw new NotFoundException(
          AdminDashboardMessageCode.ORG_ACCESS_REQUEST_NOT_FOUND,
        );
      if (request.status !== OrganizationAccessRequestStatus.PENDING)
        throw new ConflictException({
          code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_ALREADY_REVIEWED,
          message:
            "This organization access request has already been reviewed.",
        });

      const reviewClaim = await tx.organizationAccessRequest.updateMany({
        where: {
          id: requestId,
          status: OrganizationAccessRequestStatus.PENDING,
        },
        data: {
          status: OrganizationAccessRequestStatus.REJECTED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          rejectReason,
        },
      });
      if (reviewClaim.count !== 1)
        throw new ConflictException({
          code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_ALREADY_REVIEWED,
          message:
            "This organization access request was reviewed by another admin.",
        });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: AuditAction.ORG_ACCESS_REQUEST_REJECTED,
          entityType: "OrganizationAccessRequest",
          entityId: requestId,
          metadata: {
            reason: rejectReason,
            notificationIntent: {
              type: "ORGANIZATION_REQUEST_REJECTED",
              deliveryStatus: "PENDING",
            },
          },
        },
      });
      const rejectedRequest =
        await tx.organizationAccessRequest.findUniqueOrThrow({
          where: { id: requestId },
          include: {
            reviewedBy: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        });
      const { reviewedBy, ...result } = rejectedRequest;
      return {
        ...result,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      };
    });
    const notificationStatus = await this.reviewNotification.deliver(requestId);
    return { ...result, notificationStatus };
  }

  async resendOrgAccessRequestNotification(
    user: TAdminDashboardUser,
    requestId: string,
  ) {
    this.assertAdmin(user);
    const notificationStatus = await this.reviewNotification.deliver(
      requestId,
      true,
    );
    const request = await this.orgAccessRequestDetail(user, requestId);
    return { ...request, notificationStatus };
  }

  async auditLogs(
    user: TAdminDashboardUser,
    filter?: AdminAuditLogFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    const take = pagination?.take ?? 20;
    const where: Prisma.AuditLogWhereInput = {
      ...(filter?.action ? { action: filter.action } : {}),
      ...(filter?.entityId ? { entityType: filter.entityId } : {}),
      ...(filter?.from || filter?.to
        ? {
            createdAt: {
              ...(filter.from ? { gte: new Date(filter.from) } : {}),
              ...(filter.to ? { lte: new Date(filter.to) } : {}),
            },
          }
        : {}),
      ...(filter?.search
        ? {
            OR: [
              {
                actor: {
                  email: { contains: filter.search, mode: "insensitive" },
                },
              },
              { entityType: { contains: filter.search, mode: "insensitive" } },
              { entityId: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const rows = await this.prismaService.auditLog.findMany({
      where,
      include: { actor: true },
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
    });
    const items = rows.slice(0, take).map((log) => ({
      id: log.id,
      action: log.action,
      actorId: log.actorId,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt,
      entityType: log.entityType,
      actorEmail: log.actor?.email,
    }));
    return {
      items,
      totalCount: await this.prismaService.auditLog.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async createAudit(
    actorId: string,
    action: AuditAction,
    entityType?: string,
    entityId?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prismaService.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  }

  /**
   * Decides whether an existing account for the work email can own the new
   * organization. Returns null when no account exists and one must be created.
   * An existing account is never overwritten or promoted into ORGANIZATION.
   */
  private async resolveApprovalOwner(
    tx: Prisma.TransactionClient,
    email: string,
  ) {
    const existingUser = await tx.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        deletedAt: true,
        ownedOrganization: { select: { id: true } },
      },
    });
    if (!existingUser) return null;
    if (existingUser.deletedAt)
      throw new ConflictException({
        code: AdminDashboardMessageCode.USER_ALREADY_EXISTS,
        message:
          "A deleted account already uses this work email. Restore or replace it before approving.",
      });
    if (existingUser.role !== Role.ORGANIZATION)
      throw new ConflictException({
        code: AdminDashboardMessageCode.USER_ROLE_CONFLICT,
        message:
          "An account with this work email already exists under a different role. Resolve the account before approving.",
      });
    if (existingUser.ownedOrganization)
      throw new ConflictException({
        code: AdminDashboardMessageCode.ORGANIZATION_ALREADY_EXISTS,
        message: "This work email already owns an organization.",
      });
    return existingUser;
  }

  private assertValidOrganizationRequest(request: {
    country: string;
    goals: string;
    organizationName: string;
    representativeFullName: string;
    representativeJobRole: string;
    workEmail: string;
    expectedLicensedProfessionals: number;
  }) {
    const requiredValues = [
      request.country,
      request.goals,
      request.organizationName,
      request.representativeFullName,
      request.representativeJobRole,
      request.workEmail,
    ];
    if (
      requiredValues.some((value) => value.trim().length === 0) ||
      !request.workEmail.includes("@") ||
      request.expectedLicensedProfessionals < 1
    )
      throw new BadRequestException({
        code: AdminDashboardMessageCode.ORG_ACCESS_REQUEST_INVALID,
        message: "The organization access request contains invalid data.",
      });
  }
}
