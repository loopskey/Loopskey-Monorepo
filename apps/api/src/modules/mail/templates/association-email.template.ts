import {
  buildActivationAccountEmail,
  buildPasswordChangedAccountEmail,
  buildRejectedAccountEmail,
  buildSubmittedAccountEmail,
} from "@mail/templates/account-email.template";
import { paragraph, renderEmail, singleLine } from "@mail/utils/email-layout";

import {
  type TAssociationActivationEmail,
  type TAssociationEmailBase,
  type TAssociationMemberInvitationEmail,
  type TAssociationRejectionEmail,
} from "@mail/types/mail-service.types";

export { escapeHtml } from "@mail/utils/email-layout";

const accountOf = ({
  appName,
  supportEmail,
  associationName,
}: TAssociationEmailBase) => ({
  appName,
  supportEmail,
  entityName: associationName,
});

export const buildAssociationSubmittedEmail = (input: TAssociationEmailBase) =>
  buildSubmittedAccountEmail(accountOf(input));

export const buildAssociationRejectionEmail = (
  input: TAssociationRejectionEmail,
) => buildRejectedAccountEmail({ ...accountOf(input), reason: input.reason });

export const buildAssociationActivationEmail = (
  input: TAssociationActivationEmail,
) =>
  buildActivationAccountEmail({
    ...accountOf(input),
    loginUrl: input.loginUrl,
    username: input.username,
    activationUrl: input.activationUrl,
    expiresInMinutes: input.expiresInMinutes,
    approvedLine: `Good news — an account was created for you with ${singleLine(input.associationName)}.`,
  });

export const buildAssociationPasswordChangedEmail = (
  input: TAssociationEmailBase,
) => buildPasswordChangedAccountEmail(accountOf(input));

export const buildAssociationMemberInvitationEmail = (
  input: TAssociationMemberInvitationEmail,
) => {
  const association = singleLine(input.associationName);
  const member = singleLine(input.memberName);

  return renderEmail({
    brand: input.appName,
    subject: `${association} invited you to join ${input.appName}`,
    heading: `You're invited, ${member}!`,
    blocks: [
      paragraph(`Hi ${member},`),
      paragraph(
        `${association} has invited you to join their team on ${input.appName}, where you'll track your continuing education progress.`,
      ),
      { kind: "cta", label: "Accept the invitation", url: input.invitationUrl },
      paragraph(
        `This invitation link is valid for ${input.expiresInMinutes} minutes and can only be used once.`,
      ),
      paragraph("Questions? Contact ", { mailto: input.supportEmail }, "."),
    ],
  });
};
