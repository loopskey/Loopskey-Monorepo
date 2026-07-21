import { OtpPurpose } from "@prisma/client";

export type TSendEmailInput = {
  html: string;
  text?: string;
  subject: string;
  to: string | string[];
};

export type TBuildOtpEmailTemplateInput = {
  code: string;
  appName: string;
  purpose: OtpPurpose;
  expiresInMinutes: number;
};

export type TOrganizationEmailBase = {
  appName: string;
  organizationName: string;
  supportEmail: string;
};

export type TOrganizationApprovalEmail = TOrganizationEmailBase & {
  activationUrl: string;
  expiresInMinutes: number;
  loginUrl: string;
  username: string;
};

export type TOrganizationRejectionEmail = TOrganizationEmailBase & {
  reason: string;
};
