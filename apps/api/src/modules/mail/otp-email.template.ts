import { TBuildOtpEmailTemplateInput } from "@mail/mail-service.type";
import { OtpPurpose } from "@prisma/client";

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getOtpEmailCopy = (purpose: OtpPurpose, appName: string) => {
  switch (purpose) {
    case OtpPurpose.SIGNUP:
      return {
        subject: `Verify your ${appName} account`,
        title: "Verify your email address",
        intro:
          "Use the verification code below to complete your account registration.",
      };

    case OtpPurpose.RESET_PASSWORD:
      return {
        subject: `Reset your ${appName} password`,
        title: "Reset your password",
        intro:
          "Use the verification code below to reset your account password.",
      };

    case OtpPurpose.CHANGE_EMAIL:
      return {
        subject: `Confirm your new ${appName} email address`,
        title: "Confirm your new email address",
        intro:
          "Use the verification code below to confirm this new email address.",
      };

    default:
      return {
        subject: `${appName} verification code`,
        title: "Your verification code",
        intro: "Use the verification code below to continue.",
      };
  }
};

export const buildOtpEmailTemplate = ({
  code,
  purpose,
  appName,
  expiresInMinutes,
}: TBuildOtpEmailTemplateInput) => {
  const safeCode = escapeHtml(code);
  const safeAppName = escapeHtml(appName);
  const copy = getOtpEmailCopy(purpose, safeAppName);
  const text = [
    copy.title,
    "",
    copy.intro,
    "",
    `Your verification code is: ${code}`,
    "",
    `This code expires in ${expiresInMinutes} minutes.`,
    "",
    "If you did not request this code, you can safely ignore this email.",
    "",
    `${appName} Team`,
  ].join("\n");

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${copy.subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 28px 10px 28px;">
                <div style="font-size:14px;font-weight:700;color:#2563eb;letter-spacing:.04em;text-transform:uppercase;">
                  ${safeAppName}
                </div>
                <h1 style="margin:14px 0 8px 0;font-size:24px;line-height:1.3;color:#111827;">
                  ${copy.title}
                </h1>
                <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">
                  ${copy.intro}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;">
                <div style="background:#f3f7ff;border:1px solid #dbeafe;border-radius:16px;padding:22px;text-align:center;">
                  <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">
                    Verification code
                  </div>
                  <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">
                    ${safeCode}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 28px 28px;">
                <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;">
                  This code expires in <strong>${expiresInMinutes} minutes</strong>. Do not share this code with anyone.
                </p>
                <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;line-height:1.7;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  © ${new Date().getFullYear()} ${safeAppName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  return {
    subject: copy.subject,
    html,
    text,
  };
};
