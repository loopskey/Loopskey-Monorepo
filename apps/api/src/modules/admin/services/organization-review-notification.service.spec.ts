import {
  NotificationDeliveryStatus,
  OrganizationAccessRequestStatus,
  OtpPurpose,
} from "@prisma/client";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "@mail/mail.service";
import type { PrismaService } from "@prisma/prisma.service";
import { ConflictException, Logger } from "@nestjs/common";

import { OrganizationReviewNotificationService } from "./organization-review-notification.service";

const request = {
  id: "request-1",
  status: OrganizationAccessRequestStatus.APPROVED,
  notificationStatus: NotificationDeliveryStatus.NOT_REQUESTED,
  notificationLastAttemptAt: null,
  submissionNotificationStatus: NotificationDeliveryStatus.SENT,
  approvedUserId: "user-1",
  organizationName: "Example Association",
  workEmail: "admin@example.com",
  rejectReason: null,
};

const setup = (sendEmail = jest.fn().mockResolvedValue({ id: "email-1" })) => {
  const prisma = {
    organizationAccessRequest: {
      findUnique: jest.fn().mockResolvedValue(request),
      update: jest.fn().mockResolvedValue(request),
    },
    otpCode: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((operations) => Promise.all(operations)),
  };
  const config = {
    get: jest.fn(
      (name: string, fallback?: string) =>
        ({
          APPLICATION_BASE_URL: "https://app.example.com",
          ORGANIZATION_LOGIN_URL: "https://app.example.com/auth/organization",
          SUPPORT_EMAIL: "support@example.com",
        })[name] ?? fallback,
    ),
  };
  return {
    prisma,
    config,
    sendEmail,
    service: new OrganizationReviewNotificationService(
      prisma as unknown as PrismaService,
      { sendEmail } as unknown as MailService,
      config as unknown as ConfigService,
    ),
  };
};

describe("OrganizationReviewNotificationService", () => {
  it("sends approval after a successful submission confirmation", async () => {
    const { service, prisma, sendEmail } = setup();
    await expect(service.deliver(request.id)).resolves.toBe(
      NotificationDeliveryStatus.SENT,
    );
    expect(prisma.otpCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          purpose: OtpPurpose.ORGANIZATION_ACTIVATION,
        }),
      }),
    );
    const stored = prisma.otpCode.create.mock.calls[0][0].data.codeHash;
    const email = sendEmail.mock.calls[0][0];
    expect(stored).toMatch(/^[a-f0-9]{64}$/);
    expect(email.text).not.toContain(stored);
    expect(email.text).toContain("activate?token=");
  });

  it("persists provider failure without throwing or exposing sensitive data", async () => {
    const log = jest.spyOn(Logger.prototype, "error").mockImplementation();
    const { service, prisma } = setup(
      jest.fn().mockRejectedValue(new Error("provider included secret-token")),
    );
    await expect(service.deliver(request.id)).resolves.toBe(
      NotificationDeliveryStatus.FAILED,
    );
    expect(prisma.organizationAccessRequest.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationFailureCode: "PROVIDER_DELIVERY_FAILED",
          notificationStatus: NotificationDeliveryStatus.FAILED,
        }),
      }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-token");
    log.mockRestore();
  });

  it("does not accidentally redeliver an already-sent notification", async () => {
    const { service, prisma, sendEmail } = setup();
    prisma.organizationAccessRequest.findUnique.mockResolvedValue({
      ...request,
      notificationStatus: NotificationDeliveryStatus.SENT,
    });
    await expect(service.deliver(request.id)).resolves.toBe(
      NotificationDeliveryStatus.SENT,
    );
    expect(sendEmail).not.toHaveBeenCalled();
    expect(prisma.organizationAccessRequest.update).not.toHaveBeenCalled();
  });

  it("blocks duplicate in-flight delivery attempts", async () => {
    const { service, prisma } = setup();
    prisma.organizationAccessRequest.findUnique.mockResolvedValue({
      ...request,
      notificationStatus: NotificationDeliveryStatus.PENDING,
      notificationLastAttemptAt: new Date(),
    });
    await expect(service.deliver(request.id, true)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("persists a distinct missing-configuration failure", async () => {
    const { service, prisma, config } = setup();
    config.get.mockImplementation((name: string, fallback?: string) =>
      name === "SUPPORT_EMAIL" ? undefined : fallback,
    );
    await expect(service.deliver(request.id)).resolves.toBe(
      NotificationDeliveryStatus.FAILED,
    );
    expect(prisma.organizationAccessRequest.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationFailureCode: "CONFIGURATION_MISSING",
        }),
      }),
    );
  });
});
