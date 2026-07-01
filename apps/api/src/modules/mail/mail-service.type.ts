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
