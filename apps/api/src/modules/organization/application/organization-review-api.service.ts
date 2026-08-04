import type {
  OrganizationReviewApi,
  OrganizationReviewNotificationProjection,
} from "@org/public/organization-review-api";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  NotificationDeliveryStatus,
  OrganizationAccessRequestStatus,
  OrganizationMemberStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import {
  IDENTITY_PROFILE_API,
  type IdentityProfileApi,
} from "@user/public/identity-profile-api";

@Injectable()
export class OrganizationReviewApiService implements OrganizationReviewApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identityApi: IdentityProfileApi,
  ) {}

  async overview() {
    const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] =
      await Promise.all([
        this.prisma.organizationAccessRequest.count(),
        this.prisma.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.PENDING },
        }),
        this.prisma.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.APPROVED },
        }),
        this.prisma.organizationAccessRequest.count({
          where: { status: OrganizationAccessRequestStatus.REJECTED },
        }),
      ]);
    const from = new Date();
    from.setDate(from.getDate() - 13);
    from.setHours(0, 0, 0, 0);
    const requests = await this.prisma.organizationAccessRequest.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true },
    });
    const trend = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const date = new Date(from);
      date.setDate(from.getDate() + i);
      trend.set(date.toISOString().slice(0, 10), 0);
    }
    for (const request of requests) {
      const key = request.createdAt.toISOString().slice(0, 10);
      trend.set(key, (trend.get(key) ?? 0) + 1);
    }
    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      requestTrend: [...trend].map(([date, count]) => ({ date, count })),
    };
  }

  async list(input: {
    status?: string;
    search?: string;
    sortDirection?: "asc" | "desc";
    cursor?: string;
    take?: number;
  }) {
    const take = input.take ?? 20;
    const search = input.search?.trim();
    const where: Prisma.OrganizationAccessRequestWhereInput = {
      ...(input.status
        ? { status: input.status as OrganizationAccessRequestStatus }
        : {}),
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
    const rows = await this.prisma.organizationAccessRequest.findMany({
      where,
      include: { reviewedBy: { select: { email: true, fullName: true } } },
      take: take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      orderBy: [
        { createdAt: input.sortDirection ?? "desc" },
        { id: input.sortDirection ?? "desc" },
      ],
    });
    const items = rows.slice(0, take).map(({ reviewedBy, ...request }) => ({
      ...request,
      reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
    }));
    return {
      items,
      totalCount: await this.prisma.organizationAccessRequest.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async detail(requestId: string) {
    const request = await this.prisma.organizationAccessRequest.findUnique({
      where: { id: requestId },
      include: { reviewedBy: { select: { email: true, fullName: true } } },
    });
    if (!request)
      throw new NotFoundException("Organization access request not found.");
    const { reviewedBy, ...detail } = request;
    return {
      ...detail,
      reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
    };
  }

  async beginNotification(requestId: string, force: boolean) {
    const request = await this.prisma.organizationAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new ConflictException("Organization request not found.");
    if (request.status === OrganizationAccessRequestStatus.PENDING)
      throw new ConflictException("A pending request has no review email.");
    if (
      request.notificationStatus === NotificationDeliveryStatus.SENT &&
      !force
    )
      return this.project(request);
    if (
      request.notificationStatus === NotificationDeliveryStatus.PENDING &&
      request.notificationLastAttemptAt &&
      Date.now() - request.notificationLastAttemptAt.getTime() < 60_000
    )
      throw new ConflictException(
        "Notification delivery is already in progress.",
      );
    const updated = await this.prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        notificationStatus: NotificationDeliveryStatus.PENDING,
        notificationLastAttemptAt: new Date(),
        notificationFailureCode: null,
      },
    });
    return this.project(updated);
  }

  async markNotificationSent(requestId: string) {
    await this.prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        notificationStatus: NotificationDeliveryStatus.SENT,
        notificationSentAt: new Date(),
        notificationFailureCode: null,
      },
    });
  }

  async markNotificationFailed(requestId: string, failureCode: string) {
    await this.prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        notificationStatus: NotificationDeliveryStatus.FAILED,
        notificationFailureCode: failureCode,
      },
    });
  }

  async approve(requestId: string, reviewerId: string, atomicContext: object) {
    const tx = atomicContext as Prisma.TransactionClient;
    const request = await tx.organizationAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new NotFoundException("Organization access request not found.");
    if (request.status !== OrganizationAccessRequestStatus.PENDING)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message: "This organization access request has already been reviewed.",
      });
    this.assertValidRequest(request);
    const claim = await tx.organizationAccessRequest.updateMany({
      where: { id: requestId, status: OrganizationAccessRequestStatus.PENDING },
      data: {
        status: OrganizationAccessRequestStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectReason: null,
      },
    });
    if (claim.count !== 1)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message:
          "This organization access request was reviewed by another admin.",
      });
    const owner = await this.identityApi.resolveOrganizationOwner({
      email: request.workEmail,
      fullName: request.representativeFullName,
      atomicContext: tx,
    });
    const organization = await tx.organization.create({
      data: {
        ownerId: owner.id,
        country: request.country.trim(),
        name: request.organizationName.trim(),
      },
      select: { id: true },
    });
    await tx.organizationProfile.upsert({
      where: { userId: owner.id },
      create: {
        userId: owner.id,
        country: request.country.trim(),
        contactEmail: request.workEmail.trim().toLowerCase(),
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
        userId: owner.id,
        jobRole: request.representativeJobRole.trim(),
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
    const approved = await tx.organizationAccessRequest.update({
      where: { id: requestId },
      data: { approvedUserId: owner.id },
      include: { reviewedBy: { select: { email: true, fullName: true } } },
    });
    const { reviewedBy, ...detail } = approved;
    return {
      result: {
        ...detail,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      },
      workEmail: request.workEmail.trim().toLowerCase(),
      organizationId: organization.id,
      approvedUserId: owner.id,
      linkedExistingUser: owner.linkedExisting,
    };
  }

  async reject(
    requestId: string,
    reviewerId: string,
    reason: string,
    atomicContext: object,
  ) {
    const tx = atomicContext as Prisma.TransactionClient;
    const request = await tx.organizationAccessRequest.findUnique({
      where: { id: requestId },
    });
    if (!request)
      throw new NotFoundException("Organization access request not found.");
    if (request.status !== OrganizationAccessRequestStatus.PENDING)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message: "This organization access request has already been reviewed.",
      });
    const claim = await tx.organizationAccessRequest.updateMany({
      where: { id: requestId, status: OrganizationAccessRequestStatus.PENDING },
      data: {
        status: OrganizationAccessRequestStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });
    if (claim.count !== 1)
      throw new ConflictException({
        code: "OrgAccessRequestAlreadyReviewed",
        message:
          "This organization access request was reviewed by another admin.",
      });
    const rejected = await tx.organizationAccessRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: { reviewedBy: { select: { email: true, fullName: true } } },
    });
    const { reviewedBy, ...detail } = rejected;
    return {
      result: {
        ...detail,
        reviewedByName: reviewedBy?.fullName ?? reviewedBy?.email ?? null,
      },
    };
  }

  private assertValidRequest(request: {
    country: string;
    goals: string;
    organizationName: string;
    representativeFullName: string;
    representativeJobRole: string;
    workEmail: string;
    expectedLicensedProfessionals: number;
  }) {
    const required = [
      request.country,
      request.goals,
      request.organizationName,
      request.representativeFullName,
      request.representativeJobRole,
      request.workEmail,
    ];
    if (
      required.some((value) => value.trim().length === 0) ||
      !request.workEmail.includes("@") ||
      request.expectedLicensedProfessionals < 1
    )
      throw new BadRequestException({
        code: "OrgAccessRequestInvalid",
        message: "The organization access request contains invalid data.",
      });
  }

  private project(request: {
    id: string;
    status: string;
    notificationStatus: string;
    approvedUserId: string | null;
    organizationName: string;
    workEmail: string;
    rejectReason: string | null;
  }): OrganizationReviewNotificationProjection {
    return {
      id: request.id,
      status: request.status,
      notificationStatus: request.notificationStatus,
      approvedUserId: request.approvedUserId,
      organizationName: request.organizationName,
      workEmail: request.workEmail,
      rejectReason: request.rejectReason,
    };
  }
}
