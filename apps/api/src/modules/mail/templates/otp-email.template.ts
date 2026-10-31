import { TBuildOtpEmailTemplateInput } from "@mail/types/mail-service.types";
import { paragraph, renderEmail } from "@mail/utils/email-layout";
import { OtpPurpose } from "@prisma/client";

import { type EmailSegment } from "@mail/utils/email-layout";

type OtpCopy = {
  intro: string;
  subject: string;
  heading: string;
  closing: (supportEmail: string) => EmailSegment[];
};

const getOtpEmailCopy = (purpose: OtpPurpose, appName: string): OtpCopy => {
  switch (purpose) {
    case OtpPurpose.SIGNUP:
      return {
        subject: `Your ${appName} verification code`,
        heading: "Confirm your email to get started",
        intro: `Thanks for signing up for ${appName}. Enter the code below to verify your email and finish creating your account.`,
        closing: () => [
          `Didn't sign up for ${appName}? You can safely ignore this email.`,
        ],
      };

    case OtpPurpose.RESET_PASSWORD:
      return {
        subject: `Your ${appName} password reset code`,
        heading: "Reset your password",
        intro: `We received a request to reset your ${appName} password. Enter the code below to continue.`,
        closing: (supportEmail) => [
          "Didn't request this? Your password hasn't changed — you can ignore this email, or contact ",
          { mailto: supportEmail },
          " if you're concerned.",
        ],
      };

    case OtpPurpose.CHANGE_EMAIL:
      return {
        subject: `Confirm your new ${appName} email address`,
        heading: "Verify your new email address",
        intro: `Enter the code below to confirm this is your new email address for ${appName}.`,
        closing: (supportEmail) => [
          "Didn't request this change? Contact ",
          { mailto: supportEmail },
          " right away.",
        ],
      };

    default:
      return {
        subject: `Your ${appName} verification code`,
        heading: "Your verification code",
        intro: "Enter the code below to continue.",
        closing: () => [
          "Didn't request this? You can safely ignore this email.",
        ],
      };
  }
};

export const buildOtpEmailTemplate = ({
  code,
  purpose,
  appName,
  supportEmail,
  expiresInMinutes,
}: TBuildOtpEmailTemplateInput) => {
  const copy = getOtpEmailCopy(purpose, appName);
  const isSignup = purpose === OtpPurpose.SIGNUP;

  return renderEmail({
    brand: appName,
    subject: copy.subject,
    heading: copy.heading,
    blocks: [
      paragraph("Hi,"),
      paragraph(copy.intro),
      { kind: "code", value: code },
      paragraph(
        isSignup
          ? `This code expires in ${expiresInMinutes} minutes — please don't share it with anyone.`
          : `This code expires in ${expiresInMinutes} minutes.`,
      ),
      paragraph(...copy.closing(supportEmail)),
    ],
  });
};
