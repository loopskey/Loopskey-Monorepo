import { singleLine } from "@mail/utils/email-layout";
import {
  buildRejectedAccountEmail,
  buildSubmittedAccountEmail,
  buildActivationAccountEmail,
  buildPasswordChangedAccountEmail,
} from "@mail/templates/account-email.template";

import type * as T from "@mail/types/mail-service.types";

const accountOf = ({
  appName,
  supportEmail,
  organizationName,
}: T.TOrganizationEmailBase) => ({
  appName,
  supportEmail,
  entityName: organizationName,
});

export const buildOrganizationSubmittedEmail = (
  input: T.TOrganizationEmailBase,
) => buildSubmittedAccountEmail(accountOf(input));

export const buildOrganizationRejectionEmail = (
  input: T.TOrganizationRejectionEmail,
) => buildRejectedAccountEmail({ ...accountOf(input), reason: input.reason });

export const buildOrganizationApprovalEmail = (
  input: T.TOrganizationApprovalEmail,
) =>
  buildActivationAccountEmail({
    ...accountOf(input),
    loginUrl: input.loginUrl,
    username: input.username,
    activationUrl: input.activationUrl,
    expiresInMinutes: input.expiresInMinutes,
    approvedLine: `Good news — your application for ${singleLine(input.organizationName)} has been approved.`,
  });

export const buildOrganizationPasswordChangedEmail = (
  input: T.TOrganizationEmailBase,
) => buildPasswordChangedAccountEmail(accountOf(input));
