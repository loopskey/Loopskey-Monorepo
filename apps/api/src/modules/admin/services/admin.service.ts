import { OrganizationReviewNotificationService } from "@admin/services/organization-review-notification.service";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AdminOrgAccessRequestFilterInput } from "@admin/dtos/admin-org-access-request-filter.input";
import { type IdentityAdministrationApi } from "@user/public/identity-administration-api";
import { IDENTITY_ADMINISTRATION_API } from "@user/public/identity-administration-api";
import { UpdateAdminUserStatusInput } from "@admin/dtos/update-admin-user-status.input";
import { type OrganizationReviewApi } from "@org/public/organization-review-api";
import { AuditAction, Prisma, Role } from "@prisma/client";
import { AdminDashboardMessageCode } from "@admin/enums/message-code.enum";
import { AdminAuditLogFilterInput } from "@admin/dtos/admin-audit-log-filter.input";
import { UpdateAdminProfileInput } from "@admin/dtos/update-admin-profile.input";
import { ORGANIZATION_REVIEW_API } from "@org/public/organization-review-api";
import { AdminUserFilterInput } from "@admin/dtos/admin-user-filter.input";
import { AdminPaginationInput } from "@admin/dtos/admin-pagination.input";
import { BadRequestException } from "@nestjs/common";
import { TAdminDashboardUser } from "@admin/types/admin-service.types";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewNotification: OrganizationReviewNotificationService,
    @Inject(IDENTITY_ADMINISTRATION_API)
    private readonly identityAdmin: IdentityAdministrationApi,
    @Inject(ORGANIZATION_REVIEW_API)
    private readonly organizationReview: OrganizationReviewApi,
  ) {}

  private assertAdmin(user: TAdminDashboardUser) {
    if (user.role !== Role.ADMIN)
      throw new ForbiddenException(AdminDashboardMessageCode.ADMIN_ONLY);
  }

  async profile(user: TAdminDashboardUser) {
    this.assertAdmin(user);
    const admin = await this.identityAdmin.profile(user.id);
    if (!admin)
      throw new NotFoundException(AdminDashboardMessageCode.USER_NOT_FOUND);
    return admin;
  }

  async updateProfile(
    user: TAdminDashboardUser,
    input: UpdateAdminProfileInput,
  ) {
    this.assertAdmin(user);
    const updated = await this.identityAdmin.updateProfile(user.id, input);
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
    return this.organizationReview.overview();
  }

  async users(
    user: TAdminDashboardUser,
    filter?: AdminUserFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    return this.identityAdmin.directory({
      role: filter?.role,
      status: filter?.status,
      search: filter?.search,
      premiumOnly: filter?.premiumOnly,
      cursor: pagination?.cursor,
      take: pagination?.take ?? 20,
    });
  }

  async updateUserStatus(
    user: TAdminDashboardUser,
    input: UpdateAdminUserStatusInput,
  ) {
    this.assertAdmin(user);
    const updated = await this.identityAdmin.updateStatus(
      input.userId,
      input.status,
    );
    if (!updated)
      throw new NotFoundException(AdminDashboardMessageCode.USER_NOT_FOUND);
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
    return this.identityAdmin.growth(mode);
  }

  async orgAccessRequests(
    user: TAdminDashboardUser,
    filter?: AdminOrgAccessRequestFilterInput,
    pagination?: AdminPaginationInput,
  ) {
    this.assertAdmin(user);
    return this.organizationReview.list({ ...filter, ...pagination });
  }

  async orgAccessRequestDetail(user: TAdminDashboardUser, requestId: string) {
    this.assertAdmin(user);
    return this.organizationReview.detail(requestId);
  }

  async approveOrgAccessRequest(user: TAdminDashboardUser, requestId: string) {
    this.assertAdmin(user);
    const result = await this.prismaService.$transaction(async (tx) => {
      const approval = await this.organizationReview.approve(
        requestId,
        user.id,
        tx,
      );
      if (!approval.linkedExistingUser)
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: AuditAction.ORGANIZATION_ACCOUNT_CREATED,
            entityType: "User",
            entityId: approval.approvedUserId,
            metadata: { email: approval.workEmail, requestId },
          },
        });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: AuditAction.ORG_ACCESS_REQUEST_APPROVED,
          entityType: "OrganizationAccessRequest",
          entityId: requestId,
          metadata: {
            workEmail: approval.workEmail,
            organizationId: approval.organizationId,
            approvedUserId: approval.approvedUserId,
            linkedExistingUser: approval.linkedExistingUser,
            notificationIntent: {
              type: "ORGANIZATION_REQUEST_APPROVED",
              deliveryStatus: "PENDING",
            },
          },
        },
      });
      return approval.result;
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
      const rejection = await this.organizationReview.reject(
        requestId,
        user.id,
        rejectReason,
        tx,
      );

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
      return rejection.result;
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
}
