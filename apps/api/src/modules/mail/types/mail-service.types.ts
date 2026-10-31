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
  supportEmail: string;
  expiresInMinutes: number;
};

export type TOrganizationEmailBase = {
  appName: string;
  supportEmail: string;
  organizationName: string;
};

export type TOrganizationApprovalEmail = TOrganizationEmailBase & {
  loginUrl: string;
  username: string;
  activationUrl: string;
  expiresInMinutes: number;
};

export type TOrganizationRejectionEmail = TOrganizationEmailBase & {
  reason: string;
};

export type TAssociationEmailBase = {
  appName: string;
  supportEmail: string;
  associationName: string;
};

export type TAssociationActivationEmail = TAssociationEmailBase & {
  loginUrl: string;
  username: string;
  activationUrl: string;
  expiresInMinutes: number;
};

export type TAssociationRejectionEmail = TAssociationEmailBase & {
  reason: string;
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
  requirementsUrl?: string;
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

export type TAssociationLifecycleBase = {
  appName: string;
  actionUrl: string;
  memberName: string;
  supportEmail: string;
  language: AppLanguage;
  associationName: string;
};

export type TAssociationLifecycleInput = TAssociationLifecycleBase &
  (
    | {
        messageType: typeof AssociationMessageType.GROUP_ADDED;
        groupTitle: string;
      }
    | {
        messageType: typeof AssociationMessageType.REQUIREMENT_ASSIGNED;
        requirementName: string;
        deadline: Date | null;
      }
    | {
        messageType: typeof AssociationMessageType.LEARNING_CONTENT_ASSIGNED;
        contentTitle: string;
        requirementName: string | null;
      }
  );
