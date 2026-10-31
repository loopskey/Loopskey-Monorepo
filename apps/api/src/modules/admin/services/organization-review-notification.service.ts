import { ConflictException, Inject, Injectable, Logger } from "@nestjs/common";
import { AuditAction, OrganizationAccessRequestStatus } from "@prisma/client";
import { buildOrganizationRejectionEmail } from "@mail/templates/organization-email.template";
import { buildOrganizationApprovalEmail } from "@mail/templates/organization-email.template";
import { NotificationDeliveryStatus } from "@prisma/client";
import { ORGANIZATION_REVIEW_API } from "@org/public/organization-review-api";
import { ACCOUNT_ACTIVATION_API } from "@auth/public/account-activation-api";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { MailService } from "@mail/services/mail.service";

import { type OrganizationReviewApi } from "@org/public/organization-review-api";
import { type AccountActivationApi } from "@auth/public/account-activation-api";

@Injectable()
export class OrganizationReviewNotificationService {
  private readonly logger = new Logger(
    OrganizationReviewNotificationService.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @Inject(ACCOUNT_ACTIVATION_API)
    private readonly accountActivation: AccountActivationApi,
    @Inject(ORGANIZATION_REVIEW_API)
    private readonly organizationReview: OrganizationReviewApi,
  ) {}

  async deliver(requestId: string, force = false) {
    const request = await this.organizationReview.beginNotification(
      requestId,
      force,
    );
    if (
      request.notificationStatus === NotificationDeliveryStatus.SENT &&
      !force
    )
      return NotificationDeliveryStatus.SENT;

    try {
      const template =
        request.status === OrganizationAccessRequestStatus.APPROVED
          ? await this.buildApproval(request)
          : this.buildRejection(request);
      await this.mailService.sendEmail({ to: request.workEmail, ...template });
      await this.organizationReview.markNotificationSent(requestId);
      return NotificationDeliveryStatus.SENT;
    } catch (error) {
      const failureCode =
        error instanceof Error && error.message.endsWith("is not configured.")
          ? "CONFIGURATION_MISSING"
          : "PROVIDER_DELIVERY_FAILED";
      await this.organizationReview.markNotificationFailed(
        requestId,
        failureCode,
      );
      await this.prismaService.auditLog.create({
        data: {
          action: AuditAction.ORGANIZATION_NOTIFICATION_FAILED,
          entityType: "OrganizationAccessRequest",
          entityId: requestId,
          metadata: { reviewStatus: request.status, failureCode },
        },
      });
      this.logger.error("Organization notification delivery failed", {
        requestId,
        status: request.status,
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      return NotificationDeliveryStatus.FAILED;
    }
  }

  private async buildApproval(request: {
    approvedUserId: string | null;
    organizationName: string;
    workEmail: string;
  }) {
    if (!request.approvedUserId)
      throw new ConflictException("Approved request has no Organization user.");
    const { activationUrl, expiresInMinutes } =
      await this.accountActivation.issueActivationLink({
        userId: request.approvedUserId,
        destination: request.workEmail,
        role: "ORGANIZATION",
      });
    return buildOrganizationApprovalEmail({
      appName: this.configService.get<string>("APP_NAME", "LoopsKey"),
      organizationName: request.organizationName,
      supportEmail: this.requiredConfig("SUPPORT_EMAIL"),
      username: request.workEmail,
      activationUrl,
      loginUrl: this.requiredConfig("ORGANIZATION_LOGIN_URL"),
      expiresInMinutes,
    });
  }

  private buildRejection(request: {
    organizationName: string;
    rejectReason: string | null;
  }) {
    if (!request.rejectReason)
      throw new ConflictException("Rejected request has no rejection reason.");
    return buildOrganizationRejectionEmail({
      appName: this.configService.get<string>("APP_NAME", "LoopsKey"),
      organizationName: request.organizationName,
      supportEmail: this.requiredConfig("SUPPORT_EMAIL"),
      reason: request.rejectReason,
    });
  }

  private requiredConfig(name: string) {
    const value = this.configService.get<string>(name);
    if (!value) throw new Error(`${name} is not configured.`);
    return value;
  }
}
