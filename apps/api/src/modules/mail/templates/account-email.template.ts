import { paragraph, renderEmail, singleLine } from "@mail/utils/email-layout";

import { type EmailBlock } from "@mail/utils/email-layout";

type TAccountEmailBase = {
  appName: string;
  entityName: string;
  supportEmail: string;
};

const help = (supportEmail: string) =>
  paragraph("Need help? Contact ", { mailto: supportEmail }, ".");

export const buildSubmittedAccountEmail = ({
  appName,
  entityName,
  supportEmail,
}: TAccountEmailBase) => {
  const name = singleLine(entityName);

  return renderEmail({
    brand: appName,
    subject: "We've received your application",
    heading: `Thanks for applying, ${name}`,
    blocks: [
      paragraph("Hi,"),
      paragraph(
        `Thanks for submitting an application for ${name} on ${appName}.`,
      ),
      paragraph(
        "Our team is reviewing it now — we'll email you as soon as a decision is made.",
      ),
      paragraph(
        "Questions in the meantime? Contact ",
        { mailto: supportEmail },
        ".",
      ),
    ],
  });
};

export const buildRejectedAccountEmail = ({
  reason,
  appName,
  entityName,
  supportEmail,
}: TAccountEmailBase & { reason: string }) =>
  renderEmail({
    brand: appName,
    subject: `An update on your ${appName} application`,
    heading: "Your application wasn't approved",
    blocks: [
      paragraph("Hi,"),
      paragraph(
        `After reviewing your application for ${singleLine(entityName)}, we're not able to approve it at this time.`,
      ),
      { kind: "field", label: "Reason", value: singleLine(reason) },
      paragraph(
        "Have questions, or want to resubmit? Contact ",
        { mailto: supportEmail },
        ".",
      ),
    ],
  });

export const buildActivationAccountEmail = ({
  appName,
  username,
  loginUrl,
  entityName,
  supportEmail,
  approvedLine,
  activationUrl,
  expiresInMinutes,
}: TAccountEmailBase & {
  username: string;
  loginUrl: string;
  activationUrl: string;
  expiresInMinutes: number;
  approvedLine: string;
}) => {
  const blocks: EmailBlock[] = [
    paragraph("Hi,"),
    paragraph(approvedLine),
    { kind: "field", label: "Username", value: singleLine(username) },
    { kind: "cta", label: "Set your password", url: activationUrl },
    paragraph(
      `This link is valid for ${expiresInMinutes} minutes and can only be used once, so don't share it with anyone.`,
    ),
    paragraph(
      "Once you've set your password, sign in at ",
      { url: loginUrl },
      ".",
    ),
    help(supportEmail),
  ];

  return renderEmail({
    brand: appName,
    blocks,
    subject: `Activate your ${appName} account`,
    heading: `Your ${singleLine(entityName)} account is ready`,
  });
};

export const buildPasswordChangedAccountEmail = ({
  appName,
  entityName,
  supportEmail,
}: TAccountEmailBase) =>
  renderEmail({
    brand: appName,
    subject: `Your ${appName} password was changed`,
    heading: "Your password was changed successfully",
    blocks: [
      paragraph("Hi,"),
      paragraph(
        `This confirms that the password for your ${singleLine(entityName)} account was just changed.`,
      ),
      paragraph("If you made this change, no further action is needed."),
      paragraph(
        "If you didn't, contact ",
        { mailto: supportEmail },
        " immediately to secure your account.",
      ),
    ],
  });
