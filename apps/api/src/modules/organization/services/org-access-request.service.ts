import { AuditAction, OrganizationAccessRequestStatus } from "@prisma/client";
import { OrganizationAccessRequestPaginationInput } from "@org/dtos/org-access-request-pagination.input";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { SubmitOrganizationAccessRequestInput } from "@org/dtos/submit-org-access-request.input";
import { OrganizationAccessRequestMessageCode } from "@org/enums/org-access-request-message-code.enum";
import { OrganizationAccessRequestFilterInput } from "@org/dtos/org-access-request-filter";
import { buildOrganizationSubmittedEmail } from "@mail/organization-email.template";
import { NotificationDeliveryStatus } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class OrgAccessRequestService {
  private readonly logger = new Logger(OrgAccessRequestService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

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
    notificationStatus: true,
    notificationSentAt: true,
    notificationLastAttemptAt: true,
    notificationFailureCode: true,
    submissionNotificationStatus: true,
    submissionNotificationSentAt: true,
    submissionNotificationLastAttemptAt: true,
    submissionNotificationFailureCode: true,
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

    try {
      const request = await this.prismaService.$transaction(async (tx) => {
        const created = await tx.organizationAccessRequest.create({
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
            submissionNotificationStatus: NotificationDeliveryStatus.PENDING,
            submissionNotificationLastAttemptAt: new Date(),
          },
          select: this.requestSelect,
        });
        await tx.auditLog.create({
          data: {
            action: AuditAction.ORG_ACCESS_REQUEST_SUBMITTED,
            entityType: "OrganizationAccessRequest",
            entityId: created.id,
            metadata: {
              workEmail,
              organizationName: created.organizationName,
              organizationType: created.organizationType,
            },
          },
        });
        return created;
      });
      try {
        const template = buildOrganizationSubmittedEmail({
          appName: this.configService.get<string>("APP_NAME", "LoopsKey"),
          organizationName: request.organizationName,
          supportEmail: this.configService.get<string>(
            "SUPPORT_EMAIL",
            "support@loopskey.com",
          ),
        });
        await this.mailService.sendEmail({ to: workEmail, ...template });
        return await this.prismaService.organizationAccessRequest.update({
          where: { id: request.id },
          data: {
            submissionNotificationStatus: NotificationDeliveryStatus.SENT,
            submissionNotificationSentAt: new Date(),
          },
          select: this.requestSelect,
        });
      } catch (error) {
        this.logger.error("Application confirmation email failed", {
          requestId: request.id,
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
        return this.prismaService.organizationAccessRequest.update({
          where: { id: request.id },
          data: {
            submissionNotificationStatus: NotificationDeliveryStatus.FAILED,
            submissionNotificationFailureCode: "PROVIDER_DELIVERY_FAILED",
          },
          select: this.requestSelect,
        });
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException({
          code: OrganizationAccessRequestMessageCode.REQUEST_ALREADY_EXISTS,
          message:
            "A pending organization request already exists for this email.",
        });
      }
      throw error;
    }
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

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
