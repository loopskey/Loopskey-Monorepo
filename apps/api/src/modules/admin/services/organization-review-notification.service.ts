import {
  NotificationDeliveryStatus,
  OrganizationAccessRequestStatus,
  OtpPurpose,
} from "@prisma/client";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "crypto";

import { MailService } from "@mail/mail.service";
import {
  buildOrganizationApprovalEmail,
  buildOrganizationRejectionEmail,
} from "@mail/organization-email.template";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class OrganizationReviewNotificationService {
  private readonly logger = new Logger(
    OrganizationReviewNotificationService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async deliver(requestId: string, force = false) {
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
      return request.notificationStatus;
    if (
      request.notificationStatus === NotificationDeliveryStatus.PENDING &&
      request.notificationLastAttemptAt &&
      Date.now() - request.notificationLastAttemptAt.getTime() < 60_000
    )
      throw new ConflictException(
        "Notification delivery is already in progress.",
      );

    await this.prisma.organizationAccessRequest.update({
      where: { id: requestId },
      data: {
        notificationStatus: NotificationDeliveryStatus.PENDING,
        notificationLastAttemptAt: new Date(),
        notificationFailureCode: null,
      },
    });

    try {
      const template =
        request.status === OrganizationAccessRequestStatus.APPROVED
          ? await this.buildApproval(request)
          : this.buildRejection(request);
      await this.mail.sendEmail({ to: request.workEmail, ...template });
      await this.prisma.organizationAccessRequest.update({
        where: { id: requestId },
        data: {
          notificationStatus: NotificationDeliveryStatus.SENT,
          notificationSentAt: new Date(),
          notificationFailureCode: null,
        },
      });
      return NotificationDeliveryStatus.SENT;
    } catch (error) {
      const failureCode =
        error instanceof Error && error.message.endsWith("is not configured.")
          ? "CONFIGURATION_MISSING"
          : "PROVIDER_DELIVERY_FAILED";
      await this.prisma.organizationAccessRequest.update({
        where: { id: requestId },
        data: {
          notificationStatus: NotificationDeliveryStatus.FAILED,
          notificationFailureCode: failureCode,
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
    const rawToken = randomBytes(32).toString("base64url");
    const codeHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresInMinutes = this.activationExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);
    await this.prisma.$transaction([
      this.prisma.otpCode.updateMany({
        where: {
          userId: request.approvedUserId,
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      }),
      this.prisma.otpCode.create({
        data: {
          userId: request.approvedUserId,
          destination: request.workEmail,
          codeHash,
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
          expiresAt,
          maxAttempts: 1,
        },
      }),
    ]);
    const activationUrl = this.activationUrl(rawToken);
    return buildOrganizationApprovalEmail({
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
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
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
      organizationName: request.organizationName,
      supportEmail: this.requiredConfig("SUPPORT_EMAIL"),
      reason: request.rejectReason,
    });
  }

  private requiredConfig(name: string) {
    const value = this.config.get<string>(name);
    if (!value) throw new Error(`${name} is not configured.`);
    return value;
  }

  private activationExpiryMinutes() {
    const minutes = Number(
      this.config.get<string>("ACTIVATION_TOKEN_EXPIRY_MINUTES", "60"),
    );
    if (!Number.isFinite(minutes) || minutes <= 0)
      throw new Error("ACTIVATION_TOKEN_EXPIRY_MINUTES is not configured.");
    return minutes;
  }

  private activationUrl(rawToken: string) {
    const configured = this.config.get<string>("ORGANIZATION_ACTIVATION_URL");
    const base = configured
      ? configured
      : `${this.requiredConfig("APPLICATION_BASE_URL").replace(/\/$/, "")}/auth/organization/activate`;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}token=${encodeURIComponent(rawToken)}`;
  }
}
