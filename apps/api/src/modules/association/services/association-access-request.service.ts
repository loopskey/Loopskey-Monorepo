import { SubmitAssociationAccessRequestInput } from "@association/dtos/submit-association-access-request.input";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { OrganizationAccessRequestStatus } from "@prisma/client";
import { buildAssociationSubmittedEmail } from "@mail/association-email.template";
import { NotificationDeliveryStatus } from "@prisma/client";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { OrganizationType, Role } from "@prisma/client";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { PrismaService } from "@prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { MailService } from "@mail/mail.service";
import { Inject } from "@nestjs/common";
import { Prisma } from "@prisma/client";

const REQUEST_MESSAGE_CODE = {
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  REQUEST_ALREADY_EXISTS: "REQUEST_ALREADY_EXISTS",
} as const;

@Injectable()
export class AssociationAccessRequestService {
  private readonly logger = new Logger(AssociationAccessRequestService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identityApi: IdentityProfileApi,
  ) {}

  async submitRequest(input: SubmitAssociationAccessRequestInput) {
    const workEmail = this.normalizeEmail(input.workEmail);
    const existingUser = await this.identityApi.existsByEmail(workEmail);
    if (existingUser)
      throw new ConflictException({
        code: REQUEST_MESSAGE_CODE.USER_ALREADY_EXISTS,
        message: "A user with this work email already exists.",
      });
    const existingPendingRequest =
      await this.prismaService.organizationAccessRequest.findFirst({
        where: {
          workEmail,
          targetRole: Role.ASSOCIATION,
          status: OrganizationAccessRequestStatus.PENDING,
        },
        select: { id: true },
      });
    if (existingPendingRequest)
      throw new ConflictException({
        code: REQUEST_MESSAGE_CODE.REQUEST_ALREADY_EXISTS,
        message: "A pending association request already exists for this email.",
      });

    try {
      await this.prismaService.$transaction(async (tx) => {
        const created = await tx.organizationAccessRequest.create({
          data: {
            targetRole: Role.ASSOCIATION,
            organizationType: OrganizationType.ASSOCIATION,
            representativeFullName: input.representativeFullName.trim(),
            organizationName: input.associationName.trim(),
            workEmail,
            representativeJobRole: input.representativeJobRole.trim(),
            expectedLicensedProfessionals: input.expectedMembers,
            country: input.country.trim(),
            goals: input.goals.trim(),
            status: OrganizationAccessRequestStatus.PENDING,
            submissionNotificationStatus: NotificationDeliveryStatus.PENDING,
            submissionNotificationLastAttemptAt: new Date(),
          },
        });
        await this.mailService.sendEmail(
          {
            to: workEmail,
            ...buildAssociationSubmittedEmail({
              appName: this.configService.get<string>("APP_NAME", "LoopsKey"),
              associationName: created.organizationName,
              supportEmail: this.configService.get<string>(
                "SUPPORT_EMAIL",
                "support@loopskey.com",
              ),
            }),
          },
          tx,
        );
        await tx.outboxEvent.create({
          data: {
            eventName: "audit.record.requested",
            eventVersion: 1,
            aggregateType: "OrganizationAccessRequest",
            aggregateId: created.id,
            payload: {
              action: "ASSOCIATION_ACCESS_REQUEST_SUBMITTED",
              entityType: "OrganizationAccessRequest",
              entityId: created.id,
              metadata: { associationName: created.organizationName },
            },
          },
        });
        return created;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException({
          code: REQUEST_MESSAGE_CODE.REQUEST_ALREADY_EXISTS,
          message:
            "A pending association request already exists for this email.",
        });
      throw error;
    }
    return {
      success: true,
      code: AssociationMessageCode.REQUEST_SUBMITTED,
      message: "Your association access request was submitted for review.",
      association: null,
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
