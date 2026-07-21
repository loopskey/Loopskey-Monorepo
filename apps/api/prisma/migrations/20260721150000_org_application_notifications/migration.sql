ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'ORGANIZATION_ACTIVATION';

CREATE TYPE "NotificationDeliveryStatus" AS ENUM (
  'NOT_REQUESTED',
  'PENDING',
  'SENT',
  'FAILED'
);

ALTER TABLE "OrganizationAccessRequest"
ADD COLUMN "notificationStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "notificationSentAt" TIMESTAMP(3),
ADD COLUMN "notificationLastAttemptAt" TIMESTAMP(3),
ADD COLUMN "notificationFailureCode" TEXT;

ALTER TABLE "OrganizationAccessRequest"
ADD COLUMN "submissionNotificationStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "submissionNotificationSentAt" TIMESTAMP(3),
ADD COLUMN "submissionNotificationLastAttemptAt" TIMESTAMP(3),
ADD COLUMN "submissionNotificationFailureCode" TEXT;

CREATE INDEX "OrganizationAccessRequest_notificationStatus_idx"
ON "OrganizationAccessRequest"("notificationStatus");

CREATE INDEX "OrganizationAccessRequest_submissionNotificationStatus_idx"
ON "OrganizationAccessRequest"("submissionNotificationStatus");
