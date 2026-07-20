import { AuditAction, Prisma, Role, UserStatus } from "@prisma/client";
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
import { PrismaService } from "@prisma/prisma.service";
import { randomBytes } from "crypto";
import { hash } from "argon2";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prismaService: PrismaService) {}

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
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
    });
    const items = rows.slice(0, take);
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

  async approveOrgAccessRequest(user: TAdminDashboardUser, requestId: string) {
    this.assertAdmin(user);
    const request =
      await this.prismaService.organizationAccessRequest.findFirst({
        where: { id: requestId },
      });
    if (!request)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORG_ACCESS_REQUEST_NOT_FOUND,
      );
    const email = request.workEmail.trim().toLowerCase();
    let temporaryPassword: string | null = null;
    const updated = await this.prismaService.$transaction(async (tx) => {
      let orgUser = await tx.user.findUnique({
        where: { email },
        select: {
          id: true,
          role: true,
          email: true,
        },
      });
      if (orgUser && orgUser.role !== Role.ORGANIZATION)
        throw new BadRequestException(
          AdminDashboardMessageCode.USER_ALREADY_EXISTS,
        );
      if (!orgUser) {
        temporaryPassword = this.generateTemporaryPassword();
        const passwordHash = await hash(temporaryPassword);
        orgUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: Role.ORGANIZATION,
            status: UserStatus.ACTIVE,
            forcePasswordChange: true,
            emailVerifiedAt: new Date(),
            fullName: request.representativeFullName,
          },
          select: {
            id: true,
            role: true,
            email: true,
          },
        });
      }
      const existingOrganization = await tx.organization.findFirst({
        where: {
          ownerId: orgUser.id,
          deletedAt: null,
        },
        select: { id: true },
      });
      const organization =
        existingOrganization ??
        (await tx.organization.create({
          data: {
            ownerId: orgUser.id,
            country: request.country,
            name: request.organizationName,
          },
          select: { id: true },
        }));
      await tx.organizationProfile.upsert({
        where: { userId: orgUser.id },
        create: {
          userId: orgUser.id,
          country: request.country,
          contactEmail: email,
          organizationName: request.organizationName,
          memberLimit: request.expectedLicensedProfessionals,
        },
        update: {
          country: request.country,
          contactEmail: email,
          organizationName: request.organizationName,
          memberLimit: request.expectedLicensedProfessionals,
        },
      });
      await tx.organizationSettings.upsert({
        where: { organizationId: organization.id },
        create: { organizationId: organization.id },
        update: {},
      });
      await tx.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: orgUser.id,
          },
        },
        create: {
          organizationId: organization.id,
          userId: orgUser.id,
          jobRole: request.representativeJobRole,
          status: OrganizationMemberStatus.ACTIVE,
        },
        update: {
          jobRole: request.representativeJobRole,
          status: OrganizationMemberStatus.ACTIVE,
        },
      });
      const approvedRequest = await tx.organizationAccessRequest.update({
        where: { id: requestId },
        data: {
          status: OrganizationAccessRequestStatus.APPROVED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          approvedUserId: orgUser.id,
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
            approvedUserId: orgUser.id,
            temporaryPasswordGenerated: Boolean(temporaryPassword),
          },
        },
      });
      return approvedRequest;
    });
    return updated;
  }

  async rejectOrgAccessRequest(
    user: TAdminDashboardUser,
    requestId: string,
    reason?: string,
  ) {
    this.assertAdmin(user);
    const request =
      await this.prismaService.organizationAccessRequest.findFirst({
        where: { id: requestId },
      });
    if (!request)
      throw new NotFoundException(
        AdminDashboardMessageCode.ORG_ACCESS_REQUEST_NOT_FOUND,
      );
    const updated = await this.prismaService.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        status: OrganizationAccessRequestStatus.REJECTED,
        reviewedById: user.id,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });
    await this.createAudit(
      user.id,
      AuditAction.ORG_ACCESS_REQUEST_REJECTED,
      "OrganizationAccessRequest",
      requestId,
      { reason },
    );
    return updated;
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

  private generateTemporaryPassword() {
    return `Org-${randomBytes(6).toString("base64url")}#1`;
  }

}
