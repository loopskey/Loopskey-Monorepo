import { AppLanguage, AssociationMessageType } from "@prisma/client";
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

export type TAssociationEmailBase = {
  appName: string;
  associationName: string;
  supportEmail: string;
};

export type TAssociationActivationEmail = TAssociationEmailBase & {
  activationUrl: string;
  expiresInMinutes: number;
  loginUrl: string;
  username: string;
};

export type TAssociationMemberInvitationEmail = TAssociationEmailBase & {
  memberName: string;
  invitationUrl: string;
  expiresInMinutes: number;
};

export type TAssociationMessageBase = {
  appName: string;
  memberName: string;
  dashboardUrl: string;
  supportEmail: string;
  language: AppLanguage;
  associationName: string;
};

export type TAssociationMessageInput = TAssociationMessageBase &
  (
    | {
        messageType: typeof AssociationMessageType.BEHIND_THRESHOLD;
        percent: number;
        deadline: Date | null;
        requiredCredits: number;
        completedCredits: number;
      }
    | { messageType: typeof AssociationMessageType.WELCOME }
    | {
        messageType: typeof AssociationMessageType.CATEGORY_BEHIND;
        percent: number;
        categoryName: string;
      }
    | {
        messageType: typeof AssociationMessageType.CERTIFICATE_EXPIRING;
        expiresOn: Date | null;
        certificateTitle: string;
      }
  );
